# Modifying the User, Listing, and Booking GraphQL TypeDefs

### `User`

With our `user` query field established, let's set up the type definitions and accompanying resolver function for the `user` field such that we're able to resolve and query user information.

First, we'll look to have a `User` object type in our GraphQL schema to represent the fields we expect can be queried for a certain user. Our GraphQL schema definition of a `User` will be very similar to the TypeScript definition we've established for how a user document is shaped in our database. We'll want to query the `id`, `name`, `avatar`, `contact`, and the `listings` and `bookings` the user is to have.

However, there are a few differences between our GraphQL `User` object type and the `User` TypeScript interface we've set up.

- In the `User` GraphQL object type, there will exist an `id` field, not an `_id` field.
- There won't be a `token` field in the `User` GraphQL object type. `token` is a field in a `User` MongoDB document that is used for login session information which we learned in the previous module. We won't find the need to expose this `token` field in our `User` GraphQL object.
- The `User` GraphQL object will have a `hasWallet` field instead of a `walletId` field. `walletId` will be the actual wallet ID from Stripe we'll store in the database and we won't want to pass this sensitive information to the client. The client will only need to know if the user has a wallet or not with which will be exposed through a `hasWallet` boolean field (similar to how the `hasWallet` field behaves for the `Viewer` GraphQL object).
- The `bookings` field in the `User` GraphQL object will return an array of `Booking` objects, not an array of `Booking` ids.
- Similarly, the `listings` field in the `User` GraphQL object will return an array of `Listing` objects, not an array of `Listing` ids.

Let's create this `User` object type in our type definitions file. In the `src/graphql/typeDef.ts` file, we'll create a `User` object type above our existing `Viewer` type and say it is to have the following fields.

- `id` field of type `ID!`.
- `name`, `avatar`, and `contact` fields of type `String!`.
- `hasWallet` field of type `Boolean!`.
- `income` field of type `Int`.
- `bookings` field of a `Bookings` object type.
- `listings` field of a `Listings!` object type.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings: Bookings
    listings: Listings!
  }

  #...
`;
```

There are a few things to consider on how we've structured our `User` GraphQL object type.

#### `income` & `bookings`

We've stated all fields within the `User` object type are to be non-null _except_ for the `income` and `bookings` information. When we query for the `user` field from our client, we will expect to receive values for _most_ of these fields except for `income` and `bookings`. This is because we'll treat the `income` and `bookings` fields as protected fields where we'll only allow these fields to be resolved to the intended values when a user is querying _their own user information_. We consider the bookings a user is to make to be sensitive information since we wouldn't want another person to query for a certain user and know the bookings they've made. This is the same for a user's income.

The way we intend to handle the `income` and `bookings` fields is to check for the viewer id making the request and to see if the viewer id matches the user id being queried - if so, we'll return the intended values. If not, we'll return `null` values.

#### `bookings` & `listings`

`bookings` and `listings` are to be paginated fields. **Pagination is the process of dividing a large list of data into smaller discrete chunks (or pages)**. We're going to address how we handle pagination when we build our resolver functions. In summary, the client is to going to be able to pass two arguments to these two fields (`bookings` and `listings`) to determine the paginated content that is to be returned. The client will pass a `limit` field and a `page` field to both `bookings` and `listings`.

- `limit` will dictate the amount or limit of data that is to be queried for a single page.
- `page` will reference the chunk or page of data being queried.

We'll get a better understanding of this when we build our resolver functions. However, with this in mind, the `User` GraphQL object type will appear as follows.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  #...
`;
```

### `Bookings` & `Listings`

Since `Bookings` and `Listings` are custom object types, we'll need to create what they are. We've said we want the `bookings` and the `listings` fields of `User` to return lists but we haven't stated that these fields are to resolve to GraphQL lists. This is because the `Bookings` and `Listings` objects are to contain two fields each.

The `Bookings` object type will have a `total` field to reference the total amount of objects with which our client will be able to use. It will also contain a `result` field which is to be a GraphQL list of `Booking` objects.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  #...
`;
```

The `Listings` object type will be similar. It will have a `total` integer field and a `result` field which is to be a GraphQL list of `Listing` object.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  type Listings {
    total: Int!
    result: [Listing!]!
  }

  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  #...
`;
```

### `Listing`

We'll now need to create the `Booking` and `Listing` GraphQL object types.

