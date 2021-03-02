# Building the CreateBooking Resolver

> 📝 Documentation on creating direct charges for standard accounts in Stripe Connect can be found - [here](https://stripe.com/docs/connect/direct-charges).<br />
> 📝 API documentation on creating Stripe charges can be found - [here](https://stripe.com/docs/api/charges/create).

Before we begin to implement the `createBooking()` mutation resolver, we'll first create the utility function that will facilitate a Stripe charge. We'll need to have this capability to allow the person who's making the booking (i.e. the tenant) to pay the owner of the listing (i.e. the host) a set fee before we can say the booking is finalized.

We already have a Stripe instance established in the `src/lib/api/Stripe.ts` file where we've instantiated a Stripe client and a `connect()` function where a user can connect their Stripe account with our Stripe TinyHouse Connect Platform. We'll create another asynchronous function within this Stripe instance labeled `charge()`.

```ts
export const Stripe = {
  connect: async (code: string) => {
    // ...
  },
  charge: async () => {}
};
```

The term "charge" constitutes having a user make a payment. In more formal terms, a charge constitutes a demand for money that is owed. Though many different types of charges can be created, we'll create a simple [**direct charge**](https://stripe.com/docs/connect/direct-charges) which is recommended for Standard Accounts which are the account types that are connected within our Stripe Connect platform. In this context, the connected account (not our TinyHouse platform account) will be the ones responsible for Stripe fees, refunds, and chargebacks.

From taking a look at the [Node.js Charges API example](https://stripe.com/docs/connect/direct-charges) in the Stripe documentation on creating direct charges, we can create a direct charge with the `create()` function available from the `charges` object within a `stripe` client.

```js
// Node.js example of creating direct charge from Stripe documentation
// https://stripe.com/docs/connect/direct-charges
const stripe = require("stripe")("sk_test_#######");

stripe.charges
  .create(
    {
      amount: 1000,
      currency: "cad",
      source: "tok_visa"
    },
    {
      stripe_account: "{{CONNECTED_STRIPE_ACCOUNT_ID}}"
    }
  )
  .then(function(charge) {
    // asynchronously called
  });
```

The first argument in the `create()` function is a data object that is to contain information about the Stripe charge. There are many different fields we can specify here with some being required.

- The first required value is the **`amount`** which is the amount the connected user is going to be receiving from the charge, or in other words, the amount that we're going to charge the person making the payment.
- The second option value we'll provide is the **`currency`** which is another required data option. This is to be a three-letter ISO code to represent the currency. For our application, we'll charge everyone with `"USD"`. Note that the amount being charged refers to the smallest unit of the currency so, with US dollars, the amount specified in the charge will be in **cents**.
- The third option value we'll provide is the **`source`** which is an optional data option but useful since it represents the source being charged (e.g. ID of a Credit Card, Debit Card, Bank information, etc). In our case, the value for this `source` will be passed in from the client.
- The last option value we'll provide though optional will be important for us. This is the **`application_fee_amount`** which is a fee in cents that is to be applied as a charge and collected as the Stripe account owner. Which is us!

> **Note**: To see more option arguments that can be specified and passed in for a direct charge, be sure to check out the **Create a charge** section of the API documentation - [here](https://stripe.com/docs/api/charges/create).

How would we go about determining which Stripe connected account is going to receive the payment? That will be the value we introduce in the second header options object for the field of `stripe_account` of the `charge()` function. This is where we'll provide the `stripe_user_id` we've collected when the user connected with their Stripe account and we've stored as the `walletId` field of a user document.

This is how we'll have the person making the payment pay the owner of the listing. The person who's making the payment (i.e. the tenant) **doesn't need to have a Stripe account**. They just need to provide their payment information. In our application, that will be their credit card or debit card details. Once the charge is made, Stripe will charge their payment information and direct the payment to the connected account who owns the listing. We (the middleman) are to receive a small fee for using the platform that will be charged to the connected account.

### `charge()`

Let's now visit the `Stripe` instance we have in our application and attempt to create the charge functionality.

The `charge()` function, within the `Stripe` instance, will accept a few arguments from the `createBooking()` mutation resolver. It will accept an `amount` of type `number`, a `source` of type `string` which will come from our React client, and a `stripeAccount` of type `string` which is to be the value of the `walletId` field for a `user` document.

```ts
export const Stripe = {
  connect: async (code: string) => {
    // ...
  },
  charge: async (amount: number, source: string, stripeAccount: string) => {};
};
```

In the `charge()` function, we'll call the `create()` function within the `Charges` class of our Stripe client. For the data object, we'll pass the `amount` along. For the `currency`, we'll state `"usd"` since we want to charge everyone in US dollars. We'll also pass the `source` along as well.

```ts
export const Stripe = {
  connect: async (code: string) => {
    // ...
  },
  charge: async (amount: number, source: string, stripeAccount: string) => {
    const res = await client.charges.create({
      amount,
      currency: "usd",
      source
    });
  }
};
```

The `application_fee_amount` is the amount we want to charge the connected user to pay us, TinyHouse, for using the app. We can say anything here but we intend on charging 5% of whatever payment the host is to obtain. Though not very necessary, we'll say it'll be approximately 5% and we'll use the [`Math.round()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round) function to round the amount to the nearest integer.

```ts
export const Stripe = {
  connect: async (code: string) => {
    // ...
  },
  charge: async (amount: number, source: string, stripeAccount: string) => {
    const res = await client.charges.create({
      amount,
      currency: "usd",
      source,
      application_fee_amount: Math.round(amount * 0.05)
    });
  }
};
```

In the options object to be passed in the second argument of the `create()` function, we'll specify the `stripe_account` and pass the `StripeAccount` value that will be passed in to this function as an argument.

```ts
export const Stripe = {
  connect: async (code: string) => {
    // ...
  },
  charge: async (amount: number, source: string, stripeAccount: string) => {
    const res = await client.charges.create(
      {
        amount,
        currency: "usd",
        source,
        application_fee_amount: Math.round(amount * 0.05)
      },
      {
        stripe_account: stripeAccount
      }
    );
  }
};
```

From the response, we'll be able to look at the `status` field. The `status` of the payment will have one of three values - `"succeeded"`, `"pending"`, or `"failed"`. Since we are to await for the completion of this asynchronous charge function, the status at this point should either be `succeeded` or `failed`. We'll simply do a check and say if the status of the charge response is not `"succeeded"`, we'll throw an error that says `"failed to create charge with Stripe"`. We'll also disable the `@typescript-eslint/camelcase` rule around our Stripe client `charge()` function.

```ts
export const Stripe = {
  // ...
  charge: async (amount: number, source: string, stripeAccount: string) => {
    /* eslint-disable @typescript-eslint/camelcase */
    const res = await client.charges.create(
      {
        amount,
        currency: "usd",
        source,
        application_fee_amount: Math.round(amount * 0.05)
      },
      {
        stripe_account: stripeAccount
      }
    );
    /* eslint-enable @typescript-eslint/camelcase */

    if (res.status !== "succeeded") {
      throw new Error("failed to create charge with Stripe");
    }
  }
};
```

### `createBooking`

With our Stripe charge capability established, let's begin to work on the `createBooking` mutation. We'll first need to update the GraphQL type definitions for our `createBooking` mutation.

Just like our other mutations, we'll have the `createBooking` mutation expect an input of an object where its type will be labeled as `CreateBookingInput`. When the `createBooking` mutation is to resolve successfully, though we may not necessarily need this resolved information in the client, we'll follow the pattern we have and have the mutation return the primary entity that's been mutated or created which in this case is a `Booking` object itself.

```ts
  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
    connectStripe(input: ConnectStripeInput!): Viewer!
    disconnectStripe: Viewer!
    hostListing(input: HostListingInput!): Listing!
    createBooking(input: CreateBookingInput!): Booking!
  }
```

We'll create the `CreateBookingInput` object type. There are four required fields we'll want the client to pass in the input when the `createBooking` mutation is triggered.

- We'll want to have the `id` of the listing that is being booked which will be of type GraphQL `ID`.
- We'll want a `source` which is what the Stripe React component in our client will pass for us to describe the payment source being charged (e.g. the ID of a credit or debit card).
- We'll also want the `checkIn` and `checkOut` dates of the booking. When dates get passed from our client to our server, we simply are to have them passed in as strings.

```ts
  input CreateBookingInput {
    id: ID!
    source: String!
    checkIn: String!
    checkOut: String!
  }
```

Notice that we're not passing in the amount that's going to be charged to the user? The reason being is we determine the amount we'll charge from the `checkIn` and `checkOut` date values. By recognizing which listing is being booked (from the `id` passed in), we'll gather details of that listing such as the price per day. To get the total amount, we'll simply multiply the number of days the user is booking with that price. We'll see this shortly when we build out the `createBooking()` resolver function.

### `createBooking()`

We'll now create the TypeScript interface type for the input argument of the `createBooking` mutation. We have a `bookingResolvers` map we've set up before in the `src/graphql/resolvers/Booking/index.ts` file. We'll create a `types.ts` file adjacent to this `index.ts` file that is to contain the TypeScript types that pertain to the `bookingResolvers` map.

```shell
server/
  src/
    // ...
    graphql/
      resolvers/
        Bookings/
          // ...
          types.ts
        // ...
      // ...
    // ...
  // ...
```

In the newly created `types.ts` file, we'll export an interface called `CreateBookingArgs` that will have an `input` field of type `CreateBookingInput`. We'll create the `CreateBookingInput` interface that is to have the `id`, `source`, `checkIn` and `checkOut` fields, all of type `string`. Remember that the `id` field in our GraphQL API is of type `GraphQLID` but it gets serialized as a string in our TypeScript code.

```ts
export interface CreateBookingInput {
  id: string;
  source: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateBookingArgs {
  input: CreateBookingInput;
}
```

In our `bookingResolvers` map file, we'll import the `CreateBookingArgs` interface from the adjacent `types.ts` file.

```ts
// ...
import { CreateBookingArgs } from "./types";
```

In our `createBooking()` resolver function, we'll specify the `input` argument that is expected to be passed in. We'll also state that when the `createBooking()` function is resolved, it should return a promise of the `Booking` object type. In the `createBooking()` function, we'll also need access to the `db` and `req` objects from context so we'll destruct them as well. We'll import the `Request` interface from the express library to describe the shape of the `req` object. In the function, we'll set up a `try...catch` statement and in the `try` statement will destruct all the fields from the input object - `id`, `source`, `checkIn`, and `checkOut`.

```ts
// ...
import { Request } from "express";
// ...
```

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;
  } catch {}
};
```

#### `authorize()`

The first thing we'll want to do in the `createBooking()` function is verify that a logged-in user (i.e viewer) is making the request. We have an `authorize()` function established for this which checks to see if a user can be found based on the request details. We'll import this `authorize()` function from the `src/lib/utils/` folder. In the `createBooking()` function, we'll run the `authorize()` function and pass the `db` and `req` objects along. If the `viewer` from the `authorize()` function can't be found, we'll throw an error that says `"viewer cannot be found"`.

```ts
import { authorize } from "../../../lib/utils";
```

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }
  } catch {}
};
```

#### Find listing document

To find the appropriate listing document that is being booked, we'll use MongoDB's [`findOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.findOne/) method to find the listing document where the `_id` field value is the same as that from the `id` field from the input argument. We'll wrap the `id` from the input with the Node Mongo Driver `ObjectId` class to have it in the format of a MongoDB document ObjectID.

We'll then check to see if the `listing` document that is being found exists. If not, we'll throw an error that says `"listing can't be found"`.

```ts
import { ObjectId } from "mongodb";
```

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }
  } catch {}
};
```

#### Check if viewer is host

We'll now place a check to see if `listing.host` is the same as `viewer.id`. In other words, is the viewer booking a listing of their own? If this is true, we'll throw an error that says `"viewer can't book own listing"`.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }
  } catch {}
};
```

#### Check if check-out date is before check-in

We'll then look to see the dates the user has booked and see if we can determine if the viewer has somehow booked a `checkIn` date that is _after_ `checkOut`. To help make this simple date comparison, we won't need to install and use a robust date library (like [moment.js](http://momentjs.com/)). Instead, we'll use the [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) constructor function available in JavaScript to simply convert the `checkIn` and `checkOut` string values to their date representation.

We'll then say if `checkOutDate` is before (i.e. less than) the `checkInDate`, we'll throw an error that says `"check out date can't be before check in date"`.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }
  } catch {}
};
```

