import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Trash2, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messageAPI, friendAPI } from '../services/api';

interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  file_url: string;
  status?: string;
  transcribed_text?: string;
  message_type?: string;  // "voice" or "letter"
  source?: string;        // "voice" or "web"
  created_at: string;
  sender_name?: string;   // 送信者名
}

interface Friend {
  user_id: string;
  name: string;
  introduction?: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // 友達リストを取得
      const friendsList = await friendAPI.list(user.id);
      setFriends(friendsList || []);
      
      // 全友達からのメッセージを取得
      const allMessages: Message[] = [];
      for (const friend of friendsList || []) {
        try {
          const response = await messageAPI.getList(friend.user_id);
          if (response.messages) {
            const friendMessages = response.messages.map((msg: any) => ({
              ...msg,
              sender_name: friend.name
            }));
            allMessages.push(...friendMessages);
          }
        } catch (error) {
          console.error(`Failed to load messages from ${friend.name}:`, error);
        }
      }
      
      // 作成日時でソート（新しい順）
      allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMessages(allMessages);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.recipient || !formData.message.trim()) {
      return;
    }

    try {
      await messageAPI.sendLetter(formData.recipient, formData.message.trim(), 'web');
      
      setFormData({
        recipient: '',
        message: ''
      });
      setShowCreateForm(false);
      
      // メッセージリストを再読み込み
      await loadData();
      
    } catch (error) {
      console.error('Error creating message:', error);
      alert('メッセージの送信に失敗しました。');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('このメッセージを削除しますか？')) return;

    try {
      console.log('Deleting message:', messageId);
      
      // メッセージを取得して送信者かどうか確認
      const message = messages.find(msg => msg.id === messageId);
      if (!message) {
        alert('メッセージが見つかりません。');
        return;
      }
      
      console.log('Message details:', {
        id: message.id,
        from_user_id: message.from_user_id,
        to_user_id: message.to_user_id,
        current_user_id: user?.id
      });
      
      // 送信者か受信者かをチェック
      const isSender = message.from_user_id === user?.id;
      const isReceiver = message.to_user_id === user?.id;
      
      console.log('Permission check:', { isSender, isReceiver });
      
      if (!isSender && !isReceiver) {
        alert('このメッセージを削除する権限がありません。');
        return;
      }
      
      const response = await messageAPI.delete(messageId);
      console.log('Delete response:', response);
      
      // メッセージリストから即座に削除
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      
      alert('メッセージを削除しました。');
      
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(`メッセージの削除に失敗しました: ${error.message || error}`);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}年${month}月${day}日(${dayOfWeek})　${hours}:${minutes}`;
  };

  // 検索フィルター
  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.sender_name?.toLowerCase().includes(query) ||
      message.transcribed_text?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">友達とのメッセージを管理します</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Message</span>
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient
                </label>
                <select
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select recipient</option>
                  {friends.map((friend) => (
                    <option key={friend.user_id} value={friend.user_id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter message content..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {messages.length === 0 ? 'No messages yet' : 'No messages match your search'}
              </h3>
              <p className="text-gray-600 mb-6">
                {messages.length === 0 
                  ? 'Send your first message to start communicating with friends.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
              {messages.length === 0 && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send First Message
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        {/* Sender Name */}
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {message.sender_name || 'Unknown sender'}
                          </span>
                        </div>
                        
                        {/* Source Badge */}
                        {message.source && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            message.source === 'voice' 
                              ? 'bg-purple-100 text-purple-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {message.source === 'voice' ? '🎤 Voice' : '💻 Web'}
                          </span>
                        )}
                        
                        {/* Read/Unread Status */}
                        <div className={`w-2 h-2 rounded-full ${
                          message.status === "read" ? 'bg-green-500' : 'bg-red-500'
                        }`} title={message.status === "read" ? "Read" : "Unread"}></div>
                      </div>
                      
                      {/* Message Content */}
                      <div className="mb-3">
                        <p className="text-gray-900">
                          {message.transcribed_text || 'No message content'}
                        </p>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatTime(message.created_at)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;