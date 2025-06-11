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
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
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

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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