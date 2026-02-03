# 📂 Project File Structure & Documentation

## Quick Navigation

```
rock/
├── src/
│   └── index.js               (683 lines) ← MAIN PROXY CODE
├── wrangler.toml              ← Cloudflare config
├── package.json               ← Dependencies
│
├── 📚 DOCUMENTATION
├── README.md                  ← Start here! Full features & guide
├── DEPLOY.md                  ← Step-by-step deployment
├── QUICKREF.md                ← Quick reference card
├── SUMMARY.md                 ← Project overview
├── ADVANCED.md                ← Advanced customization
├── API.md                     ← API usage & examples
├── FILES.md                   ← This file
│
├── 🚀 SCRIPTS
├── setup.sh                   ← Automated setup
│
├── 🔧 CONFIG
├── .gitignore
├── .npmrc
├── .git/                      ← Git repository
└── package-lock.json          (auto-generated)
```

---

## File Descriptions

### Core Files

#### `src/index.js` (683 lines)
**The heart of your proxy!**

What it does:
- Built-in Router class (no dependencies!)
- HTTP/HTTPS proxying
- Header manipulation & spoofing
- Content rewriting (HTML/CSS/JS)
- Web interface serving
- Error handling

Edit this to:
- Change stealth headers
- Add authentication
- Implement rate limiting
- Custom error pages
- Add logging

#### `wrangler.toml`
**Cloudflare Worker configuration**

Key settings:
- Worker name & type
- Compatibility date
- Environment variables
- Routes (for custom domains)

To use custom domain:
1. Uncomment `routes` section
2. Change `yourdomain.com` to your domain
3. Deploy: `npm run deploy`

#### `package.json`
**Project metadata & dependencies**

Contains:
- Project info
- npm scripts
- Dependencies (just Wrangler!)
- Keywords for npm

---

### Documentation Files

#### `README.md` ⭐ START HERE
**Complete user guide**

Includes:
- Feature overview
- Prerequisites
- 2-minute deployment guide
- Usage examples
- Troubleshooting
- FAQ
- Free plan limits
- Advanced customization hints

**Best for:** First-time users, getting started

#### `DEPLOY.md`
**Step-by-step deployment guide**

Includes:
- Copy-paste quick deploy
- Detailed steps with screenshots
- Troubleshooting each error
- Custom domain setup
- Common problems & solutions

**Best for:** Deploying for the first time, fixing deployment issues

#### `QUICKREF.md`
**One-page quick reference**

Includes:
- 30-second deployment
- All common URLs
- Use case examples
- Configuration tips
- Keyboard shortcuts
- Emergency commands
- Useful links

**Best for:** Quick lookups, refresher reference

#### `SUMMARY.md`
**Project overview & comparison**

Includes:
- Feature checklist
- File structure
- Specifications table
- Why this proxy is better
- Next steps

**Best for:** Understanding what you got, comparing with alternatives

#### `ADVANCED.md`
**Advanced customization guide**

Includes:
- Environment variables
- Custom proxy rules
- Rate limiting
- Cloudflare KV usage
- SSL/TLS config
- CORS configuration
- Caching strategy
- Analytics tracking
- Error handling
- Performance optimization

**Best for:** Customizing behavior, advanced features

#### `API.md`
**Complete API reference with examples**

Includes:
- API endpoints
- cURL examples
- JavaScript/Fetch examples
- Python examples
- Node.js examples
- Browser console examples
- Advanced scenarios
- Response codes
- Tips & tricks

**Best for:** Using the proxy in applications, API integration

#### `FILES.md` (this file)
**Navigation & file descriptions**

**Best for:** Finding what you need

### Setup & Configuration Files

#### `setup.sh`
**Automated setup script**

What it does:
- Checks for Node.js
- Installs dependencies
- Logs into Cloudflare
- Deploys to production

Usage:
```bash
bash setup.sh
```

#### `.gitignore`
**Git ignore patterns**

Ignores:
- node_modules/
- .env files
- Build outputs
- IDE files
- OS files
- Logs

#### `.npmrc`
**npm configuration**

Settings:
- Package metadata

#### `.git/`
**Git repository**

Contains:
- Version history
- Branches
- Remote configuration

Auto-generated files:
- `package-lock.json` (dependency lock)

---

## How to Use This Documentation

