import React, { useState, useEffect } from 'react';
import { Brain, MessageCircle, Users, Clock, Star, Settings, RefreshCw, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api, userAPI, friendAPI } from '../services/api';
import NeKotaDiary from '../components/ShortMemory/NeKotaDiary';

interface DashboardStats {
  totalMessages: number;
  totalFriends: number;
  totalMemories: number;
  currentModel: string;
  subscriptionPlan: string;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, updatePremiumStatus } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    totalFriends: 0,
    totalMemories: 0,
    currentModel: 'deepseek',
    subscriptionPlan: 'free'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [selectedPrompt, setSelectedPrompt] = useState('1');

  // デバッグ: コンポーネントマウント時の状態確認
  useEffect(() => {
    console.log('Dashboard mounted:', {
      user,
      isAuthenticated,
      authLoading,
      localStorage: {
        token: localStorage.getItem('nekota_token'),
        user: localStorage.getItem('nekota_user')
      }
    });
  }, [user, isAuthenticated, authLoading]);

  // 認証状態の強制更新
  const forceRefreshAuth = () => {
    console.log('Dashboard: Force refreshing authentication...');
    const token = localStorage.getItem('nekota_token');
    const storedUser = localStorage.getItem('nekota_user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Dashboard: Refreshing with user data:', userData);
        // ページをリロードして認証状態を再初期化
        window.location.reload();
      } catch (error) {
        console.error('Dashboard: Error parsing user data:', error);
      }
    } else {
      console.log('Dashboard: No stored auth data found');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      console.log('Dashboard: User not authenticated, redirecting to login');
      window.location.href = '/login';
    }
  }, [user, isAuthenticated, authLoading]);

  const loadDashboardData = async () => {
    if (!user) {
      console.error('Dashboard: No user data available');
      setError('ユーザー情報が取得できませんでした');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Dashboard: Loading dashboard data for user:', user);
      
      // プレミアムステータスを最新の状態に更新
      // try {
      //   const userStatus = await userAPI.getUserStatus(user.id);
      //   console.log('Dashboard: User status:', userStatus);
      //   if (userStatus.is_premium && user.subscription?.plan !== 'premium') {
      //     console.log('Dashboard: Updating premium status to true');
      //     updatePremiumStatus(true);
      //   }
      // } catch (error) {
      //   console.error('Dashboard: Error checking user status:', error);
      // }
      
      // Load user profile and stats with better error handling
      const profileData = await userAPI.getProfile(user.id).catch((error) => {
        console.error('Dashboard: Error loading profile:', error);
        return { message_count: 0 };
      });

      // メモリ数を取得（完全なレスポンスを取得するため直接APIを呼ぶ）
      const memoriesData = await api.get<any>(`/api/memory/?user_id=${user.id}&page=1&limit=1`).catch((error) => {
        console.error('Dashboard: Error loading memories:', error);
        return { total: 0 };
      });

      const friendsData = await friendAPI.list(user.id).catch((error) => {
        console.error('Dashboard: Error loading friends:', error);
        return [];
      });

      const modelData = await userAPI.getModel(user.id).catch((error) => {
        console.error('Dashboard: Error loading model:', error);
        return { model: 'deepseek' };
      });

      console.log('Dashboard: Loaded dashboard data:', {
        profile: profileData,
        memories: memoriesData,
        friends: friendsData,
        model: modelData,
        user: user
      });

      setStats({
        totalMessages: profileData?.message_count || 0,
        totalFriends: Array.isArray(friendsData) ? friendsData.length : 0,
        totalMemories: memoriesData?.total || 0,
        currentModel: modelData?.model || 'deepseek',
        subscriptionPlan: user?.is_premium ? 'premium' : 'free'
      });

      setSelectedModel(modelData?.model || 'deepseek');
      setSelectedPrompt(modelData?.prompt_type || '1');
    } catch (error) {
      console.error('Dashboard: Error loading dashboard data:', error);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = async (model: string) => {
    if (!user) return;

    // プレミアム制限のデバッグ
    console.log('Model change debug:', {
      model,
      user: user,
      userId: user.id,
      subscriptionPlan: stats.subscriptionPlan,
      isPremium: stats.subscriptionPlan === 'premium'
    });

    // user.idが正しく取得できているか確認
    if (!user.id) {
      console.error('❌ user.id is missing!', user);
      setError('ユーザーIDが取得できません');
      return;
    }

    try {
      await userAPI.updateModel(user.id, model);
      setSelectedModel(model);
      setStats(prev => ({ ...prev, currentModel: model }));
      console.log('Model updated successfully:', model);
    } catch (error) {
      console.error('Dashboard: Error updating model:', error);
      setError('モデルの更新に失敗しました');
    }
  };

  const handlePromptChange = async (promptType: string) => {
    if (!user) return;

    if (!user.id) {
      console.error('❌ user.id is missing!', user);
      setError('ユーザーIDが取得できません');
      return;
    }

    try {
      await userAPI.updatePrompt(user.id, promptType);
      setSelectedPrompt(promptType);
      console.log('Prompt updated successfully:', promptType);
    } catch (error) {
      console.error('Dashboard: Error updating prompt:', error);
      setError('プロンプトの更新に失敗しました');
    }
  };

  const modelOptions = [
    {
      id: 'deepseek',
      name: t('dashboard.modelDeepseek'),
      description: t('dashboard.modelDeepseekDesc'),
      isPremium: false,
      color: 'blue'
    },
    {
      id: 'chatgpt',
      name: t('dashboard.modelChatgpt'),
      description: t('dashboard.modelChatgptDesc'),
      isPremium: true,
      color: 'green'
    },
    {
      id: 'claude',
      name: t('dashboard.modelClaude'),
      description: t('dashboard.modelClaudeDesc'),
      isPremium: true,
      color: 'purple'
    }
  ];

  const statCards = [
    {
      title: t('dashboard.totalMessages'),
      value: stats.totalMessages.toLocaleString(),
      icon: MessageCircle,
      color: 'blue'
    },
    {
      title: t('dashboard.friendsConnected'),
      value: stats.totalFriends.toLocaleString(),
      icon: Users,
      color: 'green'
    },
    {
      title: t('dashboard.aiMemories'),
      value: stats.totalMemories.toLocaleString(),
      icon: Brain,
      color: 'purple'
    },
    {
      title: t('dashboard.currentPlan'),
      value: stats.subscriptionPlan.charAt(0).toUpperCase() + stats.subscriptionPlan.slice(1),
      icon: Star,
      color: 'orange'
    }
  ];

  // 認証中またはローディング中の場合
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

  // 認証されていない場合
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">認証が必要です</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  // エラーが発生した場合
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // ローディング中の場合
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome')}, {user?.name || user?.introduction || user?.id || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${card.color}-50`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NeKota Diary Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <NeKotaDiary />
      </div>

      {/* AI Model Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.aiModelSelection')}</h2>
            <p className="text-gray-600 mt-1">{t('dashboard.aiModelDescription')}</p>
          </div>
          <Settings className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelOptions.map((model) => (
            <div
              key={model.id}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedModel === model.id
                  ? `border-${model.color}-500 bg-${model.color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleModelChange(model.id)}
            >
              {model.isPremium && stats.subscriptionPlan === 'free' && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {t('dashboard.premium')}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                {selectedModel === model.id && (
                  <div className={`w-3 h-3 rounded-full bg-${model.color}-500`}></div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm">{model.description}</p>
              
              {model.isPremium && stats.subscriptionPlan === 'free' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-orange-600 font-medium">
                    {t('dashboard.upgradeToPremium')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Prompt Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">キャラクター設定</h2>
            <p className="text-gray-600 mt-1">ネコ太の性格を選択できます</p>
          </div>
          <BookOpen className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedPrompt === '1'
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => handlePromptChange('1')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">通常モード</h3>
              {selectedPrompt === '1' && (
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              )}
            </div>
            <p className="text-gray-600 text-sm">天然で不思議系、無邪気で奔放なネコ太</p>
          </div>

          <div
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedPrompt === '2'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => handlePromptChange('2')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">クールモード</h3>
              {selectedPrompt === '2' && (
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              )}
            </div>
            <p className="text-gray-600 text-sm">賢くて冷静、論理的に考えるネコ太</p>
          </div>

          <div
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedPrompt === '3'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => handlePromptChange('3')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">元気モード</h3>
              {selectedPrompt === '3' && (
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              )}
            </div>
            <p className="text-gray-600 text-sm">超元気で明るい、ポジティブなネコ太</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;