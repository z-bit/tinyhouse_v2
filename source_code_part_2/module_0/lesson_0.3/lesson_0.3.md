# Walkthrough of TinyHouse Code

In this lesson, we'll walk through the _finished_ code for the client and server projects for the TinyHouse application. This will help in gathering some context on the patterns we'll follow and the folder/file structuring of our projects. In this lesson, **we are not going to address the actual code we'll write** but instead provide a high-level perspective on how we plan our client and server projects to be built.

### API-Driven Approach

Coming from Part I of the course, we've probably already have come to understand this but we're going to build the TinyHouse application through an **API-driven approach**. This means we're going to develop an **interface** (i.e. a GraphQL API) **that exposes server data and business logic**. Our client (i.e. our web application) is going to **interact with this API to query or persist data**. This API-driven development model helps split the back-end and front-end code, which further helps the capability if we wanted to build multiple front-end clients to interact with the same API.

### Server Project

We'll first survey the complete `server/` project. **The server project is going to be a Node/Express server** where its responsibility is to serve a GraphQL API and interact with our MongoDB database to either query or persist data.

```shell
server/
  src/
  temp/
  .env
  .eslintrc.json
  package.json
  README.md
  tsconfig.json
```

#### `src/`

The `src/` directory is essentially where we'll write 99% of our actual source code.

```shell
server/
  src/
    database/
    graphql/
    lib/
    index.ts
  // ...
```

The `src/database/` folder is where we make the connection from our Node application to the MongoDB database we have in our MongoDB Atlas cluster. In our MongoDB database, we're going to have three collections for Part II of the course.

- A `"users"` collection to store information for the users in our application.
- A `"listings"` collection to store information for the listings in our application.
- A `"bookings"` collection to store information for the bookings made in our application.

The `src/graphql/` folder is where we establish and create the GraphQL API. Here is where we'll define the type definitions of the actual API and the resolver functions responsible for resolving the fields of the API.

The `src/lib/` folder is where we'll keep the functionality that is to be shared in different areas of our server project. This is where we'll define the capability to interact with third-party APIs (e.g. Cloudinary, Stripe, and Google APIs). In the `src/lib/` folder, we'll also store any utility functions and TypeScript type definitions that are to be used in different parts of our server project.

#### `temp/`

```shell
server/
  // ...
  temp/
    clear.ts
    seed.ts
  // ...
```

The `temp/` directory of our server project is where we'll establish a `seed()` function to help populate our MongoDB database with fake mock data that we'll use for development purposes when building our application. We'll also have a `clear()` function that can be used to clear the database if we ever need to.

Everything else in our `server/` project involves the environment set-up of our project which consists of but is not limited to defining the environment configuration variables, ESLint configuration, TypeScript configuration, and the dependencies our app depends on.

### Client Project

**The client project is to be a React/TypeScript project** where we build a Single-Page Application.

```shell
client/
  public/
  src/
  .env
  .gitignore
  package.json
  README.md
  schema.json
  tsconfig.json
```

#### `src/`

Similar to the server project, 99% of the actual code we'll write in our client project is to be in the `src/` directory.

```shell
client/
  // ...
  src/
    lib/
    sections/
    styles/
    index.tsx
    react-app-env.d.ts
    serviceWorker.ts
  // ...
```

The root `src/index.tsx` file is where we are to instantiate our Apollo Client to interact with the GraphQL API and is where we develop the highest parent-level component, `<App />`, that's going to represent our React application.

In the parent `<App />` component, we are to use [React Router](https://reacttraining.com/react-router/web/guides/quick-start) (a third-party library) to create client-side routes and have different components rendered based on the route. These high-level page components are to be defined in the `src/sections/` folder.

The `src/lib/` folder is where we'll group all pieces of code that are to be shared in different section components of our client such as the GraphQL API documents, shared components, utility functions, and TypeScript type definitions.

A `src/styles/` directory will exist and will contain a single `index.css` file that we'll provide to you as part of course material and is to contain all the custom CSS classes and styles we'll need in our app. This is to be used in conjunction with the [Ant Design UI](https://ant.design/) framework for how we intend to build the UI elements of the TinyHouse application (this is to be discussed more in the lesson **How To Go Through The Course**).

Outside of the `src/` folder, our client project contains:

- The `public/` directory that has the markup `index.html` file with the root element in which our React app is to be mounted onto.
- A `package.json` file that contains our application dependencies.
- An autogenerated `schema.json` file that represents our GraphQL API and is generated with the [Apollo CLI](https://github.com/apollographql/apollo-tooling#apollo-cli) tool.
- A `.env` file where we introduce environment variables we intend to keep in our React project.

Though we've talked about a few things in this lesson, there are a lot of things we haven't addressed and will address when we proceed throughout Part II of the course. In the next lesson, we'll take a brief tangent and talk about patterns we'll employ as we build the server and client projects.
