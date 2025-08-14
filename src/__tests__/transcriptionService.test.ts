import { TranscriptionService } from '../services/transcriptionService';
import { Transcription } from '../models/Transcription';

describe('TranscriptionService', () => {
  const mockAudioUrl = 'https://example.com/sample.mp3';

  describe('processTranscription', () => {
    it('should successfully process a transcription request', async () => {
      const result = await TranscriptionService.processTranscription(mockAudioUrl);

      expect(result).toHaveProperty('_id');
      expect(result.audioUrl).toBe(mockAudioUrl);
      expect(result.transcription).toBeTruthy();
      expect(result.createdAt).toBeInstanceOf(Date);

      // Verify it was saved to database
      const savedDoc = await Transcription.findById(result._id);
      expect(savedDoc).toBeTruthy();
      expect(savedDoc?.audioUrl).toBe(mockAudioUrl);
    }, 15000); // Increased timeout for retry mechanism

    it('should handle invalid URLs by proceeding with mock (demo behavior)', async () => {
      const invalidUrl = 'not-a-valid-url';
      
      // In demo mode, even invalid URLs should work
      const result = await TranscriptionService.processTranscription(invalidUrl);
      expect(result).toHaveProperty('_id');
      expect(result.audioUrl).toBe(invalidUrl);
      expect(result.transcription).toBeTruthy();
    }, 15000);

    it('should return consistent transcription for same URL', async () => {
      const result1 = await TranscriptionService.processTranscription(mockAudioUrl);
      const result2 = await TranscriptionService.processTranscription(mockAudioUrl);

      // Different documents but same transcription text (due to hash-based selection)
      expect(result1._id).not.toBe(result2._id);
      expect(result1.transcription).toBe(result2.transcription);
    }, 30000); // Increased timeout for multiple retry cycles
  });

  describe('getAllTranscriptions', () => {
    it('should return empty array when no transcriptions exist', async () => {
      const result = await TranscriptionService.getAllTranscriptions();
      expect(result).toEqual([]);
    });

    it('should return all transcriptions sorted by creation date', async () => {
      // Create multiple transcriptions
      await TranscriptionService.processTranscription('https://example.com/audio1.mp3');
      await TranscriptionService.processTranscription('https://example.com/audio2.mp3');
      await TranscriptionService.processTranscription('https://example.com/audio3.mp3');

      const result = await TranscriptionService.getAllTranscriptions();
      
      expect(result).toHaveLength(3);
      expect(result[0].createdAt.getTime()).toBeGreaterThanOrEqual(result[1].createdAt.getTime());
      expect(result[1].createdAt.getTime()).toBeGreaterThanOrEqual(result[2].createdAt.getTime());
    }, 45000); // Increased timeout for multiple transcriptions with retries
  });

  describe('deleteTranscription', () => {
    it('should successfully delete a transcription', async () => {
      // Create a transcription first
      const transcription = await TranscriptionService.processTranscription(mockAudioUrl);
      
      // Verify it exists
      const beforeDelete = await TranscriptionService.getAllTranscriptions();
      expect(beforeDelete).toHaveLength(1);
      
      // Delete it
      const deleted = await TranscriptionService.deleteTranscription(transcription._id);
      expect(deleted).toBe(true);
      
      // Verify it's gone
      const afterDelete = await TranscriptionService.getAllTranscriptions();
      expect(afterDelete).toHaveLength(0);
    }, 15000);

    it('should throw error when deleting non-existent transcription', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      await expect(
        TranscriptionService.deleteTranscription(fakeId)
      ).rejects.toThrow('Transcription not found');
    });

    it('should throw error when deleting with invalid ID', async () => {
      const invalidId = 'invalid-id';
      
      await expect(
        TranscriptionService.deleteTranscription(invalidId)
      ).rejects.toThrow();
    });
  });
});