# Idea Canvas 🎨

A modern, collaborative workspace for organizing notes, ideas, and plans on an infinite canvas. Features intelligent auto-connections powered by AI to help you discover relationships between your thoughts.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 🚀 **Live Demo:** [Coming Soon]

## ✨ Features

### 🗂️ Multi-Board Workspace
- Create unlimited boards to organize different projects
- Quick board switching with visual board selector
- Set default board preferences
- Color-coded board indicators

### 📝 Flexible Card System
- **Notes** - Capture quick thoughts and information
- **Ideas** - Brainstorm and explore concepts  
- **Plans** - Organize actionable tasks
- Drag and drop cards anywhere on infinite canvas
- Customizable colors and text formatting
- Archive/restore functionality

### 🎯 Infinite Canvas
- Pan and zoom with mouse/trackpad
- Keyboard shortcuts for navigation (WASD, arrow keys)
- "Fit to Content" view to see all cards at once
- "Reset Home" to return to canvas origin
- Smooth animations with Framer Motion

### 🔍 Powerful Search
- Command palette (Cmd/Ctrl + K) for quick access
- Search across all boards and card types
- Instant navigation to search results
- Highlights selected cards with visual glow

### 🔗 Smart Connections
- **Auto-Connection Engine** - Automatically suggests related cards
- **AI-Powered Analysis** - Uses OpenAI GPT-4o-mini for semantic understanding
- **Visual Connection Lines** - Curved SVG lines show relationships
- **Confidence Scoring** - See how strong each connection is
- **Relationship Types** - Identifies prerequisites, complements, cause-effect, etc.
- **Interactive UI** - Accept/reject suggestions with toast feedback
- **Persistent Rejections** - Dismissed suggestions stay hidden

### 🎨 Beautiful UI
- Modern glassmorphism design
- Smooth animations and transitions
- Responsive and accessible
- Built with shadcn/ui and Tailwind CSS

## 📸 Screenshots

> Screenshots will be added here

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling
- **Framer Motion** - Smooth animations
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Sonner** - Toast notifications

### Backend
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Reliable relational database
- **Sequelize** - ORM for database operations
- **OpenAI API** - AI-powered connection suggestions
- **TypeScript** - End-to-end type safety

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/KT-afk/idea-canvas.git
cd idea-canvas
```

### 2. Set up the database
```bash
# Create PostgreSQL database
createdb notes_db

# Or using psql
psql -c "CREATE DATABASE notes_db;"
```

### 3. Configure backend
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
```

**Required environment variables:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_db
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Optional: Enable AI-powered connections
AI_ENABLED=false
# OPENAI_API_KEY=sk-your-key-here
```

### 4. Start backend server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 5. Configure and start frontend
```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## 🎮 Usage

### Creating Cards
- **Double-click** on canvas to create a new note
- **Toolbar button** - Click "+" to add note/idea/plan
- **Keyboard shortcut** - Use command palette (Cmd+K)

### Moving Cards
- **Drag** cards with mouse
- **Keyboard** - Focus card, use arrow keys (Shift for faster movement)
- Cards auto-save position on drag end

### Organizing
- **Type Toggle** - Click badge to cycle: Note → Idea → Plan
- **Color Picker** - Change background and text colors
- **Archive** - Hide cards without deleting
- **Delete** - Permanently remove with confirmation

### Finding Connections
1. Click **sparkle icon** (✨) in toolbar
2. Review suggested connections with confidence scores
3. Click **Accept** to create connection (shows visual line)
4. Click **Reject** to dismiss (won't show again)
5. Hover over lines to see connection reason
6. Click lines to delete connections

### Navigation
- **Pan** - Click and drag canvas background, or hold Space + drag
- **Zoom** - Mouse wheel up/down
- **Keyboard** - Arrow keys or WASD
- **Fit Content** - Cmd/Ctrl + 1
- **Reset Home** - Cmd/Ctrl + 0 or press H
- **Search** - Cmd/Ctrl + K

## 🤖 AI-Powered Connections (Optional)

Enable intelligent connection suggestions using OpenAI GPT-4o-mini:

1. Get API key from https://platform.openai.com/api-keys
2. Add to `backend/.env`:
   ```env
   AI_ENABLED=true
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart backend server

**Cost:** ~$0.0002 per analysis (very affordable for personal use)

See [AI_CONNECTIONS_SETUP.md](AI_CONNECTIONS_SETUP.md) for detailed setup guide.

## 📁 Project Structure

```
idea-canvas/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── connections/ # Connection UI components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript definitions
│   │   └── utilities/       # Helper functions
│   └── package.json
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── models/          # Sequelize models
│   │   └── config/          # Configuration
│   └── package.json
├── docs/                     # Documentation
│   └── planning/            # Development notes
└── README.md
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend linting
cd frontend
npm run lint
```

## 🚢 Deployment

### Recommended Stack (Free Tier)
- **Database:** Supabase PostgreSQL
- **Backend:** Render Web Service (free with cold starts) or Fly.io (no cold starts)
- **Frontend:** Vercel

See deployment guides in `/docs` for detailed instructions.

## 🛣️ Roadmap

### Completed ✅
- [x] Multi-board system with preferences
- [x] Drag-and-drop infinite canvas
- [x] Note/Idea/Plan card types
- [x] Archive and restore
- [x] Command palette search
- [x] Auto-connection engine
- [x] AI-powered suggestions (OpenAI)
- [x] Visual connection lines (SVG)
- [x] Real-time updates

### Planned 🔮
- [ ] Real-time collaboration
- [ ] Card templates
- [ ] Export to PDF/PNG
- [ ] Mobile app (React Native)
- [ ] Dark mode toggle
- [ ] Card tags and filters
- [ ] Batch operations
- [ ] Keyboard shortcuts guide
- [ ] Undo/redo

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Query](https://tanstack.com/query/latest) - Data fetching
- [OpenAI](https://openai.com/) - AI-powered features
- Icons by [Lucide](https://lucide.dev/)

## 📧 Contact

**GitHub:** [@KT-afk](https://github.com/KT-afk)

---

**Built with ❤️ using React, TypeScript, and PostgreSQL**
