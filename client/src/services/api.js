import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.29.242:5000/api';

console.log('[API] Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API] Token attached to request:', config.url);
  } else {
    console.warn('[API] No token found in localStorage for:', config.url);
  }
  return config;
});

// Intercept responses — propagate usage data and 429 limit errors
api.interceptors.response.use(
  (response) => {
    // Forward remaining usage count to any listener
    if (response.data?.remaining !== undefined) {
      window.dispatchEvent(
        new CustomEvent('mentixo:usage-update', { detail: { remaining: response.data.remaining } })
      );
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - Token may be invalid or expired');
      console.error('[API] Token in storage:', localStorage.getItem('token') ? 'YES' : 'NO');
    }
    if (error.response?.status === 429 && error.response?.data?.upgrade === true) {
      window.dispatchEvent(new CustomEvent('mentixo:limit-exceeded'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const chatService = {
  sendMessage: (prompt, chatId = null) => api.post('/chat', { prompt, chatId }),
  getHistory: () => api.get('/chat/history'),
};

export const notesService = {
  generateNotes: (topic) => api.post('/notes', { topic }),
  getHistory: () => api.get('/notes/history'),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
};

export const quizService = {
  generateQuiz: (topic, difficulty) => api.post('/quiz', { topic, difficulty }),
  submitQuiz: (quizId, answers) => api.post(`/quiz/${quizId}/submit`, { answers }),
  getHistory: () => api.get('/quiz/history'),
};

export const uploadService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
