# Stealth Proxy — Deploy to Cloudflare (quick)

This repo includes a static UI and a Pages Function at `functions/proxy.js` that serves the proxy at `/api/proxy`.

Minimal steps (Cloudflare Pages + Functions):

1. Install dependencies (optional):

```bash
npm install
```

2. Build the publishable site into `dist/`:

```bash
npm run build
```

3. Create a Pages project in the Cloudflare dashboard (or reuse an existing one), then publish:

```bash
# publish (replace <project-name> with your Pages project name)
npx wrangler pages publish dist --project-name=<project-name>
```

Local testing options:

- Pages + Functions emulator: `npm run pages:dev` (runs `wrangler pages dev dist`).
- Worker-style dev: `npm run dev` (runs `wrangler dev` to exercise `src/index.js`).

Alternative: deploy as a standalone Worker (uses `src/index.js`):

```bash
npm run build
npm run deploy   # runs `wrangler deploy`
```

Notes:
- The Pages Function lives at `functions/proxy.js` and will be served from `/api/proxy` on your Pages domain.
- `npm run build` copies repository files into `dist/` (excluding `node_modules` and `.git`).
- `npm run pages:dev` starts a local Pages dev server on port 8787.

If you want, I can run `npm run build` and `npm run pages:dev` here to verify everything works.
