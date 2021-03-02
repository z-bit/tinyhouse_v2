# Set-up For Part II

> 📝 The master `index.css` file that is to be referenced in this lesson can be found - [here](https://gist.github.com/djirdehh/3c550d5db67f0f5ca39d170eee61f4e4).

From Part I of the course, we've prepared a `tinyhouse` folder that contains the `client` and `server` directories.

```shell
tinyhouse/
  client/
  server/
```

> We may have labeled our project directory in Part I as `tinyhouse_v1`. If so, feel free to rename the directory you'd intend to work within Part II as `tinyhouse`.

In this short lesson, we'll make some small modifications to the client and server code from Part I of the course. The first thing we'll do is update the project names of our `client/` and `server/` directories. We'll do this in the `package.json` files of each folder.

First, we'll head to the `package.json` file of our `client/` project, and we'll update the value of the name property with `"tinyhouse-client"`.

```json
  "name": "tinyhouse-client",
```

And in the `server` project, we'll do something similar and provide the name `"tinyhouse-server"`.

```json
  "name": "tinyhouse-server",
```

### `index.css`

The [Ant Design](https://ant.design/) UI framework will play the biggest role in helping style the presentation of our client application. With that said, there are some custom styling we'll provide to customize a few of the components and sections that we intend to build in our app. To avoid having to write custom CSS code in our app as we proceed through the course, we're simply going to place a pre-existing `index.css` file in a `styles/` folder that is to be kept within the `src/` directory. This `index.css` file will essentially contain all the custom CSS code we'll need in our TinyHouse project.

```shell
client/
  // ...
  src/
    // ...
    styles/
      index.css
    // ...
  // ...
```

> Grab the contents of the `index.css` file [here](https://gist.github.com/djirdehh/3c550d5db67f0f5ca39d170eee61f4e4).

If we take a look at the `index.css` file provided, we'll notice that the CSS code within is fairly straight forward. The benefit of having this file is that when we begin to write our components, we'll directly reference the classes we've created from this file to get the intended styling changes.

From the work we've done in Part I of the course, we've already imported an `index.css` file from an adjacent `styles/` folder in the `client/src/index.tsx` file, which is the root file of our React project.

```tsx
import "./styles/index.css";
```

We haven't removed any existing code that we've written from Part I yet. We'll be making changes to the `client/` and `server/` directories as we begin to proceed.
