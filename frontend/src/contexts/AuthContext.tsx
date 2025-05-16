import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get<User>(API_ENDPOINTS.AUTH.ME);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post<TokenResponse>(API_ENDPOINTS.AUTH.TOKEN, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    await fetchUser();
  };

  const register = async (name: string, email: string, password: string) => {
    await axios.post<User>(API_ENDPOINTS.USER.REGISTER, {
      name,
      email,
      password,
    });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  useEffect(() => {
  const interceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.response.eject(interceptor);
  };
}, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 