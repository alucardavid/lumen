import { API_ENDPOINTS } from "../config/api";
import { SessionSummary } from "../types/session";
import axios from 'axios';

export const useSummarys = (sessionId: number | null) => {

const createSessionSummary = async () => {
    if (!sessionId) return null;
    
    try {
      const response = await axios.post<SessionSummary>(
        API_ENDPOINTS.CHAT.SESSION.CREATE_SUMMARY(sessionId),
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating session summary:', error);
      return null;
    }
  };

  const getSessionSummary = async () => {
    if (!sessionId) return null;
    
    try {
      const response = await axios.get<SessionSummary>(
        API_ENDPOINTS.CHAT.SESSION.GET_SUMMARY(sessionId),
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching session summary:', error);
      return null;
    }
  };

  return {
    createSessionSummary,
    getSessionSummary
  }

};