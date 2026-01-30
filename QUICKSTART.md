# Quick Start Guide

## Running the Application Locally

### 1. Start the Backend

```bash
cd backend
python manage.py runserver
```

Backend will be available at: http://127.0.0.1:8000/

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:5173/

### 3. Login

Click "Login" and use one of the test users:
- Username: `user1`, `user2`, `user3`, `user4`, or `user5`
- Password: `password123`

### 4. Test the Features

- **Create a post**: Use the form at the top of the feed
- **Like posts**: Click the heart icon
- **View comments**: Click the comment count to expand
- **Add comments**: Type in the comment box and click "Comment"
- **Reply to comments**: Click "Reply" on any comment
- **Watch the leaderboard**: Auto-updates every 30 seconds

## Admin Access

Visit http://127.0.0.1:8000/admin/ to access the Django admin interface.

## API Endpoints

- Posts: http://127.0.0.1:8000/api/posts/
- Leaderboard: http://127.0.0.1:8000/api/leaderboard/
- Debug Toolbar: http://127.0.0.1:8000/__debug__/

## Key Files

- **Backend Models**: `backend/feed/models.py`
- **Backend Views**: `backend/feed/views.py`
- **Frontend Feed**: `frontend/src/components/Feed.jsx`
- **Frontend Leaderboard**: `frontend/src/components/Leaderboard.jsx`

## Documentation

- [README.md](file:///d:/playto%20challenge/README.md) - Full setup instructions
- [EXPLAINER.md](file:///d:/playto%20challenge/EXPLAINER.md) - Technical deep-dive
