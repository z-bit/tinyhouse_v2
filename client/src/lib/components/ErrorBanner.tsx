import React from 'react'
import { Alert } from 'antd'

interface Props {
    message?: string
    description?: string 
    nextAction?: () => void
}

export const ErrorBanner = ({
    message = 'Uh oh! Somethings went wrong :( ',
    description = 'Please try again later.',
    nextAction
}: Props) => {
    return (
        <Alert
            banner={false}
            closable
            message={message}
            description={description}
            type="error"
            className="error-banner"
            onClose={nextAction}
        />
    )
}