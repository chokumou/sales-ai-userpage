import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Play, Pause, Trash2, Users, MessageCircle, Volume2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { friendAPI } from '../services/api';
import AudioRecorder from '../components/Audio/AudioRecorder';

interface Friend {
  id: string;
  name: string;
  introduction: string;
  status: string;
}

interface VoiceMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  audio_url: string;
  created_at: string;
  is_read: boolean;
  duration?: number; // 音声の長さ（秒）
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages();
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const friendData = await friendAPI.list(user.id);
      setFriends((friendData?.friends || []) as Friend[]);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedFriend || !user) return;

    try {
      // TODO: 実際のAPIを実装
      // const response = await messageAPI.getMessages(user.id, selectedFriend.id);
      // setMessages(response.messages);
      
      // モックデータ（相手からのメッセージのみ、5件まで）
      const mockMessages: VoiceMessage[] = [
        {
          id: '1',
          sender_id: selectedFriend.id,
          receiver_id: user.id,
          audio_url: 'https://example.com/audio1.wav',
          created_at: new Date(Date.now() - 300000).toISOString(), // 5分前
          is_read: true,
          duration: 15 // 15秒
        },
        {
          id: '2',
          sender_id: selectedFriend.id,
          receiver_id: user.id,
          audio_url: 'https://example.com/audio2.wav',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1日前
          is_read: false,
          duration: 28 // 28秒
        },
        {
          id: '3',
          sender_id: selectedFriend.id,
          receiver_id: user.id,
          audio_url: 'https://example.com/audio3.wav',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2日前
          is_read: true,
          duration: 8 // 8秒
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  const handleVoiceRecord = async (audioBlob: Blob, duration: number) => {
    if (!selectedFriend || !user) return;

    // 5件制限チェック
    if (messages.length >= 5) {
      alert('メッセージは5件まで保存できます。古いメッセージを削除してから送信してください。');
      return;
    }

    try {
      setIsSending(true);
      
      // TODO: 実際のAPIを実装
      // const formData = new FormData();
      // formData.append('audio', audioBlob, 'message.wav');
      // formData.append('sender_id', user.id);
      // formData.append('receiver_id', selectedFriend.id);
      // await messageAPI.sendVoiceMessage(formData);

      // 自分のメッセージは送信のみで、保存しない
      console.log('音声メッセージを送信しました');
      
      // 送信完了の通知
      alert('音声メッセージを送信しました');
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('音声メッセージの送信に失敗しました。');
    } finally {
      setIsSending(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null);
      return;
    }

    setPlayingAudio(audioUrl);
    const audio = new Audio(audioUrl);
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => {
      setPlayingAudio(null);
      alert('音声の再生に失敗しました。');
    };
    audio.play();
  };

  const deleteMessage = async (messageId: string) => {
    try {
      // TODO: 実際のAPIを実装
      // await messageAPI.deleteMessage(messageId);
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('メッセージの削除に失敗しました。');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    // 日付部分
    const dateStr = date.toLocaleDateString('ja-JP', { 
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    }).replace(/\//g, '/');
    
    // 時間部分
    let timeStr = '';
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      timeStr = `${diffInMinutes}分前`;
    } else if (diffInHours < 24) {
      timeStr = `${Math.floor(diffInHours)}時間前`;
    } else if (diffInDays < 7) {
      timeStr = `${diffInDays}日前`;
    } else {
      timeStr = date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric'
      });
    }
    
    return { date: dateStr, time: timeStr };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-900">音声メッセージ</h1>
        <p className="text-sm text-gray-500 mt-1">
          友達との音声メッセージ（5件まで保存）
        </p>
      </div>

      <div className="flex-1 flex">
        {/* 友達リスト */}
        <div className="w-80 bg-gray-50 border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">友達</h2>
            {friends.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                友達がいません
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleFriendSelect(friend)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedFriend?.id === friend.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{friend.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{friend.introduction}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              {/* 選択された友達のヘッダー */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedFriend.name}</h3>
                    <p className="text-sm text-gray-500">{selectedFriend.introduction}</p>
                  </div>
                </div>
              </div>

              {/* メッセージリスト */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    まだメッセージがありません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 5件制限の説明 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-800">
                          最大5件までメッセージを保存できます
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        5件を超えると古いメッセージから上書きされます（1メッセージ最大30秒）
                      </p>
                    </div>

                    {/* メッセージテーブル */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700">受信メッセージ（最大5件）</h3>
                      </div>
                      
                      {/* 5つのスロット */}
                      {[0, 1, 2, 3, 4].map((slotIndex) => {
                        const message = messages[slotIndex];
                        
                        return (
                          <div
                            key={slotIndex}
                            className={`border-b border-gray-100 last:border-b-0 ${
                              message ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            {message ? (
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-4">
                                  {/* Read/Unread Status Circle */}
                                  {message.is_read ? (
                                    <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" title="既読"></div>
                                  ) : (
                                    <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" title="未読"></div>
                                  )}

                                  {/* Icon and Title */}
                                  <div className="flex items-center space-x-2">
                                    <Volume2 className="w-5 h-5 text-blue-600" />
                                    <h4 className="text-lg font-bold text-blue-600 whitespace-nowrap">
                                      メッセージ{slotIndex + 1}
                                    </h4>
                                  </div>

                                  {/* Timestamp */}
                                  <div className="text-sm text-gray-900">
                                    <div className="font-semibold">
                                      {formatTime(message.created_at).date}
                                    </div>
                                    <div className="text-gray-600">
                                      {formatTime(message.created_at).time}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Buttons */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => playAudio(message.audio_url)}
                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm bg-blue-50 px-3 py-2 rounded-lg"
                                  >
                                    {playingAudio === message.audio_url ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                    <span>再生</span>
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="text-red-500 hover:text-red-600 bg-red-50 p-2 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4">
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center text-gray-400">
                                    <p className="font-semibold">メッセージ{slotIndex + 1} (空き)</p>
                                    <p className="text-sm">ここにメッセージが届きます</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* メッセージ統計 */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          使用中: {messages.length}/5 スロット
                        </span>
                        <span className="text-gray-500">
                          残り: {5 - messages.length} スロット
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(messages.length / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 音声録音エリア */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center justify-center">
                  <AudioRecorder
                    onRecordingComplete={handleVoiceRecord}
                    isUploading={isSending}
                    maxDuration={30}
                  />
                </div>
                {isSending && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    送信中...
                  </div>
                )}
                {messages.length >= 5 && (
                  <div className="text-center text-sm text-orange-600 mt-2">
                    受信メッセージは5件までです。古いメッセージを削除してください。
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>友達を選択して音声メッセージを送信してください</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages; 