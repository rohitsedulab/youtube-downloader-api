import express from 'express';
import { downloadVideo, serveFile } from '../controllers/downloadController.js';

const router = express.Router();

// POST /api/download - Download a YouTube video
router.post('/', downloadVideo);

// GET /api/download/file/:filename - Serve downloaded file
router.get('/file/:filename', serveFile);

export default router;
