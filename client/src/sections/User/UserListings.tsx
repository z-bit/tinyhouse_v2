import React from 'react'
import { List, Typography } from 'antd'
import { ListingCard } from '../../lib/components'
import { User } from '../../lib/graphql/queries'

const { Paragraph, Title } = Typography

interface Props {
    userListings: User['user']['listings']
    listingsPage: number
    limit: number 
    setListingsPage: (page: number) => void
}
export const UserListings = ({ 
    userListings, 
    listingsPage, 
    limit,
    setListingsPage
}: Props ) => {

    const { total, result } = userListings
    const myTotal = total ? total : 0
    
    const userListingsList = (
        <List
            grid={{
                gutter: 8,
                xs: 1,      // <  576
                sm: 2,      // >= 576
                md: 3,      // >= 768
                lg: 4,      // >= 992
                xl: 5,      // >=1200 
                xxl: 6,     // >=1600
            }}
            dataSource={result}
            locale={{
                emptyText: "User does'n have any listings yet.",
            }}
            pagination={{
                position: "top",
                current: listingsPage,
                total: myTotal,
                defaultPageSize: limit,
                hideOnSinglePage: true,
                showLessItems: true,
                onChange: (page: number) => setListingsPage(page),
            }}
            renderItem={(userListing) => (
                <List.Item>
                    <ListingCard listing={userListing} />
                </List.Item>
            )}
        />
    )

    return (
        <div className="user-listings">
            <Title level={4} className="user-listings__title">
                Listings
            </Title>
            <Paragraph className="user-listings__description">
                This section highlights the listings this user currently 
                hosts and has made available for bookings.
            </Paragraph>
            {userListingsList}
        </div>
    )
}
