# 🎬 NovaMovies — Premium Streaming Platform

A full-featured, high-end movie streaming platform built with **Next.js 14**, **MongoDB**, **Socket.io**, and **Tailwind CSS**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 Premium Dark UI | Pure #000000 OLED black, GSAP + Framer Motion animations |
| 🖱️ Custom Cursor | macOS-style custom cursor globally |
| 📱 PWA | Installable on iOS & Android |
| 🌐 Multilingual | Arabic (RTL) + English (LTR) instant switching |
| 🎬 Video Player | PLYR with 4K/1080p/720p quality, Theater Mode, PiP |
| 🎉 Watch Party | Real-time synced playback via Socket.io |
| 💾 No-Auth Watchlist | localStorage-based "My Watchlist" + Continue Watching |
| ⭐ Ratings | Guest star rating system (IP-based) |
| 💬 Live Comments | Anonymous comments with real-time broadcast |
| 🤖 Auto-Fetch | Enter IMDB ID/Title → auto-fills poster, cast, genre via OMDB + TMDB + Fanart.tv |
| 📊 Admin Dashboard | Real-time analytics, views, top movies |
| 🔨 Ban System | One-click IP ban with Discord notification |
| 📢 Announcements | Global real-time pop-up notifications |
| 🤖 Discord Webhooks | Alerts on new movies, errors, bans |
| 🗺️ Auto Sitemap | Dynamic XML sitemap at /api/sitemap |
| 🛡️ Rate Limiting | API abuse prevention |
| 🔍 SEO | Dynamic OG meta tags per movie |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd novamoviess
npm install
# or
pnpm install
```

### 2. Set Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# MongoDB (required)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/novamoviess

# NextAuth (required)
NEXTAUTH_SECRET=your-super-secret-32-char-key
NEXTAUTH_URL=http://localhost:3000

# OMDB API — Free tier at https://www.omdbapi.com/apikey.aspx
OMDB_API_KEY=your_omdb_key

# TMDB API — Free at https://www.themoviedb.org/settings/api
TMDB_API_KEY=your_tmdb_key

# Fanart.tv API — Free at https://fanart.tv/get-an-api-key/
FANART_API_KEY=your_fanart_key

# Discord Webhook (optional but recommended)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# Admin credentials
ADMIN_EMAIL=youseffahmed74@proton.me
ADMIN_PASSWORD=Admin@2024!

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=NovaMovies
```

### 3. Run Development

```bash
npm run dev
```

This starts both **Next.js** (port 3000) and the **Socket.io server** (port 3001) concurrently.

Visit: `http://localhost:3000`

---

## 🔐 Admin Access

| Field | Value |
|---|---|
| **URL** | `http://localhost:3000/admin` |
| **Email** | `youseffahmed74@proton.me` |
| **Password** | `Admin@2024!` |

> ⚠️ **Change the admin password** in your `.env.local` before deploying to production!

---

## 📁 Project Structure

```
novamoviess/
├── app/
│   ├── (main)/               # Public-facing pages
│   │   ├── page.tsx          # Home page
│   │   ├── movies/[id]/      # Movie detail page
│   │   ├── watch/[id]/       # Video player page
│   │   ├── watchlist/        # My Watchlist
│   │   └── search/           # Browse & Search
│   ├── admin/                # Admin dashboard
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── login/            # Admin login
│   │   ├── movies/           # CRUD movies
│   │   ├── users/            # IP ban system
│   │   ├── analytics/        # View statistics
│   │   └── notifications/    # Broadcast alerts
│   └── api/                  # API routes
│       ├── movies/           # CRUD movies API
│       ├── fetch-movie/      # Auto-fetch from OMDB/TMDB/Fanart
│       ├── comments/         # Live comments
│       ├── ratings/          # Star ratings
│       ├── analytics/        # View tracking
│       ├── ban/              # IP ban management
│       ├── notifications/    # Global announcements
│       └── sitemap/          # Dynamic XML sitemap
├── components/               # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MovieCard.tsx
│   ├── VideoPlayer.tsx       # PLYR-based player
│   ├── WatchParty.tsx        # Socket.io watch party
│   ├── Comments.tsx          # Live comments
│   ├── StarRating.tsx
│   ├── CustomCursor.tsx
│   └── AnnouncementBanner.tsx
├── lib/
│   ├── mongodb.ts            # DB connection
│   ├── omdb.ts               # OMDB API client
│   ├── discord.ts            # Discord webhook helpers
│   ├── rateLimit.ts          # Rate limiting
│   └── i18n.ts               # Translations (AR/EN)
├── models/                   # Mongoose schemas
│   ├── Movie.ts
│   ├── Comment.ts
│   ├── Rating.ts
│   ├── BannedIP.ts
│   ├── Analytics.ts
│   └── User.ts
├── server/
│   └── socket.js             # Socket.io server
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── offline.html
├── middleware.ts              # IP ban enforcement
└── .env.example
```

