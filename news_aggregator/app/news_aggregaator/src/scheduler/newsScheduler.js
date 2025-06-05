// scheduler/newsScheduler.js
const cron = require('node-cron');
const { fetchAndPostNews, createNewsChannelAccounts } = require('../../services/newsAutomationService');

const startNewsScheduler = () => {
  console.log('🕒 Starting news scheduler...');
  
  cron.schedule('0 */2 * * *', async () => {
    console.log('⏰ Scheduled news fetch starting...');
    try {
      const result = await fetchAndPostNews();
      console.log(`⏰ Scheduled fetch completed: ${result.message}`);
    } catch (error) {
      console.error('⏰ Scheduled news fetch failed:', error.message);
    }
  });

  // UPDATED: Create accounts first, then fetch news
  setTimeout(async () => {
    console.log('🚀 Initial setup and news fetch on server start...');
    try {
      // First ensure news channel accounts exist
      await createNewsChannelAccounts();
      
      // Then fetch news
      const result = await fetchAndPostNews();
      console.log(`🚀 Initial setup completed: ${result.message}`);
    } catch (error) {
      console.error('🚀 Initial setup failed:', error.message);
    }
  }, 30000);

  console.log('✅ News scheduler started successfully');
};

module.exports = { startNewsScheduler };