# 🎵 Audio Transcription API Service

A minimal full-stack application that accepts audio file URLs, mocks transcription processing, and stores results in MongoDB. Built with Node.js, TypeScript, Express, MongoDB, React, and Tailwind CSS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Frontend Usage](#frontend-usage)
- [Testing](#testing)
- [Assumptions Made](#assumptions-made)
- [Production Improvements](#production-improvements)

## ✨ Features

### Backend API
- ✅ **POST /transcription** - Process audio transcription requests
- ✅ **GET /transcriptions** - Retrieve all transcriptions
- ✅ **Mock audio download** with retry mechanism (3 attempts)
- ✅ **Mock transcription** service with consistent dummy responses
- ✅ **MongoDB integration** with Mongoose ODM
- ✅ **TypeScript interfaces** for type safety
- ✅ **Error handling** and input validation
- ✅ **Environment variables** support
- ✅ **Jest testing** with MongoDB Memory Server

### Frontend UI
- ✅ **React + TypeScript** with Vite build tool
- ✅ **Audio URL input form** with validation
- ✅ **Real-time transcription list** with auto-refresh
- ✅ **Tailwind CSS** styling
- ✅ **React Query** for API state management
- ✅ **Loading states** and error handling

## 🛠 Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Axios (HTTP client)
- Jest + MongoDB Memory Server (testing)
- dotenv (environment variables)

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Query (API state management)
- Axios (HTTP client)

## 📁 Project Structure

```
audio-transcription-api/
├── src/                          # Backend source code
│   ├── __tests__/               # Test files
│   │   ├── setup.ts            # Jest test setup
│   │   └── transcriptionService.test.ts
│   ├── config/
│   │   └── database.ts         # MongoDB connection
│   ├── models/
│   │   └── Transcription.ts    # Mongoose model
│   ├── routes/
│   │   └── transcription.ts    # API routes
│   ├── services/
│   │   └── transcriptionService.ts  # Business logic
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── server.ts              # Express server setup
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts         # API client
│   │   ├── App.tsx            # Main React component
│   │   ├── main.tsx           # React entry point
│   │   ├── types.ts           # Frontend types
│   │   └── index.css          # Tailwind CSS
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── package.json               # Backend dependencies
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn

### Backend Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd audio-transcription-api
npm install
```

2. **Environment configuration:**
```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string
# The project is pre-configured for MongoDB Atlas
```

3. **MongoDB Atlas Setup:**
   - The project is configured to use MongoDB Atlas cloud database
   - Connection string is already configured in `.env`
   - Database name: `audio-transcription`
   - No local MongoDB installation required

4. **Run the backend:**
```bash
# Quick start (recommended)
./start.sh

# Or manually:
npm run build
npm start

# Development mode with auto-reload
npm run dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

2. **Start the frontend:**
```bash
# Quick start (recommended)
./start-frontend.sh

# Or manually:
npm run dev
```

The frontend will be available at `http://localhost:3001`

### Running Tests

```bash
# Run backend tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

### POST /transcription

Process an audio transcription request.

**Request:**
```json
{
  "audioUrl": "https://example.com/sample.mp3"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "audioUrl is required"
}
```

### GET /transcriptions

Retrieve all transcriptions, sorted by creation date (newest first).

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "audioUrl": "https://example.com/sample.mp3",
      "transcription": "This is a sample transcription of the audio file.",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Audio Transcription API"
}
```

## 🖥 Frontend Usage

1. **Open the frontend** at `http://localhost:3001`
2. **Enter an audio URL** in the input field (e.g., `https://example.com/sample.mp3`)
3. **Click "Create Transcription"** to submit the request
4. **View the result** in the success message and transcriptions list
5. **Browse all transcriptions** in the "Recent Transcriptions" section

The frontend automatically refreshes the transcriptions list every 5 seconds and provides real-time feedback for all operations.

## 🧪 Testing

The project includes comprehensive Jest tests:

- **Unit tests** for the TranscriptionService
- **Integration tests** with MongoDB Memory Server
- **Mock testing** for external HTTP requests
- **Error handling** validation

Run tests with:
```bash
npm test
```

## 🤔 Assumptions Made

1. **Audio File Validation**: The service performs basic HTTP HEAD requests to validate URLs but doesn't download or validate actual audio content in the mock implementation.

2. **Transcription Consistency**: The mock transcription service returns consistent dummy text for the same URL using a simple hash function.

3. **Error Handling**: Basic retry mechanism (3 attempts) for download failures with 1-second delays.

4. **Database**: Uses MongoDB with simple schema - no user authentication or authorization implemented.

5. **CORS**: Enabled for all origins in development - would need restriction in production.

6. **File Size**: No file size limits implemented in the mock version.

## 🚀 Production Improvements

### Security & Authentication
- **API Authentication**: Implement JWT or API key authentication
- **Rate Limiting**: Add request rate limiting to prevent abuse
- **Input Sanitization**: Enhanced validation and sanitization of URLs
- **CORS Configuration**: Restrict CORS to specific domains
- **HTTPS**: Enforce HTTPS in production

### Scalability & Performance
- **Queue System**: Implement Redis/Bull queue for background processing
- **File Storage**: Use AWS S3 or similar for actual audio file storage
- **CDN**: Implement CDN for frontend assets
- **Database Indexing**: Add proper MongoDB indexes for performance
- **Caching**: Implement Redis caching for frequently accessed data
- **Load Balancing**: Add load balancer for multiple server instances

### Real Audio Processing
- **Speech-to-Text Integration**: Integrate with AWS Transcribe, Google Speech-to-Text, or Azure Speech Services
- **Audio Format Support**: Support multiple audio formats (MP3, WAV, M4A, etc.)
- **File Size Limits**: Implement reasonable file size restrictions
- **Audio Validation**: Validate actual audio content and duration
- **Progress Tracking**: WebSocket or polling for transcription progress

### Monitoring & Logging
- **Structured Logging**: Implement proper logging with Winston or similar
- **Error Tracking**: Add Sentry or similar error tracking
- **Metrics**: Implement Prometheus/Grafana for monitoring
- **Health Checks**: Enhanced health checks for dependencies
- **Alerting**: Set up alerts for system failures

### Data & Backup
- **Database Replication**: MongoDB replica sets for high availability
- **Backup Strategy**: Automated database backups
- **Data Retention**: Implement data retention policies
- **GDPR Compliance**: Add data privacy and deletion capabilities

### Development & Deployment
- **CI/CD Pipeline**: GitHub Actions or similar for automated testing and deployment
- **Docker**: Containerize the application
- **Environment Management**: Separate staging and production environments
- **API Documentation**: OpenAPI/Swagger documentation
- **Code Quality**: ESLint, Prettier, and pre-commit hooks

### Frontend Enhancements
- **Progressive Web App**: Add PWA capabilities
- **Offline Support**: Cache transcriptions for offline viewing
- **File Upload**: Direct file upload instead of URL-only
- **Real-time Updates**: WebSocket for real-time transcription status
- **Advanced UI**: Pagination, search, filtering for transcriptions
- **Mobile Optimization**: Enhanced mobile responsiveness

---

## 🎬 Demo Video

*[Include a 2-5 minute Loom recording here walking through the code structure and functionality]*

---

**Built with ❤️ for the audio transcription challenge**


mongo-dev
y2nfv3UgkiKcwAMH


mongodb+srv://mongo-dev:y2nfv3UgkiKcwAMH@cluster0.xxsluml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0