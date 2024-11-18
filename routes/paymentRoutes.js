const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const { Order } = require('../models/Order');
const PostModel = require('../models/Post');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.post("/create-payment-intent", async (req, res) => {
  try { 
    let id = null;
    const postToAdd = {
      userId: req.userId,
      title: req.body.title,
      text: req.body.text,
      tier: -2,
      image: req.body.imgUrl,
      hasImage: req.body.hasImage,
    }
    try{
      const newPost = await PostModel.create(postToAdd);
      newPost.save();
      console.log("new post")
      console.log(newPost)
      id = newPost._id;
      console.log("id: "+newPost._id)
      //res.status(200).json(newPost);
    }catch(err){
      console.log(err.message)
      //res.status(401).json({message: err.message})
    }

    const customer = await stripe.customers.create({
      metadata: 
      {
        userId: req.userId,
        title: req.body.title,
        text: req.body.text,
        tier: req.body.tier,
        imgUrl: req.body.imgUrl,
        hasImage: req.body.hasImage,
        id: String(id),
      }
    })

    console.log("tier: ", req.body.tier)

    const paymentIntent = await stripe.paymentIntents.create({
      currency: "USD",
      amount: req.body.cost *100,
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    console.log("id: " + id)
    res.send({
      id: String(id),
      clientSecret: paymentIntent.client_secret
    });
  } catch (e) {
    console.log("err: " + e.message)
    return res.status(500).send({
      error: {
        message: e.message,
      },
    });
  }
});



const createPaidPost = async(customer,data) =>{

  console.log("post tier: ", customer.metadata.tier )
  
  const newOrder = new Order({
    userId: customer.metadata.userId,
    customerId: data.customer,
    title : customer.metadata.title,
    text : customer.metadata.text,
    paymentIntentId: data.payment_intent,
    total: data.amount,
    tier: customer.metadata.tier,
    id: customer.metadata.id,
  })

  const id = customer.metadata.id;
  const tier = customer.metadata.tier;
  try{
    PostModel.findByIdAndUpdate(id, {
      tier: tier
    },{new: true}).then(post=>{
      console.log('added post ed')
    }).catch(err=>{
      console.log(err.message)
    });
  }catch(err){
    console.log(err.message)
    //res.status(401).json({message: err.message})
  }
  
    

  console.log("proccessed order: ")
  
}

// stripe webhook
let endpointSecret;

endpointSecret= 'whsec_67ba4612ae0737b484d9fed76483576fb22f50a44c968eae57d4c92ce7ec7ceb';
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  console.log("tried hook")
  const sig = req.headers['stripe-signature'];

  let data;
  let eventType;

  if(endpointSecret){

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("Webhook verified.")
    }
    catch (err) {
      console.log(`Webhook Error: ${err.message}`)
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    data = event.data.object;
    eventType = event.type;
  }
  else{
    data = req.body.data.object;
    eventType = req.body.type;
  }

  // Handle the event
  
  if(eventType=== "charge.succeeded"){
    stripe.customers.retrieve(data.customer).then((customer)=>{
      createPaidPost(customer, data)
    }).catch(err=>{
      console.log(err.message)
    })
  }

  // Return a response to acknowledge receipt of the event
  res.send().end();
})
module.exports = router;