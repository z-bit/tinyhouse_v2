import React from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Row, Input, Typography } from 'antd'

import toronto from './assets/toronto.jpg'
import dubai from './assets/dubai.jpg'
import losAngeles from './assets/los-angeles.jpg'
import london from './assets/london.jpg'

const { Title } = Typography
const { Search } = Input

interface Props {
  onSearch: (value: string) => void
}
export const HomeHero = ({ onSearch }: Props) => {

  return (
    <div className="home-hero">

      <div className="home-hero__search">
        <Title className="home-hero__title">
          Find a place you'll love to stay at
        </Title>
        <Search 
          placeholder="Search 'San Francisco'" 
          size="large"
          enterButton
          className="home-hero__search-input"
          onSearch={onSearch}
        />
      </div>
      
      <Row gutter={12} className="home-hero__cards">
        <Col xs={12} md={6}>
          <Link to="/listings/toronto">
            <Card cover={<img src={toronto} alt="Toronto" />}>
              Toronto
            </Card>
          </Link>
        </Col>
        <Col xs={12} md={6}>
          <Link to="/listings/dubai">
            <Card cover={<img src={dubai} alt="Dubai" />}>
              Dubai
            </Card>
          </Link>
        </Col>
        <Col xs={0} md={6}>
          <Link to="/listings/los%20angeles">
            <Card cover={<img src={losAngeles} alt="Los Angeles" />}>
              Los Angeles
            </Card>
          </Link>
        </Col>
        <Col xs={0} md={6}>
          <Link to="/listings/london">
            <Card cover={<img src={london} alt="London" />}>
              London
            </Card>
          </Link>
        </Col>
      </Row>

    </div>
  )
}