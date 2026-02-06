# Frontend Architecture - Idea Canvas

## Overview

The frontend is a React 19 Single Page Application built with Vite, using TypeScript for type safety. It implements a component-based architecture with custom hooks for state management and business logic.

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | React 19 | UI rendering and component model |
| Build Tool | Vite 7 | Fast development and production builds |
| Language | TypeScript 5.9 | Type safety and developer experience |
| Styling | Tailwind CSS 4 | Utility-first CSS framework |
| Animation | Framer Motion | Drag interactions and animations |
| Data Fetching | TanStack Query | Server state management and caching |
| HTTP Client | Axios | API requests (configured in services) |
| UI Primitives | Radix UI | Accessible component primitives |
| Icons | Lucide React | Icon system |

## Directory Structure

```
frontend/src/
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── components/          # React components
│   ├── NoteCard.tsx     # Main note component with drag
│   ├── Button.tsx       # Reusable button component
│   ├── EmptyState.tsx   # Empty state display
│   ├── Popover.tsx      # Color picker popover
│   └── ui/              # Shadcn-style UI components
│       ├── button.tsx
│       └── popover.tsx
├── hooks/               # Custom React hooks
│   ├── useNoteMutations.ts  # CRUD operations for notes
│   └── useZIndexManager.ts  # Z-index layering system
├── services/            # API service layer
│   └── notesService.ts  # Notes API client
├── types/               # TypeScript type definitions
│   └── types.ts         # Shared types (Note, etc.)
├── utilities/           # Utility functions
│   └── utils.ts         # Color mapping, normalization
└── lib/                 # Library utilities
    └── utils.ts         # cn() class merging utility
```

## Component Architecture

### App.tsx (Main Component)
- Entry point for the application
- Manages global state via TanStack Query
- Renders note cards with AnimatePresence for animations
- Handles note creation with position calculation

```typescript
// Key patterns:
- useQuery for fetching notes
- useNoteMutations for CRUD operations
- useZIndexManager for layering
- Ref-based drag constraints
```

### NoteCard.tsx (Core Component)
- Draggable sticky note with Framer Motion
- Controlled drag handle (top 40px only)
- Local state for text editing
- Motion values for smooth position updates

```typescript
// Key features:
- useDragControls for precise drag regions
- useMotionValue for render-free position updates
- Optimistic local state with onBlur sync
- Color customization via popovers
```

## State Management

### Server State (TanStack Query)
- **Query Key:** `["notes"]`
- **Caching:** Automatic with background refetch
- **Optimistic Updates:** Implemented in mutations

### Local State
- **Component state:** Text editing, drag state
- **Z-Index order:** Managed by useZIndexManager hook

## Custom Hooks

### useNoteMutations
Provides all CRUD operations with optimistic updates:
- `addNote` - Create new note
- `editNote` - Update content
- `updatePosition` - Save drag position
- `updateColor` - Change background color
- `updateTextColor` - Change text color
- `deleteNote` - Remove note

### useZIndexManager
Manages note layering:
- Tracks z-index order in React state
- `bringToFront(id)` - Elevates note on interaction
- Normalizes indices when exceeding MAX_Z_INDEX (1000)

## API Integration

### Service Layer Pattern
```typescript
// notesService.ts
const API_URL = import.meta.env.VITE_API_URL || "";

export async function fetchNotes(): Promise<Note[]>
export async function createNote(note: unknown): Promise<Note>
export async function updateNote(id: string, payload: Partial<Note>): Promise<Note>
export async function deleteNote(id: string): Promise<void>
```

### Environment Configuration
- `VITE_API_URL` - Backend API base URL
- Falls back to relative path for same-origin deployment

## Styling Architecture

### Tailwind CSS 4
- Utility-first approach
- Custom color palette in utils.ts
- Animation utilities via tailwindcss-animate

### Color System
22 predefined colors mapped to hex values:
- Standard Tailwind colors (yellow, red, blue, etc.)
- Classic pure colors (classicRed, classicBlue, etc.)
- Neutral colors (white, black, gray)

## Animation System

### Framer Motion Configuration
```typescript
// NoteCard drag settings:
drag: true
dragMomentum: false
dragElastic: 0
dragTransition: { bounceStiffness: 600, bounceDamping: 30 }
whileDrag: { scale: 1.05, rotate: 2 }
```

## Build & Development

### Scripts
- `npm run dev` - Start Vite dev server
- `npm run build` - TypeScript check + production build
- `npm run lint` - ESLint validation
- `npm run preview` - Preview production build

### Entry Points
- `index.html` - HTML template
- `src/main.tsx` - React app bootstrap
- `src/App.tsx` - Root component

## Dependencies Summary

### Production
- react, react-dom (19.1.1)
- @tanstack/react-query (5.90.8)
- framer-motion (12.23.24)
- axios (1.13.1)
- @radix-ui/react-popover, @radix-ui/react-slot
- lucide-react (0.556.0)
- tailwind-merge, clsx, class-variance-authority

### Development
- vite (7.1.7)
- typescript (5.9.3)
- tailwindcss (4.1.16)
- eslint + plugins
