import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Sparkles, CreditCard, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { paymentAPI } from '../services/api';

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
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with AI conversations',
      features: [
        'DeepSeek AI model access',
        'Basic voice registration',
        'Up to 10 memories',
        '5 friends maximum',
        'Standard support',
        'Basic conversation history'
      ],
      icon: Star,
      color: 'gray'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingPeriod === 'monthly' ? 19.99 : 199.99,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Enhanced AI capabilities and unlimited features',
      features: [
        'All Free features',
        'ChatGPT AI model access',
        'Advanced voice profiles',
        'Unlimited memories',
        'Unlimited friends',
        'Priority support',
        'Advanced conversation analytics',
        'Custom AI personalities',
        'Voice message transcription'
      ],
      icon: Zap,
      color: 'blue',
      popular: true,
      priceId: billingPeriod === 'monthly' ? 'price_premium_monthly' : 'price_premium_yearly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingPeriod === 'monthly' ? 49.99 : 499.99,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Full access to all AI models and premium features',
      features: [
        'All Premium features',
        'Claude AI model access',
        'Team collaboration tools',
        'Advanced analytics dashboard',
        'Custom integrations',
        'Dedicated support',
        'Data export capabilities',
        'Advanced security features',
        'Multi-language support',
        'API access'
      ],
      icon: Crown,
      color: 'purple',
      priceId: billingPeriod === 'monthly' ? 'price_enterprise_monthly' : 'price_enterprise_yearly'
    }
  ];

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user || !plan.priceId) return;

    setIsLoading(plan.id);
    try {
      const response = await paymentAPI.createCheckoutSession(user.id, plan.priceId);
      window.location.href = response.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const currentPlan = user?.subscription?.plan || 'free';

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Upgrade Your AI Experience
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock advanced AI models, unlimited features, and premium support to enhance your voice conversations.
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
                Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </h3>
              <p className="text-blue-700 text-sm">
                {currentPlan === 'free' 
                  ? 'Upgrade to unlock premium features' 
                  : 'Thank you for being a premium subscriber!'
                }
              </p>
            </div>
          </div>
          {currentPlan !== 'free' && (
            <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Active
            </span>
          )}
        </div>
      </div>

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
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
              Save 17%
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
                  <span>Most Popular</span>
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
                plan.id === 'free'
              }
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                currentPlan === plan.id
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
                  <span>Processing...</span>
                </>
              ) : currentPlan === plan.id ? (
                <span>Current Plan</span>
              ) : plan.id === 'free' ? (
                <span>Current Plan</span>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Upgrade to {plan.name}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Feature Comparison
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-medium text-gray-900">Feature</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">Free</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">Premium</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { feature: 'AI Model Access', free: 'DeepSeek', premium: 'DeepSeek + ChatGPT', enterprise: 'All Models' },
                { feature: 'Memory Storage', free: '10 memories', premium: 'Unlimited', enterprise: 'Unlimited' },
                { feature: 'Friend Connections', free: '5 friends', premium: 'Unlimited', enterprise: 'Unlimited' },
                { feature: 'Voice Profiles', free: 'Basic', premium: 'Advanced', enterprise: 'Advanced' },
                { feature: 'Support Level', free: 'Standard', premium: 'Priority', enterprise: 'Dedicated' },
                { feature: 'Analytics', free: '❌', premium: '✅', enterprise: '✅ Advanced' },
                { feature: 'API Access', free: '❌', premium: '❌', enterprise: '✅' },
                { feature: 'Team Features', free: '❌', premium: '❌', enterprise: '✅' }
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