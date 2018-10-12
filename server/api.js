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

module.exports = function(app, config) 
{
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

    mongoose.connect(config.MONGO_URI, { useNewUrlParser: true });
    const monDb = mongoose.connection;

    monDb.on('error', function() {
        console.error('MongoDB Connection Error. Please make sure that', config.MONGO_URI, 'is running.');
    });

    monDb.once('open', function callback() {
        console.info('Connected to MongoDB:', config.MONGO_URI);
    });

    var userSchema = new mongoose.Schema({
        userid:String,
        group_members:[{
            member: String
        }]
    });

    var taskSchema = new mongoose.Schema({
        //_id: String,
        userid: String,
        text: String,
        startDate: Date,
        endDate:Date,
        person_responsible: String,
        mailids: [{
            member: String
        }]
    });

    var task = mongoose.model('Task', taskSchema);
    var user = mongoose.model('User', userSchema);

    app.get('/api/members', (req, res) => {
        let userid = req.query.userid; 
        
        monDb.collection('usersCollection')
        .findOne({'userid':userid})
        .then((member) => {
            var user1 = new user(); 
            if(member!=null)
                user1 = member;
            else
            {
                var newUser = new user();
                newUser.userid = userid;
                monDb.collection("usersCollection")
                .insertOne(newUser, function(error, response1) {
                    if (error) 
                        console.log(error);
                    if(res)
                        user1 = response1;
                });
            }   
            response.data = user1;
            res.json(user1);
        })
        .catch((err) => {
            console.log(err);
            sendError(err, res);
        });
    });

    app.put('/api/members/:id', (req, res) => {
        var updatedUser = new user(req.body);
        console.log(req.params.id);
        const objId = { '_id': new mongoose.Types.ObjectId(req.params.id) };
        monDb.collection('usersCollection').updateOne(objId, updatedUser, (err, result) => {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                res.json("Member added successfully");
            } 
        }); 
    });
    
    // app.delete('/api/members/:id/:memberid', (req, res) => {
    //     const objId = { '_id': new mongoose.Types.ObjectId(req.params.id) };
    //     const memberObjId = { '_id': new mongoose.Types.ObjectId(req.params.memberid) };
    //     console.log(objId);
    //     console.log(memberObjId);
    //     monDb.collection('usersCollection').updateOne(objId,{ $pull: { "group_members": { "_id": memberObjId } } },
    //      (err, result) => {
    //         if (err) {
    //             res.send({'error':'An error has occurred'});
    //         } else {
    //             res.json("Member deleted successfully");
    //         } 
    //     });
    // });

    app.get('/api/tasks', (req, res) => {
        let userid = req.query.userid;
        let useremail = req.query.email;
        //connection((db) => {
        monDb.collection('tasksCollection')
            // .find({ $where: function() 
            //     {
            //         return (this.userid == userid || this.mailid ==useremail)
            //     } 
            // } )//
            .find({ $or: [ { 'userid': userid }, { 'mailids.member' : useremail } ] })//{'userid':userid})
            .toArray()
            .then((tasks) => {
                response.data = tasks;
                res.json(tasks);
            })
            .catch((err) => {
                sendError(err, res);
            });
        //})
    });

    app.post('/api/tasks', (req, res) => {
        var newTask = new task(req.body);
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
            } 
            else {
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