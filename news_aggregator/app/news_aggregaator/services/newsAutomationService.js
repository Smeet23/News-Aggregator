// services/newsAutomationService.js
const axios = require('axios');
const User = require('../src/model/UserModel');
const Post = require('../src/model/PostModel');

// News channel accounts configuration
const NEWS_CHANNELS = [
  {
    name: 'BBC News',
    email: 'bbc@newsauto.system',
    bio: 'Official BBC News - Breaking news, analysis, and features from around the world.',
    profileImage: '/images/bbc-profile.jpg',
    searchTerms: ['bbc news', 'bbc.com']
  },
  {
    name: 'CNN',
    email: 'cnn@newsauto.system',
    bio: 'CNN - Breaking news and live coverage of current events.',
    profileImage: '/images/cnn-profile.jpg',
    searchTerms: ['cnn', 'cnn.com']
  },
  {
    name: 'NDTV',
    email: 'ndtv@newsauto.system',
    bio: 'NDTV - India\'s most trusted news source.',
    profileImage: '/images/ndtv-profile.jpg',
    searchTerms: ['ndtv', 'ndtv.com']
  },
  {
    name: 'The Times of India',
    email: 'toi@newsauto.system',
    bio: 'The Times of India - India\'s largest English daily.',
    profileImage: '/images/toi-profile.jpg',
    searchTerms: ['times of india', 'timesofindia.com']
  },
  {
    name: 'The Hindu',
    email: 'thehindu@newsauto.system',
    bio: 'The Hindu - India\'s national newspaper since 1878.',
    profileImage: '/images/thehindu-profile.jpg',
    searchTerms: ['the hindu', 'thehindu.com']
  },
  {
    name: 'Reuters',
    email: 'reuters@newsauto.system',
    bio: 'Reuters - International news and information provider.',
    profileImage: '/images/reuters-profile.jpg',
    searchTerms: ['reuters', 'reuters.com']
  },
  {
    name: 'Al Jazeera',
    email: 'aljazeera@newsauto.system',
    bio: 'Al Jazeera - Breaking news, analysis and features.',
    profileImage: '/images/aljazeera-profile.jpg',
    searchTerms: ['al jazeera', 'aljazeera.com']
  }
];

/**
 * Creates news channel user accounts if they don't exist
 */
const createNewsChannelAccounts = async () => {
  try {
    console.log('🔧 Creating/Updating news channel accounts...');
    
    for (const channel of NEWS_CHANNELS) {
      let user = await User.findOne({ email: channel.email });
      
      if (!user) {
        // Create new news channel account
        user = await User.create({
          name: channel.name,
          email: channel.email,
          password: 'auto_generated_secure_password_' + Date.now(), // Auto-generated password
          bio: channel.bio,
          profileImage: channel.profileImage,
          posts: []
        });
        console.log(`✅ Created account for ${channel.name} (ID: ${user._id})`);
      } else {
        // Update existing account info
        user.bio = channel.bio;
        user.profileImage = channel.profileImage;
        await user.save();
        console.log(`✅ Updated account for ${channel.name} (ID: ${user._id})`);
      }
    }
    
    console.log('✅ News channel accounts setup completed');
    
    // Verify accounts were created
    const totalNewsChannels = await User.countDocuments({
      email: { $in: NEWS_CHANNELS.map(ch => ch.email) }
    });
    console.log(`📊 Total news channel accounts in database: ${totalNewsChannels}/${NEWS_CHANNELS.length}`);
    
  } catch (error) {
    console.error('❌ Error creating news channel accounts:', error.message);
    throw error;
  }
};

/**
 * Matches article source to news channel user
 */
const matchSourceToChannel = (sourceName) => {
  if (!sourceName) return null;
  
  const sourceNameLower = sourceName.toLowerCase();
  
  return NEWS_CHANNELS.find(channel => 
    channel.searchTerms.some(term => 
      sourceNameLower.includes(term.toLowerCase()) || 
      term.toLowerCase().includes(sourceNameLower)
    )
  );
};

/**
 * Checks if article already exists to avoid duplicates
 */
