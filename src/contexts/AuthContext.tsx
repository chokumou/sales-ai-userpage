import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAPIService } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updatePremiumStatus: (isPremium: boolean, premiumUntil?: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string, userData: User) => {
    localStorage.setItem('nekota_token', token);
    localStorage.setItem('nekota_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    // APIサービスにトークンを設定
    const api = getAPIService();
    api.setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('nekota_token');
    localStorage.removeItem('nekota_user');
    setUser(null);
    setIsAuthenticated(false);
    
    // APIサービスからトークンを削除
    const api = getAPIService();
    api.setToken(null);
  };

  const updatePremiumStatus = useCallback((isPremium: boolean, premiumUntil: string | null = null) => {
    if (user) {
      const updatedUser: User = { 
        ...user, 
        premium_until: isPremium ? premiumUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      };
      setUser(updatedUser);
      localStorage.setItem('nekota_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Starting initialization...');
        setIsLoading(true);
        
        // ローカルストレージからユーザー情報を読み込み
        const storedUser = localStorage.getItem('nekota_user');
        const token = localStorage.getItem('nekota_token');
        
        console.log('AuthContext: Loading user from storage:', { 
          hasStoredUser: !!storedUser, 
          hasToken: !!token 
        });
        
        if (storedUser && token) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('AuthContext: Parsed user data:', userData);
            
            // APIサービスにトークンを設定
            console.log('AuthContext: Setting token in API service...');
            const api = getAPIService();
            api.setToken(token);
            console.log('AuthContext: Token set successfully');
            
            setUser(userData);
            setIsAuthenticated(true);
            console.log('AuthContext: User authenticated successfully');
          } catch (error) {
            console.error('AuthContext: Error parsing stored user data:', error);
            // エラーが発生した場合はローカルストレージをクリア
            localStorage.removeItem('nekota_user');
            localStorage.removeItem('nekota_token');
          }
        } else {
          console.log('AuthContext: No stored user data found');
        }
      } catch (error) {
        console.error('AuthContext: Error during auth initialization:', error);
      } finally {
        // 必ずisLoadingをfalseに設定
        console.log('AuthContext: Initialization completed, setting isLoading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updatePremiumStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};