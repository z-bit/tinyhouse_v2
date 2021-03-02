# Module 11 Summary

> 📝 This module's quiz can be found - [here](./protected/multiple-choice-questions.pdf).<br/>
> 🗒️ Solutions for this module's quiz can be found - [here](./protected/multiple-choice-answers.pdf).

In this module, we've worked on the functionality to have users host (i.e. create) listings in the TinyHouse application.

## Server Project

### `src/graphql/typeDefs.ts`

In our GraphQL API type definitions of our server project, we introduced one new root-level mutation field labeled `hostListing`.

```graphql
  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
    connectStripe(input: ConnectStripeInput!): Viewer!
    disconnectStripe: Viewer!
    hostListing(input: HostListingInput!): Listing!
  }
```

The `hostListing` mutation accepts an `input` that is to have an object type of `HostListingInput`. The `input` is to contain a series of fields and field values that describe the listing that is to be created.

```graphql
  input HostListingInput {
    title: String!
    description: String!
    image: String!
    type: ListingType!
    address: String!
    price: Int!
    numOfGuests: Int!
  }
```

### `src/graphql/resolvers/Listing/index.ts`

We've constructed the resolver function for the `hostListing` mutation in the `listingResolvers` map within the `src/graphql/resolvers/Listing/index.ts` file. The `hostListing()` resolver function at first calls a utility function labeled `verifyHostListingInput()` that provides simple server-side validations to ensure the information in the `input` is valid.

```ts
const verifyHostListingInput = ({
  title,
  description,
  type,
  price
}: HostListingInput) => {
  if (title.length > 100) {
    throw new Error("listing title must be under 100 characters");
  }
  if (description.length > 5000) {
    throw new Error("listing description must be under 5000 characters");
  }
  if (type !== ListingType.Apartment && type !== ListingType.House) {
    throw new Error("listing type must be either an apartment or house");
  }
  if (price < 0) {
    throw new Error("price must be greater than 0");
  }
};
```

In the `hostListing()` resolver, when the information in the `input` is valid, we then authorize the viewer making the request. We retrieve the `country`, `admin`, and `city` information for the location of the listing being created. Finally, we insert a new listing document to the `"listings"` collection and update the `listings` field for the user document of the viewer creating the listing.

```ts
export const listingResolvers: IResolvers = {
  // ...
    hostListing: async (
      _root: undefined,
      { input }: HostListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Listing> => {
      verifyHostListingInput(input);

      let viewer = await authorize(db, req);
      if (!viewer) {
        throw new Error("viewer cannot be found");
      }

      const { country, admin, city } = await Google.geocode(input.address);
      if (!country || !admin || !city) {
        throw new Error("invalid address input");
      }

      const insertResult = await db.listings.insertOne({
        _id: new ObjectId(),
        ...input,
        bookings: [],
        bookingsIndex: {},
        country,
        admin,
        city,
        host: viewer._id
      });

      const insertedListing: Listing = insertResult.ops[0];

      await db.users.updateOne(
        { _id: viewer._id },
        { $push: { listings: insertedListing._id } }
      );

      return insertedListing;
    }
  // ...
};
```

## Client Project

### `src/lib/graphql/mutations/HostListing/index.ts`

On the client project, we create the GraphQL document for the new root-level mutation fields - `hostListing`. When the `hostListing` mutation is to be executed successfully, we simply return the value of the `id` of the new listing that has been created.

```ts
import { gql } from "apollo-boost";

export const HOST_LISTING = gql`
  mutation HostListing($input: HostListingInput!) {
    hostListing(input: $input) {
      id
    }
  }
`;
```

### `src/sections/Host/index.tsx`

In the `<Host />` component that is to be rendered in the `/host` route of our app, we create the form where the user can provide the necessary information for a new listing. When the form is submitted, the `hostListing` mutation is triggered and when successful, the user is redirected to the `/listing/:id` route of the newly created listing.

For building the form, we leverage Ant Design's [`<Form />`](https://ant.design/components/form/) component to help validate fields in the form with certain rules and to collect information provided by the user. When an image is uploaded for a new listing, we encode the image to base64 format before sending it as part of the input the server expects.