const isArticleAlreadyPosted = async (title, url) => {
  try {
    const existingPost = await Post.findOne({
      $or: [
        { title: title },
        { link: url }
      ]
    });
    return !!existingPost;
  } catch (error) {
    console.error('Error checking duplicate article:', error.message);
    return false;
  }
};

/**
 * Creates a post from news article
 */
const createNewsPost = async (article, channelUser) => {
  try {
    // Check for duplicates
    const isDuplicate = await isArticleAlreadyPosted(article.title, article.url);
    if (isDuplicate) {
      console.log(`⚠ Skipping duplicate article: ${article.title.substring(0, 50)}...`);
      return null;
    }

    // Create post
    const post = await Post.create({
      userid: channelUser._id.toString(),
      title: article.title,
      content: article.description || article.content || 'Read full article at the link below.',
      link: article.url
    });

    if (post) {
      // Add post to user's posts array
      await User.findOneAndUpdate(
        { _id: channelUser._id },
        { $push: { posts: post._id } }
      );
      
      console.log(`✓ Posted: ${article.title.substring(0, 50)}... by ${channelUser.name}`);
      return post;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating news post:', error.message);
    return null;
  }
};

/**
 * Fetches and posts news articles from trusted sources
 */
const fetchAndPostNews = async () => {
  try {
    const API_KEY = process.env.GNEWS_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ GNews API key not found. Please set GNEWS_API_KEY environment variable.');
      return { success: false, message: 'API key missing' };
    }

    console.log('📰 Fetching latest news articles...');

    const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
      params: {
        token: API_KEY,
        lang: 'en',
        country: 'in', // Change as needed
        max: 50 // Reasonable limit
      },
      timeout: 15000
    });

    if (!response.data || !response.data.articles) {
      console.error('❌ Invalid response from GNews API');
      return { success: false, message: 'Invalid API response' };
    }

    let postsCreated = 0;
    const articles = response.data.articles;
    console.log(`📊 Found ${articles.length} total articles from API`);

    // Debug: Check what news channels exist in database
    const existingChannels = await User.find({
      email: { $in: NEWS_CHANNELS.map(ch => ch.email) }
    }).select('name email');
    console.log(`📊 News channels in database: ${existingChannels.length}`);
    existingChannels.forEach(ch => console.log(`   - ${ch.name} (${ch.email})`));

    for (const article of articles) {
      if (!article.source || !article.source.name) continue;

      console.log(`🔍 Processing article from: ${article.source.name}`);

      // Match article to trusted news channel
      const matchedChannel = matchSourceToChannel(article.source.name);
      if (!matchedChannel) {
        console.log(`⚠️  No matching channel for: ${article.source.name}`);
        continue;
      }

      console.log(`✅ Matched to channel: ${matchedChannel.name}`);

      // Find the user account for this channel
      const channelUser = await User.findOne({ email: matchedChannel.email });
      if (!channelUser) {
        console.log(`❌ Channel user not found for ${matchedChannel.name} (${matchedChannel.email})`);
        continue;
      }

      console.log(`✅ Found channel user: ${channelUser.name} (ID: ${channelUser._id})`);

      // Create post from article
      const post = await createNewsPost(article, channelUser);
      if (post) {
        postsCreated++;
        console.log(`✅ Post created successfully: ${post._id}`);
      }

      // Add small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🎉 News fetch completed. Created ${postsCreated} new posts.`);
    return { 
      success: true, 
      message: `Successfully created ${postsCreated} news posts`,
      postsCreated 
    };

  } catch (error) {
    console.error('❌ Error fetching and posting news:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Complete setup: Create accounts and fetch initial news
 */
const setupNewsAutomation = async () => {
  try {
    console.log('🚀 Starting news automation setup...');
    
    // Step 1: Create/update news channel accounts
    await createNewsChannelAccounts();
    
    // Step 2: Fetch and post initial news
    const result = await fetchAndPostNews();
    
    console.log('🎉 News automation setup completed!');
    return result;
    
  } catch (error) {
    console.error('Error in news automation setup:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  createNewsChannelAccounts,
  fetchAndPostNews,
  setupNewsAutomation
};