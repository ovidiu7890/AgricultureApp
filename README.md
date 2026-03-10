<p align="center">
  <h1 align="center">🌾 AgriConnect</h1>
  <p align="center">
    <strong>A full-stack agriculture community platform with AI-powered document Q&A</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS">
    <img src="https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white" alt="Flask">
    <img src="https://img.shields.io/badge/Firebase-12.6-FFCA28?logo=firebase&logoColor=black" alt="Firebase">
    <img src="https://img.shields.io/badge/OpenAI-GPT--4.1--mini-412991?logo=openai&logoColor=white" alt="OpenAI">
  </p>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
  - [Authentication](#-authentication)
  - [Community Forum](#-community-forum)
  - [Agricultural Calendar](#-agricultural-calendar)
  - [AI Chat (RAG)](#-ai-chat-rag)
- [Backend API Reference](#-backend-api-reference)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Building the RAG Index](#building-the-rag-index)
- [Utility Scripts](#-utility-scripts)
- [Documentation & Diagrams](#-documentation--diagrams)

---

## 🌍 Overview

**AgriConnect** is a web application designed to serve as a digital hub for farmers and agriculture professionals. It combines three core features:

1. **Community Forum** — A Reddit-style discussion board with categorized posts, comments, and a voting system.
2. **Agricultural Calendar** — A personal planting/task scheduler with `.ics` export for integration with Google Calendar, Apple Calendar, etc.
3. **AI-Powered Chat** — A Retrieval-Augmented Generation (RAG) chatbot that answers questions using knowledge extracted from agriculture PDFs (text, tables, and chart images).

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Login/  │ │  Forum   │ │ Calendar │ │    Chat Widget     │  │
│  │  Signup  │ │  Pages   │ │   Page   │ │  (AI Assistant)    │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬───────────┘  │
│       │             │            │                │              │
│  ┌────▼─────────────▼────────────▼────────────────▼───────────┐  │
│  │           Services Layer (Axios / Fetch)                   │  │
│  │  forumService · calendarService · chatService · apiConfig  │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐  │
│  │         Firebase Auth (Client SDK)                         │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTP (localhost:5000)
┌───────────────────────────▼──────────────────────────────────────┐
│                     BACKEND (Flask)                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │  forum_api  │  │ calendar_api │  │       chat_api          │  │
│  │  Blueprint  │  │  Blueprint   │  │  Blueprint (RAG)        │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────────────┘  │
│         │                │                   │                    │
│  ┌──────▼──────┐  ┌──────▼───────┐  ┌────────▼────────────────┐  │
│  │forum_manager│  │calendar_mgr  │  │  rag_chat + FAISS       │  │
│  │  (DB layer) │  │  (DB layer)  │  │  + OpenAI Embeddings    │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────────────┘  │
│         │                │                   │                    │
│  ┌──────▼────────────────▼───────────────────▼────────────────┐  │
│  │              Firebase Admin SDK (Firestore)                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19.2** | UI component library |
| **Vite 7.2** | Build tool & dev server |
| **TailwindCSS 3.4** | Utility-first CSS framework |
| **React Router 7.9** | Client-side routing with protected routes |
| **Firebase Web SDK 12.6** | Client-side authentication (Email/Password) |
| **Axios** | HTTP client for REST API communication |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Flask** | Python web framework |
| **Flask-CORS** | Cross-Origin Resource Sharing |
| **Firebase Admin SDK** | Server-side Firestore database access |
| **OpenAI API (GPT-4.1-mini)** | LLM for RAG chat answers |
| **OpenAI Embeddings (text-embedding-3-small)** | Vector embeddings for document retrieval |
| **FAISS (faiss-cpu)** | Vector similarity search index |
| **Docling** | PDF parsing with OCR, table extraction, and page image rendering |
| **ics** | ICS calendar file generation for export |
| **python-dotenv** | Environment variable management |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Firebase Authentication** | User registration & login |
| **Cloud Firestore** | NoSQL document database |
| **Firebase project: `agriculturedb`** | Shared Firebase project for auth & data |

---

## 📁 Project Structure

```
AgricultureApp/
├── Backend/
│   ├── app.py                    # Flask app factory (module import style)
│   ├── run.py                    # Main entry point — starts the Flask server
│   ├── .env                      # Environment variables (OPENAI_API_KEY)
│   ├── requirements.txt          # Python dependencies (162 packages)
│   ├── forum_api.py              # Forum REST API blueprint
│   ├── calendar_api.py           # Calendar REST API blueprint
│   ├── chat_api.py               # Chat/RAG REST API blueprint
│   ├── seed_db.py                # Database seeding script (sample users & posts)
│   ├── reset_votes.py            # Utility to clear all vote data
│   ├── DB/
│   │   ├── __init__.py
│   │   ├── firebase_config.py    # Firebase Admin SDK initialization
│   │   ├── forum_manager.py      # Forum data access layer (Firestore CRUD)
│   │   └── calendar_manager.py   # Calendar data access layer (Firestore CRUD)
│   └── chat/
│       ├── config.py             # RAG configuration (models, thresholds)
│       ├── build_mm_index.py     # Multimodal index builder (PDF → FAISS)
│       ├── rag_chat.py           # RAG retrieval & answer generation
│       ├── pdf_convert.py        # PDF conversion utilities
│       ├── convert_custom.py     # Custom document conversion
│       ├── export_figures.py     # Figure extraction from PDFs
│       ├── export_tables.py      # Table extraction from PDFs
│       └── multimodal_parquet.py # Multimodal data export to parquet
│
├── Frontend/
│   ├── index.html                # HTML entry point
│   ├── package.json              # Node.js dependencies & scripts
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # TailwindCSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── eslint.config.js          # ESLint configuration
│   └── src/
│       ├── main.jsx              # React app entry point
│       ├── App.jsx               # Root component with routing
│       ├── App.css               # Global styles
│       ├── index.css             # Base Tailwind imports
│       ├── firebase.js           # Firebase client SDK initialization
│       ├── context/
│       │   └── AuthContext.jsx   # Authentication context provider
│       ├── pages/
│       │   ├── LoginPage.jsx     # Login page with Firebase Auth
│       │   ├── SignupPage.jsx    # Registration page
│       │   ├── ForumPage.jsx     # Main forum feed with sidebar
│       │   ├── PostDetailPage.jsx# Single post view with comments
│       │   └── CalendarPage.jsx  # Agricultural calendar manager
│       ├── components/
│       │   ├── Navbar.jsx        # Top navigation bar with search
│       │   ├── Sidebar.jsx       # Category filter sidebar
│       │   ├── PostCard.jsx      # Forum post card component
│       │   ├── CommentSection.jsx# Comments list & input
│       │   ├── CreatePostModal.jsx# New post creation modal
│       │   ├── CalendarEntry.jsx # Single calendar entry display
│       │   ├── CalendarForm.jsx  # Calendar entry creation/edit form
│       │   ├── ChatWidget.jsx    # Floating chat widget button
│       │   ├── ChatModal.jsx     # Full AI chat modal interface
│       │   └── ProtectedRoute.jsx# Auth guard for private routes
│       └── services/
│           ├── apiConfig.js      # API base URL & endpoint definitions
│           ├── forumService.js   # Forum API client functions
│           ├── calendarService.js# Calendar API client functions
│           └── chatService.js    # Chat API client functions
│
├── documentation/                # UML diagrams & project documentation
│   ├── Agrilex.pdf
│   ├── Activity Diagram User Navigation and Authentication Flow.png
│   ├── Sequence Diagram User Authentication.png
│   └── State Machine Diagram Authentication States.png
│
├── diagram/
│   └── usecase.pdf               # Use case diagram
│
├── .gitignore
└── .gitattributes
```

---

## ✨ Features

### 🔐 Authentication

- **Email/Password** sign-up and sign-in via **Firebase Authentication**
- React Context API (`AuthContext`) manages auth state globally
- `onAuthStateChanged` listener for persistent sessions
- **User profile backfill**: On first login, a Firestore user profile is automatically created/synced
- **Protected routes**: All main pages require authentication; unauthenticated users are redirected to `/login`
- Routes: `/login`, `/signup`

### 💬 Community Forum

A categorized discussion forum with full CRUD operations:

- **Categories**: Crops, Livestock, Machinery, Organic, Market, Government, Events, General
- **Posts**: Create, read, delete posts with title, content, and category
- **Comments**: Threaded comments on each post with author attribution
- **Voting System**: Upvote/downvote with transactional consistency (Firestore transactions prevent race conditions)
  - Toggle behavior: voting again removes the vote
  - Per-user vote tracking via `votes` subcollection
- **Author Resolution**: Usernames are fetched from the `users` collection and displayed alongside posts/comments
- **Search**: Client-side search filtering through the navbar
- **Sorting**: Posts ordered by creation date (newest first), limited to 50

**Firestore Collections Used**: `posts`, `posts/{id}/comments`, `posts/{id}/votes`, `users`

### 📅 Agricultural Calendar

A personal planting and task scheduler:

- **CRUD operations**: Create, read, update, delete calendar entries
- **Entry fields**: Plant name, date (`YYYY-MM-DD`), optional notes
- **Per-user data**: Entries are scoped to the authenticated user's `userId`
- **ICS Export**: Export all entries as a standard `.ics` file for import into Google Calendar, Apple Calendar, Outlook, etc.
  - Generates all-day events titled `Agriculture: {plantName}`

**Firestore Collection Used**: `calendarEntries`

### 🤖 AI Chat (RAG)

A Retrieval-Augmented Generation chatbot that answers questions based on agriculture documents:

#### How It Works

```
User Question
     │
     ▼
┌──────────────────────┐
│  Query Expansion     │ ← Expands vague queries ("tell me more")
│  (GPT-4.1-mini)      │   using conversation history
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Embed Query         │ ← text-embedding-3-small
│  (OpenAI Embeddings) │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  FAISS Vector Search │ ← Cosine similarity, top-6 results
│  (faiss-cpu)         │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Build Evidence      │ ← Combines text chunks + page images
│  (multimodal)        │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Generate Answer     │ ← GPT-4.1-mini with system prompt
│  (with citations)    │   enforcing evidence-only answers
└──────────────────────┘
```

#### Key Capabilities

- **Multimodal retrieval**: Searches over both extracted text and page images
- **Table support**: Tables are extracted to CSV and embedded as markdown previews
- **Conversation memory**: Maintains chat history for context-aware follow-up questions
- **Query expansion**: Automatically rewrites vague follow-up queries into standalone questions
- **Citation system**: Answers include citations like `[page_12]` or `[table_3]`
- **Firebase persistence**: Conversations are saved to Firestore under `chat_conversations`
- **Lazy initialization**: RAG system loads on first request to avoid slow startup

#### Index Building Pipeline

The `chat/build_mm_index.py` script processes source PDFs:

1. **Docling conversion**: PDF → OCR text + table extraction + page images (at 144 DPI)
2. **Record creation**: Creates `page_N` (text + image) and `table_N` (markdown preview + CSV) records
3. **Embedding**: Generates vector embeddings via OpenAI `text-embedding-3-small` (batched, with retry)
4. **FAISS indexing**: Builds a `IndexFlatIP` index for cosine similarity search
5. **Output**: `scratch/mm_index/faiss.index`, `records.json`, `embeddings.npy`

---

## 📡 Backend API Reference

The backend runs on `http://localhost:5000` and exposes three Blueprint modules:

### Forum API (`/api/forum`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/forum/posts` | Get all posts (optional `?userId=` for vote status) |
| `GET` | `/api/forum/posts/:postId` | Get a single post |
| `POST` | `/api/forum/posts` | Create a new post (`authorId`, `title`, `content`, `category`) |
| `DELETE` | `/api/forum/posts/:postId` | Delete a post (cascades to comments & votes) |
| `POST` | `/api/forum/posts/:postId/vote` | Vote on a post (`user_uid`, `vote_type`: `up`/`down`) |
| `GET` | `/api/forum/posts/:postId/comments` | Get comments for a post |
| `POST` | `/api/forum/posts/:postId/comments` | Add a comment (`authorId`, `content`) |
| `DELETE` | `/api/forum/posts/:postId/comments/:commentId` | Delete a comment |
| `GET` | `/api/forum/users/:userId` | Get user profile |
| `POST` | `/api/forum/users` | Create user profile (`user_uid`, `username`, `email`) |

### Calendar API (`/api/calendar`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/calendar/?userId=` | Get all calendar entries for a user |
| `POST` | `/api/calendar/` | Create a new entry (`userId`, `plantName`, `date`, `notes?`) |
| `PUT` | `/api/calendar/:entryId` | Update an entry |
| `DELETE` | `/api/calendar/:entryId` | Delete an entry |
| `GET` | `/api/calendar/export?userId=` | Export calendar as `.ics` file |

### Chat API (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a question (`question`, `conversationId?`, `userId?`, `history?`) |
| `GET` | `/api/chat/conversations?userId=` | Get all conversations for a user |
| `GET` | `/api/chat/conversations/:convId` | Get messages for a conversation |
| `GET` | `/api/chat/health` | Health check (RAG status + Firebase status) |

### General

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Server status message |
| `GET` | `/health` | Health check (Firebase connectivity) |

---

## 🗄 Database Schema

All data is stored in **Cloud Firestore** under the `agriculturedb` project.

### `users` Collection

```json
{
  "username": "FarmerJohn",
  "email": "john@example.com",
  "bio": "3rd generation corn farmer.",
  "postsCount": 5,
  "createdAt": "<server_timestamp>"
}
```

### `posts` Collection

```json
{
  "authorId": "user_farmer_john",
  "title": "Best cover crops for nitrogen fixation?",
  "content": "I'm looking to improve my soil health...",
  "category": "Crops",
  "upvotes": 12,
  "downvotes": 2,
  "commentCount": 3,
  "createdAt": "<server_timestamp>"
}
```

**Subcollections**:
- `posts/{postId}/comments` — `{ authorId, content, createdAt }`
- `posts/{postId}/votes` — `{ votedAt }` (document ID = user UID)

### `calendarEntries` Collection

```json
{
  "userId": "abc123",
  "plantName": "Winter Wheat",
  "date": "2026-03-15",
  "notes": "Apply lime before planting",
  "createdAt": "<server_timestamp>"
}
```

### `chat_conversations` Collection

```json
{
  "userId": "abc123",
  "title": "Best cover crops for nitrogen...",
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

**Subcollection**: `chat_conversations/{convId}/messages` — `{ role, content, citations?, timestamp }`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** ≥ 3.10
- A **Firebase project** with Authentication (Email/Password) and Firestore enabled
- An **OpenAI API key** (for the chat feature)
- A **Firebase Service Account key** JSON file (for backend Firestore access)

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd Backend

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate    # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
#    Create or edit .env with your OpenAI API key:
#    OPENAI_API_KEY=sk-your-key-here

# 5. Update Firebase config
#    Edit DB/firebase_config.py and set SERVICE_ACCOUNT_KEY_PATH
#    to the path of your Firebase service account JSON file

# 6. (Optional) Seed the database with sample data
python seed_db.py

# 7. Start the Flask server
python run.py
```

The backend will be available at `http://localhost:5000`.

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Configure Firebase
#    Edit src/firebase.js with your Firebase project credentials
#    (apiKey, authDomain, projectId, etc.)

# 4. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default).

### Building the RAG Index

To enable the AI chat feature, you need to build the vector index from a PDF:

```bash
# 1. Place your agriculture PDF in Backend/chat/mnt/data/
#    as input_source.pdf (or update config.py)

# 2. Navigate to the chat directory
cd Backend/chat

# 3. Build the multimodal index
python build_mm_index.py

# This will create:
#   scratch/mm_index/faiss.index    — FAISS vector index
#   scratch/mm_index/records.json   — Record metadata
#   scratch/mm_index/embeddings.npy — Raw embeddings
#   scratch/mm_pages/               — Rendered page images
#   scratch/mm_tables/              — Extracted table CSVs
```

---

## 🔧 Utility Scripts

| Script | Description |
|--------|-------------|
| `Backend/seed_db.py` | Seeds Firestore with 4 sample users and 19 forum posts across 8 categories |
| `Backend/reset_votes.py` | Resets all vote counts to zero and deletes all vote subcollection documents |
| `Backend/chat/build_mm_index.py` | Builds the FAISS multimodal index from the source PDF |
| `Backend/chat/export_figures.py` | Extracts figures/images from PDFs |
| `Backend/chat/export_tables.py` | Extracts tables from PDFs to CSV |
| `Backend/chat/pdf_convert.py` | PDF conversion utilities |

---

## 📄 Documentation & Diagrams

The project includes UML documentation in the `documentation/` and `diagram/` directories:

| File | Description |
|------|-------------|
| `documentation/Agrilex.pdf` | Full project documentation |
| `documentation/Activity Diagram User Navigation and Authentication Flow.png` | Activity diagram showing user navigation and authentication flows |
| `documentation/Sequence Diagram User Authentication.png` | Sequence diagram for the authentication process |
| `documentation/State Machine Diagram Authentication States.png` | State machine diagram for authentication states |
| `diagram/usecase.pdf` | Use case diagram |

---

<p align="center">
  <sub>Built with ❤️ for the agriculture community</sub>
</p>
