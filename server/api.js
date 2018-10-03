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

var taskSchema = new mongoose.Schema({
   //_id: String,
  userid: String,
  text: String,
  startDate: Date,
  endDate:Date,
  person_responsible: String,
  mailid: String
  });

  var task = mongoose.model('Task', taskSchema);

app.get('/api/tasks', (req, res) => {
    let userid = req.query.userid;
    //connection((db) => {
        monDb.collection('tasksCollection')
            .find({'userid':userid})
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

app.post('/api/tasks', (req, res) => {
     var newTask = new task(req.body);
    //console.log(newTask);
    // newTask.save(function(err){
    //if (err) throw err;
    // });
    monDb.collection("tasksCollection")
    .insertOne(newTask, function(error, response) {
    if (error) 
    {
        console.log(error);
        sendError(error,"");
    }
    if(res)
     {
        console.log(response);
        res.json("Task added successfully");
     }   
    });
});

app.get('/api/tasks/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new mongoose.Types.ObjectId(id) };
    monDb.collection('tasksCollection').findOne(details, (err, item) => {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        res.send(item);
      } 
    });
  });

app.put('/api/tasks/:id', (req, res) => {
    var updatedTask = new task(req.body);
    const objId = { '_id': new mongoose.Types.ObjectId(req.params.id) };
    monDb.collection('tasksCollection').updateOne(objId, updatedTask, (err, result) => {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            //res.send(updatedTask);
            res.json("Task updated successfully");
        } 
      });
});

app.delete('/api/tasks/:id', (req, res) => {
    const objId = { '_id': new mongoose.Types.ObjectId(req.params.id) };
    monDb.collection('tasksCollection').deleteOne(objId, (err, result) => {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            //res.send(updatedTask);
            res.json("Task deleted successfully");
        } 
      });
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