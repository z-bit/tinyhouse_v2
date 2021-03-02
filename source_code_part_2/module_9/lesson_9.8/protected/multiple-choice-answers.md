<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 9 | Searching for listings with Google's Geocoding API

#### 1. Geocoding is the process of converting human-readable address information into geographic coordinates (i.e. latitude and longitude).

**A**: True
**B**: False

**Answer**: A - True.

#### 2. If a user granted your application access to their real-time location infomation, reverse geocoding can be used to identify the city they are in.

**A**: True
**B**: False

**Answer**: A - True. Real-time location information (with a GPS for example) often provides a user's location in geographic coordinates. Therefore, reverse geocoding can be used to identify the city they are in.

#### 3. A database index helps improve the speed of:

**A**: All data retrieval operations in a database.
**B**: Specific data retrieval operations.
**C**: All data insertion operations in a database.
**D**: Specific data insertion operations.

**Answer**: B - Specific data retrieval operations. A database index is a data structure that improves the speed of **specific** data retrieval operations at the cost of additional writes and storage space to maintain the index data structure. An index on the `name` field of a collection, in MongoDB, will not help improve the speed of a query based on the `location` field of the same collection.

#### 4. In our implementation, why did we require the geocoder to at least derive the country of the location that is being searched for?

**A**: The TinyHouse application only allows for the searching of listings in countries.
**B**: To maintain good practice and ensure that the geocoder should always derive the country, city, administration area, and postal code of a location input.
**C**: To complement how Google's Geocoding API works.
**D**: Every location being searched for should have a country associated with it. If a country can't be found, this most likely means the search didn't work as intended.

**Answer**: D - Every location being searched for should have a country associated with it. If a country can't be found, this most likely means the search didn't work as intended.
