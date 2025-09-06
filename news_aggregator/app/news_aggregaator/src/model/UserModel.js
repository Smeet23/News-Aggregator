const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Remove password from JSON responses
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User  = mongoose.model("user",userSchema);

module.exports = User;