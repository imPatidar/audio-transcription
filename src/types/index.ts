export interface TranscriptionRequest {
  audioUrl: string;
}

export interface TranscriptionResponse {
  _id: string;
  audioUrl: string;
  transcription: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TranscriptionDocument {
  _id: string;
  audioUrl: string;
  transcription: string;
  createdAt: Date;
}