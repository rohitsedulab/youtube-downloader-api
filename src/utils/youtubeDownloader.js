import youtubedl from 'youtube-dl-exec';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get ffmpeg path
const ffmpegPath = ffmpegInstaller.path;

/**
 * Get video information without downloading
 */
export const getVideoInfo = async (url) => {
  try {
    const options = {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    };

    // Add proxy if available
    if (process.env.PROXY_URL) {
      options.proxy = process.env.PROXY_URL;
      console.log('🔄 Using proxy for request');
    }

    const info = await youtubedl(url, options);
    
    return {
      title: info.title,
      duration: formatDuration(info.duration),
      channel: info.uploader || info.channel,
      thumbnail: info.thumbnail,
      videoId: info.id
    };
  } catch (error) {
    throw new Error(`Failed to fetch video info: ${error.message}`);
  }
};

/**
 * Download YouTube video
 * @param {string} url - YouTube video URL
 * @param {string} type - 'video' or 'audio'
 * @returns {Promise<string>} - Path to downloaded file
 */
export const downloadYouTubeVideo = async (url, type = 'video') => {
  try {
    // Get video info first
    const info = await getVideoInfo(url);
    const title = sanitizeFilename(info.title);
    
    // Create downloads directory
    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const outputTemplate = path.join(downloadsDir, `${title}-${timestamp}`);

    console.log(`⬇️  Starting download: ${title}`);

    // Configure download options
    const downloadOptions = {
      output: outputTemplate + '.%(ext)s',
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ],
      ffmpegLocation: ffmpegPath
    };

    // Add proxy if available
    if (process.env.PROXY_URL) {
      downloadOptions.proxy = process.env.PROXY_URL;
      console.log('🔄 Using proxy for download');
    }

    if (type === 'audio') {
      downloadOptions.extractAudio = true;
      downloadOptions.audioFormat = 'mp3';
      downloadOptions.audioQuality = 0;
      downloadOptions.format = 'bestaudio';
    } else {
      downloadOptions.format = 'worst[ext=mp4]/worst';
      downloadOptions.mergeOutputFormat = 'mp4';
    }

    // Download the video
    await youtubedl(url, downloadOptions);

    // Find the downloaded file
    const files = fs.readdirSync(downloadsDir);
    const downloadedFile = files.find(file => 
      file.startsWith(`${title}-${timestamp}`) && 
      (file.endsWith('.mp4') || file.endsWith('.mp3'))
    );

    if (!downloadedFile) {
      throw new Error('Downloaded file not found');
    }

    const filePath = path.join(downloadsDir, downloadedFile);
    console.log(`✅ Download complete: ${downloadedFile}`);
    
    return filePath;

  } catch (error) {
    console.error('❌ Download error:', error.message);
    throw new Error(`Download failed: ${error.message}`);
  }
};

/**
 * Sanitize filename to remove invalid characters
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .substring(0, 100);
};

/**
 * Format duration from seconds to readable format
 */
const formatDuration = (seconds) => {
  if (!seconds) return 'Unknown';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
