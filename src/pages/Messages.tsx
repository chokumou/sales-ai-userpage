import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Search, Trash2, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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

type MessageDirection = 'received' | 'sent';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    message: ''
  });
  const [messageCount, setMessageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [friendOffsets, setFriendOffsets] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState<MessageDirection>('received');
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, direction]);

  // 無限スクロール用のIntersection Observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const handleIntersect = async (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isLoadingMore && messageCount < totalCount) {
        loadMoreMessages();
      }
    };

    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [isLoadingMore, messageCount, totalCount]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // 友達リストを取得
      const friendsList = await friendAPI.list(user.id);
      setFriends(friendsList || []);
      
      // 全友達とのメッセージを取得（初期5件）
      const allMessages: Message[] = [];
      let totalMessages = 0;
      const offsets: Record<string, number> = {};
      
      for (const friend of friendsList || []) {
        try {
          const response = await messageAPI.getList(friend.user_id, 5, 0, direction);
          if (response.messages) {
            const friendMessages = response.messages.map((msg: any) => ({
              ...msg,
              sender_name: direction === 'received' 
                ? (msg.from_user_name || friend.name)
                : (msg.from_user_name || user.name || t('messages.me')),
              recipient_name: direction === 'sent' 
                ? (friendsList.find(f => f.user_id === msg.to_user_id)?.name || t('messages.unknownRecipient'))
                : undefined
            }));
            allMessages.push(...friendMessages);
            totalMessages += response.total_count || 0;
            offsets[friend.user_id] = response.messages.length; // 現在のオフセットを保存
          }
        } catch (error) {
          console.error(`Failed to load messages from ${friend.name}:`, error);
        }
      }
      
      // 作成日時でソート（新しい順）
      allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMessages(allMessages);
      setMessageCount(allMessages.length);
      setTotalCount(totalMessages);
      setFriendOffsets(offsets);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!user || isLoadingMore || messageCount >= totalCount) return;

    try {
      setIsLoadingMore(true);
      
      // 各友達から追加のメッセージを取得
      const additionalMessages: Message[] = [];
      const newOffsets = { ...friendOffsets };
      
      for (const friend of friends) {
        try {
          const currentOffset = friendOffsets[friend.user_id] || 0;
          
          // オフセットを指定して追加取得
          const response = await messageAPI.getList(friend.user_id, 5, currentOffset, direction);
          
          if (response.messages) {
            const friendMessages = response.messages.map((msg: any) => ({
              ...msg,
              sender_name: direction === 'received'
                ? (msg.from_user_name || friend.name)
                : (msg.from_user_name || user.name || t('messages.me')),
              recipient_name: direction === 'sent' 
                ? (friends.find(f => f.user_id === msg.to_user_id)?.name || t('messages.unknownRecipient'))
                : undefined
            }));
            additionalMessages.push(...friendMessages);
            newOffsets[friend.user_id] = currentOffset + friendMessages.length;
          }
        } catch (error) {
          console.error(`Failed to load more messages from ${friend.name}:`, error);
        }
      }
      
      // 新しいメッセージを追加してソート（functional updateパターン）
      setMessages((prevMessages) => {
        const allMessages = [...prevMessages, ...additionalMessages];
        allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return allMessages;
      });
      setMessageCount((prev) => prev + additionalMessages.length);
      setFriendOffsets(newOffsets);
      
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('messages.title')}</h1>
                <p className="text-gray-600">{t('messages.description')}</p>
                <p className="text-sm text-gray-500">
                  {t('messages.savedCount')}: {messageCount}件（{t('messages.autoDelete')}）
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('messages.sendLetter')}</span>
            </button>
          </div>
        </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('messages.createNew')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('messages.recipient')}
                </label>
                <select
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{t('messages.selectRecipient')}</option>
                  {friends.map((friend) => (
                    <option key={friend.user_id} value={friend.user_id}>
                      {friend.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('messages.message')}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('messages.enterMessage')}
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
                  {t('messages.send')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t('messages.cancel')}
                </button>
              </div>
            </form>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0">
        <div className="flex">
          <button
            onClick={() => setDirection('received')}
            className={`flex-1 px-6 py-4 font-semibold text-base transition-all ${
              direction === 'received'
                ? 'text-blue-600 bg-blue-50 border-b-4 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            {t('messages.received')}
          </button>
          <button
            onClick={() => setDirection('sent')}
            className={`flex-1 px-6 py-4 font-semibold text-base transition-all ${
              direction === 'sent'
                ? 'text-blue-600 bg-blue-50 border-b-4 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
            }`}
          >
            {t('messages.sent')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('messages.search')}
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
                {messages.length === 0 ? t('messages.noMessages') : t('messages.noMatch')}
              </h3>
              <p className="text-gray-600 mb-6">
                {messages.length === 0 
                  ? t('messages.sendFirst')
                  : t('messages.adjustSearch')
                }
              </p>
              {messages.length === 0 && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('messages.sendFirstButton')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          {/* Sender/Recipient Name */}
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {direction === 'received' 
                                ? (message.sender_name || t('messages.unknownSender'))
                                : (message.sender_name || t('messages.me'))
                              }
                            </span>
                            {direction === 'sent' && (
                              <span className="text-sm text-gray-500">
                                → {(message as any).recipient_name || friends.find(f => f.user_id === message.to_user_id)?.name || t('messages.unknownRecipient')}
                              </span>
                            )}
                          </div>
                          
                          {/* Source Badge */}
                          {message.source && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              message.source === 'voice' 
                                ? 'bg-purple-100 text-purple-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {message.source === 'voice' ? `🎤 ${t('messages.voice')}` : `💻 ${t('messages.web')}`}
                            </span>
                          )}
                          
                          {/* Read/Unread Status */}
                          <div className={`w-2 h-2 rounded-full ${
                            message.status === "read" ? 'bg-green-500' : 'bg-red-500'
                          }`} title={message.status === "read" ? t('messages.read') : t('messages.unread')}></div>
                        </div>
                        
                        {/* Message Content */}
                        <div className="mb-3">
                          <p className="text-gray-900">
                            {message.transcribed_text || t('messages.noContent')}
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
                          title={t('messages.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Trigger & Loading Indicator */}
              {messageCount < totalCount && (
                <div ref={observerTarget} className="p-6 text-center">
                  {isLoadingMore && (
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm">{t('messages.loading')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* All Messages Loaded */}
              {messageCount >= totalCount && messageCount > 0 && (
                <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-200">
                  {t('messages.allLoaded')}
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default Messages;