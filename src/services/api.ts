const API_BASE_URL = 'http://localhost:8080';

class APIService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
    console.log('API Token set:', token ? 'Token present' : 'No token');
  }

  // 現在のユーザーIDを取得するヘルパーメソッド
  private getCurrentUserId(): string | null {
    const token = this.token;
    if (!token) return null;
    
    try {
      // JWTトークンをデコードしてユーザーIDを取得
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub;
    } catch (error) {
      console.error('JWTトークンのデコードに失敗:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check if we're in demo mode (mock token)
    const isDemoMode = this.token?.startsWith('mock_jwt_token_');
    
    if (isDemoMode) {
      console.log(`[DEMO MODE] API Request: ${options.method || 'GET'} ${endpoint}`);
      return this.getMockData<T>(endpoint, options);
    }

    // Real API call
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add custom headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('Authorization header added:', `Bearer ${this.token.substring(0, 20)}...`);
    }

    console.log(`API Request: ${options.method || 'GET'} ${url}`, {
      headers,
      body: options.body
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Handle specific error codes
        switch (response.status) {
          case 401:
            throw new Error('認証が必要です。ログインし直してください。');
          case 403:
            throw new Error('この操作を実行する権限がありません。');
          case 422:
            throw new Error('入力データが無効です。内容を確認してください。');
          case 500:
            throw new Error('サーバーエラーが発生しました。しばらく待ってから再試行してください。');
          default:
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('API Response Data:', data);
      return data;
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  private async getMockData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    console.log(`[MOCK] ${options.method || 'GET'} ${endpoint}`, options.body);

    // Mock responses based on endpoint
    if (endpoint.includes('/auth/user/token')) {
      return {
        access_token: `mock_token_${Date.now()}`,
        user: {
          id: 'demo_user',
          profile: { introduction: 'Demo user', language: 'en' },
          subscription: { plan: 'premium', model: 'chatgpt' }
        }
      } as T;
    }

    if (endpoint.includes('/api/user/profile')) {
      return {
        id: 'demo_user',
        message_count: 150,
        profile: { introduction: 'Demo user', language: 'en' },
        subscription: { plan: 'premium', model: 'chatgpt' }
      } as T;
    }

    if (endpoint.includes('/api/user/model')) {
      if (options.method === 'PATCH') {
        return { success: true, model: JSON.parse(options.body as string).model } as T;
      }
      return { model: 'deepseek' } as T;
    }

    if (endpoint.includes('/api/memory/')) {
      if (options.method === 'POST') {
        const requestBody = JSON.parse(options.body as string);
        console.log('[MOCK] Creating memory:', requestBody);
        
        // Validate input
        if (!requestBody.text || requestBody.text.trim().length === 0) {
          throw new Error('メモリの内容を入力してください。');
        }
        
        if (requestBody.text.length > 1000) {
          throw new Error('メモリの内容は1000文字以内で入力してください。');
        }

        // Simulate successful creation
        return { 
          id: `memory_${Date.now()}`, 
          user_id: requestBody.user_id,
          text: requestBody.text,
          timestamp: new Date().toISOString(),
          category: requestBody.category || null
        } as T;
      }
      
      if (options.method === 'DELETE') {
        console.log('[MOCK] Deleting memory:', endpoint);
        return { success: true } as T;
      }

      // GET request - return paginated memories
      const url = new URL(`http://localhost${endpoint}`);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      const allMemories = [
        {
          id: '1',
          user_id: 'demo_user',
          text: '朝のミーティングを好む',
          timestamp: new Date().toISOString(),
          category: 'Work'
        },
        {
          id: '2',
          user_id: 'demo_user',
          text: '好きなコーヒーはカプチーノ',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          category: 'Personal'
        },
        {
          id: '3',
          user_id: 'demo_user',
          text: 'プログラミング言語はTypeScriptが得意',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Work'
        },
        {
          id: '4',
          user_id: 'demo_user',
          text: '週末は読書をして過ごすことが多い',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Personal'
        },
        {
          id: '5',
          user_id: 'demo_user',
          text: 'AIと機械学習に興味がある',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Ideas'
        }
      ];

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMemories = allMemories.slice(startIndex, endIndex);
      
      return {
        memories: paginatedMemories,
        total: allMemories.length,
        page: page,
        pages: Math.ceil(allMemories.length / limit)
      } as T;
    }

    if (endpoint.includes('/api/friend/list')) {
      return [
        {
          id: '1',
          user_id: 'friend1',
          name: 'Alice Johnson',
          introduction: 'AI enthusiast and developer',
          status: 'online',
          has_unread_messages: true,
          last_message_time: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'friend2',
          name: 'Bob Smith',
          introduction: 'Voice technology researcher',
          status: 'offline',
          has_unread_messages: false,
          last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ] as T;
    }

    if (endpoint.includes('/api/friend/request')) {
      console.log('[MOCK] Friend request sent');
      return { success: true } as T;
    }

    if (endpoint.includes('/api/friend/accept')) {
      console.log('[MOCK] Friend request accepted');
      return { success: true } as T;
    }

    if (endpoint.includes('/api/voice/list')) {
      return [
        {
          id: '1',
          name: 'My Voice Sample 1',
          file_url: 'https://example.com/voice1.wav',
          created_at: new Date().toISOString(),
          is_verified: true
        },
        {
          id: '2',
          name: 'Professional Voice',
          file_url: 'https://example.com/voice2.wav',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_verified: false
        }
      ] as T;
    }

    if (endpoint.includes('/api/payment/history')) {
      return [
        {
          id: 'pi_1234567890',
          amount: 19.99,
          currency: 'USD',
          status: 'succeeded',
          description: 'Premium Plan Subscription',
          created_at: new Date().toISOString(),
          plan: 'Premium',
          period: 'Monthly'
        }
      ] as T;
    }

    if (endpoint.includes('/api/payment/create-checkout-session')) {
      return {
        url: 'https://checkout.stripe.com/pay/demo_session',
        session_id: 'cs_demo_session'
      } as T;
    }

    if (endpoint.includes('/api/admin/users')) {
      return {
        users: [
          {
            id: 'demo_user',
            email: 'demo@example.com',
            profile: { introduction: 'Demo user', language: 'en' },
            subscription: { plan: 'premium', model: 'chatgpt' },
            created_at: new Date().toISOString(),
            is_banned: false,
            payment_status: 'active',
            message_count: 150
          }
        ],
        pages: 1
      } as T;
    }

    if (endpoint.includes('/api/admin/prompts')) {
      return [
        {
          id: '1',
          character: 'Default Assistant',
          content: 'You are a helpful AI assistant.',
          updated_at: new Date().toISOString()
        }
      ] as T;
    }

    if (endpoint.includes('/api/admin/ban')) {
      console.log('[MOCK] User banned');
      return { success: true } as T;
    }

    // Default empty response
    console.log('[MOCK] No specific handler for endpoint:', endpoint);
    return {} as T;
  }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const isDemoMode = this.token?.startsWith('mock_jwt_token_');
    
    if (isDemoMode) {
      console.log(`[DEMO MODE] File Upload: ${endpoint}`, { fileName: file.name, fileSize: file.size });
      return this.getMockFileUpload<T>(endpoint, file, additionalData);
    }

    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`File Upload: POST ${url}`, { fileName: file.name, fileSize: file.size });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('File Upload Error:', errorText);
        throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('File Upload Failed:', error);
      throw error;
    }
  }

  private async getMockFileUpload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    if (endpoint.includes('/api/voice/register')) {
      return {
        id: `voice_${Date.now()}`,
        name: additionalData?.name || 'New Voice',
        file_url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        is_verified: false
      } as T;
    }

    if (endpoint.includes('/api/message/send')) {
      return {
        id: `message_${Date.now()}`,
        success: true
      } as T;
    }

    return { success: true } as T;
  }

  // Auth API
  auth = {
    login: (userId: string, password?: string) =>
      this.request<{ token: string; expires_at: string }>('/api/auth/user/token', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, password }),
      }),

    register: (userData: { user_id: string; introduction?: string; language?: string }) =>
      this.request<{ token: string; expires_at: string }>('/api/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    refreshToken: (userId: string) =>
      this.request<{ token: string; expires_at: string }>('/api/auth/user/token', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      }),
  };

  // User API
  user = {
    getProfile: (userId: string) =>
      this.request<any>(`/api/user/profile?user_id=${userId}`),

    updateProfile: (userData: any) =>
      this.request<any>('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(userData),
      }),

    getModel: (userId: string) =>
      this.request<{ model: string }>(`/api/?user_id=${userId}`),

    updateModel: (userId: string, model: string) =>
      this.request<any>('/api/', {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, model }),
      }),
  };

  // Message API
  message = {
    send: (toUserId: string, audioFile: File) =>
      this.uploadFile<any>('/api/message/send', audioFile, {
        to_user_id: toUserId,
      }),

    pull: async (userId: string) => {
      const response = await this.request<any>(`/api/message/pull?user_id=${userId}`);
      return ensureArray(response, 'messages');
    },
  };

  // Friend API
  friend = {
    sendRequest: async (friendId: string): Promise<void> => {
      console.log('=== 友達申請デバッグ ===');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('friendId:', friendId);
      console.log('token:', this.token);
      
      // 現在のユーザーIDを取得（JWTトークンから）
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('ユーザーIDが取得できません。ログインしてください。');
      }
      
      try {
        await this.request('/api/friend/', {
          method: 'POST',
          body: JSON.stringify({ 
            from_user_id: currentUserId, 
            to_user_id: friendId 
          }),
        });
        console.log('友達申請成功');
      } catch (error) {
        console.error('友達申請エラー:', error);
        throw error;
      }
    },

    accept: (fromUserId: string, toUserId: string) => {
      console.log('=== フレンド承認デバッグ ===');
      console.log('fromUserId:', fromUserId);
      console.log('toUserId:', toUserId);
      const requestBody = { from_user_id: fromUserId, to_user_id: toUserId };
      console.log('Request body:', requestBody);
      
      return this.request<any>('/api/friend/accept', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    },

    list: async (userId: string) => {
      const response = await this.request<any>(`/api/friend/list?user_id=${userId}`);
      return ensureArray(response, 'friends');
    },

    requests: async (userId: string) => {
      const response = await this.request<any>(`/api/friend/requests?user_id=${userId}`);
      return ensureArray(response, 'requests');
    },

    // Test endpoints (no authentication required)
    testRequest: (fromUserId: string, toUserId: string) =>
      this.request<any>('/api/friend/test', {
        method: 'POST',
        body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
      }),

    testAccept: (fromUserId: string, toUserId: string) =>
      this.request<any>('/api/friend/test/accept', {
        method: 'POST',
        body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
      }),

    testList: async (userId: string) => {
      const response = await this.request<any>(`/api/friend/test/list/${userId}`);
      return ensureArray(response, 'friends');
    },

    testRequests: async (userId: string) => {
      const response = await this.request<any>(`/api/friend/test/requests/${userId}`);
      return ensureArray(response, 'requests');
    },
  };

  // Memory API
  memory = {
    create: (userId: string, text: string, category?: string) => {
      // Client-side validation
      if (!text || text.trim().length === 0) {
        throw new Error('メモリの内容を入力してください。');
      }
      
      if (text.length > 1000) {
        throw new Error('メモリの内容は1000文字以内で入力してください。');
      }

      return this.request<any>('/api/memory/', {
        method: 'POST',
        body: JSON.stringify({ 
          user_id: userId, 
          text: text.trim(),
          category: category || null
        }),
      });
    },

    list: async (userId: string, page: number = 1, limit: number = 20) => {
      const response = await this.request<any>(`/api/memory/?user_id=${userId}&page=${page}&limit=${limit}`);
      return ensureArray(response, 'memories');
    },

    delete: (memoryId: string) =>
      this.request<any>(`/api/memory/${memoryId}`, {
        method: 'DELETE',
      }),
  };

  // Alarm API
  alarm = {
    create: (alarmData: { user_id: string; time: string; timezone: string; text: string }) =>
      this.request<any>('/api/alarm/', {
        method: 'POST',
        body: JSON.stringify(alarmData),
      }),

    list: async (userId: string) => {
      const response = await this.request<any>(`/api/alarm/?user_id=${userId}`);
      return ensureArray(response, 'alarms');
    },

    update: (alarmId: string, alarmData: any) =>
      this.request<any>(`/api/alarm/${alarmId}`, {
        method: 'PATCH',
        body: JSON.stringify(alarmData),
      }),

    delete: (alarmId: string) =>
      this.request<any>(`/api/alarm/${alarmId}`, {
        method: 'DELETE',
      }),
  };

  // Voice API
  voice = {
    register: (userId: string, audioFile: File, name: string) => {
      // Validate file size (500KB limit)
      if (audioFile.size > 500 * 1024) {
        throw new Error('音声ファイルのサイズは500KB以下にしてください。');
      }

      return this.uploadFile<any>('/api/voice/register', audioFile, {
        user_id: userId,
        name,
      });
    },

    list: async (userId: string) => {
      const response = await this.request<any>(`/api/voice/list?user_id=${userId}`);
      return ensureArray(response, 'voices');
    },

    delete: (userId: string, speakerId: string) =>
      this.request<any>('/api/voice/delete', {
        method: 'DELETE',
        body: JSON.stringify({ user_id: userId, speaker_id: speakerId }),
      }),

    identify: (audioFile: File) =>
      this.uploadFile<any>('/api/voice/identify', audioFile),
  };

  // Payment API
  payment = {
    createCheckoutSession: (userId: string, priceId?: string) =>
      this.request<{ url: string; session_id: string }>('/api/payment/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, price_id: priceId }),
      }),

    getHistory: async (userId: string) => {
      const response = await this.request<any>(`/api/payment/history?user_id=${userId}`);
      return ensureArray(response, 'payments');
    },
  };

  // Admin API
  admin = {
    getUsers: async (page: number = 1, limit: number = 50) => {
      const response = await this.request<any>(`/api/admin/users?page=${page}&limit=${limit}`);
      return ensureArray(response, 'users');
    },

    banUser: (userId: string, reason?: string) =>
      this.request<any>('/api/admin/ban', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, reason }),
      }),

    getPrompts: async () => {
      const response = await this.request<any>('/api/admin/prompts');
      return ensureArray(response, 'prompts');
    },

    updatePrompt: (promptId: string, content: string) =>
      this.request<any>(`/api/admin/prompts/${promptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }),
  };
}

// 共通: レスポンスから配列を安全に取り出す関数
function ensureArray<T>(response: any, key: string): T[] {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response[key])) return response[key];
  return [];
}

export const api = new APIService(API_BASE_URL);
export const authAPI = api.auth;
export const userAPI = api.user;
export const messageAPI = api.message;
export const friendAPI = api.friend;
export const memoryAPI = api.memory;
export const alarmAPI = api.alarm;
export const voiceAPI = api.voice;
export const paymentAPI = api.payment;
export const adminAPI = api.admin;

export default api;