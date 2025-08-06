import { User } from '../types';
// 動的にバックエンドポートを検出する関数
// let cachedBaseURL: string | null = null;

// async function detectBackendPort(): Promise<string> { ... }

// 定数としてAPIのベースURLを定義（環境変数から取得、デフォルトはローカルサーバーURL）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";

class APIService {
  private baseURL: string;
  private token: string | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_BASE_URL;
    console.log('APIService initialized with baseURL:', this.baseURL);
    
    // 初期化時にポート検出を実行
    // this.initializationPromise = this.initializeBaseURL();
  }

  // 初期化時にベースURLを設定
  // private async initializeBaseURL(): Promise<void> { ... }

  // 初期化完了を待つメソッド
  // private async waitForInitialization(): Promise<void> { ... }

  // ポートを動的に更新するメソッド
  // async updateBaseURL(): Promise<void> { ... }

  // トークン設定
  setToken(token: string | null) {
    this.token = token;
    console.log('API Token set:', token ? 'Token present' : 'No token');
    if (token) {
      console.log('Token details:', {
        length: token.length,
        startsWith: token.substring(0, 10),
        endsWith: token.substring(token.length - 10)
      });
    }
  }

  // トークン取得
  getToken(): string | null {
    return this.token;
  }

  // 汎用的なGETリクエスト
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // 汎用的なPOSTリクエスト
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // 汎用的なPUTリクエスト
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // 汎用的なDELETEリクエスト
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
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
    // 初期化が完了するまで待機
    // await this.waitForInitialization();

    // ベースURLが空の場合はポート検出を実行
    // if (!this.baseURL) {
    //   console.log('BaseURL is empty, detecting backend port...');
    //   await this.updateBaseURL();
    // }

    // Check if we're in demo mode (mock token)
    // const isDemoMode = this.token?.startsWith('mock_jwt_token_');
    
    // if (isDemoMode) {
    //   console.log(`[DEMO MODE] API Request: ${options.method || 'GET'} ${endpoint}`);
    //   return this.getMockData<T>(endpoint, options);
    // }

    // Real API call
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add custom headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔐 Authorization header added:', `Bearer ${this.token.substring(0, 20)}...`);
      console.log('🔐 Full token (for debugging):', this.token);
      console.log('🔐 Token length:', this.token.length);
      console.log('🔐 Token starts with:', this.token.substring(0, 10));
      console.log('🔐 Token ends with:', this.token.substring(this.token.length - 10));
    } else {
      console.log('⚠️ No token available for request');
    }

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
      headers: Object.keys(headers),
      body: options.body,
      token: this.token ? 'Present' : 'Missing',
      tokenLength: this.token?.length || 0
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        console.error('❌ Request URL:', url);
        console.error('❌ Request headers:', headers);
        console.error('❌ Token used:', this.token ? `${this.token.substring(0, 20)}...` : 'None');
        
        // Handle specific error codes
        switch (response.status) {
          case 401:
            console.error('🔐 401 Unauthorized - Token may be invalid or missing');
            console.error('🔐 Current token:', this.token);
            console.error('🔐 Token validation failed - check if token is valid and not expired');
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
      console.log('✅ API Response Data:', data);
      return data;
    } catch (error) {
      console.error('❌ API Request Failed:', error);
      
      // 接続エラーの場合、ポートを再検出してリトライ
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('🔄 Connection failed, trying to detect backend port...');
        // await this.updateBaseURL();
        
        // 新しいポートでリトライ
        // const retryUrl = `${this.baseURL}${endpoint}`;
        // console.log(`🔄 Retrying with new URL: ${retryUrl}`);
        
        // const retryResponse = await fetch(retryUrl, {
        //   ...options,
        //   headers,
        // });
        
        // if (!retryResponse.ok) {
        //   const errorText = await retryResponse.text();
        //   console.error('❌ API Error Response (retry):', errorText);
        //   throw new Error(`API Error: ${retryResponse.status} ${retryResponse.statusText}`);
        // }
        
        // const data = await retryResponse.json();
        // console.log('✅ API Response Data (retry):', data);
        // return data;
      }
      
      throw error;
    }
  }

  //  private async getMockData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  //     // Simulate API delay
  //     await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  //
  //     console.log(`[MOCK] ${options.method || 'GET'} ${endpoint}`, options.body);
  //
  //     // Mock responses based on endpoint
  //     if (endpoint.includes('/auth/user/token')) {
  //       return {
  //         access_token: `mock_token_${Date.now()}`,
  //         user: {
  //           id: 'demo_user',
  //           profile: { introduction: 'Demo user', language: 'en' },
  //           subscription: { plan: 'premium', model: 'chatgpt' }
  //         }
  //       } as T;
  //     }
  //
  //     if (endpoint.includes('/api/user/profile')) {
  //       return {
  //         id: 'demo_user',
  //         message_count: 150,
  //         profile: { introduction: 'Demo user', language: 'en' },
  //         subscription: { plan: 'premium', model: 'chatgpt' }
  //       } as T;
  //     }
  //
  //     if (endpoint.includes('/api/user/model')) {
  //       if (options.method === 'PATCH') {
  //         return { success: true, model: JSON.parse(options.body as string).model } as T;
  //       }
  //       return { model: 'deepseek' } as T;
  //     }
  //
  //     if (endpoint.includes('/api/memory/')) {
  //       if (options.method === 'POST') {
  //         const requestBody = JSON.parse(options.body as string);
  //         console.log('[MOCK] Creating memory:', requestBody);
  //         
  //         // Validate input
  //         if (!requestBody.text || requestBody.text.trim().length === 0) {
  //           throw new Error('メモリの内容を入力してください。');
  //         }
  //         
  //         if (requestBody.text.length > 1000) {
  //           throw new Error('メモリの内容は1000文字以内で入力してください。');
  //         }
  //
  //         // Simulate successful creation
  //         return { 
  //           id: `memory_${Date.now()}`, 
  //           user_id: requestBody.user_id,
  //           text: requestBody.text,
  //           timestamp: new Date().toISOString(),
  //           category: requestBody.category || null
  //         } as T;
  //       }
  //       
  //       if (options.method === 'DELETE') {
  //         console.log('[MOCK] Deleting memory:', endpoint);
  //         return { success: true } as T;
  //       }
  //
  //       // GET request - return paginated memories
  //       const url = new URL(`http://localhost${endpoint}`);
  //       const page = parseInt(url.searchParams.get('page') || '1');
  //       const limit = parseInt(url.searchParams.get('limit') || '20');
  //       
  //       const allMemories = [
  //         {
  //           id: '1',
  //           user_id: 'demo_user',
  //           text: '朝のミーティングを好む',
  //           timestamp: new Date().toISOString(),
  //           category: 'Work'
  //         },
  //         {
  //           id: '2',
  //           user_id: 'demo_user',
  //           text: '好きなコーヒーはカプチーノ',
  //           timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  //           category: 'Personal'
  //         },
  //         {
  //           id: '3',
  //           user_id: 'demo_user',
  //           text: 'プログラミング言語はTypeScriptが得意',
  //           timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  //           category: 'Work'
  //         },
  //         {
  //           id: '4',
  //           user_id: 'demo_user',
  //           text: '週末は読書をして過ごすことが多い',
  //           timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  //           category: 'Personal'
  //         },
  //         {
  //           id: '5',
  //           user_id: 'demo_user',
  //           text: 'AIと機械学習に興味がある',
  //           timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  //           category: 'Ideas'
  //         }
  //       ];
  //
  //       const startIndex = (page - 1) * limit;
  //       const endIndex = startIndex + limit;
  //       const paginatedMemories = allMemories.slice(startIndex, endIndex);
  //       
  //       return {
  //         memories: paginatedMemories,
  //         total: allMemories.length,
  //         page: page,
  //         pages: Math.ceil(allMemories.length / limit)
  //       } as T;
  //     }
  //
  //     if (endpoint.includes('/api/friend/list')) {
  //       return [
  //         {
  //           id: '1',
  //           user_id: 'friend1',
  //           name: 'Alice Johnson',
  //           introduction: 'AI enthusiast and developer',
  //           status: 'online',
  //           has_unread_messages: true,
  //           last_message_time: new Date().toISOString()
  //         },
  //         {
  //           id: '2',
  //           user_id: 'friend2',
  //           name: 'Bob Smith',
  //           introduction: 'Voice technology researcher',
  //           status: 'offline',
  //           has_unread_messages: false,
  //           last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  //         }
  //       ] as T;
  //     }
  //
  //     if (endpoint.includes('/api/friend/request')) {
  //       console.log('[MOCK] Friend request sent');
  //       return { success: true } as T;
  //     }
  //
  //     if (endpoint.includes('/api/friend/accept')) {
  //       console.log('[MOCK] Friend request accepted');
  //       return { success: true } as T;
  //     }
  //
  //     if (endpoint.includes('/api/voice/list')) {
  //       return [
  //         {
  //           id: '1',
  //           name: 'My Voice Sample 1',
  //           file_url: 'https://example.com/voice1.wav',
  //           created_at: new Date().toISOString(),
  //           is_verified: true
  //         },
  //         {
  //           id: '2',
  //           name: 'Professional Voice',
  //           file_url: 'https://example.com/voice2.wav',
  //           created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  //           is_verified: false
  //         }
  //       ] as T;
  //     }
  //
  //     if (endpoint.includes('/api/payment/history')) {
  //       return [
  //         {
  //           id: 'pi_1234567890',
  //           amount: 19.99,
  //           currency: 'USD',
  //           status: 'succeeded',
  //           description: 'Premium Plan Subscription',
  //           created_at: new Date().toISOString(),
  //           plan: 'Premium',
  //           period: 'Monthly'
  //         }
  //       ] as T;
  //     }
  //
  //     if (endpoint.includes('/api/payment/create-checkout-session')) {
  //       return {
  //         url: 'https://checkout.stripe.com/pay/demo_session',
  //         session_id: 'cs_demo_session'
  //       } as T;
  //     }
  //
  //     if (endpoint.includes('/api/admin/users')) {
  //       return {
  //         users: [
  //           {
  //             id: 'demo_user',
  //             email: 'demo@example.com',
  //             profile: { introduction: 'Demo user', language: 'en' },
  //             subscription: { plan: 'premium', model: 'chatgpt' },
  //             created_at: new Date().toISOString(),
  //             is_banned: false,
  //             payment_status: 'active',
  //             message_count: 150
  //           }
  //         ],
  //         pages: 1
  //       } as T;
  //     }
  //
  //     if (endpoint.includes('/api/admin/prompts')) {
  //       return [
  //         {
  //           id: '1',
  //           character: 'Default Assistant',
  //           content: 'You are a helpful AI assistant.',
  //           updated_at: new Date().toISOString()
  //         }
  //       ] as T;
  //     }
  //
  //     if (endpoint.includes('/api/admin/ban')) {
  //       console.log('[MOCK] User banned');
  //       return { success: true } as T;
  //     }
  //
  //     // Default empty response
  //     console.log('[MOCK] No specific handler for endpoint:', endpoint);
  //     return {} as T;
  //   }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    // Check if we're in demo mode (mock token)
    // const isDemoMode = this.token?.startsWith('mock_jwt_token_');
    
    // if (isDemoMode) {
    //   console.log(`[DEMO MODE] File Upload: ${endpoint}`, { fileName: file.name, fileSize: file.size });
    //   return this.getMockFileUpload<T>(endpoint, file, additionalData);
    // }

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

  // Auth API
  auth = {
    // ログインAPI：ユーザーIDとトークンを受け取り、トークンとユーザー情報を返す
    login: async (userId: string, token?: string): Promise<{ token: string; user: User }> => {
      const response = await this.post<{ token: string; user: User }>(
        '/api/auth/login', 
        { user_id: userId, token: token }
      );
      return response;
    },
    
    // トークン検証API：現在のトークンでユーザー情報を取得
    verify: (): Promise<User> => {
      return this.get<User>('/api/auth/verify');
    },
    
    // 他の認証関連APIメソッド
    // ...
  };

  // User API
  user = {
    getProfile: (userId: string) =>
      this.request<any>(`/api/profile?user_id=${userId}`).catch((error) => {
        console.error('Error getting profile:', error);
        // デフォルト値を返す
        return { message_count: 0 };
      }),

    updateProfile: (userData: any) =>
      this.request<any>('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(userData),
      }),

    getModel: (userId: string) =>
      this.request<{ model: string; model_name: string; model_version: string }>(`/api/user/model?user_id=${userId}`).catch((error) => {
        console.error('Error getting model:', error);
        // デフォルト値を返す
        return { model: 'deepseek', model_name: 'deepseek', model_version: 'latest' };
      }),

    updateModel: (userId: string, model: string) =>
      this.request<any>('/api/user/model', {
        method: 'PUT',
        body: JSON.stringify({ model_name: model }),
      }),

    getPremiumStatus: (userId: string) =>
      this.request<{ user_id: string; is_premium: boolean }>(`/api/users/${userId}/premium-status`).catch((error) => {
        console.error('Error getting premium status:', error);
        // デフォルト値を返す
        return { user_id: userId, is_premium: false };
      }),
  };

  // Message API
  message = {
    // 友達とのメッセージ一覧を取得（最新5件まで）
    getList: (friendId: string) => {
      if (!friendId || friendId === 'undefined') {
        throw new Error('友達IDが指定されていません');
      }
      return this.request<{ messages: any[]; total_count: number }>(`/api/message/list?friend_id=${friendId}`);
    },

    // 音声メッセージを送信
    send: (toUserId: string, audioFile: File) => {
      if (!toUserId || toUserId === 'undefined') {
        throw new Error('送信先の友達IDが指定されていません');
      }
      return this.uploadFile<any>('/api/message/send', audioFile, {
        to_user_id: toUserId,
      });
    },

    // メッセージを削除
    delete: (messageId: string) =>
      this.request<any>(`/api/message/${messageId}`, {
        method: 'DELETE',
      }),

    // メッセージを既読にする
    markAsRead: (messageId: string) =>
      this.request<any>(`/api/message/read/${messageId}`, {
        method: 'POST',
      }),
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
      // /api/friend/test/requests/{user_id} のレスポンスは {received_requests, sent_requests}
      return this.request<any>(`/api/friend/test/requests/${userId}`);
    },

    // 送信申請の削除（withdraw）
    withdraw: (fromUserId: string, toUserId: string) =>
      this.request<any>('/api/friend/withdraw', {
        method: 'POST',
        body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
      }),
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
    create: (alarmData: { user_id: string; date: string; time: string; timezone: string; text: string }) =>
      this.request<any>('/api/alarm', {
        method: 'POST',
        body: JSON.stringify(alarmData),
      }),

    list: async (userId: string) => {
      const response = await this.request<any>(`/api/alarm/?user_id=${userId}`);
      return ensureArray(response, 'alarms');
    },

    update: (alarmId: string, alarmData: { date: string; time: string; timezone: string; text: string }) =>
      this.request<any>(`/api/alarm/${alarmId}`, {
        method: 'PUT',
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

  // Device API
  device = {
    exists: async (deviceNumber: string): Promise<{ token: string; user: any }> => {
      return this.post<{ token: string; user: any }>(
        '/api/device/exists',
        { device_number: deviceNumber }
      );
    },
  };

  // バックエンドポート検出
  // async detectBackendPort(): Promise<void> { ... }
}

// シングルトンインスタンス
let apiInstance: APIService | null = null;

// シングルトンインスタンスを取得する関数
export function getAPIService(): APIService {
  if (!apiInstance) {
    console.log('Creating new APIService instance');
    apiInstance = new APIService();
  } else {
    console.log('Using existing APIService instance');
  }
  return apiInstance;
}

// 既存のapiエクスポートを更新
export const api = getAPIService();

export const authAPI = api.auth;
export const userAPI = api.user;
export const messageAPI = api.message;
export const friendAPI = api.friend;
export const memoryAPI = api.memory;
export const alarmAPI = api.alarm;
export const voiceAPI = api.voice;
export const paymentAPI = api.payment;
export const adminAPI = api.admin;
export const deviceAPI = api.device;

export default api;

// 型定義
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  error?: undefined; // エラーがないことを明示
}

export interface AlreadyPremiumResponse {
  error: 'already_premium';
  message: string;
  redirect_url?: string;
  url?: undefined; // URLがないことを明示
}

// 共通: レスポンスから配列を安全に取り出す関数
function ensureArray<T>(response: any, key: string): T[] {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response[key])) return response[key];
  return [];
}