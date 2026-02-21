# Idea Canvas - Documentation Index

> **Master entry point for AI-assisted development.** This index provides structured access to all project documentation for brownfield PRD creation and feature development.

## Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | idea-canvas |
| **Type** | Multi-part (frontend + backend) |
| **Primary Language** | TypeScript |
| **Architecture** | Full-stack web application |

### Quick Reference

#### Frontend (`frontend/`)
- **Type:** React SPA
- **Tech Stack:** React 19, Vite 7, Tailwind CSS 4, Framer Motion, TanStack Query
- **Entry Point:** `frontend/src/main.tsx`

#### Backend (`backend/`)
- **Type:** REST API Server
- **Tech Stack:** Express 5, Sequelize ORM, PostgreSQL
- **Entry Point:** `backend/src/index.ts`

---

## Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| [Project Overview](./project-overview.md) | Executive summary, tech stack, full feature list |
| [Development Guide](./development-guide.md) | Setup, scripts, workflow, debugging |

### Architecture Documentation

| Document | Description |
|----------|-------------|
| [Frontend Architecture](./architecture-frontend.md) | React components, hooks, services, state management |
| [Backend Architecture](./architecture-backend.md) | Express routes, services, models, layered architecture |
| [Integration Architecture](./integration-architecture.md) | How parts communicate, data flow patterns |

### Technical Specifications

| Document | Description |
|----------|-------------|
| [API Contracts](./api-contracts.md) | All 8 REST route groups, request/response schemas |
| [Data Models](./data-models.md) | All 6 database tables, Sequelize models, relationships |

### Code Reviews

| Document | Description |
|----------|-------------|
| `code-reviews/` | Party-mode code review documents (Epics 3–8) |

---

## Existing Documentation

| Document | Location | Description |
|----------|----------|-------------|
| [README](../README.md) | Project root | Features, quick start, roadmap |

---

## Getting Started

### For Development

```bash
# Backend (Terminal 1)
cd backend && npm install && npm run dev

# Frontend (Terminal 2)
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173`

### For AI-Assisted Development

When creating a brownfield PRD or planning new features:

1. **Start with:** This index (`docs/index.md`)
2. **Understand current state:** [Project Overview](./project-overview.md)
3. **For UI features:** [Frontend Architecture](./architecture-frontend.md)
4. **For API features:** [Backend Architecture](./architecture-backend.md) + [API Contracts](./api-contracts.md)
5. **For full-stack features:** [Integration Architecture](./integration-architecture.md)
6. **For database changes:** [Data Models](./data-models.md)

---

## Key Implementation Patterns

### Frontend Patterns

- **State Management:** TanStack Query for server state, React state for local UI
- **Mutations:** Optimistic updates with rollback on error (`onMutate` / `onError` / `onSettled`)
- **Components:** Functional with custom hooks for logic extraction (25 components, 10+ hooks)
- **Styling:** Tailwind CSS utilities + custom colour mapping + CSS variables for themes

### Backend Patterns

- **Architecture:** Routes → Services → Models (layered)
- **Database:** Sequelize-TypeScript with decorator-based models (6 tables)
- **API Style:** RESTful with JSON payloads (8 route groups)
- **Error Handling:** Try/catch with consistent `{ success, error }` responses

### Integration Patterns

- **Communication:** HTTP REST over `VITE_API_URL`
- **CORS:** Configured for localhost + Vercel previews
- **Data Sync:** TanStack Query cache invalidation after mutations

---

## Current Features

- Three card types: Notes, Ideas, Plans
- Drag & drop with position persistence
- 22-colour palette (background + text)
- Infinite canvas with zoom (25%–200%) and pan
- Multi-board support with sidebar navigation
- Visual SVG connections between cards
- Auto-connections via keyword analysis
- "Next Time" resurfacing with configurable frequency
- Analytics dashboard (counts, timelines, keywords)
- Activity log (create/update/delete events)
- Light / dark / system theme switcher
- Export as JSON or plain text
- Optimistic UI updates throughout

---

## Document Metadata

| Property | Value |
|----------|-------|
| Last Updated | 2026-02-21 |
| Parts Documented | 2 (frontend, backend) |
