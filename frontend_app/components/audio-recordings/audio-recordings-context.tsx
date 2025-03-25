"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { JOBS_API } from '@/lib/apiConstants';

export interface AudioRecording {
  id: string;
  user_id: string;
  file_path: string;
  transcription_file_path: string | null;
  analysis_file_path: string | null;
  prompt_category_id: string;
  prompt_subcategory_id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  transcription_id: string | null;
  created_at: number;
  updated_at: number;
  type: string;
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  _ts: number;
}

interface AudioRecordingsContextType {
  audioRecordings: AudioRecording[];
  fetchAudioRecordings: () => Promise<void>;
  error: string | null;
}

const AudioRecordingsContext = createContext<AudioRecordingsContextType | undefined>(undefined);

export function AudioRecordingsProvider({ children }: { children: React.ReactNode }) {
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAudioRecordings = useCallback(async () => {
    const cachedData = localStorage.getItem('audioRecordingsData');
    if (cachedData) {
      setAudioRecordings(JSON.parse(cachedData));
      return; // Exit if cached data is available
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(JOBS_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const data = await response.json();
      localStorage.setItem('audioRecordingsData', JSON.stringify(data.jobs || []));
      setAudioRecordings(data.jobs || []);
    } catch (error) {
      console.error('Error fetching audio recordings:', error);
      setError(error.message);
    }
  }, []);

  // Fetch recordings when the provider mounts
  useEffect(() => {
    fetchAudioRecordings();
  }, [fetchAudioRecordings]);

  return (
    <AudioRecordingsContext.Provider value={{ audioRecordings, fetchAudioRecordings, error }}>
      {children}
    </AudioRecordingsContext.Provider>
  );
}

export function useAudioRecordings() {
  const context = useContext(AudioRecordingsContext);
  if (context === undefined) {
    throw new Error('useAudioRecordings must be used within an AudioRecordingsProvider');
  }
  return context;
}