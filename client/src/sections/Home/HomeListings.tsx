import React from 'react'
import { List, Typography } from 'antd'
import { ListingCard } from '../../lib/components'
import { Listings } from '../../lib/graphql/queries'

const { Title } = Typography

interface Props {
  title: string
  listings: Listings['listings']['result']
}
export const HomeListings = ({ title, listings }: Props) => {
  return (
    <div className="home-listings">
      <Title className="home-listings__title">{title}</Title>
      <List
        grid={{
          gutter: 8,
          xs: 1,
          sm: 2,
          md: 4,
          lg: 4,
          xl: 4,
          xxl: 4,
        }} 
        dataSource={listings}
        renderItem={listing => (
          <List.Item>
            <ListingCard listing={listing} />
          </List.Item>
        )}
      />
    </div>
  )
}
