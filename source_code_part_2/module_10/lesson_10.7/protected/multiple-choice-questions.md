<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions

## Module 10 | Connecting with Stripe

#### 1. Using a third-party payment processor can help reduce the complexity of handling payments in an application.

**A**: True
**B**: False

#### 2. Publishable API keys in Stripe are meant to identify an account with Stripe and aren’t intended to be secret. As a result, it is perfectly safe to include values of a Publishable API key within a client application which will be publicly available to anyone on the web.

**A**: Yes, it is safe.
**B**: No, it is not safe.

#### 3. Why are we interested in capturing and storing the value of a user's `stripe_user_id` when they've connected successfully with Stripe?

**A**: To prove that they have a real Stripe account.
**B**: To allow the user to view listings in our app.
**C**: To have a reference to the user's connected account such that when a payment is made in our app, we'll be able to payout to the user with this particular ID.
**D**: To have the user be able to create a marketplace of their own within our TinyHouse application.

#### 4. What does the `disconnectStripe` mutation achieve when resolved successfully?

**A**: It breaks the connection between our application and Stripe.
**B**: It removes the value of the `walletId` field of the relevant user document in our database such that the user won't be able to receive payments any longer.
**C**: It deletes a user's Stripe account.
**D**: None of the above.
