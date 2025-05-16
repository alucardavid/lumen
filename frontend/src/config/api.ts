export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  CHAT: {
    SESSION: {
      ACTIVE: `${API_BASE_URL}/chat/session/active`,
      START: `${API_BASE_URL}/chat/session/start`,
      END: (sessionId: number) => `${API_BASE_URL}/chat/session/${sessionId}/end`,
      MESSAGES: (sessionId: number) => `${API_BASE_URL}/chat/session/${sessionId}/messages`,
      GET_SUMMARY: (sessionId: number) => `${API_BASE_URL}/summary/sessions/${sessionId}/summary`,
      CREATE_SUMMARY: (sessionId: number) => `${API_BASE_URL}/summary/sessions/${sessionId}/summary`,
    },
    MESSAGE: `${API_BASE_URL}/chat/message`,
    HISTORY: `${API_BASE_URL}/chat/history`,
  },
  USER: {
    SESSIONS: `${API_BASE_URL}/users/sessions`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    REGISTER: `${API_BASE_URL}/users/`,
  },
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    TOKEN: `${API_BASE_URL}/auth/token`,
  },
  SESSIONS:{
    BUNDLES: `${API_BASE_URL}/session-bundles/`,
  },
  PAYMENT: {
    CREATE: `${API_BASE_URL}/payment/create`,
    WEBHOOK: `${API_BASE_URL}/payment/webhook`,
    STATUS: `${API_BASE_URL}/payment/status`,
  }
};