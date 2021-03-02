# Module 6 Summary

> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we had the client be able to request and present information for a certain user in the `/user/:id` route of our application.

## Server Project

### `src/graphql/typeDefs.ts`

We created a single root-level `user` field that can be queried from the client to receive a user's information. The `user` query field queries for a user in the `"users"` collection of our database based on the `id` argument provided.

```graphql
  type Query {
    authUrl: String!
    user(id: ID!): User!
  }
```

The `User` object returned from the `user` query field is to have certain information about a user we want the client to access.

```graphql
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
```

### `src/graphql/resolvers/User/index.ts`

The `userResolvers` map in the `src/graphql/resolvers/User/index.ts` file contains the resolver functions that pertain to the `User` object/domain.

The root-level query `user()` resolver function simply looks to find the user from the `"users"` collection from the `id` argument provided. If the viewer making the request _is_ the user being requested, we add an `authorized` property to the `user` object to constitute that the viewer is authorized to see certain information about the `user`.

```ts
export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: UserArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({ _id: id });

        if (!user) {
          throw new Error("user can't be found");
        }

        const viewer = await authorize(db, req);

        if (viewer && viewer._id === user._id) {
          user.authorized = true;
        }

        return user;
      } catch (error) {
        throw new Error(`Failed to query user: ${error}`);
      }
    }
  },
  // ...
};
```

We declare a few other additional resolver functions for the `User` object. The `id()` resolver simply returns the `_id` value of a user document. The `hasWallet()` resolver returns the presence of the `walletId` field of a user document. The `income` field returns the `user.income` only if the viewer is authorized to see this information.

```ts
export const userResolvers: IResolvers = {
  // ...
    id: (user: User): string => {
      return user._id;
    },
    hasWallet: (user: User): boolean => {
      return Boolean(user.walletId);
    },
    income: (user: User): number | null => {
      return user.authorized ? user.income : null;
    },
  // ...
};
```

`bookings()` and `listings()` are resolver functions that help return a paginated list of bookings and listings respectively. The `bookings()` resolver only returns data if the viewer is authorized.

```ts
export const userResolvers: IResolvers = {
  // ...
    bookings: async (
      user: User,
      { limit, page }: UserBookingsArgs,
      { db }: { db: Database }
    ): Promise<UserBookingsData | null> => {
      try {
        if (!user.authorized) {
          return null;
        }

        const data: UserBookingsData = {
          total: 0,
          result: []
        };

        let cursor = await db.bookings.find({
          _id: { $in: user.bookings }
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query user bookings: ${error}`);
      }
    },
  // ...
};
```

```ts
export const userResolvers: IResolvers = {
  // ...
    listings: async (
      user: User,
      { limit, page }: UserListingsArgs,
      { db }: { db: Database }
    ): Promise<UserListingsData | null> => {
      try {
        const data: UserListingsData = {
          total: 0,
          result: []
        };

        let cursor = await db.listings.find({
          _id: { $in: user.listings }
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query user listings: ${error}`);
      }
    }
  // ...
};
```

### `src/graphql/resolvers/Booking/index.ts`

We've created explicit resolver functions for the `id` and `listing` field in a `Booking` object to have these fields resolve to their expected values when queried from the client.

```ts
export const bookingResolvers: IResolvers = {
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
    }
  }
};
```

### `src/graphql/resolvers/Listing/index.ts`

We've also created an explicit resolver function for the `id` field of a `Listing` object to have it resolved to its expected value when queried from the client.

```ts
export const listingResolvers: IResolvers = {
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    }
  }
};
```

## Client Project

### `src/lib/graphql/queries/User/index.ts`

In the client, we constructed the `User` GraphQL document in the `src/lib/graphql/queries/User/index.ts` file.

```ts
import { gql } from "apollo-boost";

export const USER = gql`
  query User($id: ID!, $bookingsPage: Int!, $listingsPage: Int!, $limit: Int!) {
    user(id: $id) {
      id
      name
      avatar
      contact
      hasWallet
      income
      bookings(limit: $limit, page: $bookingsPage) {
        total
        result {
          id
          listing {
            id
            title
            image
            address
            price
            numOfGuests
          }
          checkIn
          checkOut
        }
      }
      listings(limit: $limit, page: $listingsPage) {
        total
        result {
          id
          title
          image
          address
          price
          numOfGuests
        }
      }
    }
  }
`;
```

### `src/sections/User/index.tsx`

In the `<User />` component rendered in the `/user/:id` route, we construct the entire user page that involves but is not limited to:

-   Making the `user` query when the component first mounts.
-   Presenting the user profile information in the `<UserProfile />` child component.
-   Presenting the list of listings the user owns in the `<UserListings />` child component.
-   Presenting the list of bookings the user has made in the `<UserBookings />` child component.

Appropriate loading and error state UI is also presented when the `user` query is in the loading or error state. When data is available from the query, the relevant user information is shown to the user.

```tsx
export const User = ({ viewer, match }: Props & RouteComponentProps<MatchParams>) => {
  const [listingsPage, setListingsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);

  const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id,
      bookingsPage,
      listingsPage,
      limit: PAGE_LIMIT
    }
  });

  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const user = data ? data.user : null;
  const viewerIsUser = viewer.id === match.params.id;

  const userListings = user ? user.listings : null;
  const userBookings = user ? user.bookings : null;

  const userProfileElement = user ? (
    <UserProfile user={user} viewerIsUser={viewerIsUser} />
  ) : null;

  const userListingsElement = userListings ? (
    <UserListings
      userListings={userListings}
      listingsPage={listingsPage}
      limit={PAGE_LIMIT}
      setListingsPage={setListingsPage}
    />
  ) : null;

  const userBookingsElement = userListings ? (
    <UserBookings
      userBookings={userBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  return (
    <Content className="user">
      <Row gutter={12} type="flex" justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
        <Col xs={24}>
          {userListingsElement}
          {userBookingsElement}
        </Col>
      </Row>
    </Content>
  );
};
```

## Moving forward

In the next module, we begin building the server and client implementation that will help allow us to retrieve and display information for listings in the `/listing/:id` route of our application.
