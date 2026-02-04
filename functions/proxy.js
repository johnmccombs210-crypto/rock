export async function onRequest(context) {
  const { request } = context;
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

    // Other content types: passthrough
    const body = await res.arrayBuffer();
    return new Response(body, { status: res.status, headers: resHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
