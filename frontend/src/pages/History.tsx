import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ChatSession {
  id: number;
  started_at: string;
  ended_at: string;
  sentiment_score: string;
  risk_level: string;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: number;
  content: string;
  is_user: boolean;
  timestamp: string;
  sentiment: string;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get<{sessions: ChatSession[]}>('http://localhost:8000/api/chat/history');
        setSessions(response.data.sessions);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
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

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Histórico de Sessões</h2>
        <p className="mt-1 text-sm text-gray-500">
          Veja suas conversas anteriores e análises de sentimentos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Sessões</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <li
                    key={session.id}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedSession?.id === session.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(session.started_at)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.messages.length} mensagens
                        </p>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(
                          session.risk_level
                        )}`}
                      >
                        {session.risk_level}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes da Sessão
                  </h3>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(
                      selectedSession.risk_level
                    )}`}
                  >
                    {selectedSession.risk_level}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Início: {formatDate(selectedSession.started_at)}
                </p>
                <p className="text-sm text-gray-500">
                  Fim: {formatDate(selectedSession.ended_at)}
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    {selectedSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.is_user ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            message.is_user
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                          {message.sentiment && !message.is_user && (
                            <p className="text-xs mt-1">
                              Sentimento: {message.sentiment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">Selecione uma sessão para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History; 