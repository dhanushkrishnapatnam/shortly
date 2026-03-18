# Shortly — Smarter Links 🔗

A production-ready, full-stack URL shortener with real-time analytics, custom aliases, QR code generation, and link expiry.

![Shortly Banner](https://via.placeholder.com/900x300/f97316/ffffff?text=Shortly+%E2%80%94+Smarter+Links)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 URL Shortening | Generate 6–8 char alphanumeric short codes instantly |
| ✏️ Custom Aliases | User-defined memorable aliases (e.g. `/my-launch`) |
| ⏰ Link Expiry | Set expiration dates — links auto-deactivate |
| 📊 Analytics Dashboard | Clicks, timestamps, locations, referrers |
| 🗺️ Geo Tracking | Country + city from IP (via geoip-lite) |
| 📱 QR Code Generation | Auto-generated QR code for every link |
| 📋 Copy to Clipboard | One-click copy with visual feedback |
| 🌓 Dark / Light Mode | System-aware with toggle, persisted to localStorage |
| 🛡️ Rate Limiting | Per-IP limits on creation and redirects |
| ✅ URL Validation | Protocol check, private IP block, domain blocklist |
| 🚦 Error Handling | Proper HTTP status codes + unified error format |
| 📝 Logging | Winston logger → console + rotating log files |
| ⚡ Redis Caching | Optional: cache redirects and stats (falls back gracefully) |

---

## 🏗️ Project Structure

```
shortly/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Layout, ShortenForm, ResultCard, UrlCard, ...
│   │   ├── pages/           # Home, Dashboard, Stats, NotFound
│   │   ├── context/         # ThemeContext (dark/light)
│   │   ├── utils/           # api.js (axios), helpers.js
│   │   └── index.css        # Tailwind + CSS variables
│   ├── public/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
├── server/                  # Node.js + Express backend
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── redis.js         # Redis cache (optional)
│   ├── middleware/
│   │   ├── rateLimiter.js   # express-rate-limit configs
│   │   └── errorHandler.js  # 404 + global error handler
│   ├── models/
│   │   └── Url.js           # Mongoose schema (clicks, geo, expiry)
│   ├── routes/
│   │   ├── url.js           # POST /api/shorten, GET /api/stats/:code, ...
│   │   └── redirect.js      # GET /:code → 301 redirect
│   ├── utils/
│   │   ├── codeGenerator.js # nanoid short code generator
│   │   ├── urlValidator.js  # URL + alias validation
│   │   └── logger.js        # Winston logger
│   ├── logs/                # Auto-created at runtime
│   ├── index.js             # App entry point
│   └── render.yaml          # Render deployment config
│
├── package.json             # Root scripts (concurrently)
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/shortly.git
cd shortly
```

### 2. Install all dependencies

```bash
npm run install:all
# or manually:
cd server && npm install
cd ../client && npm install
```

### 3. Configure server environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shortly
BASE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173

# Optional Redis
REDIS_URL=

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Configure client environment

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=Shortly
```

### 5. Start both servers

```bash
# From the root directory:
npm run dev

# Or separately:
npm run dev:server   # Express on :5000
npm run dev:client   # Vite on :5173
```

Open **http://localhost:5173** in your browser. 🎉

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

### `POST /api/shorten`
Create a new short URL.

**Request Body:**
```json
{
  "url": "https://example.com/very/long/path",
  "alias": "my-link",        // optional, 3–30 chars
  "expiresAt": "2025-12-31"  // optional, ISO date string
}
```

**Success Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "65abc...",
    "originalUrl": "https://example.com/very/long/path",
    "shortCode": "aBc3xZ",
    "shortUrl": "http://localhost:5000/aBc3xZ",
    "alias": "my-link",
    "expiresAt": "2025-12-31T00:00:00.000Z",
    "qrCode": "data:image/png;base64,...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Cause |
|---|---|
| 400 | Invalid URL, invalid alias format |
| 409 | Alias already taken |
| 429 | Rate limit exceeded |

---

### `GET /:code`
Redirect to the original URL.

**Behavior:**
- Returns `301` redirect on success
- Returns `404` if code not found
- Returns `410 Gone` if link has expired

---

### `GET /api/stats/:code`
Get analytics for a short URL.

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com/...",
    "shortCode": "aBc3xZ",
    "shortUrl": "http://localhost:5000/aBc3xZ",
    "totalClicks": 142,
    "isExpired": false,
    "expiresAt": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "qrCode": "data:image/png;base64,...",
    "clicksByDay": {
      "2024-01-15": 12,
      "2024-01-16": 30
    },
    "clicksByCountry": {
      "US": 80,
      "IN": 42,
      "GB": 20
    },
    "recentClicks": [
      {
        "timestamp": "2024-01-16T08:20:00.000Z",
        "country": "US",
        "city": "New York",
        "referrer": "https://twitter.com"
      }
    ]
  }
}
```

---

### `GET /api/urls`
List all active short URLs (paginated).

**Query Params:** `?page=1&limit=10`

**Success Response `200`:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

### `DELETE /api/urls/:code`
Deactivate a short URL (soft delete).

**Success Response `200`:**
```json
{ "success": true, "message": "URL deactivated" }
```

---

### `GET /api/health`
Health check endpoint.

```json
{ "success": true, "status": "ok", "timestamp": "2024-01-15T10:30:00.000Z" }
```

---

## 🌐 Deployment Guide

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your `shortly` repo
4. Set **Root Directory** to `client`
5. Set **Framework Preset** to `Vite`
6. Add environment variable:
   ```
   VITE_API_URL = https://your-render-app.onrender.com
   ```
7. Click **Deploy** ✅

---

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Add environment variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://...` (from Atlas) |
| `BASE_URL` | `https://your-app.onrender.com` |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `REDIS_URL` | *(optional)* |

6. Click **Create Web Service** ✅

---

### Database → MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → **Create Free Cluster**
2. Create a database user with username + password
3. Add your IP to the IP Allowlist (or `0.0.0.0/0` for all)
4. Click **Connect** → **Connect your application**
5. Copy the connection string and paste into `MONGODB_URI`

---

## 📤 GitHub Push Instructions

```bash
# 1. Initialize git (if not already)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "feat: initial Shortly project"

# 4. Create repo on GitHub (github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/shortly.git
git branch -M main
git push -u origin main
```

---

## 🔒 Rate Limits

| Endpoint | Limit |
|---|---|
| `POST /api/shorten` | 20 requests / hour / IP |
| All `/api/*` routes | 100 requests / 15 min / IP |
| `GET /:code` (redirects) | 60 requests / min / IP |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Cache | Redis (optional, graceful fallback) |
| Auth | None (public API) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |
| Logging | Winston |
| Rate Limiting | express-rate-limit |
| QR Codes | qrcode |
| Geo IP | geoip-lite |
| Short Codes | nanoid |

---

## 📄 License

MIT — free to use and modify.
