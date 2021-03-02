import React from 'react'
import { Card, List, Skeleton } from 'antd'
import loadingCard from './assets/listing-loading-card-cover.jpg'

export const ListingsSkeleton = () => {

  const eightEmptyObjects = [{}, {}, {}, {}, {}, {}, {}, {}]

  return (
    <div className="listings-skeleton">
      <Skeleton paragraph={{ rows: 1 }} />
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
        dataSource={eightEmptyObjects}
        renderItem={() => (
          <List.Item>
            <Card          
              cover={
                <div 
                  style={{ backgroundImage: `url(${loadingCard})` }}
                  className="listings-skeleton__card-cover-img"
                ></div>
              }
              loading 
              className="listings-skeleton__card"
            />
          </List.Item>
        )}
      />
    </div>
  )
}
