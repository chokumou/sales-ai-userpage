import React, { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, Upload, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onUpload?: (file: File) => void;
  isUploading?: boolean;
  maxDuration?: number; // in seconds
  acceptedFormats?: string[];
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onUpload,
  isUploading = false,
  maxDuration = 300, // 5 minutes default
  acceptedFormats = ['.wav', '.mp3', '.m4a', '.ogg']
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        onRecordingComplete(blob, recordingTime);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  }, [onRecordingComplete, recordingTime, maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      // Check file size (max 500KB as mentioned in requirements)
      if (file.size > 500 * 1024) {
        alert('File size must be less than 500KB');
        return;
      }
      
      // Create audio blob for preview
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isUploading}
              className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full transition-colors shadow-lg"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg animate-pulse"
            >
              <Square className="w-6 h-6" />
            </button>
          )}

          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isUploading}
            className="flex items-center justify-center w-16 h-16 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition-colors shadow-lg"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Recording Timer */}
        {(isRecording || recordingTime > 0) && (
          <div className="text-2xl font-mono text-red-600">
            {formatTime(recordingTime)}
            {recordingTime >= maxDuration && (
              <div className="text-sm text-red-500 mt-1">
                Maximum recording time reached
              </div>
            )}
          </div>
        )}

        {/* Audio Playback */}
        {audioBlob && audioUrl && (
          <div className="space-y-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={playAudio}
                className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-1" />
                )}
              </button>
              
              <button
                onClick={reset}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Recording ready • {Math.round(audioBlob.size / 1024)}KB
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>Click the red button to record audio</p>
          <p>Click the blue button to upload an audio file</p>
          <p>Maximum duration: {Math.floor(maxDuration / 60)} minutes</p>
          <p>Supported formats: {acceptedFormats.join(', ')}</p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default AudioRecorder;