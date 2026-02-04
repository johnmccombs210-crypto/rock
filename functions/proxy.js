export async function onRequest(context) {
  const { request } = context;
  // Optional: read API key from environment binding (set PROXY_API_KEY in Pages environment)
  const env = context.env || {};
  const requiredKey = env.PROXY_API_KEY;
  if (requiredKey) {
    const provided = request.headers.get('x-api-key') || '';
    if (provided !== requiredKey) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // Simple in-memory per-IP rate limiter (best-effort, not globally consistent)
  // Configurable via bindings in future; limits to RATE_LIMIT_MAX per window
  const RATE_LIMIT_MAX = 120; // requests
  const RATE_LIMIT_WINDOW = 60 * 1000; // ms
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
    if (entry.count > RATE_LIMIT_MAX) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
  } catch (e) {}
  const url = new URL(request.url);

  // Accept target via query param `url` or via path /api/proxy/<encoded>
  let target = url.searchParams.get('url') || '';
  if (!target) {
    const m = url.pathname.match(/^\/api\/proxy\/(.+)$/);
    if (m) target = decodeURIComponent(m[1]);
  }

  if (!target) {
    return new Response('No target URL provided. Use ?url=<encoded-url>', { status: 400 });
  }

  try {
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    const parsed = new URL(target);

    // Forward a limited set of safe headers from the client
    const forward = new Headers();
    for (const [k, v] of request.headers) {
      const lk = k.toLowerCase();
      if (['accept', 'accept-language', 'content-type', 'referer', 'origin', 'user-agent'].includes(lk)) {
        forward.set(k, v);
      }
    }

    const opts = {
      method: request.method,
      headers: forward,
      redirect: 'follow'
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      opts.body = await request.arrayBuffer();
    }

    // Try serving from the Cache API for GET requests
    let cacheKey;
    if (request.method === 'GET' && typeof caches !== 'undefined') {
      cacheKey = new Request(parsed.toString(), { method: 'GET', headers: {} });
      try {
        const cached = await caches.default.match(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (e) {}
    }

    const res = await fetch(parsed.toString(), opts);

    // Copy only a safe subset of response headers
    const resHeaders = new Headers();
    const allowed = ['content-type', 'cache-control', 'expires', 'etag', 'last-modified'];
    for (const [k, v] of res.headers) {
      if (allowed.includes(k.toLowerCase())) resHeaders.set(k, v);
    }

    // Add permissive CORS for Pages-hosted UI (adjust as needed)
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');

    // Remove headers that may leak infrastructure or prevent embedding
    resHeaders.delete('set-cookie');
    resHeaders.delete('content-encoding');
    resHeaders.delete('content-length');
    resHeaders.delete('x-frame-options');
    resHeaders.delete('content-security-policy');
    resHeaders.delete('x-content-security-policy');
    resHeaders.delete('x-webkit-csp');

    const contentType = res.headers.get('content-type') || '';

    // HTML: rewrite links to route back through this proxy
    if (contentType.includes('text/html')) {
      const text = await res.text();
      const rewritten = text.replace(/(href|src|action)=['"]([^'"\s>]+)['"]/gi, (m, attr, val) => {
        try {
          const resolved = new URL(val, parsed).toString();
          return `${attr}="/api/proxy?url=${encodeURIComponent(resolved)}"`;
        } catch (e) {
          return m;
        }
      });
      return new Response(rewritten, { status: res.status, headers: resHeaders });
    }

    // Other content types: passthrough and stream when possible
    try {
      const bodyStream = res.body;
      const out = new Response(bodyStream, { status: res.status, headers: resHeaders });

      // Cache successful GET responses (best-effort)
      if (request.method === 'GET' && res.status === 200 && typeof caches !== 'undefined' && cacheKey) {
        try {
          // clone response with caching header
          const toCache = out.clone();
          // Note: Cloudflare honors Cache-Control on the response; we add a short TTL
          toCache.headers.set('Cache-Control', 'public, max-age=60');
          await caches.default.put(cacheKey, toCache);
        } catch (e) {}
      }

      return out;
    } catch (e) {
      const body = await res.arrayBuffer();
      return new Response(body, { status: res.status, headers: resHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
