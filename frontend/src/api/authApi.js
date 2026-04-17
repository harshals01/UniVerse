/**
 * api/authApi.js — Auth HTTP calls
 */
import api from './axiosConfig.js';

export const authApi = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login',    data),
  getMe:    ()      => api.get('/auth/me'),
  updateMe: (data)  => api.put('/auth/me',        data),
};
