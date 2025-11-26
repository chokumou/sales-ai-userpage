import React, { useEffect, useState } from 'react';
import { Smartphone, Download, Share2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Install: React.FC = () => {
  const { t } = useLanguage();
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // OS判定
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // デバッグ情報を収集
    const debugMessages: string[] = [];
    debugMessages.push(`User Agent: ${userAgent}`);
    debugMessages.push(`Is iOS: ${isIOSDevice}`);
    debugMessages.push(`Is Android: ${isAndroidDevice}`);
    debugMessages.push(`Is Standalone: ${window.matchMedia('(display-mode: standalone)').matches}`);
    debugMessages.push(`Is HTTPS: ${window.location.protocol === 'https:'}`);
    debugMessages.push(`Service Worker: ${'serviceWorker' in navigator ? 'Supported' : 'Not supported'}`);
    
    // Service Workerの登録状態を確認
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          debugMessages.push(`Service Worker registered: ${registrations.length} registration(s)`);
          registrations.forEach((reg, index) => {
            debugMessages.push(`  Registration ${index + 1}: ${reg.scope}`);
          });
        } else {
          debugMessages.push('⚠️ Service Worker not registered');
        }
        
        // manifest.jsonの確認
        fetch('/manifest.webmanifest')
          .then(res => res.json())
          .then(manifest => {
            debugMessages.push(`Manifest loaded: ${manifest.name || 'N/A'}`);
            debugMessages.push(`Icons count: ${manifest.icons?.length || 0}`);
            if (manifest.icons) {
              manifest.icons.forEach((icon: any, index: number) => {
                debugMessages.push(`  Icon ${index + 1}: ${icon.src} (${icon.sizes})`);
              });
            }
            setDebugInfo(debugMessages.join('\n'));
          })
          .catch(err => {
            debugMessages.push(`⚠️ Manifest error: ${err.message}`);
            setDebugInfo(debugMessages.join('\n'));
          });
      });
    } else {
      setDebugInfo(debugMessages.join('\n'));
    }

    // PWAインストール済みかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      debugMessages.push('Already installed (standalone mode)');
      setDebugInfo(debugMessages.join('\n'));
      return; // インストール済みの場合は何もしない
    }

    // Android用のインストールプロンプトをキャッチ
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      debugMessages.push('Install prompt received!');
      setDebugInfo(debugMessages.join('\n'));
      console.log('Install prompt available', e);
    };

    // beforeinstallpromptイベントを待つ
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    debugMessages.push('Waiting for beforeinstallprompt event...');
    setDebugInfo(debugMessages.join('\n'));

    // 少し待ってから、イベントが発火しなかった場合のデバッグ情報を更新
    const timeout = setTimeout(() => {
      if (!deferredPrompt) {
        debugMessages.push('⚠️ beforeinstallprompt event not received after 3 seconds');
        debugMessages.push('Possible reasons:');
        debugMessages.push('1. Already installed');
        debugMessages.push('2. PWA criteria not met');
        debugMessages.push('3. Browser does not support');
        debugMessages.push('4. Service Worker not registered');
        setDebugInfo(debugMessages.join('\n'));
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timeout);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">インストール完了！</h1>
          <p className="text-gray-600 mb-6">
            アプリが正常にインストールされました。
            ホーム画面のアイコンからアプリを起動できます。
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            ログインする
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Smartphone className="w-20 h-20 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">アプリをインストール</h1>
          <p className="text-xl text-gray-600">
            Nekotaアプリをホーム画面に追加して、より快適にご利用ください
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Android用の説明 */}
          {isAndroid && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Androidの場合</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    1
                  </span>
                  <p className="text-gray-700 pt-1">
                    このページをChromeで開いてください
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    2
                  </span>
                  <p className="text-gray-700 pt-1">
                    画面下部に「インストール」ボタンが自動で表示されます
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    3
                  </span>
                  <p className="text-gray-700 pt-1">
                    「インストール」をタップしてください
                  </p>
                </div>
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    今すぐインストール
                  </button>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-bold mb-2">
                        ⚠️ インストールボタンが表示されません
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        <li>Chromeブラウザで開いているか確認してください</li>
                        <li>ページをリロードしてみてください</li>
                        <li>数秒待ってから再度確認してください</li>
                        <li>既にインストール済みの場合は、ホーム画面のアイコンから起動できます</li>
                      </ul>
                    </div>
                    {/* デバッグ情報（開発用） */}
                    {debugInfo && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                          デバッグ情報を表示
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {debugInfo}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* iOS用の説明 */}
          {isIOS && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">iPhoneの場合</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    1
                  </span>
                  <p className="text-gray-700 pt-1">
                    Safariでこのページを開いてください
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    2
                  </span>
                  <p className="text-gray-700 pt-1">
                    画面下部の共有ボタン
                    <Share2 className="w-4 h-4 inline mx-1" />
                    をタップ
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    3
                  </span>
                  <p className="text-gray-700 pt-1">
                    「ホーム画面に追加」を選択
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                    4
                  </span>
                  <p className="text-gray-700 pt-1">
                    「追加」をタップして完了
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* デフォルト（OS判定できない場合） */}
          {!isIOS && !isAndroid && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Androidの場合</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      1
                    </span>
                    <p className="text-gray-700 pt-1">
                      このページをChromeで開いてください
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      2
                    </span>
                    <p className="text-gray-700 pt-1">
                      画面下部に「インストール」ボタンが自動で表示されます
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      3
                    </span>
                    <p className="text-gray-700 pt-1">
                      「インストール」をタップしてください
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">iPhoneの場合</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      1
                    </span>
                    <p className="text-gray-700 pt-1">
                      Safariでこのページを開いてください
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      2
                    </span>
                    <p className="text-gray-700 pt-1">
                      画面下部の共有ボタン
                      <Share2 className="w-4 h-4 inline mx-1" />
                      をタップ
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      3
                    </span>
                    <p className="text-gray-700 pt-1">
                      「ホーム画面に追加」を選択
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      4
                    </span>
                    <p className="text-gray-700 pt-1">
                      「追加」をタップして完了
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* QRコード説明 */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">QRコードからアクセス</h2>
          <p className="text-gray-600 mb-6">
            商品に同梱のQRコードをスキャンして、このページにアクセスできます。
            その後、上記の手順に従ってアプリをインストールしてください。
          </p>
        </div>

        {/* ログインボタン */}
        <div className="text-center mt-8">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            ログイン画面へ
          </a>
        </div>
      </div>
    </div>
  );
};

export default Install;

