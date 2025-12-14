# Idea Canvas

A beautiful, interactive sticky note application built with React, TypeScript, and Express. Organize your thoughts, ideas, and tasks with colorful, draggable notes on an infinite canvas.

## Features

### Core Functionality
- **Drag & Drop Notes** - Smooth, intuitive dragging with Framer Motion animations
- **Rich Color Palette** - Choose from 22 vibrant colors for note backgrounds and text
- **Infinite Canvas** - Unlimited space to organize your ideas
- **Auto-Save** - All changes automatically sync to the backend
- **Layering System** - Notes automatically come to front when clicked or dragged

### User Experience
- **Beautiful Design** - Authentic sticky note aesthetics with soft shadows and rounded corners
- **Optimized Dragging** - Drag handle restricted to top section, leaving text area fully editable
- **Hover Effects** - Notes lift on hover with deeper shadows for visual feedback
- **Responsive Interactions** - Smooth animations and transitions throughout

## Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Fluid animations and drag interactions
- **TanStack Query** - Powerful data synchronization and caching
- **Axios** - HTTP client for API requests
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon system

### Backend
- **Express 5** - Fast, minimalist web framework
- **TypeScript** - Type-safe backend code
- **Sequelize** - ORM for PostgreSQL
- **PostgreSQL** - Robust relational database
- **CORS** - Cross-origin resource sharing

## Project Structure

```
idea-canvas/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── NoteCard.tsx
│   │   │   ├── Popover.tsx
│   │   │   └── ui/        # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useNoteMutations.ts
│   │   │   └── useZIndexManager.ts
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utilities/     # Utility functions
│   └── package.json
│
├── backend/               # Express backend API
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Sequelize models
│   │   │   ├── NOTES.ts
│   │   │   └── BOARDS.ts
│   │   ├── routes/        # API routes
│   │   ├── migrations/    # Database migrations
│   │   └── index.ts       # Entry point
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/idea-canvas.git
   cd idea-canvas
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=idea_canvas
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb idea_canvas

   # Run migrations
   cd backend
   npm run db:migrate
   ```

5. **Start the development servers**

   In one terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## API Endpoints

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Boards (Coming Soon)
- Multi-board support for organizing different projects

## Key Implementation Details

### Drag Controls
The app uses Framer Motion's `useDragControls` to provide precise control over dragging behavior:
- Only the top 40px of each note is draggable
- Textarea and buttons remain fully interactive
- Prevents accidental dragging while editing text

### Optimistic Updates
TanStack Query handles optimistic UI updates:
- Immediate UI feedback when moving or editing notes
- Automatic rollback on errors
- Smart caching and synchronization

### Z-Index Management
Custom hook manages note layering:
- Notes automatically come to front when interacted with
- Maintains consistent z-index ordering
- Handles overflow by renormalizing indices

### Database Precision
PostgreSQL `DECIMAL(10,2)` columns support coordinates up to 99,999,999.99, enabling large canvas sizes.

## Development

### Running Tests
```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm test
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## Roadmap

- [ ] User authentication and authorization
- [ ] Multi-board support
- [ ] Keyboard shortcuts (Cmd+N, Delete)
- [ ] Confirmation dialogs for destructive actions
- [ ] Mobile/tablet responsive design
- [ ] Loading states and error boundaries
- [ ] Real-time collaboration
- [ ] Rich text editing
- [ ] Image attachments
- [ ] Search and filtering

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Built with modern web technologies and best practices. Special thanks to the open-source community for the amazing tools and libraries that made this project possible.
