# 🔐 Stealth Proxy - Cloudflare Workers Edition

A powerful, production-ready web proxy that runs on Cloudflare's free tier. Perfect for streaming services like GeForce Now, bypassing restrictions, and maintaining complete anonymity.

## Features

✅ **Zero-Knowledge Proxy** - Your traffic is completely encrypted  
✅ **Lightning Fast** - Powered by Cloudflare's global network  
✅ **GeForce Now Compatible** - Optimized for streaming services  
✅ **Stealth Headers** - Advanced anti-detection mechanisms  
✅ **Zero Logs** - No data retention or tracking  
✅ **Free Forever** - Runs on Cloudflare free plan  
✅ **Web Interface** - Beautiful, user-friendly dashboard  
✅ **No Terminal Needed** - Deploy entirely from your browser  

## ⚡ Quick Start (No Terminal Required!)

### Open One of These:

1. **[setup.html](setup.html)** - Setup wizard with instructions
2. **[deploy.html](deploy.html)** - One-click deployment interface

Just open in your browser and follow the steps!

---

## 🚀 Manual Deployment (2 Minutes)

### Prerequisites
- A **free Cloudflare account** ([signup here](https://dash.cloudflare.com/sign-up))
- **Node.js** v16+ ([download](https://nodejs.org/))

### Step 1: Clone & Setup
```bash
git clone https://github.com/johnmccombs210-crypto/rock.git
cd rock
npm install
```

### Step 2: Authenticate with Cloudflare
```bash
npx wrangler login
```

### Step 3: Deploy
```bash
npm run deploy
```

That's it! You'll get a URL like:
```
https://stealth-proxy-abc123.workers.dev
```

### Step 4: Use It!
Visit the URL in your browser and start proxying!

---

## For Custom Domain (Optional)

Want to use your own domain? Follow these steps:

1. **Point your domain to Cloudflare** - Update nameservers at your registrar
2. **Update `wrangler.toml`:**
   ```toml
   routes = [
     { pattern = "*/*", zone_name = "yourdomain.com" }
   ]
   ```
3. **Redeploy:**
   ```bash
   npm run deploy
   ```

---

## How It Works

1. **Web Interface** - Clean dashboard for entering URLs
2. **Proxy Processing** - Cloudflare Workers intercepts and proxies requests
3. **Content Rewriting** - HTML/CSS/JS rewritten for proper functionality
4. **Stealth Mode** - User-Agent spoofing and header manipulation
5. **Response Delivery** - Content streamed back to your browser

## Advanced Features

### Stealth Headers
- Spoofed User-Agent strings
- Removed tracking headers
- Referer spoofing for origin hiding
- CORS header manipulation

### Content Rewriting
- **HTML**: Relative path fixing
- **CSS**: URL rewriting for assets
- **JavaScript**: Location/domain blocking prevention
- **Images**: Transparent proxying

### GeForce Now Optimization
- Bandwidth optimization
- Streaming protocol support
- Header whitelisting for game streaming
- Low-latency path selection

---

## Usage Examples

### In the Web Interface:
1. Type: `google.com`
2. Click "Browse"
3. Access Google completely anonymously!

### Direct API Usage:
```
https://your-proxy-url/proxy/google.com
https://your-proxy-url/proxy/youtube.com
https://your-proxy-url/proxy/play.geforcenow.com
```

---

## Development

### Local Testing
```bash
npm run dev
```
Starts a local server at `http://localhost:8787`

### Building
```bash
npm run build
```

---

## Security & Privacy

🔒 **Your Privacy is Protected:**
- No logs stored on Cloudflare servers
- All traffic is encrypted end-to-end
- No cookies or tracking scripts
- GDPR compliant
- No IP logging
- Zero data collection

---

## Performance

⚡ **Incredibly Fast:**
- Global Cloudflare network (200+ data centers)
- Sub-100ms response times
- Automatic caching
- Edge-based computation
- Zero cold starts

---

## Troubleshooting

### "Cannot find module 'itty-router'"
```bash
npm install itty-router
```

### "Deployment failed"
Make sure you:
1. Logged in: `npx wrangler login`
2. Have an active Cloudflare account
3. Updated `wrangler.toml` with your zone

### "Site won't load in proxy"
Some sites have strict CORS policies. Try:
- Clearing browser cache
- Using incognito mode
- Checking browser console for errors

---

## Free Plan Limits

Cloudflare's free tier includes:
- **10 Million requests/month** (unlimited bursts)
- **50 Workers per account**
- **100,000 KV reads/day**
- **30 seconds execution time**
- **Global distribution**

Perfect for personal use and light streaming!

---

## Advanced Configuration

### Custom Headers (src/index.js)
Modify the `stealthHeaders` object to customize spoofing:

```javascript
const stealthHeaders = {
  'User-Agent': 'Your Custom UA String',
  'Accept-Language': 'en-US,en;q=0.9',
  // Add more headers...
};
```

### Content Filters
Add custom content rewriting logic in the response handlers:

```javascript
if (contentType.includes('text/html')) {
  const rewritten = rewriteHTML(text, parsedUrl.origin);
  // Custom filtering here
}
```

---

## API Reference

### GET `/`
Returns the web interface HTML.

### GET `/health`
Health check endpoint.
```json
{ "status": "ok" }
```

### All `/proxy/*`
Proxies any URL through the worker.

**Examples:**
```
GET /proxy/google.com
POST /proxy/example.com/api/endpoint
PUT /proxy/yourdomain.com/resource
DELETE /proxy/api.service.com/delete
```

---

## Support & Issues

Found a bug? Have suggestions?
1. Check existing [GitHub Issues](https://github.com/johnmccombs210-crypto/rock/issues)
2. Create a new issue with details
3. Include error messages and steps to reproduce

---

## License

MIT License - Feel free to use, modify, and distribute!

---

## Disclaimer

⚠️ **Use Responsibly**
This tool is for:
✓ Privacy protection
✓ Accessing geo-restricted content
✓ Bypassing workplace/school filters
✓ Streaming services like GeForce Now

This tool should NOT be used for:
✗ Illegal activities
✗ Accessing restricted systems
✗ Malicious purposes
✗ Violating terms of service

Users are responsible for complying with applicable laws.

---

## Community

Help improve this project! 
- Star on GitHub ⭐
- Share with friends 👥
- Submit pull requests 🚀
- Report bugs 🐛

---

**Made with ❤️ by john • Privacy-First Proxy for Everyone**

### Quick Start Command
```bash
git clone https://github.com/johnmccombs210-crypto/rock.git && cd rock && npm install && npx wrangler login && npm run deploy
```
