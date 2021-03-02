<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 3 | Setting up our Database

#### 1. Which of the following best describes what a collection is in a MongoDB database.

**A**: The binary representation of JSON documents stored in the database.
**B**: A group of two or more servers that work together to provide users with higher availability, scalability, and reliability.
**C**: A collection of related objects (i.e. documents).
**D**: A MongoDB Atlas feature that supports having increased memory for databases hosted on the cloud.

**Answer**: C - A collection of related objects (i.e. documents).

#### 2. The `"listings"` collection in our database is to store data that involve the bookings that have been made for listings in our app.

**A**: True
**B**: False

**Answer**: B - False. The `"bookings"` collection in our database is to store data that involve the bookings that have been made for listings in our app.

#### 3. Why is it important for us to help define the shape of documents and collections in our database with TypeScript, on the server?

**A**: It helps prepare what kind of data we expect to receive and persist on the database since MongoDB (and NoSQL databases in general) don't require us to have a predefined schema.
**B**: MongoDB is only compatible with TypeScript specific server technologies.
**C**: To use the Node MongoDB driver which is a TypeScript specific library.
**D**: To be compatible with our GraphQL API.

**Answer**: A - It helps prepare what kind of data we expect to receive and persist on the database since MongoDB (and NoSQL databases in general) don't require us to have a predefined schema.

#### 4. Which of the following best desribes the piece of code below.

```js
await db.bookings.drop();
```

**A**: It seeds the `"bookings"` collection with randomly generated data.
**B**: It drops (i.e. removes) an entire database if it is to contain a collection named `"bookings"`.
**C**: It drops (i.e. removes) the `"bookings"` collection.
**D**: It drops (i.e. removes) every collection in the database but the `"bookings"` collection.

**Answer**: C - It drops (i.e. removes) the `"bookings"` collection.
