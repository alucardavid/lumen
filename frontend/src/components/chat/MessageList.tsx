import React, { useRef, useEffect } from 'react';
import { Message } from '../../types/chat';
import { ThinkingIndicator } from './ThinkingIndicator';

interface MessageListProps {
  messages: Message[];
  isAiThinking: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isAiThinking }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  return (
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
  );
};