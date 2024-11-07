const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config();

const port = 3002;

const postRoutes = require('./routes/postRoutes')

app.use(cors({
  origin: '*'
}));

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log('Client IP:', ip);
  next();
});

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


mongoose.connect(process.env.MONGO_URL)
  .then(()=>{
    console.log("Connected to MongoDB");
  })
  .catch(()=>{
    console.log("Couldn't connect to MongoDB");
  })

app.use('/api/post', postRoutes)

app.listen(port, () => {
  console.log('running on port: '+port);
})