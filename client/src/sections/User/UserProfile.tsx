import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Avatar, Button, Card, Divider, Tag, Typography } from 'antd'
import { formatPrice, displaySuccessNotification, displayErrorMessage } from '../../lib/utils'
import { DISCONNECT_STRIPE, DisconnectStripe as DisconnectStripeData} from '../../lib/graphql/mutations'
import { User as UserData } from '../../lib/graphql/queries'
import { Viewer } from '../../lib/types'

interface Props {
    user: UserData['user'] // look-up- (indexed-access-) types
    viewer: Viewer
    setViewer: (viewer: Viewer) => void
    viewerIsUser: boolean
    handleUserRefetch: () => Promise<void>
}
const { Paragraph, Text, Title } = Typography
const id = process.env.REACT_APP_STRIPE_CLIENT_ID
const stripeAuthUrl =
  `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${id}&scope=read_write`
;

export const UserProfile = ({ 
  user, viewer, setViewer, viewerIsUser, handleUserRefetch 
}: Props) => {

  const [disconnectStripe, { loading }] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    { 
      onCompleted: data => {
        setViewer({ ...viewer, hasWallet: data.disconnectStripe.hasWallet })
        if (data && data.disconnectStripe) {
          displaySuccessNotification(
            "You are disconnected from Stripe.",
            "You have to reconnect to Stripe in order to create listings."
          )
        }
        handleUserRefetch()
      },
      onError: () => {
        displayErrorMessage("Sorry, diconnecting Stripe failed. Please try again later.")
      }
    }
  )
  
  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl
  }

  const additionalDetails = user.hasWallet ? (
    <>
      <Paragraph>
        <Tag color="green">Stripe Registered</Tag>
      </Paragraph>
      <Paragraph>
        Income Earned: {" "}
        <Text strong>
          {formatPrice(user.income ? user.income : 0)}
        </Text>
      </Paragraph>
      <Button 
        type="primary" 
        className="user-profile__details-cta" 
        loading={loading}
        onClick={() => disconnectStripe()}
      >
        Disconnect Stripe
      </Button>
      <Paragraph type="secondary">
        By disconnecting, you won't be able to receive &nbsp;
        <Text strong>any further payments</Text> This will prevent users
        from booking listings that you might have already created.
      </Paragraph>
    </>
  ) : (
    <>
      <Paragraph>
        Interested in becoming a Tinihouse host?
        Register with your Stripe account!    
      </Paragraph>
      <Button 
        type="primary" 
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
          Connect with Stripe
      </Button>
      <Paragraph type="secondary">
        Tinihouse uses <a 
          href="https://stripe.com/en-Us/connect"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe
        </a> 
        to help transfer your earnings in secure and trusted manner. 
      </Paragraph>
    </>
  ) 

  const additionalDetailsSection = viewerIsUser? (
    <>
      <Divider />
      <div className="user-profile__details" >
        <Title level={4}>Additional Details</Title>
        {additionalDetails}
      </div>
    </>
  ) : null
  

  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar size={100} src={user.avatar} />
        </div> 
        <Divider />
        <div className="user-profile__details">
          <Title level={4}>Details</Title>
          <Paragraph>
            Name: <Text strong>{user.name}</Text>   
          </Paragraph> 
          <Paragraph>
            Contact: <Text strong>{user.contact}</Text>    
          </Paragraph>    
        </div> 
        {additionalDetailsSection}
      </Card>
    </div>
  )
}
