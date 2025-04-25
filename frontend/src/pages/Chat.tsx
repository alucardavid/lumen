import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { useChatSession } from '../hooks/useChatSession';
import { useMessages } from '../hooks/useMessages';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [summaryShown, setSummaryShown] = useState(false);

  const {
    activeSession,
    sessionEnding,
    error,
    fetchActiveSession,
    endSession,
    setError
  } = useChatSession();

  const {
    messages,
    loading,
    isAiThinking,
    sendMessage,
    sendAiMessage,
    getSessionSummary
  } = useMessages(activeSession?.id || null);

  useEffect(() => {
    if (!activeSession) {
      fetchActiveSession();
    }
  }, [activeSession, fetchActiveSession]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;
    await sendMessage(input);
    setInput('');
  };

  const handleEndSession = async () => {
    if (!activeSession || summaryShown) return;

    // Primeiro finalizamos a sessão
    await endSession(activeSession.id);
    
    // Agora que a sessão foi finalizada e o resumo foi gerado, podemos buscá-lo
    const summary = await getSessionSummary();
    
    if (summary) {
      setSummaryShown(true);
      sendAiMessage("Aqui está um resumo da nossa conversa:");
      sendAiMessage(`\n📝 **Resumo da Sessão:**\n${summary.summary_text}`);
      
      if (summary.key_topics && summary.key_topics.length > 0) {
        sendAiMessage("\n🎯 **Principais Tópicos Discutidos:**");
        summary.key_topics.forEach((topic, index) => {
          sendAiMessage(`${index + 1}. ${topic}`);
        });
      }
    }

    sendAiMessage("\nFoi um prazer conversar com você! Se precisar de mais ajuda, estarei aqui para uma nova conversa. Tenha um ótimo dia!");

    setTimeout(() => {
      console.log('Navegando para a página inicial');
      // navigate('/');
    }, 2000);
  };

  const handleTimeWarning = () => {
    setShowTimeWarning(true);
    sendAiMessage("Atenção: faltam apenas 5 minutos para o término da sua sessão. Gostaria de finalizar algum assunto pendente?");
  };

  const handleTimeEnd = async () => {
    if (!activeSession) return;
    await handleEndSession();
  };

  return (
    <div className="flex flex-col h-screen mt-10">
      <ChatHeader
        error={error}
        activeSession={activeSession}
        sessionEnding={sessionEnding}
        onEndSession={handleEndSession}
        onTimeWarning={handleTimeWarning}
        onTimeEnd={handleTimeEnd}
      />

      <MessageList
        messages={messages}
        isAiThinking={isAiThinking}
      />

      <MessageInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        loading={loading}
        activeSession={!!activeSession}
      />
    </div>
  );
};

export default Chat;