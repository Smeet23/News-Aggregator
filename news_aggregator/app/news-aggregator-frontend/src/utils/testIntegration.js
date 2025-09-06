// Integration Test Script for Backend-Frontend Connection
// Run this in the browser console to test all API endpoints

import { authAPI, postAPI, commentAPI, searchAPI, profileAPI } from '../services/api';

const testIntegration = async () => {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  console.log('🔍 Starting Backend-Frontend Integration Test...\n');

  // Test Auth APIs
  console.log('📋 Testing Authentication APIs...');
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    results.warnings.push('No auth token found. Some tests will be skipped.');
    console.warn('⚠️ No auth token found. Please login first for complete testing.');
  }

  // Test Post APIs
  console.log('\n📋 Testing Post APIs...');
  
  try {
    const postsResponse = await postAPI.getAllPosts();
    if (postsResponse.data) {
      results.passed.push('✅ GET /home/posts/ - Get all posts');
      console.log('✅ Get all posts working');
      
      // Test individual post if posts exist
      if (postsResponse.data.length > 0) {
        const postId = postsResponse.data[0]._id;
        try {
          const postResponse = await postAPI.getPost(postId);
          results.passed.push('✅ GET /home/posts/:id - Get individual post');
          console.log('✅ Get individual post working');
        } catch (error) {
          results.failed.push(`❌ GET /home/posts/:id - ${error.message}`);
          console.error('❌ Get individual post failed:', error.message);
        }
      }
    }
  } catch (error) {
    results.failed.push(`❌ GET /home/posts/ - ${error.message}`);
    console.error('❌ Get all posts failed:', error.message);
  }

  // Test Search APIs
  console.log('\n📋 Testing Search APIs...');
  
  if (token) {
    try {
      const searchPostResponse = await searchAPI.searchPosts('test');
      results.passed.push('✅ GET /search/searchpost/:keyword - Search posts');
      console.log('✅ Search posts working');
    } catch (error) {
      results.failed.push(`❌ GET /search/searchpost/:keyword - ${error.message}`);
      console.error('❌ Search posts failed:', error.message);
    }

    try {
      const searchUserResponse = await searchAPI.searchUsers('test');
      results.passed.push('✅ GET /search/searchuser/:username - Search users');
      console.log('✅ Search users working');
    } catch (error) {
      results.failed.push(`❌ GET /search/searchuser/:username - ${error.message}`);
      console.error('❌ Search users failed:', error.message);
    }
  } else {
    results.warnings.push('Search APIs require authentication - skipped');
  }

  // Test Profile APIs
  console.log('\n📋 Testing Profile APIs...');
  
  if (token) {
    try {
      const profileResponse = await profileAPI.getMyProfile();
      results.passed.push('✅ GET /profile/ - Get my profile');
      console.log('✅ Get my profile working');
    } catch (error) {
      results.failed.push(`❌ GET /profile/ - ${error.message}`);
      console.error('❌ Get my profile failed:', error.message);
    }
  } else {
    results.warnings.push('Profile APIs require authentication - skipped');
  }

  // Test Comment APIs (if posts exist)
  console.log('\n📋 Testing Comment APIs...');
  
  try {
    const postsResponse = await postAPI.getAllPosts();
    if (postsResponse.data && postsResponse.data.length > 0) {
      const postId = postsResponse.data[0]._id;
      try {
        const commentsResponse = await commentAPI.getComments(postId);
        results.passed.push('✅ GET /post/comments/:id - Get comments');
        console.log('✅ Get comments working');
      } catch (error) {
        results.failed.push(`❌ GET /post/comments/:id - ${error.message}`);
        console.error('❌ Get comments failed:', error.message);
      }
    }
  } catch (error) {
    results.warnings.push('Could not test comments - no posts available');
  }

  // Generate Summary Report
  console.log('\n' + '='.repeat(50));
  console.log('📊 INTEGRATION TEST SUMMARY');
  console.log('='.repeat(50));
  
  console.log(`\n✅ Passed: ${results.passed.length}`);
  results.passed.forEach(test => console.log(`  ${test}`));
  
  console.log(`\n❌ Failed: ${results.failed.length}`);
  results.failed.forEach(test => console.log(`  ${test}`));
  
  console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
  results.warnings.forEach(warning => console.log(`  ${warning}`));
  
  const totalTests = results.passed.length + results.failed.length;
  const passRate = totalTests > 0 ? ((results.passed.length / totalTests) * 100).toFixed(1) : 0;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 Pass Rate: ${passRate}% (${results.passed.length}/${totalTests})`);
  console.log('='.repeat(50));

  return results;
};

// Export for use in browser console
window.testIntegration = testIntegration;

export default testIntegration;