# Integration Architecture - Idea Canvas

## Overview

Idea Canvas is a multi-part application consisting of a React frontend and Express backend that communicate via REST API over HTTP. This document describes how the parts integrate, the data flow between them, and the caching and error-handling strategies in use.

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                USER BROWSER                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                          FRONTEND (React)                               │  │
│  │                          localhost:5173                                 │  │
│  │                                                                         │  │
│  │  ┌──────────┐  ┌──────────────────────────────────────────────────┐    │  │
│  │  │ App.tsx  │  │               Service Layer                       │    │  │
│  │  │ Canvas   │  │  notesService  connectionsService  boardsService  │    │  │
│  │  │ Boards   │  │  analyticsService  preferencesService  ...        │    │  │
│  │  │ Sidebar  │  └────────────────────────┬─────────────────────────┘    │  │
│  │  └──────────┘                           │ axios / fetch                 │  │
│  │       │                                 │                               │  │
│  │  ┌────▼────────────────────────────┐    │                               │  │
│  │  │        TanStack Query           │────┘                               │  │
│  │  │  Cache keys per resource type   │                                    │  │
│  │  └─────────────────────────────────┘                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                         HTTP REST API  │  JSON
                                        │
┌───────────────────────────────────────┼──────────────────────────────────────┐
│                    BACKEND (Express)  │  localhost:3000                       │
│                                       │                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  index.ts → /api router                                               │    │
│  │                                                                        │    │
│  │  ┌────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │    │
│  │  │ notes-route    │  │ boards-route      │  │ connections-route     │  │    │
│  │  │ analytics-route│  │ preferences-route │  │ activity-log-route    │  │    │
│  │  │ next-time-route│  │ resurfacing-route │  └───────────────────────┘  │    │
│  │  └───────┬────────┘  └────────┬─────────┘                              │    │
│  │          │ Route → Service → Model (layered)                            │    │
│  │  ┌───────▼────────────────────▼──────────────────────────────────────┐ │    │
│  │  │  Service Layer                                                      │ │    │
│  │  │  notes-service  boards-service  connections-service                 │ │    │
│  │  │  analytics-service  preferences-service  auto-connection-service    │ │    │
│  │  │  resurfacing-service                                                │ │    │
│  │  └───────────────────────────┬────────────────────────────────────────┘ │    │
│  └──────────────────────────────┼──────────────────────────────────────────┘    │
└─────────────────────────────────┼────────────────────────────────────────────── ┘
                                  │  TCP / SQL
                                  │
               ┌──────────────────▼──────────────────────────┐
               │               PostgreSQL                      │
               │                                              │
               │  NOTES   BOARDS   CONNECTIONS   ACTIVITY_LOG │
               │  NEXT_TIME_NOTES   USER_PREFERENCES          │
               └──────────────────────────────────────────────┘
```

## Integration Points

### 1. Frontend → Backend (HTTP/REST)

**Communication Protocol:** HTTP/1.1 over TCP  
**Data Format:** JSON  
**Base URL:** Configured via `VITE_API_URL` environment variable

| Route Group | Methods | Backend Prefix | Purpose |
|-------------|---------|----------------|---------|
| Notes | GET, POST, PUT, DELETE | `/api/notes` | CRUD + board filtering |
| Boards | GET, POST, PUT, DELETE | `/api/boards` | Board management |
| Connections | GET, POST, DELETE | `/api/connections` | Card-to-card connections |
| Preferences | GET, POST | `/api/preferences` | Theme, resurface frequency |
| Analytics | GET | `/api/analytics` | Dashboard stats |
| Activity Log | GET | `/api/activity-log` | Event history |
| Next-Time Notes | GET, POST, DELETE | `/api/next-time-notes` | Resurface queue |
| Resurfacing | GET | `/api/resurfacing` | Due cards for resurface |

### 2. Backend → Database (TCP/SQL)

**Connection:** Sequelize ORM over PostgreSQL protocol  
**Configuration:** `DATABASE_URL` env var (production) or individual `DB_*` vars (development)

```typescript
// Connection established in config/db.ts
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  ssl: { require: true, rejectUnauthorized: false }
});
```

**Tables:** `NOTES`, `BOARDS`, `CONNECTIONS`, `ACTIVITY_LOG`, `NEXT_TIME_NOTES`, `USER_PREFERENCES`

## Data Flow Patterns

### Create Card Flow

```
1. User clicks "+" (Note / Idea / Plan)
   │
2. App.tsx → handleAddCard()
   │  Calculates viewport-centred position
   │
3. useNoteMutations → addNote.mutate({ type, content, x, y, boardId })
   │
4. TanStack Query → mutationFn
   │
5. notesService.createNote()
   │  HTTP POST /api/notes
   │  Body: { type, content, x, y, boardId }
   │
6. notes-route.ts → POST /notes
   │
7. notes-service.ts → insertNote()
   │  Apply defaults (color, width, height, zIndex)
   │  Log to ACTIVITY_LOG
   │
8. Sequelize → Notes.create()  +  ActivityLog.create()
   │  SQL INSERT × 2
   │
9. Response: { success: true, note: {...} }
   │
10. TanStack Query → invalidateQueries(['notes', boardId])
    │
11. UI re-renders with new card
```

### Update Position Flow (Optimistic)

```
1. User drags card to new position
   │
