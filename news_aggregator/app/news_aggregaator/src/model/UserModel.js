const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Post = require("./PostModel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true  // Allows null/undefined values while still enforcing uniqueness
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    default: ''
  },
  dob: {
    type: Date
  },
  
  // Profile Information
  bio: { 
    type: String, 
    default: '' 
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  profileImage: { 
    type: String 
  },
  
  // Social Links
  linkedin: { 
    type: String, 
    default: '' 
  },
  twitter: { 
    type: String, 
    default: '' 
  },
  github: {
    type: String,
    default: ''
  },
  
  // Relationships
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user' 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user' 
  }],
  
  // Notification Settings
  notifyFollow: { 
    type: Boolean, 
    default: true 
  },
  notifyComment: { 
    type: Boolean, 
    default: true 
  },
  notifyMention: {
    type: Boolean,
    default: true
  },
  notifyNewsletter: {
    type: Boolean,
    default: false
  },
  
  // Privacy Settings
  profilePublic: {
    type: Boolean,
    default: true
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  showActivity: {
    type: Boolean,
    default: true
  },
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
}, {timestamps: true})

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