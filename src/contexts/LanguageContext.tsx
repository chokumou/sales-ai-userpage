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
    ko: '모든 메시지 표示됨',
    zh: '已显示所有消息'
  },
  // Friends
  'friends.title': {
    en: 'Friends',
    ja: 'フレンド',
    es: 'Amigos',
    fr: 'Amis',
    de: 'Freunde',
    ko: '친구',
    zh: '朋友'
  },
  'friends.description': {
    en: 'Connect with others and share AI-powered voice conversations.',
    ja: '友達とつながって、AI音声会話を共有しましょう。',
    es: 'Conéctate con otros y comparte conversaciones de voz con IA.',
    fr: 'Connectez-vous avec d\'autres et partagez des conversations vocales IA.',
    de: 'Verbinden Sie sich mit anderen und teilen Sie KI-gestützte Sprachgespräche.',
    ko: '다른 사람들과 연결하고 AI 음성 대화를 공유하세요.',
    zh: '与他人连接并分享AI语音对话。'
  },
  'friends.count': {
    en: 'friends',
    ja: '人のフレンド',
    es: 'amigos',
    fr: 'amis',
    de: 'Freunde',
    ko: '명의 친구',
    zh: '位朋友'
  },
  'friends.addFriend': {
    en: 'Add Friend',
    ja: 'フレンド追加',
    es: 'Agregar Amigo',
    fr: 'Ajouter un Ami',
    de: 'Freund hinzufügen',
    ko: '친구 추가',
    zh: '添加朋友'
  },
  'friends.requests': {
    en: 'Friend Requests',
    ja: 'フレンド申請',
    es: 'Solicitudes de Amistad',
    fr: 'Demandes d\'Amis',
    de: 'Freundschaftsanfragen',
    ko: '친구 요청',
    zh: '好友请求'
  },
  'friends.unknownUser': {
    en: 'Unknown User',
    ja: '不明なユーザー',
    es: 'Usuario Desconocido',
    fr: 'Utilisateur Inconnu',
    de: 'Unbekannter Benutzer',
    ko: '알 수 없는 사용자',
    zh: '未知用户'
  },
  'friends.noIntroduction': {
    en: 'No introduction',
    ja: '自己紹介なし',
    es: 'Sin presentación',
    fr: 'Pas de présentation',
    de: 'Keine Einführung',
    ko: '자기소개 없음',
    zh: '无自我介绍'
  },
  'friends.accept': {
    en: 'Accept',
    ja: '承認',
    es: 'Aceptar',
    fr: 'Accepter',
    de: 'Akzeptieren',
    ko: '수락',
    zh: '接受'
  },
  'friends.decline': {
    en: 'Decline',
    ja: '拒否',
    es: 'Rechazar',
    fr: 'Refuser',
    de: 'Ablehnen',
    ko: '거절',
    zh: '拒绝'
  },
  'friends.search': {
    en: 'Search friends...',
    ja: 'フレンドを検索...',
    es: 'Buscar amigos...',
    fr: 'Rechercher des amis...',
    de: 'Freunde suchen...',
    ko: '친구 검색...',
    zh: '搜索朋友...'
  },
  'friends.noFriends': {
    en: 'No friends yet',
    ja: 'まだフレンドがいません',
    es: 'Aún no hay amigos',
    fr: 'Pas encore d\'amis',
    de: 'Noch keine Freunde',
    ko: '아직 친구가 없습니다',
    zh: '还没有朋友'
  },
  'friends.noMatch': {
    en: 'No friends match your search',
    ja: '検索結果が見つかりません',
    es: 'No hay amigos que coincidan',
    fr: 'Aucun ami ne correspond',
    de: 'Keine passenden Freunde',
    ko: '검색 결과가 없습니다',
    zh: '没有匹配的朋友'
  },
  'friends.buildNetwork': {
    en: 'Start building your network by adding friends to share AI conversations.',
    ja: 'フレンドを追加してAI会話を共有しましょう。',
    es: 'Comienza a construir tu red agregando amigos para compartir conversaciones de IA.',
    fr: 'Commencez à construire votre réseau en ajoutant des amis pour partager des conversations IA.',
    de: 'Beginnen Sie mit dem Aufbau Ihres Netzwerks, indem Sie Freunde hinzufügen, um KI-Gespräche zu teilen.',
    ko: 'AI 대화를 공유할 친구를 추가하여 네트워크를 구축하세요.',
    zh: '通过添加朋友来分享AI对话，开始建立您的网络。'
  },
  'friends.adjustSearch': {
    en: 'Try adjusting your search terms.',
    ja: '検索条件を変更してみてください。',
    es: 'Intenta ajustar tus términos de búsqueda.',
    fr: 'Essayez d\'ajuster vos termes de recherche.',
    de: 'Versuchen Sie, Ihre Suchbegriffe anzupassen.',
    ko: '검색어를 조정해 보세요.',
    zh: '尝试调整您的搜索词。'
  },
  'friends.addFirst': {
    en: 'Add Your First Friend',
    ja: '最初のフレンドを追加',
    es: 'Agrega tu Primer Amigo',
    fr: 'Ajoutez Votre Premier Ami',
    de: 'Fügen Sie Ihren Ersten Freund Hinzu',
    ko: '첫 번째 친구 추가',
    zh: '添加您的第一位朋友'
  },
  'friends.lastMessage': {
    en: 'Last message',
    ja: '最新メッセージ',
    es: 'Último mensaje',
    fr: 'Dernier message',
    de: 'Letzte Nachricht',
    ko: '마지막 메시지',
    zh: '最新消息'
  },
  'friends.startConversation': {
    en: 'Start conversation',
    ja: '会話を開始',
    es: 'Iniciar conversación',
    fr: 'Démarrer la conversation',
    de: 'Gespräch starten',
    ko: '대화 시작',
    zh: '开始对话'
  },
  'friends.yourNetwork': {
    en: 'Your Network',
    ja: 'あなたのネットワーク',
    es: 'Tu Red',
    fr: 'Votre Réseau',
    de: 'Ihr Netzwerk',
    ko: '당신의 네트워크',
    zh: '您的网络'
  },
  'friends.totalFriends': {
    en: 'Total Friends',
    ja: '合計フレンド数',
    es: 'Total de Amigos',
    fr: 'Total d\'Amis',
    de: 'Gesamte Freunde',
    ko: '총 친구 수',
    zh: '总朋友数'
  },
  'friends.onlineNow': {
    en: 'Online Now',
    ja: '現在オンライン',
    es: 'En Línea Ahora',
    fr: 'En Ligne Maintenant',
    de: 'Jetzt Online',
    ko: '현재 온라인',
    zh: '当前在线'
  },
  'friends.unreadMessages': {
    en: 'Unread Messages',
    ja: '未読メッセージ',
    es: 'Mensajes No Leídos',
    fr: 'Messages Non Lus',
    de: 'Ungelesene Nachrichten',
    ko: '읽지 않은 메시지',
    zh: '未读消息'
  },
  'friends.tips': {
    en: 'Tips',
    ja: 'ヒント',
    es: 'Consejos',
    fr: 'Conseils',
    de: 'Tipps',
    ko: '팁',
    zh: '提示'
  },
  'friends.tip1': {
    en: '• Send voice messages for richer conversations',
    ja: '• 音声メッセージでより豊かな会話を',
    es: '• Envía mensajes de voz para conversaciones más ricas',
    fr: '• Envoyez des messages vocaux pour des conversations plus riches',
    de: '• Senden Sie Sprachnachrichten für reichhaltigere Gespräche',
    ko: '• 더 풍부한 대화를 위해 음성 메시지 보내기',
    zh: '• 发送语音消息以获得更丰富的对话'
  },
  'friends.tip2': {
    en: '• AI can remember context across friend chats',
    ja: '• AIはフレンドとのチャット全体で文脈を記憶します',
    es: '• La IA puede recordar el contexto en los chats de amigos',
    fr: '• L\'IA peut se souvenir du contexte dans les discussions entre amis',
    de: '• KI kann sich den Kontext über Freundschaftschats hinweg merken',
    ko: '• AI는 친구 채팅 전반에 걸쳐 맥락을 기억할 수 있습니다',
    zh: 'AI可以记住朋友聊天中的上下文'
  },
  'friends.tip3': {
    en: '• Use voice profiles for personalized responses',
    ja: '• 音声プロフィールでパーソナライズされた応答を',
    es: '• Usa perfiles de voz para respuestas personalizadas',
    fr: '• Utilisez des profils vocaux pour des réponses personnalisées',
    de: '• Verwenden Sie Sprachprofile für personalisierte Antworten',
    ko: '• 음성 프로필을 사용하여 맞춤형 응답 받기',
    zh: '• 使用语音配置文件获取个性化回复'
  },
  'friends.tip4': {
    en: '• Friends can share AI memories',
    ja: '• フレンドとAIメモリを共有できます',
    es: '• Los amigos pueden compartir memorias de IA',
    fr: '• Les amis peuvent partager des mémoires IA',
    de: '• Freunde können KI-Erinnerungen teilen',
    ko: '• 친구들과 AI 메모리 공유 가능',
    zh: '• 朋友可以分享AI记忆'
  },
  'friends.addNew': {
    en: 'Add New Friend',
    ja: '新しいフレンドを追加',
    es: 'Agregar Nuevo Amigo',
    fr: 'Ajouter un Nouvel Ami',
    de: 'Neuen Freund Hinzufügen',
    ko: '새 친구 추가',
    zh: '添加新朋友'
  },
  'friends.friendUserId': {
    en: "Friend's User ID",
    ja: 'フレンドのユーザーID',
    es: 'ID de Usuario del Amigo',
    fr: 'ID Utilisateur de l\'Ami',
    de: 'Benutzer-ID des Freundes',
    ko: '친구의 사용자 ID',
    zh: '朋友的用户ID'
  },
  'friends.uuidFormat': {
    en: 'Please enter in UUID format (e.g., xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    ja: 'UUID形式で入力してください（例: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）',
    es: 'Ingrese en formato UUID (ej., xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    fr: 'Veuillez saisir au format UUID (par ex., xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    de: 'Bitte im UUID-Format eingeben (z.B. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    ko: 'UUID 형식으로 입력하세요 (예: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
    zh: '请以UUID格式输入（例如：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）'
  },
  'friends.sendRequest': {
    en: 'Send Request',
    ja: '申請を送信',
    es: 'Enviar Solicitud',
    fr: 'Envoyer la Demande',
    de: 'Anfrage Senden',
    ko: '요청 보내기',
    zh: '发送请求'
  },
  'friends.requestSent': {
    en: 'Friend request sent successfully!',
    ja: 'フレンド申請を送信しました！',
    es: '¡Solicitud de amistad enviada con éxito!',
    fr: 'Demande d\'ami envoyée avec succès!',
    de: 'Freundschaftsanfrage erfolgreich gesendet!',
    ko: '친구 요청을 성공적으로 보냈습니다!',
    zh: '好友请求发送成功！'
  },
  'friends.requestFailed': {
    en: 'Failed to send friend request. Please try again.',
    ja: 'フレンド申請の送信に失敗しました。もう一度お試しください。',
    es: 'No se pudo enviar la solicitud de amistad. Inténtalo de nuevo.',
    fr: 'Échec de l\'envoi de la demande d\'ami. Veuillez réessayer.',
    de: 'Freundschaftsanfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',
    ko: '친구 요청 전송에 실패했습니다. 다시 시도하세요.',
    zh: '发送好友请求失败。请重试。'
  },
  'friends.acceptFailed': {
    en: 'Failed to accept friend request. Please try again.',
    ja: 'フレンド承認に失敗しました。もう一度お試しください。',
    es: 'No se pudo aceptar la solicitud de amistad. Inténtalo de nuevo.',
    fr: 'Échec de l\'acceptation de la demande d\'ami. Veuillez réessayer.',
    de: 'Freundschaftsanfrage konnte nicht akzeptiert werden. Bitte versuchen Sie es erneut.',
    ko: '친구 요청 수락에 실패했습니다. 다시 시도하세요.',
    zh: '接受好友请求失败。请重试。'
  },
  // Memory
  'memory.title': {
    en: 'Memory',
    ja: 'メモリ',
    es: 'Memoria',
    fr: 'Mémoire',
    de: 'Gedächtnis',
    ko: '메모리',
    zh: '记忆'
  },
  'memory.description': {
    en: 'Manage AI memories and important information',
    ja: 'AIメモリと重要な情報を管理します',
    es: 'Gestiona memorias de IA e información importante',
    fr: 'Gérer les mémoires IA et les informations importantes',
    de: 'KI-Erinnerungen und wichtige Informationen verwalten',
    ko: 'AI 메모리 및 중요한 정보 관리',
    zh: '管理AI记忆和重要信息'
  },
  'memory.addMemory': {
    en: 'Add Memory',
    ja: 'メモリを追加',
    es: 'Agregar Memoria',
    fr: 'Ajouter une Mémoire',
    de: 'Erinnerung Hinzufügen',
    ko: '메모리 추가',
    zh: '添加记忆'
  },
  'memory.search': {
    en: 'Search memories...',
    ja: 'メモリを検索...',
    es: 'Buscar memorias...',
    fr: 'Rechercher des mémoires...',
    de: 'Erinnerungen suchen...',
    ko: '메모리 검색...',
    zh: '搜索记忆...'
  },
  'memory.filterCategory': {
    en: 'Filter by category',
    ja: 'カテゴリでフィルター',
    es: 'Filtrar por categoría',
    fr: 'Filtrer par catégorie',
    de: 'Nach Kategorie filtern',
    ko: '카테고리로 필터링',
    zh: '按类别过滤'
  },
  'memory.allCategories': {
    en: 'All Categories',
    ja: '全てのカテゴリ',
    es: 'Todas las Categorías',
    fr: 'Toutes les Catégories',
    de: 'Alle Kategorien',
    ko: '모든 카테고리',
    zh: '所有类别'
  },
  'memory.noMemories': {
    en: 'No memories yet',
    ja: 'まだメモリがありません',
    es: 'Aún no hay memorias',
    fr: 'Pas encore de mémoires',
    de: 'Noch keine Erinnerungen',
    ko: '아직 메모리가 없습니다',
    zh: '还没有记忆'
  },
  'memory.noMatch': {
    en: 'No memories match your search',
    ja: '検索結果が見つかりません',
    es: 'No hay memorias que coincidan',
    fr: 'Aucune mémoire ne correspond',
    de: 'Keine passenden Erinnerungen',
    ko: '검색 결과가 없습니다',
    zh: '没有匹配的记忆'
  },
  'memory.createFirst': {
    en: 'Create your first memory to help AI remember important information.',
    ja: 'AIに重要な情報を覚えてもらうために最初のメモリを作成しましょう。',
    es: 'Crea tu primera memoria para ayudar a la IA a recordar información importante.',
    fr: 'Créez votre première mémoire pour aider l\'IA à se souvenir d\'informations importantes.',
    de: 'Erstellen Sie Ihre erste Erinnerung, um der KI zu helfen, wichtige Informationen zu merken.',
    ko: 'AI가 중요한 정보를 기억하도록 첫 번째 메모리를 만드세요.',
    zh: '创建您的第一个记忆以帮助AI记住重要信息。'
  },
  'memory.adjustSearch': {
    en: 'Try adjusting your search or filter criteria.',
    ja: '検索条件やフィルターを変更してみてください。',
    es: 'Intenta ajustar tus criterios de búsqueda o filtro.',
    fr: 'Essayez d\'ajuster vos critères de recherche ou de filtre.',
    de: 'Versuchen Sie, Ihre Such- oder Filterkriterien anzupassen.',
    ko: '검색 또는 필터 조건을 조정해 보세요.',
    zh: '尝试调整您的搜索或过滤条件。'
  },
  'memory.createFirstButton': {
    en: 'Create First Memory',
    ja: '最初のメモリを作成',
    es: 'Crear Primera Memoria',
    fr: 'Créer la Première Mémoire',
    de: 'Erste Erinnerung Erstellen',
    ko: '첫 번째 메모리 만들기',
    zh: '创建第一个记忆'
  },
  'memory.edit': {
    en: 'Edit',
    ja: '編集',
    es: 'Editar',
    fr: 'Modifier',
    de: 'Bearbeiten',
    ko: '편집',
    zh: '编辑'
  },
  'memory.delete': {
    en: 'Delete',
    ja: '削除',
    es: 'Eliminar',
    fr: 'Supprimer',
    de: 'Löschen',
    ko: '삭제',
    zh: '删除'
  },
  'memory.confirmDelete': {
    en: 'Are you sure you want to delete this memory?',
    ja: 'このメモリを削除してもよろしいですか？',
    es: '¿Estás seguro de que quieres eliminar esta memoria?',
    fr: 'Êtes-vous sûr de vouloir supprimer cette mémoire?',
    de: 'Sind Sie sicher, dass Sie diese Erinnerung löschen möchten?',
    ko: '이 메모리를 삭제하시겠습니까?',
    zh: '您确定要删除这个记忆吗？'
  },
  'memory.addNew': {
    en: 'Add New Memory',
    ja: '新しいメモリを追加',
    es: 'Agregar Nueva Memoria',
    fr: 'Ajouter une Nouvelle Mémoire',
    de: 'Neue Erinnerung Hinzufügen',
    ko: '새 메모리 추가',
    zh: '添加新记忆'
  },
  'memory.memoryText': {
    en: 'Memory Text',
    ja: 'メモリの内容',
    es: 'Texto de Memoria',
    fr: 'Texte de Mémoire',
    de: 'Erinnerungstext',
    ko: '메모리 텍스트',
    zh: '记忆文本'
  },
  'memory.enterText': {
    en: 'Enter information you want AI to remember...',
    ja: 'AIに覚えてもらいたい情報を入力してください...',
    es: 'Ingrese información que desea que la IA recuerde...',
    fr: 'Entrez les informations que vous voulez que l\'IA se souvienne...',
    de: 'Geben Sie Informationen ein, die sich die KI merken soll...',
    ko: 'AI가 기억하기를 원하는 정보를 입력하세요...',
    zh: '输入您希望AI记住的信息...'
  },
  'memory.category': {
    en: 'Category',
    ja: 'カテゴリ',
    es: 'Categoría',
    fr: 'Catégorie',
    de: 'Kategorie',
    ko: '카테고리',
    zh: '类别'
  },
  'memory.selectCategory': {
    en: 'Select category (optional)',
    ja: 'カテゴリを選択（任意）',
    es: 'Seleccionar categoría (opcional)',
    fr: 'Sélectionner une catégorie (facultatif)',
    de: 'Kategorie auswählen (optional)',
    ko: '카테고리 선택 (선택사항)',
    zh: '选择类别（可选）'
  },
  'memory.personal': {
    en: 'Personal',
    ja: '個人',
    es: 'Personal',
    fr: 'Personnel',
    de: 'Persönlich',
    ko: '개인',
    zh: '个人'
  },
  'memory.work': {
    en: 'Work',
    ja: '仕事',
    es: 'Trabajo',
    fr: 'Travail',
    de: 'Arbeit',
    ko: '업무',
    zh: '工作'
  },
  'memory.ideas': {
    en: 'Ideas',
    ja: 'アイデア',
    es: 'Ideas',
    fr: 'Idées',
    de: 'Ideen',
    ko: '아이디어',
    zh: '想法'
  },
  'memory.important': {
    en: 'Important',
    ja: '重要',
    es: 'Importante',
    fr: 'Important',
    de: 'Wichtig',
    ko: '중요',
    zh: '重要'
  },
  'memory.other': {
    en: 'Other',
    ja: 'その他',
    es: 'Otro',
    fr: 'Autre',
    de: 'Andere',
    ko: '기타',
    zh: '其他'
  },
  'memory.characterCount': {
    en: 'characters',
    ja: '文字',
    es: 'caracteres',
    fr: 'caractères',
    de: 'Zeichen',
    ko: '글자',
    zh: '字符'
  },
  'memory.save': {
    en: 'Save Memory',
    ja: 'メモリを保存',
    es: 'Guardar Memoria',
    fr: 'Enregistrer la Mémoire',
    de: 'Erinnerung Speichern',
    ko: '메모리 저장',
    zh: '保存记忆'
  },
  'memory.saving': {
    en: 'Saving...',
    ja: '保存中...',
    es: 'Guardando...',
    fr: 'Enregistrement...',
    de: 'Speichern...',
    ko: '저장 중...',
    zh: '保存中...'
  },
  'memory.errorRequired': {
    en: 'Please enter memory content.',
    ja: 'メモリの内容を入力してください。',
    es: 'Por favor ingrese el contenido de la memoria.',
    fr: 'Veuillez entrer le contenu de la mémoire.',
    de: 'Bitte geben Sie den Erinnerungsinhalt ein.',
    ko: '메모리 내용을 입력하세요.',
    zh: '请输入记忆内容。'
  },
  'memory.errorTooLong': {
    en: 'Memory content must be 1000 characters or less.',
    ja: 'メモリの内容は1000文字以内で入力してください。',
    es: 'El contenido de la memoria debe tener 1000 caracteres o menos.',
    fr: 'Le contenu de la mémoire doit contenir 1000 caractères ou moins.',
    de: 'Der Erinnerungsinhalt muss 1000 Zeichen oder weniger enthalten.',
    ko: '메모리 내용은 1000자 이하여야 합니다.',
    zh: '记忆内容必须是1000个字符或更少。'
  },
  'memory.successCreated': {
    en: 'Memory created successfully!',
    ja: 'メモリを作成しました！',
    es: '¡Memoria creada con éxito!',
    fr: 'Mémoire créée avec succès!',
    de: 'Erinnerung erfolgreich erstellt!',
    ko: '메모리가 성공적으로 생성되었습니다!',
    zh: '记忆创建成功！'
  },
  'memory.errorCreating': {
    en: 'Failed to create memory. Please try again.',
    ja: 'メモリの作成に失敗しました。もう一度お試しください。',
    es: 'No se pudo crear la memoria. Inténtalo de nuevo.',
    fr: 'Échec de la création de la mémoire. Veuillez réessayer.',
    de: 'Erinnerung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
    ko: '메모리 생성에 실패했습니다. 다시 시도하세요.',
    zh: '创建记忆失败。请重试。'
  },
  // Upgrade
  'upgrade.title': {
    en: 'Upgrade Your AI Experience',
    ja: 'AIエクスペリエンスをアップグレード',
    es: 'Mejora Tu Experiencia de IA',
    fr: 'Améliorez Votre Expérience IA',
    de: 'Verbessern Sie Ihre KI-Erfahrung',
    ko: 'AI 경험 업그레이드',
    zh: '升级您的AI体验'
  },
  'upgrade.subtitle': {
    en: 'Unlock advanced AI models, unlimited features, and premium support to enhance your voice conversations.',
    ja: '高度なAIモデル、無制限機能、プレミアムサポートでボイス会話を強化しましょう。',
    es: 'Desbloquea modelos de IA avanzados, funciones ilimitadas y soporte premium para mejorar tus conversaciones de voz.',
    fr: 'Débloquez des modèles IA avancés, des fonctionnalités illimitées et un support premium pour améliorer vos conversations vocales.',
    de: 'Schalten Sie erweiterte KI-Modelle, unbegrenzte Funktionen und Premium-Support frei, um Ihre Sprachgespräche zu verbessern.',
    ko: '음성 대화를 향상시키기 위해 고급 AI 모델, 무제한 기능 및 프리미엄 지원을 잠금 해제하세요.',
    zh: '解锁高级AI模型、无限功能和高级支持，增强您的语音对话。'
  },
  'upgrade.currentPlan': {
    en: 'Current Plan',
    ja: '現在のプラン',
    es: 'Plan Actual',
    fr: 'Plan Actuel',
    de: 'Aktueller Plan',
    ko: '현재 플랜',
    zh: '当前计划'
  },
  'upgrade.unlockPremium': {
    en: 'Upgrade to unlock premium features',
    ja: 'プレミアム機能を利用するにはアップグレードしてください',
    es: 'Actualiza para desbloquear funciones premium',
    fr: 'Passez à la version supérieure pour débloquer les fonctionnalités premium',
    de: 'Upgraden Sie, um Premium-Funktionen freizuschalten',
    ko: '프리미엄 기능을 잠금 해제하려면 업그레이드하세요',
    zh: '升级以解锁高级功能'
  },
  'upgrade.alreadyPremium': {
    en: 'You already have premium access!',
    ja: '既にプレミアムアクセスをお持ちです！',
    es: '¡Ya tienes acceso premium!',
    fr: 'Vous avez déjà un accès premium!',
    de: 'Sie haben bereits Premium-Zugang!',
    ko: '이미 프리미엄 액세스 권한이 있습니다!',
    zh: '您已经拥有高级访问权限！'
  },
  'upgrade.thankYou': {
    en: 'Thank you for being a premium subscriber!',
    ja: 'プレミアム会員になっていただきありがとうございます！',
    es: '¡Gracias por ser un suscriptor premium!',
    fr: 'Merci d\'être un abonné premium!',
    de: 'Vielen Dank, dass Sie Premium-Abonnent sind!',
    ko: '프리미엄 구독자가 되어 주셔서 감사합니다!',
    zh: '感谢您成为高级订阅者！'
  },
  'upgrade.active': {
    en: 'Active',
    ja: '有効',
    es: 'Activo',
    fr: 'Actif',
    de: 'Aktiv',
    ko: '활성',
    zh: '激活'
  },
  'upgrade.free': {
    en: 'Free',
    ja: '無料',
    es: 'Gratis',
    fr: 'Gratuit',
    de: 'Kostenlos',
    ko: '무료',
    zh: '免费'
  },
  'upgrade.premiumAccessActive': {
    en: 'Premium Access Active',
    ja: 'プレミアムアクセス有効',
    es: 'Acceso Premium Activo',
    fr: 'Accès Premium Actif',
    de: 'Premium-Zugang Aktiv',
    ko: '프리미엄 액세스 활성',
    zh: '高级访问激活'
  },
  'upgrade.enjoyFeatures': {
    en: 'You already have access to all premium features. Enjoy your enhanced AI experience!',
    ja: '全てのプレミアム機能にアクセスできます。強化されたAI体験をお楽しみください！',
    es: 'Ya tienes acceso a todas las funciones premium. ¡Disfruta de tu experiencia de IA mejorada!',
    fr: 'Vous avez déjà accès à toutes les fonctionnalités premium. Profitez de votre expérience IA améliorée!',
    de: 'Sie haben bereits Zugriff auf alle Premium-Funktionen. Genießen Sie Ihre verbesserte KI-Erfahrung!',
    ko: '이미 모든 프리미엄 기능에 액세스할 수 있습니다. 향상된 AI 경험을 즐기세요!',
    zh: '您已经可以访问所有高级功能。享受您增强的AI体验！'
  },
  'upgrade.goToDashboard': {
    en: 'Go to Dashboard',
    ja: 'ダッシュボードへ',
    es: 'Ir al Panel',
    fr: 'Aller au Tableau de bord',
    de: 'Zum Dashboard',
    ko: '대시보드로 이동',
    zh: '前往仪表板'
  },
  'upgrade.tryPremiumFeatures': {
    en: 'Try Premium Features',
    ja: 'プレミアム機能を試す',
    es: 'Probar Funciones Premium',
    fr: 'Essayer les Fonctionnalités Premium',
    de: 'Premium-Funktionen Ausprobieren',
    ko: '프리미엄 기능 사용해보기',
    zh: '尝试高级功能'
  },
  'upgrade.loggedInAs': {
    en: 'Logged in as',
    ja: 'ログイン中',
    es: 'Conectado como',
    fr: 'Connecté en tant que',
    de: 'Angemeldet als',
    ko: '로그인 중',
    zh: '登录为'
  },
  'upgrade.paymentInfo': {
    en: 'Payment Information',
    ja: '支払い情報',
    es: 'Información de Pago',
    fr: 'Informations de Paiement',
    de: 'Zahlungsinformationen',
    ko: '결제 정보',
    zh: '支付信息'
  },
  'upgrade.stripeSecure': {
    en: 'Your email address will be collected securely during the payment process with Stripe.',
    ja: 'お客様のメールアドレスはStripeの支払いプロセス中に安全に収集されます。',
    es: 'Su dirección de correo electrónico se recopilará de forma segura durante el proceso de pago con Stripe.',
    fr: 'Votre adresse e-mail sera collectée en toute sécurité pendant le processus de paiement avec Stripe.',
    de: 'Ihre E-Mail-Adresse wird während des Zahlungsvorgangs mit Stripe sicher erfasst.',
    ko: '결제 과정에서 Stripe를 통해 이메일 주소가 안전하게 수집됩니다.',
    zh: '您的电子邮件地址将在Stripe支付过程中安全收集。'
  },
  'upgrade.monthly': {
    en: 'Monthly',
    ja: '月額',
    es: 'Mensual',
    fr: 'Mensuel',
    de: 'Monatlich',
    ko: '월간',
    zh: '每月'
  },
  'upgrade.yearly': {
    en: 'Yearly',
    ja: '年額',
    es: 'Anual',
    fr: 'Annuel',
    de: 'Jährlich',
    ko: '연간',
    zh: '每年'
  },
  'upgrade.savePercent': {
    en: 'Save 17%',
    ja: '17%お得',
    es: 'Ahorra 17%',
    fr: 'Économisez 17%',
    de: 'Sparen Sie 17%',
    ko: '17% 절약',
    zh: '节省17%'
  },
  'upgrade.planFree': {
    en: 'Free',
    ja: '無料',
    es: 'Gratis',
    fr: 'Gratuit',
    de: 'Kostenlos',
    ko: '무료',
    zh: '免费'
  },
  'upgrade.planPremium': {
    en: 'Premium',
    ja: 'プレミアム',
    es: 'Premium',
    fr: 'Premium',
    de: 'Premium',
    ko: '프리미엄',
    zh: '高级会员'
  },
  'upgrade.planEnterprise': {
    en: 'Enterprise',
    ja: 'エンタープライズ',
    es: 'Empresarial',
    fr: 'Entreprise',
    de: 'Unternehmen',
    ko: '기업',
    zh: '企业版'
  },
  'upgrade.freeDesc': {
    en: 'Perfect for getting started',
    ja: '始めるのに最適',
    es: 'Perfecto para empezar',
    fr: 'Parfait pour commencer',
    de: 'Perfekt für den Einstieg',
    ko: '시작하기에 완벽',
    zh: '非常适合入门'
  },
  'upgrade.premiumDesc': {
    en: 'Most popular choice for power users',
    ja: 'パワーユーザーに最も人気',
    es: 'La opción más popular para usuarios avanzados',
    fr: 'Le choix le plus populaire pour les utilisateurs avancés',
    de: 'Beliebteste Wahl für Power-User',
    ko: '파워 유저에게 가장 인기 있는 선택',
    zh: '高级用户的最受欢迎选择'
  },
  'upgrade.enterpriseDesc': {
    en: 'For teams and organizations',
    ja: 'チームと組織向け',
    es: 'Para equipos y organizaciones',
    fr: 'Pour les équipes et les organisations',
    de: 'Für Teams und Organisationen',
    ko: '팀 및 조직용',
    zh: '适用于团队和组织'
  },
  'upgrade.forever': {
    en: 'forever',
    ja: '永久',
    es: 'para siempre',
    fr: 'pour toujours',
    de: 'für immer',
    ko: '영구',
    zh: '永久'
  },
  'upgrade.perMonth': {
    en: '/month',
    ja: '/月',
    es: '/mes',
    fr: '/mois',
    de: '/Monat',
    ko: '/월',
    zh: '/月'
  },
  'upgrade.perYear': {
    en: '/year',
    ja: '/年',
    es: '/año',
    fr: '/an',
    de: '/Jahr',
    ko: '/년',
    zh: '/年'
  },
  'upgrade.mostPopular': {
    en: 'Most Popular',
    ja: '最も人気',
    es: 'Más Popular',
    fr: 'Le Plus Populaire',
    de: 'Am Beliebtesten',
    ko: '가장 인기 있음',
    zh: '最受欢迎'
  },
  'upgrade.currentPlanBadge': {
    en: 'Current Plan',
    ja: '現在のプラン',
    es: 'Plan Actual',
    fr: 'Plan Actuel',
    de: 'Aktueller Plan',
    ko: '현재 플랜',
    zh: '当前计划'
  },
  'upgrade.choosePlan': {
    en: 'Choose Plan',
    ja: 'プランを選択',
    es: 'Elegir Plan',
    fr: 'Choisir le Plan',
    de: 'Plan Wählen',
    ko: '플랜 선택',
    zh: '选择计划'
  },
  'upgrade.upgrading': {
    en: 'Upgrading...',
    ja: 'アップグレード中...',
    es: 'Actualizando...',
    fr: 'Mise à niveau...',
    de: 'Upgraden...',
    ko: '업그레이드 중...',
    zh: '升级中...'
  },
  // Plan Features
  'upgrade.feature.deepseekModel': {
    en: 'DeepSeek AI model',
    ja: 'DeepSeek AIモデル',
    es: 'Modelo DeepSeek IA',
    fr: 'Modèle DeepSeek IA',
    de: 'DeepSeek KI-Modell',
    ko: 'DeepSeek AI 모델',
    zh: 'DeepSeek AI模型'
  },
  'upgrade.feature.memories10': {
    en: '10 memories',
    ja: '10個のメモリ',
    es: '10 memorias',
    fr: '10 mémoires',
    de: '10 Erinnerungen',
    ko: '10개 메모리',
    zh: '10个记忆'
  },
  'upgrade.feature.friends5': {
    en: '5 friend connections',
    ja: '5人のフレンド接続',
    es: '5 conexiones de amigos',
    fr: '5 connexions d\'amis',
    de: '5 Freundschaftsverbindungen',
    ko: '5명의 친구 연결',
    zh: '5位朋友连接'
  },
  'upgrade.feature.basicVoice': {
    en: 'Basic voice features',
    ja: '基本音声機能',
    es: 'Funciones de voz básicas',
    fr: 'Fonctionnalités vocales de base',
    de: 'Grundlegende Sprachfunktionen',
    ko: '기본 음성 기능',
    zh: '基本语音功能'
  },
  'upgrade.feature.communitySupport': {
    en: 'Community support',
    ja: 'コミュニティサポート',
    es: 'Soporte comunitario',
    fr: 'Support communautaire',
    de: 'Community-Support',
    ko: '커뮤니티 지원',
    zh: '社区支持'
  },
  'upgrade.feature.deepseekChatgpt': {
    en: 'DeepSeek + ChatGPT models',
    ja: 'DeepSeek + ChatGPTモデル',
    es: 'Modelos DeepSeek + ChatGPT',
    fr: 'Modèles DeepSeek + ChatGPT',
    de: 'DeepSeek + ChatGPT Modelle',
    ko: 'DeepSeek + ChatGPT 모델',
    zh: 'DeepSeek + ChatGPT模型'
  },
  'upgrade.feature.unlimitedMemories': {
    en: 'Unlimited memories',
    ja: '無制限のメモリ',
    es: 'Memorias ilimitadas',
    fr: 'Mémoires illimitées',
    de: 'Unbegrenzte Erinnerungen',
    ko: '무제한 메모리',
    zh: '无限记忆'
  },
  'upgrade.feature.unlimitedFriends': {
    en: 'Unlimited friends',
    ja: '無制限のフレンド',
    es: 'Amigos ilimitados',
    fr: 'Amis illimités',
    de: 'Unbegrenzte Freunde',
    ko: '무제한 친구',
    zh: '无限朋友'
  },
  'upgrade.feature.advancedVoice': {
    en: 'Advanced voice features',
    ja: '高度な音声機能',
    es: 'Funciones de voz avanzadas',
    fr: 'Fonctionnalités vocales avancées',
    de: 'Erweiterte Sprachfunktionen',
    ko: '고급 음성 기능',
    zh: '高级语音功能'
  },
  'upgrade.feature.prioritySupport': {
    en: 'Priority support',
    ja: '優先サポート',
    es: 'Soporte prioritario',
    fr: 'Support prioritaire',
    de: 'Prioritäts-Support',
    ko: '우선 지원',
    zh: '优先支持'
  },
  'upgrade.feature.customAI': {
    en: 'Custom AI personalities',
    ja: 'カスタムAIパーソナリティ',
    es: 'Personalidades IA personalizadas',
    fr: 'Personnalités IA personnalisées',
    de: 'Benutzerdefinierte KI-Persönlichkeiten',
    ko: '맞춤형 AI 성격',
    zh: '自定义AI个性'
  },
  'upgrade.feature.allModels': {
    en: 'All AI models (DeepSeek, ChatGPT, Claude)',
    ja: '全AIモデル（DeepSeek、ChatGPT、Claude）',
    es: 'Todos los modelos de IA (DeepSeek, ChatGPT, Claude)',
    fr: 'Tous les modèles IA (DeepSeek, ChatGPT, Claude)',
    de: 'Alle KI-Modelle (DeepSeek, ChatGPT, Claude)',
    ko: '모든 AI 모델 (DeepSeek, ChatGPT, Claude)',
    zh: '所有AI模型（DeepSeek、ChatGPT、Claude）'
  },
  'upgrade.feature.unlimitedEverything': {
    en: 'Unlimited everything',
    ja: '全て無制限',
    es: 'Todo ilimitado',
    fr: 'Tout illimité',
    de: 'Alles unbegrenzt',
    ko: '모든 것 무제한',
    zh: '一切无限'
  },
  'upgrade.feature.teamManagement': {
    en: 'Team management',
    ja: 'チーム管理',
    es: 'Gestión de equipos',
    fr: 'Gestion d\'équipe',
    de: 'Team-Management',
    ko: '팀 관리',
    zh: '团队管理'
  },
  'upgrade.feature.advancedSecurity': {
    en: 'Advanced security features',
    ja: '高度なセキュリティ機能',
    es: 'Funciones de seguridad avanzadas',
    fr: 'Fonctionnalités de sécurité avancées',
    de: 'Erweiterte Sicherheitsfunktionen',
    ko: '고급 보안 기능',
    zh: '高级安全功能'
  },
  'upgrade.feature.multiLanguage': {
    en: 'Multi-language support',
    ja: '多言語サポート',
    es: 'Soporte multiidioma',
    fr: 'Support multilingue',
    de: 'Mehrsprachiger Support',
    ko: '다국어 지원',
    zh: '多语言支持'
  },
  'upgrade.feature.apiAccess': {
    en: 'API access',
    ja: 'APIアクセス',
    es: 'Acceso a API',
    fr: 'Accès API',
    de: 'API-Zugriff',
    ko: 'API 액세스',
    zh: 'API访问'
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