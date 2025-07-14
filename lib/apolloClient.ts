import { ApolloClient, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  uri: '/api/gql',
  cache: new InMemoryCache(),
})


export default client
