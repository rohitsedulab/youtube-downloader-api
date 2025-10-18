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
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept-language:en-US,en;q=0.9'
      ],
      extractor_args: 'youtube:player_client=android,web'
    };

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
    const infoOptions = {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept-language:en-US,en;q=0.9'
      ],
      extractor_args: 'youtube:player_client=android,web'
    };

    const info = await youtubedl(url, infoOptions);

    const title = sanitizeFilename(info.title);
    
    // Create downloads directory
    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = type === 'audio' ? 'mp3' : 'mp4';
    const filename = `${title}-${timestamp}.${extension}`;
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
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept-language:en-US,en;q=0.9'
      ],
      extractor_args: 'youtube:player_client=android,web',
      // Use installed ffmpeg for merging
      ffmpegLocation: ffmpegPath
    };

    if (type === 'audio') {
      downloadOptions.extractAudio = true;
      downloadOptions.audioFormat = 'mp3';
      downloadOptions.audioQuality = 0;
      downloadOptions.format = 'bestaudio';
    } else {
      // Download best video+audio and merge into mp4
      downloadOptions.format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4';
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
    .substring(0, 100); // Limit length
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

/**
 * Format bytes to readable format
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