### I want to... | Read this file
---|---
**Get started quickly** | [README.md](README.md)
**Deploy in 2 minutes** | [DEPLOY.md](DEPLOY.md)
**Quick reference** | [QUICKREF.md](QUICKREF.md)
**Understand the project** | [SUMMARY.md](SUMMARY.md)
**Customize behavior** | [ADVANCED.md](ADVANCED.md)
**Use the API** | [API.md](API.md)
**Edit the code** | `src/index.js` (well-commented!)
**Set up automatically** | `bash setup.sh`

---

## File Editing Guide

### Most Important to Edit
1. **`src/index.js`** - Main proxy logic
   - Change stealth headers
   - Add authentication
   - Custom rules
   - Add endpoints

2. **`wrangler.toml`** - Worker config
   - Set custom domain
   - Environment variables
   - Metadata

### Don't Edit Usually
- `package.json` - Unless adding dependencies
- `.gitignore` - Unless tracking more files
- Documentation files - Unless improving docs

### Never Edit
- `.git/` - Managed by Git
- `package-lock.json` - Auto-generated

---

## Code Organization in `src/index.js`

```javascript
// Lines 1-55: Router class (custom implementation)
class Router { ... }

// Lines 57-58: Initialize router
const router = new Router();

// Lines 60-75: Stealth headers configuration
const stealthHeaders = { ... }

// Lines 77-90: CORS headers
const corsHeaders = { ... }

// Lines 92-98: GET / - Web interface
router.get('/', () => { ... });

// Lines 100-104: GET /health - Health check
router.get('/health', () => { ... });

// Lines 106-109: OPTIONS - CORS preflight
router.options('/*', () => { ... });

// Lines 111-450: ALL /proxy/* - Main proxy handler
router.all('/proxy/*', async (request) => { ... });

// Lines 452-475: HTML rewriting
function rewriteHTML(html, baseOrigin) { ... }

// Lines 477-486: CSS rewriting
function rewriteCSS(css, baseOrigin, targetUrl) { ... }

// Lines 488-492: JavaScript rewriting
function rewriteJS(js) { ... }

// Lines 494-497: 404 handler
router.all('*', () => { ... });

// Lines 499-501: Main event handler
export default { fetch: (request) => ... };

// Lines 503-683: Web interface HTML (full page!)
function getWebInterface() { ... }
```

---

## Configuration Checklist

Before deploying:
- ✅ Created Cloudflare account
- ✅ Installed Node.js
- ✅ Cloned repository
- ✅ Ran `npm install`
- ✅ Ran `npx wrangler login`
- ✅ Ran `npm run deploy`

After deploying:
- ✅ Visit your proxy URL
- ✅ Test with google.com
- ✅ Try YouTube or other sites
- ✅ Share with friends!

---

## Size Reference

| File | Size | Purpose |
|------|------|---------|
| `src/index.js` | 19KB | All proxy code |
| `README.md` | 6.2KB | Documentation |
| `ADVANCED.md` | 5.1KB | Advanced guide |
| `DEPLOY.md` | 5.1KB | Deployment guide |
| `API.md` | 8.3KB | API reference |
| `SUMMARY.md` | 6.4KB | Overview |
| `QUICKREF.md` | 4.8KB | Quick reference |
| **Total** | **~55KB** | Everything! |

Incredibly lightweight! 🚀

---

## Dependencies

Your project requires:
- **Cloudflare Workers** (free, runs on their infrastructure)
- **Wrangler CLI** (free, deployment tool)
- **Node.js** (free, for development)

**That's it! No hidden dependencies.**

Zero external npm packages in production!

---

## Version History

This is version 1.0.0:
- ✅ Full proxy functionality
- ✅ Web interface
- ✅ Stealth headers
- ✅ Content rewriting
- ✅ GeForce Now optimized
- ✅ Production-ready
- ✅ Zero external dependencies

---

## Contributing

Want to improve this project?

1. Edit the documentation (if improving docs)
2. Test changes locally: `npm run dev`
3. Deploy test version: `npm run deploy`
4. Share improvements!

---

## File Checklist

After setup, you should have:
- ✅ `src/index.js` - Main code
- ✅ `wrangler.toml` - Config
- ✅ `package.json` - Dependencies
- ✅ `setup.sh` - Setup script
- ✅ `README.md` - Full docs
- ✅ `DEPLOY.md` - Deployment
- ✅ `QUICKREF.md` - Quick reference
- ✅ `SUMMARY.md` - Overview
- ✅ `ADVANCED.md` - Advanced guide
- ✅ `API.md` - API reference
- ✅ `FILES.md` - This file
- ✅ `.gitignore` - Git config

All 12 files present? Perfect! 🎉

---

For quick help, see [QUICKREF.md](QUICKREF.md)
For full guide, start with [README.md](README.md)
