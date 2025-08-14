import { Router, Request, Response } from 'express';
import { TranscriptionService } from '../services/transcriptionService';
import { TranscriptionRequest, ApiResponse, TranscriptionDocument } from '../types';

const router = Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Transcription routes working!' });
});

/**
 * POST /transcription
 * Process audio transcription request
 */
router.post('/', async (req: Request<{}, ApiResponse<{ _id: string }>, TranscriptionRequest>, res: Response) => {
  try {
    const { audioUrl } = req.body;

    // Input validation
    if (!audioUrl) {
      return res.status(400).json({
        success: false,
        error: 'audioUrl is required'
      });
    }

    // Basic URL validation
    try {
      new URL(audioUrl);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid audioUrl format'
      });
    }

    // Process transcription
    const result = await TranscriptionService.processTranscription(audioUrl);

    res.status(201).json({
      success: true,
      data: { _id: result._id }
    });
  } catch (error) {
    console.error('❌ Transcription endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /transcriptions
 * Get all transcriptions (for frontend)
 */
router.get('/all', async (req: Request, res: Response<ApiResponse<TranscriptionDocument[]>>) => {
  try {
    const transcriptions = await TranscriptionService.getAllTranscriptions();
    
    res.json({
      success: true,
      data: transcriptions
    });
  } catch (error) {
    console.error('❌ Get transcriptions endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /transcription/:id
 * Delete a transcription by ID
 */
router.delete('/:id', async (req: Request, res: Response<ApiResponse<{ deleted: boolean }>>) => {
  try {
    const { id } = req.params;

    // Basic ID validation
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transcription ID'
      });
    }

    const deleted = await TranscriptionService.deleteTranscription(id);

    res.json({
      success: true,
      data: { deleted }
    });
  } catch (error) {
    console.error('❌ Delete transcription endpoint error:', error);
    
    if (error instanceof Error && error.message === 'Transcription not found') {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;