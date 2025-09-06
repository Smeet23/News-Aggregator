import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  Hash,
  Image,
  Bold,
  Italic,
  List,
  Link2,
  Quote,
  Code,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { postAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Character counter component
const CharacterCounter = ({ current, max }) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="relative w-8 h-8">
        <svg className="transform -rotate-90 w-8 h-8">
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-300 dark:text-gray-700"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - Math.min(percentage, 100) / 100)}`}
            className={`transition-all duration-300 ${
              isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-green-500'
            }`}
          />
        </svg>
      </div>
      <span className={`font-medium ${
        isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400'
      }`}>
        {current}/{max}
      </span>
    </div>
  );
};

// Writing tips component
const WritingTips = () => {
  const tips = [
    { icon: Sparkles, text: "Use a catchy title to grab attention" },
    { icon: TrendingUp, text: "Include relevant keywords for better visibility" },
    { icon: Users, text: "Write for your audience, keep it engaging" },
    { icon: Calendar, text: "Stay current with trending topics" }
  ];

  return (
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Writing Tips</h3>
      <div className="space-y-3">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Preview component
const PostPreview = ({ title, content, link, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Post Preview</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title || 'Untitled Post'}
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {content || 'No content yet...'}
            </p>
          </div>
          
          {link && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                {link}
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main CreatePost Component
const CreatePost = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  
  const MAX_TITLE_LENGTH = 200;
  const MAX_CONTENT_LENGTH = 5000;
  const MIN_CONTENT_LENGTH = 50;

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.content) {
        localStorage.setItem('postDraft', JSON.stringify(formData));
        setAutoSaveStatus('Draft saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('postDraft');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      setFormData(parsedDraft);
      toast.success('Draft restored');
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to create a post');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < MIN_CONTENT_LENGTH) {
      newErrors.content = `Content must be at least ${MIN_CONTENT_LENGTH} characters`;
    } else if (formData.content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Content must be less than ${MAX_CONTENT_LENGTH} characters`;
    }

    if (formData.link && !isValidUrl(formData.link)) {
      newErrors.link = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await postAPI.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        link: formData.link.trim() || undefined
      });

      if (response.data.success) {
        // Clear draft
        localStorage.removeItem('postDraft');
        
        toast.success('Post created successfully!');
        
        // Redirect to home or post detail
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this post? All changes will be lost.')) {
      localStorage.removeItem('postDraft');
      navigate('/');
    }
  };

  const insertFormatting = (type) => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newText = '';

    switch(type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'quote':
        newText = `> ${selectedText || 'quote'}`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'list item'}`;
        break;
      default:
        return;
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
          </div>
          
          {autoSaveStatus && (
            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>{autoSaveStatus}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              {/* Title Field */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Title *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter an engaging title..."
                    className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                      errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-3 top-3">
                    <CharacterCounter current={formData.title.length} max={MAX_TITLE_LENGTH} />
                  </div>
                </div>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Content Field */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                
                {/* Formatting Toolbar */}
                <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-t-lg border border-b-0 border-gray-300 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => insertFormatting('bold')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('italic')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('list')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('quote')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('code')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="relative">
                  <textarea
                    id="content-textarea"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Share your thoughts, ideas, or stories..."
                    rows="12"
                    className={`w-full px-4 py-3 border rounded-b-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-all ${
                      errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-3 right-3">
                    <CharacterCounter current={formData.content.length} max={MAX_CONTENT_LENGTH} />
                  </div>
                </div>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.content}
                  </p>
                )}
              </div>

              {/* Link Field */}
              <div className="mb-8">
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference Link (Optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                      errors.link ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.link && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.link}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                    disabled={isSubmitting}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Discard
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Publish Post
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Publishing as</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Writing Tips */}
            <WritingTips />

            {/* Guidelines */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Be respectful and constructive
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Verify facts before posting
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  No spam or promotional content
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Give credit to original sources
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Keep content appropriate for all audiences
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PostPreview
        title={formData.title}
        content={formData.content}
        link={formData.link}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default CreatePost;