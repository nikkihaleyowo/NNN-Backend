const mongoose = require('mongoose')


const ReplySchema = mongoose.Schema({
  image: {
    type: String
  },
  hasImage:{
    type: Boolean,
    required: true,
  },
  text:{
    type: String,
    required: true
  }
})

const PostSchema = mongoose.Schema({
  image: {
    type: String
  },
  hasImage:{
    type: Boolean,
    required: true,
  },
  replies: [ReplySchema],
  text:{
    type: String,
    default: "",
  },
  views:{
    type: Number,
    default: 0,
  },
  title:{
    type: String,
    required: true
  }
}, { timestamps: true })

var PostModel = mongoose.model('post', PostSchema)

module.exports = PostModel;