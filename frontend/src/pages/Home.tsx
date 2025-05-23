import React, { useState, useEffect, act } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useChatSession } from '../hooks/useChatSession';
import { ActiveSession, AvailableSessions } from '../types/session';
import { useSummarys } from '../hooks/useSummarys';
import { useAuthVerification } from '../hooks/useAuthVerification';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | JSX.Element | null>(null);
  const { startSession, endSession  } = useChatSession();
  const [userSessions, setUserSessions] = useState<{
    available_sessions: number;
    used_sessions: number;
  } | null>(null); 
  const { createSessionSummary } = useSummarys(activeSession?.id || null);
  const user = useAuthVerification();

  const checkActiveSession = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ActiveSession>(
        API_ENDPOINTS.CHAT.SESSION.ACTIVE,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setActiveSession(response.data);
      handleSessionOver();
      setError(null);
    } catch (err) {
      const error = err as { response?: { status: number; data?: { detail: string } } };
      if (error.response?.status === 404) {
        setActiveSession(null);
      } else {
        setError(error.response?.data?.detail || 'Erro ao verificar sessão ativa');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUserSessions = async () => {
    try {
      const response = await axios.get<AvailableSessions>(
        API_ENDPOINTS.USER.SESSIONS,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUserSessions(response.data);
      if (response.data.available_sessions <= response.data.used_sessions) {
        setError(<span>
                Você atingiu o limite de sessões disponíveis.{' '}
                <a href="/buy-sessions" className="text-blue-600 hover:text-blue-800 underline">
                  Clique aqui para adquirir mais sessões
                </a>
              </span>);
      }
    } catch (err) {
      console.error('Error fetching user sessions:', err);
    }
  };

  const handleStartSession = async () => {
    if (!userSessions || userSessions.available_sessions <= userSessions.used_sessions) {
      setError(<span>
                Você atingiu o limite de sessões disponíveis.{' '}
                <a href="/buy-sessions" className="text-blue-600 hover:text-blue-800 underline">
                  Clique aqui para adquirir mais sessões
                </a>
              </span>);
      return;
    }
    
    try {
      await startSession();
      await checkActiveSession();
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  const handleEndSession = async (sessionId: number) => {
    try {
      await endSession(sessionId);
      await checkActiveSession(); // Refresh active session after ending
    } catch (err) {
      console.error('Error ending session:', err);
    }
  }

  const handleSessionOver = async () => {
    if (activeSession?.started_at) {
      const sessionStartTime = new Date(activeSession.started_at);
      const currentTime = new Date();
      const sessionDuration = (currentTime.getTime() - sessionStartTime.getTime()) / (1000 * 60); // Duration in minutes

      console.log('Session Duration:', sessionDuration, 'minutes');

      if (sessionDuration >= 20) {
        await handleEndSession(activeSession.id);
        await createSessionSummary(); // Create summary after ending session
        setActiveSession(null);
        setError('Sua sessão foi encerrada após 30 minutos de inatividade.');
      }
    }
  }

  useEffect(() => {
    Promise.all([checkActiveSession(), checkUserSessions()]);
    window.scrollTo(0, 0);

    const interval = setInterval(() => {
      checkActiveSession();
    }, 60000); // 30 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 pt-5">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Eudaimonia
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Seu assistente virtual para apoio emocional
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Iniciar Nova Sessão</h2>
            <p className="text-gray-600 mb-6">
              Comece uma nova conversa com o Eudaimonia. Estamos aqui para te ouvir e ajudar.
            </p>
            {userSessions && (
            <p className="text-sm text-gray-500 mb-4">
              Sessões disponíveis: {Math.max(0, userSessions.available_sessions - userSessions.used_sessions)}
            </p>
            )}
            <button
              onClick={handleStartSession}
              disabled={!userSessions || userSessions.available_sessions <= userSessions.used_sessions}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Iniciar Sessão
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sessão Ativa</h2>
            {activeSession ? (
              <>
                <p className="text-gray-600 mb-2">
                  Sessão iniciada em: {formatDate(activeSession.started_at)}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Continuar Conversa
                  </button>
                  <button
                    onClick={() => handleEndSession(activeSession.id)}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Finalizar Sessão
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-600">
                Nenhuma sessão ativa no momento.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/history')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver Histórico de Sessões →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;