import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Crown } from 'lucide-react';
import { getAPIService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const userId = searchParams.get('user_id');

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        console.log('Success.tsx: Starting handleSuccess');
        console.log('Success.tsx: authLoading:', authLoading);
        console.log('Success.tsx: isAuthenticated:', isAuthenticated);
        
        // AuthContextの初期化が完了するまで待つ
        if (authLoading) {
          console.log('Success.tsx: AuthContext still loading, waiting...');
          return;
        }

        // ユーザー情報を取得
        if (userId) {
          console.log('Success.tsx: User ID found:', userId);
          
          // シングルトンAPIサービスインスタンスを使用
          const api = getAPIService();
          const token = api.getToken();
          
          console.log('Success.tsx: Token available:', token ? 'Yes' : 'No');
          
          if (!token) {
            console.log('Success.tsx: No token available, redirecting to login');
            navigate('/login');
            return;
          }

          try {
            // プレミアムステータスを取得
            const response = await api.get(`/api/users/${userId}/premium-status`);
            console.log('Success.tsx: Premium status response:', response);
            
            if (response.is_premium) {
              setUserData({ isPremium: true });
              console.log('Success.tsx: User is premium');
            } else {
              setUserData({ isPremium: false });
              console.log('Success.tsx: User is not premium');
            }
          } catch (error) {
            console.error('Success.tsx: Error fetching premium status:', error);
            setUserData({ isPremium: false });
          }
        }
      } catch (error) {
        console.error('Success.tsx: Error in handleSuccess:', error);
      } finally {
        setIsLoading(false);
      }
    };

    handleSuccess();
  }, [userId, authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">支払い情報を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            支払い完了！
          </h1>
          
          <p className="text-gray-600 mb-6">
            ありがとうございます。支払いが正常に完了しました。
          </p>

          {userData?.isPremium && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Crown className="h-6 w-6 text-white mr-2" />
                <span className="text-white font-semibold">プレミアム会員になりました！</span>
              </div>
              <p className="text-white text-sm">
                すべてのプレミアム機能が利用可能です。
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              ダッシュボードに戻る
            </button>
            
            <button
              onClick={() => navigate('/upgrade')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              他のプランを確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success; 