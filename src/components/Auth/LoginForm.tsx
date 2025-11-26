import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { User } from '../../types';

const LoginForm: React.FC = () => {
  const [deviceNumber, setDeviceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceNumber.trim()) {
      setError('デバイス番号を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const deviceNum = deviceNumber.trim();
      console.log('🔐 LoginForm: Attempting login with device number:', deviceNum);
      
      // 既存のlocalStorageを確認（ログイン前にクリア）
      const existingToken = localStorage.getItem('nekota_token');
      const existingUser = localStorage.getItem('nekota_user');
      console.log('🔐 LoginForm: Existing localStorage BEFORE login:', {
        hasToken: !!existingToken,
        hasUser: !!existingUser,
        userData: existingUser ? JSON.parse(existingUser) : null
      });
      
      // ログイン前に既存の認証情報をクリア（別のアカウントの情報が残らないようにする）
      localStorage.removeItem('nekota_token');
      localStorage.removeItem('nekota_user');
      console.log('🔐 LoginForm: Cleared existing localStorage before login');
      
      // デバイス番号でログイン
      const response = await api.device.exists(deviceNum);
      console.log('🔐 LoginForm: API response from /api/device/exists:', {
        exists: response.exists,
        hasToken: !!response.token,
        hasUser: !!response.user,
        userId: response.user?.id,
        userName: response.user?.name,
        userIntroduction: response.user?.introduction,
        fullUserData: response.user
      });
      
      if (response.exists && response.token && response.user) {
        // トークンからユーザーIDを確認
        try {
          const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
          const tokenUserId = tokenPayload.user_id || tokenPayload.sub;
          console.log('🔐 LoginForm: Token payload:', {
            tokenUserId,
            responseUserId: response.user.id,
            match: tokenUserId === response.user.id
          });
          
          if (tokenUserId !== response.user.id) {
            console.error('❌ LoginForm: User ID mismatch!', {
              tokenUserId,
              responseUserId: response.user.id
            });
            setError('ユーザー情報の不一致が検出されました。再度ログインしてください。');
            return;
          }
        } catch (e) {
          console.warn('⚠️ LoginForm: Could not decode token:', e);
        }
        
        // AuthContextのlogin関数を呼び出し
        console.log('🔐 LoginForm: Calling login with user:', response.user.id);
        await login(response.token, response.user);
        navigate('/');
      } else {
        setError('デバイスが見つからないか、ログインできませんでした');
      }
    } catch (err) {
      console.error('❌ LoginForm: Login error:', err);
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/Group 1.png" 
              alt="Nekota Logo" 
              style={{ width: '200px', height: 'auto' }}
              className="object-contain"
            />
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ログイン
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Device Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                デバイス番号
              </label>
              <input
                type="text"
                value={deviceNumber}
                onChange={(e) => setDeviceNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="デバイス番号を入力してください"
                required
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !deviceNumber.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* Email Login Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/email-login')}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center space-x-1"
            >
              <Mail className="w-4 h-4" />
              <span>メールアドレスでログイン</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;