import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Layout, Typography } from 'antd'

const { Content } = Layout
const { Text } = Typography

export const NotFound = () => {
  return (
    <Content className="not-found">
      <Empty description={
        <>
          <Text className="not-found__description-title">
            Uh oh! Something went wrong :(
          </Text>
          <Text className="not-found__description-subtitle">
            The page you were looking for could not be found!
          </Text>
        </>
      } />
      <Link className="not-found__cta ant-btn ant-btn-primary ant-btn-lg" to="/">
        Take me bak to the Hompage!
        </Link>
    </Content>
  )
}