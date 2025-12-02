import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface Customer {
  id: string;
  name?: string;
  email?: string;
  created_at: string;
  temp_id?: string;
  short_id?: string;
  expires_at?: string;
  converted_to_customer_id?: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [temporaryCustomers, setTemporaryCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'temporary'>('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      
      // 通常の顧客を取得
      const customersData = await api.get<any[]>('/api/sales/customers').catch(() => []);
      setCustomers(customersData || []);
      
      // 一時顧客を取得
      const tempCustomersData = await api.get<any[]>('/api/sales/temporary-customers').catch(() => []);
      setTemporaryCustomers(tempCustomersData || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = activeTab === 'all' 
    ? customers.filter(c => 
        !searchTerm || 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : temporaryCustomers.filter(c =>
        !searchTerm ||
        c.short_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.temp_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const openChatPage = (tempId: string) => {
    const chatUrl = `${import.meta.env.VITE_CHAT_URL || 'https://sales-ai-chat-production.up.railway.app'}?temp_id=${tempId}`;
    window.open(chatUrl, '_blank');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">顧客管理</h1>
        <p className="text-gray-600">顧客一覧と一時顧客の管理</p>
      </div>

      {/* タブ */}
      <div className="mb-4 flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          通常顧客 ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('temporary')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'temporary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          一時顧客 ({temporaryCustomers.length})
        </button>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="顧客名、メールアドレス、IDで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 顧客一覧 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          顧客が見つかりませんでした
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'all' ? '顧客情報' : '一時ID'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                {activeTab === 'temporary' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      有効期限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id || customer.temp_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {activeTab === 'all' 
                            ? customer.name || customer.email || `顧客 ${customer.id.slice(0, 8)}`
                            : `一時ID: ${customer.short_id || customer.temp_id?.slice(0, 8)}`
                          }
                        </div>
                        {activeTab === 'all' && customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                        {activeTab === 'temporary' && customer.temp_id && (
                          <div className="text-xs text-gray-500">{customer.temp_id}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(customer.created_at)}
                    </div>
                  </td>
                  {activeTab === 'temporary' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.expires_at ? formatDate(customer.expires_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {customer.temp_id && (
                          <button
                            onClick={() => openChatPage(customer.temp_id!)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            チャットを開く
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;

