import React from 'react'
import { Link } from 'react-router-dom'
import { Card, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons' 
import { iconColor, formatPrice } from '../utils'

interface Props {
    listing: {
        id: string
        title: string
        image: string
        address: string
        price: number
        numOfGuests: number
    }
}

const { Text, Title } = Typography

export const ListingCard = ({ listing }: Props) => {

    const { id, title, image, address, price, numOfGuests } = listing

    return (<Link to={'/listing/' + id}>

        <Card 
            hoverable 
            cover={
                <div 
                    style={{backgroundImage: `url(${image})`}} 
                    className="listing-card__cover-img"    
                />
            }     
        >
            <div className="listing-card__details">
                <div className="listing-card__description">
                    <Title level={4} className="listing-card__price">
                        {formatPrice(price)}
                        <span>/day</span>
                    </Title>
                    <Text strong ellipsis className="listing-card__title">
                        {title}
                    </Text>
                    <Text ellipsis className="listing-card__address">
                        {address}
                    </Text>
                    <div className="listing-card__dimensions listing-card__dimensions--guests">
                        <UserOutlined 
                            style={{
                                color: iconColor,
                                paddingRight: '6px',
                            }}
                        />
                        <Text>{numOfGuests} guests</Text>
                    </div>
                </div>
            </div>
        </Card>

    </Link>)
}