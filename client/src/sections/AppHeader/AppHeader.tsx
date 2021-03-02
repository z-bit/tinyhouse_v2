import React, { useState, useEffect } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { Layout, Input } from 'antd'
import logo from './assets/tinyhouse-logo.png'
import { AppHeaderMenuItems } from '.'
import { Viewer } from '../../lib/types'
import { displayErrorMessage } from '../../lib/utils'

const { Header } = Layout
const { Search } = Input

interface Props {
    viewer: Viewer
    setViewer: (viewer: Viewer) => void
}

export const AppHeader = ({ viewer, setViewer }: Props ) => {
  const [search, setSearch] = useState('')

  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    const { pathname } = location
    if (pathname.includes('/listings/')) {
      const parts = pathname.split('/')
      setSearch(parts[parts.length - 1])
    } else {
      setSearch('')
    }
  }, [location]) // runs if location changes

  const onSearch = (value: string) => {
    // amazing: it works
    // how is the 'value' argument passed?
    // console.log({value})
    const trimmedValue = value.trim()
    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`)
      window.location.reload()
    } else {
      displayErrorMessage("Please enter a valid search!")
    }
  }

  return (
      <Header className="app-header">
          <div className="app-header__logo-search-section">
              <div className="app-header__logo">
                  <Link to="/">
                      <img src={logo} alt="tinyhouse logo" />
                  </Link>
              </div>
              <div className="app-header__search-input">
                <Search
                  placeholder="Search 'San Franciso'"
                  enterButton
                  onSearch={onSearch}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
          </div>
          <div className="app-header__menu-section">
              <AppHeaderMenuItems viewer={viewer} setViewer={setViewer} />
          </div>
      </Header>
  )
}
