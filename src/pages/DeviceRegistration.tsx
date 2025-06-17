import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';

const DeviceRegistration: React.FC = () => {
  const [deviceNumber, setDeviceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    // すでにログインしている場合はダッシュボードにリダイレクト
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // 重複送信を防ぐ

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Sending request to:', `${import.meta.env.VITE_API_BASE_URL}/api/device/exists`);
      console.log('Request body:', { device_number: deviceNumber });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/device/exists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_number: deviceNumber }),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        if (!data.token || !data.user) {
          console.error('Missing token or user data:', data);
          setError('サーバーからの応答が不正です');
          return;
        }

        try {
          // デバッグ: 保存前のデータ確認
          console.log('Saving auth data:', {
            token: data.token,
            user: data.user
          });

          // 認証情報を保存
          login(data.token, data.user);
          
          // デバッグ: コンテキスト更新後の状態確認
          console.log('Auth context after update:', {
            user: data.user,
            isAuthenticated: true
          });
          
          // ダッシュボードにリダイレクト
          navigate('/');
        } catch (storageError) {
          console.error('Error saving auth data:', storageError);
          setError('認証情報の保存に失敗しました');
        }
      } else {
        console.error('API error:', data);
        setError(data.detail || 'デバイス登録に失敗しました');
      }
    } catch (err) {
      console.error('Device registration error:', err);
      setError('サーバーとの通信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          デバイス登録
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          デバイスに表示されている番号を入力してください
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="deviceNumber"
            label="デバイス番号"
            name="deviceNumber"
            autoComplete="off"
            value={deviceNumber}
            onChange={(e) => setDeviceNumber(e.target.value)}
            error={!!error}
            disabled={isSubmitting}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '登録'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default DeviceRegistration; 