# 🚀 Deploy to Render.com - Simple Guide

## ✅ Render.com Free Tier
- **750 hours/month** (enough for 24/7 uptime)
- **Automatic HTTPS**
- **No credit card required**
- **Auto-deploy from GitHub**
- **Perfect for this project!**

---

## 📋 Deployment Steps

### Step 1: Go to Render
**Open:** https://render.com

### Step 2: Sign Up / Login
- Click **"Get Started"** or **"Sign In"**
- Choose **"Sign in with GitHub"**
- Authorize Render

### Step 3: Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find and select **`youtube-downloader-api`**
5. Click **"Connect"**

### Step 4: Configure Your Service

Fill in these details:

**Name:** `youtube-downloader-api` (or your choice)

**Region:** Choose closest to you:
- `Singapore` (Asia)
- `Oregon` (US West)
- `Frankfurt` (Europe)

**Branch:** `main`

**Root Directory:** Leave blank

**Runtime:** `Node`

**Build Command:** `npm install`

**Start Command:** `node server.js`

**Plan:** Select **"Free"**

### Step 5: Add Environment Variables

Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**:

1. **Key:** `PORT` → **Value:** `10000`
2. **Key:** `YTDL_NO_UPDATE` → **Value:** `1`
3. **Key:** `NODE_VERSION` → **Value:** `20`

### Step 6: Deploy!

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait 3-5 minutes for deployment to complete
4. You'll see **"Live"** when it's ready! ✅

### Step 7: Get Your Live URL

Your app will be live at:
```
https://youtube-downloader-api.onrender.com
```

(Or whatever name you chose)

### Step 8: Add BASE_URL Variable

1. Go to **"Environment"** tab
2. Add one more variable:
   - **Key:** `BASE_URL`
   - **Value:** `https://your-app-name.onrender.com`
3. Click **"Save Changes"**
4. Render will automatically redeploy

---

## ✅ Test Your Live API

**Health Check:**
```
https://your-app-name.onrender.com/health
```

**Download Video (POST):**
```
https://your-app-name.onrender.com/api/download
```

**Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

---

## 📊 Useful Features

**View Logs:**
- Click on your service
- Go to **"Logs"** tab
- See real-time logs

**Manual Deploy:**
- Go to **"Manual Deploy"** tab
- Click **"Deploy latest commit"**

**Auto-Deploy:**
- Every time you push to GitHub, Render auto-deploys!

---

## 🔄 Update Your App

Whenever you make changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Render will automatically detect and redeploy! 🎉

---

## ⚠️ Important Notes

1. **Cold Starts:** Free tier apps sleep after 15 minutes of inactivity. First request takes 30-50 seconds to wake up.

2. **Ephemeral Storage:** Files are deleted when the service restarts. That's fine - we have 15-minute auto-cleanup anyway.

3. **750 Hours/Month:** Enough for 24/7 uptime on one service.

4. **Build Time:** First build takes 3-5 minutes. Subsequent builds are faster.

---

## 🐛 Troubleshooting

**Build fails:**
- Check logs in Render dashboard
- Verify `package.json` has all dependencies
- Make sure Node version is compatible

**App crashes:**
- Check logs for errors
- Verify environment variables are set
- Ensure PORT is set to 10000

**Can't download videos:**
- Check if ffmpeg is installed (Render installs it automatically)
- Verify the video is public/unlisted
- Check logs for specific errors
- For age-restricted videos, see COOKIE_SETUP.md for optional cookie configuration

**Slow first request:**
- This is normal for free tier (cold start)
- App wakes up after first request
- Consider upgrading to paid tier for always-on

---

## 💡 Pro Tips

1. **Keep it awake:** Use a service like UptimeRobot to ping your API every 5 minutes (prevents sleeping)

2. **Monitor logs:** Check logs regularly for errors

3. **Custom domain:** You can add a custom domain in Settings (optional)

4. **Upgrade if needed:** If you need always-on, upgrade to paid tier ($7/month)

---

## 🎯 Free Tier Limits

Your app should stay within free tier if:
- ✅ Moderate usage (not thousands of requests per day)
- ✅ Files cleaned up regularly (we do this every 15 min)
- ✅ Acceptable cold starts (30-50 seconds after inactivity)

---

**Your YouTube Downloader API is now live on Render!** 🎉

Access it at: `https://your-app-name.onrender.com`
