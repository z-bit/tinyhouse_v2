---
title: Google Maps Node Package Update
slug: google-maps-node-package-update
description: This section discusses the migration from @google/maps to @googlemaps/google-maps-services-js.
---

# Google Maps Node Package Update

Throughout the course, we have been interacting with the Google Maps API using the [`@google/maps`](https://www.npmjs.com/package/@google/maps) Node package. However, Google recently deprecated the their old `@google/maps` Node package, and published a new [`@googlemaps/google-maps-services-js`](https://www.npmjs.com/package/@googlemaps/google-maps-services-js) Node package.

This section discusses the migration from `@google/maps` to `@googlemaps/google-maps-services-js`.

First, we will uninstall the old packages:

```shell
npm uninstall --save @google/maps @types/google__maps
```

Next, we will install the new package. The new package comes with TypeScript definitions. So, we do not need to install any packages from the DefinitelyTyped team.

```shell
npm install @googlemaps/google-maps-services-js
```

The primary differences are:

1. In the new package, instead of providing our Google Maps API key when we create the `maps` client, we pass it with every request.

2. The new package also provides TypeScript definitions for individual address components. For example: we can use `AddressType.country` instead of `"country"`.

3. In the new package, the `res.json` property was renamed to `res.data`

### Old `@google/maps` Node Package:

```ts
// server/src/lib/api/Google.ts

import { createClient, AddressComponent } from "@google/maps";

const maps = createClient({ key: `${process.env.G_GEOCODE_KEY}`, Promise });

const parseAddress = (addressComponents: AddressComponent[]) => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    if (component.types.includes("country")) {
      country = component.long_name;
    }

    if (component.types.includes("administrative_area_level_1")) {
      admin = component.long_name;
    }

    if (component.types.includes("locality") || component.types.includes("postal_town")) {
      city = component.long_name;
    }
  }

  return { country, admin, city };
};

export const Google = {
  // ...

  geocode: async (address: string) => {
    const res = await maps.geocode({ address }).asPromise();

    if (res.status < 200 || res.status > 299) {
      throw new Error("failed to geocode address");
    }

    return parseAddress(res.json.results[0].address_components);
  },
};
```

### New `@googlemaps/google-maps-services-js` Node Package:

```ts
// server/src/lib/api/Google.ts

import {
  Client,
  AddressComponent,
  AddressType,
  GeocodingAddressComponentType,
} from "@googlemaps/google-maps-services-js";

const maps = new Client({});

const parseAddress = (addressComponents: AddressComponent[]) => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    if (component.types.includes(AddressType.country)) {
      country = component.long_name;
    }

    if (component.types.includes(AddressType.administrative_area_level_1)) {
      admin = component.long_name;
    }

    if (
      component.types.includes(AddressType.locality) ||
      component.types.includes(GeocodingAddressComponentType.postal_town)
    ) {
      city = component.long_name;
    }
  }

  return { country, admin, city };
};

export const Google = {
  // ...

  geocode: async (address: string) => {
    if (!process.env.G_GEOCODE_KEY) throw new Error("missing Google Maps API key");

    const res = await maps.geocode({
      params: { address, key: process.env.G_GEOCODE_KEY },
    });

    if (res.status < 200 || res.status > 299) {
      throw new Error("failed to geocode address");
    }

    return parseAddress(res.data.results[0].address_components);
  },
};
```