---

## 🌐 Deployment

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

Set all environment variables in Vercel Dashboard → Settings → Environment Variables.

> **Note:** Socket.io requires a separate server (not Vercel serverless). Deploy the socket server to **Railway**, **Render**, or **DigitalOcean** and update `NEXT_PUBLIC_SOCKET_URL`.

### Deploy Socket.io Server (Railway / Render)

1. Create a new service pointing to your repo
2. Set start command: `node server/socket.js`
3. Set environment variable: `PORT=3001`
4. Copy the deployed URL to `NEXT_PUBLIC_SOCKET_URL` in Vercel

### Full Stack on DigitalOcean (Droplet)

```bash
# Install dependencies
npm install
# Build Next.js
npm run build
# Start with PM2
npm install -g pm2
pm2 start npm --name "novamoviess" -- start
pm2 start server/socket.js --name "novamoviess-socket"
pm2 save
pm2 startup
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies` | List movies (paginated, filterable) |
| POST | `/api/movies` | Create movie (admin) |
| GET | `/api/movies/:id` | Get movie + increment views |
| PUT | `/api/movies/:id` | Update movie (admin) |
| DELETE | `/api/movies/:id` | Delete movie (admin) |
| POST | `/api/fetch-movie` | Auto-fetch metadata from OMDB/TMDB/Fanart |
| GET | `/api/comments?movieId=` | Get comments for movie |
| POST | `/api/comments` | Post a comment |
| GET | `/api/ratings?movieId=` | Get average rating |
| POST | `/api/ratings` | Submit a star rating |
| GET | `/api/analytics` | Dashboard stats |
| POST | `/api/analytics` | Track a view |
| GET | `/api/ban` | List banned IPs |
| POST | `/api/ban` | Ban an IP |
| DELETE | `/api/ban?ip=` | Unban an IP |
| GET | `/api/notifications` | Poll for announcements |
| POST | `/api/notifications` | Create announcement |
| GET | `/api/sitemap` | Dynamic XML sitemap |

---

## 🎮 Watch Party Setup

1. User A visits a movie's watch page and clicks **"Watch Party"**
2. They click **"Create Party Room"** — a Room ID is generated (e.g. `A3F9X2B1`)
3. User A shares the Room ID or the auto-generated link
4. User B enters the Room ID and clicks **"Join"**
5. All playback controls (play, pause, seek) are synced in real-time via Socket.io
6. Party members can also chat in the built-in party chat

---

## 🛡️ Security

- IP-based rate limiting on all API endpoints
- Admin routes protected by cookie token + middleware
- Banned IPs blocked at middleware level (before any request processing)
- All API inputs validated with Mongoose schemas
- Discord alerts on any ban action

---

## 📱 PWA Installation

### iOS:
1. Open Safari → visit the site
2. Tap Share → "Add to Home Screen"

### Android:
1. Open Chrome → visit the site
2. Tap Menu → "Add to Home Screen" or wait for the install prompt

---

## 🔑 Discord Webhook Setup

1. Go to your Discord server → Server Settings → Integrations → Webhooks
2. Create a new webhook, name it "NovaMovies"
3. Copy the webhook URL
4. Add to `.env.local`: `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`

You'll receive alerts for:
- 🎬 New movies added
- 🔨 IP bans
- 🚨 System errors

---

## 📄 License

MIT — Built with ❤️ for NovaMovies
