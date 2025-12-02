import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ErrorPage: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('error.title') || 'エラーが発生しました'}
        </h1>
        
        <p className="text-gray-600 mb-2">
          {message || t('error.userIdNotFound') || 'ユーザーIDが取得できませんでした。'}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          {t('error.loginRequired') || 'ログインが必要です。ログイン画面から再度ログインしてください。'}
        </p>
        
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('error.goToLogin') || 'ログイン画面へ戻る'}</span>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;




