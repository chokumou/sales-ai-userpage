const API_BASE_URL = 'https://your-api-server.onrender.com';

class APIService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // For demo mode, return mock data instead of making real API calls
    return this.getMockData<T>(endpoint, options);
  }

  private async getMockData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

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

    if (endpoint.includes('/api/memory/')) {
      if (options.method === 'POST') {
        return { id: `memory_${Date.now()}`, success: true } as T;
      }
      return {
        memories: [
          {
            id: '1',
            user_id: 'demo_user',
            text: 'Remember that I prefer morning meetings',
            timestamp: new Date().toISOString(),
            category: 'Work'
          },
          {
            id: '2',
            user_id: 'demo_user',
            text: 'My favorite coffee is cappuccino',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            category: 'Personal'
          }
        ],
        total: 2,
        page: 1,
        pages: 1
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

    // Default empty response
    return {} as T;
  }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    // Mock file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (endpoint.includes('/api/voice/register')) {
      return {
        id: `voice_${Date.now()}`,
        name: additionalData?.name || 'New Voice',
        file_url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        is_verified: false
      } as T;
    }

    return { success: true } as T;
  }

  // Auth API
  auth = {
    login: (userId: string, password?: string) =>
      this.request<{ access_token: string; user: any }>('/auth/user/token', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, password }),
      }),

    register: (userData: { user_id: string; introduction?: string; language?: string }) =>
      this.request<{ token: string; expires_at: string }>('/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    refreshToken: (userId: string) =>
      this.request<{ access_token: string }>('/auth/user/token', {
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
      this.request<{ model: string }>(`/api/user/model?user_id=${userId}`),

    updateModel: (userId: string, model: string) =>
      this.request<any>('/api/user/model', {
        method: 'PATCH',
        body: JSON.stringify({ user_id: userId, model }),
      }),
  };

  // Message API
  message = {
    send: (toUserId: string, audioFile: File) =>
      this.uploadFile<any>('/api/message/send', audioFile, {
        to_user_id: toUserId,
      }),

    pull: (userId: string) =>
      this.request<any[]>(`/api/message/pull?user_id=${userId}`),
  };

  // Friend API
  friend = {
    request: (fromUserId: string, toUserId: string) =>
      this.request<any>('/api/friend/request', {
        method: 'POST',
        body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
      }),

    accept: (fromUserId: string, toUserId: string) =>
      this.request<any>('/api/friend/accept', {
        method: 'POST',
        body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
      }),

    list: (userId: string) =>
      this.request<any[]>(`/api/friend/list?user_id=${userId}`),
  };

  // Memory API
  memory = {
    create: (userId: string, text: string) =>
      this.request<any>('/api/memory/', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, text }),
      }),

    list: (userId: string, page: number = 1, limit: number = 20) =>
      this.request<{ memories: any[]; total: number; page: number; pages: number }>(
        `/api/memory/?user_id=${userId}&page=${page}&limit=${limit}`
      ),

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

    list: (userId: string) =>
      this.request<any[]>(`/api/alarm/?user_id=${userId}`),

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
    register: (userId: string, audioFile: File, name: string) =>
      this.uploadFile<any>('/api/voice/register', audioFile, {
        user_id: userId,
        name,
      }),

    list: (userId: string) =>
      this.request<any[]>(`/api/voice/list?user_id=${userId}`),

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

    getHistory: (userId: string) =>
      this.request<any[]>(`/api/payment/history?user_id=${userId}`),
  };

  // Admin API
  admin = {
    getUsers: (page: number = 1, limit: number = 50) =>
      this.request<any>(`/api/admin/users?page=${page}&limit=${limit}`),

    banUser: (userId: string, reason?: string) =>
      this.request<any>('/api/admin/ban', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, reason }),
      }),

    getPrompts: () =>
      this.request<any[]>('/api/admin/prompts'),

    updatePrompt: (promptId: string, content: string) =>
      this.request<any>(`/api/admin/prompts/${promptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }),
  };
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