#### Update `bookingsIndex`

At this point in the function, we'll attempt to try to update the `bookingsIndex` object of the listing document with the new dates that the viewer has picked. This will take a bit of work to do so we'll consolidate this functionality to a function we'll call `resolveBookingsIndex()` which will receive the `bookingsIndex` of the listing document, the `checkIn` date, and the `checkOut` date.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);
  } catch {}
};
```

We'll create the `resolveBookingsIndex()` function in a second. For now, let's look to populate the rest of the `createBooking()` mutation function.

#### Get total price of booking

With the new `bookingsIndex` to be prepared at this point, we'll look to gather the total price of what the tenant will pay. To determine the total price, we'll simply want to multiply the price of a listing document (which refers to the price per day) with the number of days the booking is made.

We don't have a library like [moment.js](http://momentjs.com/) to help us here and though we could install it, we'll avoid doing so since we don't have a lot of work that deal with dates on the server. We'll do our own somewhat rough implementation that should work for the vast majority of use cases.

We know that the total price will be equal to the listing price multiplied by the difference between the check-out and check-in dates. To determine the difference, we'll use the [`getTime()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime) function on a date object which gives us a time of milliseconds since the [Unix Epoch](https://en.wikipedia.org/wiki/Unix_time). We can subtract the millisecond time of `checkOut` by `checkIn` which will give us the difference in milliseconds. With this difference available to us, we can divide the difference with the number of milliseconds in a day which is `86400000`. This will give us the difference in days, however, we always want to count the `checkIn` date as part of the total price so we'll add the total number of days by `1`.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

    const totalPrice =
      listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);
  } catch {}
};
```

#### Check if host is connected with Stripe

For the next couple of things we intend to do, we'll need access to the user document of the host (i.e. the person who owns the listing). We can use MongoDB's [`findOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.findOne/) method on the `"users"` collection to find the document where the `id` is equal to the `host` field in our listing document.

We can then check for two things. If this `host` object doesn't exist, we'll throw an error. Additionally, we'll want this host connected with Stripe since that's the only way we'll be able to pay them out. When connected with Stripe, the host's `walletId` field should have a value. If neither the `host` nor the `host.walletId` values can't be found, we'll throw an error that says `"the host either can't be found or is not connected with Stripe"`.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

    const totalPrice =
      listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

    const host = await db.users.findOne({
      _id: listing.host
    });

    if (!host || !host.walletId) {
      throw new Error("the host either can't be found or is not connected with Stripe");
    }
  } catch {}
};
```

#### Create Stripe Charge

If all this information is available to us, we can then create the Stripe charge. We'll import the `Stripe` instance object we've created in our `src/lib/api` folder.

```ts
import { Stripe } from "../../../lib/api";
```

We'll run the `charge()` function within our `Stripe` instance and pass in the payloads that function is to expect which is the `totalPrice` we want to charge, the `source` which will come from the client, and the `stripe_user_id` of the person that is to be paid out which is the `walletId` value of the host.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

    const totalPrice =
      listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

    const host = await db.users.findOne({
      _id: listing.host
    });

    if (!host || !host.walletId) {
      throw new Error("the host either can't be found or is not connected with Stripe");
    }

    await Stripe.charge(totalPrice, source, host.walletId);
  } catch {}
};
```

