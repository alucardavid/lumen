import { useState, useEffect } from 'react';
import axios from 'axios';
import { Message } from '../types/chat';
import { API_ENDPOINTS } from '../config/api';

export const useMessages = (sessionId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const fetchMessages = async () => {
    if (!sessionId) return;
    
    try {
      const response = await axios.get<Message[]>(
        API_ENDPOINTS.CHAT.SESSION.MESSAGES(sessionId),
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.length > 0) {
      setMessages(response.data);
      }
      else {
        sendAiMessage(`👋 Olá! Meu nome é Lumen e estou aqui para te ajudar. Como você está se sentindo hoje? 

                    💭 Posso te ajudar com:
                    • 🗣️ Conversar sobre seus sentimentos
                    • 🤔 Explorar suas preocupações
                    • 💡 Refletir sobre suas experiências
                    • 🌟 Encontrar formas de lidar com desafios

                    Por onde você gostaria de começar?
                    `)
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!sessionId) return;

    const userMessage = content;
    setMessages(prev => [...prev, { 
      id: prev.length + 1, 
      content: userMessage, 
      is_user: true, 
      created_at: new Date().toISOString() 
    }]);
    setLoading(true);
    setIsAiThinking(true);

    try {
      const userMessageResponse = await axios.post<Message>(
        API_ENDPOINTS.CHAT.MESSAGE,
        { content: userMessage, is_user: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        content: userMessageResponse.data.content,
        is_user: false,
        created_at: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setIsAiThinking(false);
    }
  };

  const sendAiMessage = async (content: string) => {
    if (!sessionId) return;
    
    const aiMessage = content;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      content,
      is_user: false,
      created_at: new Date().toISOString()
    }]);

    try {
      const userMessageResponse = await axios.post<Message>(
        API_ENDPOINTS.CHAT.MESSAGE,
        { content: aiMessage, is_user: false },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // await new Promise(resolve => setTimeout(resolve, 1500));
      
      // setMessages(prev => [...prev, userMessageResponse.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setIsAiThinking(false);
    }
  };

  

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  return {
    messages,
    loading,
    isAiThinking,
    sendMessage,
    sendAiMessage
  };
};
