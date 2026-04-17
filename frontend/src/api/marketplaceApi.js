/** api/marketplaceApi.js */
import api from './axiosConfig.js';

export const marketplaceApi = {
  getAll:     (params)   => api.get('/marketplace',        { params }),
  getById:    (id)       => api.get(`/marketplace/${id}`),
  create:     (formData) => api.post('/marketplace',       formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:     (id)       => api.delete(`/marketplace/${id}`),
  markAsSold: (id)       => api.patch(`/marketplace/${id}/sold`),
};
