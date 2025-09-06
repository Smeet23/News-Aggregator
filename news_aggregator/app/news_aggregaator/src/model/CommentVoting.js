const mongoose = require("mongoose");
const User = require("./UserModel");
const Comment = require("./CommentModel");

const CommentVoting = new mongoose.Schema({
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: true
    },
    commentid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'comments',
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
CommentVoting.index({ userid: 1, commentid: 1 }, { unique: true });

const CommentVote = mongoose.model("commentvoting", CommentVoting);
module.exports = CommentVote;