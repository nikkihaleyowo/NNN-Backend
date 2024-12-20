const PostModel = require('../models/Post');

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')



router.post('/createPost', async (req,res)=>{ 
  const postToAdd = {
    hasImage: req.body.hasImage,
    text: req.body.text,
    image: req.body.image,
    title: req.body.title,
    userId: req.userId,
  }
  try{
    const newPost = await PostModel.create(postToAdd);
    newPost.save();
    res.status(200).json(newPost);
  }catch(err){
    console.log(err.message)
    res.status(401).json({message: err.message})
  }
})

router.post('/reply', async (req,res)=>{ 
  const replyToAdd = {
    hasImage: req.body.hasImage,
    text: req.body.text,
    image: req.body.image,
    userId: req.userId,
  }
  const text =req.body.text;
  const regex = /@\{(.*?)\}/g;
  const matches = text.matchAll(regex);
  const postReplies = [...matches].map(match => match[1])
  console.log(postReplies)
  try{
    PostModel.findByIdAndUpdate(req.body.id, {
      $push :{replies: replyToAdd}
    },{new: true}).then(post=>{
      console.log('added reply')
      try {
        postReplies.map(reply => {
          const postId = req.body.id;
          const newReply = {
            replyId : post.replies[post.replies.length-1]._id,
            userId : post.userId,
          }

          PostModel.findOneAndUpdate(
            { _id: postId, 'replies._id': reply },
            {
              $push: {
                'replies.$.replies': newReply
              }
            },
            { new: true }
          ).then(updatedPost=>{
            console.log("pp: ")
            console.log(updatedPost)
          }).catch(err => {
            console.log("couldnt find")
          })
        })
      } catch (error) {
        //res.status(403).json({error: error});
        console.log(error.message)
      }
      res.status(202).json(post);
    }).catch(err=>{
      console.log(err.message)
      res.status(402).json({error: err});
    });
  }catch(err){
    console.log(err.message)
    res.status(401).json({message: err.message})
  }
})

router.get('/getPosts/:page', async (req, res) => {

  console.log(req.userId)

  const posts = await PostModel.find().sort({ updatedAt: -1 }).limit(40);

  const page = req.params.page;
  //console.log("page: "+page)
  const postsWithLimitedReplies = posts.map((post, index) => {
    if((index>=(page*5)) && (index<(page*5+5))){
      return {
        ...post._doc, // Copy all post properties
        replies: post._doc.replies.slice(-5), // Get the last 5 replies
      };
    }
    return null
  });
  //console.log(postsWithLimitedReplies[2])
  const filteredPosts = postsWithLimitedReplies.filter(post => post !== null);
  res.status(201).json(filteredPosts);
});

router.get('/getPost/:id', async (req, res) => {
  const id = req.params.id;
  PostModel.findById(id)
  .then(pol=>{
    console.log("found post")
    res.status(200).json(pol)
  })
  .catch(err => res.status(201).json(err))
});


module.exports = router;