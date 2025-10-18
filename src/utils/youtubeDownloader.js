import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Create agent with cookies to bypass rate limiting
const agent = ytdl.createAgent([
  {
    "domain": ".youtube.com",
    "expirationDate": 1759633298.163287,
    "hostOnly": false,
    "httpOnly": false,
    "name": "PREF",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "tz=Asia.Calcutta"
  }
]);

// Common options for ytdl
const getYtdlOptions = () => ({
  agent,
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  }
});

/**
 * Get video information without downloading
 */
export const getVideoInfo = async (url) => {
  try {
    console.log('🔍 Fetching video info...');
    
    const info = await ytdl.getInfo(url, getYtdlOptions());
    
    return {
      title: info.videoDetails.title,
      duration: formatDuration(parseInt(info.videoDetails.lengthSeconds)),
      channel: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      videoId: info.videoDetails.videoId
    };
  } catch (error) {
    console.error('❌ Video info error:', error.message);
    
    // Handle rate limiting
    if (error.message.includes('429')) {
      throw new Error('YouTube rate limit reached. Please try again in a few minutes.');
    }
    
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
    const extension = type === 'audio' ? 'mp3' : 'mp4';
    const filename = `${title}-${timestamp}.${extension}`;
    const filePath = path.join(downloadsDir, filename);

    console.log(`⬇️  Starting download: ${title}`);

    return new Promise((resolve, reject) => {
      if (type === 'audio') {
        // Download audio only
        const audioStream = ytdl(url, {
          ...getYtdlOptions(),
          quality: 'highestaudio',
          filter: 'audioonly'
        });

        ffmpeg(audioStream)
          .audioBitrate(128)
          .save(filePath)
          .on('end', () => {
            console.log(`✅ Download complete: ${filename}`);
            resolve(filePath);
          })
          .on('error', (err) => {
            console.error('❌ FFmpeg error:', err.message);
            reject(new Error(`Audio conversion failed: ${err.message}`));
          });
      } else {
        // Download video with audio
        const videoStream = ytdl(url, {
          ...getYtdlOptions(),
          quality: 'highestvideo',
          filter: format => format.container === 'mp4'
        });

        const audioStream = ytdl(url, {
          ...getYtdlOptions(),
          quality: 'highestaudio',
          filter: 'audioonly'
        });

        ffmpeg()
          .input(videoStream)
          .input(audioStream)
          .videoCodec('copy')
          .audioCodec('aac')
          .save(filePath)
          .on('end', () => {
            console.log(`✅ Download complete: ${filename}`);
            resolve(filePath);
          })
          .on('error', (err) => {
            console.error('❌ FFmpeg error:', err.message);
            // Fallback: try downloading without merging
            console.log('🔄 Trying fallback method...');
            
            const fallbackStream = ytdl(url, {
              ...getYtdlOptions(),
              quality: 'highest',
              filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio
            });

            const writeStream = fs.createWriteStream(filePath);
            fallbackStream.pipe(writeStream);

            writeStream.on('finish', () => {
              console.log(`✅ Download complete (fallback): ${filename}`);
              resolve(filePath);
            });

            writeStream.on('error', (writeErr) => {
              console.error('❌ Write error:', writeErr.message);
              reject(new Error(`Download failed: ${writeErr.message}`));
            });
          });
      }
    });

  } catch (error) {
    console.error('❌ Download error:', error.message);

    // Provide more specific error messages
    if (error.message.includes('age')) {
      throw new Error('Video is age-restricted and requires authentication');
    } else if (error.message.includes('private')) {
      throw new Error('Video is private and cannot be downloaded');
    } else if (error.message.includes('unavailable')) {
      throw new Error('Video is unavailable or has been removed');
    } else if (error.message.includes('not available')) {
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
