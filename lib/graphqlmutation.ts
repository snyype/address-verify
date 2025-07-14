import { gql } from "@apollo/client"

export const VALIDATE_ADDRESS = gql`
  mutation ValidateAddress(
    $postcode: String!
    $suburb: String!
    $state: String!
  ) {
    validateAddress(postcode: $postcode, suburb: $suburb, state: $state)
  }
`

export const SEARCH_LOCATIONS = gql`
  query SearchLocations(
    $query: String!
    $categories: [String!]
  ) {
    searchLocations(query: $query, categories: $categories) {
      location
      postcode
      state
      category
    }
  }
`

export const LOG_ACTIVITY = gql`
  mutation LogActivity($input: LogInput!) {
    logActivity(input: $input) {
      id
      success
    }
  }
`

export const GET_LOGS = gql`
  query GetLogs($limit: Int, $offset: Int, $type: String) {
    getLogs(limit: $limit, offset: $offset, type: $type) {
      id
      type
      input
      output
      success
      timestamp
      sessionId
      userId
    }
  }
`
