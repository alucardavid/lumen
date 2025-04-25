import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface Message {
  id: number;
  content: string;
  is_user: boolean;
  created_at: string;
  sentiment?: string;
}

interface ChatSession {
  id: number;
  started_at: string;
  created_at: string;
  is_active: boolean;
}

interface ApiError {
  detail: string;
}

// Componente para mostrar o tempo restante
const SessionTimer: React.FC<{ startTime: string | undefined; onTimeWarning: () => void; onTimeEnd: () => void }> = ({ 
  startTime, 
  onTimeWarning,
  onTimeEnd 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    if (!startTime) {
      console.log('No start time available');
      return;
    }

    try {
      const sessionStart = new Date(startTime).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - sessionStart) / 1000);
        const remainingSeconds = Math.max(1800 - elapsedSeconds, 0); // 30 minutos = 1800 segundos
        setTimeLeft(remainingSeconds);

        // Verifica se faltam 5 minutos (300 segundos)
        if (remainingSeconds <= 300 && !warningShown) {
          setWarningShown(true);
          onTimeWarning();
        }

        // Verifica se o tempo acabou
        if (remainingSeconds === 0) {
          onTimeEnd();
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }, [startTime, warningShown, onTimeWarning, onTimeEnd]);

  if (!startTime || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-sm text-gray-600">
      Tempo restante: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg max-w-[80%]">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-600"></span>
    </div>
  );
};

const Chat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [sessionEnding, setSessionEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const scrollHeight = container.scrollHeight;
      const currentScroll = container.scrollTop;
      const targetScroll = scrollHeight;
      
      // Se já estiver próximo do final, rola suavemente
      if (Math.abs(targetScroll - currentScroll) < 100) {
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      } else {
        // Se estiver longe do final, rola instantaneamente
        container.scrollTop = targetScroll;
      }
    }
  };

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const response = await axios.get<ChatSession>('http://localhost:8000/api/chat/session/active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setActiveSession(response.data);
        
        if (response.data) {
          const messagesResponse = await axios.get<Message[]>(
            `http://localhost:8000/api/chat/session/${response.data.id}/messages`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setMessages(messagesResponse.data);
          // Aguarda um pequeno delay para garantir que o DOM foi atualizado
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error('Error fetching active session:', error);
        try {
          const response = await axios.post<ChatSession>(
            'http://localhost:8000/api/chat/session/start',
            {},
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setActiveSession(response.data);
        } catch (error) {
          console.error('Error starting new session:', error);
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { detail?: string } } };
            setError(axiosError.response?.data?.detail || 'Erro ao iniciar sessão');
          } else {
            setError('Erro ao iniciar sessão');
          }
        }
      }
    };

    fetchActiveSession();
  }, []);

  useEffect(() => {
    // Usa um pequeno delay para garantir que o DOM foi atualizado
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;

    const userMessage = input;
    setMessages(prev => [...prev, { 
      id: prev.length + 1, 
      content: userMessage, 
      is_user: true, 
      created_at: new Date().toISOString() 
    }]);
    setInput('');
    setLoading(true);
    setIsAiThinking(true);

    try {
      const userMessageResponse = await axios.post<Message>(
        `http://localhost:8000/api/chat/message`,
        { content: userMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Adiciona um delay de 1.5 segundos antes de mostrar a resposta da IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessages(prev => [...prev, userMessageResponse.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setIsAiThinking(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      setSessionEnding(true);
      setError(null);
      
      await axios.post(
        `http://localhost:8000/api/chat/session/${activeSession.id}/end`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Show success message briefly before redirecting
      setError('Sessão finalizada com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
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

  const handleTimeWarning = () => {
    setShowTimeWarning(true);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      content: "Atenção: faltam apenas 5 minutos para o término da sua sessão. Gostaria de finalizar algum assunto pendente?",
      is_user: false,
      created_at: new Date().toISOString()
    }]);
  };

  const handleTimeEnd = async () => {
    if (!activeSession) return;

    // Adiciona mensagem de despedida
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      content: "Nossa sessão chegou ao fim. Foi um prazer conversar com você! Se precisar de mais ajuda, estarei aqui para uma nova conversa. Tenha um ótimo dia!",
      is_user: false,
      created_at: new Date().toISOString()
    }]);

    // Finaliza a sessão após um breve delay
    setTimeout(async () => {
      try {
        await axios.post(
          `http://localhost:8000/api/chat/session/${activeSession.id}/end`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen mt-10">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Chat</h1>
        <div className="flex items-center gap-4">
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          <Button
            variant="destructive"
            onClick={handleEndSession}
            disabled={!activeSession || sessionEnding}
          >
            {sessionEnding ? 'Finalizando...' : 'Finalizar Sessão'}
          </Button>
        </div>
      </div>

      {activeSession && (
        <div className="flex justify-center items-center py-2">
          <SessionTimer 
            startTime={activeSession.started_at} 
            onTimeWarning={handleTimeWarning}
            onTimeEnd={handleTimeEnd}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 mb-20" ref={messagesContainerRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 p-4 rounded-lg ${
              message.is_user ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            } max-w-[80%]`}
          >
            <p className="text-gray-800">{message.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(message.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        {isAiThinking && <ThinkingIndicator />}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading || !activeSession}
          />
          <Button type="submit" disabled={loading || !activeSession}>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 