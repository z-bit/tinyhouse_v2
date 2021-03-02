# Building the Authentication Resolvers

We've set up functions needed to interact with Google's Node.js Client to either generate an authentication URL or get user information for a user logging in. We'll now begin to establish our GraphQL schema and the resolvers for the fields our client application can interact with to handle this functionality.

We'll first modify our GraphQL schema and introduce some new type definitions.

We'll want the React client to pass a `code` argument to the `logIn` mutation to help conduct the login process in our server. Good convention often finds people specifying the arguments of a mutation within an `input` object. In the `src/graphql/typeDefs.ts` file, we'll create a new `input` object type to represent the input that can be passed into the `logIn` mutation. We'll label this `input` object type `LogInInput` and it is to contain a non-null `code` property of type GraphQL `String`.

```ts
  input LogInInput {
    code: String!
  }
```

We'll also state that the `logIn` mutation field is to accept an `input` argument of type `LogInInput`. Furthermore, we'll have the `logIn` mutation expect `input` as an _optional_ argument. This is because, in the next couple of lessons, we'll investigate how users will also be able to log-in with the presence of a request cookie.

When the `logIn` and `logOut` mutations resolve successfully, we'll expect them both to return a GraphQL object type we'll create shortly labeled `Viewer`.

```ts
import { gql } from "apollo-server-express";

export const typeDefs = gql`
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

### `Viewer` GraphQL Object Type

`Viewer` is an object that is to represent the actual person looking/using our app (i.e. the person _viewing_ our app). We'll create an object type to represent what a viewer object is to contain. It will have the following fields and corresponding field types:

- **`id: ID`** - a unique identifier since every user in our database is to have a unique id.

