import React from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import { Avatar, Button,  Menu } from 'antd'
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { Viewer } from '../../lib/types'
import { LOG_OUT, LogOut as LogOutData } from '../../lib/graphql/mutations'
import { displayErrorMessage, displaySuccessNotification } from '../../lib/utils'

const { Item, SubMenu } = Menu

interface Props {
    viewer: Viewer
    setViewer: (viewer: Viewer) => void
}
export const AppHeaderMenuItems = ({ viewer, setViewer }: Props) => {

    const [logOut] = useMutation<LogOutData>(LOG_OUT, {
        onCompleted: (data) => {
            if (data && data.logOut) {
                setViewer(data.logOut)
                sessionStorage.removeItem('token')
                displaySuccessNotification('Logged out successfully')
            }
        },
        onError: data => displayErrorMessage('Log out failed. Try again!')
    })
    const handleLogOut = () => logOut()

    const subMenuLogin = viewer.id && viewer.avatar
        ? (
            <SubMenu title={<Avatar src={viewer.avatar} />}>
                <Item key="/user">
                    <Link to={'/user/' + viewer.id}>
                        <UserOutlined />
                        Profile
                    </Link>
                </Item>
                <Item key="/logout">
                    <div onClick={handleLogOut}>
                        <LogoutOutlined />
                        Logout
                    </div>
                </Item>
            </SubMenu>
          )
        : (
            <Item>
                <Link to="/login">
                    <Button type="primary">Sign In</Button>
                </Link>
            </Item>
          )
    ;

    return (
        <Menu mode="horizontal" selectable={false} className="menu">
            <Item key="/host">
                <Link to="/host">
                    <HomeOutlined />
                    Host
                </Link>
            </Item>
            {subMenuLogin}
        </Menu>
    )
}