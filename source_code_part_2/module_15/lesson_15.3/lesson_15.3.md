# useLayoutEffect & Window Scroll

If we were to navigate from page to page in our app, we'll notice that in certain cases the window scroll position of the page _doesn't_ scroll to the top when we would expect it to.

Since our application is a client-side app, the server returns a single web-page at the beginning. When we navigate from route to route (i.e. page to page), the parent `<App />` component simply determines which child component should be shown (e.g. `<Host />` component is shown in the `/host` route). When different child components get rendered as we move from page to page, the scroll position of the window can remain the same which can cause the issue of having the new page that is shown be in a scroll position close to the bottom of the page.

To avoid this, we can have an effect run whenever a section-level child component is rendered to scroll the window to the top of the page. To run an effect with DOM specific changes, we should use the [**`useLayoutEffect`**](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) Hook from React. This is because the `useLayoutEffect` Hook fires synchronously _after_ all DOM mutations and thus should be used to read and/or change layout in the DOM.

We'll consolidate the effect we want to run within a custom effect we'll call `useScrollToTop`. We'll create this custom effect in a `/hooks` folder within the `src/lib/` directory of our client application.

```shell
client
  src/
    lib/
      // ...
      hooks/
        useScrollToTop/
          index.ts
      index.ts
  // ...
// ...
```

In the `src/lib/hooks/index.ts` file, we'll re-export the soon to be created `useScrollToTop()` function.

```ts
export * from "./useScrollToTop";
```

In the `src/lib/hooks/useScrollToTop/index.ts` file, we'll export and use the `useLayoutEffect` Hook from React. In the effect callback, we'll use the [`window.scrollTo()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo) to scroll the user to the beginning of the webpage (i.e. to the `0` pixel position for the horizontal and vertical axes of the webpage).

```ts
import { useLayoutEffect } from "react";

export const useScrollToTop = () => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};
```

In the separate section-level components, we can place the `useScrollToTop()` function in the component to have the window scrolled to the top whenever these components are rendered.

#### `<Home />`

```tsx
// ...
import { useScrollToTop } from "../../lib/hooks";

export const Home = ({ history }: RouteComponentProps) => {
  // ...

  useScrollToTop();

  // ...
};
```

#### `<Host />`

```tsx
// ...
import { useScrollToTop } from "../../lib/hooks";

export const Host = ({ viewer, form }: Props & FormComponentProps) => {
  // ...

  useScrollToTop();

  // ...
};
```

#### `<Listing />`

```tsx
// ...
import { useScrollToTop } from "../../lib/hooks";

export const Listing = ({ viewer, match }: Props & RouteComponentProps<MatchParams>) => {
  // ...

  useScrollToTop();

  // ...
};
```

#### `<Listings />`

```tsx
// ...
import { useScrollToTop } from "../../lib/hooks";

export const Listings = ({ match }: RouteComponentProps<MatchParams>) => {
  // ...

  useScrollToTop();

  // ...
};
```

#### `<Login />`

```tsx
// ...
import { useScrollToTop } from "../../lib/hooks";

export const Login = ({ setViewer }: Props) => {
  // ...

  useScrollToTop();

  // ...
};
```

#### `<Stripe />`

```tsx
// ...
import { useScrollToTop } from "../../lib/hooks";

export const Stripe = ({ viewer, setViewer, history }: Props & RouteComponentProps) => {
  // ...

  useScrollToTop();

  // ...
};
```

#### `<User />`

```tsx
// ...
import { useScrollToTop } from "../../lib/hooks";

export const User = ({
  viewer,
  setViewer,
  match
}: Props & RouteComponentProps<MatchParams>) => {
  // ...

  useScrollToTop();

  // ...
};
```

With these changes, if we were to navigate from route to route in our app, we'll notice the window scroll position being placed at the top as we navigate!

> **Note:** If we were to have an app that needed this behavior for a significant number of components, we would probably look to have a single effect in the parent that places the window scroll position at the top whenever there is a change in route.
