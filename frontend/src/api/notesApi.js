/**
 * api/notesApi.js
 * All HTTP calls for the Notes + AI module.
 * Components call these functions — never axios directly.
 */

import api from './axiosConfig.js';

export const notesApi = {
  // CRUD
  getAll:       (params) => api.get('/notes',         { params }),
  getById:      (id)     => api.get(`/notes/${id}`),
  getPublic:    (params) => api.get('/notes/public',  { params }),
  create:       (data)   => api.post('/notes',          data),
  update:       (id, data) => api.put(`/notes/${id}`,   data),
  delete:       (id)     => api.delete(`/notes/${id}`),

  // AI
  generateAI: (id, prompt, mode = 'notes') =>
    api.post(`/notes/${id}/ai`, { prompt, mode }),
};
