import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Sparkles, CreditCard, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { paymentAPI, userAPI } from '../services/api';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  popular?: boolean;
  priceId?: string;
}

const Upgrade: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, updatePremiumStatus } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  // ユーザーのプレミアムステータスを最新の状態に更新
  useEffect(() => {
    const updateUserPremiumStatus = async () => {
      if (user && isAuthenticated) {
        try {
          console.log('Upgrade: Updating user premium status...');
          const response = await userAPI.getPremiumStatus(user.id);
          console.log('Upgrade: Premium status response:', response);
          
          if (response.is_premium) {
            setCurrentPlan('premium');
            console.log('Upgrade: User is premium, updated status');
          } else {
            setCurrentPlan('free');
            console.log('Upgrade: User is free, updated status');
          }
        } catch (error) {
          console.error('Upgrade: Error updating premium status:', error);
          // エラーの場合は現在のユーザー情報を使用
          setCurrentPlan('free');
        }
      }
    };

    if (!authLoading && isAuthenticated && user) {
      updateUserPremiumStatus();
    }
  }, [user, isAuthenticated, authLoading]);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: t('upgrade.planFree'),
      price: 0,
      period: t('upgrade.forever'),
      description: t('upgrade.freeDesc'),
      features: [
        t('upgrade.feature.deepseekModel'),
        t('upgrade.feature.memories10'),
        t('upgrade.feature.friends5'),
        t('upgrade.feature.basicVoice'),
        t('upgrade.feature.communitySupport')
      ],
      icon: Zap,
      color: 'gray'
    },
    {
      id: 'premium',
      name: t('upgrade.planPremium'),
      price: billingPeriod === 'monthly' ? 9.99 : 99.99,
      period: billingPeriod === 'monthly' ? t('upgrade.perMonth') : t('upgrade.perYear'),
      description: t('upgrade.premiumDesc'),
      features: [
        t('upgrade.feature.deepseekChatgpt'),
        t('upgrade.feature.unlimitedMemories'),
        t('upgrade.feature.unlimitedFriends'),
        t('upgrade.feature.advancedVoice'),
        t('upgrade.feature.prioritySupport'),
        t('upgrade.feature.customAI')
      ],
      icon: Star,
      color: 'blue',
      popular: true,
      priceId: billingPeriod === 'monthly' ? 'price_1RcGFmFNJJd1bDQJvBWFPxpL' : 'price_1RcGFmFNJJd1bDQJfTlirDZ8' // TODO: Stripeダッシュボードで取得した実際のPrice IDに置き換えてください
    },
    {
      id: 'enterprise',
      name: t('upgrade.planEnterprise'),
      price: billingPeriod === 'monthly' ? 29.99 : 299.99,
      period: billingPeriod === 'monthly' ? t('upgrade.perMonth') : t('upgrade.perYear'),
      description: t('upgrade.enterpriseDesc'),
      features: [
        t('upgrade.feature.allModels'),
        t('upgrade.feature.unlimitedEverything'),
        t('upgrade.feature.teamManagement'),
        t('upgrade.feature.advancedSecurity'),
        t('upgrade.feature.multiLanguage'),
        t('upgrade.feature.apiAccess')
      ],
      icon: Crown,
      color: 'purple',
      priceId: billingPeriod === 'monthly' ? 'price_1RcGFmFNJJd1bDQJnsT9OBWS' : 'price_1RcGFnFNJJd1bDQJy9Qy59Zo' // TODO: Stripeダッシュボードで取得した実際のPrice IDに置き換えてください
    }
  ];

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user) return;
    
    if (!plan.priceId) {
      alert('このプランは現在利用できません');
      return;
    }

    // プレミアム会員の場合は処理をスキップ
    if (currentPlan === 'premium' || currentPlan === 'enterprise') {
      alert('既にプレミアム会員です。ダッシュボードに戻ります。');
      window.location.href = '/dashboard';
      return;
    }

    setIsLoading(plan.id);
    try {
      // priceIdの存在チェック済みなので型アサーションを使用
      const response = await paymentAPI.createCheckoutSession(user.id, plan.priceId as string);
      
      // レスポンスの型をチェック
      if (response && 'url' in response) {
        // 通常の支払いフロー
        window.location.href = response.url;
      } else if (response && 'error' in response) {
        // 既にプレミアム会員の場合の処理
        alert(response.message || '既にプレミアム会員です');
        if (response.redirect_url) {
          window.location.href = response.redirect_url;
        }
      } else {
        // 予期しないレスポンス形式
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      
      // エラーメッセージを表示
      if (error.message) {
        alert(error.message);
      } else {
        alert('Failed to start upgrade process. Please try again.');
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('upgrade.title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('upgrade.subtitle')}
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                {t('upgrade.currentPlan')}: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </h3>
              <p className="text-blue-700 text-sm">
                {currentPlan === 'free' 
                  ? t('upgrade.unlockPremium')
                  : currentPlan === 'premium' || currentPlan === 'enterprise'
                  ? t('upgrade.alreadyPremium')
                  : t('upgrade.thankYou')
                }
              </p>
            </div>
          </div>
          {(currentPlan === 'premium' || currentPlan === 'enterprise') && (
            <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              {t('upgrade.active')}
            </span>
          )}
          {currentPlan === 'free' && (
            <span className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              {t('upgrade.free')}
            </span>
          )}
        </div>
      </div>

      {/* Premium User Message */}
      {(currentPlan === 'premium' || currentPlan === 'enterprise') && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                {t('upgrade.premiumAccessActive')}
              </h3>
              <p className="text-green-700 text-sm mt-1">
                {t('upgrade.enjoyFeatures')}
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              {t('upgrade.goToDashboard')}
            </button>
            <button
              onClick={() => window.location.href = '/memory'}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              {t('upgrade.tryPremiumFeatures')}
            </button>
          </div>
        </div>
      )}

      {/* User Information */}
      {user && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{t('upgrade.loggedInAs')}</p>
              <p className="text-sm text-gray-500">{user.id || 'Unknown'}</p>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">{t('upgrade.paymentInfo')}</p>
                <p className="text-xs text-gray-500">
                  {t('upgrade.stripeSecure')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('upgrade.monthly')}
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('upgrade.yearly')}
            <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
              {t('upgrade.savePercent')}
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-200 hover:shadow-xl ${
              plan.popular
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('upgrade.mostPopular')}</span>
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-${plan.color}-100 flex items-center justify-center`}>
                <plan.icon className={`w-8 h-8 text-${plan.color}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600 ml-1">{plan.period}</span>
              </div>
              {billingPeriod === 'yearly' && plan.id !== 'free' && (
                <p className="text-green-600 text-sm mt-2">
                  Save ${(plan.price * 12 * 0.17).toFixed(0)} per year
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={
                isLoading === plan.id || 
                currentPlan === plan.id || 
                (currentPlan === 'enterprise' && plan.id !== 'enterprise') ||
                plan.id === 'free' ||
                currentPlan === 'premium' ||
                currentPlan === 'enterprise'
              }
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                currentPlan === plan.id || currentPlan === 'premium' || currentPlan === 'enterprise'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : plan.id === 'free'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isLoading === plan.id ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('upgrade.upgrading')}</span>
                </>
              ) : currentPlan === plan.id ? (
                <span>{t('upgrade.currentPlanBadge')}</span>
              ) : plan.id === 'free' ? (
                <span>{t('upgrade.currentPlanBadge')}</span>
              ) : currentPlan === 'premium' || currentPlan === 'enterprise' ? (
                <span>{t('upgrade.alreadyPremium')}</span>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>{t('upgrade.choosePlan')}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {t('upgrade.featureComparison')}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-medium text-gray-900">{t('upgrade.feature')}</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">{t('upgrade.planFree')}</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">{t('upgrade.planPremium')}</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">{t('upgrade.planEnterprise')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { feature: t('upgrade.featureAIModels'), free: 'DeepSeek', premium: 'DeepSeek + ChatGPT', enterprise: t('upgrade.feature.allModels') },
                { feature: t('upgrade.featureMemories'), free: t('upgrade.feature.memories10'), premium: t('upgrade.feature.unlimitedMemories'), enterprise: t('upgrade.feature.unlimitedMemories') },
                { feature: t('upgrade.featureFriends'), free: t('upgrade.feature.friends5'), premium: t('upgrade.feature.unlimitedFriends'), enterprise: t('upgrade.feature.unlimitedFriends') },
                { feature: t('upgrade.feature.basicVoice'), free: t('upgrade.feature.basicVoice'), premium: t('upgrade.feature.advancedVoice'), enterprise: t('upgrade.feature.advancedVoice') },
                { feature: t('upgrade.featureSupport'), free: t('upgrade.standard'), premium: t('upgrade.priority'), enterprise: t('upgrade.dedicated') },
                { feature: t('upgrade.featureAnalytics'), free: '❌', premium: '✅', enterprise: `✅ ${t('upgrade.advanced')}` },
                { feature: t('upgrade.featureAPIAccess'), free: '❌', premium: '❌', enterprise: '✅' },
                { feature: t('upgrade.featureTeam'), free: '❌', premium: '❌', enterprise: '✅' }
              ].map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">{row.feature}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{row.free}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{row.premium}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              question: 'Can I change my plan anytime?',
              answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards, PayPal, and bank transfers through our secure payment processor Stripe.'
            },
            {
              question: 'Is there a free trial?',
              answer: 'Our Free plan gives you access to core features. You can upgrade anytime to access premium AI models and features.'
            },
            {
              question: 'Do you offer refunds?',
              answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.'
            }
          ].map((faq, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold text-gray-900">{faq.question}</h3>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Secure Payment Processing</h3>
            <p className="text-green-800 text-sm mt-1">
              All payments are processed securely through Stripe. We never store your payment information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;