import React from 'react'
import { CardElement, injectStripe, ReactStripeElements } from 'react-stripe-elements'
import { Modal, Button, Divider, Typography } from 'antd'
import { KeyOutlined } from '@ant-design/icons'
import { Moment } from 'moment'
import { formatPrice, displayErrorMessage, displaySuccessNotification } from '../../lib/utils'
import { useMutation } from '@apollo/react-hooks'
import { 
  CREATE_BOOKING, CreateBooking as CreateBookingData, CreateBookingVariables
} from '../../lib/graphql/mutations'


const { Paragraph, Text, Title } = Typography

interface Props {
  id: string
  clearBooking: () => void
  refetchListing: () => Promise<void>
  modalVisible: boolean
  setModalVisible: (modalVisble: boolean) => void
  price: number
  checkInDate: Moment
  checkOutDate: Moment
}

export const ListingCreateBookingModal = ({ 
  id, clearBooking, refetchListing,
  modalVisible, setModalVisible, price, checkInDate, checkOutDate, stripe 
}: Props & ReactStripeElements.InjectedStripeProps) => {

  const [createBooking, { loading }] = 
    useMutation<CreateBookingData, CreateBookingVariables>(
      CREATE_BOOKING,
      { onCompleted: () => {
          clearBooking()
          displaySuccessNotification(
            'You sucessfully booked the listing.',
            'Your booking history can be found in your User page.'
          )
          refetchListing()
        },
        onError: () => displayErrorMessage('Sorry, something went wrong, please try again!')
      }
    )

  const daysBooked = checkOutDate.diff(checkInDate, 'd')
  const listingPrice = price * daysBooked

  const handleCreateBooking = async () => {
    if (!stripe) {
      displayErrorMessage("Sorry! We were not able to conntect with Stripe.")
      return
    }

    let { token: stripeToken, error } = await stripe.createToken()
    if (stripeToken) {
      createBooking({
        variables: {
          input: {
            listingId: id,  
            source: stripeToken.id,
            checkIn: checkInDate.format('YYYY-MM-DD'),
            checkOut: checkOutDate.format('YYYY-MM-DD')
          }
        }
      })
    } else {
      const text = (error && error.message) ? (
        error.message
       ) : 'Sorry, something went wrong, please try again later!'
      
      displayErrorMessage(text)
    }

  }

  return (
    <Modal
      visible={modalVisible}
      centered
      footer={null}
      onCancel={() => setModalVisible(false)}
    >
      <div className="listing-booking-modal">
        <div className="listing-booking-modal__intro">
          <Title className="listing-booking-modal__intro-title">
            Book your trip
          </Title>
          <Title className="listing-booking-modal__intro-title">
            <KeyOutlined />
          </Title>
         
          <Paragraph>
            Enter your payment information to book the listing <br />
            from 
            {'  '}<Text mark strong>{checkInDate.format('DD/MM/YY')}</Text>
            {'  '} to
            {'  '}<Text mark strong>{checkOutDate.format('DD/MM/YY')}</Text>
          </Paragraph>
        </div>

        <Divider />
        
        <div className="listing-booking-modal__charge-summary">
          <Paragraph>
            {formatPrice(price, false)} * {daysBooked} days = {' '}
            <Text strong>{formatPrice(listingPrice, false)}</Text>
          </Paragraph>
          <Paragraph className="listing-booking-modal__charge-summary-total">
            Total = <Text strong mark>{formatPrice(listingPrice, false)}</Text>
          </Paragraph>
        </div>

        <Divider />

        <div className="listing-booking-modal__stripe-card-section">
          <CardElement
            hidePostalCode
            className="listing-booking-modal__stripe-card"
          />
          <Button 
            size="large" type="primary" loading={loading}
            className="listing-booking-modal__cta"
            onClick={handleCreateBooking}
          >
            Book
          </Button>
        </div>

      </div>
    </Modal>
  )
}

export const WrappedListingCreateBookingModal = injectStripe(ListingCreateBookingModal)