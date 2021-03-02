# Database Document Structure

> 📝 An example of a `bookingsIndex` object that we'll address in this lesson can be found - [here](https://gist.github.com/djirdehh/d5a281a73151d6b25a2c066ab37c63eb).

We'll now look to determine the structure of the documents that are to be stored in the separate database collections.

If we recall, we've discussed how MongoDB (and NoSQL databases in general) don't require us to have a predefined schema for the data we intend to insert in a database. With that said, we'll still want our application to prepare for the kind of data it expects to receive. As a result, the structure we define here is important since it'll help us prepare for the data we expect in our TypeScript code.

## `User`

First, let's define what a user is in our database.

Although MongoDB automatically creates an `_id` field of type `ObjectId` for us when we create a new user, we're going to default to using a `string` type here instead. The reason being, when we use the third-party service, Google OAuth, to authenticate our users; that service will instead return a `string` value to identify a specific user. We'll use that `string` value as the `_id` field for our user documents. We'll get a better understanding of this once we begin at the authentication section of our course.

> We could very well also attempt to convert the string `id` value returned from the third-party service to an `ObjectId` format, but in our case, we'll simply store it as a `string` for the `_id` field.

```ts
export interface User {
  _id: string;
}
```

A user will have a `token` field to store the user's login session token with which will be of type `string`.

```ts
export interface User {
  _id: string;
  token: string;
}
```

A user will have a `name` field which is a reference to the user's human-readable name. This `name` field will also be of type `string`.

```ts
export interface User {
  _id: string;
  token: string;
  name: string;
}
```

A user will have an avatar field to store the user's avatar image. This will be of type `string` since the data of these fields will be image URLs.

```ts
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
}
```

We'll give our user a `contact` field of type `string` which will be used to store the user's email address.

```ts
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
}
```

Next, we'll eventually need an identifying field to store a user's payment details. We'll create a field for this called `walletId`. `walletId` will be of type `string` or be `undefined`. When a user's `walletId` field has a valid `string` value, the user will be able to receive money. If `walletId` is `undefined`, then the user will have yet to have linked their payment information and as a result won't be able to receive money yet.

The `walletId` value will be populated once the user has authenticated with the third-party payment processor we'll eventually use in our app - [Stripe](https://stripe.com/).

```ts
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
}
```

Next, we'll have an `income` field of type `number` which will be used to store the user's total income.

```ts
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
}
```

> We'll get a clearer understanding of how the `walletId` and `income` fields work once we begin the lessons that involve authenticating and using Stripe.

A user document will also have a `bookings` field to store the bookings the user has made. This field will be an array of `ObjectId` values. And each `id` element in this array will refer to a document inside of our `bookings` collection. This type of relationship is a **One-to-Many** relationship. where _one_ user object will hold references to _many_ booking objects.

```ts
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
  bookings: ObjectId[];
}
```

A user document will also have a `listings` field to store the listings a user has created. This field will also be an array of `ObjectId` values and each element in this array will refer to a document inside of our `listings` collection. Another **One-to-Many** relationship.

At this moment, the `User` interface will look as follows:

```ts
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
  bookings: ObjectId[];
  listings: ObjectId[];
}
```

## `Listing`

We'll now define the shape of a listing document in our database within a `Listing` interface. The first thing we need is an `_id` field. This time, unlike the `User` interface, we'll have the `_id` field be of the automatically generated type `ObjectId` type.

```ts
export interface Listing {
  _id: ObjectId;
}
```

Our listings will have `title` and `description` fields, both of type `string`. These fields will be used to store the listing's title and description information.

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
}
```

We'll state that our listings are to have an `image` field of type `string`. These will be used to store the listing's image URL.

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
}
```

Since each listing must have a host (i.e. owner), we'll reference who this host is with a `host` field. This will be used to hold a reference to the host by storing the host user's `_id`. Therefore, the type for this field must be the same as our user's `_id` field - `string`. This is an example of a **One-to-One** relationship, where _one_ listing holds a reference to _one_ host.

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
}
```

Next, we're interested in introducing a `type` field which is to be of one of two values - either an `APARTMENT` or a `HOUSE`. To define a known set of named constants, we'll use a TypeScript [`enum` type](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums). We'll declare the `enum` type above our `Listing` interface and call it `ListingType`.

```ts
export enum ListingType {}

