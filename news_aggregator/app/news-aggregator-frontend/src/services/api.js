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
  logout: () => api.post('/user/logout'),
  forgotPassword: (email) => api.post('/user/forgotpassword', { email }),
  resetPassword: (data) => api.post('/user/resetpassword', data),
  getCurrentUser: () => api.get('/user/profile'),
};

// Post APIs
export const postAPI = {
  getAllPosts: () => api.get('/home/posts'),
  getPost: (id) => api.get(`/home/posts/${id}`),
  createPost: (postData) => api.post('/post/create', postData),
  updatePost: (id, postData) => api.put(`/post/update/${id}`, postData),
  deletePost: (id) => api.delete(`/post/delete/${id}`),
  votePost: (id, vote) => api.post(`/home/post/vote/${id}`, { vote }),
  uploadImage: (formData) => api.post('/post/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Comment APIs
export const commentAPI = {
  getComments: (postId) => api.get(`/comments/${postId}`),
  createComment: (postId, content) => api.post(`/comments/create/${postId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/delete/${commentId}`),
};

// Search API
export const searchAPI = {
  searchPosts: (keyword) => api.get(`/search/posts`, { params: { keyword } }),
  searchUsers: (keyword) => api.get(`/search/users`, { params: { keyword } }),
};

// Profile APIs
export const profileAPI = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  getMyProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile/update', profileData),
  followUser: (userId) => api.post(`/profile/follow/${userId}`),
  unfollowUser: (userId) => api.post(`/profile/unfollow/${userId}`),
  getFollowers: (userId) => api.get(`/profile/followers/${userId}`),
  getFollowing: (userId) => api.get(`/profile/following/${userId}`),
};

export default api;