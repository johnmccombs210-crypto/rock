# Stealth Proxy Deployment Guide

## Quick Deploy (Copy & Paste)

### For Beginners (Fastest Way):
```bash
# 1. Make sure you have Node.js installed: https://nodejs.org/
# 2. Copy the commands below and paste them in your terminal

git clone https://github.com/johnmccombs210-crypto/rock.git
cd rock
npm install
npx wrangler login
npm run deploy
```

**That's it!** You'll get a URL like `https://stealth-proxy-abc123.workers.dev`

---

## Step-by-Step Guide

### 1. Prerequisites
You need:
- **Node.js 16+** - [Download](https://nodejs.org/) (Choose LTS)
- **Free Cloudflare Account** - [Signup](https://dash.cloudflare.com/sign-up)
- **Git** (optional, for cloning)

### 2. Installation

#### Option A: Using Git (Recommended)
```bash
git clone https://github.com/johnmccombs210-crypto/rock.git
cd rock
npm install
```

#### Option B: Download & Extract
1. Download as ZIP from GitHub
2. Extract the folder
3. Open terminal in that folder
4. Run: `npm install`

### 3. Login to Cloudflare
```bash
npx wrangler login
```
This opens your browser to authenticate. Click "Allow" and you're set!

### 4. Deploy!
```bash
npm run deploy
```

You'll see something like:
```
✨ Built successfully, deployed successfully.
   https://stealth-proxy-abc123.workers.dev
```

Copy that URL and visit it in your browser. Done! 🎉

---

## What If I Want a Custom Domain?

### Setup:
1. **Buy a domain** from GoDaddy, Namecheap, etc. (~$10/year)
2. **Change nameservers** to Cloudflare:
   - Go to Cloudflare dashboard → Add Site
   - Copy nameservers they give you
   - Go to your registrar and paste them in DNS settings
   - Wait 24 hours for propagation

3. **Update wrangler.toml:**
   ```toml
   routes = [
     { pattern = "*/*", zone_name = "yourdomain.com" }
   ]
   ```

4. **Redeploy:**
   ```bash
   npm run deploy
   ```

Now visit `https://yourdomain.com` 🎉

---

## Troubleshooting

### Error: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Error: "npx wrangler login failed"
**Solution:**
```bash
npm install -g wrangler
wrangler login
```

### Error: "Cannot find module 'itty-router'"
**Solution:**
```bash
npm install itty-router
```

### Site says "Proxy error"
**Possible causes:**
- Target site blocked the connection (rare)
- Browser cache issue → Clear cache
- Try incognito/private mode

### Deployment stuck/frozen
**Solution:**
- Press Ctrl+C to cancel
- Run again: `npm run deploy`

### Can't login to Cloudflare
**Solution:**
1. Logout: `wrangler logout`
2. Login again: `wrangler login`
3. Make sure you have JavaScript enabled in browser

---

## How to Use Your Proxy

### Via Web Interface:
1. Visit your proxy URL
2. Type website URL in box
3. Click "Browse"
4. Enjoy anonymous access!

### Via Direct Links:
```
https://your-proxy-url/proxy/google.com
https://your-proxy-url/proxy/youtube.com
https://your-proxy-url/proxy/example.com
```

### In Another Website's iFrame:
```html
<iframe src="https://your-proxy-url/proxy/example.com"></iframe>
```

---

## Advanced: Customizing Your Proxy

### Change Stealth Headers
Edit `src/index.js`, find this section:

```javascript
const stealthHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  'Accept-Language': 'en-US,en;q=0.9',
};
```

Change to whatever you want, then redeploy:
```bash
npm run deploy
```

### Custom Error Pages
Edit the `getWebInterface()` function in `src/index.js`

### Add Authentication
Add a simple password check in the proxy logic:

```javascript
const PASSWORD = 'your-secret-password';
if (request.headers.get('Authorization') !== `Bearer ${PASSWORD}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## Understanding the Files

```
rock/
├── src/
│   └── index.js          ← Main proxy code (edit this!)
├── wrangler.toml         ← Cloudflare config
├── package.json          ← Dependencies
├── README.md             ← Full documentation
└── DEPLOY.md             ← This file
```

---

## Performance Tips

### For Better Speeds:
1. Use geographically closer servers
2. Enable Cloudflare caching
3. Minimize payload size
4. Use compression

All of this is already configured! Just deploy and enjoy.

---

## Security Notes

✅ **Safe to use:**
- Your ISP sees encrypted traffic (looks like Cloudflare)
- No logs kept
- HTTPS encrypted

⚠️ **Remember:**
- Target sites might still log your activities
- Use VPN + Proxy for maximum privacy
- Don't do anything illegal!

---

## Need Help?

### Check These:
1. GitHub Issues: https://github.com/johnmccombs210-crypto/rock/issues
2. Cloudflare Docs: https://developers.cloudflare.com/workers/
3. Wrangler CLI Help: `wrangler --help`

### Still Stuck?
Create a GitHub issue with:
- What you tried
- What error you got
- Your OS (Windows/Mac/Linux)

---

## Next Steps

1. ✅ Deploy (follow above steps)
2. Test it with google.com
3. Try YouTube or other sites
4. Share with friends!
5. Consider donating/starring on GitHub

---

**Enjoy your new privacy!** 🔐