export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
}
```

Enums in TypeScript could have [numeric](https://www.typescriptlang.org/docs/handbook/enums.html#numeric-enums) or [string](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums) values. In our case, we'll want our enum to be a set of constants with `string` values. We'll state an `Apartment` property of `"APARTMENT"` and a `house` property of `"HOUSE"`.

```ts
export enum ListingType {
  Apartment = "APARTMENT",
  House = "HOUSE"
}
```

In our Listing interface, we'll set the type of the `type` field as `ListingType` which is to be one of the two constants we've specified in our `ListingType` enum.

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
}
```

We'll now specify our listings is to have an `address`, `country`, `admin`, and `city` fields - all of which will be of type `string`. These fields will be used to store the listing's geographic information.

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
}
```

> `admin` is analogous to the concept of _states_ or _provinces_. We'll get a better understanding of the location specific fields once we begin to discuss how we intend to geocode locations in our app.

Just like our user documents, our listing documents will also have a `bookings` field to reference any bookings made against itself. Similarly, this field will be an array of `ObjectId` values where each `ObjectId` item is to reference a document in the `bookings` collection.

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  bookings: ObjectId[];
}
```

### `bookingsIndex`

In a `listing` document, we'll create another field that's a little more complex. This field will essentially help handle how we can ensure that when a user books a listing, _another_ user doesn't create a booking where the dates overlap.

