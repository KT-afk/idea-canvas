# Frontend Architecture — Idea Canvas

## Overview

The frontend is a React 19 SPA built with Vite and TypeScript. It implements a component-based architecture with custom hooks for all data-fetching and mutation logic, and TanStack Query for server-state management.

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | React 19 | UI rendering |
| Build Tool | Vite 7 | Dev server + production builds |
| Language | TypeScript 5.9 | Type safety |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Animation | Framer Motion | Drag interactions, enter/exit animations |
| Data Fetching | TanStack Query 5 | Server state, caching, optimistic updates |
| HTTP Client | Axios / fetch | API requests |
| UI Primitives | Radix UI | Accessible popovers, dialogs, etc. |
| Icons | Lucide React | Icon system |
| Notifications | Sonner | Toast notifications |

## Directory Structure

```
frontend/src/
├── App.tsx                          # Root component — wires everything together
├── main.tsx                         # React bootstrap
├── index.css                        # Tailwind + 7 theme definitions + fonts
├── components/
│   ├── Card.tsx                     # Base draggable card (note / idea / plan)
│   ├── NoteCard.tsx                 # NoteCard wrapper (renders Card for type=note)
│   ├── IdeaCard.tsx                 # IdeaCard wrapper (renders Card for type=idea)
│   ├── PlanCard.tsx                 # PlanCard wrapper (renders Card for type=plan, amber ring)
│   ├── BoardCanvas.tsx              # Infinite canvas with CSS transform zoom/pan
│   ├── Toolbar.tsx                  # Top toolbar: board switcher, search, theme, insights
│   ├── CanvasControls.tsx           # Zoom in/out/reset/fit-to-content buttons
│   ├── BoardSwitcher.tsx            # Board tab list + new/delete board
│   ├── CommandPalette.tsx           # ⌘K search + keyboard shortcuts overlay
│   ├── ThemeSwitcherPopover.tsx     # 7-theme radiogroup with swatch previews
│   ├── InsightsDashboard.tsx        # Idea lifecycle analytics dialog
│   ├── ExportMenu.tsx               # MD + JSON export for idea/plan cards
│   ├── IdeaTimeline.tsx             # Activity history accordion on idea/plan cards
│   ├── NextTimeNotes.tsx            # "Next time" checklist on idea/plan cards
│   ├── ResurfacingPreferencesPopover.tsx  # Resurface frequency setting
│   ├── MoveToBoardPopover.tsx       # Move card to another board
│   ├── AutosaveIndicator.tsx        # Autosave status dot
│   ├── Popover.tsx                  # Color picker popovers (bg + text)
│   ├── NoteCardSkeleton.tsx         # Loading skeleton
│   ├── EmptyState.tsx               # Empty board state
│   ├── LoadingState.tsx             # Initial load state
│   ├── ErrorState.tsx               # Error boundary state
│   ├── NewBoardDialog.tsx           # Create board dialog
│   ├── DeleteBoardDialog.tsx        # Confirm delete board dialog
│   └── ui/                          # Shadcn-style Radix UI wrappers
├── hooks/
│   ├── useNoteMutations.ts          # Note CRUD + type/status/graduation mutations
│   ├── useBoardMutations.ts         # Board CRUD mutations
│   ├── useConnections.ts            # Connection queries + mutations
│   ├── useConnectionSuggestions.ts  # Auto-connection suggestion queries
│   ├── usePreferences.ts            # User preferences query + theme/resurface mutations
│   ├── useTheme.ts                  # Applies theme CSS class to <html>
│   ├── useResurfacing.ts            # "Remember this?" resurface interval logic
│   ├── useActivityLog.ts            # Activity log query for a note
│   ├── useNextTimeNotes.ts          # Next-time notes CRUD
│   └── useZIndexManager.ts          # Z-index layering state
├── services/
│   ├── notesService.ts              # Notes API client
│   ├── boardsService.ts             # Boards API client
│   ├── preferencesService.ts        # Preferences API client
│   ├── analyticsService.ts          # Analytics API client
│   ├── activityLogService.ts        # Activity log API client
│   ├── nextTimeNotesService.ts      # Next-time notes API client
│   └── resurfacingService.ts        # Resurfacing API client
├── types/
│   ├── types.ts                     # Note, Board, Connection, ActivityLogEntry, etc.
│   └── preference.types.ts          # UserPreferences, UpdatePreferencesPayload
├── utilities/
│   └── utils.ts                     # getColorClass() — maps color name → hex
└── lib/
    └── utils.ts                     # cn() class merging (clsx + tailwind-merge)
```

## Component Architecture

### App.tsx
- Bootstraps boards, loads notes for the active board
- Manages global UI state: active board, zoom, pan, canvas color, dialog open states
- Wires `useResurfacing` for the "Remember this?" toast interval
- Renders `BoardCanvas`, `Toolbar`, `CanvasControls`, `CommandPalette`, `InsightsDashboard`
- Deduplicates the `Toolbar` JSX using a `const toolbar` variable rendered in both the loading and main branches

### Card.tsx (Base Card)
- All card types (`NoteCard`, `IdeaCard`, `PlanCard`) are thin wrappers that compose `Card`
- `Card` owns drag logic via native pointer events (not Framer Motion drag controls)
  - `useMotionValue` for render-free position updates during drag
  - Pointer capture for reliable cross-element drag tracking
  - Debounced keyboard-arrow movement with 500ms save delay
- Content edit on `<textarea>` with blur-to-save; delete-if-empty-on-blur with `hasUserInteracted` guard
- Footer: Archive/Restore, Move-to-Board, Type toggle (note → idea → plan → note)
- Idea/plan extras: `NextTimeNotes`, `IdeaTimeline`, Graduate-to-Plan button (idea only)

### BoardCanvas.tsx
- CSS `transform: scale(zoom) translate(pan)` applied to a single div containing all cards
- Connection SVG lines rendered as an overlay inside the transform
- Double-click to create a new card at the canvas coordinate

### Toolbar.tsx
- Board switcher tabs, search bar, `ThemeSwitcherPopover`, Insights button, resurfacing prefs
- `CommandPalette` triggered by `⌘K` / `Ctrl+K`

## State Management

### Server State (TanStack Query)
| Query Key | Data |
|-----------|------|
| `['notes', boardId]` | Notes for the active board |
| `['boards']` | All boards |
| `['preferences', userId]` | User preferences (theme, resurface frequency, default board) |
| `['connections', boardId]` | Connections for the active board |
| `['connection-suggestions', boardId]` | Auto-connection suggestions |
| `['activity-log', noteId]` | Activity log for a note |
| `['next-time-notes', noteId]` | Next-time notes for a note |
| `['analytics']` | Lifecycle analytics (fetched only when insights dialog is open) |
| `['resurface']` | Current resurface candidate |

### Local State
- Active board ID, zoom level, pan offset — `App.tsx` React state
- Drag position — Framer Motion `useMotionValue` (no re-renders during drag)
- Dialog open states — `App.tsx` React state
- Z-index order — `useZIndexManager` hook

### Optimistic Updates
All mutations follow the same pattern:
1. `onMutate` — cancel in-flight queries, snapshot previous data, apply optimistic update
2. `onError` — roll back to snapshot
3. `onSettled` — invalidate query to sync with server

## Custom Hooks

| Hook | Responsibility |
|------|---------------|
| `useNoteMutations` | `addNote`, `editNote`, `updatePosition`, `updateColor`, `updateTextColor`, `deleteNote`, `archiveNote`, `restoreNote`, `changeType`, `graduateToPlain`, `moveToBoard` |
| `useBoardMutations` | `createBoard`, `deleteBoard`, `renameBoard` |
| `useConnections` | `acceptConnection`, `deleteConnection` queries/mutations |
| `useConnectionSuggestions` | Polls for keyword-based auto-connection suggestions |
| `usePreferences` | `setTheme`, `setResurfaceFrequency`, `setDefaultBoard` mutations + preferences query |
| `useTheme` | Reads `preferences.theme`, applies CSS class to `<html>`, falls back to system preference |
| `useResurfacing` | Fires a resurface toast on a configurable interval based on `resurfaceFrequency` preference |
| `useActivityLog` | Queries `GET /api/notes/:id/activity` |
| `useNextTimeNotes` | CRUD for next-time notes |
| `useZIndexManager` | `bringToFront(id)`, normalises indices when exceeding 1000 |

## Theme System

Seven CSS themes are defined as custom property blocks in `index.css`. `useTheme` applies one theme class to `<html>` based on `preferences.theme` (or system `prefers-color-scheme` as fallback). All theme variables follow the Tailwind CSS 4 `@theme inline` mapping pattern.

Themes: `theme-purple-workshop`, `theme-amethyst-night`, `theme-grape-noir`, `theme-warm-purple`, `theme-dusty-violet`, `theme-lavender-cream`, `theme-warm`.

## Build & Scripts

```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # tsc + vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```
