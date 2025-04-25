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
      setMessages(response.data);
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
        { content: userMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessages(prev => [...prev, userMessageResponse.data]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setIsAiThinking(false);
    }
  };

  const sendAiMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      content,
      is_user: false,
      created_at: new Date().toISOString()
    }]);
  };

  const getSessionSummary = async () => {
    if (!sessionId) return null;
    
    try {
      const response = await axios.get<{
        summary_text: string,
        key_topics: string[],
        overall_sentiment: string,
        risk_level: string,
        message_count: number,
        duration_minutes: number
      }>(
        API_ENDPOINTS.CHAT.SESSION.GET_SUMMARY(sessionId),
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching session summary:', error);
      return null;
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
    sendAiMessage,
    getSessionSummary
  };
};