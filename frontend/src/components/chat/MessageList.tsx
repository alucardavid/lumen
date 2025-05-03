import React, { useRef, useEffect } from 'react';
import { Message } from '../../types/chat';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useMessages } from '../../hooks/useMessages';
import { useChatSession } from '../../hooks/useChatSession';
interface MessageListProps {
  messages: Message[];
  isAiThinking: boolean;
}


export const MessageList: React.FC<MessageListProps> = ({ messages, isAiThinking }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { activeSession } = useChatSession();
  const { sendMessage, sendAiMessage } = useMessages(activeSession?.id || null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const scrollHeight = container.scrollHeight;
      const currentScroll = container.scrollTop;
      const targetScroll = scrollHeight;
      
      if (Math.abs(targetScroll - currentScroll) < 100) {
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = targetScroll;
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const isSummaryMessage = (content: string) => {
    return content.includes('📋 Resumo da Sessão');
  };

  const isGreetingMessage = (content: string) => {
    return content.includes('Olá! Meu nome é Lumen');
  };

  const formatMessageContent = (content: string) => {
    if (isGreetingMessage(content)) {
      return content.split('\n').map((line, index) => {
        if (line.trim() === '') {
          return <br key={index} />;
        } else if (line.startsWith('•')) {
          return (
            <div key={index} className="flex items-start mt-2">
              <span className="mr-2">•</span>
              <span>{line.substring(1).trim()}</span>
            </div>
          );
        } else {
          return <p key={index} className="text-gray-800">{line}</p>;
        }
      });
    } else if (isSummaryMessage(content)) {
      return content.split('\n').map((line, index) => (
        line.trim() === '' ? (
          <br key={index} />
        ) : (
          <p key={index} className="text-gray-800">
            {line}
          </p>
        )
      ));
    } else {
      return <p className="text-gray-800">{content}</p>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 mb-20" ref={messagesContainerRef}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`mb-4 p-4 rounded-lg ${
            message.is_user ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
          } max-w-[80%]`}
        >
          <div className="whitespace-pre-line">
            {formatMessageContent(message.content)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(message.created_at).toLocaleString()}
          </p>
        </div>
      ))}
      {isAiThinking && <ThinkingIndicator />}
    </div>
  );
};