import { MongoClient } from 'mongodb'
import { Database, Booking, Listing, User } from '../lib/types'

const user = process.env.DB_USER
const pass = process.env.DB_PASSWORD
const dbname = process.env.DB_NAME

const url = `mongodb+srv://${user}:${pass}@cluster0.yhwoc.mongodb.net/${dbname}?retryWrites=true&w=majority`

export const connectDatabase = async (): Promise<Database> => {
    const client = await MongoClient.connect(url, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true
    })
    const db = client.db(dbname)
    return {
        bookings: db.collection<Booking>('bookings'),
        listings: db.collection<Listing>('listings'),
        users: db.collection<User>('users'),
    }
}