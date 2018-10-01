//const jwt = require('express-jwt');
//const jwks = require('jwks-rsa');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/*
 |--------------------------------------
 | Authentication Middleware
 |--------------------------------------
 */

module.exports = function(app, config) {


  // Authentication middleware
//   const jwtCheck = jwt({
//     secret: jwks.expressJwtSecret({
//       cache: true,
//       rateLimit: true,
//       jwksRequestsPerMinute: 5,
//       jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
//     }),
//     audience: config.AUTH0_API_AUDIENCE,
//     issuer: `https://${config.AUTH0_DOMAIN}/`,
//     algorithm: 'RS256'
//   });

// /*
//  |--------------------------------------
//  | API Routes
//  |--------------------------------------
//  */

//   // GET API root
//   app.get('/api/', (req, res) => {
//     res.send('API works');
//   });


/*
 |--------------------------------------
 | MongoDB
 |--------------------------------------
 */

mongoose.connect(config.MONGO_URI);
const monDb = mongoose.connection;

monDb.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that', config.MONGO_URI, 'is running.');
});

monDb.once('open', function callback() {
  console.info('Connected to MongoDB:', config.MONGO_URI);
});


app.get('/api/tasks', (req, res) => {
    //connection((db) => {
        monDb.collection('tasksCollection')
            .find()
            .toArray()
            .then((tasks) => {
                response.data = tasks;
                res.json(response);
            })
            .catch((err) => {
                sendError(err, res);
            });
    //})
});
// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};
};