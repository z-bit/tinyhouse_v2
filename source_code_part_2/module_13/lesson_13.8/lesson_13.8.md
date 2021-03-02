# Module 13 Summary

I> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
I> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we've created the capability for users to book listings in our application.

## Server Project

### `src/graphql/typeDefs.ts`

In the GraphQL API type definitions of our server project, we introduced a new root-level mutation field labeled `createBooking`.

```graphql
  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
    connectStripe(input: ConnectStripeInput!): Viewer!
    disconnectStripe: Viewer!
    hostListing(input: HostListingInput!): Listing!
    createBooking(input: CreateBookingInput!): Booking!
  }
```

The `createBooking` mutation accepts an `input` that is to have an object type of `CreateBookingInput`. The `input` is to contain a series of field values that describe the booking that is to be created, such as the `id` of the listing being booked, the payment source being made, and the check-in/check-out dates of the booking

```graphql
  input CreateBookingInput {
    id: ID!
    source: String!
    checkIn: String!
    checkOut: String!
  }
```

### `src/graphql/resolvers/Booking/index.ts`

We've constructed the resolver function for the `createBooking` mutation in the `bookingResolvers` map within the `src/graphql/resolvers/Booking/index.ts` file. The `createBooking()` resolver function does a few different things:

-   The utility `authorize()` function is first called to verify the viewer making the request.
-   The listing document being booked is found from the `id` argument passed in as input to the mutation.
-   A check is made to verify the viewer making the booking is not the host of the listing.
-   Another check is made to verify the check-out date is not before the check-in date of the booking.
-   The `bookingsIndex` object of the listing is updated to recognize the new dates that have been booked for the listing.
-   The total price of the booking is determined based on the number of days the listing is being booked.
-   A check is made to verify the host is still connected with Stripe such that they will be able to receive payment.
-   A Stripe charge is conducted to pay the host from the person creating the booking.
-   The `"bookings"` collection is updated with a new booking document.
-   The `income` of the user document of the host is updated with the new amount of income earned.
-   The `bookings` field of the user document of the viewer is updated with the `id` of the new booking that has been made.
-   The listing document of the listing being booked is updated to have a new `bookingsIndex` object. The `bookings` field of the listing document is also updated with the `id` of the new booking that has been made.

```ts
export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer cannot be found");
        }

        const listing = await db.listings.findOne({
          _id: new ObjectId(id)
        });
        if (!listing) {
          throw new Error("listing can't be found");
        }

        if (listing.host === viewer._id) {
          throw new Error("viewer can't book own listing");
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error("check out date can't be before check in date");
        }

        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut
        );

        const totalPrice =
          listing.price *
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        const host = await db.users.findOne({
          _id: listing.host
        });

        if (!host || !host.walletId) {
          throw new Error(
            "the host either can't be found or is not connected with Stripe"
          );
        }

        await Stripe.charge(totalPrice, source, host.walletId);

        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut
        });

        const insertedBooking: Booking = insertRes.ops[0];

        await db.users.updateOne(
          {
            _id: host._id
          },
          {
            $inc: { income: totalPrice }
          }
        );

        await db.users.updateOne(
          {
            _id: viewer._id
          },
          {
            $push: { bookings: insertedBooking._id }
          }
        );

        await db.listings.updateOne(
          {
            _id: listing._id
          },
          {
            $set: { bookingsIndex },
            $push: { bookings: insertedBooking._id }
          }
        );

        return insertedBooking;
      } catch (error) {
        throw new Error(`Failed to create a booking: ${error}`);
      }
    }
  },
  // ...
};
```

### `src/lib/api/Stripe.ts`

In the `Stripe` object instance within the `src/lib/api/Stripe.ts` file, a `charge()` function is established to help create a payment charge from the tenant to the host of the listing. The `charge()` function receives the total amount to be charged, the payment source being made, and the `stripe_user_id` value of the host account.

When a charge is conducted, 5% of the total amount is additionally charged to the host as an application fee where we (i.e. TinyHouse) receive as revenue.

