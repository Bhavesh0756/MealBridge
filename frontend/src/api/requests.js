import api from './client';

export const requestsApi = {
  getRequests: async (params = {}) => {
    const res = await api.get('/requests/', { params });
    return res.data;
  },
  createRequest: async (data) => {
    const res = await api.post('/requests/', data);
    return res.data;
  },
  acceptRequest: async (id, donor_notes = '') => {
    const res = await api.post(`/requests/${id}/accept/`, { donor_notes });
    return res.data;
  },
  rejectRequest: async (id, rejection_reason = '', donor_notes = '') => {
    const res = await api.post(`/requests/${id}/reject/`, { rejection_reason, donor_notes });
    return res.data;
  },
  cancelRequest: async (id) => {
    const res = await api.post(`/requests/${id}/cancel/`);
    return res.data;
  },
};
