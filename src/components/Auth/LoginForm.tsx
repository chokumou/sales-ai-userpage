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
      // デバイス番号でログイン
      const response = await api.device.exists(deviceNumber.trim());
      
      if (response.exists && response.token && response.user) {
        // AuthContextのlogin関数を呼び出し
        await login(response.token, response.user);
        navigate('/');
      } else {
        setError('デバイスが見つからないか、ログインできませんでした');
      }
    } catch (err) {
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