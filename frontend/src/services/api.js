import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('homecare_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    if (res.data.token) {
      localStorage.setItem('homecare_token', res.data.token);
      localStorage.setItem('homecare_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    if (res.data.token) {
      localStorage.setItem('homecare_token', res.data.token);
      localStorage.setItem('homecare_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('homecare_token');
    localStorage.removeItem('homecare_user');
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/user/');
    return res.data;
  }
};

export const applianceService = {
  getAll: async (params = {}) => {
    const res = await api.get('/appliances/', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/appliances/${id}/`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/appliances/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/appliances/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/appliances/${id}/`);
    return res.data;
  }
};

export const documentService = {
  getAll: async (params = {}) => {
    const res = await api.get('/documents/', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/documents/', data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/documents/${id}/`);
    return res.data;
  },
  processOCR: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/process_ocr/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

export const warrantyService = {
  getAll: async (params = {}) => {
    const res = await api.get('/warranties/', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/warranties/', data);
    return res.data;
  }
};

export const scheduleService = {
  getAll: async (params = {}) => {
    const res = await api.get('/schedules/', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/schedules/', data);
    return res.data;
  },
  markCompleted: async (id) => {
    const res = await api.post(`/schedules/${id}/mark_completed/`);
    return res.data;
  }
};

export const serviceRequestService = {
  getAll: async (params = {}) => {
    const res = await api.get('/service-requests/', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/service-requests/', data);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/service-requests/${id}/`, { status });
    return res.data;
  }
};

export const serviceHistoryService = {
  getAll: async (params = {}) => {
    const res = await api.get('/service-history/', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/service-history/', data);
    return res.data;
  }
};

export const reminderService = {
  getAll: async () => {
    const res = await api.get('/reminders/');
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.post(`/reminders/${id}/mark_read/`);
    return res.data;
  },
  triggerEmailReminders: async () => {
    const res = await api.post('/reminders/trigger-emails/');
    return res.data;
  },
  sendTestEmailAlert: async () => {
    const res = await api.post('/reminders/send-test-email/');
    return res.data;
  }
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats/');
    return res.data;
  },
  globalSearch: async (query) => {
    const res = await api.get('/search/', { params: { q: query } });
    return res.data;
  }
};

export default api;
