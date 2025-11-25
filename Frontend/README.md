# AgriConnect - Frontend

A modern React-based frontend for the AgriConnect agricultural community platform.

## Features

- **Forum**: Browse and create posts about farming topics (crops, livestock, machinery)
- **Calendar**: Track planting schedules and important agricultural dates
- **Comments & Voting**: Engage with the community through comments and votes
- **Responsive Design**: Beautiful UI built with TailwindCSS

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── PostCard.jsx
│   ├── CommentSection.jsx
│   ├── CreatePostModal.jsx
│   ├── CalendarEntry.jsx
│   └── CalendarForm.jsx
├── pages/              # Main application views
│   ├── ForumPage.jsx
│   ├── PostDetailPage.jsx
│   └── CalendarPage.jsx
├── services/           # API integration layer
│   ├── apiConfig.js
│   ├── forumService.js
│   └── calendarService.js
├── context/            # React context for state management
│   └── AuthContext.jsx
├── App.jsx             # Main app component with routing
└── main.jsx           # Application entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install backend dependencies (see BACKEND_SETUP.md):
```bash
cd ../Backend
pip install flask-cors
```

## Running the Application

1. **Start the Backend** (in Backend directory):
```bash
cd ../Backend
python app.py
```
The backend will run on `http://localhost:5000`

2. **Start the Frontend** (in Frontend directory):
```bash
npm run dev
```
The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Environment Configuration

The API base URL is configured in `src/services/apiConfig.js`. 

Default: `http://localhost:5000`

If your backend runs on a different port, update the `API_BASE_URL` constant.

## Features by Page

### Forum Page (`/`)
- View all community posts
- Filter by category (All, Crops, Livestock, Machinery)
- Search posts by title or content
- Create new posts
- Upvote posts
- Click on posts to view details

### Post Detail Page (`/post/:id`)
- View full post content
- See all comments
- Add new comments
- Vote on posts
- Delete posts (if you're the author)
- Delete comments (if you're the author)

### Calendar Page (`/calendar`)
- View all planting entries
- Entries grouped by month
- Add new calendar entries
- Edit existing entries
- Delete entries

## Technologies Used

- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Mock Authentication

The application currently uses a mock authentication system with a hardcoded user. This is for development purposes only.

**Mock User:**
- UID: `user123`
- Username: `FarmerJohn`
- Email: `john@farm.com`

Replace `src/context/AuthContext.jsx` with real Firebase authentication in production.

## API Integration

All API calls are made through service files in `src/services/`:

- `forumService.js` - Forum and posts API
- `calendarService.js` - Calendar entries API

These services use Axios and handle:
- Error handling
- Request/response formatting
- Authentication headers (when implemented)

## Development Notes

- The app uses TailwindCSS for styling with a green theme representing agriculture
- All components are functional components using React Hooks
- State management uses React Context API for authentication
- Local component state for forms and UI interactions
- The UI is fully responsive with mobile, tablet, and desktop layouts

## Future Enhancements

- Real Firebase authentication
- Real-time updates with WebSockets
- Image uploads for posts
- User profiles
- Direct messaging
- Weather integration
- Market prices integration
