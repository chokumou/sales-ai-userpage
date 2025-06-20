import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  detectBackendPort: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // バックエンドポートを検出する関数
  const detectBackendPort = async () => {
    try {
      console.log('Detecting backend port...');
      await api.updateBaseURL();
      console.log('Backend port detection completed');
    } catch (error) {
      console.error('Error detecting backend port:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // まずバックエンドポートを検出
        await detectBackendPort();

        const storedUser = localStorage.getItem('nekota_user');
        const token = localStorage.getItem('nekota_token');

        console.log('Loading user from storage:', {
          storedUser,
          token
        });

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user data:', parsedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          api.setToken(token);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const login = (token: string, userData: User) => {
    try {
      console.log('Logging in user:', {
        userData,
        token
      });

      localStorage.setItem('nekota_user', JSON.stringify(userData));
      localStorage.setItem('nekota_token', token);
      setUser(userData);
      setIsAuthenticated(true);
      api.setToken(token);

      console.log('User logged in successfully');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('nekota_user');
    localStorage.removeItem('nekota_token');
    setUser(null);
    setIsAuthenticated(false);
    api.setToken(null);
    console.log('User logged out successfully');
  };

  const refreshToken = async () => {
    // TODO: トークンのリフレッシュ処理を実装
    console.log('Token refresh not implemented yet');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
        detectBackendPort,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};