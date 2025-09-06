import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/user/login', credentials),
  register: (userData) => api.post('/user/register', userData),
  logout: () => api.get('/user/logout'),
  forgotPassword: (email) => api.post('/user/forgotpassword/', { email }),
  resetPassword: (data) => api.post('/user/newpassword/', data),
  getNotifications: () => api.get('/user/notifications'),
  getSettings: () => api.get('/user/settings'),
  updateSettings: (settings) => api.post('/user/settings', settings),
  deleteAccount: () => api.post('/user/delete-account'),
};

// Post APIs
export const postAPI = {
  getAllPosts: () => api.get('/home/posts/'),
  getPost: (id) => api.get(`/home/posts/${id}`),
  getPostDetail: (id) => api.get(`/post/getpost/${id}`), // Backend specific endpoint
  createPost: (postData) => api.post('/post/createpost', postData),
  deletePost: (id) => api.delete(`/post/deletePost/${id}`),
  votePost: (id, vote) => api.post(`/home/post/vote/${id}`, { vote }),
  uploadImage: (formData) => api.post('/post/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Comment APIs
export const commentAPI = {
  getComments: (postId) => api.get(`/post/comments/${postId}`),
  createComment: (postId, content) => api.post(`/post/CreateComment/${postId}`, { content }),
  showComment: (commentId) => api.get(`/post/ShowComment/${commentId}`),
  replyToComment: (commentId, content) => api.post(`/comments/replytocomment/${commentId}`, { content }),
  showReplies: (commentId) => api.get(`/comments/showreplies/${commentId}`),
  voteComment: (commentId, vote) => api.post(`/comments/vote/${commentId}`, { vote }),
};

// Search API
export const searchAPI = {
  searchPosts: (keyword) => api.get(`/search/searchpost/${encodeURIComponent(keyword)}`),
  searchUsers: (username) => api.get(`/search/searchuser/${encodeURIComponent(username)}`),
};

// Profile APIs
export const profileAPI = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  getMyProfile: () => api.get('/profile/'),
  followUser: (userId) => api.post(`/profile/follow/${userId}`),
  unfollowUser: (userId) => api.post(`/profile/unfollow/${userId}`),
  getFollowers: (userId) => api.get(`/profile/followers/${userId}`),
  getFollowing: (userId) => api.get(`/profile/following/${userId}`),
};

export default api;