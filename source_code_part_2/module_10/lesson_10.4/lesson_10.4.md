# Building the Stripe Connect Resolvers

> We're performing **Step 4: Fetch the user's credentials from Stripe** from the steps highlighted in the OAuth connection flow section of using Stripe Connect with Standard accounts. This can be seen - [here](https://stripe.com/docs/connect/standard-accounts#token-request).

In this lesson, we'll establish the resolver functions for the `connectStripe` and `disconnectStripe` mutations. We'll be installing a new dependency in our server application and the accompanying type definitions. We're going to install the official [Stripe API library for Node.js applications](https://github.com/stripe/stripe-node/). The `stripe` Node.js library will allow us to make requests to Stripe from our Node server.

With that said, we'll head to the terminal and install the `stripe` library.

```shell
npm i stripe
```

We'll then install the community prepared typings.

```shell
npm i -D @types/stripe
```

### Interacting with Stripe API

Just like how we have a `Google.ts` file kept within our `src/lib/api/` folder responsible in setting up the functions necessary to interact with Google APIs, we'll create a `Stripe.ts` file in the `src/lib/api/` folder to consolidate all the functionalities we are to have to interact with the Stripe API.

```shell
server/
  src/
    // ...
    lib/
      api/
        // ...
        Stripe.ts
      // ...
  // ...
```

In the `src/lib/api/index.ts` file, we'll re-export the Stripe object we'll soon create.

```tsx
export * from "./Stripe";
```

In the newly created `Stripe.ts` file, we'll import the `stripe` constructor from the installed `stripe` library. We'll create a constant function called `client` that will be the result of the `stripe()` constructor function.

```ts
import stripe from "stripe";

const client = new stripe();
```

The `stripe()` constructor expects us to pass in the API Secret key of our platform Stripe account. We have this secret key kept as an environment variable in our server project so we'll reference it and pass it into the `stripe()` function with `process.env.S_SECRET_KEY`.

```ts
import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`);
```

We'll construct an object called `Stripe` that at this moment will only have a `connect()` function property that is to accept a `code` parameter of type `string`. This `code` will be the authorization code received from the client and used to make an authorization request to Stripe's server.

```ts
import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`);

export const Stripe = {
  connect: async (code: string) => {}
};
```

In our `connect()` function, we'll use the `oauth.token()` function available to us within our constructed Stripe client. This `oauth.token()` function takes an options object and returns the connected user's information. We'll need to specify the `code` that is to be passed into this function to successfully connect the user to our Stripe Connect platform and retrieve the users connected `stripe_user_id`. In addition, the [documentation](https://stripe.com/docs/connect/standard-accounts#token-request) tells us to specify a `grant_type` option with a value of `"authorization"` with which we'll do as well.

Our TypeScript ESLint set-up will warn us and tell us that the options properties in the function should be in camelCase format. We agree but we can't change the format of the `grant_type` property it so we'll simply disable the `@typescript-eslint/camelcase` rule around our options.

```ts
import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`);

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      /* eslint-disable @typescript-eslint/camelcase */
      grant_type: "authorization_code",
      code
      /* eslint-enable @typescript-eslint/camelcase */
    });

    return response;
  }
};
```

The `response` object returned from the `client.oauth.token()` function is to contain a series of different fields such as the `stripe_user_id`, the `access_token`, `scope`, `livemode`, `token_type`, etc. With OAuth 2.0 implementations, we might usually look to track the `access_token` of a user so we can make requests on behalf of the person's account. However, in this case, all we'll need to collect for our use case is the `stripe_user_id`. The `stripe_user_id` is a reference to the connected account, so when a payment is made, we'll simply payout to the user with this particular ID.

**If you need to do more things within your Stripe platform such as recurring payments or acting on behalf of a user to interact with other APIs, you may need to collect more information for the connected account (such as the `access_token`).** However in our case, we'll only grab the `stripe_user_id` from the response in our `connectStripe()` mutation resolver function since that is what we'll only need.

### `connectStripe()`

With that said, we'll now modify our `connectStripe()` and `disconnectStripe()` mutation resolvers we have in the `viewerResolvers` map and we'll begin with the `connectStripe()` mutation.

In the `types.ts` file within the `src/graphql/resolvers/Viewer/` folder, we'll first create an interface to represent the shape of data for the arguments that can be passed into our `connectStripe` mutation. We'll create and export this interface called `ConnectStripeArgs` which is to have an `input` with a `code` property of type `string`.

```tsx
export interface ConnectStripeArgs {
  input: { code: string };
}
```

In our `viewerResolvers` map in the adjacent `index.ts` file, we'll import the `ConnectStripeArgs` interface. In our `connectStripe()` mutation resolver, we'll retrieve the `input` argument and the `db` and `req` objects from the context available in our resolvers. We'll state that our `connectStripe()` mutation function will be asynchronous and will return a Promise that when resolved will be the `Viewer` object.

```ts
// ...

// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      // ...
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

In the `connectStripe` function, we'll set up a `try...catch` block and at the beginning of our `try` statement, we'll destruct the `code` value from the `input` argument. We'll then look to identify the `viewer` that is making the request. We'll only want a `viewer` that is logged in our application to connect with Stripe.

We already have an `authorize()` function we've set up to determine the identity of a `viewer` so we'll run the `authorize()` function and pass in the `db` and `req` objects it expects. If the `viewer` can't be found or recognized, we'll throw an error along the lines of `"viewer cannot be found"`.

