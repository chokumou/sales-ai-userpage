import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { alarmAPI } from '../services/api';
import { Clock, Plus, Edit, Trash2, Bell } from 'lucide-react';

interface Alarm {
  id: string;
  user_id: string;
  alarm_time: string;
  message: string;
  timezone: string;
  fired: boolean;
  created_at: string;
  alarm_date?: string;
}

const Alarm: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    text: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    if (user) {
      loadAlarms();
    }
  }, [user]);

  const loadAlarms = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await alarmAPI.list(user.id);
      setAlarms(Array.isArray(response) ? (response as Alarm[]) : []);
    } catch (error) {
      console.error('Error loading alarms:', error);
      alert('Failed to load alarms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingAlarm) {
        await alarmAPI.update(editingAlarm.id, {
          date: formData.date,
          time: formData.time,
          timezone: formData.timezone,
          text: formData.text
        });
        setEditingAlarm(null);
      } else {
        await alarmAPI.create({
          date: formData.date,
          time: formData.time,
          timezone: formData.timezone,
          text: formData.text,
          user_id: user.id
        });
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '',
        text: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      setShowCreateForm(false);
      await loadAlarms();
    } catch (error) {
      console.error('Error saving alarm:', error);
      alert('Failed to save alarm. Please try again.');
    }
  };

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    
    // アラーム時刻から日付と時刻を分離
    const [hours, minutes] = alarm.alarm_time.split(':');
    let date: Date;
    
    if (alarm.alarm_date) {
      // alarm_dateフィールドがある場合はそれを使用
      date = new Date(`${alarm.alarm_date}T${alarm.alarm_time}:00`);
    } else {
      // 後方互換性のため、現在の日付を使用
      date = new Date();
      date.setUTCHours(parseInt(hours), parseInt(minutes));
    }
    
    setFormData({
      date: date.toISOString().split('T')[0],
      time: alarm.alarm_time,
      text: alarm.message,
      timezone: alarm.timezone
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (alarmId: string) => {
    if (!confirm('Are you sure you want to delete this alarm?')) return;

    try {
      await alarmAPI.delete(alarmId);
      await loadAlarms();
    } catch (error) {
      console.error('Error deleting alarm:', error);
      alert('Failed to delete alarm. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingAlarm(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '',
      text: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const setToday = () => {
    setFormData({
      ...formData,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({
      ...formData,
      date: tomorrow.toISOString().split('T')[0]
    });
  };

  const formatTime = (alarmTime: string, timezone: string) => {
    try {
      const [hours, minutes] = alarmTime.split(':');
      const date = new Date();
      date.setUTCHours(parseInt(hours), parseInt(minutes));
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
      });
    } catch {
      return alarmTime;
    }
  };

  const formatDateTime = (timeStr: string | null | undefined, timezone: string | null | undefined, dateStr: string | null | undefined) => {
    if (!timeStr || !dateStr) {
      return { date: '日付未設定', time: '時刻未設定' };
    }

    // YYYY/MM/DD 形式を YYYY-MM-DD に置換
    const normalizedDateStr = dateStr.replace(/\//g, '-');
    
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    try {
      const date = new Date(`${normalizedDateStr}T${timeStr}`);
      if (isNaN(date.getTime())) {
        // ここでも無効な日付をチェック
        return { date: '日付形式エラー', time: '時刻形式エラー' };
      }

      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        timeZone: tz
      };

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: tz
      };

      return {
        date: new Intl.DateTimeFormat('ja-JP', dateOptions).format(date),
        time: new Intl.DateTimeFormat('ja-JP', timeOptions).format(date)
      };
    } catch (error) {
      console.error("Error formatting date/time:", error);
      return { date: '表示エラー', time: '表示エラー' };
    }
  };

  const groupAlarmsByDate = (alarms: Alarm[]) => {
    // ... existing code ...
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Alarms</h1>
                <p className="text-gray-600">Manage your daily reminders and notifications</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Alarm</span>
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAlarm ? 'Edit Alarm' : 'Create New Alarm'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={setToday}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      >
                        今日
                      </button>
                      <button
                        type="button"
                        onClick={setTomorrow}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        明日
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter alarm message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAlarm ? 'Update Alarm' : 'Create Alarm'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alarms List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Alarms</h2>
          </div>
          <div className="p-6">
            {alarms.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No alarms yet</h3>
                <p className="text-gray-600 mb-4">Create your first alarm to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Alarm
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatDateTime(alarm.alarm_time, alarm.timezone, alarm.alarm_date).time}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({alarm.timezone})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{formatDateTime(alarm.alarm_time, alarm.timezone, alarm.alarm_date).date}</span>
                          <span>•</span>
                          <span>{alarm.message}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(alarm)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(alarm.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alarm; 