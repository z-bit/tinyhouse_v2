import { google } from 'googleapis'
import { createClient, AddressComponent, AddressType } from '@google/maps'

const key: string = process.env.G_GEOCODE_KEY || ''
const maps = createClient({ key, Promise})
const parseAddress = (
  addressComponents: AddressComponent<AddressType>[]
) => {
  let country = null
  let admin = null 
  let city = null
  for (const component of addressComponents) {
    if (component.types.includes('country')) {
      country = component.long_name
    }
    if (component.types.includes("administrative_area_level_1")) {
      admin = component.long_name
    }
    if (component.types.includes("locality") 
    ||  component.types.includes("postal_town")) {
      city = component.long_name
    }
  }

  return { country, admin, city }
}


const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  process.env.PUBLIC_URL + '/login'
)
export const Google = {
    authUrl: auth.generateAuthUrl({
        access_type: 'online',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ]
    }),
    logIn: async (code: string) => {
        const { tokens } = await auth.getToken(code)
        // tokens (access token and refresh token)
        // here used only for login no need to save them
        // If needed later to access user's gmail or calendar
        // you need to save them (into db). 

        auth.setCredentials(tokens)

        const { data } = await google
            .people({ version: 'v1', auth })
            .people.get({
                resourceName: 'people/me',
                personFields: 'emailAddresses,names,photos'
            })
        ;

        return { user: data }
    },
    geocode: async (address: string) => {

      const res = await maps.geocode({ address }).asPromise()

      if (res.status < 200 || res.status > 299) {
        throw new Error('failed to gecode address')
      }

      return parseAddress(res.json.results[0].address_components)
    } 
}