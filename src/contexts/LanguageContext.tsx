import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ja' | 'es' | 'fr' | 'de' | 'ko' | 'zh';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    ja: 'ダッシュボード',
    es: 'Panel',
    fr: 'Tableau de bord',
    de: 'Dashboard',
    ko: '대시보드',
    zh: '仪表板'
  },
  'nav.voice': {
    en: 'Voice Registration',
    ja: '声登録',
    es: 'Registro de Voz',
    fr: 'Enregistrement Vocal',
    de: 'Sprachregistrierung',
    ko: '음성 등록',
    zh: '语音注册'
  },
  'nav.messages': {
    en: 'Letter',
    ja: 'レター',
    es: 'Carta',
    fr: 'Lettre',
    de: 'Brief',
    ko: '편지',
    zh: '信件'
  },
  'nav.memory': {
    en: 'Memory',
    ja: 'メモリ',
    es: 'Memoria',
    fr: 'Mémoire',
    de: 'Gedächtnis',
    ko: '메모리',
    zh: '记忆'
  },
  'nav.friends': {
    en: 'Friends',
    ja: 'フレンド',
    es: 'Amigos',
    fr: 'Amis',
    de: 'Freunde',
    ko: '친구',
    zh: '朋友'
  },
  'nav.upgrade': {
    en: 'Upgrade',
    ja: 'アップグレード',
    es: 'Actualizar',
    fr: 'Mise à niveau',
    de: 'Upgrade',
    ko: '업그레이드',
    zh: '升级'
  },
  'nav.payments': {
    en: 'Payment History',
    ja: '支払い履歴',
    es: 'Historial de Pagos',
    fr: 'Historique des Paiements',
    de: 'Zahlungshistorie',
    ko: '결제 내역',
    zh: '付款历史'
  },
  'nav.admin': {
    en: 'Admin',
    ja: '管理者',
    es: 'Administrador',
    fr: 'Administrateur',
    de: 'Administrator',
    ko: '관리자',
    zh: '管理员'
  },
  // Auth
  'auth.login': {
    en: 'Login',
    ja: 'ログイン',
    es: 'Iniciar Sesión',
    fr: 'Connexion',
    de: 'Anmelden',
    ko: '로그인',
    zh: '登录'
  },
  'auth.userId': {
    en: 'User ID',
    ja: 'ユーザーID',
    es: 'ID de Usuario',
    fr: 'ID Utilisateur',
    de: 'Benutzer-ID',
    ko: '사용자 ID',
    zh: '用户ID'
  },
  'auth.token': {
    en: 'JWT Token',
    ja: 'JWTトークン',
    es: 'Token JWT',
    fr: 'Token JWT',
    de: 'JWT Token',
    ko: 'JWT 토큰',
    zh: 'JWT令牌'
  },
  'auth.logout': {
    en: 'Logout',
    ja: 'ログアウト',
    es: 'Cerrar Sesión',
    fr: 'Déconnexion',
    de: 'Abmelden',
    ko: '로그아웃',
    zh: '登出'
  },
  // Dashboard
  'dashboard.welcome': {
    en: 'Welcome back',
    ja: 'おかえりなさい',
    es: 'Bienvenido de nuevo',
    fr: 'Bon retour',
    de: 'Willkommen zurück',
    ko: '환영합니다',
    zh: '欢迎回来'
  },
  'dashboard.subtitle': {
    en: "Here's what's happening with your AI conversations today.",
    ja: '今日のAI会話の状況です。',
    es: 'Esto es lo que está pasando con tus conversaciones de IA hoy.',
    fr: 'Voici ce qui se passe avec vos conversations IA aujourd\'hui.',
    de: 'Hier ist, was heute mit Ihren KI-Gesprächen passiert.',
    ko: '오늘 AI 대화 상황입니다.',
    zh: '今天您的AI对话情况。'
  },
  'dashboard.lastUpdated': {
    en: 'Last updated',
    ja: '最終更新',
    es: 'Última actualización',
    fr: 'Dernière mise à jour',
    de: 'Zuletzt aktualisiert',
    ko: '마지막 업데이트',
    zh: '最后更新'
  },
  'dashboard.totalMessages': {
    en: 'Total Messages',
    ja: '総メッセージ数',
    es: 'Mensajes Totales',
    fr: 'Messages Totaux',
    de: 'Gesamtnachrichten',
    ko: '총 메시지',
    zh: '总消息数'
  },
  'dashboard.friendsConnected': {
    en: 'Friends Connected',
    ja: '接続中のフレンド',
    es: 'Amigos Conectados',
    fr: 'Amis Connectés',
    de: 'Verbundene Freunde',
    ko: '연결된 친구',
    zh: '已连接的朋友'
  },
  'dashboard.aiMemories': {
    en: 'AI Memories',
    ja: 'AIメモリ',
    es: 'Memorias IA',
    fr: 'Mémoires IA',
    de: 'KI-Erinnerungen',
    ko: 'AI 메모리',
    zh: 'AI记忆'
  },
  'dashboard.currentPlan': {
    en: 'Current Plan',
    ja: '現在のプラン',
    es: 'Plan Actual',
    fr: 'Plan Actuel',
    de: 'Aktueller Plan',
    ko: '현재 플랜',
    zh: '当前计划'
  },
  'dashboard.aiModelSelection': {
    en: 'AI Model Selection',
    ja: 'AIモデル選択',
    es: 'Selección de Modelo IA',
    fr: 'Sélection de Modèle IA',
    de: 'KI-Modellauswahl',
    ko: 'AI 모델 선택',
    zh: 'AI模型选择'
  },
  'dashboard.aiModelDescription': {
    en: 'Choose your preferred AI model for conversations',
    ja: '会話に使用するAIモデルを選択してください',
    es: 'Elige tu modelo de IA preferido para conversaciones',
    fr: 'Choisissez votre modèle IA préféré pour les conversations',
    de: 'Wählen Sie Ihr bevorzugtes KI-Modell für Gespräche',
    ko: '대화에 사용할 AI 모델을 선택하세요',
    zh: '选择您喜欢的AI模型进行对话'
  },
  'dashboard.modelDeepseek': {
    en: 'DeepSeek',
    ja: 'DeepSeek',
    es: 'DeepSeek',
    fr: 'DeepSeek',
    de: 'DeepSeek',
    ko: 'DeepSeek',
    zh: 'DeepSeek'
  },
  'dashboard.modelDeepseekDesc': {
    en: 'Fast and efficient AI model',
    ja: '高速で効率的なAIモデル',
    es: 'Modelo de IA rápido y eficiente',
    fr: 'Modèle IA rapide et efficace',
    de: 'Schnelles und effizientes KI-Modell',
    ko: '빠르고 효율적인 AI 모델',
    zh: '快速高效的AI模型'
  },
  'dashboard.modelChatgpt': {
    en: 'ChatGPT',
    ja: 'ChatGPT',
    es: 'ChatGPT',
    fr: 'ChatGPT',
    de: 'ChatGPT',
    ko: 'ChatGPT',
    zh: 'ChatGPT'
  },
  'dashboard.modelChatgptDesc': {
    en: 'Advanced conversational AI',
    ja: '高度な対話型AI',
    es: 'IA conversacional avanzada',
    fr: 'IA conversationnelle avancée',
    de: 'Fortgeschrittene Konversations-KI',
    ko: '고급 대화형 AI',
    zh: '高级对话AI'
  },
  'dashboard.modelClaude': {
    en: 'Claude',
    ja: 'Claude',
    es: 'Claude',
    fr: 'Claude',
    de: 'Claude',
    ko: 'Claude',
    zh: 'Claude'
  },
  'dashboard.modelClaudeDesc': {
    en: 'Sophisticated reasoning AI',
    ja: '高度な推論AI',
    es: 'IA de razonamiento sofisticado',
    fr: 'IA de raisonnement sophistiquée',
    de: 'Ausgeklügelte Reasoning-KI',
    ko: '정교한 추론 AI',
    zh: '精密推理AI'
  },
  'dashboard.premium': {
    en: 'Premium',
    ja: 'プレミアム',
    es: 'Premium',
    fr: 'Premium',
    de: 'Premium',
    ko: '프리미엄',
    zh: '高级会员'
  },
  'dashboard.upgradeToPremium': {
    en: 'Upgrade to Premium to unlock this model',
    ja: 'このモデルを使用するにはプレミアムにアップグレードしてください',
    es: 'Actualiza a Premium para desbloquear este modelo',
    fr: 'Passez à Premium pour débloquer ce modèle',
    de: 'Auf Premium upgraden, um dieses Modell freizuschalten',
    ko: '이 모델을 잠금 해제하려면 프리미엄으로 업그레이드하세요',
    zh: '升级到高级会员以解锁此模型'
  },
  // Messages (Letters)
  'messages.title': {
    en: 'Letter',
    ja: 'レター',
    es: 'Carta',
    fr: 'Lettre',
    de: 'Brief',
    ko: '편지',
    zh: '信件'
  },
  'messages.description': {
    en: 'Manage messages with friends',
    ja: '友達とのメッセージを管理します',
    es: 'Administra mensajes con amigos',
    fr: 'Gérer les messages avec des amis',
    de: 'Nachrichten mit Freunden verwalten',
    ko: '친구와의 메시지 관리',
    zh: '管理与朋友的消息'
  },
  'messages.savedCount': {
    en: 'Saved messages',
    ja: '保存済みメッセージ',
    es: 'Mensajes guardados',
    fr: 'Messages enregistrés',
    de: 'Gespeicherte Nachrichten',
    ko: '저장된 메시지',
    zh: '已保存消息'
  },
  'messages.autoDelete': {
    en: 'Automatically deleted after 500',
    ja: '500件を超えると古いものから自動削除されます',
    es: 'Se eliminan automáticamente después de 500',
    fr: 'Suppression automatique après 500',
    de: 'Automatisch gelöscht nach 500',
    ko: '500개 초과 시 자동 삭제',
    zh: '超过500条后自动删除'
  },
  'messages.sendLetter': {
    en: 'Send Letter',
    ja: 'レターを送る',
    es: 'Enviar Carta',
    fr: 'Envoyer une Lettre',
    de: 'Brief senden',
    ko: '편지 보내기',
    zh: '发送信件'
  },
  'messages.createNew': {
    en: 'Create New Letter',
    ja: '新しいレターを作成',
    es: 'Crear Nueva Carta',
    fr: 'Créer une Nouvelle Lettre',
    de: 'Neuen Brief erstellen',
    ko: '새 편지 작성',
    zh: '创建新信件'
  },
  'messages.recipient': {
    en: 'Recipient',
    ja: '宛先',
    es: 'Destinatario',
    fr: 'Destinataire',
    de: 'Empfänger',
    ko: '받는 사람',
    zh: '收件人'
  },
  'messages.selectRecipient': {
    en: 'Select recipient',
    ja: '宛先を選択',
    es: 'Seleccionar destinatario',
    fr: 'Sélectionner le destinataire',
    de: 'Empfänger auswählen',
    ko: '받는 사람 선택',
    zh: '选择收件人'
  },
  'messages.message': {
    en: 'Message',
    ja: 'メッセージ',
    es: 'Mensaje',
    fr: 'Message',
    de: 'Nachricht',
    ko: '메시지',
    zh: '消息'
  },
  'messages.enterMessage': {
    en: 'Enter message...',
    ja: 'メッセージを入力...',
    es: 'Ingrese el mensaje...',
    fr: 'Entrez le message...',
    de: 'Nachricht eingeben...',
    ko: '메시지 입력...',
    zh: '输入消息...'
  },
  'messages.send': {
    en: 'Send Letter',
    ja: 'レターを送信',
    es: 'Enviar Carta',
    fr: 'Envoyer la Lettre',
    de: 'Brief senden',
    ko: '편지 전송',
    zh: '发送信件'
  },
  'messages.cancel': {
    en: 'Cancel',
    ja: 'キャンセル',
    es: 'Cancelar',
    fr: 'Annuler',
    de: 'Abbrechen',
    ko: '취소',
    zh: '取消'
  },
  'messages.search': {
    en: 'Search messages...',
    ja: 'メッセージを検索...',
    es: 'Buscar mensajes...',
    fr: 'Rechercher des messages...',
    de: 'Nachrichten suchen...',
    ko: '메시지 검색...',
    zh: '搜索消息...'
  },
  'messages.noMessages': {
    en: 'No messages yet',
    ja: 'まだメッセージがありません',
    es: 'Aún no hay mensajes',
    fr: 'Pas encore de messages',
    de: 'Noch keine Nachrichten',
    ko: '아직 메시지가 없습니다',
    zh: '还没有消息'
  },
  'messages.noMatch': {
    en: 'No messages match your search',
    ja: '検索結果が見つかりません',
    es: 'No hay mensajes que coincidan',
    fr: 'Aucun message ne correspond',
    de: 'Keine passenden Nachrichten',
    ko: '검색 결과가 없습니다',
    zh: '没有匹配的消息'
  },
  'messages.sendFirst': {
    en: 'Send your first letter to friends.',
    ja: '友達に最初のレターを送ってみましょう。',
    es: 'Envía tu primera carta a amigos.',
    fr: 'Envoyez votre première lettre à des amis.',
    de: 'Senden Sie Ihren ersten Brief an Freunde.',
    ko: '친구에게 첫 번째 편지를 보내세요.',
    zh: '给朋友发送第一封信。'
  },
  'messages.adjustSearch': {
    en: 'Try adjusting your search criteria.',
    ja: '検索条件を変更してみてください。',
    es: 'Intenta ajustar tus criterios de búsqueda.',
    fr: 'Essayez d\'ajuster vos critères de recherche.',
    de: 'Versuchen Sie, Ihre Suchkriterien anzupassen.',
    ko: '검색 조건을 조정해 보세요.',
    zh: '尝试调整您的搜索条件。'
  },
  'messages.sendFirstButton': {
    en: 'Send First Letter',
    ja: '最初のレターを送る',
    es: 'Enviar Primera Carta',
    fr: 'Envoyer la Première Lettre',
    de: 'Ersten Brief senden',
    ko: '첫 번째 편지 보내기',
    zh: '发送第一封信'
  },
  'messages.unknownSender': {
    en: 'Unknown sender',
    ja: '不明な送信者',
    es: 'Remitente desconocido',
    fr: 'Expéditeur inconnu',
    de: 'Unbekannter Absender',
    ko: '알 수 없는 발신자',
    zh: '未知发送者'
  },
  'messages.voice': {
    en: 'Voice',
    ja: '音声',
    es: 'Voz',
    fr: 'Voix',
    de: 'Stimme',
    ko: '음성',
    zh: '语音'
  },
  'messages.web': {
    en: 'Web',
    ja: 'Web',
    es: 'Web',
    fr: 'Web',
    de: 'Web',
    ko: 'Web',
    zh: 'Web'
  },
  'messages.read': {
    en: 'Read',
    ja: '既読',
    es: 'Leído',
    fr: 'Lu',
    de: 'Gelesen',
    ko: '읽음',
    zh: '已读'
  },
  'messages.unread': {
    en: 'Unread',
    ja: '未読',
    es: 'No leído',
    fr: 'Non lu',
    de: 'Ungelesen',
    ko: '읽지 않음',
    zh: '未读'
  },
  'messages.noContent': {
    en: 'No message content',
    ja: 'メッセージ内容がありません',
    es: 'Sin contenido de mensaje',
    fr: 'Pas de contenu de message',
    de: 'Kein Nachrichteninhalt',
    ko: '메시지 내용 없음',
    zh: '无消息内容'
  },
  'messages.delete': {
    en: 'Delete',
    ja: '削除',
    es: 'Eliminar',
    fr: 'Supprimer',
    de: 'Löschen',
    ko: '삭제',
    zh: '删除'
  },
  'messages.loading': {
    en: 'Loading...',
    ja: '読み込み中...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Lädt...',
    ko: '로딩 중...',
    zh: '加载中...'
  },
  'messages.allLoaded': {
    en: 'All messages displayed',
    ja: '全てのメッセージを表示しました',
    es: 'Todos los mensajes mostrados',
    fr: 'Tous les messages affichés',
    de: 'Alle Nachrichten angezeigt',
    ko: '모든 메시지 표시됨',
    zh: '已显示所有消息'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('nekota_language') as Language;
    if (savedLanguage && languages.some(l => l.code === savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      const browserLang = navigator.language.substring(0, 2) as Language;
      if (languages.some(l => l.code === browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('nekota_language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t,
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};