2. Card → onDragEnd (Framer Motion)
   │  Computes absolute position from drag offset
   │
3. useNoteMutations → updatePosition.mutate({ id, x, y })
   │
4. TanStack Query → onMutate (OPTIMISTIC)
   │  Immediately updates cache → UI shows new position
   │  Stores previous cache for rollback
   │
5. notesService.updateNote()
   │  HTTP PUT /api/notes/:id  { x, y }
   │
6. notes-service.ts → updateNote()
   │  Sequelize UPDATE with returning
   │
7. If SUCCESS → onSettled invalidates queries (server sync)
   If ERROR   → onError restores previous cache (rollback)
```

### Connection Creation Flow

```
1. User enters connection-draw mode, drags from Card A to Card B
   │
2. ConnectionOverlay detects drop target
   │
3. useConnectionMutations → addConnection.mutate({ fromId, toId })
   │
4. connectionsService.createConnection()
   │  HTTP POST /api/connections
   │
5. connections-route.ts → connections-service.ts → Connections.create()
   │
6. auto-connection-service.ts triggered in background
   │  Analyses card keywords, creates additional semantic links
   │
7. TanStack Query invalidates ['connections', boardId]
   │
8. ConnectionOverlay re-renders SVG bezier curves
```

### Resurfacing Flow

```
1. App mounts → useResurfacing hook fires
   │
2. resurfacingService.getDueCards()
   │  HTTP GET /api/resurfacing?userId=...
   │
3. resurfacing-route.ts → resurfacing-service.ts
   │  Queries NEXT_TIME_NOTES where dueAt ≤ now
   │  Cross-references USER_PREFERENCES.resurfaceFrequency
   │
4. Returns list of card IDs due for resurfacing
   │
5. Frontend shows ResurfaceModal with due cards
```

### Analytics Flow

```
1. User opens Insights Dashboard
   │
2. InsightsDashboard mounts → useAnalytics hook
   │
3. analyticsService.getAnalytics()
   │  HTTP GET /api/analytics?boardId=...
   │  AbortSignal passed for cancellation on unmount
   │
4. analytics-route.ts → analytics-service.ts
   │  Parallel Promise.all([
   │    countByType, connectionCount, activityTimeline, topKeywords
   │  ])
   │
5. Returns aggregated stats object
   │
6. InsightsDashboard renders charts and counts
```

## CORS Configuration

Backend allows requests from:

```typescript
const allowedOrigins = [
  "http://localhost:5173",    // Vite dev server
  "http://localhost:3000",    // Local backend (self)
  process.env.FRONTEND_URL,   // Production frontend URL
];

// Dynamic: allow all *.vercel.app preview deployments
if (origin.includes("vercel.app")) return callback(null, true);
```

## Environment Configuration

### Development

```
Frontend (localhost:5173)
    │
    │  VITE_API_URL=http://localhost:3000
    ▼
Backend (localhost:3000)
    │
    │  DB_HOST=localhost  DB_PORT=5432
    │  DB_NAME=idea_canvas
    ▼
PostgreSQL (localhost:5432)
```

### Production

```
Frontend (Vercel)
    │
    │  VITE_API_URL=https://backend.railway.app
    ▼
Backend (Railway)
    │
    │  DATABASE_URL=postgres://...
    ▼
PostgreSQL (Railway managed)
```

## Error Handling

### Frontend

TanStack Query surfaces errors via `isError` / `error` state. Optimistic mutations roll back on error:

```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, optimisticUpdate(newData));
  return { previous };
},
onError: (_err, _var, context) => {
  queryClient.setQueryData(queryKey, context.previous); // rollback
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey });          // server sync
}
```

### Backend

All routes use try/catch with a consistent response shape:

```typescript
router.get("/notes", async (req, res) => {
  try {
    const result = await getAllNotes();
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
```

## Caching Strategy

### TanStack Query Cache Keys

| Resource | Query Key | Stale Time |
|----------|-----------|------------|
| Notes (by board) | `['notes', boardId]` | 0 (always refetch) |
| Boards | `['boards']` | 0 |
| Connections (by board) | `['connections', boardId]` | 0 |
| Preferences | `['preferences', userId]` | 5 minutes |
| Analytics | `['analytics', boardId]` | 0 (refetchOnMount: always) |
| Activity Log | `['activity-log']` | 0 |
| Next-Time Notes | `['next-time-notes']` | 0 |

### Optimistic Update Pattern

1. `onMutate`: Cancel in-flight queries, snapshot cache, apply optimistic update
2. `onError`: Restore snapshot
3. `onSettled`: Invalidate affected queries to sync with server truth

## Scaling Considerations

### Current Limitations

1. **Single Backend Instance** — No horizontal scaling; stateful auto-connection keyword cache is in-memory
2. **No Authentication** — All data is user-scoped by a client-provided `userId`, not server-verified
3. **No Real-time** — No WebSocket/SSE; changes from other sessions require manual refresh
4. **Single Database** — No read replicas

### Future Improvements

1. **WebSocket/SSE** — Real-time collaboration and live canvas updates
2. **User Authentication** — JWT or session-based auth; replace client-provided userId
3. **Distributed Cache** — Redis for auto-connection keyword cache across instances
4. **Database Sharding** — For large-scale multi-tenant deployments
5. **CDN** — Static asset caching for production frontend
