<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 6 | Building the User Page

#### 1. Pagination is the process of dividing a large list of data into smaller discrete chunks to improve application perfromance.

**A**: True
**B**: False

**Answer**: A - True. Imagine a user is able to query for millions of documents/results for a certain list. Such a query would take an extremely long time to process. Pagination is often used in these situations to break down what the user is able to query and see.

#### 2. Which of the following is not an example of a form of pagination that can be implemented in a GraphQL API.

**A**: Offset-based pagination
**B**: Infinite-scroll pagination
**C**: Cursor-based pagination
**D**: Relay cursor-based pagination

**Answer**: B - Infinite-scroll pagination. Infinite-scroll is purely client-side UI where a user is able to query more data (i.e. visit more "pages") by simply scrolling down the screen.

#### 3. What happens when a user visits the `/user/:id` route where the `id` URL parameter doesn't match that of a user in our app?

**A**: The user is automatically redirected to the homepage.
**B**: The user remains where they are and an error pop-up is shown.
**C**: The user is taken to the `/user/:id` route and is presented with a blank screen.
**D**: The user is taken to the `/user/:id` route where the `user` query is made and then eventually errors. At this point, the user is presented with the loading skeleton and an error banner notifying the user of the error.

**Answer**: D - The user is taken to the `/user/:id` route where the `user` query is made and then eventually errors. At this point, the user is presented with the loading skeleton and an error banner notifying the user of the error.

#### 4. In our React project, How do we pass the obtained query data to child components that are rendered in the `<User />` component?

**A**: With state.
**B**: With props.
**C**: With the Context API.
**D**: With the help of the `useReducer()` Hook.

**Answer**: B - With props.

#### 5. Why have we introduced an `authorized` field in the `user` object of our `userResolvers` map?

**A**: It is used in the resolver functions of the `User` GraphQL object to determine whether a user has the authorization to resolve certain fields.
**B**: To match the field in the documents stored in the `"users"` collection of our database.
**C**: To follow GraphQL & Apollo best practices by having an `authorized` field in all custom GraphQL objects.
**D**: To avoid errors from the `cookie-parser` package.

**Answer**: A - It is used in the resolver functions of the `User` GraphQL object to determine whether a user has the authorization to resolve certain fields.
