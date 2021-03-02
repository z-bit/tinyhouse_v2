# Apollo Client & FetchPolicy

> The Apollo Client documentation on the different `fetchPolicy` options can be found - [here](https://www.apollographql.com/docs/react/api/react-apollo/#optionsfetchpolicy).<br />
> The Apollo Client documentation on interacting with cached data directly can be found - [here](https://www.apollographql.com/docs/react/caching/cache-interaction/).

Apollo Client doesn't only give us useful methods to conduct data fetching but sets up an [**in-memory intelligent cache without any configuration on our part**](https://www.apollographql.com/docs/react/why-apollo/#zero-config-caching).

When we make requests to retrieve data with Apollo Client, Apollo Client under the hood **caches the data**. The next time we return to the page that we've just visited, Apollo Client is smart enough to say - "Hey, we already have this data in the cache. Let's just provide the data from the cache directly without needing to make another request to the server". This saves time and helps avoid the unnecessary re-request of data from the server that _we've already requested before_.

Are there ways we can tell Apollo Client to force the request from the network and not from the cache, and would we ever want to do this? We can investigate two cases in our application where this might be helpful.

#### Case #1

The homepage of our app displays the highest priced listings available everywhere in our app. If we were to create a new listing to have the highest price and navigate straight to the homepage, **we may not see the newly created listing until we refresh the page to make a network request**.

To avoid this, we can add the `fetchPolicy` option in our query being made in the `<Home />` component with a value of `"cache-and-network"`. The `"cache-and-network"` option will have Apollo first try and read data from the cache **and** helps make a query automatically execute with the network to get the latest information. As the [Apollo Documentation](https://www.apollographql.com/docs/react/api/react-apollo/#optionsfetchpolicy) states - "[the `"cache-and-network"` option] optimizes for users getting a quick response while also trying to keep cached data consistent with your server data at the cost of extra network requests.".

By adding the `fetchPolicy: "cache-and-network"` option to the query made in the `<Home />` component, at any time we visit the homepage from another location - a network request will be made to get the latest information on the highest priced listings.

```tsx
  const { loading, data } = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    variables: {
      filter: ListingsFilter.PRICE_HIGH_TO_LOW,
      limit: PAGE_LIMIT,
      page: PAGE_NUMBER
    },
    fetchPolicy: "cache-and-network"
  });
```

#### Case #2

The user page, shown in the `/user/:id` route, displays the listings a user is to own. If we were to create a new listing in the `/host` route and directly navigate to our user page, we may need to make a page refresh to have a network request be made to show the newly created listing in the listings section.

To avoid this, we can similarly add the `fetchPolicy: "cache-and-network"` option to the query made in the `<User />` component.

```tsx
  const { data, loading, error, refetch } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id,
      bookingsPage,
      listingsPage,
      limit: PAGE_LIMIT
    },
    fetchPolicy: "cache-and-network"
  });
```

Among other things, Apollo Client also provides the capability to [directly update the cache](https://www.apollographql.com/docs/react/caching/cache-interaction/) or use a [`refetchQueries`](https://www.apollographql.com/docs/react/api/react-apollo/#optionsrefetchqueries) option to update the data from certain queries right after a mutation has been made. All of these options lead to ensuring users see the **most up-to-date** information on the client and they differ from one other based on simplicity, efficiency, and the general user experience.

> **Note:** We've built a single-page application where the server returns the entire web bundle on initial load. Apollo Client provides extra techniques to have a server-side rendered application load quickly and present data as fast as possible. You can read more about this [here](https://www.apollographql.com/docs/react/performance/server-side-rendering/).
