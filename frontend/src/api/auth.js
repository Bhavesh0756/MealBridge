import api from './client';

export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },
  updateProfile: async (payload) => {
    const res = await api.patch('/auth/me/', payload);
    return res.data;
  },
  getAdminUsers: async () => {
    const res = await api.get('/auth/admin/users/');
    return res.data;
  },
  verifyUser: async (userId, action, notes) => {
    const res = await api.post(`/auth/admin/users/${userId}/verify/`, { action, notes });
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get('/auth/admin/audit-logs/');
    return res.data;
  },
};
