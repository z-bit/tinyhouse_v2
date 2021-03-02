<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 15 | Bonus Module

#### 1. What is the purpose of the `useLayoutEffect` Hook in React?

**A**: To run side-effects that depend on reading the layout of the DOM (Document Object Model).
**B**: To run side-effects.
**C**: To return a memoized value.
**D**: To return a mutable ref object that is to persist for the lifetime of the component.

**Answer**: A - To run side-effects that depend on reading the layout of the DOM (Document Object Model).

#### 2. The `fetchPolicy` option in React Apollo helps specify how a component is to interact with the Apollo data cache.

**A**: True
**B**: False

**Answer**: A - True.

#### 3. What does the `useParams()` Hook in React Router achieve?

**A**: It allows components to access the URL parameters of a route and retrieve the `history` object which is a reference to the browser's session history.
**B**: It allows components to receive information about the current URL location.
**C**: It allows components to access the URL parameters of a route.
**D**: It helps components get access to match data without rendering a `<Route />`.

**Answer**: C - It allows components to access the URL parameters of a route.

#### 4. With the presence of certain Hooks in React Router, we no longer need to use the `<Route />` component to help determine which UI element/component should be shown for which URL path.

**A**: True
**B**: False

**Answer**: B - False. With some of the React Router Hooks, we're able to access the `history` and `location` instances, and retrieve the values of URL parameters. We however still need the `<Route />` component to determine which UI element/component is to be shown for which URL.
