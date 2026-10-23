import api from './client';

export const donationsApi = {
  getCategories: async () => {
    const res = await api.get('/donations/categories/');
    return res.data;
  },
  getListings: async (params = {}) => {
    const res = await api.get('/donations/listings/', { params });
    return res.data;
  },
  getMyDonations: async () => {
    const res = await api.get('/donations/listings/my_donations/');
    return res.data;
  },
  getDetail: async (id) => {
    const res = await api.get(`/donations/listings/${id}/`);
    return res.data;
  },
  createDonation: async (formData) => {
    const res = await api.post('/donations/listings/', formData);
    return res.data;
  },
  cancelDonation: async (id, reason) => {
    const res = await api.post(`/donations/listings/${id}/cancel/`, { reason });
    return res.data;
  },
  moderateListing: async (id, action, reason) => {
    const res = await api.post(`/donations/listings/${id}/moderate/`, { action, reason });
    return res.data;
  },
};