- **`token: String`** - a unique token value to help in countering [Cross-Site Request Forgery](https://developer.mozilla.org/en-US/docs/Glossary/CSRF), with which we'll learn more about in **Module 5**.

- **`avatar: String`** - the viewer's avatar image URL.

- **`hasWallet: Boolean`** - a `boolean` value to indicate if the viewer has connected to the payment processor in our app ([Stripe](https://stripe.com/)).

- **`didRequest: Boolean!`** - a `boolean` value to indicate if a request has been made from the client to obtain viewer information.

All the fields of the `Viewer` object type except for the `didRequest` field are optional. This is because the person viewing the app could be _logged out_, or doesn't have an account on our platform. In this case, we won't have any specific viewer information (`id`, `avatar`, etc.) but we'll still want our client to know that we did attempt to obtain viewer information. This is the reason as to why the `didRequest` field is a non-optional `Boolean`.

We'll get a better understanding of the purpose of these fields once we start to write more of our implementation. At this moment, the `src/graphql/typeDefs.ts` file of our server project will look like the following:

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

### `Viewer` TypeScript Interface

We'll now create the corresponding TypeScript definition for a `Viewer` object in our TypeScript code. We'll do this in the `lib/types.ts` file since the `Viewer` TypeScript type we'll create will be accessed in multiple parts of our server application.

The `Viewer` interface type we'll create in the `lib/types.ts` file will look very similar to the `Viewer` object type in our GraphQL schema with some minor differences such as:

- In our `Viewer` TypeScript interface, we'll label the identifying field as `_id` instead of `id` because we are to reference the same `_id` field from our MongoDB database in our TypeScript code. We'll only have the identifying field of the `Viewer` return as `id` in a soon to be created resolver function in the `Viewer` GraphQL object.
- In our `Viewer` TypeScript interface, we'll have a `walletId` field instead of `hasWallet` because `walletId` will be an actual `id` we'll get from our payment processor ([Stripe](https://stripe.com/)) and we'll store in our database. We won't need to pass this sensitive information to the client which is why we resolve it to the client as a `hasWallet` `boolean` field which is to be `true` if the viewer _has_ a `walletId` or `undefined` if viewer doesn't.

With that said, the `Viewer` TypeScript interface we'll create in the `lib/types.ts` file will look as follows:

```ts
export interface Viewer {
  _id?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}
```

### `Viewer` `id` and `hasWallet` resolvers

The `_id` and `walletId` conversion to `id` and `hasWallet` in our GraphQL schema will be done by creating resolver functions for the `Viewer` GraphQL object. If we recall, [trivial resolvers](https://graphql.org/learn/execution/#trivial-resolvers) often don't need to be declared when we simply attempt to return a value from an object argument using the same key specified in the object type (e.g. `id` -> `viewer.id`). In this case, however, we'll need to declare the resolver functions for the `id` and `hasWallet` fields for our GraphQL `Viewer` object type since we want to resolve these different fields.

We'll add the `id` and `hasWallet` resolver functions to a `Viewer` object we'll create in the `viewerResolvers` map within `src/graphql/resolvers/Viewer/index.ts`.

```ts
import { IResolvers } from "apollo-server-express";

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
  },
  Viewer: {
    id: () => {},
    hasWallet: () => {}
  }
};
```

Our `id` resolver function will take a `viewer` input argument and return the value of `viewer._id`. The `viewer` input argument will have the shape of the `Viewer` interface we've set up in the `lib/types.ts` so we'll import the `Viewer` interface and set it as the type of the `viewer` argument.

```ts
import { IResolvers } from "apollo-server-express";
import { Viewer } from "../../../lib/types";

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: () => {}
  }
};
```

> Where is this `viewer` input argument coming from? **The first positional argument of resolver functions will always be the root object returned from the _parent_ fields**. In this example, the parent `logIn` and `logOut` mutations will return the viewer object when resolved, and the resolver functions we define in the `Viewer` receives this viewer object and maps the data as we expect in our GraphQL schema.

The Viewer `hasWallet` resolver function will receive the `viewer` input argument and return `true` if the viewer `walletId` exists. Otherwise, we'll have it return `undefined`.

```ts
import { IResolvers } from "apollo-server-express";
import { Viewer } from "../../../lib/types";

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
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

> We could also have the `hasWallet()` resolver function just return `boolean` values of `true` or `false`.

### `Query.authUrl`

With the `Viewer` object defined in our TypeScript code and GraphQL schema, we'll now modify the `authUrl()` query resolver function to return the `authUrl` from the `Google` object we've created in our `lib/api/` folder.

In the `src/graphql/resolvers/Viewer/index.ts` file, we'll import the `Google` object. In the `authUrl()` resolver function of the `Query` object, we'll use a [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) pattern to have the field simply return the `authUrl` field of our `Google` API object or throw an error.

```ts
import { IResolvers } from "apollo-server-express";
import { Google } from "../../../lib/api";

export const viewerResolver: IResolvers = {
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
    // ...
  },
  Viewer: {
    // ...
  }
};
```

### `Mutation.logIn` resolver

We'll now modify the resolver function for the root level `logIn` mutation. The `logIn` mutation is to expect an `input` that contains a `code` property. We'll define a TypeScript interface type to describe the shape of the arguments the `logIn` mutation is to expect. We'll define this interface in a `types.ts` we'll keep in the `src/graphql/resolvers/Viewer/` folder.

```shell
server/
  src/
    graphql/
      resolvers/
        Viewer/
          index.ts
          types.ts
      // ...
    // ...
```

We'll name the interface to describe the shape of arguments the `logIn` mutation is to accept `LogInArgs` and it will have an `input` property that is to be an object that has a `code` of type `string`. Since this `input` property is optional, we'll say the input object might also be `null`.

```ts
export interface LogInArgs {
  input: { code: string } | null;
}
```

We'll head back to the `viewerResolvers` map and look to build the implementation for the `logIn()` resolver function.

The `logIn` mutation will be fired in one of two cases:

- Where the viewer signs-in with the Google authentication url and consent screen.
- Where the viewer signs-in with their cookie session.

In this lesson, we'll only focus on the former case of a viewer being able to sign-in by going through the Google authentication/consent screen. In the `logIn()` resolver function, we'll look to access the `input` argument and `db` object available as context. We'll import the `LogInArgs` and `Database` interfaces to describe the shape of the `input` and `db` parameters respectively.

When the `logIn()` mutation resolver function is to resolve successfully, it'll return a `Promise` that when resolved will be the `Viewer` object.

```ts
import { IResolvers } from "apollo-server-express";
import { Google } from "../../../lib/api";
import { Viewer, Database } from "../../../lib/types";
import { LogInArgs } from "./types";

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {}
    // ...
  },
  Viewer: {
    // ...
  }
};
```

The first thing we'll do in the `logIn()` resolver function is check for the presence of the `code` property within the `input` argument and set it a `const` of the same name. If it doesn't exist, we'll simply set the value of the `const` to `null`.

```ts
export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      const code = input ? input.code : null;
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

Next, we'll create a random string to use as a session token. We'll want this `token` string to be randomly generated every time a user is logged in and will be returned/sent to the client application. The client will eventually use this `token` on every request it intends to make with which we'll use to _authorize_ that the request is coming from a valid viewer to prevent [Cross-Site Request Forgery](https://developer.mozilla.org/en-US/docs/Glossary/CSRF) attacks. We're going to investigate this some more in the upcoming lessons but for now, we'll simply look to store this randomly generated token value in our database.

To do this, we'll use the [`crypto` module](https://nodejs.org/api/crypto.html) available in the Node ecosystem. The `crypto` module provides cryptographic functionality to help handle encrypted data. We'll import the `crypto` module and create a random hex string of 16 bytes and assign its value to a constant labeled `token`.

```ts
import crypto from "crypto";
// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      const code = input ? input.code : null;
      const token = crypto.randomBytes(16).toString("hex");
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

If the value for the `code` property in our `logIn()` resolver function exists (with which it will when the user has signed in via the Google authentication flow), we'll call a function that we'll shortly create called `logInViaGoogle()` and we'll pass the `code`, `token` and `db` values to this function. We'll assign the results of this function to a constant we'll call `viewer`.

```ts
// ...
import { Viewer, Database, User } from "../../../lib/types";
// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      const code = input ? input.code : null;
      const token = crypto.randomBytes(16).toString("hex");

      const viewer: User | undefined = code
        ? await logInViaGoogle(code, token, db)
        : undefined;
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

Though we're labeling the constant we've just created as `viewer`, we'll expect the `logInViaGoogle()` function to get the user information from Google's servers, store that information in the database, and **return the user document of the recently logged-in user**. As a result, we've specified the type of the `viewer` constant as `User` or `undefined`. The `logInViaGoogle()` function will return undefined if it is unable to get the appropriate user information or store that information in the database.

Before we implement the `logInViaGoogle()` function, we'll proceed and work through what the rest of the `logIn()` resolver function will do. We'll check if the `viewer` constant we've created doesn't have a value which would mean we weren't able to sign the user in and get the appropriate information for the viewer. If that's the case, we'll have our `logIn()` resolver function simply return an object with the `didRequest` field set to `true` so the client will recognize a request has been made and no viewer information was available.

```ts
// ...
import { Viewer, Database, User } from "../../../lib/types";
// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      const code = input ? input.code : null;
      const token = crypto.randomBytes(16).toString("hex");

      const viewer: User | undefined = code
        ? await logInViaGoogle(code, token, db)
        : undefined;

      if (!viewer) {
        return { didRequest: true };
      }
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

If the `viewer` returned from `logInViaGoogle()` does exist, we'll return the `viewer` data we'll get and we'll also state the value of the `didRequest` field to `true`.

We'll keep all of the work we've done in the `logIn()` resolver function within a `try` block and if any error was to occur, we'll throw an error with a custom message. With all the changes we've made, the `logIn()` resolver function will look as follows:

```ts
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
```

### `logInViaGoogle()`

To complete our `logIn()` resolver functionality, we'll need to build out the `logInViaGoogle()` function.

We'll create this function at the top of the file above our `viewerResolvers` map. The `logInViaGoogle()` function will receive `code` and `token` arguments of type `string` and a `db` object of interface type `Database`. When this asynchronous function is to be resolved successfully, we expect it to return a `Promise` that when resolved will return a `User` document from our `"users"` collection for the user that's just signed in. If unsuccessful it'll return a `Promise` of `undefined`.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {};
```

The first thing we'll do in the `logInViaGoogle()` function is call the `Google.logIn()` function we created within our `lib/api/` folder and we'll pass the `code` along. We'll destruct the `user` data from this function when it resolves successfully. If this user instance doesn't exist, we'll throw an error that says `"Google login error"`.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }
};
```

If the `user` is available, we can begin to access the fields from the `user` object we'll need, such as the user email, display name, and avatar. Unfortunately, Google returns the information we're looking for within an object that has _multiple_ levels of nested fields and information that's a little complicated to dig through. We're going to write a decent amount of code to verify the information we're looking for exists and we're able to get what we're looking for.

We'll first attempt to get the list of user names, photos, and emails.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }

  // Names/Photos/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;
};
```

From the list of usernames, we'll get the display name from the first user name.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }

  // Names/Photos/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;
};
```

From the list of usernames, we'll also get the user id of the first username as follows:

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }

  // Names/Photos/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;
};
```

We'll get the user avatar from the `url` field from the first item in the photos list.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }

  // Names/Photos/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;

  // User Avatar
  const userAvatar =
    userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;
};
```

Finally, we'll get the user email from the first email in the emails list.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }

  // Names/Photos/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;

  // User Avatar
  const userAvatar =
    userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

  // User Email
  const userEmail =
    userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;
};
```

