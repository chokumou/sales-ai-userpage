import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userId: string, token?: string, onSuccess?: () => void) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('nekota_user');
        const token = localStorage.getItem('nekota_token');

        console.log('Loading user from storage:', {
          storedUser,
          token
        });

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user data:', parsedUser);
          
          // トークンがUUID形式の場合はJWTトークンを取得し直す
          if (token.length === 36 && token.includes('-')) {
            console.log('Token appears to be UUID, refreshing JWT token');
            try {
              const response = await api.auth.refreshToken(parsedUser.id);
              if (response.token) {
                localStorage.setItem('nekota_token', response.token);
                api.setToken(response.token);
                setUser(parsedUser);
                setIsAuthenticated(true);
              } else {
                throw new Error('Failed to get JWT token');
              }
            } catch (error) {
              console.error('Error refreshing JWT token:', error);
              logout();
            }
          } else {
            // JWTトークンの有効期限をチェック
            try {
              const tokenData = JSON.parse(atob(token.split('.')[1]));
              const expirationTime = tokenData.exp * 1000; // ミリ秒に変換
              
              if (Date.now() >= expirationTime) {
                console.log('Token expired, attempting to refresh');
                await refreshToken();
              } else {
                setUser(parsedUser);
                setIsAuthenticated(true);
                api.setToken(token);
              }
            } catch (error) {
              console.error('Error parsing JWT token:', error);
              // トークンの解析に失敗した場合はログアウト
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // エラーが発生した場合はログアウト
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userId: string, providedToken?: string, onSuccess?: () => void) => {
    try {
      console.log('Logging in user:', {
        userId,
        providedToken,
        userIdType: typeof userId,
        providedTokenType: typeof providedToken
      });

      let jwtToken: string;
      let userData: User;

      // デバイス登録の場合（userIdがtoken、providedTokenがuserオブジェクト）
      if (typeof userId === 'string' && userId.length > 100 && providedToken && typeof providedToken === 'object') {
        console.log('Device registration flow detected');
        jwtToken = userId;
        userData = providedToken as User;
      } else {
        // 通常のログインフロー
        if (providedToken) {
          // 提供されたトークンがJWT形式かチェック
          if (providedToken.length === 36 && providedToken.includes('-')) {
            // UUID形式の場合はJWTトークンを取得
            console.log('Provided token is UUID, getting JWT token');
            const response = await api.auth.refreshToken(userId);
            jwtToken = response.token;
          } else {
            // JWT形式の場合はそのまま使用
            jwtToken = providedToken;
          }
        } else {
          // トークンが提供されていない場合は新規登録またはトークン取得
          console.log('No token provided, registering user or getting token');
          try {
            // まずトークン取得を試行
            const response = await api.auth.refreshToken(userId);
            jwtToken = response.token;
          } catch (error) {
            // ユーザーが存在しない場合は新規登録
            console.log('User not found, registering new user');
            const response = await api.auth.register({ user_id: userId });
            jwtToken = response.token;
          }
        }

        // ユーザー情報を取得
        userData = {
          id: userId,
          device_id: '',
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          profile: { introduction: '', language: 'ja' },
          subscription: { plan: 'free', model: 'deepseek' }
        };
      }

      console.log('Login successful:', {
        userData,
        jwtToken: typeof jwtToken === 'string' ? jwtToken.substring(0, 20) + '...' : jwtToken
      });

      // 状態更新を同期的に行う
      localStorage.setItem('nekota_user', JSON.stringify(userData));
      localStorage.setItem('nekota_token', jwtToken);
      api.setToken(jwtToken);
      
      // 状態更新を確実に行う
      setUser(userData);
      setIsAuthenticated(true);

      console.log('User logged in successfully, state updated');
      
      // 成功コールバックを実行
      if (onSuccess) {
        onSuccess();
      }
      
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
    try {
      if (!user) {
        throw new Error('No user data available for token refresh');
      }

      console.log('Refreshing token for user:', user.id);
      const response = await api.auth.refreshToken(user.id);
      
      if (response.token) {
        localStorage.setItem('nekota_token', response.token);
        api.setToken(response.token);
        console.log('Token refreshed successfully');
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // トークンのリフレッシュに失敗した場合はログアウト
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};