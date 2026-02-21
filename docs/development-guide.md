# Development Guide - Idea Canvas

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| PostgreSQL | 14+ | Database server |
| Git | 2.x | Version control |

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/KT-afk/idea-canvas.git
cd idea-canvas
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=idea_canvas
# DB_USER=your_username
# DB_PASSWORD=your_password
# PORT=3000

# Create database (if not exists)
createdb idea_canvas

# Run migrations (optional - sequelize.sync handles this)
npm run db:migrate

# Start development server
npm run dev
```

Backend will be running at `http://localhost:3000`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file (optional for local dev)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:5173`

### 4. Open Application

Navigate to `http://localhost:5173` in your browser.

## Environment Variables

### Backend (`backend/.env`)

```env
# Database Configuration (Development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=idea_canvas
DB_USER=your_username
DB_PASSWORD=your_password

# OR Production (Railway provides this)
DATABASE_URL=postgres://user:pass@host:port/db

# Server Configuration
PORT=3000

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# API Base URL (empty for same-origin)
VITE_API_URL=http://localhost:3000

# Production
VITE_API_URL=https://your-backend.railway.app
```

## Available Scripts

### Backend Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with hot-reload (ts-node-dev) |
| `build` | `npm run build` | Compile TypeScript to JavaScript |
| `start` | `npm run start` | Run compiled JavaScript |
| `db:migrate` | `npm run db:migrate` | Run database migrations |
| `db:migrate:undo` | `npm run db:migrate:undo` | Rollback last migration |

### Frontend Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite dev server |
| `build` | `npm run build` | TypeScript check + production build |
| `preview` | `npm run preview` | Preview production build locally |
| `lint` | `npm run lint` | Run ESLint |

## Development Workflow

### Making Changes

1. **Frontend Changes:**
   - Edit files in `frontend/src/`
   - Vite provides instant hot module replacement (HMR)
   - Changes appear immediately in browser

2. **Backend Changes:**
   - Edit files in `backend/src/`
   - ts-node-dev automatically restarts server
   - Test endpoints with curl or Postman

3. **Database Changes:**
   - Modify models in `backend/src/models/`
   - `sequelize.sync({ alter: true })` auto-updates schema
   - For production, create proper migrations

### Code Style

**TypeScript:**
- Strict mode enabled
- Use type annotations for function parameters
- Prefer `interface` for object shapes, `type` for unions/intersections

**React:**
- Functional components only
- Custom hooks for reusable logic
- TanStack Query for server state

**Backend:**
- Express router pattern
- Service layer for business logic
- Sequelize models with decorators

## Testing

### Manual Testing

**Cards**
1. **Create card:** Click the `+` button in the toolbar; choose Note, Idea, or Plan
2. **Edit card:** Click in the textarea and type
3. **Move card:** Drag from the top handle bar
4. **Change background colour:** Click the paint bucket icon
5. **Change text colour:** Click the text/font icon
6. **Delete card:** Click the × button

**Boards**
7. **Create board:** Click `+` next to "Boards" in the sidebar
8. **Switch board:** Click a board name in the sidebar
9. **Rename / delete board:** Use the board context menu

**Connections**
10. **Draw connection:** Enter connection mode (toolbar), drag from one card to another
11. **Delete connection:** Click a connection line to select, then press Delete

**Resurfacing**
12. **Queue card:** Click the clock icon on a card to mark it "next time"
13. **Resurface modal:** Appears on next app load when due cards exist

**Insights**
14. **Open dashboard:** Click the chart icon in the toolbar
15. **Check analytics:** Review card counts, connection counts, activity timeline, keywords

**Themes**
16. **Switch theme:** Click the theme icon in the toolbar → select Light / Dark / System

**Export**
17. **Export data:** Click the export icon → choose JSON or plain text

### API Testing

```bash
# Get all notes for a board
curl "http://localhost:3000/api/notes/board/{boardId}"

# Create a card
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"type":"note","content":"Test","x":100,"y":100,"boardId":"{boardId}"}'

# Update a card
curl -X PUT http://localhost:3000/api/notes/{id} \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated"}'

# Delete a card
curl -X DELETE http://localhost:3000/api/notes/{id}

# List boards
curl http://localhost:3000/api/boards

# Get connections for a board
curl "http://localhost:3000/api/connections?boardId={boardId}"

# Get analytics for a board
curl "http://localhost:3000/api/analytics?boardId={boardId}"

# Get user preferences
curl "http://localhost:3000/api/preferences?userId={userId}"
```

## Debugging

### Frontend Debugging

1. **React DevTools:** Install browser extension
2. **TanStack Query DevTools:** Already included in dev mode
3. **Console:** Check browser console for errors
4. **Network Tab:** Inspect API requests

### Backend Debugging

1. **Console Logs:** Server logs to terminal
2. **Database:** Use `psql` or pgAdmin to inspect data
3. **Postman:** Test API endpoints directly

### Common Issues

**CORS Errors:**
- Ensure backend is running on port 3000
- Check `VITE_API_URL` matches backend URL
- Verify CORS configuration in `backend/src/index.ts`

**Database Connection:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists (`createdb idea_canvas`)

**Hot Reload Not Working:**
- Frontend: Restart Vite (`npm run dev`)
- Backend: Restart ts-node-dev

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend Build

```bash
cd backend
npm run build
# Output in backend/dist/
```

### Production Environment

**Railway (Backend):**
- Set `DATABASE_URL` in Railway variables
- Build command: `npm run build`
- Start command: `npm run start`

**Vercel (Frontend):**
- Set `VITE_API_URL` to backend URL
- Build command: `npm run build`
- Output directory: `dist`

## Project Structure Recap

```
idea-canvas/
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/        # 25 UI components (Card, Board, Canvas, ...)
│   │   ├── hooks/             # 10+ custom hooks (useNotes, useBoards, ...)
│   │   ├── services/          # 7 API service modules
│   │   ├── App.tsx            # Root canvas component
│   │   └── main.tsx           # Vite entry point
│   └── package.json
│
├── backend/                   # Express REST API
│   ├── src/
│   │   ├── models/            # 6 Sequelize models (NOTES, BOARDS, ...)
│   │   ├── routes/            # 8 route files (notes, boards, connections, ...)
│   │   ├── services/          # 7 service modules (business logic)
│   │   ├── config/            # DB connection (db.ts)
│   │   └── index.ts           # Express entry point
│   └── package.json
│
└── docs/                      # Architecture & API documentation
```

## Getting Help

- Check existing documentation in `docs/`
- Review README.md for feature overview
- Examine source code comments
- Check GitHub issues for known problems
