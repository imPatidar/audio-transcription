import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import transcriptionRoutes from './routes/transcription';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/transcription', transcriptionRoutes);

// Additional route for /transcriptions (plural) to match frontend expectations
app.get('/transcriptions', async (req, res) => {
  try {
    const { TranscriptionService } = await import('./services/transcriptionService');
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

// Delete transcription route
app.delete('/transcriptions/:id', async (req, res) => {
  try {
    const { TranscriptionService } = await import('./services/transcriptionService');
    const { id } = req.params;

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Audio Transcription API'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🎵 Transcription endpoint: http://localhost:${PORT}/transcription`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

startServer();