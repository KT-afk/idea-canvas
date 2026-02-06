# API Contracts - Idea Canvas

## Overview

The Idea Canvas backend exposes a REST API for managing notes and boards. All endpoints are prefixed with `/api` and communicate using JSON.

## Base Configuration

| Property | Value |
|----------|-------|
| Base URL | `http://localhost:3000/api` (development) |
| Content-Type | `application/json` |
| Authentication | None (public API) |

## Endpoints

### Health Check

```
GET /health
```

**Description:** Health check endpoint for monitoring and load balancers.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Notes API

#### Get All Notes

```
GET /api/notes
```

**Description:** Retrieves all notes in the system.

**Response (200 OK):**
```json
{
  "result": [
    {
      "id": "uuid-string",
      "content": "Note content",
      "x": 100.00,
      "y": 200.00,
      "width": 192.00,
      "height": 96.00,
      "color": "yellow",
      "textColor": "black",
      "boardId": null,
      "zIndex": 0,
      "CREATEDAT": "2026-01-21T00:00:00.000Z",
      "UPDATEDAT": "2026-01-21T00:00:00.000Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to delete note."
}
```

---

#### Create Note

```
POST /api/notes
```

**Description:** Creates a new note with the provided data.

**Request Body:**
```json
{
  "content": "New Note",
  "x": 100,
  "y": 200,
  "width": 192,        // optional, default: 192
  "height": 96,        // optional, default: 96
  "color": "yellow",   // optional, default: "yellow"
  "textColor": "black" // optional, default: "black"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "note": {
    "id": "generated-uuid",
    "content": "New Note",
    "x": 100,
    "y": 200,
    "width": 192,
    "height": 96,
    "color": "yellow",
    "textColor": "black",
    "boardId": null,
    "zIndex": 0,
    "CREATEDAT": "2026-01-21T00:00:00.000Z",
    "UPDATEDAT": "2026-01-21T00:00:00.000Z"
  }
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to insert note."
}
```

---

#### Update Note

```
PUT /api/notes/:id
```

**Description:** Updates an existing note. Supports partial updates.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Note identifier |

**Request Body (all fields optional):**
```json
{
  "content": "Updated content",
  "x": 150,
  "y": 250,
  "width": 200,
  "height": 100,
  "color": "blue",
  "textColor": "white"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "content": "Updated content",
  "x": 150,
  "y": 250,
  "width": 200,
  "height": 100,
  "color": "blue",
  "textColor": "white",
  "boardId": null,
  "zIndex": 0,
  "CREATEDAT": "2026-01-21T00:00:00.000Z",
  "UPDATEDAT": "2026-01-21T01:00:00.000Z"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to update note."
}
```

---

#### Get Notes by Board

```
GET /api/notes/board/:boardId
```

**Description:** Retrieves all notes belonging to a specific board.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| boardId | UUID | Board identifier |

**Response (200 OK):**
```json
[
  {
    "id": "uuid-string",
    "content": "Board note",
    "x": 100,
    "y": 200,
    "boardId": "board-uuid",
    ...
  }
]
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch notes."
}
```

---

#### Delete Note

```
DELETE /api/notes/:id
```

**Description:** Permanently deletes a note.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Note identifier |

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to delete note."
}
```

---

## Data Types

### Note Object

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | Auto | Generated | Unique identifier |
| content | string | Yes | - | Note text content |
| x | decimal(10,2) | Yes | - | X coordinate |
| y | decimal(10,2) | Yes | - | Y coordinate |
| width | decimal(5,2) | No | 192 | Note width in pixels |
| height | decimal(5,2) | No | 96 | Note height in pixels |
| color | string | No | "yellow" | Background color name |
| textColor | string | No | "black" | Text color name |
| boardId | UUID | No | null | Parent board ID |
| zIndex | integer | No | 0 | Layer ordering |
| CREATEDAT | timestamp | Auto | Now | Creation timestamp |
| UPDATEDAT | timestamp | Auto | Now | Last update timestamp |

### Available Colors

Background and text colors can be any of:
- `yellow`, `red`, `blue`, `green`, `purple`, `orange`, `pink`
- `teal`, `indigo`, `lime`, `rose`, `cyan`, `amber`, `emerald`
- `violet`, `fuchsia`, `classicRed`, `classicBlue`, `classicGreen`
- `white`, `black`, `gray`

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 500 | Internal Server Error |

Error responses include:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Local backend)
- `FRONTEND_URL` environment variable
- Any `*.vercel.app` domain (preview deployments)

Credentials are allowed via `credentials: true`.

---

## Frontend Client Usage

The frontend uses a service layer (`notesService.ts`) that wraps these endpoints:

```typescript
// Base URL from environment
const API_URL = import.meta.env.VITE_API_URL || "";

// Available functions:
fetchNotes()           // GET /api/notes
createNote(note)       // POST /api/notes
updateNote(id, payload) // PUT /api/notes/:id
deleteNote(id)         // DELETE /api/notes/:id
fetchNotesByBoard(id)  // GET /api/notes/board/:id
```
