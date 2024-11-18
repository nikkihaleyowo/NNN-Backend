const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {type:String, required:true},
  customerId: {type:String},
  text: {type: String},
  title: {type: String},
  paymentIntentId: {type: String},
  total: {type:Number, required: true},
  id: {type: mongoose.Schema.Types.ObjectId, required: true}
},{timestamps:true});

const Order = mongoose.model("Order", orderSchema)

exports.Order = Order;