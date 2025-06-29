import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import api from '../services/api';

const DeviceRegistration: React.FC = () => {
  const [deviceNumber, setDeviceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // 重複送信を防ぐ

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Sending device registration request for device:', deviceNumber);

      // api.tsのAPIService経由でリクエスト
      const data = await api.device.exists(deviceNumber);
      console.log('Response data:', data);
      console.log('Token type:', typeof data.token);
      console.log('Token value:', data.token);

      if (data && data.token && data.user) {
        try {
          // デバッグ: 保存前のデータ確認
          console.log('Saving auth data:', {
            token: data.token,
            tokenType: typeof data.token,
            user: data.user
          });

          // 認証情報を保存してダッシュボードにリダイレクト
          await login(data.token, data.user);
          navigate('/');
          
        } catch (storageError) {
          console.error('Error saving auth data:', storageError);
          setError('認証情報の保存に失敗しました');
        }
      } else {
        console.error('Missing token or user data:', data);
        setError('サーバーからの応答が不正です');
      }
    } catch (err: any) {
      console.error('Device registration error:', err);
      setError(err.message || 'デバイス登録に失敗しました');
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