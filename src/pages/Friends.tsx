import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageCircle, UserCheck, UserX, Search, Send, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { friendAPI, messageAPI } from '../services/api';

interface Friend {
  id: string;
  user_id: string;
  name: string;
  introduction: string;
  avatar?: string;
  status: 'online' | 'offline';
  has_unread_messages: boolean;
  last_message_time?: string;
}

interface FriendRequestReceived {
  id: string;
  user_id_a: string;
  user_id_b: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  from_user: {
    id: string;
    name: string;
    introduction: string;
  };
}

interface FriendRequestSent {
  id: string;
  user_id_a: string;
  user_id_b: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  to_user: {
    id: string;
    name: string;
    introduction: string;
  };
}

const Friends: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestReceived[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestSent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendId, setNewFriendId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [user]);

  type FriendRequestsResponse = {
    received_requests: FriendRequestReceived[];
    sent_requests: FriendRequestSent[];
  };

  const loadFriends = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await friendAPI.list(user.id);
      const friendsData = Array.isArray((response as any)?.friends) ? ((response as any).friends as Friend[]) : [];
      setFriends(friendsData);
      // 新APIレスポンス対応
      const requestsData = await friendAPI.testRequests(user.id) as FriendRequestsResponse;
      console.log('[DEBUG] friendAPI.testRequests() result:', requestsData);
      setReceivedRequests(Array.isArray(requestsData.received_requests) ? requestsData.received_requests : []);
      setSentRequests(Array.isArray(requestsData.sent_requests) ? requestsData.sent_requests : []);
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
      setReceivedRequests([]);
      setSentRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user || !newFriendId.trim()) return;

    try {
      console.log('=== フレンド申請デバッグ ===');
      console.log('user:', user);
      console.log('newFriendId (before cleanup):', newFriendId);
      
      // フレンドIDをクリーンアップ（余分な文字・空白・全角スペース・改行を除去、ハイフンは残す）
      const cleanFriendId = newFriendId
        .replace(/\s|\u3000/g, '') // 空白・全角スペース・改行を除去
        .replace(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/g, ''); // ハイフンは除去しない
      console.log('newFriendId (after cleanup):', cleanFriendId);
      
      if (!cleanFriendId) {
        alert('有効なフレンドIDを入力してください。');
        return;
      }

      // UUID形式のバリデーション
      if (!isValidUUID(cleanFriendId)) {
        alert('フレンドIDはUUID形式で入力してください。\n例: 5db72bb0-11da-429e-8f33-47a43917fbe6');
        return;
      }
      
      // テスト用エンドポイントを使用（認証なし）
      await friendAPI.testRequest(user.id, cleanFriendId);
      setNewFriendId('');
      setShowAddFriend(false);
      alert('Friend request sent successfully!');
      // Reload friends to show updated data
      await loadFriends();
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptFriendRequest = async (fromUserId: string) => {
    if (!user) {
      console.error('User not found');
      alert('ユーザー情報が見つかりません。ログインし直してください。');
      return;
    }

    console.log('=== フレンド承認処理デバッグ ===');
    console.log('fromUserId:', fromUserId);
    console.log('user.id:', user.id);
    console.log('user object:', user);

    // user.idが存在しない場合のフォールバック
    let currentUserId = user.id;
    
    if (!currentUserId) {
      console.log('User ID not found in user object, trying to get from JWT token');
      // JWTトークンからユーザーIDを取得
      const token = localStorage.getItem('nekota_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.user_id || payload.sub;
          console.log('User ID from JWT token:', currentUserId);
        } catch (error) {
          console.error('Failed to decode JWT token:', error);
        }
      }
    }
    
    if (!currentUserId) {
      console.error('User ID not found in user object or JWT token');
      alert('ユーザーIDが見つかりません。ログインし直してください。');
      return;
    }

    console.log('Final currentUserId:', currentUserId);

    try {
      // テスト用エンドポイントを使用（認証なし）
      await friendAPI.testAccept(fromUserId, currentUserId);
      await loadFriends();
      setReceivedRequests(prev => prev.filter(req => req.user_id_a !== fromUserId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectFriendRequest = (fromUserId: string) => {
    setReceivedRequests(prev => prev.filter(req => req.user_id_a !== fromUserId));
  };

  const handleStartConversation = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowMessaging(true);
  };

  const filteredFriends = Array.isArray(friends) ? friends.filter(friend => 
    (friend.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.introduction || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return '??';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // UUID形式のバリデーション関数
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const formatLastMessage = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
          <p className="text-gray-600 mt-2">
            Connect with others and share AI-powered voice conversations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {Array.isArray(friends) ? friends.length : 0} friends
          </span>
          <button
            onClick={() => setShowAddFriend(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Friend Requests */}
          {receivedRequests.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Friend Requests ({receivedRequests.length})
              </h2>
              <div className="space-y-4">
                {receivedRequests.map((request) => {
                  console.log('【DEBUG】フレンド申請リストのrequest:', request);
                  // from_user_idがなければ警告
                  if (!request.user_id_a) {
                    console.warn('【WARNING】request.user_id_aがundefinedです。request:', request);
                  }
                  return (
                    <div key={(request.user_id_a || 'unknown') + '-' + (request.user_id_b || 'unknown')} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {getInitials(request.from_user.name)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{request.from_user.name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-600">{request.from_user.introduction || 'No introduction'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAcceptFriendRequest(request.user_id_a)}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Accept"
                          disabled={!request.user_id_a}
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectFriendRequest(request.user_id_a)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Decline"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="bg-white rounded-xl border border-gray-200">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {Array.isArray(friends) && friends.length === 0 ? 'No friends yet' : 'No friends match your search'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {Array.isArray(friends) && friends.length === 0 
                    ? 'Start building your network by adding friends to share AI conversations.'
                    : 'Try adjusting your search terms.'
                  }
                </p>
                {Array.isArray(friends) && friends.length === 0 && (
                  <button
                    onClick={() => setShowAddFriend(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Friend
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {getInitials(friend.name)}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{friend.name || 'Unknown User'}</h3>
                            {friend.has_unread_messages && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{friend.introduction || 'No introduction'}</p>
                          {friend.last_message_time && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last message: {formatLastMessage(friend.last_message_time)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartConversation(friend)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Start conversation"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Network</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Friends</span>
                <span className="font-medium text-gray-900">{friends.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Online Now</span>
                <span className="font-medium text-green-600">
                  {friends.filter(f => f.status === 'online').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Unread Messages</span>
                <span className="font-medium text-blue-600">
                  {friends.filter(f => f.has_unread_messages).length}
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Send voice messages for richer conversations</li>
              <li>• AI can remember context across friend chats</li>
              <li>• Use voice profiles for personalized responses</li>
              <li>• Friends can share AI memories</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Friend</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Friend's User ID
                </label>
                <input
                  type="text"
                  value={newFriendId}
                  onChange={(e) => setNewFriendId(e.target.value)}
                  placeholder="例: 5db72bb0-11da-429e-8f33-47a43917fbe6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  UUID形式で入力してください（例: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddFriend(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFriendRequest}
                disabled={!newFriendId.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Messaging Modal */}
      {showMessaging && selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {getInitials(selectedFriend.name)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedFriend.name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-600">{selectedFriend.status}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMessaging(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UserX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Voice messaging feature coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  You'll be able to send and receive AI-powered voice messages.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
                <button className="p-3 bg-gray-300 text-gray-500 rounded-full cursor-not-allowed">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends;