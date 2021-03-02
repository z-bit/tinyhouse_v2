# Resolving the BookingsIndex of a Listing

> 📝 An example of a `bookingsIndex` object that we'll address in this lesson can be found - [here](https://gist.github.com/djirdehh/d5a281a73151d6b25a2c066ab37c63eb).

In the last lesson, we got almost everything within the `createBooking()` mutation resolver function complete except for preparing the `resolveBookingsIndex()` utility function. The `resolveBookingsIndex()` function is to help produce a new `bookingsIndex` object for a listing. We'll have the `resolveBookingsIndex()` function created in the same file as to where we have the `bookingResolvers` map. Above and outside of our resolvers map, we'll construct the function and the parameters it is to accept. It'll accept a `bookingsIndex` object and it'll accept `checkInDate` and `checkOutDate` parameters of type `string`.

```ts
export const resolveBookingsIndex = (
  bookingsIndex,
  checkInDate: string,
  checkOutDate: string
) => {};
```

We'll need a type to specify the shape of the `bookingsIndex` parameter. If we recall, the `bookingsIndex` object will be our way for how we hope to handle dates and the booking of dates in our application and will look something like this:

```ts
// 2019-01-01   year: 2019 | month: 01 | day: 01
// 2019-01-02   year: 2019 | month: 01 | day: 02
// 2019-05-31   year: 2019 | month: 05 | day: 31
// 2019-06-01   year: 2019 | month: 06 | day: 01
// 2019-07-20   year: 2019 | month: 07 | day: 20

const bookingsIndex = {
  "2019": {
    "00": {
      "01": true,
      "02": true
    },
    "04": {
      "31": true
    },
    "05": {
      "01": true
    },
    "06": {
      "20": true
    }
  }
};

// NOTE: the JavaScript function for getting the month returns 0 for Jan ... and 11 for Dec
```

`bookingsIndex` is an object that contains a set of nested objects that contain key-value pairs.

- In the root level, the index will be the year the booking is made.
- The child objects of the root will reference the month the booking is made.
- Further down, the child objects will reference the day a booking is made with which at this moment, a `true` boolean value indicates the days that have already been booked.

> **Note:** The JavaScript function for getting the month according to universal time, [getUTCMonth()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getUTCMonth), starts at 0 to represent January which is why in the `bookingsIndex` example above, 0 references the month of January.

From the `bookingsIndex` example noted above, let's highlight two different cases of a new booking that is about to be made.

**Case 1:** If a user wants to book from `2019-Jan-01` to `2019-Jan-03` for a listing that has the `bookingsIndex` example shown above, **the booking should fail because the check-in and check-out dates overlap dates that have already been booked.** The `bookingsIndex` will remain as follows:

```ts
const bookingsIndex = {
  "2019": {
    "00": {
      "01": true,
      "02": true
    },
    "04": {
      "31": true
    },
    "05": {
      "01": true
    },
    "06": {
      "20": true
    }
  }
};
```

**Case 2**: If a user wants to book from `2019-Dec-01` to `2019-Dec-03` for a listing that has the `bookingsIndex` example shown above, **the booking should be successful because the check-in and check-out dates don't overlap with already booked dates**. The new `bookingsIndex` will be as follows:

```ts
const bookingsIndex = {
  "2019": {
    "00": {
      "01": true,
      "02": true
    },
    "04": {
      "31": true
    },
    "05": {
      "01": true
    },
    "06": {
      "20": true
    },
    "11": {
      "01": true,
      "02": true,
      "03": true
    }
  }
};
```

We want the `resolveBookingsIndex()` function to handle the above two cases. Let's first define the shape of the `bookingsIndex` field argument for the function. If we take a look at our `src/lib/types.ts` file, we'll see we've prepared interfaces for the `BookingsIndexYear` and `BookingsIndexMonth` objects. The `BookingsIndex` object itself will essentially be the parent of the key-value pairs where the values will be the `BookingsIndexYear` objects so we'll create and export a `BookingsIndex` interface to represent this:

```ts
export interface BookingsIndex {
  [key: string]: BookingsIndexYear;
}
```

We'll also make sure the `bookingsIndex` field of the TypeScript interface to describe the shape of a listing document is to have the type of `BookingsIndex`.

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
  numOfGuests: number;
  authorized?: boolean;
}
```

In the `src/graphql/resolvers/Booking/index.ts` file, we'll import the `BookingsIndex` interface from the `src/lib/types.ts` file and state the type of the `bookingsIndex` argument for the `resolveBookingsIndex()` function to be the `BookingsIndex` interface. Since we expect this function to also return a valid index of the shape, we'll state the function's return type as `BookingsIndex` as well.

```ts
// ...
import { Database, Listing, Booking, BookingsIndex } from "../../../lib/types";
// ...

