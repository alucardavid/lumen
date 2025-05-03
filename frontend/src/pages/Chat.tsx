import React, { useState, useEffect } from 'react';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { useChatSession } from '../hooks/useChatSession';
import { useMessages } from '../hooks/useMessages';
import { useSummarys } from '../hooks/useSummarys';
import { LoadingOverlay } from '../components/chat/LoadingOverlay';

const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [summaryShown, setSummaryShown] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Finalizando a sessão...");

  const {
    activeSession,
    sessionEnding,
    error,
    fetchActiveSession,
    endSession  } = useChatSession();

  const {
    createSessionSummary  } = useSummarys(activeSession?.id || null);

  const {
    messages,
    loading,
    isAiThinking,
    sendMessage,
    sendAiMessage
  } = useMessages(activeSession?.id || null);

  useEffect(() => {
    fetchActiveSession();
  }, []); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;
    await sendMessage(input);
    setInput('');
  };

  const handleEndSession = async () => {
    if (!activeSession || summaryShown || isEndingSession) return;

    try {
      setIsEndingSession(true);
      setIsGeneratingSummary(true);
      setLoadingMessage("Preparando o resumo da sua sessão...");
      
      // Check if the session has already been summarized
      const summary = await createSessionSummary();
      
      setLoadingMessage("Finalizando a sessão...");
      
      if (summary) {
        setSummaryShown(true);
        
        // Parse JSON fields if they are strings
        let keyTopics = [];
        let suggestions = [];
        let progressObservations = [];
        
        try {
          keyTopics = typeof summary.key_topics === 'string' ? JSON.parse(summary.key_topics) : summary.key_topics;
          suggestions = typeof summary.suggestions === 'string' ? JSON.parse(summary.suggestions) : summary.suggestions;
          progressObservations = typeof summary.progress_observations === 'string' ? JSON.parse(summary.progress_observations) : summary.progress_observations;
        } catch (e) {
          console.error("Error parsing summary JSON fields:", e);
        }

        let summaryMessage = `📋 Resumo da Sessão
          
          ${summary.summary_text}

          🎯 Principais Tópicos Discutidos

          ${Array.isArray(keyTopics) ? keyTopics.map((topic, index) => `${index + 1}. ${topic}`).join('\n') : ''}

          💡 Sugestões para a Próxima Sessão  

          ${Array.isArray(suggestions) ? suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n') : ''}

          📝 Observações sobre o Progresso

          ${Array.isArray(progressObservations) ? progressObservations.map((observation, index) => `${index + 1}. ${observation}`).join('\n') : ''}

          📊 Métricas da Sessão

          • Duração: ${Math.round(summary.duration_minutes)} minutos
          • Mensagens trocadas: ${summary.message_count}
        `;

        await sendAiMessage(summaryMessage);
      }

      await sendAiMessage("Foi um prazer conversar com você! Se precisar de mais ajuda, estarei aqui para uma nova conversa. Tenha um ótimo dia!");
      
      setIsEndingSession(true);
      
      await endSession(activeSession.id);
      
    } finally {
      setIsEndingSession(false);
      setIsGeneratingSummary(false);
    }
  };

  const handleTimeWarning = () => {
    if (!showTimeWarning) {
      // Check if warning message was already sent
      const hasWarningMessage = messages.some(message => 
        message.content.includes("Atenção: faltam apenas 5 minutos para o término da sua sessão")
      );
      
      if (!hasWarningMessage) {
        setShowTimeWarning(true);
        sendAiMessage("Atenção: faltam apenas 5 minutos para o término da sua sessão. Gostaria de finalizar algum assunto pendente?");
      }
    }
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
        isAiThinking={isAiThinking || isGeneratingSummary}
      />

      <MessageInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        loading={loading || isEndingSession}
        activeSession={!!activeSession && !isEndingSession}
      />

      {/* Loading overlay with gradient background */}
      <LoadingOverlay 
        isVisible={isGeneratingSummary} 
        message={loadingMessage}
      />
    </div>
  );
};

export default Chat;