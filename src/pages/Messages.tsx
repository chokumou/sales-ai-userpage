import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messageAPI, friendAPI } from '../services/api';
import { Volume2, Play, Trash2, Pause, MessageSquare, Mic } from 'lucide-react';
import AudioRecorder from '../components/Audio/AudioRecorder';

interface VoiceMessage {
  id: string;
  from_user_id: string;
  to_user_id: string;
  file_url: string;
  status?: string;
  transcribed_text?: string;
  message_type?: string;  // "voice" or "letter"
  source?: string;        // "voice" or "web"
  created_at: string;
}

interface Friend {
  user_id: string;
  name: string;
  introduction?: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [letterText, setLetterText] = useState('');
  const [activeTab, setActiveTab] = useState<'voice' | 'letter'>('voice');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 友達リストを取得
  useEffect(() => {
    const loadFriends = async () => {
      if (!user) return;
      
      try {
        console.log('友達リスト取得開始:', { userId: user.id });
        
        // APIサービスを使用して友達リストを取得
        const response = await friendAPI.list(user.id);
        console.log('友達リスト取得結果:', response);
        console.log('友達データの詳細:', response.friends);
        
        // 各友達のデータ構造を確認
        if (response.friends) {
          response.friends.forEach((friend, index) => {
            console.log(`友達${index + 1}:`, {
              user_id: friend.user_id,
              name: friend.name,
              introduction: friend.introduction,
              hasUserId: !!friend.user_id,
              hasName: !!friend.name
            });
          });
        }
        
        setFriends(Array.isArray(response.friends) ? (response.friends as Friend[]) : []);
      } catch (error) {
        console.error('友達リストの取得に失敗:', error);
        setFriends([]);
      }
    };

    loadFriends();
  }, [user]);

  // メッセージを取得
  const loadMessages = async () => {
    if (!selectedFriend || !user) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await messageAPI.getList(selectedFriend.user_id);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('メッセージの取得に失敗:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 友達が選択されたときにメッセージを読み込み
  useEffect(() => {
    console.log('useEffect - selectedFriend:', selectedFriend);
    console.log('useEffect - user:', user);
    loadMessages();
  }, [selectedFriend?.user_id, user?.id]);

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

  // テキストレター送信
  const handleSendLetter = async () => {
    if (!selectedFriend || !user) {
      alert('友達を選択してください。');
      return;
    }

    if (!letterText.trim()) {
      alert('メッセージ内容を入力してください。');
      return;
    }

    try {
      setIsSending(true);
      await messageAPI.sendLetter(selectedFriend.user_id, letterText.trim(), 'web');
      
      // メッセージリストを更新
      loadMessages();
      setLetterText('');
      alert('お手紙を送信しました');
    } catch (error) {
      console.error('お手紙の送信に失敗:', error);
      alert('お手紙の送信に失敗しました。');
    } finally {
      setIsSending(false);
    }
  };

  // AudioRecorderからの録音完了コールバック
  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    console.log('録音完了 - selectedFriend:', selectedFriend);
    console.log('録音完了 - user:', user);
    
    if (!selectedFriend || !user) {
      console.log('友達またはユーザーが選択されていません');
      alert('友達を選択してください。');
      return;
    }

    try {
      setIsSending(true);
      
      // ファイルサイズチェック（30秒制限を想定して500KB制限）
      if (audioBlob.size > 500 * 1024) {
        alert('音声ファイルが大きすぎます。30秒以内で録音してください。');
        return;
      }

      console.log('メッセージ送信開始 - 友達ID:', selectedFriend.user_id);
      const file = new File([audioBlob], 'message.wav', { type: 'audio/wav' });
      await messageAPI.send(selectedFriend.user_id, file);
      
      // メッセージリストを更新
      loadMessages();
      alert('メッセージを送信しました');
    } catch (error) {
      console.error('メッセージの送信に失敗:', error);
      alert('メッセージの送信に失敗しました。');
    } finally {
      setIsSending(false);
    }
  };

  // AudioRecorderからのファイルアップロードコールバック
  const handleFileUpload = async (file: File) => {
    if (!selectedFriend || !user) {
      alert('友達を選択してください。');
      return;
    }

    try {
      setIsSending(true);
      
      // ファイルサイズチェック
      if (file.size > 500 * 1024) {
        alert('音声ファイルが大きすぎます。30秒以内の音声を選択してください。');
        return;
      }

      await messageAPI.send(selectedFriend.user_id, file);
      
      // メッセージリストを更新
      loadMessages();
      alert('メッセージを送信しました');
    } catch (error) {
      console.error('メッセージの送信に失敗:', error);
      alert('メッセージの送信に失敗しました。');
    } finally {
      setIsSending(false);
    }
  };

  const playMessage = async (message: VoiceMessage) => {
    try {
      // 既読にする（statusが"sent"の場合のみ）
      if (message.status === "sent") {
        await messageAPI.markAsRead(message.id);
        // メッセージリストを更新して既読状態を反映
        loadMessages();
      }

      // レターの場合は音声再生をスキップ
      if (message.message_type === 'letter') {
        return;
      }

      // 音声を再生
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(message.file_url);
      audioRef.current = audio;
      
      audio.onplay = () => setPlayingAudio(message.id);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setPlayingAudio(null);
        alert('音声の再生に失敗しました。');
      };
      
      await audio.play();
    } catch (error) {
      console.error('音声の再生に失敗:', error);
      alert('音声の再生に失敗しました。');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('このメッセージを削除しますか？')) return;

    try {
      await messageAPI.delete(messageId);
      // メッセージリストを更新
      loadMessages();
      alert('メッセージを削除しました');
    } catch (error) {
      console.error('メッセージの削除に失敗:', error);
      alert('メッセージの削除に失敗しました。');
    }
  };

