import React from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Divider, List, Typography } from 'antd'
import { Listing } from '../../lib/graphql/queries'

const { Text, Title } = Typography

interface Props {
    listingBookings: Listing['listing']['bookings']
    bookingsPage: number
    limit: number
    setBookingsPage: (page: number) => void
}
export const ListingBookings = ({ 
  listingBookings, bookingsPage, limit, setBookingsPage
}: Props ) => {

  const total = listingBookings ? listingBookings.total : null
  const result = listingBookings ? listingBookings.result : null

  const listingBookingsList = listingBookings ? (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        lg: 3,
      }}
      dataSource={result ? result : undefined}
      locale={{
        emptyText: "No bookings have been made yet.",
      }}
      pagination={{
          current: bookingsPage,
          total: total ? total : undefined,
          defaultPageSize: limit,
          hideOnSinglePage: true,
          showLessItems: true,
          onChange: (page: number) => setBookingsPage(page),
      }}
      renderItem={(listingBooking) => {
        const bookingHistory = (
          <div className="listing-bookings__bookings-history">
              <div>
                  Ckeck in: <Text strong>{listingBooking.checkIn}</Text> 
              </div>
              <div>
                  Ckeck out: <Text strong>{listingBooking.checkOut}</Text> 
              </div>
          </div>
        )
        return (
          <List.Item>
            {bookingHistory}
            <Link to={`/user/${listingBooking.tenant.id}`}>
              <Avatar src={listingBooking.tenant.avatar} size={64} shape="square" />
            </Link>
          </List.Item>
        )
      }}
    />
  ) : null

  return (
    <div className="listing-bookings">
       <Divider />
      <Title level={4} className="listing-bookings__title">
        Bookings
      </Title>
      {listingBookingsList 
        ? listingBookingsList 
        : <List locale={{ emptyText: 'No, no, no bookings, yet!' }} />
      }
    </div>
  )
}