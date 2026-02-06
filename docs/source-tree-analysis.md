# Source Tree Analysis - Idea Canvas

## Project Structure Overview

```
idea-canvas/
├── frontend/                    # React frontend application (Part: frontend)
│   ├── src/                     # Source code
│   │   ├── App.tsx             # ⭐ Main application component
│   │   ├── main.tsx            # ⭐ Application entry point
│   │   ├── index.css           # Global styles
│   │   ├── components/         # React components
│   │   │   ├── NoteCard.tsx    # ⭐ Core draggable note component
│   │   │   ├── Button.tsx      # Reusable button
│   │   │   ├── EmptyState.tsx  # Empty state display
│   │   │   ├── Popover.tsx     # Color picker popover
│   │   │   └── ui/             # Shadcn-style primitives
│   │   │       ├── button.tsx  # Button primitive
│   │   │       └── popover.tsx # Popover primitive
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useNoteMutations.ts  # ⭐ CRUD operations
│   │   │   └── useZIndexManager.ts  # Z-index layering
│   │   ├── services/           # API service layer
│   │   │   └── notesService.ts # ⭐ Backend API client
│   │   ├── types/              # TypeScript definitions
│   │   │   └── types.ts        # Shared type definitions
│   │   ├── utilities/          # Utility functions
│   │   │   └── utils.ts        # Color mapping, normalization
│   │   ├── lib/                # Library utilities
│   │   │   └── utils.ts        # cn() class merging
│   │   └── assets/             # Static assets
│   ├── public/                 # Public static files
│   ├── dist/                   # Production build output
│   ├── index.html              # HTML template
│   ├── package.json            # Dependencies & scripts
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── tsconfig.json           # TypeScript config (root)
│   ├── tsconfig.app.json       # TypeScript config (app)
│   ├── tsconfig.node.json      # TypeScript config (node)
│   ├── postcss.config.js       # PostCSS config
│   ├── eslint.config.js        # ESLint config
│   ├── components.json         # Shadcn/UI config
│   └── .env.example            # Environment template
│
├── backend/                     # Express backend API (Part: backend)
│   ├── src/                     # Source code
│   │   ├── index.ts            # ⭐ Application entry point
│   │   ├── config/             # Configuration modules
│   │   │   ├── db.ts           # ⭐ Database connection
│   │   │   └── env.ts          # Environment variables
│   │   ├── models/             # Sequelize ORM models
│   │   │   ├── NOTES.ts        # ⭐ Notes table model
│   │   │   └── BOARDS.ts       # Boards table model
│   │   ├── routes/             # Express route handlers
│   │   │   └── notes-route.ts  # ⭐ Notes API endpoints
│   │   ├── services/           # Business logic layer
│   │   │   └── notes-service.ts # ⭐ Notes CRUD operations
│   │   └── migrations/         # Database migrations
│   ├── dist/                   # Compiled JavaScript output
│   ├── package.json            # Dependencies & scripts
│   ├── tsconfig.json           # TypeScript config
│   ├── .sequelizerc            # Sequelize CLI config
│   ├── .env                    # Environment variables (local)
│   ├── .env.example            # Environment template
│   └── .dockerignore           # Docker ignore rules
│
├── docs/                        # Project documentation (generated)
│   ├── index.md                # Master documentation index
│   ├── project-overview.md     # Project summary
│   ├── architecture-frontend.md # Frontend architecture
│   ├── architecture-backend.md  # Backend architecture
│   ├── api-contracts.md        # API documentation
│   ├── data-models.md          # Database schema
│   ├── source-tree-analysis.md # This file
│   ├── development-guide.md    # Development setup
│   └── integration-architecture.md # Part integration
│
├── _bmad/                       # BMAD workflow system
├── _bmad-output/               # BMAD artifacts
│   ├── planning-artifacts/     # Planning documents
│   └── implementation-artifacts/ # Implementation docs
│
├── README.md                    # Project README
└── .gitignore                   # Git ignore rules
```

## Critical Directories

### Frontend Critical Paths

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `frontend/src/` | Application source | App.tsx, main.tsx |
| `frontend/src/components/` | UI components | NoteCard.tsx (core) |
| `frontend/src/hooks/` | State & logic | useNoteMutations.ts |
| `frontend/src/services/` | API layer | notesService.ts |
| `frontend/src/types/` | Type definitions | types.ts |

### Backend Critical Paths

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `backend/src/` | Server source | index.ts (entry) |
| `backend/src/config/` | Configuration | db.ts, env.ts |
| `backend/src/models/` | ORM models | NOTES.ts, BOARDS.ts |
| `backend/src/routes/` | API routes | notes-route.ts |
| `backend/src/services/` | Business logic | notes-service.ts |

## Entry Points

### Frontend Entry Points

1. **HTML Entry:** `frontend/index.html`
   - Loads Vite dev server or production bundle
   - Contains root div for React mounting

2. **JavaScript Entry:** `frontend/src/main.tsx`
   - Creates React root
   - Wraps App with QueryClientProvider
   - Renders to DOM

3. **Application Entry:** `frontend/src/App.tsx`
   - Main component with query setup
   - Note rendering and management

### Backend Entry Points

1. **Server Entry:** `backend/src/index.ts`
   - Express app initialization
   - Middleware setup (CORS, JSON)
   - Route mounting
   - Database connection
   - Server startup

## Integration Points

### Frontend → Backend Communication

```
frontend/src/services/notesService.ts
    │
    │ HTTP (REST API)
    │ Base URL: VITE_API_URL
    ▼
backend/src/routes/notes-route.ts
    │
    │ Function calls
    ▼
backend/src/services/notes-service.ts
    │
    │ Sequelize ORM
    ▼
backend/src/models/NOTES.ts → PostgreSQL
```

### Environment Configuration Flow

```
Frontend:
.env → VITE_API_URL → notesService.ts → API calls

Backend:
.env → config/env.ts → config/db.ts → Sequelize connection
```

## File Counts by Type

| Part | TypeScript | Config | Other |
|------|------------|--------|-------|
| Frontend | 12 files | 6 files | 2 files |
| Backend | 7 files | 4 files | 1 file |

## Key File Purposes

### Frontend Key Files

| File | LOC | Purpose |
|------|-----|---------|
| App.tsx | ~85 | Main app, query setup, note rendering |
| NoteCard.tsx | ~136 | Draggable note with motion controls |
| useNoteMutations.ts | ~141 | All CRUD mutations with optimistic updates |
| notesService.ts | ~58 | API client functions |
| useZIndexManager.ts | ~54 | Note layering management |
| utils.ts | ~37 | Color mapping utility |

### Backend Key Files

| File | LOC | Purpose |
|------|-----|---------|
| index.ts | ~56 | Express setup, CORS, routes |
| NOTES.ts | ~87 | Notes Sequelize model |
| BOARDS.ts | ~32 | Boards Sequelize model |
| notes-route.ts | ~73 | REST API endpoints |
| notes-service.ts | ~81 | Database operations |
| db.ts | ~43 | Database connection setup |

## Build Artifacts

### Frontend Build (`frontend/dist/`)
- Generated by `vite build`
- Contains optimized JS/CSS bundles
- Static assets copied from `public/`

### Backend Build (`backend/dist/`)
- Generated by `tsc`
- Compiled JavaScript from TypeScript
- Mirrors `src/` structure
