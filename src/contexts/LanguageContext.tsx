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