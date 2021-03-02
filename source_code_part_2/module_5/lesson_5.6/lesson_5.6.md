# Module 5 Summary

> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we build on top of the previous module to help conduct persistent login sessions in our application with the help of cookies 🍪.

## Server Project

### `src/index.ts`

In the root `src/index.ts` file of our server project, we import and use the [**`cookie-parser`**](https://github.com/expressjs/cookie-parser) library as middleware to help populate `req`'s made to the server with an object keyed by the cookie names.

In our `ApolloServer` constructor, we pass in the `req` and `res` objects for every request made as context to be accessible by all our GraphQL resolver functions.

```ts
require("dotenv").config();

import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";

const mount = async (app: Application) => {
  const db = await connectDatabase();

  app.use(cookieParser(process.env.SECRET));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ db, req, res })
  });

  server.applyMiddleware({ app, path: "/api" });
  app.listen(process.env.PORT);

  console.log(`[app] : http://localhost:${process.env.PORT}`);
};

mount(express());
```

### `src/graphql/resolvers/Viewer/index.ts`

In the `viewerResolvers` map, we construct the options of the cookie we'll want to set with the help of the `cookie-parser` library.

```ts
const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV === "development" ? false : true
};
```

In the utility `logInViaGoogle()` function and once the user has successfully logged in, we set a new cookie labeled `viewer` which is provided with the `id` value of the user who has logged in. We introduce one other cookie option to state the maximum age of the cookie (i.e. the expiry time) is one year.

```ts
const logInViaGoogle = async (
  // ...
  res.cookie("viewer", userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000
  });
  // ...
};
```

In our `logIn()` mutation resolver, we call another utility function labeled `logInViaCookie()` which is to be executed when the `logIn` mutation is fired and an authorization code is not present as part of the mutation input.

```ts
  logIn: async (
// ...
      const viewer: User | undefined = code
        ? await logInViaGoogle(code, token, db, res)
        : await logInViaCookie(token, db, req, res);
// ...
  },
```

In the utility `logInViaCookie()` function, we attempt to find a user document in the `"users"` collection where the user `_id` is equal to the value of the `viewer` cookie that was registered when the user first logs in with Google Sign-In.

```ts
const logInViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response
): Promise<User | undefined> => {
  const updateRes = await db.users.findOneAndUpdate(
    { _id: req.signedCookies.viewer },
    { $set: { token } },
    { returnOriginal: false }
  );

  let viewer = updateRes.value;

  if (!viewer) {
    res.clearCookie("viewer", cookieOptions);
  }

  return viewer;
};
```

In the `logOut()` resolver function, we make sure to remove (i.e. clear) the `viewer` cookie if it exists in the request.

```ts
logOut: (
  _root: undefined,
  _args: {},
  { res }: { res: Response }
): Viewer => {
  try {
    res.clearCookie("viewer", cookieOptions);
    return { didRequest: true };
  } catch (error) {
    throw new Error(`Failed to log out: ${error}`);
  }
}
```

### `src/lib/utils/index.ts`

Within the `src/lib/utils/index.ts` file, we've introduced a function labeled `authorize()` that aims to find information on the `viewer` making the request which helps prevents any CSRF attacks when sensitive information is being persisted and/or requested. The `authorize()` function looks to find the viewer document in the `"users"` collection from the `viewer` cookie available in the request **and** an `X-CSRF-TOKEN` value available in the request header options.

```ts
import { Request } from "express";
import { Database, User } from "../types";

export const authorize = async (db: Database, req: Request): Promise<User | null> => {
  const token = req.get("X-CSRF-TOKEN");
  const viewer = await db.users.findOne({
    _id: req.signedCookies.viewer,
    token
  });

  return viewer;
};
```

## Client Project

### `src/index.tsx`

In the root `<App />` component of our client project, we've stated that whenever the `<App />` component is to render - the `logIn` mutation will be triggered attempting to log the user in based on the presence of the `viewer` cookie. When the user successfully logs-in with a cookie, we set the value of the Viewer `token` returned from the server as `sessionStorage`.

```tsx
  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: data => {
      if (data && data.logIn) {
        setViewer(data.logIn);

        if (data.logIn.token) {
          sessionStorage.setItem("token", data.logIn.token);
        } else {
          sessionStorage.removeItem("token");
        }
      }
    }
  });
```

When the user logs-in with Google in the `<Login />` component, we also set the `token` value obtained there to `sessionStorage`. If the user logs-out from the `<MenuItems />` of `<AppHeader />`, we **clear the `token` value in `sessionStorage`**.

The `token` value in `sessionStorage` is what we pass as the `X-CSRF-TOKEN` value in the header options of all our requests to the server.

```tsx
const client = new ApolloClient({
  uri: "/api",
  request: async operation => {
    const token = sessionStorage.getItem("token");
    operation.setContext({
      headers: {
        "X-CSRF-TOKEN": token || ""
      }
    });
  }
});
```

## Moving forward

In the next module, we begin building the server and client implementation that will help allow us to retrieve and display information for users in the `/user/:id` route of our application.
