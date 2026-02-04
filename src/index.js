// Simple router implementation for Cloudflare Workers (no external dependencies needed)
class Router {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
    return this;
  }

  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler });
    return this;
  }

  put(path, handler) {
    this.routes.push({ method: 'PUT', path, handler });
    return this;
  }

  delete(path, handler) {
    this.routes.push({ method: 'DELETE', path, handler });
    return this;
  }

  patch(path, handler) {
    this.routes.push({ method: 'PATCH', path, handler });
    return this;
  }

  options(path, handler) {
    this.routes.push({ method: 'OPTIONS', path, handler });
    return this;
  }

  all(path, handler) {
    this.routes.push({ method: 'ALL', path, handler });
    return this;
  }

  handle(request) {
    const url = new URL(request.url);
    const method = request.method;

    for (const route of this.routes) {
      if ((route.method === 'ALL' || route.method === method) && this.matchPath(route.path, url.pathname)) {
        return route.handler(request);
      }
    }

    // Default 404
    return new Response('Not found', { status: 404 });
  }

  matchPath(pattern, pathname) {
    if (pattern === '/*') return true;
    if (pattern === '/') return pathname === '/';
    
    // Convert /proxy/* to regex
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/\*/g, '.*');
    
    return new RegExp(`^${regexPattern}$`).test(pathname);
  }
}

const router = new Router();

// Stealth headers to avoid detection
const stealthHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

// Simple rate-limiter and caching helpers (best-effort; per-instance only)
const RATE_LIMIT_MAX = 120; // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // ms

async function checkRateLimit(request) {
  try {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    globalThis.__rate_limits = globalThis.__rate_limits || new Map();
    const rl = globalThis.__rate_limits;
    const now = Date.now();
    const entry = rl.get(ip) || { count: 0, start: now };
    if (now - entry.start > RATE_LIMIT_WINDOW) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count++;
    rl.set(ip, entry);
    if (entry.count > RATE_LIMIT_MAX) return false;
  } catch (e) {}
  return true;
}

async function maybeServeFromCache(request, targetUrl) {
  if (request.method !== 'GET' || typeof caches === 'undefined') return null;
  try {
    const cacheKey = new Request(targetUrl, { method: 'GET' });
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;
  } catch (e) {}
  return null;
}

async function maybeCacheResponse(request, targetUrl, response) {
  if (request.method !== 'GET' || typeof caches === 'undefined') return;
  try {
    const cacheKey = new Request(targetUrl, { method: 'GET' });
    const toCache = response.clone();
    toCache.headers.set('Cache-Control', 'public, max-age=60');
    await caches.default.put(cacheKey, toCache);
  } catch (e) {}
}

// CORS headers for origin spoofing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400'
};

