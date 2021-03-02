# Module 4 Summary

> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we spent our efforts in creating the functionality to have a user log-in through Google Sign-In.

## Server Project

### `src/lib/api/Google.ts`

In the `src/lib/api/Google.ts` file of our server project, we created a `Google` object instance that consolidates the functionality to interact with Google's servers. In the `src/lib/api/Google.ts` file, we constructed an OAuth client with the help of the [**Google APIs Node.js Client**](https://github.com/googleapis/google-api-nodejs-client). Within the `Google` object we export from the file, there exist two properties:

-   `authUrl`: Derives the authentication URL from Google's servers where users are directed to on the client to first sign-in with their Google account information.
-   `logIn()`: Function that uses Google's [People API](https://developers.google.com/people/quickstart/nodejs) to get relevant information (i.e. their emails, names, and photos) for the Google account of a user.

```ts
import { google } from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
);

export const Google = {
  authUrl: auth.generateAuthUrl({
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_type: "online",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  }),
  logIn: async (code: string) => {
    const { tokens } = await auth.getToken(code);

    auth.setCredentials(tokens);

    const { data } = await google.people({ version: "v1", auth }).people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos"
    });

    return { user: data };
  }
};
```

### `src/graphql/typeDefs.ts`

We created three new root-level fields in our GraphQL API.

-   `Query.authUrl`: Returns a string and is expected to return the Google Sign-In/OAuth authentication URL.
-   `Mutation.logIn`: Returns a `Viewer` object and is expected to log a viewer into the TinyHouse application.
-   `Mutation.logOut`: Returns a `Viewer` object and is expected to log a viewer out of the TinyHouse application.

```ts
import { gql } from "apollo-server-express";

export const typeDefs = gql`
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
  }

  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
  }
`;
```

### `src/graphql/resolvers/Viewer/index.ts`

The resolver functions for the three new root-level fields in our API were established in a `viewerResolvers` map kept within the `src/lib/graphql/resolvers/Viewer/index.ts` file.

The `authUrl()` resolver function simply returns the value of the `authUrl` field in our `Google` instance created in the `src/lib/api/Google.ts` file.

The `logIn()` resolver function receives a `code` parameter from the `input` argument provided to the `logIn` mutation. A random `token` is generated which will be used to help prevent [CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF). We then interact with Google's [People API](https://developers.google.com/people/quickstart/nodejs) to derive the information of the user signing-in with Google. If the user is logging in to our TinyHouse application for the first time, we insert a new user document to the `"users"` collection of our database. If the user already exists, we update the information of the relevant document in the `"users"` collection.

The `logOut()` resolver function simply returns a `Viewer` object to the client with the `didRequest` field set to `true` to convey that the updated viewer information has been requested. At this moment, `logOut()` doesn't achieve much. In the next module, we'll have `logOut` involve removing persistent log-in sessions.

```ts
import crypto from "crypto";
import { IResolvers } from "apollo-server-express";
import { Google } from "../../../lib/api";
import { Viewer, Database, User } from "../../../lib/types";
import { LogInArgs } from "./types";

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }

  // Name/Photo/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length
      ? user.emailAddresses
      : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList &&
    userNamesList[0].metadata &&
    userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;

  // User Avatar
  const userAvatar =
    userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

  // User Email
  const userEmail =
    userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

  if (!userId || !userName || !userAvatar || !userEmail) {
    throw new Error("Google login error");
  }

  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token
      }
    },
    { returnOriginal: false }
  );

  let viewer = updateRes.value;

  if (!viewer) {
    const insertResult = await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: []
    });

    viewer = insertResult.ops[0];
  }

  return viewer;
};

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (error) {
        throw new Error(`Failed to query Google Auth Url: ${error}`);
      }
    }
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString("hex");

        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db)
          : undefined;

        if (!viewer) {
          return { didRequest: true };
        }

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true
        };
      } catch (error) {
        throw new Error(`Failed to log in: ${error}`);
      }
    },
    logOut: (): Viewer => {
      try {
        return { didRequest: true };
      } catch (error) {
        throw new Error(`Failed to log out: ${error}`);
      }
    }
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    }
  }
};
```

## Client Project

### `src/index.tsx`

In the root `<App />` component of our client project, we've created a `viewer` state object to represent the viewer who is to navigate and sign-in within our application.

```tsx
const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  // ...
};
```

### `src/lib/graphql/`

We created the GraphQL documents for the three root-level fields that exist in our GraphQL API.

```ts
import { gql } from "apollo-boost";

export const AUTH_URL = gql`
  query AuthUrl {
    authUrl
  }
