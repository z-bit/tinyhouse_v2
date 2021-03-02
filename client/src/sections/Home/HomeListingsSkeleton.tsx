import React from 'react'
import { Card, List, Skeleton } from 'antd'
import loadingCard from './assets/listing-loading-card-cover.jpg'

export const HomeListingsSkeleton = () => {

  const fourEmptyObjects = [{}, {}, {}, {}]

  return (
    <div className="home-listings-skeleton">
      <Skeleton paragraph={{ rows: 0}} />
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
        dataSource={fourEmptyObjects}
        renderItem={() => (
          <List.Item>
            <Card 
              
              cover={
                <div 
                  style={{ backgroundImage: `url(${loadingCard})` }}
                  className="home-listings-skeleton__card-cover-img"
                ></div>
              }
              loading 
            />
          </List.Item>
        )}
      />
    </div>
  )
}
