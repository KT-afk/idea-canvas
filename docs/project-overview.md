# Idea Canvas - Project Overview

## Executive Summary

Idea Canvas is a modern, interactive sticky note application built with a React frontend and Express backend. It provides a beautiful infinite canvas where users can create, organize, and manage colorful, draggable notes with real-time persistence.

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

1. **Drag & Drop Notes** - Smooth dragging with Framer Motion animations
2. **Rich Color Palette** - 22 vibrant colors for backgrounds and text
3. **Infinite Canvas** - Unlimited space for organizing ideas
4. **Auto-Save** - All changes automatically sync to backend
5. **Layering System** - Notes come to front when clicked/dragged
6. **Optimistic Updates** - Immediate UI feedback with rollback on errors

## Architecture Pattern

- **Frontend:** Component-based architecture with custom hooks for business logic
- **Backend:** Layered architecture (Routes → Services → Models)
- **Communication:** REST API with JSON payloads
- **Data Flow:** Unidirectional with TanStack Query cache management

## Key Design Decisions

1. **Framer Motion for Drag Controls** - Precise control over draggable regions
2. **TanStack Query for Server State** - Automatic caching, sync, and optimistic updates
3. **Sequelize-TypeScript** - Type-safe ORM with decorator-based models
4. **DECIMAL columns for coordinates** - High precision positioning (up to 99,999,999.99)

## Documentation Index

- [Frontend Architecture](./architecture-frontend.md)
- [Backend Architecture](./architecture-backend.md)
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)
- [Source Tree Analysis](./source-tree-analysis.md)
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
