# Playto Community Feed

A Reddit-style community platform with threaded discussions and a dynamic leaderboard. Built for the Playto Engineering Challenge.

## Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py populate_data  # Creates test users and sample posts
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173/`

## Test It Out

Login with any of these users:
- Username: `user1`, `user2`, `user3`, `user4`, or `user5`
- Password: `password123` (same for all)

The sample data includes posts, comments, and likes so you'll see an active feed right away.

## What's Inside

### Features

- **Threaded Comments** - Nest replies up to 5 levels deep (like Reddit)
- **Like System** - Like posts and comments, earn karma
- **24-Hour Leaderboard** - Top 5 contributors by recent karma
- **Real-time Updates** - Leaderboard refreshes every 30 seconds
- **Responsive UI** - Works on desktop and mobile

### Tech Stack

**Backend:**
- Django 5.x + Django REST Framework
- SQLite (easy to swap for PostgreSQL in production)
- Token authentication

**Frontend:**
- React 19 + Vite
- Tailwind CSS for styling
- Axios for API calls

## API Endpoints

### Posts

```
GET    /api/posts/              # List all posts
GET    /api/posts/{id}/         # Get post with full comment tree
POST   /api/posts/              # Create new post
POST   /api/posts/{id}/like/    # Toggle like on post
```

### Comments

```
POST   /api/comments/           # Create comment or reply
POST   /api/comments/{id}/like/ # Toggle like on comment
```

### Leaderboard

```
GET    /api/leaderboard/        # Top 5 users by 24h karma
```

## Project Structure

```
playto-challenge/
├── backend/
│   ├── community_feed/          # Django project settings
│   ├── feed/                    # Main app
│   │   ├── models.py           # User, Post, Comment, Like, KarmaTransaction
│   │   ├── views.py            # API views with optimizations
│   │   ├── serializers.py      # DRF serializers
│   │   └── management/
│   │       └── commands/
│   │           └── populate_data.py  # Sample data generator
│   └── db.sqlite3
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Feed.jsx        # Post feed
│       │   ├── CommentThread.jsx  # Recursive comments
│       │   └── Leaderboard.jsx    # Top contributors
│       ├── api.js              # API client
│       └── App.jsx             # Main app
└── README.md
```

## Key Technical Bits

### N+1 Query Prevention

The comment tree uses recursive prefetching to load all nested comments in ~3-5 queries instead of 50+. Check `views.py` for the implementation.

### Concurrency Handling

Likes use `select_for_update()` and `F()` expressions to prevent race conditions when multiple people like the same thing at once.

### Dynamic Leaderboard

Instead of caching karma counts, we log all karma events with timestamps. The leaderboard query filters the last 24 hours on-the-fly, so it's always accurate.

## Development

### Django Admin

Access at `http://127.0.0.1:8000/admin/`
- Username: `admin`
- Password: `admin123`

(Created by the `populate_data` command)

### Debug Toolbar

The Django Debug Toolbar is enabled in development. Visit any API endpoint in your browser to see query counts and performance metrics.

### Adding More Test Data

```bash
python manage.py populate_data
```

This creates 5 users, several posts, nested comments, and distributes likes across different time periods to test the leaderboard.

## Deployment

### Backend (Railway/Heroku)

1. Set environment variables:
   ```
   DJANGO_SECRET_KEY=your-secret-key
   ALLOWED_HOSTS=your-domain.com
   CORS_ALLOWED_ORIGINS=https://your-frontend.com
   ```

2. Update `settings.py` to use PostgreSQL in production

3. Run migrations:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

### Frontend (Vercel/Netlify)

1. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.com
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy the `dist/` folder

## Technical Documentation

For a deeper dive into the technical decisions and implementation details, check out [EXPLAINER.md](EXPLAINER.md).

## Notes

- The frontend uses a simple mock login for demo purposes. In production, you'd want proper authentication with the DRF token system.
- SQLite is fine for development, but you'll want PostgreSQL for production.
- The leaderboard query could be cached with a 1-minute TTL in a high-traffic scenario.

Built with ❤️ for the Playto Engineering Challenge