If either the `userId`, `userName`, `userAvatar`, or `userEmail` constants we've set-up are unavailable - we'll throw an error that says `"Google login error"`.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error("Google login error");
  }

  // Names/Photos/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
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
};
```

There's a lot of code we've just written in the `logInViaGoogle()` function but the main takeaway is we're just trying to get the `id`, `name`, `avatar`, and `email` of the user signing in with Google OAuth.

Once we have this information about the user that has signed in. We'll first attempt to check if this user already exists in our database. If it does, we'll _update_ the user information in the database to the latest information we get from Google. Luckily there is a Mongo function called [`findOneAndUpdate()`](https://docs.mongodb.com/manual/reference/method/db.collection.findOneAndUpdate/) that can easily accomplish this task. We'll set up the function and assign the result to a constant we'll call `updateRes`.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  //
  // getting user information
  //

  const updateRes = await db.users.findOneAndUpdate();
};
```

In the first argument of `findOneAndUpdate()`, we'll pass `{ _id: userId }`. This is the filter object wherein the `findOneAndUpdate()` method, Mongo will select the first document that matches this parameter. In this instance, we want to find the user document where the document `_id` field matches the `userId` we've obtained from Google.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  //
  // getting user information
  //

  const updateRes = await db.users.findOneAndUpdate({ _id: userId });
};
```

In the second argument, we'll use the `$set` operator to specify _how_ we want to update the selected document. If we've found a document with the matching `_id`, we'll simply update the `name`, `avatar`, and `contact` fields of our document with the latest Google data. We'll also update the `token` field with the most recent randomly generated session token that's passed in as an argument to our `logInViaGoogle()` function.

And lastly, in the third argument, we'll specify `{ returnOriginal: false }` which just means we want to return the _updated_ document (not the original document) and assign the result to the `updateRes` constant we've set-up.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  //
  // getting user information
  //

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
};
```

