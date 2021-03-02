<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions

## Module 2 | Routing in TinyHouse

#### 1. Within the context of a web application, Routing is the process of navigating users from one location to another with the help of URLs.

**A**: True
**B**: False

#### 2. Server-side routing has the following advantages.

**A**: No white "blinking" state when navigating from route to route.
**B**: Initial page load is often faster.
**C**: All of the above.
**D**: None of the above.

#### 3. Client-side routing has the following advantages.

**A**: Navigating between web pages is often faster and requires no page reload.
**B**: Search Engine Optimization (SEO) is optimized.
**C**: All of the above.
**D**: None of the above.

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

#### 5. What is the purpose of the `<Switch />` component in React Router?

**A**: It helps render a defined component for a certain specific path.
**B**: It makes a redirect to a specified path when rendered in a component.
**C**: It is the router component that uses the HTML5 history API to keep UI in sync with the URL.
**D**: It renders the first child `<Route />` that matches the location.