#### Update bookings collection

At this moment, the charge would have been made successfully. We'll then simply need to update the documents in the different collections in our database.

In our database, we have a `"bookings"` collection to keep track of all the bookings made in our app. We'll use the [`insertOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.insertOne/) function from MongoDB to insert a new document to the `"bookings"` collection with the following field and field values:

- A new ObjectId for the `_id` field.
- A `listing` field to reference the listing that's being booked.
- A `tenant` field to reference the person who's making the booking.
- The `checkIn` and `checkOut` dates of the booking in normal string format.

We'll also need access to the newly inserted booking document with which we can access from the first item of the `.ops` property within the insert result.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

    const totalPrice =
      listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

    const host = await db.users.findOne({
      _id: listing.host
    });

    if (!host || !host.walletId) {
      throw new Error("the host either can't be found or is not connected with Stripe");
    }

    await Stripe.charge(totalPrice, source, host.walletId);

    const insertRes = await db.bookings.insertOne({
      _id: new ObjectId(),
      listing: listing._id,
      tenant: viewer._id,
      checkIn,
      checkOut
    });

    const insertedBooking: Booking = insertRes.ops[0];
  } catch {}
};
```

#### Update user document of host

Next, we'll look to update the user document of the host and increment the `income` field by the total price earned by the host. We'll use the [`updateOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.updateOne/) function from MongoDB to update the user document with the `_id` field equal to the `host._id` field. We'll then use the `$inc` operator to increment the `income` field by whatever the `totalPrice` is.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

    const totalPrice =
      listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

    const host = await db.users.findOne({
      _id: listing.host
    });

    if (!host || !host.walletId) {
      throw new Error("the host either can't be found or is not connected with Stripe");
    }

    await Stripe.charge(totalPrice, source, host.walletId);

    const insertRes = await db.bookings.insertOne({
      _id: new ObjectId(),
      listing: listing._id,
      tenant: viewer._id,
      checkIn,
      checkOut
    });

    const insertedBooking: Booking = insertRes.ops[0];

    await db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });
  } catch {}
};
```

#### Update user document of viewer

Next, we'll update the `user` document of the `viewer` to specify a new booking is to exist in the `bookings` field of this user. We'll use the [`updateOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.updateOne/) method again and find the user document where the `_id` field of the user is the `viewer._id`. We'll simply use the `$push` operator to push a new entry to the `bookings` field and we'll push the newly inserted booking `_id`.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

    const totalPrice =
      listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

    const host = await db.users.findOne({
      _id: listing.host
    });

    if (!host || !host.walletId) {
      throw new Error("the host either can't be found or is not connected with Stripe");
    }

    await Stripe.charge(totalPrice, source, host.walletId);

    const insertRes = await db.bookings.insertOne({
      _id: new ObjectId(),
      listing: listing._id,
      tenant: viewer._id,
      checkIn,
      checkOut
    });

    const insertedBooking: Booking = insertRes.ops[0];

    await db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });

    await db.users.updateOne(
      { _id: viewer._id },
      { $push: { bookings: insertedBooking._id } }
    );
  } catch {}
};
```

#### Update listing document being booked

Finally, we're going to update the `listing` document that's being booked. We'll use the [`updateOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.updateOne/) method again and find the listing document where the `_id` field is that of the listing we've found from the `id` passed in as the argument.

