# Module 7 Summary

> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we had the client be able to request and present information for a certain listing in the `/listing/:id` route of our application.

## Server Project

### `src/graphql/typeDefs.ts`

We created a single root-level `listing` field that can be queried from the client to receive the information for a certain listing. The `listing` query field queries for a listing in the `"listings"` collection of our database based on the `id` argument provided.

```graphql
type Query {
  authUrl: String!
  user(id: ID!): User!
  listing(id: ID!): Listing!
}
```

The `Listing` object returned from the `listing` query field is to have certain information about a listing we want the client to access.

```graphql
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
```

### `src/graphql/resolvers/Listing/index.ts`

In the `listingResolvers` map in the `src/graphql/resolvers/Listing/index.ts` file, we created the root-level query `listing()` resolver function to find a certain listing from the `"listings"` collection based on the `id` argument provided. If the viewer making the request _is_ the user who owns the listing (i.e. is the host of the listing), we add an `authorized` property to the `listing` object to constitute that the viewer is authorized to see certain information about the listing.

```ts
export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error("listing can't be found");
        }

        const viewer = await authorize(db, req);
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true;
        }

        return listing;
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    }
  }
  // ...
};
```

We've added a few other explicit resolver functions for the `Listing` GraphQL object.

- The `id()` resolver returns the string representation of the `_id` value of a listing document.
- The `host()` resolver attempts to returns a user object for the `listing.host` id value. `listing.id` represents the `id` of the user who owns the listing.
- The `bookingsIndex()` resolver returns a string representation of the `listing.bookingsIndex` map object.
- The `bookings()` resolver returns the list of bookings that have been made to the listing.

```ts
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    },
    host: async (
      listing: Listing,
      _args: {},
      { db }: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        throw new Error("host can't be found");
      }
      return host;
    },
    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex);
    },
    bookings: async (
      listing: Listing,
      { limit, page }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        if (!listing.authorized) {
          return null;
        }

        const data: ListingBookingsData = {
          total: 0,
          result: []
        };

        let cursor = await db.bookings.find({
          _id: { $in: listing.bookings }
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listing bookings: ${error}`);
      }
    }
  }
};
```

## Client Project

### `src/lib/graphql/queries/Listing/index.ts`

In the client, we constructed the `Listing` GraphQL document in the `src/lib/graphql/queries/Listing/index.ts` file.

```ts
import { gql } from "apollo-boost";

export const LISTING = gql`
  query Listing($id: ID!, $bookingsPage: Int!, $limit: Int!) {
    listing(id: $id) {
      id
      title
      description
      image
      host {
        id
        name
        avatar
        hasWallet
      }
      type
      address
      city
      bookings(limit: $limit, page: $bookingsPage) {
        total
        result {
          id
          tenant {
            id
            name
            avatar
          }
          checkIn
          checkOut
        }
      }
      bookingsIndex
      price
      numOfGuests
    }
  }
`;
```

### `src/sections/Listing/index.tsx`

In the `<Listing />` component rendered in the `/listing/:id` route, we construct the entire listing page that involves but is not limited to:

- Making the `listing` query when the component first mounts.
- Presenting the listing details in the `<ListingDetails />` child component.
- Presenting the list of bookings that have been made for the listing in the `<ListingBookings />` child component.
- Presenting the section where a user will be able to book the listing in the `<ListingCreateBooking />` child component.

Appropriate loading and error state UI is also presented when the `listing` query is in the loading or error state. When data is available from the query, the relevant listing information is shown to the user.

```tsx
export const Listing = ({ match }: RouteComponentProps<MatchParams>) => {
  const [bookingsPage, setBookingsPage] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);

  const { loading, data, error } = useQuery<ListingData, ListingVariables>(LISTING, {
    variables: {
      id: match.params.id,
      bookingsPage,
      limit: PAGE_LIMIT
    }
  });

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon!" />
        <PageSkeleton />
      </Content>
    );
  }

  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;

  const listingDetailsElement = listing ? <ListingDetails listing={listing} /> : null;

  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  const listingCreateBookingElement = listing ? (
    <ListingCreateBooking
      price={listing.price}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
    />
  ) : null;

  return (
    <Content className="listings">
      <Row gutter={24} type="flex" justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
        <Col xs={24} lg={10}>
          {listingCreateBookingElement}
        </Col>
      </Row>
    </Content>
  );
};
```

## Moving forward

In the next module, we begin building the server and client implementation that will help allow us to retrieve and display information for a **list of listings** in the homepage (i.e. `/` route) of our application.
