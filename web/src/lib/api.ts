import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  
  verifyOTP: (email: string, otp: string) => 
    api.post('/auth/verify-otp', { email, otp }),
  
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (email: string, otp: string, password: string) => 
    api.post('/auth/reset-password', { email, otp, password }),
};

// User API
export const userApi = {
  getProfile: () => 
    api.get('/user/profile'),
  
  getUserProfile: (userId: string) => 
    api.get(`/user/profile/${userId}`),
  
  updateProfile: (data: any) => 
    api.put('/user/profile', data),
  
  updateProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  searchUsers: (query: string) => 
    api.get('/user/search', { params: { q: query } }),
  
  deactivateAccount: () => 
    api.delete('/user/deactivate'),
};

// Contact API
export const contactApi = {
  getContacts: (type?: string) => 
    api.get('/contact', { params: { type } }),
  
  sendContactRequest: (userId: string) => 
    api.post('/contact/send', { userId }),
  
  acceptContactRequest: (userId: string) => 
    api.post('/contact/accept', { userId }),
  
  rejectContactRequest: (userId: string) => 
    api.post('/contact/reject', { userId }),
  
  cancelContactRequest: (userId: string) => 
    api.post('/contact/cancel', { userId }),
  
  blockUser: (userId: string) => 
    api.post('/contact/block', { userId }),
  
  unblockUser: (userId: string) => 
    api.post('/contact/unblock', { userId }),
  
  removeContact: (userId: string) => 
    api.delete('/contact/remove', { data: { userId } }),
};

// Chat API
export const chatApi = {
  getConversations: () => 
    api.get('/chat/conversations'),
  
  getMessages: (conversationId: string, limit = 20, before?: string) => 
    api.get('/chat/messages', { 
      params: { conversationId, limit, before } 
    }),
  
  sendMessage: (conversationId: string, content: string, mediaIds?: string[]) => 
    api.post('/chat/send', { conversationId, content, mediaIds }),
  
  readMessage: (messageId: string) => 
    api.post('/chat/read', { messageId }),
  
  addReaction: (messageId: string, reaction: string) => 
    api.post('/chat/reaction', { messageId, reaction }),
  
  recallMessage: (messageId: string) => 
    api.post('/chat/recall', { messageId }),
  
  searchMessages: (query: string, conversationId?: string) => 
    api.get('/chat/search', { 
      params: { q: query, conversationId } 
    }),
  
  getMedia: (conversationId: string, type?: string) => 
    api.get('/chat/media', { 
      params: { conversationId, type } 
    }),
  
  getConversationDetail: (conversationId: string) => 
    api.get('/chat/detail', { params: { conversationId } }),
};

// Group API
export const groupApi = {
  createGroup: (name: string, members: string[]) => 
    api.post('/group/create', { name, members }),
  
  addMember: (groupId: string, userId: string) => 
    api.post('/group/add-member', { groupId, userId }),
  
  removeMember: (groupId: string, userId: string) => 
    api.post('/group/remove-member', { groupId, userId }),
  
  updateGroup: (groupId: string, data: any) => 
    api.put('/group/update', { groupId, ...data }),
};

// Media API
export const mediaApi = {
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteMedia: (mediaId: string) => 
    api.delete('/media/delete', { data: { mediaId } }),
};

// Notification API
export const notificationApi = {
  getNotifications: () => 
    api.get('/notification'),
  
  markAsRead: (notificationId: string) => 
    api.post('/notification/read', { notificationId }),
};

export default api;