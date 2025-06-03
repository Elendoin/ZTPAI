import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  getStatus: async () => {
    try {
      const response = await api.get('/auth/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Status check failed' };
    }  },
};

export const userAPI = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user' };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },
};

export const suggestionAPI = {
  createSuggestion: async (formData) => {
    try {
      const response = await axios.post('/api/suggestions', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create suggestion' };
    }
  },

  getAllSuggestions: async () => {
    try {
      const response = await api.get('/suggestions');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch suggestions' };
    }
  },
  likeSuggestion: async (suggestionId) => {
    try {
      const response = await api.post(`/suggestions/${suggestionId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to like suggestion' };
    }
  },

  deleteSuggestion: async (suggestionId) => {
    try {
      const response = await api.delete(`/suggestions/${suggestionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete suggestion' };
    }
  },
};

export default api;
