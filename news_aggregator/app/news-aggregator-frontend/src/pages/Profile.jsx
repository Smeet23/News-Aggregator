import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Linkedin,
  Edit,
  Settings,
  Grid,
  List,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  Users,
  FileText,
  Award,
  Star,
  BookOpen,
  Clock,
  Share2,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Check
} from 'lucide-react';
import { profileAPI, postAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState('grid');
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    likes: 0
  });

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Fetch profile data
      const profileRes = userId 
        ? await profileAPI.getProfile(userId)
        : await profileAPI.getMyProfile();
      
      if (profileRes.data) {
        setProfile(profileRes.data);
      }

      // Fetch all posts
      const postsRes = await postAPI.getAllPosts();
      
      // The backend returns { posts: [...] } structure
      const allPosts = postsRes.data?.posts || postsRes.data || [];
      
      // Filter posts for this user - backend uses 'userid' field
      const targetUserId = userId || currentUser?.id || profileRes.data?._id;
      const userPosts = allPosts.filter(post => {
        // Check if post.userid matches (backend field name)
        return post.userid === targetUserId || post.userid?._id === targetUserId;
      });
      
      // Transform posts to consistent format
      const transformedPosts = userPosts.map(post => ({
        id: post._id,
        _id: post._id,
        title: post.title,
        content: post.content,
        author: post.userid,
        createdAt: post.createdAt,
        likes: post.upvote || 0,
        dislikes: post.downvote || 0,
        comments: post.noofreplies || 0,
        views: post.views || 0
      }));
      
      setPosts(transformedPosts);

      // Set stats
      setStats({
        posts: transformedPosts.length,
        followers: profileRes.data?.followers?.length || 0,
        following: profileRes.data?.following?.length || 0,
        likes: transformedPosts.reduce((total, post) => total + post.likes, 0)
      });

      // Check if current user is following this profile
      if (!isOwnProfile && currentUser) {
        setIsFollowing(profileRes.data?.followers?.includes(currentUser.id));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use mock data for now
      setProfile({
        id: userId || currentUser?.id,
        name: currentUser?.name || 'John Doe',
        username: currentUser?.username || 'johndoe',
        email: currentUser?.email || 'john@example.com',
        bio: 'Passionate about technology and innovation. Writing about tech trends, startups, and digital transformation.',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || currentUser?.id}`,
        location: 'San Francisco, CA',
        website: 'https://johndoe.com',
        joined: new Date('2024-01-01'),
        social: {
          twitter: 'johndoe',
          github: 'johndoe',
          linkedin: 'johndoe'
        }
      });

      // Mock posts
      setPosts([
        {
          id: '1',
          title: 'The Future of AI in Healthcare',
          content: 'Exploring how artificial intelligence is revolutionizing medical diagnosis...',
          author: userId || currentUser?.id,
          createdAt: new Date('2024-03-15'),
          likes: 45,
          comments: 12,
          views: 230
        },
        {
          id: '2',
          title: 'Building Scalable Web Applications',
          content: 'Best practices for creating applications that can handle millions of users...',
          author: userId || currentUser?.id,
          createdAt: new Date('2024-03-10'),
          likes: 67,
          comments: 23,
          views: 450
        }
      ]);

      setStats({
        posts: 2,
        followers: 1234,
        following: 567,
        likes: 112
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(userId);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        toast.success('Unfollowed successfully');
      } else {
        await profileAPI.followUser(userId);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.success('Following successfully');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name}'s Profile`,
        text: `Check out ${profile?.name}'s profile on News Aggregator`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-8"
        >
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600" />

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              {/* Avatar */}
              <div className="flex items-end space-x-6">
                <img
                  src={profile?.avatar}
                  alt={profile?.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white"
                />
                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile?.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">@{profile?.username}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                {isOwnProfile ? (
                  <>
                    <Link
                      to="/settings"
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                        isFollowing
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                    <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {profile?.bio}
            </p>

            {/* Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              {profile?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-primary-600"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>{profile.website}</span>
                </a>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile?.joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 mb-6">
              {profile?.social?.twitter && (
                <a
                  href={`https://twitter.com/${profile.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {profile?.social?.github && (
                <a
                  href={`https://github.com/${profile.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile?.social?.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.social.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.posts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
              </div>
              <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.followers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.following}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.likes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 border-b-2 transition-colors ${
                    activeTab === 'posts'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Posts</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                      {stats.posts}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-4 border-b-2 transition-colors ${
                    activeTab === 'about'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>About</span>
                  </div>
                </button>
              </div>

              {/* View Mode Toggle */}
              {activeTab === 'posts' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'posts' && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}
                >
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 cursor-pointer hover:shadow-md transition-all ${
                        viewMode === 'list' ? 'flex items-start space-x-4' : ''
                      }`}
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      {viewMode === 'list' && (
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
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
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Skills & Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['JavaScript', 'React', 'Node.js', 'Python', 'AI/ML', 'Cloud Computing', 'DevOps'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Achievements
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                          <Star className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Top Writer</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Technology Category</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Trending Author</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">March 2024</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Chart */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Activity Overview
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded ${
                              Math.random() > 0.5
                                ? 'bg-primary-500/20'
                                : Math.random() > 0.3
                                ? 'bg-primary-500/40'
                                : Math.random() > 0.1
                                ? 'bg-primary-500/60'
                                : 'bg-primary-500'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Last 5 weeks of activity
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;