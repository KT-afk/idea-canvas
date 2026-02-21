# Backend Architecture — Idea Canvas

## Overview

The backend is an Express 5 REST API server built with TypeScript. It uses Sequelize ORM with PostgreSQL for data persistence and follows a strict three-layer architecture: Routes → Services → Models.

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Express 5 | HTTP server and routing |
| Language | TypeScript 5.9 | Type safety |
| ORM | Sequelize 6.37 + sequelize-typescript | Decorator-based models, type-safe queries |
| Database | PostgreSQL 14+ | Relational persistence |
| Dev Server | ts-node-dev | Hot-reload development |

## Directory Structure

```
backend/src/
├── index.ts                         # App bootstrap: CORS, routes, DB sync, server start
├── config/
│   ├── db.ts                        # Sequelize connection (DATABASE_URL or individual vars)
│   └── env.ts                       # Environment variable validation
├── models/
│   ├── NOTES.ts                     # Notes table (cards on the canvas)
│   ├── BOARDS.ts                    # Boards table
│   ├── CONNECTIONS.ts               # Connections between two notes
│   ├── ACTIVITY_LOG.ts              # Append-only event log per note
│   ├── NEXT_TIME_NOTES.ts           # Checklist items attached to idea/plan cards
│   └── USER_PREFERENCES.ts          # Per-user settings (theme, resurface freq, etc.)
├── routes/
│   ├── notes-route.ts               # Notes CRUD + board-scoped listing
│   ├── boards-route.ts              # Boards CRUD
│   ├── connection-route.ts          # Connections CRUD + auto-suggestion endpoints
│   ├── preferences-route.ts         # User preferences read/write
│   ├── analytics-route.ts           # Lifecycle analytics aggregation
│   ├── activity-log-route.ts        # Activity log read
│   ├── next-time-notes-route.ts     # Next-time notes CRUD
│   └── resurfacing-route.ts         # Resurfacing candidate + acted-on tracking
└── services/
    ├── notes-service.ts             # Notes CRUD operations
    ├── boards-service.ts            # Boards CRUD operations
    ├── connection-service.ts        # Connection CRUD + board/card queries
    ├── auto-connection-service.ts   # Keyword-based connection suggestion engine
    ├── ai-connection-service.ts     # AI-powered connection suggestions (future)
    ├── preferences-service.ts       # Preferences upsert logic
    ├── activity-log-service.ts      # Activity log append + query
    ├── next-time-notes-service.ts   # Next-time notes CRUD
    └── resurfacing-service.ts       # Forgotten idea selection logic
```

## Layered Architecture

```
┌────────────────────────────────────┐
│           Express Routes           │  HTTP parsing, request validation, response shaping
├────────────────────────────────────┤
│           Service Layer            │  Business logic, multi-model queries, transactions
├────────────────────────────────────┤
│         Sequelize Models           │  Type-safe data access, schema definition
├────────────────────────────────────┤
│           PostgreSQL               │  Relational persistence
└────────────────────────────────────┘
```

## Application Entry Point (`index.ts`)

1. Configure CORS (localhost:5173, localhost:3000, `FRONTEND_URL`, `*.vercel.app`)
2. JSON body parsing
3. Mount all routers under `/api`
4. Register health check at `/health`
5. Connect to database and run `sequelize.sync({ alter: true })`
6. Start HTTP server

## Routes

| Router | Mount prefix | Key endpoints |
|--------|-------------|---------------|
| `notes-route.ts` | `/api` | `GET /notes`, `POST /notes`, `PUT /notes/:id`, `DELETE /notes/:id`, `GET /notes/board/:boardId` |
| `boards-route.ts` | `/api` | `GET /boards`, `POST /boards`, `PUT /boards/:id`, `DELETE /boards/:id` |
| `connection-route.ts` | `/api` | `POST /boards/:boardId/connections`, `GET /boards/:boardId/connections`, `GET /cards/:cardId/connections`, `DELETE /connections/:id`, `GET /boards/:boardId/connection-suggestions`, `GET /cards/:cardId/connection-suggestions` |
| `preferences-route.ts` | `/api` | `GET /preferences`, `PUT /preferences`, `PUT /preferences/default-board` |
| `analytics-route.ts` | `/api` | `GET /analytics` |
| `activity-log-route.ts` | `/api` | `GET /notes/:noteId/activity` |
| `next-time-notes-route.ts` | `/api` | `GET /notes/:noteId/next-time-notes`, `POST /notes/:noteId/next-time-notes`, `PATCH /next-time-notes/:id/complete`, `DELETE /next-time-notes/:id` |
| `resurfacing-route.ts` | `/api` | `GET /ideas/resurface`, `PATCH /ideas/:noteId/resurface-acted` |

## Services

### `notes-service.ts`
Standard CRUD. All writes emit an `ActivityLog` entry (`created`, `edited`, `type_changed`, `status_changed`, `graduated`).

### `auto-connection-service.ts`
Keyword-based suggestion engine:
- `suggestConnectionsKeywordBased(boardId)` — scores all note pairs on the board by shared keywords; capped at `MAX_CARDS = 100` to bound O(n²) cost; uses a per-card keyword cache to avoid double-computation
- `suggestConnectionsForCard(cardId, boardId)` — same algorithm for a single card vs all others
- Shared `buildReason(commonWords)` helper for consistent reason strings
- Excludes cards of `type = 'plan'` from suggestions

### `resurfacing-service.ts`
`getForgottenIdea(frequency)` selects one idea that has not been viewed recently, weighted by the user's `resurfaceFrequency` preference (`normal` / `frequent` / `rare` / `off`). Uses a staleness threshold (days since `lastViewedAt` or `createdAt`).

### `preferences-service.ts`
Upsert pattern: `getOrCreate` on `USER_PREFERENCES` by `userId`; partial `update` for individual fields.

### `activity-log-service.ts`
Append-only: `appendActivityLog(noteId, eventType, payload?)`. `getActivityLog(noteId)` returns entries newest-first.

## Environment Variables

```env
# Production (Railway)
DATABASE_URL=postgres://...
FRONTEND_URL=https://your-app.vercel.app

# Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=idea_canvas
DB_USERNAME=your_username
DB_PASSWORD=your_password
PORT=3000
```

## Database Sync Strategy

`sequelize.sync({ alter: true })` on startup:
- Creates tables if they don't exist
- Alters existing columns to match model definitions
- Safe for development; use explicit migrations for production schema changes

## Scripts

```bash
npm run dev           # ts-node-dev hot-reload
npm run build         # tsc
npm run start         # node dist/index.js
npm run test          # Jest test suite
npm run db:migrate    # Sequelize CLI migrations
```
