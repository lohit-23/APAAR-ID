/**
 * ShikshaSetu AI - Frontend API Service
 * Interacts with FastAPI REST endpoints
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth & Roles
  getRoles: () => request('/auth/roles'),
  login: (roleOrEmail) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(typeof roleOrEmail === 'object' ? roleOrEmail : { role: roleOrEmail }),
  }),
  getMe: (role) => request(`/auth/me?role=${role || 'student'}`),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? `?${query}` : ''}`);
  },
  getStudentDetail: (id) => request(`/students/${id}`),
  getStudentAiInsights: (id) => request(`/students/${id}/ai-insights`),
  getStudentRecords: (id) => request(`/students/${id}/records`),
  getStudentTimeline: (id) => request(`/students/${id}/timeline`),

  // Credentials
  getCredentials: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/credentials${query ? `?${query}` : ''}`);
  },
  getCredential: (id) => request(`/credentials/${id}`),
  issueCredential: (payload) => request('/credentials/issue', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  toggleTamper: (id) => request(`/credentials/${id}/tamper`, {
    method: 'POST',
  }),

  // Consent
  getConsentRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/consent/requests${query ? `?${query}` : ''}`);
  },
  updateConsentStatus: (id, payload) => request(`/consent/requests/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  createShareLink: (payload) => request('/consent/create-share-link', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Verification
  verifyCredential: (payload) => request('/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getVerificationLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/verify/logs${query ? `?${query}` : ''}`);
  },

  // Institutions
  getInstitutions: () => request('/institutions'),
  getInstitution: (id) => request(`/institutions/${id}`),
  getInstitutionStudents: (id, search = '') => {
    return request(`/institutions/${id}/students${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  },
  getDataQuality: (id) => request(`/institutions/${id}/data-quality`),
  bulkUploadCsv: async (institutionId, csvText) => {
    const formData = new FormData();
    formData.append('csv_text', csvText);
    const res = await fetch(`${API_BASE}/institutions/${institutionId}/bulk-upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // Anomalies
  getAnomalies: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/anomalies${query ? `?${query}` : ''}`);
  },
  updateAnomalyStatus: (id, status) => request(`/anomalies/${id}/status?new_status=${status}`, {
    method: 'POST',
  }),

  // Super Admin
  getAdminAnalytics: () => request('/admin/analytics'),
  getSystemHealth: () => request('/admin/system-health'),
  toggleInstitutionStatus: (id) => request(`/admin/institutions/${id}/toggle-status`, {
    method: 'POST',
  }),
  getUsers: () => request('/admin/users'),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit/logs${query ? `?${query}` : ''}`);
  },

  // Notifications
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications${query ? `?${query}` : ''}`);
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, {
    method: 'POST',
  }),
  markAllNotificationsRead: (userId) => request(`/notifications/mark-all-read${userId ? `?user_id=${userId}` : ''}`, {
    method: 'POST',
  }),

  // Demo Reset
  resetDemo: () => request('/demo/reset', { method: 'POST' }),
};
