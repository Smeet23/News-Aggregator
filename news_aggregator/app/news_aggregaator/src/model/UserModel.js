const mongoose = require("mongoose");
const Post = require("./PostModel");

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
    unique:true
},

password:{
    type:String,
    required:true
},

posts: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],

followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
bio: { type: String, default: '' },
linkedin: { type: String, default: '' },
twitter: { type: String, default: '' },
notifyFollow: { type: Boolean, default: true },
notifyComment: { type: Boolean, default: true },
profileImage: { type: String }, // Store image filename or URL


}, {timestamps:true})

const User  = mongoose.model("user",userSchema);

module.exports = User;