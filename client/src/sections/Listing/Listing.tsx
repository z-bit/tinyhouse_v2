import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { Layout, Col, Row  } from 'antd'
import { Moment } from 'moment'
import { ErrorBanner, PageSkeleton } from '../../lib/components'
import { useScrollToTop } from '../../lib/hooks'
import { LISTING, Listing as ListingData, ListingVariables } from '../../lib/graphql/queries'
import { 
  ListingBookings, 
  ListingCreateBooking, 
  WrappedListingCreateBookingModal as ListingCreateBookingModal,
  ListingDetails 
} from '.'
import { Viewer } from '../../lib/types'

const PAGE_LIMIT = 3
const { Content } = Layout

interface MatchParams {
  id: string
}
interface Props {
  viewer: Viewer
}

export const Listing = (
  { viewer }: Props 
) => {

  useScrollToTop()

  const { id } = useParams<MatchParams>()

  const [bookingsPage, setBookingsPage] = useState(1)
  const [checkInDate,   setCheckInDate] = useState<Moment | null>(null)
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const { loading, data, error, refetch } = useQuery<ListingData, ListingVariables>(
    LISTING,
    { variables: {
        id,
        bookingsPage,
        limit: PAGE_LIMIT
    }}
  )

  const clearBooking = () => {
    setModalVisible(false)
    setCheckInDate(null)
    setCheckOutDate(null)
  }

  const refetchListing = async () => {
    await refetch()
  }

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    )
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="Failed to query listing, try again!" />
        <PageSkeleton />
      </Content>
    )
  }
  
  const listing = data ? data.listing : null
  const listingBookings = listing ? listing.bookings : null

  const listingDeatailsElement = listing ? (
    <ListingDetails listing={listing} />
  ) : null

  const listingBookingElement = listingBookings ? (
    <ListingBookings 
      listingBookings={listingBookings} 
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null

  const listingCreateBookingElement = listing ? (
    <ListingCreateBooking 
      viewer={viewer}
      host={listing.host}
      price={listing.price}
      bookingsIndex={listing.bookingsIndex}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
      setModalVisible={setModalVisible}
    /> 
  ) : null

  const listingCreateBookingModalElement =
    listing && checkInDate && checkOutDate ? (
    <ListingCreateBookingModal 
      id={listing.id}
      clearBooking={clearBooking}
      refetchListing={refetchListing}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      price={listing.price}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
    />
  ) : null

  return (
    <Content className="listings">
      <Row gutter={24} justify="space-between">
        <Col xs={24} lg={14}>
          {listingDeatailsElement}
          {listingBookingElement}
        </Col>
        <Col xs={24} lg={10}>
          {listingCreateBookingElement}
        </Col>
      </Row>
      {listingCreateBookingModalElement}
    </Content>
  ) 
}