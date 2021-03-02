import React, { useState, FormEvent } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import { 
  Button, Form, Input, InputNumber, Layout, Radio, Typography, Upload 
} from 'antd'
//import { FormComponentProps } from 'antd/lib/form'
import { Viewer } from '../../lib/types'
import { useScrollToTop } from '../../lib/hooks'
import { ListingType } from '../../lib/graphql/globalTypes'
import { 
  HomeTwoTone, AppstoreTwoTone, PlusOutlined, LoadingOutlined,  
} from '@ant-design/icons'
import { displayErrorMessage, displaySuccessNotification, iconColor } from '../../lib/utils'
import { UploadChangeParam } from 'antd/lib/upload'
import {
  HOST_LISTING, HostListing as HostListingData, HostListingVariables
} from '../../lib/graphql/mutations'


const { Content } = Layout
const { Text, Title } = Typography
const { Item } = Form

interface Props {
  viewer: Viewer

}
export const Host = ({ viewer }: Props) => {

  useScrollToTop()

  const [imageLoading, setImageLoading] = useState(false)
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  const [hostListing, { loading, data }] = 
  useMutation<HostListingData, HostListingVariables>(HOST_LISTING,
    {
      onCompleted: () => {
        displaySuccessNotification('Listing sucessfully created!')

      },
      onError: () => displayErrorMessage(
        "Sorry! We weren't able to create your listing. Please try agan later."
      )
    }
  ) 


  const [form] = Form.useForm()

  if (!viewer || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            You'll have to be signed in and connected to Stripe to host a listing!
          </Title>
          <Text type="secondary">
            We only allow users who've signed in to our application and have connected to Stripe to host a new listing.
            You can sign in at the <Link to="/login">login</Link> page and connect with Stripe shortly after.
          </Text>
        </div>
      </Content>  
    )
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
             Please wait!
          </Title>
          <Text type="secondary">We are creating your listing now.</Text>
        </div>
      </Content>  
    )
  }

  if (data && data.hostListing) {
    return (
      <Redirect to={`/listings/${data.hostListing.id}`} />
    )
  }

  const handleImageUpload = (info: UploadChangeParam) => {
   
    const { file } = info

    if (file.status === 'uploading') {
      setImageLoading(true)
      return
    }  


    if (file.status === 'done' && file.originFileObj) {
        getBase64(file.originFileObj, imageBase64 => {
          setImageBase64(imageBase64)
          setImageLoading(false)
      })  
    }
  }
 
  

  const submitHostListing = (evt: FormEvent) => {
    form.validateFields().then(values => {
      const { address, city, state, zip, price } = values
      const fullAddress = `${address}, ${city}, ${state}, ${zip}`
      delete values.city
      delete values.state
      delete values.zip

      const input = {
        ...values,
        address: fullAddress,
        image: imageBase64, //'ShortButFakeBase64Image', //
        price: price * 100,
      }

      console.log(input)
     
      hostListing({ 
        variables: { input }
      })
    })
  }

  return (
    <Content className="host-content">
      <Form layout="vertical" form={form} onFinish={submitHostListing}>
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form we collect some basic and additional information about your listing.
          </Text>
        </div>

        <Item label="Home Type" name="type" rules={[
          {required: true, message: 'Please select a home type.'}
        ]}>
          <Radio.Group>
            <Radio.Button value={ListingType.HOUSE}>
              <HomeTwoTone style={{ paddingRight: "1em" }}/>
              <span>House</span>
            </Radio.Button>
            <Radio.Button value={ListingType.APARTMENT}>
              <AppstoreTwoTone style={{ paddingRight: "1em" }} />
              Apartment
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item label="Max # of Guests" name="numOfGuests" rules={[
          {required: true, message: 'Please select the maximum number of guests.'}
        ]}>
          <InputNumber min={1} placeholder="4" />
        </Item>

        <Item label="Titel" extra="max. 45 characters" name="title" rules={[
          {required: true, message: 'Please enter a title for you listing.'}
        ]}>
          <Input maxLength={45} placeholder="The iconic and luxurious Bel-Air mansion" />
        </Item>
        
        <Item label="Description of your listing" extra="max. 400 characters" 
          name="description" rules={[
          {required: true, message: 'Please enter a description for your listing.'}
        ]}>
          <Input.TextArea 
            rows={3} 
            maxLength={400} 
            placeholder="Modern, clean and iconic home of the Fresh Prince. Situated in the heart of Bel-Ait, Los Angeles."
          />
        </Item>
        
        <Item label="Address" name="address" rules={[
          {required: true, message: 'Please enter a street address.'}
        ]}>
          <Input placeholder="351 North Bristol Avenue" />
        </Item>

        <Item label="City/Town" name="city" rules={[
          {required: true, message: 'Please enter the city for your listing.'}
        ]}>
          <Input placeholder="Los Angeles" />
        </Item>

        <Item label="State/Provice" name="state" rules={[
          {required: true, message: 'Please enter a state or province for your listing.'}
        ]}>
          <Input placeholder="California" />
        </Item>

        <Item label="Zip/Postal Code" name="zip" rules={[
          {required: true, message: 'Please enter a zip (postcode).'}
        ]}>
          <Input placeholder="Please enter a zip code for your listing" />
        </Item>

        <Item label="Image" name="image" extra="max. 1 MB and of type JPG or PNG" 
          rules={[
            {required: true, message: 'Please provide an image for your listing.'}
          ]}
        >
          <div className="host__form-image-upload">
            <Upload 
              name="image" 
              listType="picture-card" 
              showUploadList={false}
              //action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              action="/statusDone"
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
            >
              {imageBase64 ? (
                <img src={imageBase64} alt="Listing" />
              ) : (
                <div>
                  {imageLoading ? (
                    <LoadingOutlined style={{color: iconColor}} />
                  ) : (
                    <PlusOutlined style={{color: iconColor}}/>
                  )} 
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </Item>

        <Item label="Price" extra="All prices in GBP (£) per day" name="price"
          rules={[{required: true, message: 'Please enter a price.'}]}
        >
          <InputNumber min={0} placeholder="120" />
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Item>
      </Form>
    </Content>  
  )
}


const beforeImageUpload = (file: File) => {
  const wrongType = file.type !== "image/jpeg" && file.type !== "image/png" 
  const worngSize = file.size > 2 * 1024 * 1024

  let text = ''
  if (wrongType) text += 'Image not of type JPG or PNG. '
  if (worngSize) text += 'Image size greater than 2 MB. '
  if (text.length) {
    displayErrorMessage(text)
    return false
  }

  return true
} 

const getBase64 = (
  img: File | Blob,
  callback: (imageBase64: string) => void  
) => {
  const reader = new FileReader()
  //reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
  reader.onload = () => callback(reader.result as string)
}
