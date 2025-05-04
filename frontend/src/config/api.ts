export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
  }
};