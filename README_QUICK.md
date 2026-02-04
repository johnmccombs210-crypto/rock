Quick deploy — beginner-friendly

1) Create two GitHub repository secrets:
   - `CF_API_TOKEN` — a Cloudflare API token with Pages permissions
   - `PAGES_PROJECT` — your Cloudflare Pages project name (e.g. my-stealth-proxy)

2) Push this repository to GitHub (branch `main`). The workflow will run and publish `dist/` to your Pages project.

3) Or publish locally with this one-liner (replace `<project-name>`):

```bash
npm install
npm run build
npx wrangler pages publish dist --project-name=<project-name>
```

Local testing tip (avoid file:// console errors):

```bash
# Serve the built `dist/` over HTTP and open http://localhost:8080
npx http-server dist -p 8080
# or with Python:
python3 -m http.server 8080 --directory dist
```

4) After publishing visit `https://<project-name>.pages.dev`.

Notes
- Use `npm run build` to regenerate `dist/` if you edit files locally.
- For local function dev, run `npm run dev` (requires Wrangler login).
