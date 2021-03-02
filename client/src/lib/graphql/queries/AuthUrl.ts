import { gql } from 'apollo-boost'

export const AUTH_URL = gql`
    query AuthUrl {
        authUrl
    }
`
export * from './--loacalSchemaFile=schema.json/AuthUrl'