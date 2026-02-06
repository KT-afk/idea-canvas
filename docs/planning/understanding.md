# Understanding Idea Canvas: Architecture & Implementation Guide

> **Purpose:** This document serves as a "mental map" for developers and AI agents to understand the codebase structure, logic flow, and key implementation details of the Idea Canvas project. It is designed to help you maintain autonomy and deep understanding while collaborating with AI.

---

## 1. The Mental Model: How It Works

Think of the application as a cycle of three distinct layers. Data flows in a loop from the user's action to the database and back.

### The Cycle of a Feature
1.  **User Layer (Frontend UI):**
    *   **"Dumb" Components:** Purely visual (e.g., `Button.tsx`, `Dialog.tsx`).
    *   **"Smart" Components:** Handle logic (e.g., `BoardSwitcher.tsx`, `NoteCard.tsx`).
    *   **Action:** The user clicks "Create Board".

2.  **The Bridge (State & Network):**
    *   **Custom Hooks:** (e.g., `useBoardMutations.ts`) Manage state and side effects.
    *   **TanStack Query:** The engine for **Optimistic UI**. It updates the screen *immediately* (before the server responds) to make the app feel instant.
    *   **Service Layer:** (e.g., `boardsService.ts`) Simple functions that fetch data from the API.

3.  **The Engine (Backend & Data):**
    *   **Routes:** (e.g., `boards-route.ts`) The traffic controller. Validates input (e.g., "Is name empty?").
    *   **Services:** (e.g., `boards-service.ts`) The brain. Executes business logic (e.g., "If deleting board, move notes to fallback").
    *   **Models:** (e.g., `BOARDS.ts`) The blueprint. Defines the database structure.

---

## 2. File Map: Where Code Lives

To modify a feature, touch these files in this order.

### 🟢 Feature: Board Management (Create, Rename, Delete)

| Layer | File Path | Role |
| :--- | :--- | :--- |
| **UI** | `frontend/src/components/BoardSwitcher.tsx` | Main hub for board list & actions. |
| **UI** | `frontend/src/components/NewBoardDialog.tsx` | Form for creating a board. |
| **Hook** | `frontend/src/hooks/useBoardMutations.ts` | Handles the optimistic update logic. |
| **Service** | `frontend/src/services/boardsService.ts` | API fetch calls. |
| **Route** | `backend/src/routes/boards-route.ts` | Validates HTTP requests. |
| **Logic** | `backend/src/services/boards-service.ts` | **Critical:** Handles safety checks & fallbacks. |
| **DB** | `backend/src/models/BOARDS.ts` | Database schema definition. |

### 🟡 Feature: Notes (Create, Drag, Edit)

| Layer | File Path | Role |
| :--- | :--- | :--- |
| **UI** | `frontend/src/components/NoteCard.tsx` | The visual sticky note. |
| **UI** | `frontend/src/components/BoardCanvas.tsx` | The infinite drag area. |
| **Hook** | `frontend/src/hooks/useNoteMutations.ts` | Handles auto-save & drag sync. |
| **Logic** | `backend/src/services/notes-service.ts` | CRUD operations for notes. |
| **DB** | `backend/src/models/NOTES.ts` | Schema (includes Coordinates & Colors). |

---

## 3. Key Implementation Concepts ("The Secret Sauce")

### A. Optimistic UI (The "Fast" Feel)
*   **Concept:** We don't wait for the server. We verify later.
*   **Where:** `frontend/src/hooks/*.ts`
*   **Mechanism:**
    1.  User drags note.
    2.  `onMutate`: Cancel outgoing refetches, snapshot previous state, update UI *instantly*.
    3.  `onError`: If server fails, roll back to the snapshot.
    4.  `onSettled`: Refetch to ensure total sync.

### B. Soft Deletion (The Safety Net)
*   **Concept:** Never actually delete data unless requested (Hard Delete).
*   **Where:** `backend/src/services/boards-service.ts`
*   **Mechanism:**
    *   We set a `deletedAt` timestamp.
    *   The `getAllBoards` query filters out anything where `deletedAt` is not null.
    *   This allows for "Undo" functionality.

### C. Coordinate Precision (The Infinite Canvas)
*   **Concept:** Standard floats cause rounding errors on massive canvases.
*   **Where:** `backend/src/models/NOTES.ts`
*   **Mechanism:** `DataType.DECIMAL(10, 2)`
    *   Allows coordinates up to `99,999,999.99`.
    *   Ensures notes don't "drift" by a pixel when you drag them repeatedly.

---

## 4. How to Collaborate with AI Autonomously

To maintain control while using AI, follow this workflow:

### Step 1: Request a Plan, Not Code
*   **Don't ask:** "Write the code for feature X."
*   **Ask:** "Propose a plan to implement feature X. List the files you will touch and the logic you will change."
*   **Why:** This forces the AI to reveal its "Mental Model" before it touches your code.

### Step 2: Verify the "Golden Path"
*   Before accepting changes, trace the request:
    *   *UI Component -> Hook -> Service -> Backend Route -> Backend Service -> Model*
*   If the AI skips a layer (e.g., putting database logic in the Route), reject it.

### Step 3: Audit the "Brain" Files
*   Focus your review energy on the **Backend Service** files (e.g., `boards-service.ts`).
*   This is where 90% of bugs (and business logic errors) will hide. The UI is just a display; the Service is the truth.

### Step 4: Use Verification Scripts
*   Ask the AI to generate a `verify_feature.sh` script (like the one created for Epic 3).
*   Running a script allows you to see the *results* of the code without getting lost in the syntax.

---

## 5. Verification Checklist
Use this to "sign off" on any new feature.

1.  [ ] **UI:** Does it update instantly (Optimistic)?
2.  [ ] **Error Handling:** What happens if the network fails? (Toast/Rollback)
3.  [ ] **Validation:** Does the Backend reject bad data (empty names, etc.)?
4.  [ ] **Data Integrity:** Are orphaned records handled? (e.g., Notes moved when Board deleted)
5.  [ ] **Tests:** Did the unit tests pass? (`npm test`)

