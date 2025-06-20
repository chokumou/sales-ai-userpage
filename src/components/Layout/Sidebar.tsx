import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Mic,
  Brain,
  Users,
  CreditCard,
  Receipt,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  User,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const navItems = [
    { to: '/', icon: Home, label: t('nav.dashboard') },
    { to: '/voice', icon: Mic, label: t('nav.voice') },
    { to: '/memory', icon: Brain, label: t('nav.memory') },
    { to: '/friends', icon: Users, label: t('nav.friends') },
    { to: '/alarm', icon: Clock, label: t('nav.alarm') || 'Alarms' },
    { to: '/upgrade', icon: CreditCard, label: t('nav.upgrade') },
    { to: '/payments', icon: Receipt, label: t('nav.payments') },
  ];

  if (user?.id === 'admin') {
    navItems.push({ to: '/admin', icon: Settings, label: t('nav.admin') });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Nekota</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.profile?.introduction || user?.id || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.subscription?.plan || 'Free'} Plan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Language Selector */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium truncate">
                {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
              </span>
            )}
          </button>
          
          {showLanguageMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span>{lang.flag}</span>
                  {!isCollapsed && <span>{lang.name}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">{t('auth.logout') || 'Logout'}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;