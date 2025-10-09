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
      // 個別削除で対応（clear APIの問題回避）
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
      setSuccess('すべての日記を削除しました');
      await loadDiaryData();
    } catch (err) {
      setError('日記の削除に失敗しました');
      console.error('Failed to clear diary:', err);
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
      {/* Header - ノート風 */}
      <div className="relative">
        {/* マスキングテープ風装飾 */}
        <div className="absolute -top-4 left-8 w-24 h-8 bg-gradient-to-r from-pink-200 to-pink-300 opacity-70 transform -rotate-2 rounded-sm shadow-sm"></div>
        
        <div className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg relative" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, #d4a574 31px, #d4a574 32px)',
        }}>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-amber-900" style={{ fontFamily: "'Klee One', cursive" }}>
                ネコタの日記帳 📔
              </h2>
              <p className="text-sm text-amber-700 mt-1" style={{ fontFamily: "'Klee One', cursive" }}>
                会話から自動生成される思い出と辞書
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              style={{ fontFamily: "'Klee One', cursive" }}
            >
              <Plus className="w-5 h-5" />
              <span>新しい日記</span>
            </button>
            <button
              onClick={() => setShowGlossary(!showGlossary)}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-xl hover:from-teal-500 hover:to-cyan-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              style={{ fontFamily: "'Klee One', cursive" }}
            >
              <Brain className="w-5 h-5" />
              <span>辞書管理</span>
            </button>
          </div>
        </div>
        
        {/* クリップ風装飾 */}
        <div className="absolute -top-2 right-12 w-6 h-10 bg-gray-400 rounded-full opacity-40 shadow-md"></div>
      </div>

      {/* Messages - 可愛いデザイン */}
      {error && (
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl shadow-md">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="text-red-700 font-medium" style={{ fontFamily: "'Klee One', cursive" }}>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-xl shadow-md">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="text-green-700 font-medium" style={{ fontFamily: "'Klee One', cursive" }}>{success}</span>
        </div>
      )}

      {/* Search - ノート風 */}
      <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 shadow-md">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input
            type="text"
            placeholder="🔍 日記や辞書を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white/70"
            style={{ fontFamily: "'Klee One', cursive" }}
          />
        </div>
        <button
          onClick={loadDiaryData}
          className="p-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-md hover:shadow-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Diary Entries - ノート風 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-amber-900" style={{ fontFamily: "'Klee One', cursive" }}>
            📖 日記エントリ ({filteredEntries.length}件)
          </h3>
          {diaryData && diaryData.entries.length > 0 && (
            <button
              onClick={clearAllDiary}
              className="text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-1 border border-red-300 rounded-full hover:bg-red-50"
              style={{ fontFamily: "'Klee One', cursive" }}
            >
              すべて削除
            </button>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-12 text-center shadow-lg" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, #d4a574 31px, #d4a574 32px)',
          }}>
            <div className="text-amber-400 text-6xl mb-4">📝</div>
            <p className="text-amber-700 text-lg" style={{ fontFamily: "'Klee One', cursive" }}>
              {searchQuery ? '検索結果が見つかりません' : 'まだ日記がありません'}
            </p>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-2xl" style={{
            backgroundImage: `
              linear-gradient(90deg, #e07a5f 0px, #e07a5f 2px, transparent 2px, transparent 100%),
              repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(212, 165, 116, 0.3) 31px, rgba(212, 165, 116, 0.3) 32px)
            `,
            backgroundPosition: '40px 0, 0 0',
            backgroundSize: '100% 100%, 100% 100%',
          }}>
            {/* ページめくり効果 */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-100 border-l-2 border-t-2 border-amber-300 rounded-tl-3xl"></div>
            
            {editingIndex === null ? (
              <div className="space-y-4 pl-20 pr-8 py-8">
                <div className="leading-loose whitespace-pre-line" style={{ fontFamily: "'Klee One', cursive", fontSize: '16px', lineHeight: '32px' }}>
                  {filteredEntries.map((entry, index) => (
                    <div key={index} className="mb-4 hover:bg-amber-100/30 rounded-lg p-2 transition-colors">
                      <span className="text-amber-950">✿ {entry.t}</span>
                      <span className="text-amber-500 text-xs ml-3 block mt-1">
                        🕐 {formatDate(entry.ts)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t-2 border-dashed border-amber-300">
                  <button
                    onClick={() => {
                      setEditingIndex(-1);
                      setEditingText(filteredEntries.map(entry => entry.t).join('\n'));
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-md hover:shadow-lg"
                    style={{ fontFamily: "'Klee One', cursive" }}
                  >
                    ✏️ 編集
                  </button>
                  <button
                    onClick={clearAllDiary}
                    className="px-5 py-2 bg-gradient-to-r from-red-400 to-rose-400 text-white rounded-xl hover:from-red-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg"
                    style={{ fontFamily: "'Klee One', cursive" }}
                  >
                    🗑️ すべて削除
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-8">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full p-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white/50"
                  style={{ fontFamily: "'Klee One', cursive", fontSize: '16px', lineHeight: '32px' }}
                  rows={10}
                  placeholder="日記の内容を入力してください（各行が1つのエントリになります）"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => editDiaryEntry(editingIndex)}
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-md"
                    style={{ fontFamily: "'Klee One', cursive" }}
                  >
                    💾 保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingIndex(null);
                      setEditingText('');
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all shadow-md"
                    style={{ fontFamily: "'Klee One', cursive" }}
                  >
                    ✖️ キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Glossary Section - ノート風 */}
      {showGlossary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4 shadow-md">
            <h3 className="text-xl font-bold text-teal-900" style={{ fontFamily: "'Klee One', cursive" }}>
              📚 辞書 ({filteredGlossary.length}語)
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="用語"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="px-4 py-2 border-2 border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                style={{ fontFamily: "'Klee One', cursive" }}
              />
              <input
                type="text"
                placeholder="意味"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                className="px-4 py-2 border-2 border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                style={{ fontFamily: "'Klee One', cursive" }}
              />
              <button
                onClick={addGlossaryEntry}
                className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-xl hover:from-teal-500 hover:to-cyan-500 transition-all shadow-md"
                style={{ fontFamily: "'Klee One', cursive" }}
              >
                ➕ 追加
              </button>
            </div>
          </div>

          {filteredGlossary.length === 0 ? (
            <div className="text-center py-8 bg-teal-50/50 border-2 border-dashed border-teal-200 rounded-xl">
              <p className="text-teal-600 text-lg" style={{ fontFamily: "'Klee One', cursive" }}>
                {searchQuery ? '🔍 検索結果が見つかりません' : '📖 辞書が空です'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGlossary.map(([term, meaning]) => (
                <div key={term} className="relative bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                  {/* 付箋風の装飾 */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full opacity-60"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-teal-900 text-lg" style={{ fontFamily: "'Klee One', cursive" }}>
                        📌 {term}
                      </div>
                      <div className="text-sm text-teal-700 mt-2" style={{ fontFamily: "'Klee One', cursive" }}>
                        💡 {meaning}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGlossaryEntry(term)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Entry Modal - ノート風 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-amber-300 rounded-3xl p-8 w-full max-w-md shadow-2xl" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(212, 165, 116, 0.2) 31px, rgba(212, 165, 116, 0.2) 32px)',
          }}>
            {/* マスキングテープ風装飾 */}
            <div className="absolute -top-3 left-1/4 w-20 h-6 bg-gradient-to-r from-pink-300 to-rose-300 opacity-70 transform -rotate-3 rounded-sm shadow-sm"></div>
            
            <h3 className="text-2xl font-bold mb-6 text-amber-900 flex items-center space-x-2" style={{ fontFamily: "'Klee One', cursive" }}>
              <span>✨</span>
              <span>新しい日記を追加</span>
              <span>✨</span>
            </h3>
            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="今日の出来事や感想を書いてください... 🌸"
              className="w-full p-4 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white/70 shadow-inner"
              style={{ fontFamily: "'Klee One', cursive", fontSize: '16px', lineHeight: '32px' }}
              rows={6}
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addDiaryEntry}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-bold"
                style={{ fontFamily: "'Klee One', cursive" }}
              >
                💕 追加
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEntry('');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-white rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-bold"
                style={{ fontFamily: "'Klee One', cursive" }}
              >
                ✖️ キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeKotaDiary;
