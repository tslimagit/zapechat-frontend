import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
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
  disconnect: () => api.post('/auth/disconnect'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  register: (data) => api.post('/auth/register', data),
  listUsers: (params = {}) => api.get('/auth/users', { params }),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updateAvatar: (data) => api.put('/profile/avatar', data),
  changePassword: (data) => api.put('/profile/password', data),
};

export const groupCampaignsApi = {
  list: () => api.get('/group-campaigns'),
  get: (id) => api.get(`/group-campaigns/${id}`),
  create: (data) => api.post('/group-campaigns', data),
  update: (id, data) => api.put(`/group-campaigns/${id}`, data),
  delete: (id) => api.delete(`/group-campaigns/${id}`),
  addGroups: (id, groups) => api.post(`/group-campaigns/${id}/groups`, { groups }),
  removeGroup: (id, groupId) => api.delete(`/group-campaigns/${id}/groups/${groupId}`),
  updateMembers: (id) => api.post(`/group-campaigns/${id}/update-members`),
  massSend: (id, data) => api.post(`/group-campaigns/${id}/mass-send`, data),
  stats: (id) => api.get(`/group-campaigns/${id}/stats`),
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
  list: () => api.get('/campaigns'),
  create: (data) => api.post('/campaigns', data),
  start: (id, data) => api.post(`/campaigns/${id}/start`, data),
  pause: (id) => api.post(`/campaigns/${id}/pause`),
  cancel: (id) => api.post(`/campaigns/${id}/cancel`),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  get: (id) => api.get(`/campaigns/${id}`),
  delete: (id) => api.delete(`/campaigns/${id}`),
};

export const groupsApi = {
  sync: () => api.get('/groups/sync'),
  list: () => api.get('/groups'),
  create: (data) => api.post('/groups/create', data),
  createMultiple: (data) => api.post('/groups/create-multiple', data),
  info: (jid) => api.get(`/groups/${jid}/info`),
  members: (jid) => api.get(`/groups/${jid}/members`),
  send: (jid, text, options = {}) => api.post(`/groups/${jid}/send`, { text, ...options }),
  sendMedia: (jid, data) => api.post(`/groups/${jid}/send-media`, data),
  sendPoll: (jid, data) => api.post(`/groups/${jid}/send-poll`, data),
  sendContact: (jid, data) => api.post(`/groups/${jid}/send-contact`, data),
  massSend: (data) => api.post('/groups/mass-send', data),
  updateSubject: (jid, subject) => api.put(`/groups/${jid}/subject`, { subject }),
  updateDescription: (jid, description) => api.put(`/groups/${jid}/description`, { description }),
  updatePicture: (jid, image) => api.put(`/groups/${jid}/picture`, { image }),
  updateParticipants: (jid, action, participants) => api.post(`/groups/${jid}/participants`, { action, participants }),
  updateSettings: (jid, action) => api.put(`/groups/${jid}/settings`, { action }),
  inviteCode: (jid) => api.get(`/groups/${jid}/invite-code`),
  leave: (jid) => api.delete(`/groups/${jid}/leave`),
};

export const instanceApi = {
  getSettings: () => api.get('/instance/settings'),
  updateSettings: (data) => api.put('/instance/settings', data),
  getWebhook: () => api.get('/instance/webhook'),
  updateWebhook: (data) => api.put('/instance/webhook', data),
};

export const groupEventsApi = {
  list: (params = {}) => api.get('/group-events', { params }),
  groups: () => api.get('/group-events/groups'),
  export: (params = {}) => api.get('/group-events/export', { params }),
  clear: () => api.delete('/group-events'),
  getWebhookConfig: () => api.get('/group-events/webhook-config'),
  saveWebhookConfig: (data) => api.put('/group-events/webhook-config', data),
};

export const contactsApi = {
  list: (params = {}) => api.get('/contacts', { params }),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  importCsv: (file, tags) => {
    const fd = new FormData();
    fd.append('file', file);
    if (tags) fd.append('tags', tags);
    return api.post('/contacts/import-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  byTag: (tag) => api.get(`/contacts/by-tag/${tag}`),
  bulkTag: (data) => api.post('/contacts/bulk-tag', data),
  bulkRemoveTag: (data) => api.post('/contacts/bulk-remove-tag', data),
  tags: () => api.get('/contacts/tags'),
  createTag: (data) => api.post('/contacts/tags', data),
  deleteTag: (name) => api.delete(`/contacts/tags/${name}`),
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

export const automationsApi = {
  list: () => api.get('/automations'),
  create: (data) => api.post('/automations', data),
  update: (id, data) => api.put(`/automations/${id}`, data),
  delete: (id) => api.delete(`/automations/${id}`),
  logs: (params = {}) => api.get('/automations/logs', { params }),
  getMessages: (id) => api.get(`/automations/${id}/messages`),
  saveMessages: (id, messages) => api.post(`/automations/${id}/messages`, { messages }),
  getQueue: (id) => api.get(`/automations/${id}/queue`),
  resend: (logId) => api.post(`/automations/logs/${logId}/resend`),
  lastPayload: (id) => api.get(`/automations/${id}/last-payload`),
};

// ==========================================
// ADICIONAR NO api.js - após automationsApi:
// ==========================================

export const aiAssistantsApi = {
  list: () => api.get('/ai-assistants'),
  create: (data) => api.post('/ai-assistants', data),
  update: (id, data) => api.put(`/ai-assistants/${id}`, data),
  delete: (id) => api.delete(`/ai-assistants/${id}`),
  toggle: (id) => api.post(`/ai-assistants/${id}/toggle`),
  conversations: (id) => api.get(`/ai-assistants/${id}/conversations`),
  clearConversations: (id) => api.delete(`/ai-assistants/${id}/conversations`),
};

// ==========================================
// ADICIONAR NO api.js - após aiAssistantsApi:
// ==========================================
 
export const apiKeysApi = {
  list: () => api.get('/api-keys'),
  create: (data) => api.post('/api-keys', data),
  update: (id, data) => api.put(`/api-keys/${id}`, data),
  delete: (id) => api.delete(`/api-keys/${id}`),
};

export const trainingSourcesApi = {
  extractPdf: (data) => api.post('/training-sources/pdf', data),
  extractUrl: (data) => api.post('/training-sources/url', data),
  extractYoutube: (data) => api.post('/training-sources/youtube', data),
};

export const uploadApi = {
  upload: (data) => api.post('/upload', data),
};

export default api;
