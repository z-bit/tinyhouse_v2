require('dotenv').config()
import * as readline from 'readline'
import { connectDatabase } from '../../database'

const clear = async () => {
    console.log('[clear] running ....')

    const db = await connectDatabase()

    const bookings = await db.bookings.find({}).toArray()
    if (bookings.length > 0) {
        await db.bookings.drop()
    }

    const listings = await db.listings.find({}).toArray()
    if (listings.length > 0) {
        await db.listings.drop()
    }
    
    const users = await db.users.find({}).toArray()
    if (users.length > 0) {
        await db.users.drop()
    }

    console.log('[clear] ... finished')
    process.exit()
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
rl.question('[clear] Delete all your data? [y/n] ', (answer) => {
    if (answer === 'y') {
        clear()
    } else {
        console.log('[clear] No data touched!')
        process.exit()
    }
})
