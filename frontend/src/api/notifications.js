import api from './client';

export const notificationsApi = {
  getNotifications: async () => {
    const res = await api.get('/notifications/');
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread_count/');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.post(`/notifications/${id}/mark_as_read/`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.post('/notifications/mark_all_read/');
    return res.data;
  },
};
