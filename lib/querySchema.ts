import { gql } from "graphql-tag"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { env } from "@/lib/env"
import { Client } from "@elastic/elasticsearch"

const elasticsearchClient = new Client({
  node: "https://lawpath-test-cluster-aba117.es.ap-southeast-1.aws.elastic.cloud:443",
  auth: {
    apiKey: env.elasticsearchApiKey || "",
  },
})

const ELASTICSEARCH_INDEX = "aashish-index"

const typeDefs = gql`
  type Query {
    searchLocations(query: String!, categories: [String!]): [Location!]!
    getLogs(limit: Int, offset: Int, type: String): [LogEntry!]!
  }

  type Mutation {
    validateAddress(postcode: String!, suburb: String!, state: String!): String!
    logActivity(input: LogInput!): LogResult!
  }

  type Location {
    location: String!
    postcode: String!
    state: String!
    category: String
    latitude: Float
    longitude: Float
    id: Int
  }

  type LogEntry {
    id: String!
    type: String!
    input: String!
    output: String!
    success: Boolean!
    timestamp: String!
    sessionId: String
    userId: String
  }

  type LogResult {
    id: String!
    success: Boolean!
  }

  input LogInput {
    type: String!
    input: String!
    output: String!
    success: Boolean!
    sessionId: String
    userId: String
  }
`

const storeLogInElasticsearch = async (logEntry: any) => {
  try {
    const response = await elasticsearchClient.index({
      index: ELASTICSEARCH_INDEX,
      body: {
        ...logEntry,
        "@timestamp": new Date().toISOString(),
      },
    })
    return response._id
  } catch (error) {
    console.error("Failed to store log in Elasticsearch:", error)
    throw error
  }
}

const getLogsFromElasticsearch = async (limit = 50, offset = 0, type?: string) => {
  try {
    let query: any = {
      match_all: {},
    }

    if (type) {
      query = {
        match: {
          type: type,
        },
      }
    }

    const response = await elasticsearchClient.search({
      index: ELASTICSEARCH_INDEX,
      body: {
        query,
        sort: [
          {
            "@timestamp": {
              order: "desc",
            },
          },
        ],
        from: offset,
        size: limit,
      },
    })

    return response.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }))
  } catch (error) {
    console.error("Failed to retrieve logs from Elasticsearch:", error)
    return []
  }
}

export const resolvers = {
  Query: {
    searchLocations: async (_: unknown, { query, categories }: { query: string; categories?: string[] }) => {
      try {
        const url = `https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json?q=${encodeURIComponent(query)}`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${env.authToken}`,
          },
        })

        if (!response.ok) {
          console.log(response)
          throw new Error("Failed to fetch data from Australia API.")
        }

        const text = await response.text()
        const data = text.trim() === "" ? { localities: { locality: [] } } : JSON.parse(text)

        let localities = data?.localities?.locality || []

        if (localities && !Array.isArray(localities)) {
          localities = [localities]
        }

        const results = localities.map((loc: any) => ({
          location: loc.location,
          postcode: loc.postcode.toString(),
          state: loc.state,
          category: loc.category || "Delivery Area",
          latitude: loc.latitude || null,
          longitude: loc.longitude || null,
          id: loc.id || null,
        }))

        if (categories && categories.length > 0) {
          return results.filter((loc: any) => categories.includes(loc.category))
        }

        return results
      } catch (error: any) {
        console.error("Search error:", error)
        return []
      }
    },

    getLogs: async (
      _: unknown,
      { limit = 50, offset = 0, type }: { limit?: number; offset?: number; type?: string },
    ) => {
      return await getLogsFromElasticsearch(limit, offset, type)
    },
  },

  Mutation: {
    validateAddress: async (
      _: unknown,
      { postcode, suburb, state }: { postcode: string; suburb: string; state: string },
    ): Promise<string> => {
      try {
        const url = `https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json?q=${encodeURIComponent(
          suburb,
        )}&state=${encodeURIComponent(state)}`

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${env.authToken}`,
          },
        })

        if (!response.ok) {
          const error = await response.json()

          if (error.error) {
            return error.error
          }

          throw new Error(error.error)
        }

        const text = await response.text()
        const data = text.trim() === "" ? { localities: { locality: [] } } : JSON.parse(text)

        let localities = data?.localities?.locality

        if (localities && !Array.isArray(localities)) {
          localities = [localities]
        }

        if (!localities || localities.length === 0) {
          return `The suburb ${suburb} does not exist in the state ${state}.`
        }

        const inputSuburb = suburb.trim().toUpperCase()
        const inputPostcode = postcode.trim()

        const matchingLocalities = localities.filter(
          (loc: any) => loc.location.toUpperCase() === inputSuburb && loc.state.toUpperCase() === state.toUpperCase(),
        )

        if (!matchingLocalities || matchingLocalities.length === 0) {
          return `The suburb ${suburb} does not exist in the state ${state}.`
        }
        const matchingLocality = matchingLocalities.find(
          (loc: any) =>
            loc.location.toUpperCase() === inputSuburb &&
            loc.state.toUpperCase() === state.toUpperCase() &&
            loc.postcode.toString() === inputPostcode,
        )

        if (!matchingLocality) {
          return `The postcode ${postcode} does not match the suburb ${suburb}.`
        }

        return "The postcode, suburb, and state input are valid."
      } catch (error: any) {
        return `Error during address validation: ${error.message}`
      }
    },

    logActivity: async (_: unknown, { input }: { input: any }) => {
      try {
        const logEntry = {
          type: input.type,
          input: input.input,
          output: input.output,
          success: input.success,
          timestamp: new Date().toISOString(),
          sessionId: input.sessionId,
          userId: input.userId,
        }

        const id = await storeLogInElasticsearch(logEntry)

        return {
          id: id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          success: true,
        }
      } catch (error) {
        console.error("Failed to log activity:", error)
        return {
          id: "",
          success: false,
        }
      }
    },
  },
}

export const querySchema = makeExecutableSchema({ typeDefs, resolvers })
