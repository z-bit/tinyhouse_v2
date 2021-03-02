# Database Collection Structure

We'll now shift our focus to the server. In this lesson, we'll brainstorm the _structure_ of our database.

In a MongoDB database, [related objects (i.e. documents) are stored in a collection](https://docs.mongodb.com/manual/core/databases-and-collections/). A database is simply a group of collections. The number of collections we need is directly related to what our app would need to do.

In our TinyHouse application, we'll create and use three collections:

-   A `"users"` collection.
-   A `"listings"` collection.
-   And a `"bookings"` collection.

### Users Collection

We'll need a collection to store the **users** of our application. In the `src/database/index.ts` file of our server project, there exists a `connectDatabase()` function responsible for connecting our MongoDB Atlas cluster with our Node server project. In the return object of this function, we'll state a new `users` field to declare that we want to access a `"users"` collection from our database. We'll specify the access to the `users` collection with the [`db.collection()`](https://mongodb.github.io/node-mongodb-native/api-generated/collection.html) function available to us from the Node Mongo driver.

```typescript
import { MongoClient } from "mongodb";
import { Database } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net`;

export const connectDatabase = async (): Promise<Database> => {
  // ...

  return {
    // ...,
    users: db.collection("users")
  };
};
```

We'll look to create a type definition for our user documents to describe the shape of a single document within the `"users"` collection. We'll do this in the `src/lib/types.ts` file.

MongoDB automatically creates an `_id` field of type `ObjectId` for any document we insert into a collection. Before we discuss the other fields of a user document, we'll state that the `_id` field will exist. We'll create an interface intended to describe the shape of a single `User`, and we'll state the `_id` field to be of type `ObjectId`.

```typescript
import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
}
```

We'll then introduce a `users` field into the `Database` interface that exists within this `types.ts` file that is used to describe the shape of the returned database object from the `connectDatabase()` function. We'll say the `users` field type is the `Collection` generic and we'll pass the `User` type as the type argument.

```typescript
import { Collection, ObjectId } from "mongodb";

...

export interface User {
  _id: ObjectId;
}

export interface Database {
  ...
  users: Collection<User>;
}
```

In the `database/index` file, we'll import the `User` interface type we've just created and pass it into the `db.collection()` function that acts as a generic as well.

```typescript
import { MongoClient } from "mongodb";
import { Database, User } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net`;

export const connectDatabase = async (): Promise<Database> => {
  // ...

  return {
    // ...,
    users: db.collection<User>("users")
  };
};
```

### Listings Collection

Since our app is going to allow users to create listings to rent, we'll need a collection to store these listings. We already have a `listings` field be declared in the `connectDatabase()` function of our server project for a `"test_listings"` collection we set up in Part I of the course. We'll keep the `listings` field but instead, we'll say the field should be a reference to a collection that is to be named `"listings"`.

```typescript
import { MongoClient } from "mongodb";
import { Database, User } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net`;

export const connectDatabase = async (): Promise<Database> => {
  // ...

  return {
    listings: db.collection("listings"),
    users: db.collection<User>("users")
  };
};
```

In the `src/lib/types.ts` file, we have a `Listing` interface type be created from Part I of the course as well. We're not sure how the document is to be shaped just yet so we'll remove all the other fields except for the `_id` field.

The `Listing` interface is currently being used as the type argument for the `Collection` interface type of the `listings` field within the `Database` interface.

```typescript
import { Collection, ObjectId } from "mongodb";

export interface Listing {
  _id: ObjectId;
}

// ...

export interface Database {
  listings: Collection<Listing>;
  users: Collection<User>;
}
```

With that said, we'll import the `Listing` interface type in our `src/database/index.ts` file, and place it as a type variable in the `db.collection()` function that references the `"listings"` collection.

```typescript
import { MongoClient } from "mongodb";
import { Database, Listing, User } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net`;

export const connectDatabase = async (): Promise<Database> => {
  // ...

  return {
    listings: db.collection<Listing>("listings"),
    users: db.collection<User>("users")
  };
};
```

### Bookings Collection

Finally, when a user is to eventually book a listing to stay at, we'll need a collection to store the data that represents a single _booking_. This `bookings` collections might not seem necessary but will be more clear once we define the structure of our documents in the next lesson. For now, think of a booking as a "ticket" or a "receipt" that identifies the customer instead of the owner.

We'll introduce a `bookings` field in the return statement of our `connectDatabase()` function and state that the collection is `"bookings"`.

```typescript
import { MongoClient } from "mongodb";
import { Database, Listing, User } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net`;

export const connectDatabase = async (): Promise<Database> => {
  // ...

  return {
    bookings: db.collection("bookings"),
    listings: db.collection<Listing>("listings"),
    users: db.collection<User>("users")
  };
};
```

In the `src/lib/types.ts` file, we'll create an interface that is to represent the shape of a single booking document and we'll state it is to have an `_id` field of type `ObjectId`. We'll also specify the `bookings` field and its appropriate type (`Collection<Booking>`) in our `Database` interface.

```typescript
import { Collection, ObjectId } from "mongodb";

export interface Booking {
  _id: ObjectId;
}

// ...

export interface Database {
  bookings: Collection<Booking>;
  listings: Collection<Listing>;
  users: Collection<User>;
}
```

In the `connectDatabase()` function within the `src/database/index.ts` file, we'll import the `Booking` interface type and place it as the type variable of our `db.collection()` function that references the `bookings` collection.

At this moment, our `src/database/index.ts` file will look like the following:

```tsx
import { MongoClient } from "mongodb";
import { Database, Booking, Listing, User } from "../lib/types";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  const db = client.db("main");

  return {
    bookings: db.collection<Booking>("bookings"),
    listings: db.collection<Listing>("listings"),
    users: db.collection<User>("users")
  };
};
```

We've defined the three collections (`bookings`, `listings`, and `users`) we expect to interact with from our database and in our Node server project. In the next lesson, we'll look to declare the types of the fields for each document that is to be stored in each of these collections. In other words, we'll look to declare the _shape_ of the data we expect to store in each of these collections.
