const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // receiver
  type: { type: String, enum: ['follow', 'comment', 'upvote'], required: true },
  message: String,
  isRead: { type: Boolean, default: false },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
