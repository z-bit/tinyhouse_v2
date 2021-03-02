<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions

## Module 8 | Building the Home Page

#### 1. Which of the following best desribes how we've made the home-page query show the highest priced listings that have been created in the app?

**A**: We've set the `listings` query field to always return listings from highest price to lowest price.
**B**: The `listings` query field returns a list of listings randomly when it comes to the price of the listings. We then sort the listings from highest to lowest price on the client before having it be shown to the user.
**C**: We've set the `listings` query field to return listings from highest price to lowest price only when a request is made by viewer's who've logged-in to the application.
**D**: A value for the `filter` variable is passed to the `listings` query field from client to server. In the `listings()` resolver function, the value of the `filter` variable dictates how the listings are to be sorted before being returned.

#### 2. When a user searches for a location in the search input of the home hero section, we simply direct the user to the `/listings/:location?` route where the user input becomes the value of the `location` URL parameter.

**A**: True
**B**: False

#### 3. Which of the following best describes the line of code below.

```js
if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
  cursor = cursor.sort({ price: 1 });
}
```

If the value for the `filter` property is equal to the value of the `PRICE_LOW_TO_HIGH` member in the `ListingsFilter` Enum:

**A**: The documents in the `cursor` is to be sorted in ascending order of price (lowest to highest price).
**B**: The documents in the `cursor` is to be sorted in descending order of price (highest to lowest price).
**C**: The documents in the `cursor` is to be have the value of their `price` fields be incremented by one.
**D**: The documents in the `cursor` is to be filtered to now longer have values for `price`.

#### 4. What is the `history` object in the context of React Router?

**A**: An object that provides access to the URL parameters of a route.
**B**: An object that provides information about the current URL.
**C**: A reference to the browser's session history.
**D**: An object that contains information about how a `<Route path>` is matched to the URL.

#### 5. The MongoDB cursor `limit()` function counts the number of documents referenced by the cursor.

**A**: True
**B**: False
