import React, { useState, useEffect } from 'react';
import { Brain, Plus, Search, Trash2, Edit3, Calendar, Filter, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { memoryAPI } from '../services/api';

interface Memory {
  id: string;
  user_id: string;
  text: string;
  timestamp: string;
  category?: string;
  is_system?: boolean;
  source_type?: string;
}

interface MemoryResponse {
  memories: Memory[];
  total: number;
  page: number;
  pages?: number;
  limit?: number;
}

const Memory: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState('');
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const categories = ['Personal', 'Work', 'Ideas', 'Important', 'Other'];
  const itemsPerPage = 20;

  useEffect(() => {
    if (user) {
      // 初期読み込み
      setMemories([]);
      setOffset(0);
      setHasMore(true);
      loadMemories(0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 無限スクロール: スクロール位置を監視
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMore || !user) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 下部100px手前で読み込み
      if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreMemories();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMore, hasMore, user, offset]);

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

  const loadMemories = async (currentOffset: number = 0, isInitial: boolean = false) => {
    if (!user) return;

    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError('');
      
      console.log('Loading memories for user:', user.id, 'offset:', currentOffset, 'limit:', itemsPerPage);
      
      // APIリクエスト時にシステム自動登録のメモリーを除外するパラメータを追加
      // exclude_system=true でシステム自動登録を除外（API側で対応が必要な場合は後で実装）
      const response = await memoryAPI.list(user.id, currentOffset, itemsPerPage, true);
      console.log('Memories loaded (raw):', response);
      
      // レスポンスは配列として返される（API側でシステム自動登録を除外済み）
      const memoriesArray: Memory[] = Array.isArray(response) ? response : [];
      
      console.log('Memories loaded length:', memoriesArray?.length);
      // APIレスポンスのcreated_atをtimestampにマッピング
      // システム自動登録のメモリーはAPI側で除外されている想定（フロントエンドでも念のためフィルタリング）
      const allMemories = memoriesArray.map(m => ({
        ...m,
        timestamp: m.timestamp || (m as any).created_at || (m as any).updated_at
      }));
      
      // 念のため、フロントエンドでもシステム自動登録のメモリーを除外
      const userMemories = allMemories.filter(m => {
        // is_systemが明示的にtrueの場合は除外
        if (m.is_system === true) return false;
        // source_typeが'general_question'などのシステム自動登録の場合は除外
        if (m.source_type && m.source_type.trim() !== '') {
          const systemSourceTypes = ['general_question', 'auto', 'system'];
          if (systemSourceTypes.includes(m.source_type.trim().toLowerCase())) return false;
        }
        // テキストが"Q: "で始まる場合は一般質問の回答として除外
        if (m.text && m.text.trim().startsWith('Q: ')) return false;
        return true;
      });
      
      if (isInitial) {
        setMemories(userMemories);
      } else {
        // 追加読み込み: 既存のメモリーに追加
        setMemories(prev => [...prev, ...userMemories]);
      }
      
      // 次の読み込みがあるかチェック
      const hasMoreData = userMemories.length === itemsPerPage;
      setHasMore(hasMoreData);
      setOffset(currentOffset + userMemories.length);
      
      console.log(`Loaded ${userMemories.length} memories (offset: ${currentOffset}, hasMore: ${hasMoreData})`);
    } catch (error) {
      console.error('Error loading memories:', error);
      setError('\u30e1\u30e2\u30ea\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002');
      if (isInitial) {
        setMemories([]);
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const loadMoreMemories = () => {
    if (!isLoadingMore && hasMore && user) {
      loadMemories(offset, false);
    }
  };

  const handleCreateMemory = async () => {
    console.log('[DEBUG] handleCreateMemory called', { user, newMemoryText, newMemoryCategory });
    if (!user || !newMemoryText.trim()) {
      setError(t('memory.errorRequired'));
      return;
    }

    if (newMemoryText.length > 1000) {
      setError(t('memory.errorTooLong'));
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('[DEBUG] Creating memory:', {
        user_id: user.id,
        text: newMemoryText.trim(),
        category: newMemoryCategory || undefined
      });

      const createResponse = await memoryAPI.create(user.id, newMemoryText.trim(), newMemoryCategory || undefined);
      
      console.log('[DEBUG] Memory created successfully');
      console.log('[DEBUG] Create API response:', createResponse);
      console.log('[DEBUG] Create API response timestamp:', createResponse?.timestamp, createResponse?.created_at, createResponse?.updated_at);
      
      // 追加後に再取得（初期読み込み）
      setMemories([]);
      setOffset(0);
      setHasMore(true);
      await loadMemories(0, true);
      
      // Reset form
      setNewMemoryText('');
      setNewMemoryCategory('');
      setShowAddModal(false);
      setSuccess(t('memory.successCreated'));
      
    } catch (error) {
      console.error('[DEBUG] Error creating memory:', error);
      setError(error instanceof Error ? error.message : t('memory.errorCreating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm(t('memory.confirmDelete'))) return;

    try {
      setError('');
      console.log('Deleting memory:', memoryId);
      
      await memoryAPI.delete(memoryId);
      
      console.log('Memory deleted successfully');
      
      // Reload memories
      setMemories([]);
      setOffset(0);
      setHasMore(true);
      await loadMemories(0, true);
      setSuccess('メモリが削除されました。');
      
    } catch (error) {
      console.error('Error deleting memory:', error);
      setError('メモリの削除に失敗しました。');
    }
  };

  const filteredMemories = memories.filter(memory => {
    // システム自動登録のメモリーは既に除外されているが、念のため再度チェック
    if (memory.is_system === true) return false;
    if (memory.source_type && memory.source_type !== '') return false;
    if (memory.text && memory.text.trim().startsWith('Q: ')) return false;
    const matchesSearch = searchQuery === '' || 
      memory.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || 
      memory.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  const formatDate = (dateString: string) => {
    if (!dateString) {
      console.warn('⚠️ formatDate: dateString is empty or null');
      return '日付不明';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('⚠️ formatDate: Invalid date string:', dateString);
      return '日付不明';
    }
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCharacterCount = () => {
    return newMemoryText.length;
  };

  const isCharacterLimitExceeded = () => {
    return newMemoryText.length > 1000;
  };

  // メモリリスト描画直前にデバッグログ
  console.log('[DEBUG] memories to render:', memories);
  console.log('[DEBUG] filteredMemories to render:', filteredMemories);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('memory.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('memory.description')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {memories.length} 件のメモリ
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('memory.addMemory')}</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">エラー</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">成功</h3>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('memory.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="">{t('memory.allCategories')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Memories List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {memories.length === 0 ? t('memory.noMemories') : t('memory.noMatch')}
            </h3>
            <p className="text-gray-600 mb-6">
              {memories.length === 0 
                ? t('memory.createFirst')
                : t('memory.adjustSearch')
              }
            </p>
            {memories.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('memory.createFirstButton')}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMemories.map((memory, idx) => (
              <div key={memory.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                      {memory.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {memory.category}
                        </span>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(memory.timestamp)}
                      </div>
                    </div>
                    <p className="text-gray-900 leading-relaxed">{memory.text}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingMemory(memory)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('memory.edit')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('memory.delete')}
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

      {/* 無限スクロール: ローディング表示 */}
      {isLoadingMore && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">読み込み中...</p>
        </div>
      )}
      {!hasMore && memories.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>すべてのメモリーを表示しました</p>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{t('memory.addNew')}</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewMemoryText('');
                    setNewMemoryCategory('');
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('memory.memoryText')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  placeholder={t('memory.enterText')}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isCharacterLimitExceeded() ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    AIが会話で参照できる重要な情報を入力してください
                  </div>
                  <div className="text-xs text-gray-500">
                    {getCharacterCount()} / 1000 {t('memory.characterCount')}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreateMemory}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('memory.saving') : t('memory.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Memory; // dummy comment for push