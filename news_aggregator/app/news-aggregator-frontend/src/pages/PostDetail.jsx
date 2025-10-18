import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
  Calendar,
  Clock,
  User,
  Send,
  Heart,
  Reply,
  Flag,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  Hash,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { postAPI, commentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Comment Component
const Comment = ({ comment, postId, onReply, onDelete, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();

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

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment._id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
      toast.success('Reply posted!');
    } catch (error) {
      toast.error('Failed to post reply');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDelete(comment._id);
        toast.success('Comment deleted');
      } catch (error) {
        toast.error('Failed to delete comment');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comment.user?.name || 'Anonymous'}
                </span>
                {comment.user?.isVerified && (
                  <Award className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {isAuthenticated && user?.email === comment.user?.email && (
              <button
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comment Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          {comment.content}
        </p>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{comment.likes || 0}</span>
          </button>
          
          {isAuthenticated && level < 2 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span className="text-sm">Reply</span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && isAuthenticated && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleReplySubmit}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? '...' : 'Reply'}
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Related Posts Component
const RelatedPosts = ({ currentPostId, category }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedPosts();
  }, [currentPostId]);

  const fetchRelatedPosts = async () => {
    try {
      const response = await postAPI.getAllPosts();
      const allPosts = response.data.posts || [];
      
      // Filter posts that might be related (exclude current post)
      const related = allPosts
        .filter(post => post._id !== currentPostId)
        .slice(0, 3); // Get top 3 posts
      
      setRelatedPosts(related);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Posts</h3>
      <div className="space-y-3">
        {relatedPosts.map((post) => (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            className="block p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {post.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {post.content}
            </p>
            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
              <span>{post.user?.name || 'Anonymous'}</span>
              <span>•</span>
              <span>{post.noofreplies || 0} comments</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main PostDetail Component
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      console.log('Fetching post with ID:', id);
      const response = await postAPI.getPost(id);
      console.log('Post response:', response.data);
      
      // Handle different response formats
      const postData = response.data?.post || response.data;
      
      if (!postData) {
        throw new Error('Post not found');
      }
      
      // Transform the post data to ensure consistency
      const transformedPost = {
        ...postData,
        _id: postData._id || id,
        title: postData.title || 'Untitled',
        content: postData.content || '',
        author: postData.user || postData.author || { name: 'Unknown' },
        upvote: postData.upvote || 0,
        downvote: postData.downvote || 0,
        noofreplies: postData.noofreplies || 0,
        createdAt: postData.createdAt || new Date()
      };
      
      setPost(transformedPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      console.error('Error response:', error.response);
      toast.error(`Failed to load post: ${error.response?.data?.error || error.message}`);
      // Don't navigate away immediately - let user see the error
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(id);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }
    
    try {
      const vote = voteType === 'upvote' ? 1 : -1;
      await postAPI.votePost(id, vote);
      
      setPost(prev => ({
        ...prev,
        upvote: voteType === 'upvote' ? prev.upvote + 1 : prev.upvote,
        downvote: voteType === 'downvote' ? prev.downvote + 1 : prev.downvote,
      }));
      
      toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}!`);
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await commentAPI.createComment(id, commentContent);
      
      // Add the new comment to the list
      const newComment = {
        _id: Date.now().toString(),
        content: commentContent,
        user: { name: user?.name || user?.email?.split('@')[0], email: user?.email },
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
      };
      
      setComments([newComment, ...comments]);
      setCommentContent('');
      setPost(prev => ({ ...prev, noofreplies: (prev.noofreplies || 0) + 1 }));
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    }
    setIsSubmittingComment(false);
  };

  const handleReply = async (parentCommentId, content) => {
    // This would need backend support for nested comments
    // For now, we'll add it as a top-level comment
    const newComment = {
      _id: Date.now().toString(),
      content: `@reply: ${content}`,
      user: { name: user?.name || user?.email?.split('@')[0], email: user?.email },
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };
    
    setComments([newComment, ...comments]);
    setPost(prev => ({ ...prev, noofreplies: (prev.noofreplies || 0) + 1 }));
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
      setPost(prev => ({ ...prev, noofreplies: Math.max(0, (prev.noofreplies || 0) - 1) }));
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.split(' ').length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Post Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The post you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-8">
                {/* Post Header */}
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <Link
                          to={`/profile/${post.userid}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-primary-600"
                        >
                          {post.user?.name || 'Anonymous'}
                        </Link>
                        <div className="text-xs">{formatDate(post.createdAt)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{estimateReadTime(post.content)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views || Math.floor(Math.random() * 1000) + 100} views</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.noofreplies || 0} comments</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Post Link */}
                {post.link && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      {post.link}
                    </a>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote('upvote')}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all"
                    >
                      <ChevronUp className="w-5 h-5" />
                      <span className="font-medium">{post.upvote || 0}</span>
                    </button>
                    <button
                      onClick={() => handleVote('downvote')}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all"
                    >
                      <ChevronDown className="w-5 h-5" />
                      <span className="font-medium">{post.downvote || 0}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
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
                              navigator.clipboard.writeText(window.location.href);
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

                {/* Comments Section */}
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Comments ({comments.length})
                  </h2>

                  {/* Comment Form */}
                  {isAuthenticated ? (
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                      <div className="flex space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write a comment..."
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            disabled={isSubmittingComment}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              type="submit"
                              disabled={isSubmittingComment || !commentContent.trim()}
                              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Please login to comment</p>
                      <Link
                        to="/login"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Login to Comment
                      </Link>
                    </div>
                  )}

                  {/* Comments List */}
                  <AnimatePresence>
                    {comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <Comment
                            key={comment._id}
                            comment={comment}
                            postId={id}
                            onReply={handleReply}
                            onDelete={handleDeleteComment}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">About Author</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <Link
                    to={`/profile/${post.userid}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-primary-600"
                  >
                    {post.user?.name || 'Anonymous'}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member since 2024</p>
                </div>
              </div>
              <Link
                to={`/profile/${post.userid}`}
                className="block w-full text-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                View Profile
              </Link>
            </div>

            {/* Related Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <RelatedPosts currentPostId={id} />
            </div>

            {/* Share Card */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Share this post</h3>
              <p className="text-white/90 mb-4">Help others discover this content</p>
              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold hover:bg-white/30 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;