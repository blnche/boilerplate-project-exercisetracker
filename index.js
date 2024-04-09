const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//MODELS
const User = require('./models/userModel');
const Exercise = require('./models/exerciseModel');
const Log = require('./models/logModel');


//DB
const mySecret = process.env['MONGO_URI'];
mongoose.connect(mySecret, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.create({username: username});

    res.json({username: user.username, _id: user._id});
  } catch (error) {
    res.json({error: error});
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('username _id');

    res.json(users);
  } catch (error) {
    res.json({error: error});
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const user = await User.findById({_id: userId});

    if (!user) {
      console.log('User not found');
      return;
    }

    const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
    console.log('date' +date)

    const description = req.body.description;
    const duration = parseInt(req.body.duration);

    const exercise = await Exercise.create({username: user.username, description: description, duration: duration, date: date});

    res.json({
      _id: user._id, 
      username: user.username, 
      description: exercise.description, 
      duration: exercise.duration, 
      date: exercise.date
    });
    
  } catch (error) {

    res.json({error: error});
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const user = await User.findById({_id: userId});
  
    if(!user) {
      console.log('User not found');
      return;
    }

    let dateObj = {};
    const {from, to, limit} = req.query;
    if(from) {
      dateObj["$gte"] = new Date(from);
    }
    if(to) {
      dateObj['$lte'] = new Date(to);
    }

    if( req.params.from || req.params.to) {
      const from = req.params.from;
      const to = req.params.to;
    }
    
    if (req.params.limit) {
      const limit = req.params.limit
    }
    
    let filter = {
      username: user.username
    }

    if('options') {
      filter.date = dateObj;
    }
    
    const exercises = await Exercise.find(filter).limit(+limit ?? 500);
    console.log(exercises);

    const log = exercises.map(item => ({
      description: item.description,
      duration: item.duration,
      date: item.date
    }));
    
    res.json({
      username: user.username, 
      count: log.length, 
      _id: user._id,
      log
    });

  } catch (error) {
    res.json({error: error});
  }
})



const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
