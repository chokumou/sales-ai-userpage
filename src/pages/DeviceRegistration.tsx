import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const DeviceRegistration: React.FC = () => {
  const [deviceNumber, setDeviceNumber] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/device/exists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_number: deviceNumber }),
      });

      if (response.ok) {
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.detail || 'デバイス番号が無効です');
      }
    } catch (err) {
      setError('接続エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            デバイス登録
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            デバイス番号を入力してください
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="device-number" className="sr-only">
              デバイス番号
            </label>
            <input
              id="device-number"
              name="device-number"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="デバイス番号"
              value={deviceNumber}
              onChange={(e) => setDeviceNumber(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceRegistration; 