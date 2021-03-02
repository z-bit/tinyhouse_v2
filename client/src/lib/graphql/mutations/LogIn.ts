import { gql } from 'apollo-boost'

export const LOG_IN = gql`
    mutation LogIn($input: LogInInput) {
        logIn(input: $input) {
            id
            token
            avatar
            hasWallet
            didRequest
        }
    }
`
export * from './--loacalSchemaFile=schema.json/LogIn'