# Shortly — Smarter Links 🔗

A full-stack URL shortener with real-time analytics, custom aliases, QR code generation, and link expiry.

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
cp .env
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
cp .env
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

### Database → MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → **Create Free Cluster**
2. Create a database user with username + password
3. Add your IP to the IP Allowlist (or `0.0.0.0/0` for all)
4. Click **Connect** → **Connect your application**
5. Copy the connection string and paste into `MONGODB_URI`

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
