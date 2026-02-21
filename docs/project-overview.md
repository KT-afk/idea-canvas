# Idea Canvas - Project Overview

## Executive Summary

Idea Canvas is a full-stack productivity application built with React and Express. It provides an infinite canvas where users can create and organise **Notes**, **Ideas**, and **Plans** as draggable cards, connect related cards visually, surface forgotten cards on a schedule, and analyse their thinking through an insights dashboard — all with real-time persistence, multi-board support, and a theming system.

## Project Classification

| Property | Value |
|----------|-------|
| **Project Name** | idea-canvas |
| **Repository Type** | Multi-part (frontend + backend) |
| **Primary Language** | TypeScript |
| **Architecture** | Full-stack web application |

## Parts Overview

### Frontend (`frontend/`)
- **Type:** Single Page Application (SPA)
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **State Management:** TanStack Query (server state)
- **Animation:** Framer Motion

### Backend (`backend/`)
- **Type:** REST API Server
- **Framework:** Express 5
- **ORM:** Sequelize with sequelize-typescript
- **Database:** PostgreSQL
- **Language:** TypeScript

## Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | React | 19.1.1 |
| Build Tool | Vite | 7.1.7 |
| CSS Framework | Tailwind CSS | 4.1.16 |
| Animation | Framer Motion | 12.23.24 |
| Data Fetching | TanStack Query | 5.90.8 |
| HTTP Client | Axios | 1.13.1 |
| UI Primitives | Radix UI | Latest |
| Backend Framework | Express | 5.1.0 |
| ORM | Sequelize | 6.37.7 |
| Database | PostgreSQL | 14+ |
| Language | TypeScript | 5.9.3 |

## Core Features

### Canvas & Cards
1. **Three Card Types** — Notes, Ideas, and Plans; each with distinct styling and behaviour
2. **Drag & Drop** — Smooth dragging with Framer Motion; position persisted to PostgreSQL
3. **Rich Color Palette** — 22 vibrant background and text colour options per card
4. **Infinite Canvas** — Unlimited space with zoom (25%–200%) and pan controls
5. **Layering System** — Cards come to front on click/drag; z-index managed server-side
6. **Optimistic Updates** — Immediate UI feedback with automatic rollback on errors

### Boards
7. **Multi-Board Support** — Create and switch between named boards; cards are board-scoped
8. **Board Management** — Rename and delete boards via the sidebar

### Connections
9. **Visual Connections** — Draw SVG bezier-curve connections between cards to show relationships
10. **Auto-Connections** — Backend service auto-links semantically related cards by keyword analysis

### Resurfacing
11. **"Next Time" Notes** — Tag a card to resurface automatically at the next app open
12. **Configurable Frequency** — User preference controls how often forgotten cards are resurfaced

### Insights
13. **Analytics Dashboard** — Card counts by type, connection counts, activity timeline, top keywords
14. **Activity Log** — Server-side event log (create, update, delete) with timestamps

### Personalisation
15. **Theme System** — Light, dark, and system themes; preference persisted per user
16. **User Preferences** — Resurface frequency and theme stored in `USER_PREFERENCES` table

### Export
17. **Export Menu** — Download canvas content as JSON or plain text

## Architecture Pattern

- **Frontend:** Component-based architecture with custom hooks for business logic
- **Backend:** Layered architecture (Routes → Services → Models)
- **Communication:** REST API with JSON payloads
- **Data Flow:** Unidirectional with TanStack Query cache management

## Key Design Decisions

1. **Framer Motion for Drag Controls** — Precise control over draggable regions; `dragControls` scoped to handle element
2. **TanStack Query for Server State** — Automatic caching, sync, and optimistic updates across all 8 route groups
3. **Sequelize-TypeScript** — Type-safe ORM with decorator-based models across 6 tables
4. **DECIMAL columns for coordinates** — High precision positioning (up to 99,999,999.99)
5. **SVG-based Connections** — Bezier curves computed from card centre-points; no external graph library
6. **Keyword-cache in Auto-Connection Service** — In-memory cache avoids re-fetching all cards on every connect call

## Documentation Index

- [Frontend Architecture](./architecture-frontend.md)
- [Backend Architecture](./architecture-backend.md)
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)
- [Development Guide](./development-guide.md)
- [Integration Architecture](./integration-architecture.md)

## Quick Start

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Visit `http://localhost:5173` to use the application.
