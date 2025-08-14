import axios from 'axios';
import { TranscriptionRequest, TranscriptionResponse, ApiResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

export const transcriptionApi = {
  async createTranscription(request: TranscriptionRequest): Promise<{ _id: string }> {
    const response = await api.post<ApiResponse<{ _id: string }>>('/transcription', request);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create transcription');
    }
    
    return response.data.data;
  },

  async getAllTranscriptions(): Promise<TranscriptionResponse[]> {
    const response = await api.get<ApiResponse<TranscriptionResponse[]>>('/transcriptions');
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch transcriptions');
    }
    
    return response.data.data;
  },

  async deleteTranscription(id: string): Promise<boolean> {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>(`/transcriptions/${id}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to delete transcription');
    }
    
    return response.data.data.deleted;
  }
};