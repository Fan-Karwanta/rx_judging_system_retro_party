import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Events API
export const eventsApi = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  toggleLive: (id) => api.put(`/events/${id}/toggle-live`),
  toggleRankings: (id) => api.put(`/events/${id}/toggle-rankings`),
  setRevealTop: (id, revealTop) => api.put(`/events/${id}/reveal-top`, { revealTop }),
  seed: () => api.post('/events/seed')
};

// Contestants API
export const contestantsApi = {
  getAll: (eventId) => api.get('/contestants', { params: { event: eventId } }),
  getByEvent: (eventId) => api.get(`/contestants/event/${eventId}`),
  getById: (id) => api.get(`/contestants/${id}`),
  create: (data) => api.post('/contestants', data),
  update: (id, data) => api.put(`/contestants/${id}`, data),
  delete: (id) => api.delete(`/contestants/${id}`),
  seed: (eventId, type) => api.post(`/contestants/seed/${eventId}`, { type })
};

// Scores API
export const scoresApi = {
  getAll: (filters) => api.get('/scores', { params: filters }),
  getRankings: (eventId) => api.get(`/scores/event/${eventId}/rankings`),
  getByContestant: (contestantId) => api.get(`/scores/contestant/${contestantId}`),
  submit: (data) => api.post('/scores', data),
  delete: (id) => api.delete(`/scores/${id}`),
  clearEvent: (eventId) => api.delete(`/scores/event/${eventId}`)
};

export default api;