`;
```

```ts
import { gql } from "apollo-boost";

export const LOG_IN = gql`
  mutation LogIn($input: LogInInput) {
    logIn(input: $input) {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
```

```ts
import { gql } from "apollo-boost";

export const LOG_OUT = gql`
  mutation LogOut {
    logOut {
      id
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
```

### `src/sections/Login/index.tsx`

We've constructed a `<Login />` component that is to be shown to the user when in the `/login` route of our app. The `<Login />` component is where we allow the user to sign-in with their Google account.

When the user is to click the `"Sign in with Google"` button, a manual query is made to retrieve the Google Sign-In authentication url and the user is then navigated to the url.

When the user signs-in with Google, they're redirected _back_ to the `<Login />` component with a value for the authorization `code` available in the URL as a query parameter. An effect is run in the `<Login />` component to retrieve the value of the `code` parameter and execute the `logIn` mutation. When the `logIn` mutation is successful the user is redirected to their `/user/:id` page.

```tsx
import React, { useEffect, useRef } from "react";
import { Redirect } from "react-router-dom";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import { Card, Layout, Spin, Typography } from "antd";
import { ErrorBanner } from "../../lib/components";
import { LOG_IN } from "../../lib/graphql/mutations";
import { AUTH_URL } from "../../lib/graphql/queries";
import {
  LogIn as LogInData,
  LogInVariables
} from "../../lib/graphql/mutations/LogIn/__generated__/LogIn";
import { AuthUrl as AuthUrlData } from "../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl";
import {
  displaySuccessNotification,
  displayErrorMessage
} from "../../lib/utils";
import { Viewer } from "../../lib/types";

// Image Assets
import googleLogo from "./assets/google_logo.jpg";

interface Props {
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient();
  const [
    logIn,
    { data: logInData, loading: logInLoading, error: logInError }
  ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: data => {
      if (data && data.logIn) {
        setViewer(data.logIn);
        displaySuccessNotification("You've successfully logged in!");
      }
    }
  });
  const logInRef = useRef(logIn);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      logInRef.current({
        variables: {
          input: { code }
        }
      });
    }
  }, []);

  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrlData>({
        query: AUTH_URL
      });
      window.location.href = data.authUrl;
    } catch {
      displayErrorMessage(
        "Sorry! We weren't able to log you in. Please try again later!"
      );
    }
  };

  if (logInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }

  if (logInData && logInData.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="Sorry! We weren't able to log you in. Please try again later!" />
  ) : null;

  return (
    <Content className="log-in">
      {logInErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Log in to TinyHouse!
          </Title>
          <Text>Sign in with Google to start booking available rentals!</Text>
        </div>
        <button
          className="log-in-card__google-button"
          onClick={handleAuthorize}
        >
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">
            Sign in with Google
          </span>
        </button>
        <Text type="secondary">
          Note: By signing in, you'll be redirected to the Google consent form
          to sign in with your Google account.
        </Text>
      </Card>
    </Content>
  );
};
```

### `<MenuItems />` `logOut()`

In the `<MenuItems />` section of the `<AppHeader />`, we provide the user the capability to log-out which triggers the `logOut` mutation in our GraphQL API.

```tsx
import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { Avatar, Button, Icon, Menu } from "antd";
import { LOG_OUT } from "../../../../lib/graphql/mutations";
import { LogOut as LogOutData } from "../../../../lib/graphql/mutations/LogOut/__generated__/LogOut";
import { displaySuccessNotification, displayErrorMessage } from "../../../../lib/utils";
import { Viewer } from "../../../../lib/types";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: data => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        displaySuccessNotification("You've successfully logged out!");
      }
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! We weren't able to log you out. Please try again later!"
      );
    }
  });

  const handleLogOut = () => {
    logOut();
  };

  const subMenuLogin =
    viewer.id && viewer.avatar ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key="/user">
          <Link to={`/user/${viewer.id}`}>
            <Icon type="user" />
            Profile
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogOut}>
            <Icon type="logout" />
            Log out
          </div>
        </Item>
      </SubMenu>
    ) : (
      <Item>
        <Link to="/login">
          <Button type="primary">Sign In</Button>
        </Link>
      </Item>
    );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <Icon type="home" />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};
```

## Moving forward

The `logOut` graphQL mutation doesn't achieve anything significant and simply returns an empty `viewer` object. If we were to ever refresh our app when logged in, **our login state in the client is gone**. In the next coming modules, we'll see how we can resolve both of these concerns by allowing a viewer to maintain a _persistent_ login state in our application.
