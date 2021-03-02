import { IResolvers } from 'apollo-server-express'
import { Request } from 'express'
import { ObjectId } from 'mongodb'
import { Cloudinary, Google } from '../../lib/api'
import { Database, Listing, User, ListingType } from '../../lib/types'
import { authorize } from '../../lib/utils'
import { 
  ListingArgs, ListingBookingsArgs, ListingBookingsData, 
  ListingsArgs, ListingsData, ListingsFilter, ListingsQuery,
  HostListingsArgs, HostListingsInput
} from './Listing.types'

const verifyHostListingInput = ({ title, description, type, price }: HostListingsInput) => {
  if (title.length > 100) {
    const tooMuch = title.length - 100
    throw new Error(`Title can hold max. 100 charaters, please shorten by ${tooMuch}!`)
  }
  if (description.length > 5000) {
    const tooMuch = title.length - 5000
    throw new Error(`Description can hold max. 5000 charaters, please shorten by ${tooMuch}!`)
  }
  if (type !== ListingType.Apartment && type !== ListingType.House ) {
    throw new Error(`Type neither ${ListingType.Apartment} nor ${ListingType.House}.`)
  }
  if (price <= 0) {
    throw new Error('Price must be greater than 0.')
  }  

}

export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined, 
      { id }: ListingArgs, 
      { db, req }: { db: Database, req: Request }
    ): Promise<Listing> => {
      try{
        const listing = 
          await db.listings.findOne({ _id: new ObjectId(id) })

        if (!listing) {
          throw new Error('listing not found.')
        }

        const viewer = await authorize(db, req)
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true
        }

        return listing

      } catch (error) {
        throw new Error('Failed to query listing: ' + error)
      }
    },
 
    listings: async ( 
      _root: undefined,
      { location, filter, limit, page }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<ListingsData> => {
      try {
        
        const data: ListingsData = {
            region: null,
            total: 0,
            result: []
        }

        const query: ListingsQuery = {}

        if (location) {
          const res = await Google.geocode(location)

          const { country, admin, city } = res
          if (city) query.city = city 
          if (admin) query.admin = admin
          if (country) {
            query.country = country
          } else {
            throw new Error('No country found by geocoding')
          }
          const cityText = city ? `${city}, ` : ''
          const adminText = admin ? `${admin}, ` : ''
          data.region = `${cityText}${adminText}${country}`
        } else {
          data.region = "all over the world"
        }

        
        
        let cursor = await db.listings.find(query)

        if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
          cursor.sort({ price: 1}) // ascending
        }

        if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
          cursor.sort({ price: -1 }) // descending
        }

        cursor = cursor.skip(page>0 ? (page-1)*limit : 0)
        cursor = cursor.limit(limit)

        data.total = await cursor.count()
        data.result = await cursor.toArray()

        return data

    } catch (error) {
        throw new Error('Failed to query user listings: ' + error)
    }
    },

  }, 
  Mutation: {
    hostListing: async (
      _root: undefined,
      { input }: HostListingsArgs,
      { db, req }: { db: Database, req: Request }
    ): Promise<Listing> => {

      verifyHostListingInput(input)

      const viewer = await authorize(db, req)
      if (!viewer) {
        throw new Error('viewer cannot be found')
      }

      const { country, admin, city } = await Google.geocode(input.address)
      if (!country || !admin || !city) {
        throw new Error("invalid address input")
      }

      const imageUrl = await Cloudinary.upload(input.image)

      const insertResult = await db.listings.insertOne({
        _id: new ObjectId(),
        ...input, country, admin, city,
        bookings: [],
        bookingsIndex: {},
        host: viewer._id,
        image: imageUrl,
        authorized: true
      })

      const insertedListing: Listing = insertResult.ops[0]

      await db.users.updateOne(
        { _id: viewer._id },
        { $push: { listings: insertedListing._id } }
      )

      return insertedListing
    }
  }, 
  Listing: {
    id: (listing: Listing): string => listing._id.toString(),
    host: async (
      listing: Listing,
      _args: undefined,
      { db }: { db :Database }
    ): Promise<User> => {
      try {
        const host = await db.users.findOne({ _id: listing.host})
        if (!host) {
          throw new Error ('user nor found.')
        }

        return host

      } catch (error) {
          throw new Error('Failed to query user: ' + error)
      }
    },

    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex)
    },

    bookings: async (
      listing: Listing, 
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!listing.authorized){
          return null
        }
        const data: ListingBookingsData = {
          total: 0,
          result: []
        }
        let cursor = await db.bookings.find({
            _id: { $in: listing.bookings }
        })
        cursor = cursor.skip(page>0 ? (page-1)*limit : 0)
        cursor = cursor.limit(limit)

        data.total = await cursor.count()
        data.result = await cursor.toArray()

        return data

      } catch (error) {
        throw new Error('Failed to query listing bookings: ' + error)
      }
    },
  }
}