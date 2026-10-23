import api from './client';

export const matchingApi = {
  getRecommendations: async (radius = 25.0) => {
    const res = await api.get('/matching/recommendations/', { params: { radius } });
    return res.data;
  },
  getDonationNgoMatches: async (donationId, radius = 30.0) => {
    const res = await api.get(`/matching/donations/${donationId}/ngos/`, { params: { radius } });
    return res.data;
  },
};
