import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { Layout, Row, Col } from 'antd'
import { USER, User as UserData, UserVariables } from '../../lib/graphql/queries'
import { UserProfile } from '.'
import { Viewer } from '../../lib/types'
import { ErrorBanner, PageSkeleton } from '../../lib/components'
import { useScrollToTop } from '../../lib/hooks'
import { UserBookings, UserListings} from '.'

const { Content } = Layout
const PAGE_LIMIT = 4

interface  MatchParams {
    id: string
}
interface Props {
    viewer: Viewer
    setViewer: (viewer: Viewer) => void
}
export const User = ({ viewer, setViewer }: Props) => {
     
    useScrollToTop()

    const { id } = useParams<MatchParams>()

    const [listingsPage, setListingsPage] = useState(1)
    const [bookingsPage, setBookingsPage] = useState(1)
    
    const { data, loading, error, refetch } = 
        useQuery<UserData, UserVariables>(
            USER,
            { variables: { 
                id, 
                bookingsPage,
                listingsPage,
                limit: PAGE_LIMIT
            }}
        )
    ;

    const handleUserRefetch = async () => {
      await refetch()
    }

    const stripeError = new URL(window.location.href).searchParams.get('stripe_error')          
    const stripeErrorBanner = stripeError ? (
      <ErrorBanner description="There was an issue connecting to Stripe. Please try again!" />
    ) : null

    if (loading) {
        return (
            <Content className="user">
                <PageSkeleton />
            </Content>
        )
    }

    if (error) {
        return (
            <Content className="user">
                <ErrorBanner description="This user may not exist or we encountered an error. Please try again later!" />
                <PageSkeleton />
            </Content>
        )
    }

    const user = data ? data.user : null
    const viewerIsUser = viewer.id === id
    const userListings = user ? user.listings : null
    const userBookings = user ? user.bookings : null

    const userProfileElement = user 
        ? <UserProfile 
            user={user} 
            viewer={viewer}
            setViewer={setViewer} 
            viewerIsUser={viewerIsUser} 
            handleUserRefetch={handleUserRefetch}
          /> 
        : null
    ;
    const userListingsElement = userListings
        ? (
            <UserListings 
                userListings={userListings} 
                listingsPage={listingsPage}
                limit={PAGE_LIMIT}
                setListingsPage={setListingsPage}
            />
          )  
        : null
    ;
    const userBookingsElement = viewerIsUser 
        ? (
            <UserBookings 
                userBookings={userBookings} 
                bookingsPage={bookingsPage}
                limit={PAGE_LIMIT}
                setBookingsPage={setBookingsPage}
            />
          )  
        : null
    


    return (
        <Content className="user">
            {stripeErrorBanner}
            <Row gutter={12} justify="space-between">
                <Col xs={24}>
                    {userProfileElement}
                </Col>
                <Col xs={24}>
                    {userListingsElement}
                    {userBookingsElement}
                </Col>
            </Row>
        </Content>
    )
}