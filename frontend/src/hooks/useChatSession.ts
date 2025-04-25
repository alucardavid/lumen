import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChatSession, Message } from '../types/chat';
import { API_ENDPOINTS } from '../config/api';

export const useChatSession = () => {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [sessionEnding, setSessionEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSession = async () => {
    try {
      const response = await axios.get<ChatSession>(API_ENDPOINTS.CHAT.SESSION.ACTIVE, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setActiveSession(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active session:', error);
      return null;
    }
  };

  const endSession = async (sessionId: number) => {
    try {
      setSessionEnding(true);
      setError(null);
      
      let teste = await axios.post(
        API_ENDPOINTS.CHAT.SESSION.END(sessionId),
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setError('Sessão finalizada com sucesso!');
      setActiveSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        setError(axiosError.response?.data?.detail || 'Erro ao finalizar sessão');
      } else {
        setError('Erro ao final finalizar sessão');
      }
    } finally {
      setSessionEnding(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  return {
    activeSession,
    sessionEnding,
    error,
    fetchActiveSession,
    endSession,
    setError
  };
};