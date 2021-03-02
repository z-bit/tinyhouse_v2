<img src="../../../images/tinyhouse-logo.png" width="60%"/>

# Quiz Questions | Answers

## Module 12 | Cloud-Based Image & Video Management Service

#### 1. Using a cloud-based image management service can help make our client app feel more responsive.

**A**: True
**B**: False

**Answer**: A - True. This is because we're not transmitting all the image data at once during a server request. When we pass the URLs to the HTML `<img />` tags in our client, they will load the individual images in parallel.

#### 2. Using a cloud-based image management service has no effect in helping reduce the amount of storage data in a database.

**A**: True
**B**: False

**Answer**: B - False. With a cloud-based image management service, we won't need to store images directly into our database anymore since we can store image URL links instead. This makes our database smaller which increases the speed of certain database operations, such as copying, reading, backups, etc.

#### 3. We used Cloudinary in our client application to store a listing image on the cloud before the image URL was sent to the server to be stored in the database.

**A**: True
**B**: False

**Answer**: B - False. We've made the client pass the image as a base64 encoded value where in the server do we then store the image on the cloud and save the image URL in the database.
