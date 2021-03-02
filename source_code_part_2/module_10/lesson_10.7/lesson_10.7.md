# Module 10 Summary

I> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
I> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we've set-up a Stripe Connect account for our TinyHouse application and we've provided the capability for users in our application to connect with their Stripe account and be a connected Stripe account in our platform.

## Server Project

### `src/graphql/typeDefs.ts`

In our GraphQL API type definitions, we've established two new root-level mutation fields - `connectStripe` and `disconnectStripe`.

-   The `connectStripe` mutation is to be executed, from the client, when the user proceeds through the Stripe OAuth page to connect their Stripe account and is redirected back to our app.
-   The `disconnectStripe` mutation is to be executed when a user decides to disconnect from Stripe from our TinyHouse application.

```graphql
  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
    connectStripe(input: ConnectStripeInput!): Viewer!
    disconnectStripe: Viewer!
  }
```

### `src/graphql/resolvers/Viewer/index.ts`

We've constructed the resolver functions for the `connectStripe` and `disconnectStripe` mutations in the `viewerResolvers` map within the `src/graphql/resolvers/Viewer/index.ts` file.

In the `connectStripe()` resolver function, we obtain the value of the authorization `code` returned from Stripe's servers and passed into our mutation as part of the input. We then verify that a valid viewer is making the request and then look to obtain the `stripe_user_id` of the viewer by interacting with Stripe's API. When the `stripe_user_id` is available, we update the user document of the viewer by adding the `stripe_user_id` as the value to the `walletId` field of the document.

```ts
export const viewerResolvers: IResolvers = {
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
  // ...
};
```

The `disconnectStripe()` resolver function primarily involves _removing_ the value of the `walletId` field of the viewer making the request.

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
    }
  // ...
};
```

### `src/lib/api/Stripe.ts`

In the `src/lib/api/Stripe.ts` file, we created a `Stripe` object instance that consolidates the functionality to interact with Stripe's servers. In the `src/lib/api/Stripe.ts` file, we constructed an OAuth client and in the exported `Stripe` object, there exists a `connect()` function property that uses the Stripe client to fetch the user's credentials from Stripe.

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

## Client Project

### `src/lib/graphql/`

We created the GraphQL documents for the new root-level mutation fields - `connectStripe` and `disconnectStripe`. For both of these mutations, we simply return the value of the `hasWallet` field in the returned viewer object.

#### `src/lib/graphql/mutations/ConnectStripe/index.ts`

```ts
import { gql } from "apollo-boost";

export const CONNECT_STRIPE = gql`
  mutation ConnectStripe($input: ConnectStripeInput!) {
    connectStripe(input: $input) {
      hasWallet
    }
  }
`;
```

#### `src/lib/graphql/mutations/DisconnectStripe/index.ts`

```ts
import { gql } from "apollo-boost";

export const DISCONNECT_STRIPE = gql`
  mutation DisconnectStripe {
    disconnectStripe {
      hasWallet
    }
  }
`;
```

### `src/sections/User/components/UserProfile/index.tsx`

In the `<UserProfile />` component that is rendered as part of the `<User />` component, we provide the functionality to allow the user to:

1.  Be redirected to Stripe's OAuth page when connecting with Stripe.
2.  Trigger the `disconnectStripe` mutation when already connected with Stripe and interested in disconnecting.

```tsx
const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_S_CLIENT_ID}&scope=read_write`;
```

```tsx
export const UserProfile = ({
  user,
  viewer,
  viewerIsUser,
  setViewer,
  handleUserRefetch
}: Props) => {
  const [disconnectStripe, { loading }] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    {
      onCompleted: data => {
        if (data && data.disconnectStripe) {
          setViewer({ ...viewer, hasWallet: data.disconnectStripe.hasWallet });
          displaySuccessNotification(
            "You've successfully disconnected from Stripe!",
            "You'll have to reconnect with Stripe to continue to create listings."
          );
          handleUserRefetch();
        }
      },
      onError: () => {
        displayErrorMessage(
          "Sorry! We weren't able to disconnect you from Stripe. Please try again later!"
        );
      }
    }
  );

  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl;
  };

  const additionalDetails = user.hasWallet ? (
    <Fragment>
      <Paragraph>
        <Tag color="green">Stripe Registered</Tag>
      </Paragraph>
      <Paragraph>
        Income Earned:{" "}
        <Text strong>{user.income ? formatListingPrice(user.income) : `$0`}</Text>
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        loading={loading}
        onClick={() => disconnectStripe()}
      >
        Disconnect Stripe
      </Button>
      <Paragraph type="secondary">
        By disconnecting, you won't be able to receive{" "}
        <Text strong>any further payments</Text>. This will prevent users from booking
        listings that you might have already created.
      </Paragraph>
    </Fragment>
  ) : (
    <Fragment>
      <Paragraph>
        Interested in becoming a TinyHouse host? Register with your Stripe account!
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
        Connect with Stripe
      </Button>
      <Paragraph type="secondary">
        TinyHouse uses{" "}
        <a
          href="https://stripe.com/en-US/connect"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe
        </a>{" "}
        to help transfer your earnings in a secure and truster manner.
      </Paragraph>
    </Fragment>
  );

  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Additional Details</Title>
        {additionalDetails}
      </div>
    </Fragment>
  ) : null;

  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar size={100} src={user.avatar} />
        </div>
        <Divider />
        <div className="user-profile__details">
          <Title level={4}>Details</Title>
          <Paragraph>
            Name: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            Contact: <Text strong>{user.contact}</Text>
          </Paragraph>
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  );
};
```

### `src/sections/Stripe/index.tsx`

We've constructed a `<Stripe />` component that is to be rendered when a user is redirected to the `/stripe` route of our app after connecting their Stripe account. When the user is redirected to `/stripe`, a value for the authorization `code` is available in the URL as a query parameter. An effect is run in the `<Stripe />` component to retrieve the value of the `code` parameter and execute the `connectStripe` mutation. When the `connectStripe` mutation is successful, the user is redirected to their `/user/:id` page.

```tsx
export const Stripe = ({ viewer, setViewer, history }: Props & RouteComponentProps) => {
  const [connectStripe, { data, loading, error }] = useMutation<
    ConnectStripeData,
    ConnectStripeVariables
  >(CONNECT_STRIPE, {
    onCompleted: data => {
      if (data && data.connectStripe) {
        setViewer({ ...viewer, hasWallet: data.connectStripe.hasWallet });
        displaySuccessNotification(
          "You've successfully connected your Stripe Account!",
          "You can now begin to create listings in the Host page."
        );
      }
    }
  });
  const connectStripeRef = useRef(connectStripe);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      connectStripeRef.current({
        variables: {
          input: { code }
        }
      });
    } else {
      history.replace("/login");
    }
  }, [history]);

  if (data && data.connectStripe) {
    return <Redirect to={`/user/${viewer.id}`} />;
  }

  if (loading) {
    return (
      <Content className="stripe">
        <Spin size="large" tip="Connecting your Stripe account..." />
      </Content>
    );
  }

  if (error) {
    return <Redirect to={`/user/${viewer.id}?stripe_error=true`} />;
  }

  return null;
};
```

## Moving forward

In the next module, we move towards creating the capability for a user to **host a listing** in our application.
