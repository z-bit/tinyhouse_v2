# How To Go Through The Course

## What's similar to Part I?

To see the documentation on what's similar to Part I, check out the [How To Go Through The Course](https://www.newline.co/courses/tinyhouse-react-masterclass/lesson_0.3-how-to-go-through-the-course) lesson video we've prepared in Part I.

## What's different from Part I?

The primary distinction between Part II and Part I is in Part II, our end goal is to build a full-stack, fully functioning, home-sharing application - [TinyHouse](http://tinyhouse.app/).

In Part I, we work with a variety of different technologies to see how the client (i.e. React) can interact with a server (i.e. Node/Express) through a GraphQL API. In part II, we take everything we learned from Part I, however, the end goal is to build TinyHouse. This comes with a set of different challenges and a different perspective on how we do certain things.

### Building Features

In Part II of the course, modules and lessons encompass building certain features we want in our application. We'll have modules and lessons that govern topics like:

- How do we host new listings in our application?
- How do we connect with Stripe?
- How do we build the homepage?
- How do we persist login sessions with cookies?
- etc.

### Lesson length

In Part I, lesson videos were around 10 minutes in length on average. In Part II, a large number of lesson videos will still be around this time. However, there are going to be a lot of different lessons where we're going to try to implement something that takes a significant more amount of time. Some examples:

- Module 4 | Lesson 5 - Building the Authentication Resolvers. Length ~ 18:55
- Module 4 | Lesson 7 - Executing Login. Length ~ 22:35
- Module 6 | Lesson 5 - The UserListings & UserBookings React Components. Length ~ 42:50

### Amount of code

In Part II, we're going to be **writing a lot more code** than we've done in Part I. This is due to the scale of what we intend to build in Part II when compared with Part I.

### Concepts learned in Part I

It's important to note as you proceed through Part II, **we assume you know all the materials we've taught in Part I**. In Part II, we won't be spending a lot of time explaining concepts like how GraphQL is different from Rest APIs, how React can be used as a UI library, etc. We'll assume you've already understood these concepts and we'll build and learn a lot of new things on top of this base.

### Interacting with third-party APIs

In Part II, we're going to be **interacting with many different third-party APIs** - [Stripe](https://stripe.com/), Google's [Geocoding](https://developers.google.com/maps/documentation/geocoding/start) & [People](https://developers.google.com/people/quickstart/nodejs) APIs, and [Cloudinary](http://cloudinary.com/). For all of these different APIs, we're going to generate environment configuration values and store them in our application.

When you navigate and import the source code we share with you as part of this course, it's important to keep in mind that you'll need to generate values for these environment variables to potentially get the server/client to run the way you expect it to.

### Mark-up/CSS

Another important note to make which has been mentioned in the course syllabus is that **markup and CSS are not a primary concern for this course**. We'll style the TinyHouse application to make it appear presentable but the presentation isn't the main takeaway for what we want to teach you.

There are a few things we're going to do to support you in being able to build the TinyHouse app without being fully concerned with how the application is to be styled.

#### Ant Design UI Framework

The first thing we'll do that you may have already gained context from in Part I is use the [Ant Design](https://ant.design/) UI framework to access a large number of different UI components that we're simply going to import and use.

#### Already prepared custom styles

At an early point in the course (Module 1 | Lesson 1 - Set-up for Part II), we're going to share with you a [single CSS file](https://gist.github.com/djirdehh/3c550d5db67f0f5ca39d170eee61f4e4) that's going to contain all the custom classes we've prepared that's going to be used in the application. This will help avoid having to write custom CSS code in our app as we proceed through the course.

In the lesson videos, lesson manuscripts, and source code that we'll share with you - you'll be able to gain context on the different CSS classes used for different elements through the course. For example, in the code snippet below:

```tsx
import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "antd";

import logo from "./assets/tinyhouse-logo.png";

const { Header } = Layout;

export const AppHeader = () => {
  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <Link to="/">
            <img src={logo} alt="App logo" />
          </Link>
        </div>
      </div>
    </Header>
  );
};
```

The custom classes - `app-header`, `app-header__logo-search-section`, and `app-header__logo` are custom CSS classes we've already prepared before that we'll simply declare and use directly to get the intended styling and presentation.

### Code snippets in lesson manuscript

In the lesson manuscripts, you may notice entire code samples be shared with you.

```tsx
import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "antd";

import logo from "./assets/tinyhouse-logo.png";

const { Header } = Layout;

export const AppHeader = () => {
  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <Link to="/">
            <img src={logo} alt="App logo" />
          </Link>
        </div>
      </div>
    </Header>
  );
};
```

At other points in time, we'll share snippets of code to reflect the main piece of work that is being made at that period of time.

```tsx
// ...
import { Affix } from "antd";
// ...

const App = () => {
  // ...
  return (
    <Router>
      <Affix offsetTop={0} className="app__affix-header">
        <AppHeader />
      </Affix>
      <Switch>{/* ... */}</Switch>
    </Router>
  );
};
```

By following along with the lesson videos and reading the lesson manuscripts, code snippets like the above will be made clear as to what is being attempted.
