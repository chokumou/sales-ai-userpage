import React, { useState, useEffect } from 'react';
import { Mic, Play, Pause, Trash2, Upload, Download, Volume2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { voiceAPI } from '../services/api';
import AudioRecorder from '../components/Audio/AudioRecorder';

interface VoiceRecord {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
  is_verified: boolean;
}

const VoiceRegistration: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [voices, setVoices] = useState<VoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [newVoiceName, setNewVoiceName] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);

  useEffect(() => {
    loadVoices();
  }, [user]);

  const loadVoices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const voiceData = await voiceAPI.list(user.id);
      setVoices(voiceData || []);
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    if (!user || !newVoiceName.trim()) {
      alert('Please enter a name for your voice recording');
      return;
    }

    setIsUploading(true);
    try {
      const audioFile = new File([audioBlob], `voice-${Date.now()}.wav`, { type: 'audio/wav' });
      await voiceAPI.register(user.id, audioFile, newVoiceName);
      await loadVoices();
      setNewVoiceName('');
      setShowRecorder(false);
    } catch (error) {
      console.error('Error registering voice:', error);
      alert('Failed to register voice. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user || !newVoiceName.trim()) {
      alert('Please enter a name for your voice recording');
      return;
    }

    setIsUploading(true);
    try {
      await voiceAPI.register(user.id, file, newVoiceName);
      await loadVoices();
      setNewVoiceName('');
      setShowRecorder(false);
    } catch (error) {
      console.error('Error uploading voice:', error);
      alert('Failed to upload voice. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVoice = async (voiceId: string) => {
    if (!user || !confirm('Are you sure you want to delete this voice recording?')) return;

    try {
      await voiceAPI.delete(user.id, voiceId);
      await loadVoices();
    } catch (error) {
      console.error('Error deleting voice:', error);
      alert('Failed to delete voice. Please try again.');
    }
  };

  const playAudio = (audioUrl: string, voiceId: string) => {
    if (playingAudio === voiceId) {
      setPlayingAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    setPlayingAudio(voiceId);
    
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => {
      setPlayingAudio(null);
      alert('Error playing audio');
    };
    
    audio.play();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Voice Registration</h1>
        <p className="text-gray-600 mt-2">
          Register your voice to enable personalized AI conversations. Upload audio files or record directly.
        </p>
      </div>

      {/* Voice Registration Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Voice</h2>
            <p className="text-gray-600 text-sm mt-1">
              Record a clear sample of your voice for the best results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {voices.length} voice{voices.length !== 1 ? 's' : ''} registered
            </span>
          </div>
        </div>

        {/* Voice Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice Name
          </label>
          <input
            type="text"
            value={newVoiceName}
            onChange={(e) => setNewVoiceName(e.target.value)}
            placeholder="Enter a name for this voice (e.g., 'My Voice', 'Work Voice')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowRecorder(!showRecorder)}
            disabled={!newVoiceName.trim() || isUploading}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Mic className="w-5 h-5 mr-2" />
            {showRecorder ? 'Hide Recorder' : 'Record Voice'}
          </button>
          
          <button
            onClick={() => document.getElementById('voice-file-input')?.click()}
            disabled={!newVoiceName.trim() || isUploading}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Audio File
          </button>
        </div>

        {/* Audio Recorder */}
        {showRecorder && (
          <div className="mb-6">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onUpload={handleFileUpload}
              isUploading={isUploading}
              maxDuration={30} // 30 seconds max for voice samples
              acceptedFormats={['.wav', '.mp3', '.m4a']}
            />
          </div>
        )}

        {/* Hidden File Input */}
        <input
          id="voice-file-input"
          type="file"
          accept=".wav,.mp3,.m4a"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
        />

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Record in a quiet environment</li>
            <li>• Speak clearly and naturally</li>
            <li>• Record at least 10-30 seconds of speech</li>
            <li>• Use high-quality audio equipment if possible</li>
            <li>• Avoid background noise and echo</li>
          </ul>
        </div>
      </div>

      {/* Voice List */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Registered Voices</h2>
          {voices.length > 0 && (
            <span className="text-sm text-gray-500">
              {voices.length} voice{voices.length !== 1 ? 's' : ''} total
            </span>
          )}
        </div>

        {voices.length === 0 ? (
          <div className="text-center py-12">
            <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No voices registered yet</h3>
            <p className="text-gray-600 mb-6">
              Register your first voice to start personalized AI conversations.
            </p>
            <button
              onClick={() => setShowRecorder(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Your Voice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{voice.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Registered: {new Date(voice.created_at).toLocaleDateString()}</span>
                      {voice.is_verified && (
                        <span className="flex items-center text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => playAudio(voice.file_url, voice.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Play voice sample"
                  >
                    {playingAudio === voice.id ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  
                  <a
                    href={voice.file_url}
                    download={`${voice.name}.wav`}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download voice file"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  
                  <button
                    onClick={() => handleDeleteVoice(voice.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete voice"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Identification Test */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Voice Identification Test</h2>
            <p className="text-gray-600 text-sm mt-1">
              Test how well our system can identify your voice
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Voice Identification Coming Soon</h3>
          <p className="text-gray-600 text-sm">
            This feature will allow you to test voice recognition accuracy against your registered voices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceRegistration;