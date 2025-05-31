const Notification = require('../model/Notification');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });

    res.render('notifications', { notifications });
  } catch (error) {
    console.error('Notification fetch error:', error.message);
    res.status(500).send('Error loading notifications');
  }
};

module.exports = { getNotifications };
