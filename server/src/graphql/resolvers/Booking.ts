import { IResolvers } from 'apollo-server-express'
import { Request } from 'express'
import { ObjectID }from 'mongodb'
import { Stripe } from '../../lib/api'
import { Database, Booking, Listing, BookingsIndex } from '../../lib/types'
import { authorize } from '../../lib/utils'

export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async(
      _root: undefined, 
      { input }: CreateBookingArgs,
      { db, req }: { db: Database, req: Request }
    ): Promise<Booking> => {
      try {
        const { listingId, source, checkIn, checkOut } = input

        // verify loggin user (viewer) is making the request
        let viewer = await authorize(db, req)
        if (!viewer) throw new Error('Viewer could not be found.')

        // find the listing that is being booked
        const listing = await db.listings.findOne({ _id: new ObjectID(listingId) })
        if (!listing) throw new Error('Listing could not be found.')

        // check that viwer is NOT booking their own listing
        if (listing.host === viewer._id) throw new Error('Viewer cannot book own listing.')

        // checkIn bofore checkOut
        const cIn = new Date(checkIn)
        const cOut = new Date(checkOut)
        if (cIn >= cOut) throw new Error('Check out must be after check in.')

        // create new bookingsIndex (time occupied) for lisitng being booked
        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex, checkIn, checkOut
        )

        // get total price to charge
        const days = (cOut.getTime() - cIn.getTime()) / 1000 / 60 / 60 / 24
        const totalPrice = Math.round(listing.price * days)  

        // get user document of host of listing
        const host = await db.users.findOne({ _id: listing.host })
        if (!host) throw new Error('Host cannot be found!')
        if (!host.walletId) throw new Error('Host not connected with Stripe.')

        // create Stripe charge on behalf of the host
        await Stripe.charge(totalPrice, source, host.walletId)  

        // inset new booking document into bookings collection
        const insertRes = await db.bookings.insertOne({
          _id: new ObjectID(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut
        })  
        const insertedBooking: Booking = insertRes.ops[0]
        
        // update user document of host to increment income
        await db.users.updateOne(
          { _id: host._id },
          { $inc: { income: totalPrice } }
        )

        // update bookings field of the tenant (rentee)
        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: insertedBooking._id }}
        )

        // update bookings field of listing document
        await db.listings.updateOne(
          { _id: listing._id },
          {
            $set: { bookingsIndex },
            $push: { bookings: insertedBooking._id }
          }
        )

        // return newly inserted booking
        return insertedBooking

      } catch (error) {
        throw new Error(`Failed to create new booking: ${error}`)
      }
    }
  },
  Booking: {
      id: (booking: Booking): string => booking._id.toString(),
      listing: (
          booking: Booking, 
          _args: unknown, 
          { db }: { db: Database }
      ): Promise<Listing | null> => {
          return db.listings.findOne({ _id: booking.listing })
      },
      tenant: (booking: Booking, _args: undefined, { db }: { db: Database }) => {
        return db.users.findOne({ _id: booking.tenant })
      }
  }
}

// functions
const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkinDate: string,
  checkouDate: string
): BookingsIndex => {
  const dateCursor = new Date(checkinDate)
  const checkout = new Date(checkouDate)
  const newBookingsIndex = { ...bookingsIndex } 

  while (dateCursor < checkout) {
    const y = dateCursor.getUTCFullYear() // yyyy
    const m = dateCursor.getUTCMonth()    // 0 .. 11
    const d = dateCursor.getUTCDate()     // 1 .. 31

    if (!newBookingsIndex[y]) newBookingsIndex[y] = {}
    if (!newBookingsIndex[y][m]) newBookingsIndex[y][m] = {}
    if (!newBookingsIndex[y][m][d]) { 
      newBookingsIndex[y][m][d] = true
    } else {
      const date = `${dateCursor.getDate()}/${dateCursor.getMonth() + 1}/${dateCursor.getFullYear()}`
      throw new Error(`Listing already booked for ${date}!`)
    }  
    dateCursor.setDate(dateCursor.getDate() + 1)
  }

  return newBookingsIndex
}

// types
interface CreateBookingInput {
  listingId: string
  source: string
  checkIn: string
  checkOut: string
}

interface CreateBookingArgs {
  input: CreateBookingInput
}
