import React, { useState, useEffect } from 'react';
import { Receipt, Download, Calendar, CreditCard, Filter, Search, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pageTokens, setPageTokens] = useState<Record<number, string | undefined>>({ 1: undefined });

  useEffect(() => {
    loadPaymentHistory(currentPage);
  }, [user, currentPage]);

  const loadPaymentHistory = async (page: number) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const starting_after = pageTokens[page];
      const response = (await paymentAPI.getHistory(user.id, { limit: 10, starting_after })) as any;
      
      setPayments(response?.payments || []);
      setHasMore(response?.has_more || false);

      if (response?.has_more && response?.payments.length > 0) {
        const lastPaymentId = response.payments[response.payments.length - 1].id;
        setPageTokens(prev => ({ ...prev, [page + 1]: lastPaymentId }));
      }

    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
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
      alert(t('payment.invoiceNotAvailable'));
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
        <h1 className="text-3xl font-bold text-gray-900">{t('payment.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('payment.description')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('payment.totalSpent')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('payment.totalPayments')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('payment.currentPlan')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {user && user.premium_until ? t('upgrade.planPremium') : t('upgrade.planFree')}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('payment.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-48 border rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('payment.allStatuses')}</option>
              <option value="succeeded">{t('payment.succeeded')}</option>
              <option value="pending">{t('payment.pending')}</option>
              <option value="failed">{t('payment.failed')}</option>
              <option value="refunded">{t('payment.refunded')}</option>
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-48 border rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('payment.allTime')}</option>
              <option value="last7days">{t('payment.last7days')}</option>
              <option value="last30days">{t('payment.last30days')}</option>
              <option value="last3months">{t('payment.last3months')}</option>
              <option value="lastyear">{t('payment.lastYear')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payment.payment')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payment.amount')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payment.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payment.date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payment.plan')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payment.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-indigo-50">
                        <Receipt className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                        <div className="text-sm text-gray-500">ID: {payment.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatAmount(payment.amount, payment.currency)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(payment.status)}
                        {t(`payment.${payment.status}`)}
                      </div>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(payment.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.plan}</div>
                    <div className="text-sm text-gray-500">{payment.period}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => downloadInvoice(payment)}
                      className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                      disabled={!payment.invoice_url}
                      title={payment.invoice_url ? t('payment.download') : t('payment.invoiceNotAvailable')}
                    >
                      <Download className="w-4 h-4" />
                      {t('payment.invoice')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{payments.length === 0 ? t('payment.noPayments') : t('payment.noMatch')}</p>
          </div>
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
              {user && user.premium_until ? 'Premium Plan' : 'Free Plan'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {user && user.premium_until
                ? 'Automatically renews monthly'
                : 'No active subscription'
              }
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Next Billing Date</h3>
            <p className="text-gray-600">
              {user && user.premium_until
                ? new Date(user.premium_until).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-6 pb-4">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('payment.previous')}
          </button>
          <button
            onClick={handleNextPage}
            disabled={!hasMore}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {t('payment.next')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;