```tsx
export const Host = ({ viewer, form }: Props & FormComponentProps) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);

  const [hostListing, { loading, data }] = useMutation<
    HostListingData,
    HostListingVariables
  >(HOST_LISTING, {
    onCompleted: () => {
      displaySuccessNotification("You've successfully created your listing!");
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! We weren't able to create your listing. Please try again later."
      );
    }
  });

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;

    if (file.status === "uploading") {
      setImageLoading(true);
      return;
    }

    if (file.status === "done" && file.originFileObj) {
      getBase64Value(file.originFileObj, imageBase64Value => {
        setImageBase64Value(imageBase64Value);
        setImageLoading(false);
      });
    }
  };

  const handleHostListing = (evt: FormEvent) => {
    evt.preventDefault();

    form.validateFields((err, values) => {
      if (err) {
        displayErrorMessage("Please complete all required form fields!");
        return;
      }

      const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;

      const input = {
        ...values,
        address: fullAddress,
        image: imageBase64Value,
        price: values.price * 100
      };
      delete input.city;
      delete input.state;
      delete input.postalCode;

      hostListing({
        variables: {
          input
        }
      });
    });
  };

  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            You'll have to be signed in and connected with Stripe to host a listing!
          </Title>
          <Text type="secondary">
            We only allow users who've signed in to our application and have connected
            with Stripe to host new listings. You can sign in at the{" "}
            <Link to="/login">/login</Link> page and connect with Stripe shortly after.
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Please wait!
          </Title>
          <Text type="secondary">We're creating your listing now.</Text>
        </div>
      </Content>
    );
  }

  if (data && data.hostListing) {
    return <Redirect to={`/listing/${data.hostListing.id}`} />;
  }

  const { getFieldDecorator } = form;

  return (
    <Content className="host-content">
      <Form layout="vertical" onSubmit={handleHostListing}>
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we'll collect some basic and additional information about your
            listing.
          </Text>
        </div>

        <Item label="Home Type">
          {getFieldDecorator("type", {
            rules: [
              {
                required: true,
                message: "Please select a home type!"
              }
            ]
          })(
            <Radio.Group>
              <Radio.Button value={ListingType.APARTMENT}>
                <Icon type="bank" style={{ color: iconColor }} /> <span>Apartment</span>
              </Radio.Button>
              <Radio.Button value={ListingType.HOUSE}>
                <Icon type="home" style={{ color: iconColor }} /> <span>House</span>
              </Radio.Button>
            </Radio.Group>
          )}
        </Item>

        <Item label="Max # of Guests">
          {getFieldDecorator("numOfGuests", {
            rules: [
              {
                required: true,
                message: "Please enter a max number of guests!"
              }
            ]
          })(<InputNumber min={1} placeholder="4" />)}
        </Item>

        <Item label="Title" extra="Max character count of 45">
          {getFieldDecorator("title", {
            rules: [
              {
                required: true,
                message: "Please enter a title for your listing!"
              }
            ]
          })(
            <Input
              maxLength={45}
              placeholder="The iconic and luxurious Bel-Air mansion"
            />
          )}
        </Item>

        <Item label="Description of listing" extra="Max character count of 400">
          {getFieldDecorator("description", {
            rules: [
              {
                required: true,
                message: "Please enter a description for your listing!"
              }
            ]
          })(
            <Input.TextArea
              rows={3}
              maxLength={400}
              placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
            />
          )}
        </Item>

        <Item label="Address">
          {getFieldDecorator("address", {
            rules: [
              {
                required: true,
                message: "Please enter a address for your listing!"
              }
            ]
          })(<Input placeholder="251 North Bristol Avenue" />)}
        </Item>

        <Item label="City/Town">
          {getFieldDecorator("city", {
            rules: [
              {
                required: true,
                message: "Please enter a city (or region) for your listing!"
              }
            ]
          })(<Input placeholder="Los Angeles" />)}
        </Item>

        <Item label="State/Province">
          {getFieldDecorator("state", {
            rules: [
              {
                required: true,
                message: "Please enter a state (or province) for your listing!"
              }
            ]
          })(<Input placeholder="California" />)}
        </Item>

        <Item label="Zip/Postal Code">
          {getFieldDecorator("postalCode", {
            rules: [
              {
                required: true,
                message: "Please enter a zip (or postal) code for your listing!"
              }
            ]
          })(<Input placeholder="Please enter a zip code for your listing!" />)}
        </Item>

        <Item
          label="Image"
          extra="Images have to be under 1MB in size and of type JPG or PNG"
        >
          <div className="host__form-image-upload">
            {getFieldDecorator("image", {
              rules: [
                {
                  required: true,
                  message: "Please provide an image for your listing!"
                }
              ]
            })(
              <Upload
                name="image"
                listType="picture-card"
                showUploadList={false}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                beforeUpload={beforeImageUpload}
                onChange={handleImageUpload}
              >
                {imageBase64Value ? (
                  <img src={imageBase64Value} alt="Listing" />
                ) : (
                  <div>
                    <Icon type={imageLoading ? "loading" : "plus"} />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
              </Upload>
            )}
          </div>
        </Item>

        <Item label="Price" extra="All prices in $USD/day">
          {getFieldDecorator("price", {
            rules: [
              {
                required: true,
                message: "Please enter a price for your listing!"
              }
            ]
          })(<InputNumber min={0} placeholder="120" />)}
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};
```

## Moving forward

In the next module, we'll investigate to see if there's a better way of storing the newly created images for listings in our database.
