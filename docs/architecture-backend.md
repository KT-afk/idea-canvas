# Backend Architecture - Idea Canvas

## Overview

The backend is an Express 5 REST API server built with TypeScript. It uses Sequelize ORM with PostgreSQL for data persistence and implements a layered architecture with clear separation of concerns.

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Express 5 | HTTP server and routing |
| Language | TypeScript 5.9 | Type safety |
| ORM | Sequelize 6.37 | Database abstraction |
| ORM Extension | sequelize-typescript | Decorator-based models |
| Database | PostgreSQL 14+ | Relational data storage |
| Dev Server | ts-node-dev | Hot-reload development |

## Directory Structure

```
backend/src/
├── index.ts             # Application entry point
├── config/              # Configuration modules
│   ├── db.ts            # Database connection setup
│   └── env.ts           # Environment variables
├── models/              # Sequelize models (ORM)
│   ├── NOTES.ts         # Notes table model
│   └── BOARDS.ts        # Boards table model
├── routes/              # Express route handlers
│   └── notes-route.ts   # Notes API endpoints
└── services/            # Business logic layer
    └── notes-service.ts # Notes CRUD operations
```

## Layered Architecture

```
┌─────────────────────────────────────┐
│          Express Routes             │  ← HTTP layer
│   (routes/notes-route.ts)           │
├─────────────────────────────────────┤
│          Service Layer              │  ← Business logic
│   (services/notes-service.ts)       │
├─────────────────────────────────────┤
│          Sequelize Models           │  ← Data access
│   (models/NOTES.ts, BOARDS.ts)      │
├─────────────────────────────────────┤
│          PostgreSQL                 │  ← Persistence
└─────────────────────────────────────┘
```

## Application Entry Point

### index.ts
```typescript
// Key responsibilities:
1. Configure CORS (localhost + Vercel previews)
2. Setup JSON body parsing
3. Health check endpoint (/health)
4. Mount API routes (/api)
5. Connect to database
6. Sync models with sequelize.sync({ alter: true })
7. Start HTTP server
```

### CORS Configuration
```typescript
// Allowed origins:
- http://localhost:5173 (Vite dev)
- http://localhost:3000 (local backend)
- process.env.FRONTEND_URL (production)
- *.vercel.app (preview deployments)
```

## Database Configuration

### Connection Setup (config/db.ts)
- Supports `DATABASE_URL` (Railway/production) or individual env vars
- SSL enabled for production environments
- Auto-discovers models from `../models` directory

### Environment Variables
```env
# Production (Railway)
DATABASE_URL=postgres://...

# Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=idea_canvas
DB_USERNAME=your_username
DB_PASSWORD=your_password
PORT=3000
```

## Data Models

### Notes Model (models/NOTES.ts)
```typescript
@Table({ tableName: "NOTES", timestamps: true })
class Notes extends Model {
  id: UUID (PK, auto-generated)
  content: TEXT (required)
  x: DECIMAL(10,2) (position)
  y: DECIMAL(10,2) (position)
  width: DECIMAL(5,2) (default: 192)
  height: DECIMAL(5,2) (default: 96)
  boardId: UUID (FK, nullable)
  zIndex: INTEGER (default: 0)
  color: STRING (default: "yellow")
  textColor: STRING (default: "black")
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Boards Model (models/BOARDS.ts)
```typescript
@Table({ tableName: "BOARDS", timestamps: true })
class Boards extends Model {
  id: UUID (PK, auto-generated)
  name: TEXT (required)
  notes: HasMany<Notes> (relationship)
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

### Relationships
- **Board → Notes:** One-to-Many (HasMany)
- **Note → Board:** Many-to-One (BelongsTo)

## API Layer

### Routes (routes/notes-route.ts)

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/notes` | getAllNotes | Fetch all notes |
| POST | `/api/notes` | insertNote | Create a note |
| PUT | `/api/notes/:id` | updateNote | Update note |
| GET | `/api/notes/board/:boardId` | getAllNotesByBoardId | Notes by board |
| DELETE | `/api/notes/:id` | deleteNote | Delete note |
| GET | `/health` | - | Health check |

### Request/Response Format

**Create Note (POST /api/notes)**
```json
// Request
{
  "content": "New Note",
  "x": 100,
  "y": 200,
  "color": "yellow",
  "textColor": "black"
}

// Response
{
  "success": true,
  "note": { ...createdNote }
}
```

**Update Note (PUT /api/notes/:id)**
```json
// Request (partial update)
{
  "content": "Updated content",
  "x": 150,
  "y": 250
}

// Response
{ ...updatedNote }
```

## Service Layer

### notes-service.ts

```typescript
// CRUD Operations:
insertNote(note) → Creates note with defaults
getAllNotes() → Returns all notes
getAllNotesByBoardId(boardId) → Filtered by board
updateNote(id, updates) → Partial update with returning
deleteNote(id) → Removes note by ID
```

### Key Implementation Details

1. **Default Values:** Applied in service layer (color, width, height)
2. **Returning Clause:** Updates return the modified record
3. **Error Handling:** Throws errors for not-found scenarios

## Deployment Configuration

### Railway Support
- `DATABASE_URL` environment variable
- SSL connections in production
- Health check endpoint for uptime monitoring

### Scripts
```json
"dev": "ts-node-dev --respawn src/index.ts"
"build": "tsc"
"start": "node dist/index.js"
"db:migrate": "npx sequelize-cli db:migrate"
"db:migrate:undo": "npx sequelize-cli db:migrate:undo"
```

## Dependencies Summary

### Production
- express (5.1.0)
- cors (2.8.5)
- pg, pg-hstore (PostgreSQL driver)
- sequelize (6.37.7)
- sequelize-typescript (2.1.6)
- dotenv (17.2.3)

### Development
- typescript (5.9.3)
- ts-node-dev (2.0.0)
- @types/express, @types/cors, @types/node