We'll update two things in the listing document. We'll need to update the `bookingsIndex` of this document with the new `bookingsIndex` from the `resolveBookingsIndex()` we'll create soon. We'll use the `$set` operator to update the entire value with the new value we've prepared.

Similar to the update we've made right above, we'll also want to update the `bookings` array in the listing document to have the `id` of the newly created booking. We'll use the `$push` operator just like the above and push the `id` of the inserted booking to the new booking.

```ts
createBooking: async (
  _root: undefined,
  { input }: CreateBookingArgs,
  { db, req }: { db: Database; req: Request }
): Promise<Booking> => {
  try {
    const { id, source, checkIn, checkOut } = input;

    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const listing = await db.listings.findOne({
      _id: new ObjectId(id)
    });
    if (!listing) {
      throw new Error("listing can't be found");
    }

    if (listing.host === viewer._id) {
      throw new Error("viewer can't book own listing");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate < checkInDate) {
      throw new Error("check out date can't be before check in date");
    }

    const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);

    const totalPrice =
      listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

    const host = await db.users.findOne({
      _id: listing.host
    });

    if (!host || !host.walletId) {
      throw new Error("the host either can't be found or is not connected with Stripe");
    }

    await Stripe.charge(totalPrice, source, host.walletId);

    const insertRes = await db.bookings.insertOne({
      _id: new ObjectId(),
      listing: listing._id,
      tenant: viewer._id,
      checkIn,
      checkOut
    });

    const insertedBooking: Booking = insertRes.ops[0];

    await db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });

    await db.users.updateOne(
      { _id: viewer._id },
      { $push: { bookings: insertedBooking._id } }
    );

    await db.listings.updateOne(
      { _id: listing._id },
      {
        $set: { bookingsIndex },
        $push: { bookings: insertedBooking._id }
      }
    );
  } catch {}
};
```

These are all the changes we'll want to be done in the `createBooking()` mutation resolver function. However, we're still not done yet since we'll need to build out the functionality for the `resolveBookingsIndex()` function that will create a new `bookingsIndex` from the check-in and check-out dates of a booking. We'll look to handle this in the next lesson.

We'll have the `createBooking()` mutation function return the `insertedBooking` document at the end of the function and in our function's `catch` statement, we'll catch whatever error might have been thrown and compile it within a new error statement that says `"Failed to create a booking"`.

```ts
export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        const listing = await db.listings.findOne({
          _id: new ObjectId(id)
        });
        if (!listing) {
          throw new Error("listing can't be found");
        }

        if (listing.host === viewer._id) {
          throw new Error("viewer can't book own listing");
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("check out date can't be before check in date");
        }

        // to be created in the next lesson
        //
        // const bookingsIndex = resolveBookingsIndex(
        //   listing.bookingsIndex,
        //   checkIn,
        //   checkOut
        // );

        const totalPrice =
          listing.price *
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        const host = await db.users.findOne({
          _id: listing.host
        });

        if (!host || !host.walletId) {
          throw new Error(
            "the host either can't be found or is not connected with Stripe"
          );
        }

        await Stripe.charge(totalPrice, source, host.walletId);

        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut
        });

        const insertedBooking: Booking = insertRes.ops[0];

        await db.users.updateOne(
          {
            _id: host._id
          },
          {
            $inc: { income: totalPrice }
          }
        );

        await db.users.updateOne(
          {
            _id: viewer._id
          },
          {
            $push: { bookings: insertedBooking._id }
          }
        );

        await db.listings.updateOne(
          {
            _id: listing._id
          },
          {
            // $set: { bookingsIndex }, // to be handled in the next lesson
            $push: { bookings: insertedBooking._id }
          }
        );

        return insertedBooking;
      } catch (error) {
        throw new Error(`Failed to create a booking: ${error}`);
      }
    }
  }
  // ...
};
```
