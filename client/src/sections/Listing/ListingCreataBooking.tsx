import React, { useRef } from 'react'
import { Button, Card, DatePicker, Divider, Typography } from 'antd'
import moment, { Moment } from 'moment'
import { formatPrice, displayErrorMessage } from '../../lib/utils'
import { Listing as ListingData } from '../../lib/graphql/queries'
import { Viewer } from '../../lib/types'

const MAX_DAYS_TO_BOOK = 30

const { Paragraph, Text, Title } = Typography

interface Props {
  host: ListingData["listing"]["host"]
  viewer: Viewer
  price: number
  bookingsIndex: ListingData["listing"]["bookingsIndex"]
  checkInDate: Moment | null
  checkOutDate: Moment | null
  setCheckInDate: (checkInDate: Moment | null) => void
  setCheckOutDate: (checkOutDate: Moment | null) => void
  setModalVisible: (modalVisible: boolean) => void
}
export const ListingCreateBooking = ({ 
  host, viewer, price, bookingsIndex, checkInDate, checkOutDate, 
  setCheckInDate, setCheckOutDate, setModalVisible 
}: Props) => {

  const bookingsIndexJson: BookingsIndex = JSON.parse(bookingsIndex)  

  // for testing
  //const bookingsIndex1 = '{"2021": {"1" : {"25": true, "26": true } } }'
  //const bookingsIndexJson: BookingsIndex = JSON.parse(bookingsIndex1)

  // const log = (context: string): void => {
  //   console.log(' ')
  //   const fmtCheckInDate = checkInDate === null ? 'null' : checkInDate.format('DD/MM/YYYY')
  //   console.log(`[${context}]checkInDate: ${fmtCheckInDate}`)
  //   const fmtCheckOutDate = checkOutDate === null ? 'null' : checkOutDate.format('DD/MM/YYYY')
  //   console.log(`[${context}]checkOutDate: ${fmtCheckOutDate}`)
  //   const fmtCheckin = refCheckin.current === null ? 'null' : refCheckin.current.format('DD/MM/YYYY')
  //   console.log(`[${context}]refCheckin: ${fmtCheckin}`)
  //   const fmtFirstBooking = refFirstBooking.current === null ? 'null' : refFirstBooking.current.format('DD/MM/YYYY')
  //   console.log(`[${context}]refFirstBooking: ${fmtFirstBooking}`)
  // } 

  const refCheckin = useRef<Moment | null>(null) 
  const refFirstBooking = useRef<Moment | null>(null)
  
  const onCheckInChange = (date: Moment | null) => {
    setCheckInDate(date)    // for parent component
    refCheckin.current = date === null ? null : date  // internal
    refFirstBooking.current = firstBooking(date)
    //log('onCheckin')
  }
  
  const disabledCheckInDate = (gridDate: Moment): boolean =>  {
    if (!gridDate) return true
    return gridDate.isBefore(moment()) || isBooked(gridDate)
  }
    
  const disabledCheckOutDate = (gridDate: Moment) => {
    return gridDate.isBefore(refCheckin.current) || gridDate.isAfter(refFirstBooking.current)
  }
 
  const verifyDates = (): boolean => {
    // log('verify start')
    // obsolete because Button would be diabled
    if (!checkInDate || !checkOutDate) {
      displayErrorMessage('CheckIn and/or CheckOut date missing!')
      return false
    } 
    // obsolete because onChange Checkin sets Ckeckout to null
    if (!moment(checkInDate).isBefore(checkOutDate, 'days')){
      displayErrorMessage('CheckOut has to be after CheckIn!')
      return false
    } 
    if (checkInDate === checkOutDate) {
      displayErrorMessage('You have to stay at least for 1 night!')
      setCheckInDate(null)
      setCheckOutDate(null)
      return false
    }
    if (periodContainsAlreadyBookedDays(checkInDate, checkOutDate)){
      displayErrorMessage('You included days wich were already booked. - Try again!')
      setCheckInDate(null)
      setCheckOutDate(null)
      return false
    }
    // log('verify end')
    return true
  }

  const isBooked = (date: Moment): boolean => {
    const year = moment(date).year()
    const month = moment(date).month()
    const day = moment(date).date()
    if (!bookingsIndexJson[year]) return false  
    if (!bookingsIndexJson[year][month]) return false
    if (!bookingsIndexJson[year][month][day]) return false
    return true
  }
  
  const periodContainsAlreadyBookedDays = (strt: Moment, ende: Moment): boolean => {
    const d = moment(strt)
    while (d.isBefore(ende)) {
      d.add(1, 'd')
      //log('period loop')
      if (isBooked(d)) return true
    }
    //log('period sucess')
    return false
  }

  const firstBooking = (strt: Moment | null): Moment | null => {
    if (strt == null) {
      return null
    }
    const d = moment(strt)
    // const d = strt 
    // would make d the same object as strt, which in turn is the same as refCheckin
    // increasing d then increases refCheckin 
    // this took me three days to figure out
    // =====================================
    const ende = moment(strt).add(MAX_DAYS_TO_BOOK, 'd')
    while (d.isBefore(ende)) {
      d.add(1, 'd')
      if (isBooked(d)) return d
    }
    return d
  }

  const handleRequestToBook = () => {
    if (verifyDates()) {
      setModalVisible(true)
    } 
  }

  let buttonMessage = "You will not be charged yet!"
  let disableCheckin = false
  if (!viewer.id) {
    buttonMessage = "You have to be signed in to book a listing!"
    disableCheckin = true
  }
  if (viewer.id === host.id) {
    buttonMessage = "You cannot book your own listing!"
    disableCheckin = true
  }
  if (!host.hasWallet) {
    buttonMessage = "The host has disconnected from Stripe and thus will not be able to receive payments!"
    disableCheckin = true
  }

  return (
    <div className="listing-booking">
      <Card className="listing-booking__card">
        <div>
          <Paragraph>
            <Title level={2} className="listing-booking__card-title">
              {formatPrice(price)}
              <span>/day</span>
            </Title>
          </Paragraph>
          <Divider />
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check In</Paragraph>
            <DatePicker 
              disabled={disableCheckin}
              value={checkInDate ? checkInDate : undefined} 
              format={'dddd DD/MM/YYYY'}
              showToday={false}
              disabledDate={disabledCheckInDate} 
              onChange={date => onCheckInChange(date)}
              onOpenChange={() => setCheckOutDate(null)}
            />
          </div>
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker 
              disabled = {checkInDate === null}
              value={checkOutDate ? checkOutDate : undefined}
              format={'dddd DD/MM/YYYY'}
              showToday={false}
              disabledDate={disabledCheckOutDate} 
              onChange={date => setCheckOutDate(date)}
            />
          </div>
        </div>
        <Divider />
        <Button 
          disabled={!checkInDate || !checkOutDate}
          size="large" 
          type="primary" 
          className="listing-booking__card-cta"
          onClick={handleRequestToBook}
        >
          Request to book!
        </Button>
        <Text type="secondary">{buttonMessage}</Text>
      </Card>
    </div>
  )
}

//types
interface Month {
  [key: string]: boolean
}
interface Year {
  [key: string]: Month
}
interface BookingsIndex {
  [key: string]: Year
}