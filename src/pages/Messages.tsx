import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Trash2, Mic, User, Calendar } from 'lucide-react';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Friend | null>(null);
  const [messageType, setMessageType] = useState<'voice' | 'letter'>('letter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      
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
      setError('データの読み込みに失敗しました。');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMessage = async () => {
    if (!user || !selectedRecipient || !newMessageText.trim()) {
      setError('宛先とメッセージ内容を入力してください。');
      return;
    }

    if (newMessageText.length > 500) {
      setError('メッセージは500文字以内で入力してください。');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await messageAPI.sendLetter(selectedRecipient.user_id, newMessageText.trim(), 'web');
      
      setSuccess('メッセージを送信しました。');
      setNewMessageText('');
      setSelectedRecipient(null);
      setShowAddModal(false);
      
      // メッセージリストを再読み込み
      await loadData();
      
    } catch (error) {
      console.error('Error creating message:', error);
      setError('メッセージの送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('このメッセージを削除しますか？')) return;

    try {
      await messageAPI.delete(messageId);
      setSuccess('メッセージを削除しました。');
      
      // メッセージリストを再読み込み
      await loadData();
      
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('メッセージの削除に失敗しました。');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}分前`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}時間前`;
    } else if (diffInHours < 168) { // 1週間
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric'
      });
    }
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">メッセージ・お手紙</h1>
          <p className="text-gray-600 mt-2">
            友達とのメッセージを管理します。
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {messages.length} 件のメッセージ
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>新規メッセージ</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">⚠️</div>
          <div>
            <h3 className="font-medium text-red-900">エラー</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5">✅</div>
          <div>
            <h3 className="font-medium text-green-900">成功</h3>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="メッセージを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {messages.length === 0 ? 'メッセージがありません' : '検索条件に一致するメッセージがありません'}
            </h3>
            <p className="text-gray-600 mb-6">
              {messages.length === 0 
                ? '最初のメッセージを送信して、友達とコミュニケーションを始めましょう。'
                : '検索条件を調整してください。'
              }
            </p>
            {messages.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                最初のメッセージを送信
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {/* Message Type Icon */}
                      {message.message_type === 'letter' ? (
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Mic className="w-5 h-5 text-blue-600" />
                      )}
                      
                      {/* Sender Name */}
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {message.sender_name || '不明な送信者'}
                        </span>
                      </div>
                      
                      {/* Source Badge */}
                      {message.source && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          message.source === 'voice' 
                            ? 'bg-purple-100 text-purple-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {message.source === 'voice' ? '🎤 音声' : '💻 Web'}
                        </span>
                      )}
                      
                      {/* Read/Unread Status */}
                      <div className={`w-2 h-2 rounded-full ${
                        message.status === "read" ? 'bg-green-500' : 'bg-red-500'
                      }`} title={message.status === "read" ? "既読" : "未読"}></div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="mb-3">
                      {message.message_type === 'letter' ? (
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                          {message.transcribed_text}
                        </p>
                      ) : (
                        <p className="text-gray-700 italic">
                          🎵 音声メッセージ
                        </p>
                      )}
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
                      title="削除"
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

      {/* Add Message Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">新規メッセージ</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Message Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージタイプ
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="letter"
                      checked={messageType === 'letter'}
                      onChange={(e) => setMessageType(e.target.value as 'letter')}
                      className="mr-2"
                    />
                    <MessageSquare className="w-4 h-4 mr-1" />
                    お手紙
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="voice"
                      checked={messageType === 'voice'}
                      onChange={(e) => setMessageType(e.target.value as 'voice')}
                      className="mr-2"
                    />
                    <Mic className="w-4 h-4 mr-1" />
                    音声
                  </label>
                </div>
              </div>

              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  宛先
                </label>
                <select
                  value={selectedRecipient?.user_id || ''}
                  onChange={(e) => {
                    const friend = friends.find(f => f.user_id === e.target.value);
                    setSelectedRecipient(friend || null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">宛先を選択してください</option>
                  {friends.map((friend) => (
                    <option key={friend.user_id} value={friend.user_id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Content */}
              {messageType === 'letter' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メッセージ内容
                  </label>
                  <textarea
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="メッセージを入力してください..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {newMessageText.length}/500文字
                  </div>
                </div>
              )}

              {/* Voice Message Note */}
              {messageType === 'voice' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">音声メッセージ</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    音声メッセージは端末から送信してください。
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateMessage}
                  disabled={isSubmitting || !selectedRecipient || (messageType === 'letter' && !newMessageText.trim())}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>送信中...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>送信</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;