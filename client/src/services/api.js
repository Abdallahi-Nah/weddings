import axios from 'axios';

const API_BASE = 'https://weddings-tau.vercel.app'; // Production API server

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('weddingToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 -> logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('weddingToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const login = (phone, password) => api.post('/auth/login', { phone, password });
export const changePassword = (data) => api.post('/auth/change-password', data);
export const getMe = () => api.get('/auth/me');

// Events
export const getEvents = () => api.get('/events');
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const toggleEventStatus = (id) => api.patch(`/events/${id}/status`);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Contributions
export const getContributions = (eventId) => api.get(`/events/${eventId}/contributions`);
export const createContribution = (eventId, data) => api.post(`/events/${eventId}/contributions`, data);
export const updateContribution = (eventId, id, data) => api.put(`/events/${eventId}/contributions/${id}`, data);
export const deleteContribution = (eventId, id) => api.delete(`/events/${eventId}/contributions/${id}`);

// Expenses
export const getExpenses = (eventId) => api.get(`/events/${eventId}/expenses`);
export const createExpense = (eventId, data) => api.post(`/events/${eventId}/expenses`, data);
export const updateExpense = (eventId, id, data) => api.put(`/events/${eventId}/expenses/${id}`, data);
export const deleteExpense = (eventId, id) => api.delete(`/events/${eventId}/expenses/${id}`);

// Friends
export const getFriends = () => api.get('/friends');
export const createFriend = (name) => api.post('/friends', { name });
export const deleteFriend = (id) => api.delete(`/friends/${id}`);

// Reports
export const getReport = (eventId) => api.get(`/events/${eventId}/report`);
export const getPdfUrl = (eventId, lang) => `${API_BASE}/events/${eventId}/report/pdf?lang=${lang}`;
