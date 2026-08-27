import api from './api';

export const registrationService = {
  register: (eventId, data) => api.post(`/registrations/${eventId}`, data).then((r) => r.data),
  cancel: (id) => api.delete(`/registrations/${id}`).then((r) => r.data),
  mine: (status) => api.get('/registrations/me', { params: { status } }).then((r) => r.data),
};

export const attendanceService = {
  myQR: (registrationId) => api.get(`/attendance/qr/${registrationId}`).then((r) => r.data),
  scan: (payload) => api.post('/attendance/scan', payload).then((r) => r.data),
  mine: () => api.get('/attendance/me').then((r) => r.data),
};

export const certificateService = {
  mine: () => api.get('/certificates/me').then((r) => r.data),
  generate: (payload) => api.post('/certificates/generate', payload).then((r) => r.data),
  bulkIssue: (payload) => api.post('/certificates/bulk-issue', payload).then((r) => r.data),
};

export const feedbackService = {
  submit: (eventId, payload) => api.post(`/feedback/${eventId}`, payload).then((r) => r.data),
};
