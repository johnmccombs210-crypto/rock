# API Usage & Examples

## Quick Reference

Your proxy provides a simple REST API at `/proxy/*`

### Basic Usage
```
GET https://your-proxy-url/proxy/google.com
POST https://your-proxy-url/proxy/api.example.com/endpoint
PUT https://your-proxy-url/proxy/api.service.com/update
DELETE https://your-proxy-url/proxy/api.service.com/delete
```

---

## cURL Examples

### Simple GET Request
```bash
curl https://your-proxy-url/proxy/google.com
```

### GET with Custom Headers
```bash
curl -H "User-Agent: Custom-Bot/1.0" \
  https://your-proxy-url/proxy/api.example.com
```

### POST Request with JSON
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}' \
  https://your-proxy-url/proxy/api.example.com/endpoint
```

### POST with Form Data
```bash
curl -X POST \
  -d "username=user&password=pass" \
  https://your-proxy-url/proxy/example.com/login
```

### With Cookies
```bash
curl -b "cookie_name=value" \
  https://your-proxy-url/proxy/example.com
```

### Save Response to File
```bash
curl https://your-proxy-url/proxy/example.com/image.jpg \
  -o downloaded_image.jpg
```

### Follow Redirects
```bash
curl -L https://your-proxy-url/proxy/bit.ly/abc123
```

### With Headers File
```bash
curl -H @headers.txt \
  https://your-proxy-url/proxy/api.example.com
```

---

## JavaScript/Fetch Examples

### Simple Fetch
```javascript
fetch('https://your-proxy-url/proxy/google.com')
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### With Custom Headers
```javascript
fetch('https://your-proxy-url/proxy/api.example.com', {
  method: 'GET',
  headers: {
    'User-Agent': 'MyApp/1.0',
    'Accept': 'application/json'
  }
})
  .then(r => r.json())
  .then(data => console.log(data));
```

### POST with JSON
```javascript
fetch('https://your-proxy-url/proxy/api.example.com/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com'
  })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

### Upload Form Data
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'MyFile');

fetch('https://your-proxy-url/proxy/upload.example.com/upload', {
  method: 'POST',
  body: formData
})
  .then(r => r.json())
  .then(data => console.log(data));
```

### With Error Handling
```javascript
async function proxyFetch(url) {
  try {
    const response = await fetch(`https://your-proxy-url/proxy/${url}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Proxy error:', error);
    return null;
  }
}

// Usage
const html = await proxyFetch('google.com');
console.log(html);
```

---

## Python Examples

### Simple GET
```python
import requests

url = 'https://your-proxy-url/proxy/google.com'
response = requests.get(url)
print(response.text)
```

### With Headers
```python
import requests

headers = {
    'User-Agent': 'MyBot/1.0',
    'Accept': 'application/json'
}

response = requests.get('https://your-proxy-url/proxy/api.example.com', 
                        headers=headers)
print(response.json())
```

### POST Request
```python
import requests
import json

data = {
    'username': 'user',
    'password': 'pass'
}

response = requests.post(
    'https://your-proxy-url/proxy/example.com/login',
    json=data
)
print(response.status_code)
print(response.json())
```

### File Upload
```python
import requests

with open('file.txt', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'https://your-proxy-url/proxy/upload.example.com/upload',
        files=files
    )
print(response.json())
```

### With Session (Persistent Cookies)
```python
import requests

session = requests.Session()

# Login
session.post('https://your-proxy-url/proxy/example.com/login', 
             json={'user': 'admin', 'pass': 'secret'})

# Make authenticated request
response = session.get('https://your-proxy-url/proxy/example.com/dashboard')
print(response.text)
```

---

## Node.js Examples

### Using node-fetch
```javascript
const fetch = require('node-fetch');

fetch('https://your-proxy-url/proxy/google.com')
  .then(r => r.text())
  .then(html => console.log(html));
