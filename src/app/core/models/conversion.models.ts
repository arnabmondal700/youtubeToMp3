export interface ConversionRequest {
  url: string;
  quality: number;
}

export interface ConversionResult {
  title: string;
  thumbnail: string;
  duration: string;
  downloadUrl: string;
  size: string;
  status: 'preparing' | 'downloading' | 'extracting' | 'encoding' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  quality: number;
  date: string;
  downloadUrl: string;
}

export type Theme = 'light' | 'dark';

export type AudioQuality = 64 | 128 | 192 | 256 | 320;