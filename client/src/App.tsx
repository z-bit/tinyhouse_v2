import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Affix, Layout, Spin } from 'antd'
import { 
  AppHeader, AppHeaderSkeleton, Home, Host, 
  Listing, Listings, Login, NotFound, User, Stripe 
} from './sections'
import { Viewer } from './lib/types'
import { ErrorBanner } from './lib/components'
import { LOG_IN, LogIn as LogInData, LogInVariables }  from './lib/graphql/mutations'
import { useMutation } from 'react-apollo'
import { Elements } from 'react-stripe-elements'

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false
}

export const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer)

  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
      onCompleted: data => {
          if (data && data.logIn) {
              setViewer(data.logIn)
              if (data.logIn.token) {
                  sessionStorage.setItem('token', data.logIn.token)
              } else {
                  sessionStorage.removeItem('token')
              }
          }
      }
  })
  const logInRef = useRef(logIn)
  useEffect( () => {
      logInRef.current()
  }, [])

  if (!viewer.didRequest && !error) {
      return (
          <Layout className="app-skeleton">
              <AppHeaderSkeleton />
              <div className="app-skeleton__spin-section">
                  <Spin size="large" tip="Launching Tinihouse" />
              </div>
          </Layout>
      )
  }

  const loginError = error ? (
    <ErrorBanner description="Problem with logging in: Please try again later!" /> 
  ) : null

  return (
    <Router>
      <Layout id="app">
        {loginError}
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Switch>
          <Route exact path="/"><Home /></Route>
          <Route exact path="/host"><Host viewer={viewer} /></Route> 
          <Route exact path="/listing/:id">
            <Elements>
              <Listing viewer={viewer} />
            </Elements>
          </Route>  
          <Route exact path="/listings/:location?"><Listings /></Route> 
          <Route exact path="/login"><Login setViewer={setViewer} /></Route> 
          <Route exact path="/stripe"><Stripe viewer={viewer} setViewer={setViewer} /></Route> 
          <Route exact path="/user/:id"><User viewer={viewer} setViewer={setViewer} /></Route> 
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  )
}