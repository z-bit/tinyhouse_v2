# Disconnecting from Stripe & Revoking Access

> Stripe Documentation on **revoking access** of connected accounts can be found - [here](https://stripe.com/docs/connect/standard-accounts#revoked-access).

We built the `disconnectStripe` mutation to allow a user the ability to disconnect their Stripe "wallet" from our platform (or in other words, to remove their Stripe credentials kept in the database). However, when they've ever disconnected, we haven't built functionality focused on **removing the connected account within the TinyHouse Stripe Connect account**.

To facilitate this, we can use the `oauth.deauthorize()` function available from a stripe client instance as documented in the [**Revoked and revoking access**](https://stripe.com/docs/connect/standard-accounts#revoked-access) section of the Stripe documentation on Using Connect with Standard accounts. The `oauth.deauthorize()` function accepts an options object that accepts a `client_id` of the application that we'd like the connected account to disconnect from and a `stripe_user_id` of the connected account we want to disconnect. With that said, we can create a `disconnectStripe()` function in the `Stripe` object instance we have in the `src/lib/api/Stripe.ts` to facilitate this.

```ts
export const Stripe = {
  // ...
  disconnect: async (stripeUserId: string) => {
    // @ts-ignore
    const response = await client.oauth.deauthorize({
      /* eslint-disable @typescript-eslint/camelcase */
      client_id: `${process.env.S_CLIENT_ID}`,
      stripe_user_id: stripeUserId
      /* eslint-enable @typescript-eslint/camelcase */
    });

    return response;
  }
  // ...
};
```

> **Note:** We've ignored the TypeScript type-checking capabilities around the `oauth.deauthorize()` function since the type definitions of the function don't currently match the signature specified in the Node.js example shown in the [documentation](https://stripe.com/docs/connect/standard-accounts#revoked-access).

Our `disconnectStripe()` resolver function can now trigger the `disconnect()` function within the `Stripe` object instance to disconnect the connected account from the TinyHouse connect platform. This can occur just before we remove the value of the viewer's `walletId` in the database.

```ts
export const viewerResolvers: IResolvers = {
  // ...
  disconnectStripe: async (
    _root: undefined,
    _args: {},
    { db, req }: { db: Database; req: Request }
  ): Promise<Viewer> => {
    try {
      let viewer = await authorize(db, req);
      if (!viewer || !viewer.walletId) {
        throw new Error("viewer cannot be found or has not connected with Stripe");
      }

      const wallet = await Stripe.disconnect(viewer.walletId);
      if (!wallet) {
        throw new Error("stripe disconnect error");
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
  }
  // ...
};
```

If a user was to now disconnect from Stripe in their user profile section within `/user/:id` route, we disconnect their Stripe account from our connect account platform **and** remove the value of their `walletId` (i.e. `stripe_user_id`) in the database.
