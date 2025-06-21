export interface User {
  id: string;
  username?: string | null;
  email?: string | null;
  premium_until?: string | null;
  stripe_customer_id?: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  audio_url: string;
  duration: number;
  timestamp: string;
  is_read: boolean;
}

export interface Friend {
  id: string;
  user_id: string;
  name: string;
  introduction: string;
  avatar?: string;
  status: 'online' | 'offline';
  has_unread_messages: boolean;
  last_message_time?: string;
}

export interface FriendRequest {
  id: number;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  text: string;
  timestamp: string;
  category?: string;
}

export interface Alarm {
  id: string;
  user_id: string;
  time: string;
  timezone: string;
  text: string;
  is_active: boolean;
  repeat_days?: string[];
}

export interface Voice {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  created_at: string;
  is_verified: boolean;
}

export interface PaymentSession {
  url: string;
  session_id: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
}