<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 4 | User Authentication with Google Sign-In & OAuth 2.0

#### 1. OAuth is an open industry-standard authorization protocol that enables applications to obtain limited access to user accounts. OAuth helps achieve this by using:

**A**: Passwords
**B**: Encrypted passwords
**C**: Authorization tokens
**D**: Cookies

**Answer**: C - Authorization tokens. OAuth doesn’t share passwords but instead uses authorization tokens to prove identities.

#### 2. Once a user successfully provides the TinyHouse application access to their Google account, the application can now act on behalf of the user to use all and every service that exists in Google.

**A**: True
**B**: False

**Answer**: B - False. Google will limit access to the application to only the scope the application requests. For example, if a user only grants access to their email and profile picture then the applicaiton can only access the user's email and profile picture. Any attempt to use other Google services (e.g. the user's calendar) will fail.

#### 3. At what point in time do we fire the `logIn` mutation in the client?

**A**: When the user clicks the `"Sign in with Google"` button in the `/login` page.
**B**: When the `/login` page first renders.
**C**: When the `/login` page renders and an authorization `code` exists as a query parameter of the URL.
**D**: When the user clicks the `"Sign In"` button in the app header.

**Answer**: C - When the `/login` page renders and an authorization `code` exists as a query parameter of the URL.

#### 4. What does the `useApolloClient` Hook do from React Apollo?

**A**: It provides access to the Apollo `client` instance.
**B**: It's another version of the `useQuery` Hook and runs a query when a component first mounts.
**C**: It can be used to create the Apollo configuration for a React application.
**D**: `useApolloClient` is not a Hook that React Apollo provides.

**Answer**: A - It provides access to the Apollo `client` instance.

#### 5. What does the `authUrl` query field in our API return when resolved successfully?

**A**: A URL of Google's homepage.
**B**: A boolean that represents the state of the user in our app (`true` - logged in | `false` - not logged in).
**C**: A URL that we use to direct the user to Google's documentation on Google Sign-In/OAuth.
**D**: An authentication URL from Google's servers where users can provide their account information and authorize our app.

**Answer**: D - An authentication URL from Google's servers where users are directed to and can provide their account information and authorize our app.

#### 6. Which of the following best describes the `onCompleted()` callback function result of the `useQuery` and `useMutation` Hooks of React Apollo?

**A**: `onCompleted()` is executed when the query/mutation successfully completes.
**B**: `onCompleted()` is executed when the query/mutation completes either successfully or with an error.
**C**: `onCompleted()` is executed only when the query/mutation is run a second time.
**D**: `onCompleted()` is executed the moment the query/mutation runs.

**Answer**: A - `onCompleted()` is executed when the query/mutation successfully completes.

#### 7. The `onError()` callback function result of the `useQuery` and `useMutation` Hooks allows us to specify how we want a component to handle network-related functionality.

**A**: True
**B**: False

**Answer**: B - False. The `onError()` callback function is executed in the event of a query/mutation error.
