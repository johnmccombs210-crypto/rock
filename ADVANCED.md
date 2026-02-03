# Advanced Configuration Guide

## Environment Variables

Create a `.env` file for local development:

```bash
# .env
ENVIRONMENT=development
LOG_LEVEL=debug
CACHE_TTL=3600
```

## Custom Proxy Rules

### Blocking Certain Sites
Edit `src/index.js`, add to the main proxy handler:

```javascript
const blockedDomains = ['facebook.com', 'tiktok.com'];

const hostname = new URL(targetUrl).hostname;
if (blockedDomains.some(domain => hostname.includes(domain))) {
  return new Response('This site is blocked', { status: 403 });
}
```

### Redirect Rules
```javascript
const redirects = {
  'short.link': 'https://example.com/long-url'
};

const redirect = redirects[new URL(targetUrl).hostname];
if (redirect) {
  return fetch(redirect, fetchOptions);
}
```

## Rate Limiting

Add DDoS protection:

```javascript
// Simple rate limiting (store IP + request count)
const requestCounts = {}; // In production, use Cloudflare KV

const clientIP = request.headers.get('CF-Connecting-IP');
if (!requestCounts[clientIP]) {
  requestCounts[clientIP] = 0;
}

requestCounts[clientIP]++;

if (requestCounts[clientIP] > 100) { // 100 requests per period
  return new Response('Rate limited', { status: 429 });
}
```

## Using Cloudflare KV for Advanced Features

### Store API Keys
```javascript
// In wrangler.toml
[[env.production.kv_namespaces]]
binding = "API_KEYS"
id = "your-kv-namespace-id"
```

### Access in code:
```javascript
const apiKey = await API_KEYS.get('user_key_1');
```

## SSL/TLS Configuration

Already handled! Cloudflare auto-generates HTTPS certificates.

To force HTTPS only in `wrangler.toml`:

```toml
[env.production]
name = "stealth-proxy-prod"
routes = [
  { pattern = "http://*", zone_name = "example.com" }
]
```

## CORS Configuration

Current CORS allows all origins. To restrict:

```javascript
const ALLOWED_ORIGINS = [
  'https://myapp.com',
  'https://app.mysite.com'
];

const origin = request.headers.get('origin');
if (!ALLOWED_ORIGINS.includes(origin)) {
  return new Response('CORS blocked', { status: 403 });
}
```

## Caching Strategy

Optimize cache headers in response:

```javascript
const cacheControl = new Headers(responseHeaders);
cacheControl.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
```

## Custom Analytics

Track proxy usage:

```javascript
// Simple counter (requires KV store)
async function trackUsage(url) {
  const today = new Date().toISOString().split('T')[0];
  const key = `analytics:${today}`;
  const count = await parseInt(await ANALYTICS.get(key)) || 0;
  await ANALYTICS.put(key, count + 1);
}
```

## WebSocket Support

Workers don't support WebSockets directly, but you can proxy WebSocket connections through polling.

## Error Handling

Custom error pages:

```javascript
const errorPages = {
  404: '<h1>Page Not Found</h1>',
  403: '<h1>Access Denied</h1>',
  500: '<h1>Server Error</h1>'
};

if (errorPages[response.status]) {
  return new Response(errorPages[response.status], {
    status: response.status,
    headers: { 'Content-Type': 'text/html' }
  });
}
```

## Testing Locally

```bash
# Start local dev server
npm run dev

# Then visit http://localhost:8787
```

## Production Deployment

```bash
# Deploy to production (recommended to test first)
npm run deploy

# Monitor in Cloudflare Dashboard
# Analytics → Workers
```

## Monitoring

### View Logs:
```bash
wrangler tail
```

### Real-time monitoring:
Visit Cloudflare Dashboard → Workers → your-worker → Logs

## Scaling Considerations

Current implementation handles:
- ✅ Millions of requests/month (free tier: 10M)
- ✅ Concurrent connections (unlimited)
- ✅ Global distribution (automatic)
- ✅ Zero server costs

Upgrade to paid plan only if you exceed free limits.

## Security Best Practices

1. **Never log sensitive data** - Users trust you!
2. **Always use HTTPS** - It's automatic
3. **Validate inputs** - Check URLs before proxying
4. **Limit endpoint access** - Consider auth tokens
5. **Monitor for abuse** - Use rate limiting

## Performance Optimization

### Minify JS:
```bash
npm install esbuild-plugin-minify-html
```

### Enable gzip:
Already enabled! Check `Content-Encoding` header

### Image optimization:
Cloudflare Auto-Minify handles this

### Database queries:
No database needed! Edge-native architecture

## Updating Dependencies

```bash
npm outdated        # Check for updates
npm update          # Update all packages
npm install -g wrangler  # Update Wrangler CLI
```

## Troubleshooting Advanced Issues

### High CPU usage
- Check if HTML rewriting is efficient
- Consider caching more aggressively

### Memory issues
- Reduce body size limits
- Stream large responses

### CORS errors
- Check `corsHeaders` configuration
- Add `Access-Control-Allow-Credentials: true` if needed

## Contributing to This Project

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally: `npm run dev`
5. Deploy test version: `npm run deploy`
6. Submit pull request

---

For more help, see [README.md](README.md) or [DEPLOY.md](DEPLOY.md)
