import React from 'react'
import { List, Typography } from 'antd'
import { ListingCard } from '../../lib/components'
import { User } from '../../lib/graphql/queries'

const { Paragraph, Text, Title } = Typography

interface Props {
    userBookings: User['user']['bookings']
    bookingsPage: number
    limit: number
    setBookingsPage: (page: number) => void
}
export const UserBookings = ({ 
    userBookings, 
    bookingsPage, 
    limit,
    setBookingsPage
}: Props ) => {

    const total = userBookings ? userBookings.total : null
    const result = userBookings ? userBookings.result : null
 
    const userBookingsList = userBookings
        ? (
            <List
                grid={{
                    gutter: 8,
                    xs: 1,
                    sm: 2,
                    lg: 4,
                }}
                dataSource={result ? result : undefined}
                locale={{
                    emptyText: "You haven't made any bookings yet.",
                }}
                pagination={{
                    position: "top",
                    current: bookingsPage,
                    total: total ? total : undefined,
                    defaultPageSize: limit,
                    hideOnSinglePage: true,
                    showLessItems: true,
                    onChange: (page: number) => setBookingsPage(page),
                }}
                renderItem={(userBooking) => {
                    const bookingHistory = (
                        <div className=""user-bookings__bookings-history>
                            <div>
                               Ckeck in: <Text strong>{userBooking.checkIn}</Text> 
                            </div>
                            <div>
                               Ckeck out: <Text strong>{userBooking.checkOut}</Text> 
                            </div>
                        </div>
                    )
                    return (
                        <List.Item>
                            {bookingHistory}
                            <ListingCard listing={userBooking.listing} />
                        </List.Item>
                    )
                }}
            />
        )
        : null
    ;
    
    return (
        <div className="user-bookings">
            <Title level={4} className="user-bookings__title">
                Bookings
            </Title>
            <Paragraph className="user-bookings__description">
                This section highlights the bookings youh've made,
                and the dates associated with this bookings.
            </Paragraph>
            {userBookingsList 
                ? userBookingsList 
                : <List locale={{emptyText: 'No, no, no bookings, yet!'}} />
            }
        </div>
    )
}