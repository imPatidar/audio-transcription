import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { transcriptionApi } from './services/api';
import { TranscriptionResponse } from './types';

const App: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const queryClient = useQueryClient();

  // Fetch all transcriptions
  const { data: transcriptions, isLoading, error, refetch } = useQuery<TranscriptionResponse[]>(
    'transcriptions',
    transcriptionApi.getAllTranscriptions,
    {
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnMount: true, // Only fetch on initial mount
      staleTime: 30000, // Consider data fresh for 30 seconds
    }
  );

  // Create transcription mutation
  const createTranscriptionMutation = useMutation(
    transcriptionApi.createTranscription,
    {
      onSuccess: (data) => {
        setSuccessMessage(`✅ Transcription created successfully! ID: ${data._id}`);
        setAudioUrl('');
        // Manually refetch instead of invalidating to have more control
        refetch();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      },
      onError: (error: any) => {
        console.error('Failed to create transcription:', error);
      }
    }
  );

  // Delete transcription mutation
  const deleteTranscriptionMutation = useMutation(
    transcriptionApi.deleteTranscription,
    {
      onSuccess: () => {
        // Refetch the list after successful deletion
        refetch();
      },
      onError: (error: any) => {
        console.error('Failed to delete transcription:', error);
        alert('Failed to delete transcription. Please try again.');
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrl.trim()) return;

    // Reset any previous error state before making a new request
    createTranscriptionMutation.reset();
    createTranscriptionMutation.mutate({ audioUrl: audioUrl.trim() });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎵 Audio Transcription Service
          </h1>
          <p className="text-gray-600">
            Submit an audio URL to get a mock transcription
          </p>
        </header>

        {/* Transcription Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Transcription</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Audio URL
              </label>
              <input
                type="url"
                id="audioUrl"
                value={audioUrl}
                onChange={(e) => {
                  setAudioUrl(e.target.value);
                  // Clear error state when user starts typing
                  if (createTranscriptionMutation.error) {
                    createTranscriptionMutation.reset();
                  }
                }}
                placeholder="https://example.com/sample.mp3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {audioUrl && !isValidUrl(audioUrl) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid URL</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={createTranscriptionMutation.isLoading || !audioUrl.trim() || !isValidUrl(audioUrl)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTranscriptionMutation.isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Create Transcription'
              )}
            </button>
          </form>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {createTranscriptionMutation.error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {(createTranscriptionMutation.error as any)?.response?.data?.error || 'Failed to create transcription'}
            </div>
          )}
        </div>

        {/* Transcriptions List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Transcriptions</h2>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transcriptions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading transcriptions: {(error as any)?.message}
            </div>
          ) : !transcriptions || transcriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transcriptions yet. Create your first one above!
            </div>
          ) : (
            <div className="space-y-4">
              {transcriptions.map((transcription) => (
                <div key={transcription._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 truncate flex-1 mr-4">
                      {transcription.audioUrl}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(transcription.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this transcription?')) {
                            deleteTranscriptionMutation.mutate(transcription._id);
                          }
                        }}
                        disabled={deleteTranscriptionMutation.isLoading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                        title="Delete transcription"
                      >
                        {deleteTranscriptionMutation.isLoading ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded italic">
                    "{transcription.transcription}"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ID: {transcription._id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;