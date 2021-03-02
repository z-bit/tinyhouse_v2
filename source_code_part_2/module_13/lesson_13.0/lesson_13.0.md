# Module 13 Introduction

In this module, we'll focus on the last big feature of our application and that is allowing users to book listings from other users.

In this module, we'll

-   Create and build the `createBooking` GraphQL mutation.
-   Address that when a booking is created, how the `bookingsIndex` of a listing is to be updated.
-   See how we can disable dates that have already been booked in the date picker elements of the Listing page.
-   Show how we can surface a confirmation modal that summarizes the amount to be paid when a user is ready to book a listing.
-   See how we can use components from the [React Stripe Elements](https://github.com/stripe/react-stripe-elements) library to capture debit or credit card information.
-   Finally, when the `createBooking` mutation is triggered - verify the payment is made and all the expected updates in our application are made accordingly.
