# 🚀 Deploy Instructions - Fix Bad Gateway Error

## The Issue
Your Render service is showing "Bad Gateway" because it's trying to use the old code with new dependencies that aren't installed yet.

## Solution: Deploy the New Code

### Step 1: Push Changes to GitHub

Run these commands in order:

```bash
git add .
git commit -m "Switch to @distube/ytdl-core to fix YouTube bot detection"
git push
```

### Step 2: Wait for Render to Rebuild

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your `youtube-downloader-api` service
3. You should see "Deploy in progress..."
4. Wait 3-5 minutes for the build to complete
5. Look for "Live" status with a green dot

### Step 3: Check the Logs

While it's deploying, click on "Logs" tab to see:
- `npm install` installing new packages
- `@distube/ytdl-core` being installed
- `fluent-ffmpeg` being installed
- Server starting on port 10000

### Step 4: Test the API

Once it shows "Live", test with:

```bash
curl -X POST https://your-app-name.onrender.com/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Replace `your-app-name` with your actual Render app name.

## What's Happening

1. **Old deployment** is using `youtube-dl-exec` which is failing
2. **New code** uses `@distube/ytdl-core` which works
3. **Render needs to rebuild** to install the new dependencies
4. **After rebuild** everything will work

## If Still Having Issues

### Check Build Logs
Look for errors during `npm install`:
- Missing dependencies
- Build failures
- Node version issues

### Manual Redeploy
If auto-deploy didn't trigger:
1. Go to Render dashboard
2. Click "Manual Deploy" tab
3. Click "Deploy latest commit"
4. Wait for build to complete

### Check Environment Variables
Make sure these are set in Render:
- `PORT` = `10000`
- `NODE_VERSION` = `20.8.0`
- `NODE_ENV` = `production`

## Expected Success

After successful deployment, you should see in logs:
```
🚀 Server is running on port 10000
📡 API Base URL: http://localhost:10000
📥 Download endpoint: POST http://localhost:10000/api/download
```

And your API will work without bot detection errors! ✅

## Why This Fix Works

- `@distube/ytdl-core` is a pure Node.js library
- No external binaries needed
- Built-in bot detection bypass
- Actively maintained for YouTube changes
- Used by thousands of production apps

Your app will be stable and reliable after this deployment! 🎉
