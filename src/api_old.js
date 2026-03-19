import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zapechat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zapechat_token');
      localStorage.removeItem('zapechat_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  me: () => api.get('/auth/me'),
  qrcode: () => api.get('/auth/qrcode'),
  connectionStatus: () => api.get('/auth/connection-status'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  register: (data) => api.post('/auth/register', data),
  listUsers: (params = {}) => api.get('/auth/users', { params }),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  disconnect: () => api.post('/auth/disconnect'),
};

export const messagesApi = {
  sendText: (number, text, options = {}) => api.post('/messages/send-text', { number, text, ...options }),
  sendMedia: (data) => api.post('/messages/send-media', data),
  sendAudio: (data) => api.post('/messages/send-audio', data),
  sendGroup: (groupJid, text, options = {}) => api.post('/messages/send-group', { groupJid, text, ...options }),
  checkWhatsApp: (numbers) => api.post('/messages/check-whatsapp', { numbers }),
  history: (params = {}) => api.get('/messages/history', { params }),
};

export const campaignsApi = {
  create: (data) => api.post('/campaigns', data),
  start: (id) => api.post(`/campaigns/${id}/start`),
  pause: (id) => api.post(`/campaigns/${id}/pause`),
  list: (params = {}) => api.get('/campaigns', { params }),
  get: (id) => api.get(`/campaigns/${id}`),
  delete: (id) => api.delete(`/campaigns/${id}`),
};

export const groupsApi = {
  sync: () => api.get('/groups/sync'),
  list: () => api.get('/groups'),
  members: (jid) => api.get(`/groups/${jid}/members`),
  send: (jid, text, options = {}) => api.post(`/groups/${jid}/send`, { text, ...options }),
  inviteCode: (jid) => api.get(`/groups/${jid}/invite-code`),
};

export const contactsApi = {
  list: (params = {}) => api.get('/contacts', { params }),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  importCsv: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/contacts/import-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard'),
  messagesByPeriod: (period = 'week') => api.get('/reports/messages-by-period', { params: { period } }),
  topGroups: () => api.get('/reports/top-groups'),
  campaignStats: () => api.get('/reports/campaign-stats'),
  exportExcel: (params = {}) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params = {}) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
};

export const instancesApi = {
  list: () => api.get('/instances'),
  create: (instanceName) => api.post('/instances', { instanceName }),
  connect: (name) => api.get(`/instances/connect/${name}`),
  status: (name) => api.get(`/instances/status/${name}`),
  delete: (name) => api.delete(`/instances/${name}`),
  setWebhook: (name, webhookUrl) => api.post(`/instances/${name}/webhook`, { webhookUrl }),
};

export default api;
