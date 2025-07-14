import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { querySchema } from '@/lib/querySchema'

const server = new ApolloServer({
  schema: querySchema,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = startServerAndCreateNextHandler(server)

export async function GET(
  request: Request,
): Promise<Response> {
  return handler(request)
}

export async function POST(
  request: Request,
): Promise<Response> {
  return handler(request)
}

export const OPTIONS = () =>
  new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
