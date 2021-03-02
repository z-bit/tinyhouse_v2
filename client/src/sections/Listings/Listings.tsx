import React, { useState, useEffect, useRef } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { Affix, Layout, List, Typography } from 'antd'
import { ErrorBanner, ListingCard } from '../../lib/components'
import { useScrollToTop } from '../../lib/hooks'
import { 
  LISTINGS, Listings as ListingsData, 
  ListingsVariables, ListingsFilter, 
} from '../../lib/graphql/queries'
import { ListingsFilters, ListingsPagination, ListingsSkeleton } from './'


const { Content } = Layout
const { Title, Paragraph, Text } = Typography
const PAGE_LIMIT = 8

interface MatchParams {
  location: string
}

export const Listings = () => {

  useScrollToTop()

  const history = useHistory()
  const { location } = useParams<MatchParams>()
  const locationRef = useRef(location)

  //const locationRef = useRef(match.params.location)
  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH)
  const [page, setPage] = useState(1)
  
  useEffect(() =>{
    setPage(1)
    locationRef.current = location
  }, [location]) 

  const { loading, data, error } = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    skip: locationRef.current !== location && page !== 1, 
    //locationRef.current !== match.params.location && page !== 1, 
    variables: { location, filter, page, limit: PAGE_LIMIT }
  })

  if (loading) {
    return (
      <Content className="listings">      
        <ListingsSkeleton />
      </Content>
    )
  }

  const redirectHome = () => {
    // return <Redirect to="/" /> // this does NOT work
    history.push('/')
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner 
          description={`
            We either couldn't find anything matching your search 
            or encountered an error. If you are searching for a unique 
            location please try seaching adain with more common keywords.
          `}
          nextAction={redirectHome}
        />
        <ListingsSkeleton />
      </Content>
    )
  }

  const listings = data ? data.listings : null
  const total: number = listings?.total ? listings.total : 0 
  const listingsRegion = listings ? listings.region : null

  const listingsSectionElement = listings && listings.result.length ? (
    <>
      <Affix offsetTop={64}>
        <ListingsPagination
          total={total}
          limit={PAGE_LIMIT}
          page={page}
          setPage={setPage}
        />
        <ListingsFilters filter={filter} setFilter={setFilter} />
      </Affix>
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
        dataSource={listings.result}
        renderItem={listing => (
          <List.Item>
            <ListingCard listing={listing} />
          </List.Item>
        )}
      />
    </>
  ) : (
    <div>
      <Paragraph>
        It appears that no listings have yet been reated for {" "}
        <Text mark>"{listingsRegion}"</Text>
      </Paragraph>
      <Paragraph>
        Be the first to <Link to="/host">create</Link> a listing in this area!
      </Paragraph>
    </div>
  )

  const listingsRegionElement = listingsRegion ? (
    <Title level={3} className="listings__title">
      Results for "{listingsRegion}"
    </Title>
  ) : null 

  return (
    <Content className="listings">
      {listingsRegionElement}
      {listingsSectionElement}
    </Content>
  )
}