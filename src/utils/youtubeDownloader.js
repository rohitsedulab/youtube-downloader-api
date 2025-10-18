import youtubedl from 'youtube-dl-exec';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get ffmpeg path
const ffmpegPath = ffmpegInstaller.path;

// Common options for all youtube-dl operations
const getCommonOptions = () => {
  const options = {
    noWarnings: true,
    noCheckCertificates: true,
    preferFreeFormats: true,
    // Retry options
    retries: 3,
    fragmentRetries: 3,
    skipUnavailableFragments: true
  };

  // Add cookies if provided (optional)
  if (process.env.YOUTUBE_COOKIES) {
    options.cookies = process.env.YOUTUBE_COOKIES;
  }

  return options;
};

/**
 * Get video information without downloading
 */
export const getVideoInfo = async (url) => {
  try {
    console.log('🔍 Fetching video info using Android client...');

    const options = {
      ...getCommonOptions(),
      dumpSingleJson: true,
      extractorArgs: 'youtube:player_client=android'
    };

    const info = await youtubedl(url, options);

    return {
      title: info.title,
      duration: formatDuration(info.duration),
      channel: info.uploader || info.channel || info.uploader_id,
      thumbnail: info.thumbnail,
      videoId: info.id
    };
  } catch (error) {
    console.error('❌ Video info error:', error.message);
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
    // Get video info first with enhanced options
    const info = await getVideoInfo(url);
    const title = sanitizeFilename(info.title);

    // Create downloads directory
    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = type === 'audio' ? 'mp3' : 'mp4';
    const outputTemplate = path.join(downloadsDir, `${title}-${timestamp}`);

    console.log(`⬇️  Starting download: ${title}`);

    // Configure download options using Android client
    const downloadOptions = {
      ...getCommonOptions(),
      output: outputTemplate + '.%(ext)s',
      ffmpegLocation: ffmpegPath,
      extractorArgs: 'youtube:player_client=android'
    };

    if (type === 'audio') {
      downloadOptions.extractAudio = true;
      downloadOptions.audioFormat = 'mp3';
      downloadOptions.audioQuality = 0;
      downloadOptions.format = 'bestaudio';
    } else {
      downloadOptions.format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/mp4';
      downloadOptions.mergeOutputFormat = 'mp4';
    }

    // Download the video
    await youtubedl(url, downloadOptions);

    // Find the downloaded file
    const files = fs.readdirSync(downloadsDir);
    const downloadedFile = files.find(file =>
      file.startsWith(`${title}-${timestamp}`) &&
      (file.endsWith('.mp4') || file.endsWith('.mp3') || file.endsWith('.m4a'))
    );

    if (!downloadedFile) {
      throw new Error('Downloaded file not found after successful download');
    }

    const filePath = path.join(downloadsDir, downloadedFile);
    console.log(`✅ Download complete: ${downloadedFile}`);

    return filePath;

  } catch (error) {
    console.error('❌ Download error:', error.message);

    // Provide more specific error messages
    if (error.message.includes('Sign in to confirm your age')) {
      throw new Error('Video is age-restricted and requires authentication');
    } else if (error.message.includes('Private video')) {
      throw new Error('Video is private and cannot be downloaded');
    } else if (error.message.includes('Video unavailable')) {
      throw new Error('Video is unavailable or has been removed');
    } else if (error.message.includes('This video is not available')) {
      throw new Error('Video is not available in your region');
    }

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
