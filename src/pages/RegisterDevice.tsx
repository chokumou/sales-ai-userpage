// @ts-nocheck
import React, { useState } from 'react';
import { v5 as uuidv5 } from 'uuid';
import { digest } from 'js-crypto-hash';

// サーバーと同じアルゴリズムで端末番号からUUIDを生成
async function generateDeviceUUID(deviceNumber: string): Promise<string> {
  // SHA-256でハッシュ化
  const hashBuffer = await digest('SHA-256', new TextEncoder().encode(deviceNumber));
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  // UUID v5で生成
  const namespace = uuidv5.DNS;
  return uuidv5(hashHex, namespace);
}

const RegisterDevice: React.FC = () => {
  const [deviceNumber, setDeviceNumber] = useState('');
  const [checking, setChecking] = useState(false);
  const [exists, setExists] = useState<boolean|null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input'|'registering'|'done'>('input');
  const [userId, setUserId] = useState('');
  const [jwt, setJwt] = useState('');

  const handleCheck = async () => {
    setChecking(true);
    setError('');
    setExists(null);
    try {
      const res = await fetch('/api/device/exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_number: deviceNumber })
      });
      if (!res.ok) throw new Error('APIエラー');
      const data = await res.json();
      setExists(data.exists);
      if (!data.exists) {
        setError('この端末番号は存在しません');
        return;
      }
      setStep('registering');
      await handleRegister(deviceNumber);
    } catch (e) {
      setError('API通信エラー');
    } finally {
      setChecking(false);
    }
  };

  // ユーザーID発行・Supabaseユーザー登録・JWT取得のダミー処理
  const handleRegister = async (deviceNumber: string) => {
    // 1. UUID生成
    const uuid = await generateDeviceUUID(deviceNumber);
    setUserId(uuid);
    // 2. Supabaseユーザー登録（本番はAPI経由で）
    // 3. usersテーブル登録（本番はAPI経由で）
    // 4. JWT取得（本番はSupabase認証API経由で）
    setTimeout(() => {
      setJwt('dummy-jwt-token-for-' + uuid);
      setStep('done');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">端末番号でユーザー登録</h2>
        {step === 'input' && (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">端末番号</label>
              <input
                type="text"
                value={deviceNumber}
                onChange={e => setDeviceNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="例: 704764"
                disabled={checking}
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={checking || !deviceNumber}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {checking ? '確認中...' : '端末番号を確認'}
            </button>
            {error && (
              <div className="mt-4 text-red-600">{error}</div>
            )}
          </>
        )}
        {step === 'registering' && (
          <div className="mt-4 text-blue-600 font-bold">ユーザーID発行・登録処理中...</div>
        )}
        {step === 'done' && (
          <div className="mt-4 text-green-600 font-bold">
            ユーザー登録が完了しました！<br />
            <div className="mt-2 text-sm text-gray-700">ユーザーID: {userId}</div>
            <div className="mt-2 text-sm text-gray-700">JWT: {jwt}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterDevice; 