import api from './api';

export const userService = {
  dashboard: () =>
    api.get('/users/me/dashboard').then((r) => r.data),

  updateProfile: (payload) =>
    api.patch('/users/me', payload).then((r) => r.data),

  toggleBookmark: (eventId) =>
    api.post(`/users/me/bookmarks/${eventId}`).then((r) => r.data),

  bookmarks: () =>
    api.get('/users/me/bookmarks').then((r) => r.data),

  toggleSavedMedia: (mediaId) =>
    api.post(`/users/me/saved-media/${mediaId}`).then((r) => r.data),

  savedMedia: () =>
    api.get('/users/me/saved-media').then((r) => r.data),
};

export const notificationService = {
  mine: () =>
    api.get('/notifications/me').then((r) => r.data),

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};

export const announcementService = {
  // Get announcements
  list: (audience) =>
    api.get('/announcements', {
      params: audience ? { audience } : {},
    }).then((r) => r.data),

  // Admin creates announcement
  create: (payload) =>
    api.post('/admin/announcements', payload).then((r) => r.data),

  // Admin removes/deactivates announcement
  remove: (id) =>
    api.delete(`/admin/announcements/${id}`).then((r) => r.data),
};

export const aiService = {
  chat: (message, history) =>
    api.post('/ai/chat', {
      message,
      history,
    }).then((r) => r.data),
};

export const adminService = {
  dashboard: () =>
    api.get('/admin/dashboard').then((r) => r.data),

  users: (params) =>
    api.get('/admin/users', { params }).then((r) => r.data),

  changeRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),

  changeStatus: (id, status) =>
    api.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`).then((r) => r.data),

  pendingEvents: () =>
    api.get('/admin/events/pending').then((r) => r.data),

  setApproval: (id, decision, note) =>
    api.patch(`/admin/events/${id}/approval`, {
      decision,
      note,
    }).then((r) => r.data),
};

export const organizerService = {
  dashboard: () =>
    api.get('/organizer/dashboard').then((r) => r.data),
};

export const reportService = {
  registrations: (params) =>
    api.get('/reports/registrations', { params }).then((r) => r.data),

  attendance: (params) =>
    api.get('/reports/attendance', { params }).then((r) => r.data),

  feedback: (params) =>
    api.get('/reports/feedback', { params }).then((r) => r.data),

  certificates: (params) =>
    api.get('/reports/certificates', { params }).then((r) => r.data),
};