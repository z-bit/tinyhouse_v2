# Module 9 Summary

> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we'll set up the functionality that will allow users to search for a collection of listings **based on location**.

## Server Project

### `src/graphql/typeDefs.ts`

We've updated the root-level `listings` query field to accept an optional `location` argument. When the `location` argument is provided, the `listings` field is to return the collection of listings that pertain to the specific `location` that is being searched for.

```graphql
  type Query {
    authUrl: String!
    user(id: ID!): User!
    listing(id: ID!): Listing!
    listings(
      location: String
      filter: ListingsFilter!
      limit: Int!
      page: Int!
    ): Listings!
  }
```

### `src/graphql/resolvers/Listing/index.ts`

In the `listings()` resolver function within the `listingResolvers` map, we check to see if the `location` argument has been provided. If `location` exists, we determine the `country`, `admin`, and `city` of the location being searched for by using Google's [Geocoding API](https://developers.google.com/maps/documentation/geocoding/start). When the geocoded information of the location is determined, we query for the listings in the `"listings"` collection that have the `country`, `admin`, and/or `city` of the location being searched for.

```ts
    listings: async (
      _root: undefined,
      { location, filter, limit, page }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<ListingsData> => {
      try {
        const query: ListingsQuery = {};
        const data: ListingsData = {
          region: null,
          total: 0,
          result: []
        };

        if (location) {
          const { country, admin, city } = await Google.geocode(location);

          if (city) query.city = city;
          if (admin) query.admin = admin;
          if (country) {
            query.country = country;
          } else {
            throw new Error("no country found");
          }

          const cityText = city ? `${city}, ` : "";
          const adminText = admin ? `${admin}, ` : "";
          data.region = `${cityText}${adminText}${country}`;
        }

        let cursor = await db.listings.find(query);

        if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
          cursor = cursor.sort({ price: 1 });
        }

        if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
          cursor = cursor.sort({ price: -1 });
        }

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listings: ${error}`);
      }
    }
  },
```

### `src/lib/api/Google.ts`

In the `Google` object instance within the `src/lib/api/Google.ts` file, we've introduced a `geocode()` function that runs the Geocoding API from Google Maps services.

```ts
export const Google = {
  // ...
  geocode: async (address: string) => {
    const res = await maps.geocode({ address }).asPromise();

    if (res.status < 200 || res.status > 299) {
      throw new Error("failed to geocode address");
    }

    return parseAddress(res.json.results[0].address_components);
  }
};
```

Before the geocoded results are returned, we parse the information returned from the geocoder to get the `country`, `admin`, and `city` information of the location.

```ts
const parseAddress = (addressComponents: AddressComponent[]) => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    if (component.types.includes("country")) {
      country = component.long_name;
    }

    if (component.types.includes("administrative_area_level_1")) {
      admin = component.long_name;
    }

    if (component.types.includes("locality") || component.types.includes("postal_town")) {
      city = component.long_name;
    }
  }

  return { country, admin, city };
};
```

## Client Project

### `src/lib/graphql/queries/Listings/index.ts`

In the client, we update the `Listings` GraphQL document to accept an optional `location` argument.

```ts
import { gql } from "apollo-boost";

export const LISTINGS = gql`
  query Listings($location: String, $filter: ListingsFilter!, $limit: Int!, $page: Int!) {
    listings(location: $location, filter: $filter, limit: $limit, page: $page) {
      region
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
`;
```

### `src/sections/Listings/index.tsx`

In the `<Listings />` component rendered in the `/listings/:location?` route, we construct the listings page which involves but is not limited to:

-   Making the `listings` query when the component first mounts and providing a `location` argument when the `location` URL parameter exists.
-   Displaying a paginated list of listings with each listing presented through a `<ListingCard />` component.
-   Providing the user the capability to change the filter value in the query within a child `<ListingsFilters />` component.
-   Providing the user the capability to change the page value in the query within a child `<ListingsPagination />` component.

Appropriate loading and error state UI is also presented when the `listings` query is in the loading or error state. When data is available from the query, the relevant information is shown to the user.

```tsx
export const Listings = ({ match }: RouteComponentProps<MatchParams>) => {
  const locationRef = useRef(match.params.location);
  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const [page, setPage] = useState(1);

  const { loading, data, error } = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    skip: locationRef.current !== match.params.location && page !== 1,
    variables: {
      location: match.params.location,
      filter,
      limit: PAGE_LIMIT,
      page
    }
  });

  useEffect(() => {
    setPage(1);
    locationRef.current = match.params.location;
  }, [match.params.location]);

  if (loading) {
    return (
      <Content className="listings">
        <ListingsSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="We either couldn't find anything matching your search or have encountered an error. If you're searching for a unique location, try searching again with more common keywords." />
        <ListingsSkeleton />
      </Content>
    );
  }

  const listings = data ? data.listings : null;
  const listingsRegion = listings ? listings.region : null;

  const listingsSectionElement =
    listings && listings.result.length ? (
      <div>
        <Affix offsetTop={64}>
          <ListingsPagination
            total={listings.total}
            page={page}
            limit={PAGE_LIMIT}
            setPage={setPage}
          />
          <ListingsFilters filter={filter} setFilter={setFilter} />
        </Affix>
        <List
          grid={{
            gutter: 8,
            xs: 1,
            sm: 2,
            lg: 4
          }}
          dataSource={listings.result}
          renderItem={listing => (
            <List.Item>
              <ListingCard listing={listing} />
            </List.Item>
          )}
        />
      </div>
    ) : (
      <div>
        <Paragraph>
          It appears that no listings have yet been created for{" "}
          <Text mark>"{listingsRegion}"</Text>
        </Paragraph>
        <Paragraph>
          Be the first person to create a <Link to="/host">listing in this area</Link>!
        </Paragraph>
      </div>
    );

  const listingsRegionElement = listingsRegion ? (
    <Title level={3} className="listings__title">
      Results for "{listingsRegion}"
    </Title>
  ) : null;

  return (
    <Content className="listings">
      {listingsRegionElement}
      {listingsSectionElement}
    </Content>
  );
};
```

### Compound index

In the MongoDB Atlas dashboard, we've created a **compound index** for the `country`, `admin`, and `city` fields for the documents in our `"listings"` collection. This is to help support the more efficient execution of queries in the `"listings"` collection when listing documents are to be found for a certain `country`, `admin`, and `city`.

## Moving forward

In the next module, we move towards explaining how we are to accept payments in our application with Stripe and we'll build out the mutations necessary for a user to **connect with Stripe**.