export const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {};
```

At the beginning of the `resolveBookingsIndex()` function, we'll specify a `dateCursor` which will be set to the date object of the `checkInDate` string. We'll also specify a `checkOut` date object which will be the date object of the `checkOutDate` string. We'll then declare a new constant variable called `newBookingsIndex` and initialize it with the `bookingsIndex` object that was passed in as an argument. We'll want the `resolveBookingsIndex()` function to update this `newBookingsIndex` variable and return it in the end.

```ts
export const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  // update newBookingsIndex here

  return newBookingsIndex;
};
```

Since we'll want to ensure that we can update the `newBookingsIndex` object for all the number of days being booked, we'll want to run a statement through an iteration of sorts and this is where a [**`while`**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while) loop can be helpful. The `while` loop is a control flow statement that'll allow the code we write to be executed over and over given a valid `Boolean` condition. The condition we'll provide will involve the `dateCursor` being less than or equal to `checkOut` (i.e. is the `dateCursor` date before the `checkOut` date).

It's important to control the moment in which we want to break out of this loop. In the `while` statement, we'll increment the `dateCursor` value by one day at a time and we're going to do this by adding the number of milliseconds in a day (`86400000`).

```ts
export const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    // update newBookingsIndex here

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};
```

This would allow us to iterate and update the `newBookingsIndex` object day by day while the `dateCursor` is still less than or equal to `checkOut`. The moment the `dateCursor` value exceeds the `checkOut` date, we'll break out of the loop.

We'll now begin to update the `newBookingsIndex` object for days that are valid. The `newBookingsIndex` constant we've set-up is an object (i.e. hash). When it comes to updating or reading objects and hashes, it can be done practically instantly. All we need to do is simply provide the key that we're looking for to find the point in the object we want to update.

The `newBookingsIndex` object is broken down into three steps. We need to sort of compile information for the `dateCursor` for each of these steps. In other words, we need to compile what the year is, what the month is, and what the day is for a certain point in the index. We can achieve this with the following three JavaScript date functions.

```ts
export const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear(); // year
    const m = dateCursor.getUTCMonth(); // month
    const d = dateCursor.getUTCDate(); // day

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};
```

> **Note:** As we've stated before, `getUTCMonth()` returns 0 for Jan ... and 11 for Dec!

With the date values available for the existing `dateCursor`, we can access and manipulate the `newBookingsIndex` object. For example, in the beginning, we can check to see if `newBookingsIndex` has a value for the year of the `dateCursor`. If it doesn't, let's construct an object. We will repeat this for the month value and check to see if `newBookingsIndex` has a value for the month of the `dateCursor`. If not, we'll create another object.

```ts
const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }

    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};
```

Finally, we'll then check if the `newBookingsIndex` object has value for the day of the `dateCursor`. If not, we'll simply add the value of `true` to the key of `newBookingsIndex[y][m][d]` which states that this **day has been booked**. However, this is where we'll also have an `else` statement if the day value already exists which would mean its already been booked. If the value already exists, we'll throw an error and say `"selected dates can't overlap dates that have already been booked"`.

```ts
const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }

    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }

    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    } else {
      throw new Error("selected dates can't overlap dates that have already been booked");
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};
```

This is a pretty simple solution and it does what we need to do for our use case. There's a lot of questions and discussions that can come from this such as performance. Is what we've done a somewhat performant solution? From what we've gathered, it's pretty good. The reason being is that when the size of the input (i.e. the difference between the number of days between `checkIn` and `checkOut`) increases, the time dependency of our solution will only increase linearly based on the input.

However, there are bigger discussions that could come from the fact that what if a user picks a check-in date in 2019 and a check-out date far in the future (e.g. 2025). The way we have our loop, we're going to increment from the check-in date all the way through to the check-out date. If there are no bookings made in between, we're just going to keep going which can take some time. A simple solution to avoid this would be limiting the length of time the user can check-in and check-out (e.g a user can only book listings for a maximum of one month). Another solution would involve limiting the furthest time in the future that a user can either check-in or check-out (e.g listings can only be booked within a year from check-in).

### `tenant()`

The last thing we'll do is to add a `tenant()` resolver function inside of our `bookingResolvers` map. In this `tenant()` resolver function, we'll look to access the `booking` data object that will be passed from the parent resolver functions. There'll be no arguments we expect here and we'll look to access the `db` object available in context. We'll use MongoDB's [`findOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.findOne/) method to find the user document where the `_id` value matches `booking.tenant` which is the `id` of the user who is making the booking.

With this change and all the changes we've made, the `src/graphql/resolvers/Booking/index.ts` file will appear as follows:

```ts
import { IResolvers } from "apollo-server-express";
import { Request } from "express";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api";
import { Database, Listing, Booking, BookingsIndex } from "../../../lib/types";
import { authorize } from "../../../lib/utils";
import { CreateBookingArgs } from "./types";

const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }

    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }

    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    } else {
      throw new Error("selected dates can't overlap dates that have already been booked");
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

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

        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut
        );

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
            $set: { bookingsIndex },
            $push: { bookings: insertedBooking._id }
          }
        );

        return insertedBooking;
      } catch (error) {
        throw new Error(`Failed to create a booking: ${error}`);
      }
    }
  },
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing: (
      booking: Booking,
      _args: {},
      { db }: { db: Database }
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    },
    tenant: (booking: Booking, _args: {}, { db }: { db: Database }) => {
      return db.users.findOne({ _id: booking.tenant });
    }
  }
};
```

That's pretty much it! In the next coming lessons, we'll begin to work on the client-side to facilitate the booking of a listing. Great job so far!
