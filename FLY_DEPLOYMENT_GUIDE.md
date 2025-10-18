# 🚀 Deploy to Fly.io - Complete Guide

## ✅ Fly.io Free Tier Benefits
- **3 shared-cpu-1x VMs** with 256MB RAM each
- **3GB persistent storage**
- **160GB outbound data transfer**
- **Perfect for small projects like this!**

---

## 📋 Prerequisites

1. **Install Fly CLI:**

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Mac/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Sign up for Fly.io:**
```bash
fly auth signup
```

Or login if you have an account:
```bash
fly auth login
```

---

## 🚀 Deploy Your API

### Step 1: Launch the App

In your project directory, run:

```bash
fly launch
```

**Answer the prompts:**
- App name: `youtube-downloader-api` (or your choice)
- Region: Choose closest to you (e.g., `sin` for Singapore, `iad` for US East)
- Would you like to set up a Postgresql database? → **No**
- Would you like to set up an Upstash Redis database? → **No**
- Would you like to deploy now? → **Yes**

### Step 2: Set Environment Variables

```bash
fly secrets set BASE_URL=https://youtube-downloader-api.fly.dev
fly secrets set YTDL_NO_UPDATE=1
```

Replace `youtube-downloader-api` with your actual app name.

### Step 3: Deploy

```bash
fly deploy
```

---

## ✅ Your API is Live!

Your API will be available at:
```
https://YOUR_APP_NAME.fly.dev/api/download
```

### Test it:

**Health Check:**
```
https://YOUR_APP_NAME.fly.dev/health
```

**Download Video (POST):**
```
https://YOUR_APP_NAME.fly.dev/api/download
```

Body:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

---

## 📊 Useful Commands

**Check app status:**
```bash
fly status
```

**View logs:**
```bash
fly logs
```

**Open app in browser:**
```bash
fly open
```

**SSH into your app:**
```bash
fly ssh console
```

**Scale your app:**
```bash
fly scale count 1
```

**Stop your app:**
```bash
fly scale count 0
```

**Restart your app:**
```bash
fly apps restart youtube-downloader-api
```

---

## 🔄 Update Your App

Whenever you make changes:

```bash
fly deploy
```

That's it! Fly.io will rebuild and redeploy automatically.

---

## 💰 Monitor Usage

Check your usage:
```bash
fly dashboard
```

Or visit: https://fly.io/dashboard

---

## ⚙️ Configuration Details

**Your app uses:**
- **1 shared CPU**
- **256MB RAM** (enough for this project)
- **Ephemeral storage** (files deleted on restart - that's why we have 15-min cleanup)
- **Auto-start/stop** (saves resources when not in use)

---

## ⚠️ Important Notes

1. **Ephemeral Storage:** Downloaded videos are stored temporarily and deleted when the VM restarts. This is fine since we have 15-minute auto-cleanup.

2. **Cold Starts:** Free tier apps sleep after inactivity. First request may take 5-10 seconds.

3. **Bandwidth:** 160GB/month should be enough for moderate usage. Monitor in dashboard.

4. **Scaling:** If you need more resources, you can upgrade:
   ```bash
   fly scale vm shared-cpu-1x --memory 512
   ```

---

## 🐛 Troubleshooting

**Build fails:**
```bash
fly logs
```
Check for errors in the build process.

**App crashes:**
```bash
fly logs --app youtube-downloader-api
```
Look for runtime errors.

**Can't download videos:**
- Check if ffmpeg is installed (it should be in Dockerfile)
- Verify environment variables are set
- Check logs for specific errors

**Out of memory:**
```bash
fly scale vm shared-cpu-1x --memory 512
```
Upgrade to 512MB RAM (still free tier).

---

## 🎯 Production Tips

1. **Add rate limiting** to prevent abuse
2. **Monitor logs** regularly
3. **Set up alerts** in Fly.io dashboard
4. **Consider persistent storage** if you need to keep files longer (costs extra)

---

## 🆓 Free Tier Limits

Your app should stay within free tier if:
- ✅ Moderate usage (not thousands of downloads per day)
- ✅ Files are cleaned up regularly (we do this every 15 min)
- ✅ Using 256MB RAM (sufficient for this app)

---

**Your YouTube Downloader API is now live on Fly.io!** 🎉

Access it at: `https://YOUR_APP_NAME.fly.dev`
