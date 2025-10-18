# YouTube Video Downloader API

A complete Node.js backend API that downloads YouTube videos when provided with a YouTube video URL.

## 📁 Project Structure

```
youtube-downloader-api/
├── src/
│   ├── routes/
│   │   └── download.js
│   ├── controllers/
│   │   └── downloadController.js
│   ├── utils/
│   │   └── youtubeDownloader.js
│   └── app.js
├── downloads/          (auto-created)
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file is already created with default values:

```
PORT=3000
BASE_URL=http://localhost:3000
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### 1. Download Video

**Endpoint:** `POST /api/download`

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "type": "video"
}
```

**Parameters:**
- `url` (required): YouTube video URL
- `type` (optional): "video" or "audio" (default: "video")

**Success Response:**
```json
{
  "success": true,
  "title": "Sample YouTube Video",
  "file": "http://localhost:3000/api/download/file/sample-video-1234567890.mp4",
  "metadata": {
    "duration": "3:45",
    "channel": "Channel Name",
    "thumbnail": "https://...",
    "type": "video"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid YouTube URL"
}
```

### 2. Get Downloaded File

**Endpoint:** `GET /api/download/file/:filename`

Downloads the file directly to the user's device.

### 3. Health Check

**Endpoint:** `GET /health`

Returns API status.

## 🧪 Testing the API

### Using cURL

**Download a video:**
```bash
curl -X POST http://localhost:3000/api/download -H "Content-Type: application/json" -d "{\"url\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}"
```

**Download audio only:**
```bash
curl -X POST http://localhost:3000/api/download -H "Content-Type: application/json" -d "{\"url\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\", \"type\": \"audio\"}"
```

### Using Postman

1. Create a new POST request to `http://localhost:3000/api/download`
2. Set Headers: `Content-Type: application/json`
3. Set Body (raw JSON):
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```
4. Send the request
5. Copy the `file` URL from the response and paste it in your browser to download

## ✨ Features

- ✅ Download YouTube videos in highest quality
- ✅ Download audio-only option
- ✅ Progress tracking in console
- ✅ Video metadata (title, duration, channel, thumbnail)
- ✅ Automatic file cleanup (deletes files older than 1 hour)
- ✅ Error handling for invalid URLs
- ✅ CORS enabled
- ✅ File streaming for downloads
- ✅ Modern ES module syntax

## 🛠️ Technologies Used

- **Express.js** - Web framework
- **ytdl-core** - YouTube video downloader
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **node-cron** - Scheduled tasks for cleanup
- **nodemon** - Development auto-reload

## 📝 Notes

- Downloaded files are stored in the `/downloads` directory
- Files older than 1 hour are automatically deleted every 30 minutes
- The API validates YouTube URLs before processing
- Supports both `youtube.com` and `youtu.be` URL formats

## 🔒 Error Handling

The API handles:
- Invalid YouTube URLs (400)
- Video not found/unavailable (404)
- Download failures (500)
- File not found when serving (404)

## 🎯 Future Enhancements

- Add authentication/API keys
- Support for playlists
- Multiple quality options
- Download queue system
- Database integration for tracking downloads
- Rate limiting
- Video format conversion
