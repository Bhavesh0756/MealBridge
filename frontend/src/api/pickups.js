import api from './client';

export const pickupsApi = {
  getAvailablePool: async () => {
    const res = await api.get('/pickups/available_pool/');
    return res.data;
  },
  getMyPickups: async () => {
    const res = await api.get('/pickups/my_pickups/');
    return res.data;
  },
  claimPickup: async (id) => {
    const res = await api.post(`/pickups/${id}/claim/`);
    return res.data;
  },
  updateStatus: async (id, status, notes = '', failure_reason = '', recipient_signature_name = '') => {
    const res = await api.post(`/pickups/${id}/update_status/`, {
      status,
      notes,
      failure_reason,
      recipient_signature_name,
    });
    return res.data;
  },
};