If we weren't able to find an already existing user, we'll want to insert and add a _new_ user into our database. We can access the returned value from the value field of the `updateRes` object and if it doesn't exist, we'll look to insert a new document.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  //
  // getting user information
  //

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
    // insert a new user
  }
};
```

We'll use the [`insertOne()`](https://docs.mongodb.com/manual/reference/method/db.collection.insertOne/) function that Mongo provides to insert a new document to the `"users"` collection. `insertOne()` takes a document object and inserts it directly into the collection.

We'll want to insert a document that matches the setup for how a user document is to be shaped. We'll specify the `_id` , `token`, `name`, `avatar`, and `contact` fields. We'll set `income` to 0 since a new user will have no income. The `bookings` and `listings` of the new user will be empty arrays as well.

```ts
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  //
  // getting user information
  //

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
  }
};
```

The document that has been inserted with the `insertOne()` method can be accessed with the `.ops` array from the returned value. We'll get the first item from the array (since we're only inserting a single document) and set it as the value of the `viewer` variable. At the end of our `logInViaGoogle()` function, we'll simply return the `viewer` object that arose from either updating an existing document or inserting a new document.

In its entirety, the `logInViaGoogle()` function will appear as follows:

```ts
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
    user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;

  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
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
```

Our `logIn` mutation will now do as intended and:

- Authenticate with Google OAuth.
- Either update or insert the viewer in the database.
- And return the viewer and viewer details for the client to receive.

### `Mutation.logOut` resolver

The last thing we'll do is update the resolver function for the root level `logOut` mutation. Since we're not dealing with cookies just yet, this will be simple and we'll have the `logOut()` resolver return an empty viewer object with only the `didRequest` field set to `true`. We'll keep the contents of the `logOut()` function within a `try...catch` statement to keep things consistent.

```ts
export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...,
    logOut: (): Viewer => {
      try {
        return { didRequest: true };
      } catch (error) {
        throw new Error(`Failed to log out: ${error}`);
      }
    }
  },
  Viewer: {
    // ...
  }
};
```

Okay! That was a lot of code. The resolvers for authenticating with Google OAuth are the most complicated resolver functions we have in our app. At this moment and with our server running, by querying the `authUrl` field, we'll be able to see the authenticated URL that Google returns to us for our TinyHouse project. If we were to place the URL in a browser window when not logged into Google, we'll be presented with the Consent Form that says we can sign-in to the TinyHouse application!

In the next lesson, we'll begin to work on the client-side to consume what we've done on the server.
