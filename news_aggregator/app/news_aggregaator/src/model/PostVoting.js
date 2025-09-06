const mongoose = require("mongoose");
const User = require("./UserModel");
const Post = require("./PostModel");

const PostVoting = new mongoose.Schema({
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: true
    },
    postid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Post',
        required: true
    },
    vote : {                     // 1 for upvote, -1 for downvote, 0 for neutral;
        type : Number,
        required : true,
        enum: [-1, 0, 1],  // Restrict to valid vote values
        default: 0
    }
}, {
    timestamps: true
})

// Create compound unique index to prevent duplicate votes
PostVoting.index({ userid: 1, postid: 1 }, { unique: true });

const PostVote = mongoose.model("postvoting", PostVoting);

module.exports = PostVote;