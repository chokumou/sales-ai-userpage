import React, { useState, useEffect } from 'react';
import { Receipt, Download, Calendar, CreditCard, Filter, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { paymentAPI } from '../services/api';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  description: string;
  created_at: string;
  invoice_url?: string;
  plan?: string;
  period?: string;
}

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    loadPaymentHistory();
  }, [user]);

  const loadPaymentHistory = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const paymentData = await paymentAPI.getHistory(user.id);
      setPayments(paymentData || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
      // Demo data for development
      setPayments([
        {
          id: 'pi_1234567890',
          amount: 19.99,
          currency: 'USD',
          status: 'succeeded',
          description: 'Premium Plan Subscription',
          created_at: new Date().toISOString(),
          plan: 'Premium',
          period: 'Monthly'
        },
        {
          id: 'pi_0987654321',
          amount: 199.99,
          currency: 'USD',
          status: 'succeeded',
          description: 'Premium Plan Subscription (Annual)',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          plan: 'Premium',
          period: 'Yearly'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery === '' || 
      payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || payment.status === statusFilter;
    
    const matchesDate = dateFilter === '' || (() => {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      switch (dateFilter) {
        case 'last7days':
          return paymentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'last30days':
          return paymentDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'last3months':
          return paymentDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case 'lastyear':
          return paymentDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refunded':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const downloadInvoice = (payment: PaymentRecord) => {
    if (payment.invoice_url) {
      window.open(payment.invoice_url, '_blank');
    } else {
      alert('Invoice not available for this payment');
    }
  };

  const totalSpent = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-2">
          View and manage your subscription payments and billing history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatAmount(totalSpent, 'USD')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{payments.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Plan</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {user?.subscription?.plan?.charAt(0).toUpperCase() + user?.subscription?.plan?.slice(1) || 'Free'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Time</option>
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last3months">Last 3 months</option>
              <option value="lastyear">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {payments.length === 0 ? 'No payments yet' : 'No payments match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {payments.length === 0 
                ? 'Your payment history will appear here once you make your first payment.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
            {payments.length === 0 && (
              <button
                onClick={() => window.location.href = '/upgrade'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade Your Plan
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                <div className="col-span-3">Payment</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Plan</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Payment Rows */}
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {payment.description}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            ID: {payment.id}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="font-medium text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm text-gray-900">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                    
                    <div className="col-span-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.plan || 'N/A'}
                        </p>
                        {payment.period && (
                          <p className="text-xs text-gray-500">{payment.period}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        onClick={() => downloadInvoice(payment)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Update Payment Method
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Current Subscription</h3>
            <p className="text-gray-600">
              {user?.subscription?.plan ? (
                `${user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan`
              ) : (
                'Free Plan'
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {user?.subscription?.plan && user.subscription.plan !== 'free' 
                ? 'Automatically renews monthly'
                : 'No active subscription'
              }
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Next Billing Date</h3>
            <p className="text-gray-600">
              {user?.subscription?.plan && user.subscription.plan !== 'free' 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Automatic payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;