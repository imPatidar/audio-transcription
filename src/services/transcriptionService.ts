import axios from 'axios';
import { Transcription, ITranscription } from '../models/Transcription';
import { TranscriptionDocument } from '../types';

export class TranscriptionService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Mock audio file download with retry mechanism
   * For demo purposes, this is more lenient and will succeed even with dummy URLs
   */
  private static async downloadAudioFile(url: string, retries = 0): Promise<boolean> {
    try {
      // Mock download - in production, you'd actually download and validate the file
      const response = await axios.head(url, { timeout: 5000 });

      // Check if it's a valid audio file (basic validation)
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('audio')) {
        console.warn(`⚠️ URL may not be an audio file: ${contentType}`);
      }

      console.log(`✅ Successfully "downloaded" audio file from: ${url}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Download attempt ${retries + 1} failed for ${url}`);

      if (retries < this.MAX_RETRIES) {
        console.log(`🔄 Retrying in ${this.RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.downloadAudioFile(url, retries + 1);
      }

      // For demo purposes, we'll proceed even if the URL doesn't exist
      // In production, you'd want to fail here
      console.log(`⚠️ Mock download: Proceeding with dummy URL for demo purposes`);
      return true;
    }
  }

  /**
   * Mock transcription - returns dummy text
   */
  private static mockTranscribe(audioUrl: string): string {
    const dummyTranscriptions = [
      "This is a sample transcription of the audio file.",
      "Hello, this is a mock transcription service response.",
      "The audio has been successfully processed and transcribed.",
      "This is dummy transcribed text for testing purposes.",
      "Mock transcription: The speaker discussed various topics in this audio recording."
    ];

    // Use URL hash to get consistent dummy text for same URL
    const hash = audioUrl.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const index = Math.abs(hash) % dummyTranscriptions.length;
    return dummyTranscriptions[index];
  }

  /**
   * Process transcription request
   */
  static async processTranscription(audioUrl: string): Promise<TranscriptionDocument> {
    try {
      // Step 1: Download audio file (mocked with retry)
      await this.downloadAudioFile(audioUrl);

      // Step 2: Mock transcription
      const transcription = this.mockTranscribe(audioUrl);

      // Step 3: Save to MongoDB
      const transcriptionDoc = new Transcription({
        audioUrl,
        transcription,
        createdAt: new Date()
      });

      const savedDoc = await transcriptionDoc.save();

      return {
        _id: (savedDoc._id as any).toString(),
        audioUrl: savedDoc.audioUrl,
        transcription: savedDoc.transcription,
        createdAt: savedDoc.createdAt
      };
    } catch (error) {
      console.error('❌ Transcription processing failed:', error);
      throw error;
    }
  }

  /**
   * Get all transcriptions
   */
  static async getAllTranscriptions(): Promise<TranscriptionDocument[]> {
    try {
      const transcriptions = await Transcription.find()
        .sort({ createdAt: -1 })
        .lean();

      return transcriptions.map(doc => ({
        _id: (doc._id as any).toString(),
        audioUrl: doc.audioUrl,
        transcription: doc.transcription,
        createdAt: doc.createdAt
      }));
    } catch (error) {
      console.error('❌ Failed to fetch transcriptions:', error);
      throw error;
    }
  }

  /**
   * Delete a transcription by ID
   */
  static async deleteTranscription(id: string): Promise<boolean> {
    try {
      const result = await Transcription.findByIdAndDelete(id);
      
      if (!result) {
        throw new Error('Transcription not found');
      }
      
      console.log(`✅ Deleted transcription: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete transcription:', error);
      throw error;
    }
  }
}