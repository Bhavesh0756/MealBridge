import api from './client';

export const analyticsApi = {
  getDashboard: async () => {
    const res = await api.get('/analytics/dashboard/');
    return res.data;
  },
};
