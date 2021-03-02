# Module 8 Summary

I> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
I> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we build the functionality to have the client be able to query for a list of listings.

## Server Project

### `src/graphql/typeDefs.ts`

We created a single root-level `listings` field that can be queried from the client to receive the information for a list of listings. The `listing` query field returns a collection of listings that satisfies three input arguments:

-   `limit`: The amount of listing objects to be returned for a single page.
-   `page`: The page (i.e. subset) of listing objects to be returned from the `"listings"` collection.
-   `filter`: The filter (i.e. sort) to be applied to the list of listings returned.

```graphql
  type Query {
    authUrl: String!
    user(id: ID!): User!
    listing(id: ID!): Listing!
    listings(filter: ListingsFilter!, limit: Int!, page: Int!): Listings!
  }
```

The `ListingsFilter` Enum determines the different filter values that can be applied to the `listings` query field. We've established two separate filter values:

-   `PRICE_LOW_TO_HIGH`: To sort the listings from the lowest price to the highest price.
-   `PRICE_HIGH_TO_LOW`: To sort the listings from the highest price to the lowest price.

```ts
  enum ListingsFilter {
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
  }
```

### `src/graphql/resolvers/Listing/index.ts`

In the `listingResolvers` map in the `src/graphql/resolvers/Listing/index.ts` file, we created the root-level query `listings()` resolver function to find a paginated list of listings from the `"listings"` collection based on the argument values provided.

```ts
    listings: async (
      _root: undefined,
      { filter, limit, page }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<ListingsData> => {
      try {
        const data: ListingsData = {
          total: 0,
          result: []
        };

        let cursor = await db.listings.find({});

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
```

## Client Project

### `src/lib/graphql/queries/Listings/index.ts`

In the client, we constructed the `Listings` GraphQL document in the `src/lib/graphql/queries/Listings/index.ts` file.

```ts
import { gql } from "apollo-boost";

export const LISTINGS = gql`
  query Listings($filter: ListingsFilter!, $limit: Int!, $page: Int!) {
    listings(filter: $filter, limit: $limit, page: $page) {
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

### `src/sections/Home/index.tsx`

In the `<Home />` component rendered in the `/` route, we construct the homepage which involves but is not limited to:

-   Making the `listings` query when the component first mounts.
-   Presenting the list of highest priced listings in the `<HomeListings />` child component.
-   Presenting the `<HomeHero />` component which contains the search input that helps navigate the user to the `/listings` route of our application.

```tsx
export const Home = ({ history }: RouteComponentProps) => {
  const { loading, data } = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    variables: {
      filter: ListingsFilter.PRICE_HIGH_TO_LOW,
      limit: PAGE_LIMIT,
      page: PAGE_NUMBER
    }
  });

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`);
    } else {
      displayErrorMessage("Please enter a valid search!");
    }
  };

  const renderListingsSection = () => {
    if (loading) {
      return <HomeListingsSkeleton />;
    }

    if (data) {
      return <HomeListings title="Premium Listings" listings={data.listings.result} />;
    }

    return null;
  };

  return (
    <Content className="home" style={{ backgroundImage: `url(${mapBackground})` }}>
      <HomeHero onSearch={onSearch} />

      <div className="home__cta-section">
        <Title level={2} className="home__cta-section-title">
          Your guide for all things rental
        </Title>
        <Paragraph>
          Helping you make the best decisions in renting your last minute locations.
        </Paragraph>
        <Link
          to="/listings/united%20states"
          className="ant-btn ant-btn-primary ant-btn-lg home__cta-section-button"
        >
          Popular listings in the United States
        </Link>
      </div>

      {renderListingsSection()}

      <div className="home__listings">
        <Title level={4} className="home__listings-title">
          Listings of any kind
        </Title>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Link to="/listings/san%20fransisco">
              <div className="home__listings-img-cover">
                <img
                  src={sanFransiscoImage}
                  alt="San Fransisco"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link to="/listings/cancún">
              <div className="home__listings-img-cover">
                <img src={cancunImage} alt="Cancún" className="home__listings-img" />
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </Content>
  );
};
```

## Moving forward

In the next module, we build on what we've achieved in this module by building the capability to have a list of listings be queried for **a certain location**.
