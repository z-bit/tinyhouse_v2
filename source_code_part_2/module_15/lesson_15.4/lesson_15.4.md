# React Router Hooks

> 📝 **The Future of React Router and @reach/router** blog post can be found - [here](https://reacttraining.com/blog/reach-react-router-future/).<br />
> 📝 React Router documentation on the different Hooks that can be used can be see seen - [here](https://reacttraining.com/react-router/web/api/Hooks).<br />
> 👩‍💻 The code sample shared for this lesson contains the use of the `useParams`, `useHistory`, and `useLocation` Hooks in the client project.

React Router has started to move towards a more **hook-based API** as documented [here](https://reacttraining.com/blog/reach-react-router-future/). In version 5.x (and up), React Router provides certain Hooks to access route-specific information in our components. The newest version of React Router is **100% backward-compatible** so the capability to use the [render props pattern](https://reacttraining.com/react-router/web/api/Route/render-func) or [higher-order components](https://reacttraining.com/react-router/web/api/withRouter) from React Router **is still supported**. In this lesson, we'll discuss some changes that can be made to our app to use the new hook-based API.

Since we're able to use Hooks to access route-specific information within components, we'll no longer need to use the [`render()`](https://reacttraining.com/react-router/web/api/Route/render-func) function prop in the `<Route />` component to pass along route-specific prop objects. Though we're able to use the `component` prop to dictate which component should be shown for which `<Route />` path, we're also able to convey this by simply placing the component as a child of the `<Route />`.

```tsx
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Home } from "./components";

export default function Component() {
  return (
    <Router>
      <Switch>
          {/* render <Home /> component in the `/` route */}
          <Route exact path="/">
            <Home />
          </Route>
      </Switch>
    </Router>
  );
```

There are essentially three use cases we have in our app where certain Hooks from React Router can be used.

### `useParams()` - Access the URL parameters of a Route

A few of the section level components in our app (e.g. `<User />`, `<Listings />`, etc.) are rendered with a route that has a dynamic URL parameter (e.g. `/user/:id`). The dynamic URL parameter is primarily used to fetch information for the specific resource the page is attempting to render.

To access the URL parameters of a route, we can use the [**`useParams()`**](https://reacttraining.com/react-router/web/api/Hooks/useparams) Hook from React Router.

Here's an example of how the `useParams()` Hook can be used.

```tsx
// import the useParams() Hook
import { useParams } from "react-router-dom";

// declare the shape of the paramter in the URL
interface MatchParams {
  id: string;
}

export const Component = () => {
  // destruct the URL parameter from useParams()
  // pass the interface as a type variable to describe the shape of parameter
  const { id } = useParams<MatchParams>();

  // use the parameter
  console.log(id);
};
```

### `useHistory()` - Access the history object

The [`history`](https://reacttraining.com/react-router/web/api/history) object, within the context of React Router, is a reference to the browser's session history. We can use this `history` object to push a new entry to the history stack or in other words **direct the user to a new location**.

Here's an example of how the [**`useHistory()`**](https://reacttraining.com/react-router/web/api/Hooks/usehistory) Hook can be used to retrieve the `history` object.

```tsx
// import the useHistory() Hook
import { useHistory } from "react-router-dom";

export const Component = () => {
  // get the history object from useHistory()
  const history = useHistory();

  // access the history object
  console.log(history);
};
```

### `useLocation()` - Access the location object

The [`location`](https://reacttraining.com/react-router/web/api/location) object, within the context of React Router, provides information about the current URL.

Here's an example of how the [**`useLocation()`**](https://reacttraining.com/react-router/web/api/Hooks/uselocation) Hook can be used to retrieve the `location` object.

```tsx
// import the useLocation() Hook
import { useLocation } from "react-router-dom";

export const Component = () => {
  // get the location object from useLocation()
  const location = useLocation();

  // access the location object
  console.log(location);
};
```
