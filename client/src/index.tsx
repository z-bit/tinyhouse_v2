import { App } from './App'
import { render } from 'react-dom';

import ApolloClient from 'apollo-boost' 
import { ApolloProvider } from 'react-apollo'
import { StripeProvider } from 'react-stripe-elements'

import reportWebVitals from './reportWebVitals';
import "./lib/styles.css"

console.log(process.env.REACT_APP_TEST as string)

const client = new ApolloClient({
    uri: '/api',  // because of "proxy": "http://localhost:9000" in package.json
    request: operation => {
        const token = sessionStorage.getItem('token')
        operation.setContext({
            headers: {
                'X-CSRF-TOKEN': token || ''
            }
        })
    }
})

render(
    <ApolloProvider client={client}>
      <StripeProvider apiKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY as string}>
        <App />
      </StripeProvider>
    </ApolloProvider>
    ,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
