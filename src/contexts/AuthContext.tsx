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
  updateProfile: (profileData: { name?: string; introduction?: string }) => void;
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
    console.log('AuthContext: Login called with:', { token: token?.substring(0, 20) + '...', userData });
    
    // 既存の認証情報をクリア（別のアカウントの情報が残らないようにする）
    localStorage.removeItem('nekota_token');
    localStorage.removeItem('nekota_user');
    
    // 新しい認証情報を保存
    localStorage.setItem('nekota_token', token);
    localStorage.setItem('nekota_user', JSON.stringify(userData));
    
    // APIサービスにトークンを設定
    const api = getAPIService();
    api.setToken(token);
    
    // 状態を更新
    setUser(userData);
    setIsAuthenticated(true);
    
    console.log('AuthContext: Login completed, user set to:', userData.id);
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

  const updateProfile = useCallback((profileData: { name?: string; introduction?: string }) => {
    if (user) {
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...profileData
        }
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
            console.log('🔍 AuthContext: Parsed user data from localStorage:', {
              userId: userData.id,
              userName: userData.name,
              userIntroduction: userData.introduction,
              fullUserData: userData
            });
            
            // トークンからユーザーIDを取得
            let tokenUserId: string | null = null;
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              tokenUserId = payload.user_id || payload.sub || null;
              console.log('🔍 AuthContext: User ID from token:', tokenUserId);
            } catch (e) {
              console.warn('⚠️ AuthContext: Could not decode token:', e);
            }
            
            // トークンのユーザーIDとlocalStorageのユーザーIDが一致するか確認
            if (tokenUserId && tokenUserId !== userData.id) {
              console.error('❌ AuthContext: User ID mismatch detected!', {
                tokenUserId,
                storedUserId: userData.id,
                storedUserName: userData.name
              });
              // ユーザーIDが一致しない場合はローカルストレージをクリア
              localStorage.removeItem('nekota_user');
              localStorage.removeItem('nekota_token');
              const api = getAPIService();
              api.setToken(null);
              console.log('🔍 AuthContext: User ID mismatch, cleared storage');
              return;
            }
            
            // APIサービスにトークンを設定
            console.log('🔍 AuthContext: Setting token in API service...');
            const api = getAPIService();
            api.setToken(token);
            console.log('🔍 AuthContext: Token set successfully');
            
            // トークンの有効性を確認（ユーザープロフィールを取得して検証）
            try {
              // 正しいエンドポイントを使用: /api/profile?user_id=${userData.id}
              const profileResponse = await api.get(`/api/profile?user_id=${userData.id}`);
              console.log('🔍 AuthContext: Token validation successful, profile:', {
                userId: profileResponse.id || userData.id,
                userName: profileResponse.profile?.name || profileResponse.name,
                userIntroduction: profileResponse.profile?.introduction || profileResponse.introduction,
                fullResponse: profileResponse
              });
              
              // レスポンス構造に応じて名前と紹介文を取得
              const profileName = profileResponse.profile?.name || profileResponse.name || null;
              const profileIntroduction = profileResponse.profile?.introduction || profileResponse.introduction || null;
              
              // 最新のユーザー情報で更新（プロフィール情報があれば上書き、なければ既存の値を保持）
              const updatedUser = {
                ...userData,
                name: profileName !== null && profileName !== '' ? profileName : userData.name,
                introduction: profileIntroduction !== null && profileIntroduction !== '' ? profileIntroduction : userData.introduction,
                profile: {
                  ...userData.profile,
                  name: profileName !== null && profileName !== '' ? profileName : userData.profile?.name,
                  introduction: profileIntroduction !== null && profileIntroduction !== '' ? profileIntroduction : userData.profile?.introduction
                }
              };
              
              console.log('🔍 AuthContext: Final user data to set:', {
                userId: updatedUser.id,
                userName: updatedUser.name,
                userIntroduction: updatedUser.introduction,
                hasName: !!updatedUser.name,
                hasIntroduction: !!updatedUser.introduction
              });
              
              setUser(updatedUser);
              setIsAuthenticated(true);
              // 最新のユーザー情報をlocalStorageに保存
              localStorage.setItem('nekota_user', JSON.stringify(updatedUser));
              console.log('✅ AuthContext: User authenticated successfully:', updatedUser.id);
            } catch (validationError: any) {
              console.error('❌ AuthContext: Token validation failed:', validationError);
              console.error('❌ AuthContext: Error details:', {
                message: validationError.message,
                status: validationError.status,
                response: validationError.response
              });
              
              // トークンが無効な場合は必ずローカルストレージをクリア
              console.log('🔍 AuthContext: Clearing localStorage due to validation failure');
              localStorage.removeItem('nekota_user');
              localStorage.removeItem('nekota_token');
              api.setToken(null);
              setUser(null);
              setIsAuthenticated(false);
              console.log('🔍 AuthContext: Invalid token, cleared storage and reset auth state');
            }
          } catch (error) {
            console.error('❌ AuthContext: Error parsing stored user data:', error);
            // エラーが発生した場合はローカルストレージをクリア
            localStorage.removeItem('nekota_user');
            localStorage.removeItem('nekota_token');
            const api = getAPIService();
            api.setToken(null);
          }
        } else {
          console.log('🔍 AuthContext: No stored user data found');
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
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};