import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { User } from '../../types';

const LoginForm: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('ユーザーIDを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // APIを呼び出してログイン
      const response = await api.auth.login(userId.trim(), token || undefined);
      
      // AuthContextのlogin関数を呼び出し
      // サーバーから返されたユーザー情報をそのまま渡す
      await login(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoUserId: string) => {
    setIsLoading(true);
    setError('');

    try {
      // デモユーザーの場合はAPIを呼び出さずに直接ログイン
      const isPremium = demoUserId === 'admin' || demoUserId === 'demo_user';
      
      const demoUser: User = {
        id: demoUserId,
        username: demoUserId,
        email: `${demoUserId}@nekota.app`,
        premium_until: isPremium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        stripe_customer_id: isPremium ? `cus_demo_${demoUserId}` : null,
        created_at: new Date().toISOString(),
      };
      
      await login(`mock_jwt_token_${demoUserId}`, demoUser);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nekota Server</h1>
          <p className="text-gray-600">AI Voice Conversation Platform</p>
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
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="ユーザーIDを入力してください"
                required
                disabled={isLoading}
              />
            </div>

            {/* JWT Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JWTトークン (オプション)
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="JWTトークン（任意）"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showToken ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !userId.trim()}
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

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">デモアカウント:</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('demo_user')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-gray-900">demo_user</div>
                <div className="text-sm text-gray-600">プレミアムユーザー（ChatGPT利用可能）</div>
              </button>
              
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-gray-900">admin</div>
                <div className="text-sm text-gray-600">管理者アカウント（全機能利用可能）</div>
              </button>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>任意のユーザーID:</strong> 上記以外のIDでもログイン可能です（フリープランとして作成されます）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;