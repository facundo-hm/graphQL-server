const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema')
const cors = require('cors')

require('dotenv').config()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
)

app.listen(4000, () => {
  console.log('Listening for requests on port 4000')
})
