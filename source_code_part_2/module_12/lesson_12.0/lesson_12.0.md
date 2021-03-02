# Module 12 Introduction

In the last module, we were able to build the functionality to allow a user to host a new listing of their choice by providing the necessary information for a listing. When it comes to having an image be provided for a new listing, the server receives the image and stores it in the database as a base64 encoded string. Storing images this way takes a lot of space in our database.

In this module, we'll

-   Discuss our existing approach to storing images of new listings.
-   See how we can leverage [**Cloudinary**](http://cloudinary.com/), a cloud-based image (and video) management service, to store images for new listings _on the cloud_.
