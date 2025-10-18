# 🚀 Deploy to Railway - Step by Step Guide

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

---

## 📋 Step-by-Step Deployment

### Step 1: Initialize Git Repository

Open your terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit - YouTube Downloader API"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (name it: `youtube-downloader-api`)
3. **Don't** initialize with README (we already have one)
4. Click "Create repository"

### Step 3: Push to GitHub

Copy the commands from GitHub and run them:

```bash
git remote add origin https://github.com/YOUR_USERNAME/youtube-downloader-api.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 4: Deploy on Railway

1. **Go to Railway:** https://railway.app
2. **Sign in** with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `youtube-downloader-api` repository
6. Railway will automatically detect it's a Node.js app and start deploying

### Step 5: Configure Environment Variables

1. In Railway dashboard, click on your project
2. Go to **"Variables"** tab
3. Add these variables:
   - `PORT` = `3000`
   - `BASE_URL` = `https://YOUR_APP_NAME.up.railway.app` (you'll get this URL after deployment)
   - `YTDL_NO_UPDATE` = `1`

### Step 6: Get Your Live URL

1. Go to **"Settings"** tab
2. Click **"Generate Domain"**
3. Copy your Railway URL (e.g., `https://youtube-downloader-api-production.up.railway.app`)
4. Update the `BASE_URL` variable with this URL

---

## ✅ Test Your Live API

Once deployed, test with Postman:

**URL:** `https://YOUR_RAILWAY_URL.up.railway.app/api/download`

**Method:** POST

**Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

---

## 📊 Railway Free Tier Limits

- ✅ **$5 free credit per month**
- ✅ **500 hours of usage**
- ✅ **100 GB bandwidth**
- ✅ **Automatic HTTPS**
- ✅ **Auto-deploy on git push**

**Note:** Railway free tier should be enough for moderate usage. Monitor your usage in the Railway dashboard.

---

## 🔄 Update Your Deployed App

Whenever you make changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Railway will automatically redeploy! 🎉

---

## ⚠️ Important Notes

1. **Downloads folder:** Railway has ephemeral storage, so downloaded files will be deleted when the container restarts. This is fine since we have auto-cleanup anyway.

2. **Logs:** Check logs in Railway dashboard if something goes wrong.

3. **Cold starts:** Free tier apps may sleep after inactivity. First request might take 10-20 seconds.

4. **Storage:** For production, consider using cloud storage (AWS S3, Cloudinary) instead of local storage.

---

## 🆘 Troubleshooting

**Build fails:**
- Check Railway logs
- Make sure all dependencies are in `package.json`
- Verify Node.js version compatibility

**App crashes:**
- Check environment variables are set correctly
- Review Railway logs for errors
- Ensure PORT is set to 3000

**Can't download videos:**
- Check if ffmpeg is installed (Railway should install it automatically)
- Verify the video is public or unlisted
- Check Railway logs for specific errors

---

## 🎯 Next Steps After Deployment

1. Update your frontend/mobile app to use the Railway URL
2. Consider adding rate limiting for production
3. Monitor usage in Railway dashboard
4. Set up custom domain (optional, available in Railway)

---

**Your API is now live and accessible from anywhere!** 🌍
