<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 13 | Booking listings

#### 1. What is the primary reason for making a refetch of listing data, in the `/listing/:id` page, after a booking is made successfully by a user.

**A**: To ensure the user page of the user making the booking will surface the booked listing in the user's bookings history.
**B**: To make sure the listing can't be booked by anyone else anymore.
**C**: To help ensure the dates that have just been booked are to be disabled when the user opens the datepickers right after making the booking.
**D**: To stick with GraphQL/Apollo best practices and have a refetch be made whenever a mutation is successful.

**Answer**: C - To help ensure the dates that have just been booked are to be disabled when the user opens the datepickers right after making the booking.

#### 2. To render a Stripe Element in our client, why does Stripe require us to load the `Stripe.js` library in the `index.html` file of our client's `public/` folder?

**A**: For PCI (i.e. Payment Card Industry) compliance.
**B**: To load the resources of the element faster.
**C**: This is a preference and we're also able to load the library with `npm`.
**D**: All the above.

**Answer**: A - For PCI (i.e. Payment Card Industry) compliance.

#### 3. In our TinyHouse application, we fire off the `createBooking` mutation the moment the user opens the confirmation modal to confirm their booking.

**A**: True
**B**: False

**Answer**: B - False. We fire the `createBooking` mutation when the user provides their payment information and confirms their booking from within the confirmation modal.

#### 4. In our TinyHouse application, we don't allow a booking to be made if the host has disconnected their Stripe account from the application. This is because if a booking was to be made, we (i.e. TinyHouse) will be unable to facilitate the payment from tenant to host.

**A**: True
**B**: False

**Answer**: A - True.
