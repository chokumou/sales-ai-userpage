import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userId: string, password?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('nekota_token');
    const storedUser = localStorage.getItem('nekota_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('nekota_token');
        localStorage.removeItem('nekota_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (userId: string, password?: string) => {
    try {
      // For demo purposes, we'll create mock authentication
      // In production, this would call the actual API
      
      // Demo users
      const demoUsers = {
        'demo_user': {
          id: 'demo_user',
          email: 'demo@example.com',
          profile: {
            introduction: 'Demo user for testing',
            language: 'en'
          },
          subscription: {
            plan: 'premium' as const,
            model: 'chatgpt' as const
          }
        },
        'admin': {
          id: 'admin',
          email: 'admin@example.com',
          profile: {
            introduction: 'System Administrator',
            language: 'en'
          },
          subscription: {
            plan: 'enterprise' as const,
            model: 'claude' as const
          }
        }
      };

      // Check if user exists in demo users
      const demoUser = demoUsers[userId as keyof typeof demoUsers];
      
      if (demoUser) {
        // Create a mock JWT token
        const mockToken = `mock_jwt_token_${userId}_${Date.now()}`;
        
        setToken(mockToken);
        setUser(demoUser);
        
        localStorage.setItem('nekota_token', mockToken);
        localStorage.setItem('nekota_user', JSON.stringify(demoUser));
        
        return;
      }

      // For any other user ID, create a basic user
      const basicUser: User = {
        id: userId,
        profile: {
          introduction: `User ${userId}`,
          language: 'en'
        },
        subscription: {
          plan: 'free',
          model: 'deepseek'
        }
      };

      const mockToken = `mock_jwt_token_${userId}_${Date.now()}`;
      
      setToken(mockToken);
      setUser(basicUser);
      
      localStorage.setItem('nekota_token', mockToken);
      localStorage.setItem('nekota_user', JSON.stringify(basicUser));

    } catch (error) {
      console.error('Login error:', error);
      throw new Error('ログインに失敗しました。ユーザーIDを確認してください。');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nekota_token');
    localStorage.removeItem('nekota_user');
  };

  const refreshToken = async () => {
    if (!user) return;
    
    try {
      // In demo mode, just generate a new mock token
      const mockToken = `mock_jwt_token_${user.id}_${Date.now()}`;
      setToken(mockToken);
      localStorage.setItem('nekota_token', mockToken);
    } catch (error) {
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      refreshToken,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};