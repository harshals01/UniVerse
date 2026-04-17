/** api/lostFoundApi.js */
import api from './axiosConfig.js';

export const lostFoundApi = {
  getAll:    (params)    => api.get('/lostfound',        { params }),
  getById:   (id)        => api.get(`/lostfound/${id}`),
  create:    (formData)  => api.post('/lostfound',       formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, data)  => api.put(`/lostfound/${id}`,  data,     { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:    (id)        => api.delete(`/lostfound/${id}`),
  claim:     (id)        => api.patch(`/lostfound/${id}/claim`),
};
