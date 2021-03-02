---
title: Jest & React Testing Library
description: In this lesson, we'll talk about the two main testing tools we'll use to test our React components - Jest & React Testing Library.
privateVideoUrl: https://fullstack.wistia.com/medias/k3w7owghiz
---

# Jest & React Testing Library

We'll be using two primary testing tools to test our React components.

- [Jest](https://jestjs.io/en/).
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro).

## Jest

[Jest](https://jestjs.io/en/) is a framework for writing JavaScript tests. It allows us to specify our test suites with `describe` and `it` blocks. We use the `describe` function to segment each logical unit of tests and inside that we can use the `it` function for each expectation we'd want to assert.

Jest also comes with a large suite of [`expect` assertions](https://jestjs.io/docs/en/expect). These assertions gives us access to a number of "matchers" that let us validate different things. For example:

```js
expect(value).toBe(something); // except value to be something
expect(func).toHaveBeenCalled(); // except func to have been called
expect(value).not.toBeNull(); // except value not to be null
```

> Be sure to check out Jest's [`expect` assertions](https://jestjs.io/docs/en/expect) documentation to see a list of all the different assertions that can be made.

Among other things, Jest also comes with a lot more functionality such as [mocking support](https://jestjs.io/docs/en/mock-functions) and [snapshot testing](https://jestjs.io/docs/en/snapshot-testing). A huge advantage to using Jest is all of this functionality often comes with minimal to no configuration/set-up.

## React Testing Library

[React Testing Library](https://testing-library.com/docs/react-testing-library/intro) is a lightweight library, that works with any testing framework to provide a set of helper methods to help test React components. A key aspect to this library is that it provides methods to test components _without_ focusing on implementation details.

We'll go through an example testing scenario to illustrate how the React Testing Library can be used. Assume we had a simple component that displayed a counter that when clicked - simply increments the value of a number in the page. This example comes from the example shown in the React docs for [Using the State Hook](https://reactjs.org/docs/hooks-state.html).

```jsx
import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

If we wanted to write unit tests for this component, there are two underlying test cases that we can think about conducting.

- Component displays a count of 0 when initialized.
- When a user clicks the button, the number displayed in the UI is incremented by one.

How would we go about creating these tests? Should we inspect the `count` state property and observe its value in our test? This would involve testing the component's _implementation_ which goes against how React Testing Library was created to do. Instead, React Testing Library provides a [series of queries](https://testing-library.com/docs/react-testing-library/cheatsheet) to help query for DOM nodes in our component to conduct our tests.

Assuming Jest and React Testing Library is installed in the app we're working on, we can prepare the two tests we have in mind.

```js
import React from "react";
import App from "./App";

describe("App", () => {
  it("displays a count of 0 when initialized", () => {
    // test 1
  });

  it("increments count by 1 when button is clicked", () => {
    // test 2
  });
});
```

From React Testing Library, we can import and use a `render()` function which helps render React components and provides a series of useful methods we can use to test our component.

```js
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('displays a count of 0 when initialized', () => {
    const { ... } = render(<App></App>);
  });

  it('increments count by 1 when button is clicked', () => {
    // test 2
  });
});
```

For our first test, we can use the `render()` function to render our `App` component and we'll destruct a `queryByText` helper.

```js
import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("displays a count of 0 when initialized", () => {
    const { queryByText } = render(<App></App>);
  });

  it("increments count by 1 when button is clicked", () => {
    // test 2
  });
});
```

`queryByText` can help us query for DOM in our UI that has the text we might be looking for. For example, we can query and assert the presence of the text we expect to see when the `App` component first mounts.

```jsx
import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("displays a count of 0 when initialized", () => {
    const { queryByText } = render(<App></App>);

    const text = queryByText("You clicked 0 times");

    expect(text).not.toBeNull();
  });

  // ...
});
```

In our first test, we're essentially asserting the presence of the text `"You clicked 0 times"` in our component. If this text was to not exist, our assertion will fail since the `queryByText` method will return `null`.

We can create our second test along the same lines however in this instance, we'll want to _invoke the user action that we want_. The user action we want in our second test is the capability to have the user actually click the button. To help us do this, we can import a `fireEvent` method from React Testing Library which we can use to fire events in our test. Additionally, we can use another utility labeled `getByRole` to retrieve the DOM node in our component that is the button itself.

```jsx
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  // ...

  it("increments count by 1 when button is clicked", () => {
    const { getByRole, queryByText } = render(<App></App>);
  });
});
```

We can then prepare our action in our test by using the `fireEvent` function and triggering a click event in the button. Once the event has been made, we can look to assert the presence of the text we expect to see.

```jsx
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  // ...

  it("increments count by 1 when button is clicked", () => {
    const { getByRole, queryByText } = render(<App></App>);

    fireEvent.click(getByRole("button"));

    expect(queryByText("You clicked 0 times")).toBeNull();
    expect(queryByText("You clicked 1 times")).not.toBeNull();
  });
});
```

## Further reading

A few other resources that will aid you greatly as you compose unit tests:

- React Testing Library's [Guiding Principles](https://testing-library.com/docs/guiding-principles).
- React Testing Library documentation on [Which query should I use?](https://testing-library.com/docs/guide-which-query).
