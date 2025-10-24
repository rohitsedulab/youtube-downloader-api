import express from 'express';
import { downloadVideo, serveFile, listFiles, deleteAllFiles } from '../controllers/downloadController.js';

const router = express.Router();

// POST /api/download - Download a YouTube video
router.post('/', downloadVideo);

// GET /api/download/files - Get list of all downloaded files
router.get('/files', listFiles);

// DELETE /api/download/files - Delete all downloaded files
router.delete('/files', deleteAllFiles);

// GET /api/download/file/:filename - Serve downloaded file
router.get('/file/:filename', serveFile);

export default router;
