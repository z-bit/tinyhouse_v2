require('dotenv').config({ path: `${__dirname}\\..\\.env.development` })
require('./app.ts')
// import express, { Application }  from 'express'
// import bodyParser from "body-parser"
// import compression from 'compression'
// import cookieParser from 'cookie-parser'
// import { ApolloServer } from 'apollo-server-express'
// import { typeDefs, resolvers } from './graphql'
// import { connectDatabase } from './database'

// const port = process.env.PORT

// console.log(process.env.NODE_ENV, process.env.PORT)

// const mount = async (app: Application) => {    

//     // for antd <Upload> in /client/src/sections/Host/Host.tsx
//     app.post('/statusDone', (_req, res) => res.send('{"status": "done"}'))

//     const db = await connectDatabase()

//     app.use(bodyParser.json({ limit: "3mb" }))
//     app.use(cookieParser(process.env.COOKIE_SECRET))
//     app.use(compression())
//     app.use(express.static(`${__dirname}/client`))
//     app.get("/*", (_req, res) => res.sendFile(`${__dirname}/client/index.html`))

//     const server = new ApolloServer({ 
//         typeDefs, 
//         resolvers,  
//         context: ({ req, res }) => ({ db, req, res })
//     }) 
//     server.applyMiddleware({ app, path: '/api' })
//     app.listen(process.env.PORT)

//     console.log(`[app]: express server running at http://localhost:${port}`)
 
// }

// mount(express())