```ts
// ...

// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      try {
        const { code } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }
      } catch {}
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

We'll need to import this `authorize()` function from the `src/lib/utils/` folder.

```ts
import { authorize } from "../../../lib/utils";
```

We'll also import the `Stripe` object from the `src/lib/api/` folder since we're about to use it to run the `connect()` function we've just set up.

```ts
import { Google, Stripe } from "../../../lib/api";
```

When this `viewer` object is available in our `connectStripe()` function, we'll know that this request is coming from a viewer successfully logged in so we'll then run the `connect()` function from our `Stripe` object and pass in the `code` that is to be passed from the client. We'll call the object that is returned from Stripe's servers - `wallet`. We'll check to see if this `wallet` exists and if not, we'll throw an error.

```ts
// ...

// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      try {
        const { code } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        const wallet = await Stripe.connect(code);
        if (!wallet) {
          throw new Error("stripe grant error");
        }
      } catch {}
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

With the `wallet` information available, we'll then look to update the user document for the viewer in the `"users"` collection in our database and specify the wallet `stripe_user_id` we've just obtained. We'll use Mongo's [`findOneAndUpdate()`](https://docs.mongodb.com/manual/reference/method/db.collection.findOneAndUpdate/) function to achieve this. We'll find the document where the `_id` field value is equal to the `_id` value of the `viewer`. We'll use the `set` option property to update the `walletId` field of this document with the `stripe_user_id` value from the `wallet`. We'll specify the `returnOriginal` property to be `false` so this function value will be the updated value, not the original.

```ts
// ...

// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      try {
        const { code } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        const wallet = await Stripe.connect(code);
        if (!wallet) {
          throw new Error("stripe grant error");
        }

        const updateRes = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: wallet.stripe_user_id } },
          { returnOriginal: false }
        );
      } catch {}
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

If the `value` property of the update result doesn't exist, it means we haven't been able to update the necessary document so we'll throw an error and say `"viewer could not be updated"`. If the `value` property of the update result exists, we'll update the `viewer` variable we have in this function with this new viewer object that is to now have the `walletId` property populated.

```ts
// ...

// ...

export const viewerResolver: IResolvers = {
  Query: {
    // ...
  },
  Mutation: {
    // ...
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      try {
        const { code } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        const wallet = await Stripe.connect(code);
        if (!wallet) {
          throw new Error("stripe grant error");
        }

        const updateRes = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: wallet.stripe_user_id } },
          { returnOriginal: false }
        );

        if (!updateRes.value) {
          throw new Error("viewer could not be updated");
        }

        viewer = updateRes.value;
      } catch {}
    }
    // ...
  },
  Viewer: {
    // ...
  }
};
```

We can have the mutation return whatever the client may need to access. We'll return the viewer `_id`, `token`, `avatar`, and `walletId` fields. We'll also specify the `didRequest` property of the `viewer` as `true` to convey that the request was made.

In our function's `catch` statement, we'll catch whatever error might have occurred and place it with an error statement that says `"Failed to connect with Stripe"`.

```ts
    connectStripe: async (
      _root: undefined,
      { input }: ConnectStripeArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Viewer> => {
      try {
        const { code } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        const wallet = await Stripe.connect(code);
        if (!wallet) {
          throw new Error("stripe grant error");
        }

        const updateRes = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: wallet.stripe_user_id } },
          { returnOriginal: false }
        );

        if (!updateRes.value) {
          throw new Error("viewer could not be updated");
        }

        viewer = updateRes.value;

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true
        };
      } catch (error) {
        throw new Error(`Failed to connect with Stripe: ${error}`);
      }
    },
```

### `disconnectStripe()`

Our `disconnectStripe()` mutation function will appear similar but instead of updating a user document with a `walletId` field, it will instead remove the value of the `walletId` field for the user document. This is how we'll have a user _disconnect_ from Stripe in our app.

In the `disconnectStripe()` resolver function, we'll:

- Look to access the `db` and `req` objects available as context.
- Identify and authorize the viewer making the request and if the viewer can't be found, throw an error.
- If the `viewer` is available, we'll update the user document of the viewer by setting the `walletId` field of the document as `null`.
- If the `value` property of the update result doesn't exist, we'll throw an error and say `"viewer could not be updated"`.
- If the `value` property of the update result does exist, it means we've made the update successfully and we'll simply return the `viewer` object similar to what we've returned in the `connectStripe()` mutation. We'll return the `id`, `token`, `avatar`, and `walletId` fields which should all be `null` and the `didRequest` property as `true`.
- If an error is to occur anywhere in the implementation, we'll capture it and keep it within another error message that says `"Failed to disconnect with Stripe"`.

```ts
disconnectStripe: async (
  _root: undefined,
  _args: {},
  { db, req }: { db: Database; req: Request }
): Promise<Viewer> => {
  try {
    let viewer = await authorize(db, req);
    if (!viewer) {
      throw new Error("viewer cannot be found");
    }

    const updateRes = await db.users.findOneAndUpdate(
      { _id: viewer._id },
      { $set: { walletId: null } },
      { returnOriginal: false }
    );

    if (!updateRes.value) {
      throw new Error("viewer could not be updated");
    }

    viewer = updateRes.value;

    return {
      _id: viewer._id,
      token: viewer.token,
      avatar: viewer.avatar,
      walletId: viewer.walletId,
      didRequest: true
    };
  } catch (error) {
    throw new Error(`Failed to disconnect with Stripe: ${error}`);
  }
};
```

That should be it! Our `connectStripe()` mutation function is capable of connecting a user with their Stripe account into our Stripe connected platform. We're primarily capturing the `stripe_user_id` value of the connected account and storing it in our database.
