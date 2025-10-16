import React, { useState, useEffect } from 'react';
import { Brain, Plus, Edit3, Trash2, BookOpen, Clock, Search, Filter, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

interface DiaryEntry {
  t: string;
  ts: string;
}

interface GlossaryEntry {
  [term: string]: string;
}

interface ShortMemoryData {
  entries: DiaryEntry[];
  memory_text: string;
  glossary: GlossaryEntry;
  updated_at: string;
}

const NeKotaDiary: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [diaryData, setDiaryData] = useState<ShortMemoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showGlossary, setShowGlossary] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDiaryData();
  }, []);

  const loadDiaryData = async () => {
    try {
      setIsLoading(true);
      const data = await api.shortMemory.get();
      console.log('🔍 Raw API response:', data);
      
      // APIは配列を返すので、最初の要素を取得
      const diaryRecord = Array.isArray(data) ? data[0] : data;
      console.log('🔍 Diary record:', diaryRecord);
      
      setDiaryData(diaryRecord);
      setError('');
    } catch (err) {
      setError('日記の読み込みに失敗しました');
      console.error('Failed to load diary data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addDiaryEntry = async () => {
    if (!newEntry.trim()) {
      setError('日記の内容を入力してください');
      return;
    }

    try {
      await api.shortMemory.append(newEntry.trim());
      setNewEntry('');
      setShowAddModal(false);
      setSuccess('新しい日記を追加しました');
      await loadDiaryData();
    } catch (err) {
      setError('日記の追加に失敗しました');
      console.error('Failed to add diary entry:', err);
    }
  };

  const editDiaryEntry = async (index: number) => {
    if (!editingText.trim()) {
      setError('日記の内容を入力してください');
      return;
    }

    try {
      // 各行を個別のエントリとして処理
      const lines = editingText.trim().split('\n').filter(line => line.trim());
      
      // 既存のエントリを個別削除で対応（clear APIの問題回避）
      if (diaryData?.entries && Array.isArray(diaryData.entries)) {
        // 逆順で削除（インデックスの問題回避）
        for (let i = diaryData.entries.length - 1; i >= 0; i--) {
          try {
            await api.shortMemory.deleteEntry(i);
          } catch (deleteErr) {
            console.warn(`Failed to delete entry ${i}:`, deleteErr);
          }
        }
      }
      
      // 新しいエントリを追加
      for (const line of lines) {
        await api.shortMemory.append(line.trim());
      }
      
      setEditingIndex(null);
      setEditingText('');
      setSuccess('日記を更新しました');
      await loadDiaryData();
    } catch (err) {
      setError('日記の更新に失敗しました');
      console.error('Failed to edit diary entry:', err);
    }
  };

  const deleteDiaryEntry = async (index: number) => {
    if (!confirm('この日記を削除しますか？')) return;

    try {
      await api.shortMemory.deleteEntry(index);
      setSuccess('日記を削除しました');
      await loadDiaryData();
    } catch (err) {
      setError('日記の削除に失敗しました');
      console.error('Failed to delete diary entry:', err);
    }
  };

  const clearAllDiary = async () => {
    if (!confirm('すべての日記を削除しますか？この操作は元に戻せません。')) return;

    try {
      setIsLoading(true);  // ローディング表示
      
      // 個別削除で対応（常にインデックス0を削除し続ける）
      if (diaryData?.entries && Array.isArray(diaryData.entries)) {
        const totalEntries = diaryData.entries.length;
        
        // 常にインデックス0を削除し続ける（削除後に自動的に詰まる）
        for (let i = 0; i < totalEntries; i++) {
          try {
            await api.shortMemory.deleteEntry(0);  // 常に0番目を削除
          } catch (deleteErr) {
            console.error(`Failed to delete entry (iteration ${i}):`, deleteErr);
          }
        }
      }
      
      // データをクリア＆リロード
      setDiaryData(null);
      await loadDiaryData();
      setSuccess('すべての日記を削除しました');
    } catch (err) {
      setError('日記の削除に失敗しました');
      console.error('Failed to clear diary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addGlossaryEntry = async () => {
    if (!newTerm.trim() || !newMeaning.trim()) {
      setError('用語と意味を両方入力してください');
      return;
    }

    try {
      await api.shortMemory.updateGlossary(newTerm.trim(), newMeaning.trim());
      setNewTerm('');
      setNewMeaning('');
      setSuccess('辞書に追加しました');
      await loadDiaryData();
    } catch (err) {
      setError('辞書の追加に失敗しました');
      console.error('Failed to add glossary entry:', err);
    }
  };

  const deleteGlossaryEntry = async (term: string) => {
    if (!confirm(`「${term}」を辞書から削除しますか？`)) return;

    try {
      await api.shortMemory.deleteGlossaryEntry(term);
      setSuccess('辞書から削除しました');
      await loadDiaryData();
    } catch (err) {
      setError('辞書の削除に失敗しました');
      console.error('Failed to delete glossary entry:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEntries = (diaryData?.entries && Array.isArray(diaryData.entries)) 
    ? diaryData.entries.filter(entry =>
        entry.t.toLowerCase().includes(searchQuery.toLowerCase())
      ) 
    : [];

  const filteredGlossary = diaryData?.glossary ? Object.entries(diaryData.glossary).filter(([term, meaning]) =>
    term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meaning.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2">日記を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - シンプル */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ネコタの日記</h2>
            <p className="text-sm text-gray-600">会話から自動生成される日記と辞書</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新しい日記</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="日記や辞書を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={loadDiaryData}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Diary Entries - シンプル */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            日記エントリ ({filteredEntries.length}件)
          </h3>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-lg font-bold" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
              {searchQuery ? '検索結果が見つかりません' : 'まだ日記がありません'}
            </p>
            <p className="text-gray-400 text-sm mt-2" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
              {!searchQuery && '最初の日記を書いてみましょう！'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {editingIndex === null ? (
              <div className="space-y-4 p-6">
                <div className="space-y-4">
                  {filteredEntries.map((entry, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="text-gray-900 text-base font-bold" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
                        {entry.t}
                      </div>
                      <div className="text-gray-500 text-sm mt-2 font-medium" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
                        {formatDate(entry.ts)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditingIndex(-1);
                      setEditingText(filteredEntries.map(entry => entry.t).join('\n'));
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={clearAllDiary}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    すべて削除
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-6">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
                  rows={10}
                  placeholder="日記の内容を入力してください（各行が1つのエントリになります）"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => editDiaryEntry(editingIndex)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingIndex(null);
                      setEditingText('');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Glossary Section - シンプル */}
      {showGlossary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              辞書 ({filteredGlossary.length}語)
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="用語"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="意味"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={addGlossaryEntry}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                追加
              </button>
            </div>
          </div>

          {filteredGlossary.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600 text-lg font-bold" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
                {searchQuery ? '検索結果が見つかりません' : '辞書が空です'}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="space-y-4 p-6">
                {filteredGlossary.map(([term, meaning]) => (
                  <div key={term} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
                          {term}
                        </div>
                        <div className="text-gray-700 mt-2 font-medium" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
                          {meaning}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGlossaryEntry(term)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              新しい日記を追加
            </h3>
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="今日の出来事や感想を書いてください..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
            />
            <div className="flex space-x-2 mt-4">
              <button
                onClick={addDiaryEntry}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEntry('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeKotaDiary;
