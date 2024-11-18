const mongoose = require('mongoose')

const ReplyListSchema = mongoose.Schema({
  replyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  }
})

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
  },
  userId: {
    type:String,
    required:true
  },
  replies: [ReplyListSchema],
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
  directReplies:[{
    type: String,
  }],
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
  },
  userId:{
    type: String,
    required:true
  },
  tier:{
    type: Number,
    default: -1,
  }
}, { timestamps: true })

var PostModel = mongoose.model('post', PostSchema)

module.exports = PostModel;