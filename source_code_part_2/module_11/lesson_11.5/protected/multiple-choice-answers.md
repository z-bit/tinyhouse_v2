<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 11 | Hosting new listings

#### 1. How have we facilitated sending an image of a listing from the client to the server when a new listing has been hosted (i.e. created)?

**A**: We send the image directly as an image file (JPEG or PNG).
**B**: We host the image on the cloud from the client and simply send the hosted image URL value to the server.
**C**: GraphQL converts the image file to a `string` automatically.
**D**: We encode the image to its base64 value before sending it to the server.

**Answer**: D - We encode the image to its base64 value before sending it to the server.

#### 2. The main purpose of using the `<Form />` component from Ant Design was to help render all the different UI elements within a form.

**A**: True
**B**: False

**Answer**: B - False. The `<Form />` component from Ant Design doesn't necessarily give us the UI for certain form elements, like a radio input or a checkbox since other components exist for this, but it provides the capability to validate fields with certain rules AND to collect information.

#### 3. In the existing version of the `<Form />` component from Ant Design, a higher-order component function exists to help provide form specific information. With that said, what is a higher-order component in React?

**A** Props whose value is a function where the component calls the prop function to return the React element instead of implementing its own logic.
**B**: A synonym of React Hooks.
**C**: Functions that take a component and return a _new_ component with additional data or functionality.
**D**: Functions that are called at a component's root-level.

**Answer**: C - Functions that take a component and return a _new_ component with additional data or functionality.

#### 4. In the TinyHouse application, we prevent the form in the `/host` page from surface if a user is not logged in or not connected with Stripe.

**A**: True
**B**: False

**Answer**: A - True. We require a user to be logged in to create a listing to link the listing to the user. We require a user to be connected with Stripe to be able to pay out the user when a booking has been made to their listing.
