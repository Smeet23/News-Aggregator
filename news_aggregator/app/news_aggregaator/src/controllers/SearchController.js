const User = require("../model/UserModel");
const Post = require("../model/PostModel");
const asyncHandler = require("express-async-handler");
const path = require('path');

const SearchByKeyword = async (req, res) => {
    const keyword = req.params.keyword;
    
    // Sanitize input to prevent NoSQL injection
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ error: 'Invalid search keyword' });
    }
    
    // Escape special regex characters to prevent regex injection
    const sanitizedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Limit keyword length to prevent ReDoS attacks
    if (sanitizedKeyword.length > 100) {
      return res.status(400).json({ error: 'Search keyword too long' });
    }
  
    try {
      // Find posts that contain the keyword in the title or content
      const posts = await Post.find({
        $or: [
          { title: { $regex: sanitizedKeyword, $options: 'i' } }, // Case-insensitive search
          { content: { $regex: sanitizedKeyword, $options: 'i' } }
        ]
      }).limit(100); // Limit results to prevent memory issues

      // Extract user IDs from posts
    const userIds = posts.map(post => post.userid);

    // Retrieve user details based on user IDs
    const users = await User.find({ _id: { $in: userIds } }, 'name');

    
    const postsWithUsernames = posts.map(post => {
      const user = users.find(user => user._id.equals(post.userid));
      
      return {
        _id: post._id,
        title: post.title,
        upvote: post.upvote,
        downvote: post.downvote,
        noofreplies: post.noofreplies,
        username: user.name,
        userid : user._id
      };
    });

    return res.status(200).send(postsWithUsernames);
    } catch (error) {
      console.error(error);
     return res.status(500).send('Internal Server Error');
    }


    
  };

  //controller for searching by username
  const SearchByUsername = async (req, res) => {
    const { username } = req.params;
    
    // Sanitize input to prevent NoSQL injection
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Invalid username' });
    }
    
    // Escape special regex characters
    const sanitizedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Limit username length
    if (sanitizedUsername.length > 50) {
      return res.status(400).json({ error: 'Username too long' });
    }
  
    try {
      // Find the user by username
      const users = await User.find({ name: { $regex: sanitizedUsername, $options: 'i' } }).limit(50)
  
      if (!users) {
        return res.status(404).json({ error: 'User not found' });
      }
  
    const postIds = users.reduce((acc, user) => acc.concat(user.posts), []);
    
    const postDetails = await Post.find({ _id: { $in: postIds } });
    console.log(postDetails);
    const postsWithUsername = postDetails.map(post => {

      const user = users.find(u => u.posts.includes(post._id));
      
      return{
      _id: post._id,
        title: post.title,
        upvote: post.upvote,
        downvote: post.downvote,
        noofreplies: post.noofreplies,
      username: user.name,  // Include all other properties of the post
      userid : post.userid
    }});

    res.json(postsWithUsername);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  module.exports = {
    SearchByKeyword,
    SearchByUsername
}