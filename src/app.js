import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import downloadRoutes from './routes/download.js';
import cron from 'node-cron';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, '../downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
  console.log('📁 Downloads directory created');
}

// Routes
app.use('/api/download', downloadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'YouTube Downloader API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'YouTube Video Downloader API',
    endpoints: {
      download: 'POST /api/download',
      getFile: 'GET /api/download/file/:filename',
      health: 'GET /health'
    }
  });
});

// Auto-cleanup: Delete files older than 15 minutes every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log('🧹 Running cleanup task...');
  const files = fs.readdirSync(downloadsDir);
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  files.forEach(file => {
    const filePath = path.join(downloadsDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = now - stats.mtimeMs;

    if (fileAge > fifteenMinutes) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted old file: ${file}`);
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;
