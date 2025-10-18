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

/**
 * Get video information without downloading
 */
export const getVideoInfo = async (url) => {
  try {
    console.log('🔍 Fetching video info...');
    
    const info = await ytdl.getInfo(url);
    
    return {
      title: info.videoDetails.title,
      duration: formatDuration(parseInt(info.videoDetails.lengthSeconds)),
      channel: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      videoId: info.videoDetails.videoId
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
          quality: 'highestvideo',
          filter: format => format.container === 'mp4'
        });

        const audioStream = ytdl(url, {
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
