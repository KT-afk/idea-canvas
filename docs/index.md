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

## Generated Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| [Project Overview](./project-overview.md) | Executive summary, tech stack, features |
| [Source Tree Analysis](./source-tree-analysis.md) | Complete directory structure with annotations |
| [Development Guide](./development-guide.md) | Setup, scripts, workflow, debugging |

### Architecture Documentation

| Document | Description |
|----------|-------------|
| [Frontend Architecture](./architecture-frontend.md) | React components, hooks, state management |
| [Backend Architecture](./architecture-backend.md) | Express routes, services, models |
| [Integration Architecture](./integration-architecture.md) | How parts communicate, data flow |

### Technical Specifications

| Document | Description |
|----------|-------------|
| [API Contracts](./api-contracts.md) | REST endpoints, request/response schemas |
| [Data Models](./data-models.md) | Database schema, Sequelize models, relationships |

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
- **Mutations:** Optimistic updates with rollback on error
- **Components:** Functional with custom hooks for logic extraction
- **Styling:** Tailwind CSS utilities + custom color mapping

### Backend Patterns

- **Architecture:** Routes → Services → Models (layered)
- **Database:** Sequelize-TypeScript with decorator-based models
- **API Style:** RESTful with JSON payloads
- **Error Handling:** Try/catch with consistent error responses

### Integration Patterns

- **Communication:** HTTP REST over VITE_API_URL
- **CORS:** Configured for localhost + Vercel previews
- **Data Sync:** TanStack Query cache invalidation

---

## Current Features

- Drag & drop notes with Framer Motion
- 22-color palette for backgrounds and text
- Infinite canvas with position persistence
- Auto-save to PostgreSQL backend
- Z-index layering management
- Optimistic UI updates

## Planned Features (from README roadmap)

- [ ] User authentication
- [ ] Multi-board support
- [ ] Keyboard shortcuts
- [ ] Mobile/tablet responsive design
- [ ] Real-time collaboration
- [ ] Rich text editing
- [ ] Image attachments
- [ ] Search and filtering

---

## Document Metadata

| Property | Value |
|----------|-------|
| Generated | 2026-01-21 |
| Scan Level | Deep |
| Mode | Initial Scan |
| Parts Documented | 2 (frontend, backend) |
| Files Generated | 9 |
