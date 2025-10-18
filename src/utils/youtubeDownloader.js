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
    addHeader: [
      'referer:https://www.youtube.com/',
      'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language:en-US,en;q=0.9'
    ],
    // Use extractor args to bypass bot detection
    extractorArgs: 'youtube:player_client=android,web;player_skip=webpage,configs',
    // Retry options
    retries: 3,
    fragmentRetries: 3,
    skipUnavailableFragments: true,
    // Use OAuth2 to bypass restrictions
    username: 'oauth2',
    password: ''
  };

  // Add cookies if provided
  if (process.env.YOUTUBE_COOKIES) {
    options.cookies = process.env.YOUTUBE_COOKIES;
  }

  return options;
};

/**
 * Get video information without downloading
 */
export const getVideoInfo = async (url) => {
  // Try multiple methods to get video info
  const methods = [
    // Method 1: Android client (most reliable)
    {
      ...getCommonOptions(),
      dumpSingleJson: true,
      extractorArgs: 'youtube:player_client=android'
    },
    // Method 2: iOS client
    {
      ...getCommonOptions(),
      dumpSingleJson: true,
      extractorArgs: 'youtube:player_client=ios',
      addHeader: [
        'user-agent:com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)'
      ]
    },
    // Method 3: Web client with embed
    {
      ...getCommonOptions(),
      dumpSingleJson: true,
      extractorArgs: 'youtube:player_client=web;player_skip=configs'
    }
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`🔍 Fetching video info (method ${i + 1})...`);
      const info = await youtubedl(url, methods[i]);

      return {
        title: info.title,
        duration: formatDuration(info.duration),
        channel: info.uploader || info.channel || info.uploader_id,
        thumbnail: info.thumbnail,
        videoId: info.id
      };
    } catch (error) {
      console.error(`❌ Method ${i + 1} failed:`, error.message);
      if (i === methods.length - 1) {
        // Last method failed
        throw new Error(`Failed to fetch video info: ${error.message}`);
      }
      // Try next method
      continue;
    }
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

    // Try multiple download methods
    const downloadMethods = [
      // Method 1: Android client (most reliable for bypassing bot detection)
      {
        ...getCommonOptions(),
        output: outputTemplate + '.%(ext)s',
        ffmpegLocation: ffmpegPath,
        extractorArgs: 'youtube:player_client=android',
        format: type === 'audio' ? 'bestaudio' : 'best[ext=mp4]/mp4',
        extractAudio: type === 'audio',
        audioFormat: type === 'audio' ? 'mp3' : undefined,
        audioQuality: type === 'audio' ? 0 : undefined,
        mergeOutputFormat: type === 'video' ? 'mp4' : undefined
      },
      // Method 2: iOS client fallback
      {
        ...getCommonOptions(),
        output: outputTemplate + '.%(ext)s',
        ffmpegLocation: ffmpegPath,
        extractorArgs: 'youtube:player_client=ios',
        format: type === 'audio' ? 'bestaudio' : 'best[ext=mp4]/mp4',
        extractAudio: type === 'audio',
        audioFormat: type === 'audio' ? 'mp3' : undefined,
        audioQuality: type === 'audio' ? 0 : undefined,
        mergeOutputFormat: type === 'video' ? 'mp4' : undefined,
        addHeader: [
          'user-agent:com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)'
        ]
      }
    ];

    // Try download methods
    let downloadSuccess = false;
    for (let i = 0; i < downloadMethods.length; i++) {
      try {
        console.log(`📥 Attempting download method ${i + 1}...`);
        await youtubedl(url, downloadMethods[i]);
        downloadSuccess = true;
        break;
      } catch (error) {
        console.error(`❌ Download method ${i + 1} failed:`, error.message);
        if (i === downloadMethods.length - 1) {
          throw error;
        }
      }
    }

    if (!downloadSuccess) {
      throw new Error('All download methods failed');
    }

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
