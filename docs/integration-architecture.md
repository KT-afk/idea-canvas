# Integration Architecture - Idea Canvas

## Overview

Idea Canvas is a multi-part application consisting of a React frontend and Express backend that communicate via REST API over HTTP. This document describes how the parts integrate and the data flow between them.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         FRONTEND (React)                           │  │
│  │                         localhost:5173                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐  │  │
│  │  │   App.tsx   │──│  TanStack   │──│      notesService.ts     │  │  │
│  │  │  (UI Layer) │  │   Query     │  │      (API Client)        │  │  │
│  │  └─────────────┘  │  (Cache)    │  └──────────────────────────┘  │  │
│  │                   └─────────────┘              │                  │  │
│  └───────────────────────────────────────────────┼───────────────────┘  │
└──────────────────────────────────────────────────┼──────────────────────┘
                                                   │
                                    HTTP REST API  │ JSON
                                                   │
┌──────────────────────────────────────────────────┼──────────────────────┐
│                          BACKEND (Express)        │                      │
│                          localhost:3000           │                      │
│  ┌───────────────────────────────────────────────┼───────────────────┐  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────▼───────────────┐  │  │
│  │  │   index.ts  │──│   Router    │──│    notes-route.ts        │  │  │
│  │  │  (Express)  │  │  (/api)     │  │    (HTTP Handlers)       │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────────────┘  │  │
│  │                                                │                  │  │
│  │                                    ┌───────────▼───────────────┐  │  │
│  │                                    │   notes-service.ts        │  │  │
│  │                                    │   (Business Logic)        │  │  │
│  │                                    └───────────────────────────┘  │  │
│  │                                                │                  │  │
│  │                                    ┌───────────▼───────────────┐  │  │
│  │                                    │   Sequelize Models        │  │  │
│  │                                    │   (NOTES.ts, BOARDS.ts)   │  │  │
│  │                                    └───────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                                   │
                                         TCP/5432  │ SQL
                                                   │
                               ┌───────────────────▼───────────────────┐
                               │            PostgreSQL                  │
                               │         Database Server                │
                               │  ┌─────────────┐  ┌─────────────┐     │
                               │  │   NOTES     │  │   BOARDS    │     │
                               │  │   Table     │  │   Table     │     │
                               │  └─────────────┘  └─────────────┘     │
                               └───────────────────────────────────────┘
```

## Integration Points

### 1. Frontend → Backend (HTTP/REST)

**Communication Protocol:** HTTP/1.1 over TCP
**Data Format:** JSON
**Base URL:** Configured via `VITE_API_URL` environment variable

| Frontend Function | HTTP Method | Backend Endpoint | Purpose |
|-------------------|-------------|------------------|---------|
| `fetchNotes()` | GET | `/api/notes` | Load all notes |
| `createNote()` | POST | `/api/notes` | Create new note |
| `updateNote()` | PUT | `/api/notes/:id` | Update note |
| `deleteNote()` | DELETE | `/api/notes/:id` | Remove note |
| `fetchNotesByBoard()` | GET | `/api/notes/board/:id` | Filter by board |

### 2. Backend → Database (TCP/SQL)

**Connection:** Sequelize ORM over PostgreSQL protocol
**Configuration:** Environment variables or `DATABASE_URL`

```typescript
// Connection established in config/db.ts
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  ssl: { require: true, rejectUnauthorized: false }
});
```

## Data Flow Patterns

### Create Note Flow

```
1. User clicks "+" button
   │
2. App.tsx → handleAddNote()
   │ Calculates position (x, y)
   │
3. useNoteMutations → addNote.mutate()
   │
4. TanStack Query → mutationFn
   │
5. notesService.createNote()
   │ HTTP POST /api/notes
   │ Body: { content, x, y }
   │
6. notes-route.ts → POST /notes
   │ Extract body params
   │
7. notes-service.ts → insertNote()
   │ Apply defaults (color, width, height)
   │
8. Sequelize → Notes.create()
   │ SQL INSERT
   │
9. PostgreSQL → New row created
   │
10. Response flows back up
    │ { success: true, note: {...} }
    │
11. TanStack Query → invalidateQueries(['notes'])
    │
12. UI re-renders with new note
```

### Update Position Flow (Optimistic)

```
1. User drags note
   │
2. NoteCard → onDragEnd
   │ Gets final position from Framer Motion
   │
3. App.tsx → onDragEndSave(id, x, y)
   │
4. useNoteMutations → updatePosition.mutate()
   │
5. TanStack Query → onMutate (OPTIMISTIC)
   │ Immediately updates cache
   │ UI shows new position
   │
6. notesService.updateNote()
   │ HTTP PUT /api/notes/:id
   │
7. notes-route.ts → PUT /notes/:id
   │
8. notes-service.ts → updateNote()
   │ Sequelize update with returning
   │
9. If SUCCESS → onSettled invalidates queries
   │
10. If ERROR → onError restores previous cache
```

## CORS Configuration

Backend allows requests from:

```typescript
const allowedOrigins = [
  "http://localhost:5173",     // Vite dev
  "http://localhost:3000",      // Local backend
  process.env.FRONTEND_URL,     // Production URL
];

// Dynamic: Allow all *.vercel.app
if (origin.includes("vercel.app")) return callback(null, true);
```

## Environment Configuration

### Development

```
Frontend (localhost:5173)
    │
    │ VITE_API_URL=http://localhost:3000
    ▼
Backend (localhost:3000)
    │
    │ DB_HOST=localhost
    │ DB_PORT=5432
    │ DB_NAME=idea_canvas
    ▼
PostgreSQL (localhost:5432)
```

### Production

```
Frontend (Vercel)
    │
    │ VITE_API_URL=https://backend.railway.app
    ▼
Backend (Railway)
    │
    │ DATABASE_URL=postgres://...
    ▼
PostgreSQL (Railway/Managed)
```

## Error Handling

### Frontend Error Handling

```typescript
// TanStack Query provides error state
const { isError, error } = useQuery({...});

// Mutations have onError callback
onError: (_err, _var, context) => {
  // Rollback optimistic update
  queryClient.setQueryData(["notes"], context.previousNotes);
}
```

### Backend Error Handling

```typescript
// Route-level try/catch
router.get("/notes", async (req, res) => {
  try {
    const result = await getAllNotes();
    res.status(200).json({ result });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: "..." });
  }
});
```

## Caching Strategy

### TanStack Query Cache

- **Query Key:** `["notes"]`
- **Stale Time:** Default (0ms - always stale)
- **Refetch:** On window focus, mount, network reconnect
- **Invalidation:** After successful mutations

### Optimistic Updates

Updates appear instantly in UI before server confirmation:
1. `onMutate`: Update cache immediately
2. Store previous state for rollback
3. `onError`: Restore previous state
4. `onSettled`: Refetch to sync with server

## Scaling Considerations

### Current Limitations

1. **Single Backend Instance:** No horizontal scaling
2. **No Authentication:** All data is public
3. **No Real-time:** Polling-based updates only
4. **Single Database:** No read replicas

### Future Improvements

1. **WebSocket/SSE:** Real-time collaboration
2. **User Authentication:** JWT or session-based
3. **Database Sharding:** For large deployments
4. **CDN:** Static asset caching
5. **Load Balancer:** Multiple backend instances