  // 5つのスロットを生成（最新のメッセージから順に表示）
  const slots = Array.from({ length: 5 }, (_, index) => {
    const message = messages[index] || null;
    return { slotIndex: index, message };
  });

  // 友達を選択
  const handleFriendSelect = (friend: Friend) => {
    console.log('友達選択:', friend);
    console.log('友達選択 - id:', friend.user_id);
    console.log('友達選択 - name:', friend.name);
    console.log('友達選択 - 全体データ:', JSON.stringify(friend, null, 2));
    setSelectedFriend(friend);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">メッセージ・お手紙</h1>
      
      {/* デバッグ情報 */}
      <div className="mb-4 p-2 bg-yellow-100 rounded text-sm">
        <p>デバッグ情報:</p>
        <p>友達数: {friends.length}</p>
        <p>選択された友達: {selectedFriend ? `${selectedFriend.name} (${selectedFriend.user_id})` : 'なし'}</p>
        <p>録音エリア表示条件: {selectedFriend ? 'true' : 'false'}</p>
      </div>
      
      {/* 友達選択 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">友達を選択</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {friends.map((friend) => (
            <button
              key={friend.user_id}
              onClick={() => handleFriendSelect(friend)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedFriend?.user_id === friend.user_id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{friend.name}</div>
              {friend.introduction && (
                <div className="text-sm text-gray-600 mt-1">{friend.introduction}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* メッセージエリア */}
      {selectedFriend && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedFriend.name}からのメッセージ
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {slots.map(({ slotIndex, message }) => (
                <div
                  key={slotIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  {message ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Read/Unread Status Circle */}
                        {message.status === "read" ? (
                          <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" title="既読"></div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" title="未読"></div>
                        )}

                        {/* Icon and Title */}
                        <div className="flex items-center space-x-2">
                          {message.message_type === 'letter' ? (
                            <MessageSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-blue-600" />
                          )}
                          <h4 className={`text-lg font-bold ${message.message_type === 'letter' ? 'text-green-600' : 'text-blue-600'}`}>
                            {message.message_type === 'letter' ? 'お手紙' : 'メッセージ'}{slotIndex + 1}
                          </h4>
                          {/* 登録元表示 */}
                          {message.source && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              message.source === 'voice' 
                                ? 'bg-purple-100 text-purple-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {message.source === 'voice' ? '🎤 音声' : '💻 Web'}
                            </span>
                          )}
                        </div>
                        
                        {/* Date and Time */}
                        <div className="text-sm text-gray-900">
                          <div className="font-semibold">
                            {formatTime(message.created_at).date}
                          </div>
                          <div className="text-gray-600">
                            {formatTime(message.created_at).time}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {/* レターの場合は内容表示、音声の場合は再生ボタン */}
                        {message.message_type === 'letter' ? (
                          <div className="flex-1 mr-4">
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
                              {message.transcribed_text}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => playMessage(message)}
                            disabled={playingAudio === message.id}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            {playingAudio === message.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            <span>再生</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>削除</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-5 h-5 text-gray-400" />
                          <h4 className="text-lg font-bold text-gray-400">
                            メッセージ{slotIndex + 1}
                          </h4>
                        </div>
                        <div className="text-sm text-gray-400">
                          <div className="font-semibold">---</div>
                          <div>---</div>
                        </div>
                      </div>
                      <div className="text-gray-400">空きスロット</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 送信エリア */}
          {selectedFriend && (
            <div className="bg-gray-50 rounded-lg p-4">
              {/* タブ切り替え */}
              <div className="flex mb-4 border-b">
                <button
                  onClick={() => setActiveTab('voice')}
                  className={`flex items-center space-x-2 px-4 py-2 font-medium ${
                    activeTab === 'voice'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>音声メッセージ</span>
                </button>
                <button
                  onClick={() => setActiveTab('letter')}
                  className={`flex items-center space-x-2 px-4 py-2 font-medium ${
                    activeTab === 'letter'
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>お手紙</span>
                </button>
              </div>

              {/* 音声録音エリア */}
              {activeTab === 'voice' && (
                <div>
                  <h4 className="text-md font-semibold mb-3">新しい音声メッセージを録音</h4>
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    onUpload={handleFileUpload}
                    isUploading={isSending}
                    maxDuration={30} // 30秒制限
                    acceptedFormats={['.wav', '.mp3', '.m4a', '.ogg']}
                  />
                </div>
              )}

              {/* テキストレター送信エリア */}
              {activeTab === 'letter' && (
                <div>
                  <h4 className="text-md font-semibold mb-3">新しいお手紙を書く</h4>
                  <div className="space-y-3">
                    <textarea
                      value={letterText}
                      onChange={(e) => setLetterText(e.target.value)}
                      placeholder="メッセージを入力してください..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {letterText.length}/500文字
                      </span>
                      <button
                        onClick={handleSendLetter}
                        disabled={isSending || !letterText.trim()}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>送信中...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>お手紙を送る</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedFriend && friends.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">友達を選択してメッセージを確認してください</p>
        </div>
      )}

      {friends.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">友達がいません。友達を追加してメッセージを送受信できます。</p>
        </div>
      )}
    </div>
  );
};

export default Messages; 