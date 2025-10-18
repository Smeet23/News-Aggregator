import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Flame, 
  Filter,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
  Calendar,
  Hash,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Zap,
  PlusCircle
} from 'lucide-react';
import { postAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loading skeleton component
const PostSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
  </div>
);

// Featured post card for hero section
const FeaturedPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl overflow-hidden shadow-2xl"
    >
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative p-8 md:p-12">
        <div className="flex items-center space-x-2 text-white/90 mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Featured Story</span>
        </div>
        
        <Link to={`/post/${post._id}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 hover:text-white/90 transition-colors">
            {post.title}
          </h1>
        </Link>
        
        <p className="text-white/90 text-lg mb-6 line-clamp-3">
          {post.content}
        </p>
        
        <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              {post.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="font-medium">{post.user?.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{estimateReadTime(post.content)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{post.views || Math.floor(Math.random() * 1000) + 100} views</span>
          </div>
        </div>
        
        <Link 
          to={`/post/${post._id}`}
          className="inline-flex items-center space-x-2 mt-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold hover:bg-white/30 transition-all"
        >
          <span>Read Full Story</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
};

// Enhanced post card with more features
const PostCard = ({ post, onVote }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { isAuthenticated } = useAuth();

  // Auto-detect category from content
  const detectCategory = (post) => {
    const searchText = (post.title + ' ' + post.content).toLowerCase();
    
    if (searchText.includes('technology') || searchText.includes('tech') || 
        searchText.includes('ai') || searchText.includes('software') || 
        searchText.includes('quantum') || searchText.includes('apple')) {
      return { name: 'Technology', color: 'blue' };
    }
    if (searchText.includes('sports') || searchText.includes('game') || 
        searchText.includes('match') || searchText.includes('olympic') || 
        searchText.includes('world cup') || searchText.includes('tennis')) {
      return { name: 'Sports', color: 'green' };
    }
    if (searchText.includes('entertainment') || searchText.includes('movie') || 
        searchText.includes('music') || searchText.includes('film') || 
        searchText.includes('festival')) {
      return { name: 'Entertainment', color: 'purple' };
    }
    if (searchText.includes('politics') || searchText.includes('election') || 
        searchText.includes('government') || searchText.includes('policy')) {
      return { name: 'Politics', color: 'red' };
    }
    if (searchText.includes('science') || searchText.includes('research') || 
        searchText.includes('discovery') || searchText.includes('mars') || 
        searchText.includes('space')) {
      return { name: 'Science', color: 'indigo' };
    }
    return null;
  };

  const category = detectCategory(post);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }
    
    try {
      const vote = voteType === 'upvote' ? 1 : -1;
      await postAPI.votePost(post._id, vote);
      onVote(post._id, voteType);
      toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}!`);
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100),
        url: window.location.origin + `/post/${post._id}`,
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min`;
  };

  // Determine if post is trending
  const isTrending = (post.upvote - post.downvote) > 10 || post.noofreplies > 5;
  const isHot = post.upvote > 20;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Trending/Hot Badge */}
      {(isTrending || isHot) && (
        <div className="px-6 pt-4">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white">
            {isHot ? <Flame className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            <span>{isHot ? 'Hot' : 'Trending'}</span>
          </div>
        </div>
      )}

      {/* Post Header */}
      <div className="p-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {post.user?.name?.charAt(0).toUpperCase() || post.user?.username?.charAt(0).toUpperCase() || post.user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              {post.user?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Award className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <Link 
                to={`/profile/${typeof post.userid === 'object' ? post.userid._id || post.userid : post.userid}`}
                className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                {post.user?.name || post.user?.username || post.user?.email?.split('@')[0] || 'Anonymous'}
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span>{estimateReadTime(post.content)}</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Post Content */}
        <Link to={`/post/${post._id}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
            {post.content}
          </p>
        </Link>

        {/* Category Badge */}
        {category && (
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
            category.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
            category.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
            category.color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
            category.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
            category.color === 'indigo' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
          }`}>
            <span>{category.name}</span>
          </div>
        )}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
              >
                <Hash className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{post.views || Math.floor(Math.random() * 1000) + 100}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{post.shares || 0} shares</span>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleVote('upvote')}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all"
            >
              <ChevronUp className="w-5 h-5" />
              <span className="font-medium">{post.upvote || 0}</span>
            </button>
            <button
              onClick={() => handleVote('downvote')}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              <ChevronDown className="w-5 h-5" />
              <span className="font-medium">{post.downvote || 0}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/post/${post._id}`}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.noofreplies || 0}</span>
            </Link>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-lg transition-all ${
                isBookmarked
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <div className="relative">
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 p-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`);
                      toast.success('Link copied!');
                      setShowShareMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Copy link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Trending Topics Sidebar
const TrendingTopics = () => {
  const topics = [
    { name: 'Technology', count: 234, trend: 'up' },
    { name: 'Politics', count: 189, trend: 'up' },
    { name: 'Sports', count: 156, trend: 'down' },
    { name: 'Entertainment', count: 145, trend: 'up' },
    { name: 'Science', count: 98, trend: 'stable' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending Topics</h3>
      </div>
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <Link
            key={index}
            to={`/search?topic=${topic.name.toLowerCase()}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{topic.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{topic.count} posts</p>
            </div>
            <div className={`text-sm ${
              topic.trend === 'up' ? 'text-green-500' : 
              topic.trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {topic.trend === 'up' && <TrendingUp className="w-4 h-4" />}
              {topic.trend === 'down' && <ChevronDown className="w-4 h-4" />}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main Home Component
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAuthenticated } = useAuth();

  const categories = [
    { value: 'all', label: 'All Posts', icon: null },
    { value: 'technology', label: 'Technology', icon: null },
    { value: 'sports', label: 'Sports', icon: null },
    { value: 'entertainment', label: 'Entertainment', icon: null },
    { value: 'politics', label: 'Politics', icon: null },
    { value: 'science', label: 'Science', icon: null },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
    setCurrentPage(1);
  }, [posts, sortBy, searchTerm, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getAllPosts();
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    // Filter by category - search for category keywords in title and content
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => {
        const searchText = (post.title + ' ' + post.content).toLowerCase();
        
        // Check if the post contains category-related keywords
        switch(selectedCategory) {
          case 'technology':
            return searchText.includes('technology') || 
                   searchText.includes('tech') || 
                   searchText.includes('ai') || 
                   searchText.includes('software') ||
                   searchText.includes('computer') ||
                   searchText.includes('digital') ||
                   searchText.includes('innovation') ||
                   searchText.includes('apple') ||
                   searchText.includes('quantum');
          case 'sports':
            return searchText.includes('sports') || 
                   searchText.includes('game') || 
                   searchText.includes('match') || 
                   searchText.includes('player') ||
                   searchText.includes('team') ||
                   searchText.includes('championship') ||
                   searchText.includes('olympic') ||
                   searchText.includes('world cup') ||
                   searchText.includes('tennis') ||
                   searchText.includes('football');
          case 'entertainment':
            return searchText.includes('entertainment') || 
                   searchText.includes('movie') || 
                   searchText.includes('music') || 
                   searchText.includes('film') ||
                   searchText.includes('show') ||
                   searchText.includes('festival') ||
                   searchText.includes('streaming') ||
                   searchText.includes('box office');
          case 'politics':
            return searchText.includes('politics') || 
                   searchText.includes('political') || 
                   searchText.includes('election') || 
                   searchText.includes('government') ||
                   searchText.includes('policy') ||
                   searchText.includes('president') ||
                   searchText.includes('minister') ||
                   searchText.includes('treaty') ||
                   searchText.includes('summit');
          case 'science':
            return searchText.includes('science') || 
                   searchText.includes('scientific') || 
                   searchText.includes('research') || 
                   searchText.includes('study') ||
                   searchText.includes('discovery') ||
                   searchText.includes('experiment') ||
                   searchText.includes('mars') ||
                   searchText.includes('space') ||
                   searchText.includes('climate');
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort posts
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.upvote + b.noofreplies) - (a.upvote + a.noofreplies));
        break;
      case 'trending':
        filtered.sort((a, b) => (b.upvote - b.downvote) - (a.upvote - a.downvote));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredPosts(filtered);
  };

  const handleVote = (postId, voteType) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            upvote: voteType === 'upvote' ? post.upvote + 1 : post.upvote,
            downvote: voteType === 'downvote' ? post.downvote + 1 : post.downvote,
          };
        }
        return post;
      })
    );
  };

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: Clock },
    { value: 'popular', label: 'Popular', icon: Flame },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost + 1, indexOfLastPost + 1); // Skip first for featured
  const totalPages = Math.ceil((filteredPosts.length - 1) / postsPerPage); // -1 for featured
  const featuredPost = filteredPosts[0]; // First post as featured

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Latest News & Stories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Stay informed with trending stories and engaging discussions from our community
          </p>
        </div>

        {/* Featured Post - Show only on first page */}
        {currentPage === 1 && featuredPost && !loading && (
          <div className="mb-8">
            <FeaturedPostCard post={featuredPost} />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.value
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search posts, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchPosts}
                className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Column */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No posts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Be the first to create a post!'}
                </p>
                {isAuthenticated && (
                  <Link
                    to="/create-post"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all"
                  >
                    Create First Post
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <AnimatePresence>
                    {currentPosts.map((post) => (
                      <PostCard key={post._id} post={post} onVote={handleVote} />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                currentPage === pageNumber
                                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Post count info */}
                <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Showing {indexOfFirstPost + 2}-{Math.min(indexOfLastPost + 1, filteredPosts.length)} of {filteredPosts.length} posts
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TrendingTopics />
            
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Set(posts.map(p => p.userid)).size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Comments</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {posts.reduce((acc, post) => acc + (post.noofreplies || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            {isAuthenticated && (
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Share Your Story</h3>
                <p className="text-white/90 mb-4">Have something interesting to share with the community?</p>
                <Link
                  to="/create-post"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold hover:bg-white/30 transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Create Post</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;