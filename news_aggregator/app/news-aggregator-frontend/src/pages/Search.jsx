import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  X,
  Filter,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Clock,
  ChevronDown,
  Heart,
  MessageCircle,
  Eye,
  Loader2,
  AlertCircle,
  Sparkles,
  Hash,
  Users,
  SlidersHorizontal
} from 'lucide-react';
import { searchAPI, postAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState('posts');
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    dateRange: 'all',
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches] = useState([
    'Artificial Intelligence',
    'Web Development',
    'Climate Change',
    'Cryptocurrency',
    'Space Exploration'
  ]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery, searchType, filters]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        if (searchType === 'posts') {
          const response = await searchAPI.searchPosts(query);
          // Transform backend response to match our frontend format
          const transformedPosts = (response.data || []).map(post => ({
            id: post._id,
            title: post.title,
            content: post.content || '',
            author: { 
              name: post.username, 
              id: post.userid,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userid}` 
            },
            createdAt: post.createdAt || new Date(),
            likes: post.upvote || 0,
            dislikes: post.downvote || 0,
            comments: post.noofreplies || 0,
            views: post.views || 0,
            category: 'General'
          }));
          setResults(transformedPosts);
        } else {
          const response = await searchAPI.searchUsers(query);
          // Transform backend response for users
          const transformedUsers = (response.data || []).map(post => ({
            id: post.userid,
            name: post.username,
            username: post.username,
            bio: 'News Aggregator user',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userid}`,
            followers: 0,
            posts: 1
          }));
          // Remove duplicates based on user id
          const uniqueUsers = Array.from(new Map(transformedUsers.map(user => [user.id, user])).values());
          setUsers(uniqueUsers);
        }

        // Save to recent searches
        const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      } catch (error) {
        console.error('Search error:', error);
        // Use mock data for demonstration
        if (searchType === 'posts') {
          const mockPosts = [
            {
              id: '1',
              title: 'Understanding React Hooks',
              content: 'A comprehensive guide to React Hooks and how to use them effectively in your applications...',
              author: { name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane' },
              createdAt: new Date('2024-03-15'),
              likes: 234,
              comments: 45,
              views: 1200,
              category: 'Technology'
            },
            {
              id: '2',
              title: 'The Future of AI',
              content: 'Exploring the latest developments in artificial intelligence and machine learning...',
              author: { name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
              createdAt: new Date('2024-03-14'),
              likes: 567,
              comments: 89,
              views: 3400,
              category: 'Technology'
            },
            {
              id: '3',
              title: 'Climate Change Solutions',
              content: 'Innovative approaches to combat climate change and create a sustainable future...',
              author: { name: 'Emily Green', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily' },
              createdAt: new Date('2024-03-13'),
              likes: 432,
              comments: 67,
              views: 2100,
              category: 'Science'
            }
          ].filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase())
          );
          setResults(mockPosts);
        } else {
          const mockUsers = [
            {
              id: '1',
              name: 'Jane Smith',
              username: 'janesmith',
              bio: 'Tech enthusiast and software developer',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
              followers: 1234,
              posts: 45
            },
            {
              id: '2',
              name: 'John Doe',
              username: 'johndoe',
              bio: 'AI researcher and writer',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
              followers: 5678,
              posts: 123
            }
          ].filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase())
          );
          setUsers(mockUsers);
        }
      } finally {
        setLoading(false);
      }
    }, 500),
    [searchType, recentSearches]
  );

  const performSearch = () => {
    debouncedSearch(searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      performSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setUsers([]);
    setSearchParams({});
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    setSearchParams({ q: query });
  };

  const handleTrendingSearch = (query) => {
    setSearchQuery(query);
    setSearchParams({ q: query });
  };

  const applySorting = (items) => {
    const sorted = [...items];
    switch (filters.sortBy) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'popular':
        return sorted.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
      case 'mostViewed':
        return sorted.sort((a, b) => b.views - a.views);
      default:
        return sorted;
    }
  };

  const applyDateFilter = (items) => {
    const now = new Date();
    return items.filter(item => {
      const itemDate = new Date(item.createdAt);
      switch (filters.dateRange) {
        case 'today':
          return itemDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return itemDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return itemDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
          return itemDate >= yearAgo;
        default:
          return true;
      }
    });
  };

  const filteredResults = applySorting(applyDateFilter(results));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center">
              <SearchIcon className="absolute left-4 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for posts, users, topics..."
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Search Type Tabs */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSearchType('posts')}
                className={`px-4 py-2 rounded-md transition-all ${
                  searchType === 'posts'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Posts</span>
                </div>
              </button>
              <button
                onClick={() => setSearchType('users')}
                className={`px-4 py-2 rounded-md transition-all ${
                  searchType === 'users'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </div>
              </button>
            </div>

            {/* Filters Button */}
            {searchType === 'posts' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && searchType === 'posts' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="latest">Latest</option>
                      <option value="popular">Most Popular</option>
                      <option value="mostViewed">Most Viewed</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="technology">Technology</option>
                      <option value="science">Science</option>
                      <option value="business">Business</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Results */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : searchQuery ? (
              <>
                {/* Results Header */}
                {(filteredResults.length > 0 || users.length > 0) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {searchType === 'posts' 
                        ? `${filteredResults.length} results for "${searchQuery}"`
                        : `${users.length} users found`
                      }
                    </h2>
                  </div>
                )}

                {/* Posts Results */}
                {searchType === 'posts' && (
                  <AnimatePresence>
                    {filteredResults.length > 0 ? (
                      <div className="space-y-4">
                        {filteredResults.map((post, index) => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            onClick={() => navigate(`/post/${post.id}`)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {post.author.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {post.category && (
                                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm">
                                  {post.category}
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {post.content}
                            </p>

                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4" />
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.comments}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No posts found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try adjusting your search terms or filters
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                )}

                {/* Users Results */}
                {searchType === 'users' && (
                  <AnimatePresence>
                    {users.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            onClick={() => navigate(`/profile/${user.id}`)}
                          >
                            <div className="flex items-center space-x-4 mb-4">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-16 h-16 rounded-full"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {user.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {user.bio}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{user.followers} followers</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="w-4 h-4" />
                                <span>{user.posts} posts</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No users found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try searching with a different name or username
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start searching
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a search term to find posts and users
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Searches</span>
                  </h3>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('recentSearches');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearch(search)}
                      className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Trending Searches</span>
              </h3>
              <div className="space-y-3">
                {trendingSearches.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingSearch(trend)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {trend}
                      </span>
                      <Hash className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Tips */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span>Search Tips</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Use quotes for exact phrases</li>
                <li>• Add filters to narrow results</li>
                <li>• Search by author with @username</li>
                <li>• Use hashtags to find topics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;