```ts
export const Stripe = {
  // ...
  charge: async (amount: number, source: string, stripeAccount: string) => {
    /* eslint-disable @typescript-eslint/camelcase */
    const res = await client.charges.create(
      {
        amount,
        currency: "usd",
        source,
        application_fee_amount: Math.round(amount * 0.05)
      },
      {
        stripe_account: stripeAccount
      }
    );
    /* eslint-enable @typescript-eslint/camelcase */

    if (res.status !== "succeeded") {
      throw new Error("failed to create charge with Stripe");
    }
  }
};
```

## Client Project

### `src/lib/graphql/mutations/CreateBooking/index.ts`

On the client project, we create the GraphQL document for the new root-level mutation field - `createBooking`.

```ts
import { gql } from "apollo-boost";

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
    }
  }
`;
```

### `src/sections/Listing/components/ListingCreateBookingModal/index.tsx`

The `<ListingCreateBookingModal />` component is a child of the `<Listing />` section component and is rendered to the user when the user has selected dates to book in the listing page and is ready to make the booking. We use the `injectStripe()` higher-order function from the [`react-stripe-elements`](https://github.com/stripe/react-stripe-elements) library to provide a `stripe` prop object that is to contain information about the payment the user is about to make. We also use the `<CardElement />` component from `react-stripe-elements` to help display the payment element where we can receive payment information from the user.

When the user has provided their payment information and confirmed their booking, the `createBooking` mutation is triggered. When the `createBooking` mutation is successful, the modal is closed and the user is notified that the listing has been created.

```tsx
export const ListingCreateBookingModal = ({
  id,
  price,
  modalVisible,
  checkInDate,
  checkOutDate,
  setModalVisible,
  clearBookingData,
  handleListingRefetch,
  stripe
}: Props & ReactStripeElements.InjectedStripeProps) => {
  const [createBooking, { loading }] = useMutation<
    CreateBookingData,
    CreateBookingVariables
  >(CREATE_BOOKING, {
    onCompleted: () => {
      clearBookingData();
      displaySuccessNotification(
        "You've successfully booked the listing!",
        "Booking history can always be found in your User page."
      );
      handleListingRefetch();
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! We weren't able to successfully book the listing. Please try again later!"
      );
    }
  });

  const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
  const listingPrice = price * daysBooked;

  const handleCreateBooking = async () => {
    if (!stripe) {
      return displayErrorMessage("Sorry! We weren't able to connect with Stripe.");
    }

    let { token: stripeToken, error } = await stripe.createToken();
    if (stripeToken) {
      createBooking({
        variables: {
          input: {
            id,
            source: stripeToken.id,
            checkIn: moment(checkInDate).format("YYYY-MM-DD"),
            checkOut: moment(checkOutDate).format("YYYY-MM-DD")
          }
        }
      });
    } else {
      displayErrorMessage(
        error && error.message
          ? error.message
          : "Sorry! We weren't able to book the listing. Please try again later."
      );
    }
  };

  return (
    <Modal
      visible={modalVisible}
      centered
      footer={null}
      onCancel={() => setModalVisible(false)}
    >
      <div className="listing-booking-modal">
        <div className="listing-booking-modal__intro">
          <Title className="listing-boooking-modal__intro-title">
            <Icon type="key"></Icon>
          </Title>
          <Title level={3} className="listing-boooking-modal__intro-title">
            Book your trip
          </Title>
          <Paragraph>
            Enter your payment information to book the listing from the dates between{" "}
            <Text mark strong>
              {moment(checkInDate).format("MMMM Do YYYY")}
            </Text>{" "}
            and{" "}
            <Text mark strong>
              {moment(checkOutDate).format("MMMM Do YYYY")}
            </Text>
            , inclusive.
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__charge-summary">
          <Paragraph>
            {formatListingPrice(price, false)} * {daysBooked} days ={" "}
            <Text strong>{formatListingPrice(listingPrice, false)}</Text>
          </Paragraph>
          <Paragraph className="listing-booking-modal__charge-summary-total">
            Total = <Text mark>{formatListingPrice(listingPrice, false)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__stripe-card-section">
          <CardElement hidePostalCode className="listing-booking-modal__stripe-card" />
          <Button
            size="large"
            type="primary"
            className="listing-booking-modal__cta"
            loading={loading}
            onClick={handleCreateBooking}
          >
            Book
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const WrappedListingCreateBookingModal = injectStripe(ListingCreateBookingModal);
```
