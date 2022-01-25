var express = require('express');
var cors = require('cors');
var { graphqlHTTP } = require('express-graphql');
var { root, schema } = require('./build/app');



var allowlist = ['http://localhost:3000']
var corsOptionsDelegate = function (req, callback) {
  console.log("REQ::::::", req)
  var corsOptions = {
    origin: true
  }

  // if (allowlist.indexOf(req.header('Origin')) !== -1) {
  //   corsOptions = { origin: true }
  // } else {
  //   corsOptions = { origin: false }
  // }

  callback(null, corsOptions)
}




var app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.options('*', cors());

app.post('/graphql', cors(corsOptions), graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(7846);
console.log('Running a GraphQL API server at http://localhost:7846/graphql');