The `Listing` GraphQL object type will appear similar to the `Listing` TypeScript interface we've created before to describe the shape of a single listing document, with a few exceptions.

- The `Listing` GraphQL type will have an `id` field instead of `_id`.
- The `host` field in the `Listing` GraphQL type will resolve to the `User` object type. In a listing document in our database, `host` is a reference to the `id` of the particular user. However, in our GraphQL API, we'll want the `host` field for `Listing` to resolve to the user object who owns the listing.
- The `bookings` field of the `Listing` GraphQL type will return an array of `Booking` objects which will be paginated. The `bookings` for a listing refer to the bookings made for this listing by all the different users.
- The `bookingsIndex` field of `Listing` is defined as a key-value pair in our TypeScript definition. GraphQL, however, doesn't have a type for this. We can get around this problem by simply [stringifying](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) a `bookingsIndex` object and having it resolved as a string when queried.

With all the above in mind, let's create the `Listing` object type in our GraphQL schema.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
  }

  type Listings {
    total: Int!
    result: [Listing!]!
  }

  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  #...
`;
```

We'll create a [GraphQL Enum](https://graphql.org/learn/schema/#enumeration-types), `ListingType`, to specify the two different listing type properties - `apartment` and `house` for the `type` field of the `Listing` object. As good practice, we'll have our Enum properties in capital letters.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  enum ListingType {
    APARTMENT
    HOUSE
  }

  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
  }

  type Listings {
    total: Int!
    result: [Listing!]!
  }

  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  #...
`;
```

> In GraphQL, [Enumeration types](https://graphql.org/learn/schema/#enumeration-types) are a special kind of scalar type that is restricted to a defined set of allowed values.
>
> By stating the `type` field of our `Listing` object to resolve to the `ListingType` Enum, the value for `type` must be one of a certain number of values that constitutes a `ListingType` (`APARTMENT` or `HOUSE`).

### `Booking`

We'll create the `Booking` GraphQL type that describes a booking object. The `Booking` GraphQL object type will be similar to the shape of a booking document in our database except for:

- The `Booking` GraphQL type is to have an `id` field instead of `_id`.
- The `listing` field in the `Booking` GraphQL type is to resolve to a `Listing` object instead of an `_id` value that refers to the `id` of the listing.
- The `tenant` field in the `Booking` GraphQL type will resolve to a `User` object instead of a string that refers to the `user` id.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Booking {
    id: ID!
    listing: Listing!
    tenant: User!
    checkIn: String!
    checkOut: String!
  }

  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  enum ListingType {
    APARTMENT
    HOUSE
  }

  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
  }

  type Listings {
    total: Int!
    result: [Listing!]!
  }

  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  #...
`;
```

### `Query.user`

Finally, we'll update the root level query field `user` as well. The `user` field will take an `id` input of type GraphQL `ID!` and return a `User` object from when resolved.

```tsx
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  #...

  type Query {
    #...
    user(id: ID!): User!
  }

  type Mutation {
    #...
  }
`;
```

With all these changes made, the `src/graphql/typeDefs.ts` file will look like the following:

```ts
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Booking {
    id: ID!
    listing: Listing!
    tenant: User!
    checkIn: String!
    checkOut: String!
  }

  type Bookings {
    total: Int!
    result: [Booking!]!
  }

  enum ListingType {
    APARTMENT
    HOUSE
  }

  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    city: String!
    bookings(limit: Int!, page: Int!): Bookings
    bookingsIndex: String!
    price: Int!
    numOfGuests: Int!
  }

  type Listings {
    total: Int!
    result: [Listing!]!
  }

  type User {
    id: ID!
    name: String!
    avatar: String!
    contact: String!
    hasWallet: Boolean!
    income: Int
    bookings(limit: Int!, page: Int!): Bookings
    listings(limit: Int!, page: Int!): Listings!
  }

  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }

  input LogInInput {
    code: String!
  }

  type Query {
    authUrl: String!
    user(id: ID!): User!
  }

  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
  }
`;
```

This is where we'll stop for now. Not all the fields we've defined here are going to be used solely for when we build the `/user/:id` page in the client. A lot of the types we've defined here are going to be used when we build the other pages in our UI. For example, a lot of the fields we've defined for the `Listing` object type will be utilized when we build out the `/listing/:id` page for a single listing.

In the next lesson, we'll continue what we've done by building out the resolver functions for the `User` object in our `userResolvers` map.
