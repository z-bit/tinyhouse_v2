import React, { useEffect, useRef } from 'react'
import { Redirect } from 'react-router-dom'
import { useApolloClient, useMutation } from '@apollo/react-hooks'
import { Card, Layout, Spin, Typography } from 'antd'
import googleLogo from './assets/google_logo.jpg'
import { Viewer } from '../../lib/types'
import { AUTH_URL, AuthUrl as AuthUrlData } from '../../lib/graphql/queries'
import { LOG_IN, LogIn as LogInData, LogInVariables } from '../../lib/graphql/mutations'
import { ErrorBanner } from '../../lib/components'
import { useScrollToTop } from '../../lib/hooks'
import { displaySuccessNotification, displayErrorMessage } from '../../lib/utils'

const { Content } = Layout
const { Text, Title } = Typography

interface Props {
    setViewer: (viewer: Viewer) => void
}

export const Login = ({ setViewer }: Props) => {

    useScrollToTop()

    const client = useApolloClient()

    const [logIn, {data:logInData, loading:logInLoading, error:logInError}] = 
        useMutation<LogInData, LogInVariables>(
            LOG_IN,
            { onCompleted: data => {
                if (data && data.logIn && data.logIn.token) {
                    setViewer(data.logIn)
                    sessionStorage.setItem('token', data.logIn.token)
                    displaySuccessNotification('You are logged in successfully.')
                } 
            }}
        )
    ;

    const logInRef = useRef(logIn) 
    // logInRef avoids putting logIn into the useEffect dependencies
    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code")
        if (code) {
            logInRef.current({
                variables: {
                    input: { code }
                }
            })
        }
    }, [])

    const handleAuthorize = async () => {
        try {
            const { data } = await client.query<AuthUrlData>({
                query: AUTH_URL 
            })
            window.location.href = data.authUrl
        } catch (error) {
            displayErrorMessage("Sorry, we couldn't log you in: Try again later!")
        }
    }

    if (logInLoading) {
        return (
            <Content className="log-in">
                <Spin size="large" tip="Logging you in ..." />
            </Content>
        )
    }

    if (logInData && logInData.logIn) {
        const { id: viewerId } = logInData.logIn
        return (
            <Redirect to={'/user/' + viewerId} />
        )
    }

    const logInErrorBannerElement = logInError 
        ? <ErrorBanner description="Sorry, we couldn't log you in: Try again later!" />
        : null
    ;

    return (
        <Content className="log-in">
            {logInErrorBannerElement}
            <Card className="log-in-card">
                <div className="log-in-card__intro">
                    <Title level={3} className="log-in-card__intro-title">
                        <span role="img" aria-label="little tent">
                            &#127914;
                        </span>
                    </Title>
                    <Title level={3} className="log-in-card__intro-title">
                        Log in to Tinihouse!
                    </Title>
                    <Text>Sign in with Google to start booking available rentals!</Text>
                </div>
                <button 
                    className="log-in-card__google-button" 
                    onClick={handleAuthorize}
                >
                    <img src={googleLogo} alt="Google Logo" className="log-in-card__google-button-logo" />
                    <span className="log-in-card__google-button-text">
                        Sign in with Google
                    </span>
                </button>
                <Text type="secondary">
                    Note: By signing in, you will be redirected to 
                    Google consent form to sign in with your Google account.
                </Text>
            </Card>
        </Content>
    )
}