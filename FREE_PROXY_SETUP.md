# 🆓 Free Proxy Setup to Bypass Rate Limiting

## The Problem
Render's free tier IP is blocked by YouTube. You need to route requests through a different IP.

## Solution: Use a Free Proxy

### Option 1: Free Public Proxies (Quick Test)

**Warning:** Public proxies are unreliable and slow. Use only for testing.

1. Get a free proxy from:
   - https://www.proxy-list.download/HTTPS
   - https://free-proxy-list.net/
   - https://www.sslproxies.org/

2. Add to Render environment variables:
   ```
   PROXY_URL=http://proxy-ip:port
   ```

3. Redeploy

Example:
```
PROXY_URL=http://45.76.167.26:8080
```

### Option 2: Webshare (Best Free Option) ⭐

**10 free proxies, reliable, fast**

1. Sign up at https://www.webshare.io/ (free account)
2. Go to "Proxy" → "Proxy List"
3. Copy a proxy address
4. Format: `http://username:password@proxy.webshare.io:port`
5. Add to Render:
   ```
   PROXY_URL=http://username:password@proxy.webshare.io:9999
   ```

### Option 3: ProxyScrape (Free API)

1. Sign up at https://proxyscrape.com/
2. Get API key
3. Use their rotating proxy endpoint
4. Add to Render:
   ```
   PROXY_URL=http://api.proxyscrape.com:8080
   ```

### Option 4: ScraperAPI Free Tier

**1,000 free requests/month**

1. Sign up at https://www.scraperapi.com/
2. Get your API key
3. Their proxy format:
   ```
   PROXY_URL=http://scraperapi:YOUR_API_KEY@proxy-server.scraperapi.com:8001
   ```

## How to Add Proxy to Render

1. Go to Render dashboard
2. Click your service
3. Go to "Environment" tab
4. Find `PROXY_URL` variable
5. Paste your proxy URL
6. Click "Save Changes"
7. Wait for automatic redeploy (2-3 minutes)

## Testing

After adding proxy, test:

```bash
curl -X POST https://your-app.onrender.com/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Check logs - you should see:
```
🔄 Using proxy: http://***@proxy.com:8080
```

## Paid Proxy Services (Recommended for Production)

If you need reliability:

### 1. Bright Data (formerly Luminati)
- **Cost:** $500/month (residential)
- **Best for:** High volume, enterprise
- https://brightdata.com/

### 2. Oxylabs
- **Cost:** $300/month
- **Best for:** Reliable, good support
- https://oxylabs.io/

### 3. Smartproxy
- **Cost:** $75/month (8GB)
- **Best for:** Budget-friendly, reliable
- https://smartproxy.com/

### 4. ScraperAPI (Easiest)
- **Cost:** $49/month (100k requests)
- **Best for:** Easy setup, handles everything
- https://www.scraperapi.com/

### 5. Webshare (Cheapest)
- **Cost:** $2.99/month (10 proxies)
- **Best for:** Small projects, testing
- https://www.webshare.io/

## Alternative: Switch Hosting Platform

Instead of using proxies, switch to a platform with better IPs:

### Railway (Recommended) 🚂
- **Cost:** Free to start, $5/month after
- **Better IP reputation**
- **Easier than Render**
- https://railway.app/

### Fly.io
- **Cost:** Free tier available
- **Multiple regions**
- **Good for global apps**
- https://fly.io/

### Heroku
- **Cost:** $7/month (Eco dyno)
- **Reliable, established**
- **Good IP reputation**
- https://heroku.com/

## My Recommendation

**For Testing:**
1. Try Webshare free tier (10 proxies)
2. Or switch to Railway (better IPs)

**For Production:**
1. Railway or Fly.io ($5-7/month)
2. Or Smartproxy ($75/month for proxies)
3. Or upgrade Render to paid plan

**For High Volume:**
1. Dedicated VPS (DigitalOcean, Linode)
2. Professional proxy service (Bright Data, Oxylabs)
3. Implement request queue and caching

## Reality Check

YouTube actively blocks:
- ✅ Free hosting IPs (Render, Vercel, Netlify)
- ✅ Cloud IPs (AWS, GCP, Azure)
- ✅ VPS IPs (DigitalOcean, Linode)
- ✅ Free proxies (public lists)

YouTube allows:
- ✅ Residential IPs (home internet)
- ✅ Mobile IPs (4G/5G)
- ✅ Premium residential proxies
- ✅ Some paid hosting with good reputation

**Bottom line:** For reliable YouTube downloading, you need either:
1. Paid hosting with good IP reputation ($5-10/month)
2. Residential proxy service ($50-300/month)
3. Your own home server (free but requires setup)

The free tier will always have rate limiting issues with YouTube.
