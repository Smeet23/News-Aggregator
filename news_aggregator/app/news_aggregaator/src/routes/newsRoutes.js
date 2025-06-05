// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const { createNewsChannelAccounts, fetchAndPostNews, setupNewsAutomation } = require('../../services/newsAutomationService');

// Admin route to setup news channels (run this once)
router.post('/admin/setup-news', async (req, res) => {
  try {
    const result = await setupNewsAutomation();
    
    res.status(200).json({
      success: result.success,
      message: result.message,
      postsCreated: result.postsCreated || 0
    });
    
  } catch (error) {
    console.error('Setup news error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to setup news automation'
    });
  }
});

// Admin route to manually fetch new articles
router.post('/admin/fetch-news', async (req, res) => {
  try {
    const result = await fetchAndPostNews();
    
    res.status(200).json({
      success: result.success,
      message: result.message,
      postsCreated: result.postsCreated || 0
    });
    
  } catch (error) {
    console.error('Manual fetch news error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles'
    });
  }
});

// Admin route to create/update news channel accounts only
router.post('/admin/create-channels', async (req, res) => {
  try {
    await createNewsChannelAccounts();
    res.status(200).json({
      success: true,
      message: 'News channel accounts created/updated successfully'
    });
  } catch (error) {
    console.error('Create channels error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create news channel accounts'
    });
  }
});

module.exports = router;