// Serve the web interface
router.get('/', () => {
  return new Response(getWebInterface(''), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Open the UI with an initial URL (encoded) - public friendly route
router.get('/go/*', (request) => {
  const url = new URL(request.url);
  const initial = decodeURIComponent(url.pathname.replace('/go/', '')) || '';
  return new Response(getWebInterface(initial), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Health check
router.get('/health', () => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// OPTIONS for CORS preflight
router.options('/*', () => {
  return new Response(null, { headers: corsHeaders });
});

// Main proxy endpoint
router.all('/proxy/*', async (request) => {
  try {
    // Optional API key via Pages function env: available as `GLOBAL` env binding in Pages Functions
    const env = (typeof globalThis !== 'undefined' && globalThis.PROXY_API_KEY) ? { PROXY_API_KEY: globalThis.PROXY_API_KEY } : {};
    const requiredKey = env.PROXY_API_KEY;
    if (requiredKey) {
      const provided = request.headers.get('x-api-key') || '';
      if (provided !== requiredKey) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const ok = await checkRateLimit(request);
    if (!ok) return new Response('Rate limit exceeded', { status: 429 });

    const url = request.url;
    const proxyPath = new URL(url).pathname.replace('/proxy/', '');
    
    if (!proxyPath) {
      return new Response('No URL specified', { status: 400 });
    }

    let targetUrl = proxyPath;
    
    // Handle encoded URLs
    if (proxyPath.includes('%3A%2F%2F')) {
      targetUrl = decodeURIComponent(proxyPath);
    } else if (!proxyPath.startsWith('http://') && !proxyPath.startsWith('https://')) {
      targetUrl = 'https://' + proxyPath;
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (e) {
      return new Response('Invalid URL format', { status: 400 });
    }

    // Build forwarding request
    const headers = new Headers();
    
    // Copy relevant headers from original request
    const headersToForward = [
      'accept',
      'accept-language',
      'accept-encoding',
      'content-type',
      'cache-control',
      'pragma',
      'sec-fetch-dest',
      'sec-fetch-mode',
      'sec-fetch-site'
    ];

    for (const [key, value] of request.headers) {
      const lowerKey = key.toLowerCase();
      if (headersToForward.includes(lowerKey) || key.startsWith('X-')) {
        headers.set(key, value);
      }
    }

    // Apply stealth headers
    Object.entries(stealthHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    // Remove tracking headers
    headers.delete('x-forwarded-for');
    headers.delete('x-original-url');
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ray');

    // Set referer spoofing
    if (!headers.has('referer')) {
      headers.set('referer', parsedUrl.origin + '/');
    }

    // Build fetch options
    const fetchOptions = {
      method: request.method,
      headers: headers,
      redirect: 'follow'
    };

    // Forward body if exists
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        fetchOptions.body = await request.text();
      } else if (contentType) {
        fetchOptions.body = await request.arrayBuffer();
      }
    }

    // Try cache for GETs
    const cached = await maybeServeFromCache(request, targetUrl);
    if (cached) return cached;

    // Fetch target
    const response = await fetch(targetUrl, fetchOptions);

    // Process response
    const contentType = response.headers.get('content-type') || '';
    let responseBody = await response.arrayBuffer();

    // Rewrite HTML content so navigation stays inside the app
    if (contentType.includes('text/html')) {
      const text = new TextDecoder().decode(responseBody);
      const rewritten = rewriteHTML(text, parsedUrl);
      responseBody = new TextEncoder().encode(rewritten);
    }

    // Rewrite CSS content to route asset requests through proxy
    if (contentType.includes('text/css')) {
      const text = new TextDecoder().decode(responseBody);
      const rewritten = rewriteCSS(text, parsedUrl, targetUrl);
      responseBody = new TextEncoder().encode(rewritten);
    }

    // Rewrite JavaScript content (light touch)
    if (contentType.includes('application/javascript') || contentType.includes('text/javascript')) {
      const text = new TextDecoder().decode(responseBody);
      const rewritten = rewriteJS(text);
      responseBody = new TextEncoder().encode(rewritten);
    }

    // Build response headers (avoid copying encoding/length when body changed)
    const responseHeaders = new Headers();
    const headersToInclude = [
      'content-type',
      'cache-control',
      'expires',
      'etag',
      'last-modified'
    ];

    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (headersToInclude.includes(lowerKey)) {
        responseHeaders.set(key, value);
      }
    });

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // Remove / sanitize headers that break embedding or leak info
    responseHeaders.delete('server');
    responseHeaders.delete('x-powered-by');
    responseHeaders.delete('x-aspnet-version');
    responseHeaders.delete('content-security-policy');
    responseHeaders.delete('x-frame-options');
    responseHeaders.delete('frame-options');
    responseHeaders.delete('set-cookie');
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    const out = new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

    // Cache successful GET responses
    maybeCacheResponse(request, targetUrl, out.clone());

    return out;

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ 
      error: 'Proxy error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Rewrite HTML so links/assets route through the proxy and open in-app tabs
function rewriteHTML(html, parsedUrl) {
  // Rewrite common attributes (href, src, action, data-src)
  const attrRegex = /(href|src|action|data-src)=("|')([^"']+)("|')/gi;

  const rewritten = html.replace(attrRegex, (m, attr, q1, val, q2) => {
    try {
      const resolved = new URL(val, parsedUrl).toString();
      const proxied = '/proxy/' + encodeURIComponent(resolved);
      // For links and forms, notify parent to open a new in-app tab instead of navigating
      if (attr === 'href' || attr === 'action') {
        return `${attr}=${q1}${proxied}${q2} onclick="window.top.postMessage({type:'openTab',url:'${proxied}'}, '*'); return false;"`;
      }
      return `${attr}=${q1}${proxied}${q2}`;
    } catch (e) {
      return m;
    }
  });

  // Fix script/link tags that use relative paths
  const scriptLinkRegex = /(<(?:script|link)[^>]*(?:src|href)=("|')?)([^"' >]+)("|')?/gi;
  return rewritten.replace(scriptLinkRegex, (m, prefix, q, val, q2) => {
    try {
      if (val.startsWith('http') || val.startsWith('//')) return m;
      const resolved = new URL(val, parsedUrl).toString();
      const proxied = '/proxy/' + encodeURIComponent(resolved);
      return `${prefix}${proxied}${q2 || '"'}`;
    } catch (e) {
      return m;
    }
  });
}

// Rewrite CSS URLs
function rewriteCSS(css, parsedUrl, targetUrl) {
  // Replace relative url(...) references with proxied equivalents
  return css.replace(/url\(([^)]+)\)/gi, (m, raw) => {
    let url = raw.trim().replace(/^['"]|['"]$/g, '');
    try {
      const resolved = new URL(url, parsedUrl).toString();
      const proxied = '/proxy/' + encodeURIComponent(resolved);
      return `url('${proxied}')`;
    } catch (e) {
      return m;
    }
  });
}

// Rewrite JavaScript
function rewriteJS(js) {
  return js
    .replace(/(?:window\.location|location\.href)\s*=/g, 'void ')
    .replace(/document\.domain\s*=/g, 'void ');
}

// 404 handler
router.all('*', () => {
  return new Response('Not found', { status: 404 });
});

// Main event handler
export default {
  fetch: (request) => router.handle(request),
};

// Web interface HTML
function getWebInterface(initialUrl) {
  const INITIAL = JSON.stringify(initialUrl || '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stealth Browser - Access Any Site Anonymously</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            width: 100%;
            max-width: 900px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.95;
        }

        .content {
            padding: 40px 30px;
        }

        .input-group {
            margin-bottom: 25px;
        }

        label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
            font-size: 1em;
        }

        .input-wrapper {
            display: flex;
            gap: 10px;
        }

        input[type="text"] {
            flex: 1;
            padding: 14px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1em;
            transition: all 0.3s ease;
            font-family: 'Courier New', monospace;
        }

        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        button {
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        button:active {
            transform: translateY(0);
        }

        .info-section {
            background: #f5f7fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }

        .info-section h3 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.1em;
        }

        .info-section ul {
            list-style: none;
            padding: 0;
        }

        .info-section li {
            padding: 6px 0;
            color: #555;
            display: flex;
            align-items: center;
        }

        .info-section li:before {
            content: "✓";
            color: #667eea;
            font-weight: bold;
            margin-right: 10px;
        }

        .examples {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }

        .examples h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.1em;
        }

        .example-item {
            background: white;
            padding: 12px 15px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 3px solid #667eea;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #555;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .example-item:hover {
            background: #f0f4ff;
            transform: translateX(5px);
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-number {
            font-size: 2em;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .footer {
            background: #f5f7fa;
            padding: 20px 30px;
            text-align: center;
            color: #888;
            font-size: 0.9em;
            border-top: 1px solid #e0e0e0;
        }

        .loading {
            display: none;
            text-align: center;
            color: #667eea;
            font-weight: 600;
        }

        .loading.active {
            display: block;
        }

        .error {
            display: none;
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #c33;
        }

        .error.active {
            display: block;
        }

        @media (max-width: 600px) {
            .header h1 {
                font-size: 2em;
            }

            .content {
                padding: 25px 20px;
            }

            .input-wrapper {
                flex-direction: column;
            }

            button {
                width: 100%;
            }

            .stats {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
          <h1>🔐 Stealth Browser</h1>
          <p>Access any website with complete privacy and anonymity</p>
        </div>

        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">∞</div>
                    <div class="stat-label">Zero Logs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">🚀</div>
                    <div class="stat-label">Lightning Fast</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">🔒</div>
                    <div class="stat-label">100% Encrypted</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">✓</div>
                    <div class="stat-label">GeForce Now Ready</div>
                </div>
            </div>

            <div class="error" id="errorMsg"></div>

            <div class="input-group">
                <label for="urlInput">Enter Website URL:</label>
                <div class="input-wrapper">
                    <input 
                        type="text" 
                        id="urlInput" 
                        placeholder="example.com or https://example.com"
                        onkeypress="if(event.key==='Enter') proxyRequest()"
                    >
                    <button onclick="proxyRequest()">Browse</button>
                </div>
            </div>

            <div class="info-section">
              <h3>Why Use This Service?</h3>
                <ul>
                    <li>Completely hide your IP address</li>
                    <li>Access geo-restricted content</li>
                    <li>Bypass network filters and firewalls</li>
                    <li>Protect your privacy online</li>
                    <li>Stream GeForce Now without restrictions</li>
                    <li>No installation required - works in any browser</li>
                </ul>
            </div>

            <div class="examples">
                <h3>Quick Examples:</h3>
                <div class="example-item" onclick="setExample('google.com')">google.com</div>
                <div class="example-item" onclick="setExample('youtube.com')">youtube.com</div>
                <div class="example-item" onclick="setExample('github.com')">github.com</div>
                <div class="example-item" onclick="setExample('play.geforcenow.com')">play.geforcenow.com</div>
            </div>

            <div class="loading" id="loading">
              Loading... Please wait while we fetch your content securely.
            </div>

            <!-- Tabs / browser area -->
            <div id="browser" style="display:none; padding:20px;">
              <div id="tabBar" style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap;"></div>
              <div id="tabViews" style="border:1px solid #eaeaea; border-radius:8px; height:600px; overflow:hidden;"></div>
            </div>
        </div>

        <div class="footer">
            <p>✓ Built by john • Privacy-First Access • Cloudflare Workers</p>
        </div>
    </div>

    <script>
          function setExample(url) {
            document.getElementById('urlInput').value = url;
            openNewTab(url);
          }

          function proxyRequest() {
            const url = document.getElementById('urlInput').value.trim();
            if (!url) {
              showError('Please enter a URL');
              return;
            }
            openNewTab(url);
          }

          function normalizeUrl(url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              return 'https://' + url;
            }
            return url;
          }

          function openNewTab(rawUrl) {
            const url = normalizeUrl(rawUrl.trim());
            if (!url) return;
            document.getElementById('errorMsg').classList.remove('active');
            document.getElementById('loading').classList.remove('active');
            document.getElementById('browser').style.display = 'block';

            const proxied = '/proxy/' + encodeURIComponent(url);
            const tabId = 'tab-' + Date.now();

            const tabBar = document.getElementById('tabBar');
            const tabBtn = document.createElement('button');
            tabBtn.textContent = new URL(url).hostname;
            tabBtn.id = tabId + '-btn';
            tabBtn.style.padding = '8px 12px';
            tabBtn.style.borderRadius = '6px';
            tabBtn.onclick = () => selectTab(tabId);

            const closeBtn = document.createElement('span');
            closeBtn.textContent = ' ✕';
            closeBtn.style.marginLeft = '8px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = (e) => { e.stopPropagation(); closeTab(tabId); };
            tabBtn.appendChild(closeBtn);
            tabBar.appendChild(tabBtn);

            const tabViews = document.getElementById('tabViews');
            const iframe = document.createElement('iframe');
            iframe.src = proxied;
            iframe.id = tabId + '-view';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';
            iframe.onload = () => { selectTab(tabId); };

            // Hide existing views
            Array.from(tabViews.children).forEach(c => c.style.display = 'none');
            tabViews.appendChild(iframe);
          }

          function selectTab(tabId) {
            const tabBar = document.getElementById('tabBar');
            Array.from(tabBar.children).forEach(btn => btn.style.opacity = '0.6');
            const btn = document.getElementById(tabId + '-btn');
            if (btn) btn.style.opacity = '1';

            const tabViews = document.getElementById('tabViews');
            Array.from(tabViews.children).forEach(v => v.style.display = 'none');
            const view = document.getElementById(tabId + '-view');
            if (view) view.style.display = 'block';
          }

          function closeTab(tabId) {
            const btn = document.getElementById(tabId + '-btn');
            if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
            const view = document.getElementById(tabId + '-view');
            if (view && view.parentNode) view.parentNode.removeChild(view);
          }

          // Open tab when proxied page posts a message
          window.addEventListener('message', (ev) => {
            try {
              const data = ev.data || {};
              if (data && data.type === 'openTab' && data.url) {
                // data.url will be a proxied path like /proxy/encoded
                const decoded = decodeURIComponent(data.url.replace('/proxy/', ''));
                openNewTab(decoded);
              }
            } catch (e) {}
          });

        function showError(message) {
            const errorMsg = document.getElementById('errorMsg');
            errorMsg.textContent = '❌ ' + message;
            errorMsg.classList.add('active');
            document.getElementById('loading').classList.remove('active');
        }

        // Example theme animation and initial URL
        window.addEventListener('load', () => {
          document.body.style.animation = 'fadeIn 0.5s ease-in';
          try {
            const initial = ${INITIAL};
            if (initial) openNewTab(initial);
          } catch (e) {}
        });
    </script>
</body>
</html>`;
}
