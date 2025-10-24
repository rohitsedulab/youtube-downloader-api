import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { downloadYouTubeVideo, getVideoInfo } from '../utils/youtubeDownloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controller to handle video download requests
 */
export const downloadVideo = async (req, res) => {
  try {
    const { url, type = 'video' } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'YouTube URL is required'
      });
    }

    // Validate YouTube URL format
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }

    console.log(`📥 Fetching video info for: ${url}`);

    // Get video information first
    const videoInfo = await getVideoInfo(url);

    console.log(`📹 Video: ${videoInfo.title}`);
    console.log(`⏱️  Duration: ${videoInfo.duration}`);
    console.log(`👤 Channel: ${videoInfo.channel}`);

    // Download the video
    const downloadType = type === 'audio' ? 'audio' : 'video';
    const filePath = await downloadYouTubeVideo(url, downloadType);

    const filename = path.basename(filePath);
    
    // Auto-detect base URL from request or use environment variable
    let baseUrl = process.env.BASE_URL;
    
    if (!baseUrl || baseUrl === 'http://localhost:3000') {
      // Auto-detect from request headers
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || req.get('host');
      baseUrl = `${protocol}://${host}`;
    }

    // URL encode the filename for proper handling of special characters
    const encodedFilename = encodeURIComponent(filename);

    // Send success response
    res.json({
      success: true,
      title: videoInfo.title,
      file: `${baseUrl}/api/download/file/${encodedFilename}`,
      metadata: {
        duration: videoInfo.duration,
        channel: videoInfo.channel,
        thumbnail: videoInfo.thumbnail,
        type: downloadType
      }
    });

  } catch (error) {
    console.error('❌ Download error:', error.message);

    // Handle specific errors
    if (error.message.includes('Video unavailable')) {
      return res.status(404).json({
        success: false,
        message: 'Video not found or unavailable'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download video'
    });
  }
};

/**
 * Controller to get list of all downloaded files
 */
export const listFiles = (req, res) => {
  try {
    const downloadsDir = path.join(__dirname, '../../downloads');
    
    // Check if downloads directory exists
    if (!fs.existsSync(downloadsDir)) {
      return res.json({
        success: true,
        files: [],
        count: 0
      });
    }

    // Get all files
    const files = fs.readdirSync(downloadsDir);
    
    // Get file details
    const fileDetails = files.map(file => {
      const filePath = path.join(downloadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    res.json({
      success: true,
      files: fileDetails,
      count: fileDetails.length
    });

  } catch (error) {
    console.error('❌ List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files: ' + error.message
    });
  }
};

/**
 * Controller to delete all downloaded files
 */
export const deleteAllFiles = (req, res) => {
  try {
    const downloadsDir = path.join(__dirname, '../../downloads');
    
    // Check if downloads directory exists
    if (!fs.existsSync(downloadsDir)) {
      return res.json({
        success: true,
        message: 'No files to delete',
        deletedCount: 0
      });
    }

    // Get all files
    const files = fs.readdirSync(downloadsDir);
    let deletedCount = 0;

    // Delete each file
    files.forEach(file => {
      const filePath = path.join(downloadsDir, file);
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`🗑️  Deleted: ${file}`);
    });

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} file(s)`,
      deletedCount: deletedCount
    });

  } catch (error) {
    console.error('❌ Delete files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete files: ' + error.message
    });
  }
};

/**
 * Controller to serve downloaded files
 */
export const serveFile = (req, res) => {
  try {
    // Decode the filename from URL encoding
    const filename = decodeURIComponent(req.params.filename);
    const downloadsDir = path.join(__dirname, '../../downloads');
    const filePath = path.join(downloadsDir, filename);

    console.log(`📤 Serving file: ${filename}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.mp3' ? 'audio/mpeg' : 'video/mp4';

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Accept-Ranges', 'bytes');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (error) => {
      console.error('❌ File streaming error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('❌ Serve file error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to serve file: ' + error.message
      });
    }
  }
};
