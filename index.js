const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
const crypto = require('crypto');
require('dotenv').config();

const port = 3002;

const postRoutes = require('./routes/postRoutes')

app.use(cors({
  origin: '*'
}));

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log('Client IP:', ip );
  const hash = crypto.createHash('sha256').update(ip).digest('hex');
  const shortHash = hash.substring(0, 8);
  req.body.userId = shortHash;
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