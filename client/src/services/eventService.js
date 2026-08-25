import api from './api';

export const eventService = {
  list: (params) => api.get('/events', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/events/${slug}`).then((r) => r.data),
  create: (payload) => api.post('/events', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/events/${id}`, payload).then((r) => r.data),
  uploadMedia: (id, formData) =>
    api.post(`/events/${id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id) => api.delete(`/events/${id}`).then((r) => r.data),
  cancel: (id) => api.patch(`/events/${id}/cancel`).then((r) => r.data),
  registrations: (eventId, params) => api.get(`/events/${eventId}/registrations`, { params }).then((r) => r.data),
  attendance: (eventId) => api.get(`/events/${eventId}/attendance`).then((r) => r.data),
  feedback: (eventId) => api.get(`/events/${eventId}/feedback`).then((r) => r.data),
};

export const lookupService = {
  departments: () => api.get('/lookup/departments').then((r) => r.data),
  categories: () => api.get('/lookup/categories').then((r) => r.data),
};
