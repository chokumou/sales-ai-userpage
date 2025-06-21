import React, { useState, useEffect } from 'react';
import { Brain, MessageCircle, Users, Zap, TrendingUp, Clock, Star, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { userAPI, memoryAPI, friendAPI } from '../services/api';

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

      const memoriesData = await memoryAPI.list(user.id, 1, 1).catch((error) => {
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
        subscriptionPlan: user?.subscription?.plan || 'free'
      });

      setSelectedModel(modelData?.model || 'deepseek');
    } catch (error) {
      console.error('Dashboard: Error loading dashboard data:', error);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = async (model: string) => {
    if (!user) return;

    try {
      await userAPI.updateModel(user.id, model);
      setSelectedModel(model);
      setStats(prev => ({ ...prev, currentModel: model }));
    } catch (error) {
      console.error('Dashboard: Error updating model:', error);
      setError('モデルの更新に失敗しました');
    }
  };

  const modelOptions = [
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'Fast and efficient AI model',
      isPremium: false,
      color: 'blue'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      description: 'Advanced conversational AI',
      isPremium: true,
      color: 'green'
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Sophisticated reasoning AI',
      isPremium: true,
      color: 'purple'
    }
  ];

  const statCards = [
    {
      title: 'Total Messages',
      value: stats.totalMessages.toLocaleString(),
      icon: MessageCircle,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Friends Connected',
      value: stats.totalFriends.toLocaleString(),
      icon: Users,
      color: 'green',
      trend: '+5%'
    },
    {
      title: 'AI Memories',
      value: stats.totalMemories.toLocaleString(),
      icon: Brain,
      color: 'purple',
      trend: '+18%'
    },
    {
      title: 'Current Plan',
      value: stats.subscriptionPlan.charAt(0).toUpperCase() + stats.subscriptionPlan.slice(1),
      icon: Star,
      color: 'orange',
      trend: ''
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
            Welcome back, {user?.name || user?.introduction || user?.id || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your AI conversations today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
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
                {card.trend && (
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{card.trend}</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-${card.color}-50`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Model Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Model Selection</h2>
            <p className="text-gray-600 mt-1">Choose your preferred AI model for conversations</p>
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
                    Premium
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
                    Upgrade to Premium to unlock this model
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {[
            {
              action: 'Voice message sent',
              target: 'AI Assistant',
              time: '2 minutes ago',
              icon: MessageCircle,
              color: 'blue'
            },
            {
              action: 'Memory created',
              target: 'Important meeting notes',
              time: '1 hour ago',
              icon: Brain,
              color: 'purple'
            },
            {
              action: 'Friend request accepted',
              target: 'John Smith',
              time: '3 hours ago',
              icon: Users,
              color: 'green'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg bg-${activity.color}-50`}>
                <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.target}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>

        {stats.totalMessages === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600 mb-6">Start your first AI conversation to see activity here.</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start Conversation
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Register Voice',
            description: 'Add your voice profile',
            icon: Zap,
            color: 'blue',
            href: '/voice'
          },
          {
            title: 'Add Memory',
            description: 'Store important information',
            icon: Brain,
            color: 'purple',
            href: '/memory'
          },
          {
            title: 'Find Friends',
            description: 'Connect with others',
            icon: Users,
            color: 'green',
            href: '/friends'
          },
          {
            title: 'Upgrade Plan',
            description: 'Unlock premium features',
            icon: Star,
            color: 'orange',
            href: '/upgrade'
          }
        ].map((action, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => window.location.href = action.href}
          >
            <div className={`w-12 h-12 rounded-xl bg-${action.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-6 h-6 text-${action.color}-600`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-gray-600 text-sm">{action.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;