In software programming, handling dates is hard. Questions like how do handle different geographic areas with [different timezones](https://stackoverflow.com/questions/53707902/working-with-different-timezones-in-javascript), [daylight savings time](https://stackoverflow.com/questions/11887934/how-to-check-if-the-dst-daylight-saving-time-is-in-effect-and-if-it-is-whats), [leap seconds](https://stackoverflow.com/questions/37973465/how-can-i-handle-a-leap-second-correctly-in-my-application), the ability to [compare times](https://stackoverflow.com/questions/492994/compare-two-dates-with-javascript), etc. all have to be answered. Many different libraries (e.g. [`Moment.js`](https://momentjs.com/)) exist to help with a lot of these use cases.

With that being said though, we're _not_ going to go through a difficult approach to look into how we can best handle how dates are captured when a booking is made to a listing. We'll introduce an **index** that will essentially be nested key-value pairs that captures all the dates that a listing is not available because of a previous booking.

Here's an example. Assume the following dates are booked with the dates listed here in the `YYYY-MM-DD` format.

```ts
// 2019-01-01   year: 2019 | month: 01 | day: 01
// 2019-01-02   year: 2019 | month: 01 | day: 02
// 2019-05-31   year: 2019 | month: 05 | day: 31
```

We'll call the index we'll create to represent these dates that have already been booked `bookingsIndex`, and will look something like this:

```ts
// 2019-01-01   year: 2019 | month: 01 | day: 01
// 2019-01-02   year: 2019 | month: 01 | day: 02
// 2019-05-31   year: 2019 | month: 05 | day: 31

const bookingsIndex = {
  "2019": {
    "00": {
      "01": true,
      "02": true
    },
    "04": {
      "31": true
    }
  }
};

// NOTE: the JavaScript function for getting the month returns 0 for Jan ... and 11 for Dec
```

The bookings index is to be nested key-value pairs where the first key is a reference to the **year** a booking is made.

```ts
const bookingsIndex = {
  "2019": {
    // Bookings made in 2019
  }
};
```

The value provided to the first key is the **months** in which the booking is made.

```ts
const bookingsIndex = {
  "2019": {
    "00": {
      // Bookings made in January 2019
    },
    "04": {
      // Bookings made in May 2019
    }
  }
};
```

The values provided in the nested keys representing the months booked will contain references to the **days** a booking is made.

```ts
const bookingsIndex = {
  "2019": {
    "00": {
      "01": true, // Booking made in January 01, 2019
      "02": true // Booking made in January 02, 2019
    },
    "04": {
      "31": true // Booking made in May 31, 2019
    }
  }
};
```

In the example above, bookings have been made in `2019-01-01`, `2019-01-02`, and `2019-05-31` so we have the values of `bookingsIndex[2019][00][01]`, `bookingsIndex[2019][00][02]`, and `bookingsIndex[2019][04][31]` all return `true` to represent this.

> The [default JavaScript function for getting the month of a date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth) returns `0` for the first month of the year and `11` for the last month of the year. This is reflected in how we prepare the keys for the "month" nested objects in `bookingsIndex`.

Why are we using objects here as the data structure within our index? This is because values in objects (i.e. hash values) can, on average, be accessed in **constant time** which is much computationally cheaper than having arrays where we have to iterate through a series of values to search for a particular element.

With all that said, let's introduce a `bookingsIndex` field in our `Listing` interface and we'll say the type of bookingsIndex is to be an interface called `BookingsIndex`.

```ts
export interface BookingsIndex {}

export interface Listing {
  // ...,
  bookingsIndex: BookingsIndex;
}
```

`BookingsIndex` will be an interface that is to contain objects that represent the **year** a booking is made. key-value pairs in TypeScript can be defined as an **index signature**, where the key is to be a string and the value is to be _another_ interface. For `BookingsIndex`, the nested value in the index signature will be another interface we'll call `BookingsIndexYear`.

```ts
interface BookingsIndexYear {}

export interface BookingsIndex {
  [key: string]: BookingsIndexYear;
}

export interface Listing {
  // ...,
  bookingsIndex: BookingsIndex;
}
```

The `BookingsIndexYear` interface will also be an object of key-value pairs but the value is to be an object that represents the _months_ a booking is made. As a result, this will be another index signature where the value is to have the shape of _another_ interface we'll call `BookingsIndexMonth`.

```ts
interface BookingsIndexMonth {}

interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth;
}

export interface BookingsIndex {
  [key: string]: BookingsIndexYear;
}

export interface Listing {
  // ...,
  bookingsIndex: BookingsIndex;
}
```

`BookingIndexMonth` will also be an object of key-value pairs but the value, in this case, is to be a _boolean_. The _boolean_ values will indicate which **days** in the month have been booked.

Here's a representation of the nested object structure of the `bookingsIndex` field. It is to be an object of objects that is to then have `boolean` values.

```ts
interface BookingsIndexMonth {
  [key: string]: boolean;
}

interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth;
}

export interface BookingsIndex {
  [key: string]: BookingsIndexYear;
}

export interface Listing {
  // ...,
  bookingsIndex: BookingsIndex;
}
```

We'll now also state our listing documents are to have a `price` field of type `number` that is to represent the price of the listing per day as set by the host.

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  bookings: ObjectId[];
  bookingsIndex: BookingsIndex;
  price: number;
}
```

Finally, our listing documents will also have a `numOfGuests` field which is to be a `number` and represents the maximum number of guests a listing can have.

Our `Listing` interface in it's entirety will look like the following:

```ts
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  bookings: ObjectId[];
  bookingsIndex: BookingsIndex;
  price: number;
}
```

## `Booking`

Next, we'll define what a booking is in our database and we'll do this in an interface called `Booking`. The first thing this interface is to have is an `_id` field and we will state that it is to be of the automatically generated `ObjectId` type.

```ts
export interface Booking {
  _id: ObjectId;
}
```

We'll want each booking to have a reference to _which_ listing it refers to (i.e. which listing has been booked). With that said, the `Booking` interface will have a `listing` field of type `ObjectId`. This is another example of a **One-to-One** relationship.

```ts
export interface Booking {
  _id: ObjectId;
  listing: ObjectId;
}
```

We'll also want each booking to have a reference to the tenant who's making the booking. We'll want this `tenant` field to represent the `_id` of the user who's made the booking as another **One-to-One** relationship. Since the `_id` field of a user document is to be of type `string`, we'll state that the `tenant` field is to be of type `string` as well.

```ts
export interface Booking {
  _id: ObjectId;
  listing: ObjectId;
  tenant: string;
}
```

Finally, we'll have our booking documents contain `checkIn` and `checkOut` fields which will be of type `string` and is to store the booking's date information (i.e. the dates the tenant attempts to check-in and check-out of the booking).

In the completed state, the `Booking` interface will look as follows:

```ts
export interface Booking {
  _id: ObjectId;
  listing: ObjectId;
  tenant: string;
  checkIn: string;
  checkOut: string;
}
```

And that's it! This is almost all the details we'll have for the different documents in our database collections. With that said, we're going to explain in detail how each of the fields specified in our documents is to be created and used in our app when we start to build the different sections and portions of our app.

Oftentimes when an app is being built for the first time within a NoSQL setting, you might find yourself navigating back to where you specify the types of your data structure and change it from time to time. In our case, we've attempted to establish the collection and document structure in the beginning so we won't have to come back and make a lot of changes as we move forward.
