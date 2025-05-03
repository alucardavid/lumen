import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiError, ChatSession, Message } from '../types/chat';
import { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { ActiveSession } from '../types/session';

export const useChatSession = () => {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [sessionEnding, setSessionEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const startSession = async () => {
    try {
      setLoading(true);
      const response = await axios.post<ActiveSession>(API_ENDPOINTS.CHAT.SESSION.START);
      setActiveSession(response.data);
      navigate('/chat');
    } catch (err) {
      const error = err as { response?: { data?: ApiError } };
      setError(error.response?.data?.detail || 'Erro ao iniciar sessão');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId: number) => {
    try {
      setError(null);
      
      let sessionEnded = await axios.post(
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

  return {
    activeSession,
    sessionEnding,
    error,
    loading,
    fetchActiveSession,
    startSession,
    endSession,
    setError,
    setActiveSession
  };
};


