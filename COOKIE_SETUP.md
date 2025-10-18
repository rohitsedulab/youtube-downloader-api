# 🍪 YouTube Cookie Setup (Optional)

If you're still getting authentication errors in production, you can optionally add YouTube cookies for better authentication.

## When do you need cookies?

- Age-restricted videos
- Private/unlisted videos you have access to
- Regional restrictions
- Frequent "Sign in to confirm" errors

## How to get YouTube cookies:

### Method 1: Browser Extension (Easiest)
1. Install "Get cookies.txt LOCALLY" extension in Chrome/Firefox
2. Go to YouTube.com and make sure you're logged in
3. Click the extension icon
4. Copy the cookies for youtube.com
5. Add them to your environment variables

### Method 2: Browser Developer Tools
1. Go to YouTube.com (logged in)
2. Open Developer Tools (F12)
3. Go to Application/Storage tab
4. Click on Cookies → https://www.youtube.com
5. Copy all cookie values in Netscape format

## Adding cookies to your app:

### For Local Development:
Add to your `.env` file:
```
YOUTUBE_COOKIES=path/to/cookies.txt
```

### For Render.com Production:
1. Go to your Render dashboard
2. Click on your service
3. Go to "Environment" tab
4. Edit the `YOUTUBE_COOKIES` variable
5. Paste your cookies (or leave empty if not needed)
6. Save changes

## Cookie Format:
Cookies should be in Netscape format:
```
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	FALSE	1234567890	cookie_name	cookie_value
```

## ⚠️ Important Notes:

1. **Cookies are optional** - the app works without them for most public videos
2. **Keep cookies private** - never share them publicly
3. **Cookies expire** - you may need to update them periodically
4. **Use your own cookies** - only use cookies from your own YouTube account

## Alternative: No Cookies Needed

The updated code now works better without cookies by:
- Using multiple extraction methods
- Better user agent rotation
- Fallback mechanisms
- Enhanced error handling

Most public YouTube videos should work without any cookies!