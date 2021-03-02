---
title: Apollo React Testing
description: In this lesson, we'll talk about one other minor testing utility we'll use to help mock GraphQL requests in our tests - Apollo React Testing.
privateVideoUrl: https://fullstack.wistia.com/medias/pdjvjgnc23
---

# Apollo React Testing

In this lesson, we'll spend a few minutes talking about one other testing utility we'll use in our testing suite and that is the [@apollo/react-testing](https://www.apollographql.com/docs/react/api/react-testing/) library.

In our client application, a large number of React components interact with our GraphQL API to query or mutate data. Many section components in our application would make a query to retrieve information for a certain route. As an example, the `Listings` component queries for a series of listings to display in the `listings/:location` route of our app.

```jsx
export const Listings = () => {
  const { loading, data, error } = useQuery(LISTINGS, {
    /* ... */
  });

  if (loading) {
    /* return loading indicator */
  }

  if (error) {
    /* return error message */
  }

  // return component UI with data from query
};
```

If we were to attempt to render the above component in a unit test, the unit test would most likely fail since it would have no context or understanding of the API query being made _or_ the results from the query (`loading`, `data`, `error`, etc.).

This is where the `@apollo/react-testing` library comes in.

## MockedProvider

`@apollo/react-testing` provides a test utility labeled [MockedProvider](https://www.apollographql.com/docs/react/api/react-testing/#mockedprovider) that allows us to create a mocked version of `ApolloProvider` (the root level provider component that wraps our React app and provides the Apollo client as context throughout the app).

```js
import { MockedProvider } from "@apollo/react-testing";
```

`MockedProvider` helps allow us to specify the _exact_ response we would want from our GraphQL requests in our tests (i.e. it helps allow us to _mock_ GraphQL requests). Additionally, `MockedProvider` allows us to mock our GraphQL requests **without actually making network requests to the API**.

With the `MockedProvider` utility, we're able to mock GraphQL requests in the loading, error, and success states.

### Loading State

To mock GraphQL requests in the loading state, we can wrap our components with the `MockedProvider` utility component and provide an empty array as the value of the `mocks` prop of `MockedProvider`.

```jsx
it("renders the expected loading state", async () => {
  const {
    /* get query helpers*/
  } = render(
    <MockedProvider mocks={[]}>
      <Listings></Listings>
    </MockedProvider>
  );

  // ...
});
```

### Error State

To mock GraphQL requests in the error state, we can wrap our components with the `MockedProvider` utility component and provide a mock `request` and `error` (or `errors`) property values in the mock GraphQL object.

```jsx
it('renders the expected error state', async () => {
  const listingsMock = {
    request: {
      query: LISTINGS,
      variables: /* ... */
    },
    error: new Error('Network Error!'),
  };

  const { /* queries */ } = render(
    <MockedProvider mocks={[listingsMock]}>
      <Listings></Listings>
    </MockedProvider>,
  );

  // ...
});
```

### Success State

To mock GraphQL requests in the success state, we can wrap our components with the `MockedProvider` utility component and provide mock `request` and `result` object property values in the mock GraphQL object.

```jsx
it('renders the expected UI when data is available', async () => {
  const listingsMock = {
    request: {
      query: LISTINGS,
      variables: /* ... */
    },
    result: {
      data: {
        listings: {
          region: 'Toronto, Ontario, Canada',
          total: 1,
          result: [{ /* ... */ }],
        },
      },
    },
  };

  const { /* queries */ } = render(
    <MockedProvider mocks={[listingsMock]}>
      <Listings></Listings>
    </MockedProvider>,
  );

  // ...
});
```

### GraphQL requests are asynchronous

GraphQL API requests are **asynchronous**. As a result, we'll often need to specify in our tests that we need to _wait_ for the request to complete before we make the assertions we look to do. With React Testing Library, we can achieve this with the help of the [waitFor](https://testing-library.com/docs/dom-testing-library/api-async#waitfor) utility.

The `waitFor` utility can be used in a unit test where an API call is being mocked and we need to wait for the mocked promises to resolve. A unit test with the use of the `waitFor` utility can look something like this:

```jsx
import { render, waitFor } from "@testing-library/react";

it("renders the expected UI when data is available", async () => {
  const listingsMock = {
    /* ... */
  };

  const { queryByText } = render(
    <MockedProvider mocks={[listingsMock]}>
      <Listings></Listings>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(queryByText("Filter By")).not.toBeNull();
  });
});
```
