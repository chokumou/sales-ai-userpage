import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { profileAPI } from '../services/api';
import { User, Save, Edit3, Camera, Settings } from 'lucide-react';

interface ProfileData {
  name: string;
  introduction: string;
  country: string;
  avatar?: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  // 国名を日本語で表示する関数
  const getCountryName = (countryCode: string): string => {
    const countryNames: { [key: string]: string } = {
      'Japan': '日本',
      'USA': 'アメリカ',
      'UK': 'イギリス',
      'France': 'フランス',
      'Germany': 'ドイツ',
      'Australia': 'オーストラリア',
      'Canada': 'カナダ',
      'Korea': '韓国',
      'China': '中国',
      'Thailand': 'タイ',
      'Other': 'その他'
    };
    return countryNames[countryCode] || countryCode;
  };
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    introduction: '',
    country: 'Japan'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nekotaLettersEnabled, setNekotaLettersEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // まずユーザー情報から読み込み
      const currentName = user.profile?.name || user.name || '';
      const currentIntroduction = user.profile?.introduction || '';
      const currentCountry = user.profile?.country || 'Japan';
      
      setProfileData({
        name: currentName,
        introduction: currentIntroduction,
        country: currentCountry
      });
      
      // 初回ログイン時（名前が未設定）は自動的に編集モードに
      if (!currentName) {
        setIsEditing(true);
      }
      
      // サーバーから最新情報を取得
      try {
        const response = await profileAPI.get(user.id);
        if (response.profile) {
          setProfileData({
            name: response.profile.name || currentName,
            introduction: response.profile.introduction || currentIntroduction,
            country: response.profile.country || currentCountry
          });
        }
      } catch (error) {
        console.log('Server profile not found, using local data');
      }
      
      // ネコタ手紙設定を取得
      await loadNekotaLetterSettings();
      
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNekotaLetterSettings = async () => {
    try {
      const response = await fetch('/api/nekota-letters/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const settings = await response.json();
        setNekotaLettersEnabled(settings.nekota_letters_enabled);
      }
    } catch (error) {
      console.error('Error loading nekota letter settings:', error);
    }
  };

  const handleNekotaLetterToggle = async () => {
    try {
      const newValue = !nekotaLettersEnabled;
      setNekotaLettersEnabled(newValue);
      
      await fetch('/api/nekota-letters/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nekota_letters_enabled: newValue
        })
      });
    } catch (error) {
      console.error('Error updating nekota letter settings:', error);
      // エラー時は元の値に戻す
      setNekotaLettersEnabled(!nekotaLettersEnabled);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await profileAPI.update(user.id, profileData);
      
      // AuthContextのユーザー情報を更新
      updateProfile(profileData);
      
      setIsEditing(false);
      alert('プロフィールを保存しました！');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('プロフィールの保存に失敗しました。再度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile(); // 元のデータに戻す
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
                  <p className="text-gray-600">あなたの情報を設定してください</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>編集</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* アバター（将来実装用） */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">プロフィール画像</h3>
                  <p className="text-gray-600">将来実装予定</p>
                </div>
              </div>

              {/* 名前 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名前 <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="あなたの名前を入力してください"
                    maxLength={50}
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {profileData.name || <span className="text-gray-400">名前が設定されていません</span>}
                  </div>
                )}
              </div>

              {/* 国・地域 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  国・地域
                </label>
                {isEditing ? (
                  <select
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Japan">日本</option>
                    <option value="USA">アメリカ</option>
                    <option value="UK">イギリス</option>
                    <option value="France">フランス</option>
                    <option value="Germany">ドイツ</option>
                    <option value="Australia">オーストラリア</option>
                    <option value="Canada">カナダ</option>
                    <option value="Korea">韓国</option>
                    <option value="China">中国</option>
                    <option value="Thailand">タイ</option>
                    <option value="Other">その他</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {getCountryName(profileData.country)}
                  </div>
                )}
              </div>

              {/* 自己紹介 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.introduction}
                    onChange={(e) => setProfileData({ ...profileData, introduction: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="あなたについて教えてください"
                    rows={4}
                    maxLength={200}
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[100px]">
                    {profileData.introduction || <span className="text-gray-400">自己紹介が設定されていません</span>}
                  </div>
                )}
              </div>

              {/* ユーザーID（読み取り専用） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザーID
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <code className="text-sm text-gray-600">{user?.id}</code>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  このIDを友達に教えて、友達申請してもらえます
                </p>
              </div>

              {/* ネコタ手紙設定 */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">ネコタ手紙設定</h3>
                      <p className="text-sm text-gray-500">
                        毎日ランダムでネコタから手紙が届きます
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNekotaLetterToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      nekotaLettersEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        nekotaLettersEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {nekotaLettersEnabled ? 'ネコタ手紙が有効です' : 'ネコタ手紙が無効です'}
                </p>
              </div>

              {/* ボタン */}
              {isEditing && (
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !profileData.name.trim()}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? '保存中...' : '保存'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 友達機能の説明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">友達機能について</h3>
              <p className="mt-1 text-sm text-blue-700">
                名前と自己紹介を設定すると、友達があなたを見つけやすくなります。
                また、将来実装予定のレター機能では友達同士でメッセージを送ることができます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
