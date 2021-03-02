<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 2 | Routing in TinyHouse

#### 1. Within the context of a web application, Routing is the process of navigating users from one location to another with the help of URLs.

**A**: True
**B**: False

**Answer**: A - True

#### 2. Server-side routing has the following advantages.

**A**: No white "blinking" state when navigating from route to route.
**B**: Initial page load is often faster.
**C**: All of the above.
**D**: None of the above.

**Answer**: B - Initial page load is often faster. When a route is visited in server-side routed applications, only the page the user is viewing is returned.

#### 3. Client-side routing has the following advantages.

**A**: Navigating between web pages is often faster and requires no page reload.
**B**: Search Engine Optimization (SEO) is optimized.
**C**: All of the above.
**D**: None of the above.

**Answer**: A - Navigating between web pages is often faster and requires no page reload. In a client-side routed application, the entire web app is returned on first load and JavaScript is often used to navigate between web pages which is faster and doesn't require a full page refresh.

#### 4. Given the following React Router configuration, which component will be rendered if the user navigates to the `/listing` route?

```tsx
const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/host" component={Host} />
        <Route exact path="/listing/:id" component={Listing} />
        <Route exact path="/listings/:location?" component={Listings} />
        <Route exact path="/user/:id" component={User} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};
```

**A**: `<Home />`
**B**: `<Listing />`
**C**: `<NotFound />`
**D**: None of the above.

**Answer**: C - `<NotFound />`. The `<Route />` with the the path of `"/listing/:id"` must have a value for the non-optional `id` parameter for the `<Listing />` component to be rendered.

#### 5. What is the purpose of the `<Switch />` component in React Router?

**A**: It helps render a defined component for a certain specific path.
**B**: It makes a redirect to a specified path when rendered in a component.
**C**: It is the router component that uses the HTML5 history API to keep UI in sync with the URL.
**D**: It renders the first child `<Route />` that matches the location.

**Answer**: D - It renders the first child `<Route />` that matches the location.
