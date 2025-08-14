export interface TranscriptionRequest {
  audioUrl: string;
}

export interface TranscriptionResponse {
  _id: string;
  audioUrl: string;
  transcription: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}