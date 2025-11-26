import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // PWAインストールバナーの抑制
  useEffect(() => {
    // インストール済みかチェック（standalone mode = アプリとして起動）
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // インストール済みの場合は、自動バナーを抑制
    if (isInstalled) {
      return;
    }

    // /installページでは抑制しない（そのページでインストールできるようにする）
    if (window.location.pathname === '/install') {
      return;
    }

    // その他のページでは、自動バナーを抑制
    // （ユーザーが明示的に/installページでインストールするため）
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // バナーを抑制（ユーザーが/installページでインストールできる）
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
        }`}
      >
        <Sidebar
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          onToggle={() => {
            if (isMobile) {
              setIsMobileMenuOpen(false);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          onNavClick={() => {
            if (isMobile) {
              setIsMobileMenuOpen(false);
            }
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`p-6 ${isMobile ? 'pt-20' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;