```

### Using Axios
```javascript
const axios = require('axios');

axios.get('https://your-proxy-url/proxy/api.example.com')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### POST with axios
```javascript
const axios = require('axios');

axios.post('https://your-proxy-url/proxy/api.example.com/endpoint', {
  username: 'user',
  email: 'user@example.com'
})
  .then(response => console.log(response.data));
```

---

## Browser Console Examples

### Simple Proxy in Console
```javascript
// Access any site through proxy in your browser console
fetch('/proxy/google.com')
  .then(r => r.text())
  .then(html => {
    document.open();
    document.write(html);
    document.close();
  });
```

### Bookmark Script (Bookmarklet)
```javascript
javascript:(function(){
  const url = prompt('Enter URL to proxy:');
  if(url) {
    window.location = '/proxy/' + url;
  }
})();
```

Save as bookmark and click it to proxy any site!

---

## Advanced Scenarios

### Proxying API with Authentication
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN123" \
  -H "Content-Type: application/json" \
  -d '{"data":"value"}' \
  https://your-proxy-url/proxy/api.secure.com/endpoint
```

### Proxying Streaming
```bash
# Stream video/audio through proxy
curl https://your-proxy-url/proxy/video-cdn.example.com/movie.mp4 \
  --output movie.mp4 \
  --progress-bar
```

### Rate Limiting (Implement in your code)
```python
import time
import requests

def proxied_fetch(url, rate_limit=1):
    """Fetch with rate limiting"""
    time.sleep(rate_limit)
    return requests.get(f'https://your-proxy-url/proxy/{url}')

# Scrape multiple pages
for page in range(1, 11):
    response = proxied_fetch(f'example.com/page/{page}', rate_limit=2)
    print(f"Page {page}: {response.status_code}")
```

### Proxy Chain (Proxy through proxy)
```javascript
// First proxy
const proxy1 = 'https://proxy1.workers.dev/proxy/';

// Second proxy (through first proxy!)
const proxy2 = proxy1 + 'proxy2.workers.dev/proxy/';

// Final target through both proxies
const target = proxy2 + 'google.com';

fetch(target).then(r => r.text());
```

---

## Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 400 | Bad Request | Check your URL |
| 403 | Forbidden | Site blocked you |
| 404 | Not Found | Check URL spelling |
| 429 | Rate Limited | Wait before retrying |
| 500 | Server Error | Try again later |
| 502 | Bad Gateway | Proxy error |

---

## Tips & Tricks

### URL Encoding
If your URL has special characters, encode it:
```bash
# Space becomes %20
curl "https://your-proxy-url/proxy/example.com/search?q=hello%20world"
```

### HTTPS URLs
The proxy automatically adds HTTPS:
```bash
# Both work the same:
curl https://your-proxy-url/proxy/google.com
curl https://your-proxy-url/proxy/https://google.com
```

### Query Parameters
Works with query strings:
```bash
curl "https://your-proxy-url/proxy/google.com/search?q=test&num=10"
```

### GET with Body (Some APIs need this)
```bash
curl -X GET \
  --data '{"key":"value"}' \
  https://your-proxy-url/proxy/api.example.com
```

---

## Monitoring Requests

### Check Proxy Health
```bash
curl https://your-proxy-url/health
# Returns: {"status":"ok"}
```

### Monitor in Real-Time
Use Cloudflare Dashboard:
1. Go to Cloudflare.com
2. Select your account
3. Workers → Your worker → Logs
4. See real-time request logs

---

## Troubleshooting API

### Check Headers in Response
```bash
curl -i https://your-proxy-url/proxy/google.com
# Shows headers with -i flag
```

### Verbose Output
```bash
curl -v https://your-proxy-url/proxy/google.com
# Shows detailed request/response info
```

### Test Connectivity
```bash
curl --connect-timeout 5 https://your-proxy-url/health
```

---

For more examples, check README.md or ADVANCED.md!
