# DayBlocks 🕒📖

DayBlocks is a configurable time-based diary/journal application built with **React**, **TypeScript**, **Fastify**, **Prisma**, and **PostgreSQL**.

Unlike traditional diaries where one date equals one large text entry, DayBlocks allows users to divide their day into customizable time blocks (30 min, 1 hour, custom sections, or breaks) and write dedicated journal entries with autosave for each block.

---

## 🌟 Key Features

- **Timeline Generation Algorithm**: Mode A (Fixed Duration), Mode B (Number of Sections), Mode C (Fully Custom)
- **First-class Breaks**: Insert lunch, coffee, or custom breaks without breaking your timeline
- **Rich Text Journal Editor**: TipTap rich text editor with auto-save (debounced), moods, and tags
- **Visual Progress Bar**: See real-time progress through your day
- **Reusable Templates**: Save and apply day configurations (Work Day, Focus Day, Pomodoro, Weekend)
- **Search & Insights**: Search across entries by title, content, or tags; view streak and hour-of-day analytics
- **Responsive & Dark Mode**: Modern dark/light UI with compact mobile cards and spacious desktop timeline

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TipTap, Recharts, Zustand |
| Backend | Node.js, TypeScript, Fastify, Zod |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT + Argon2 password hashing |
| Testing | Vitest (Unit & API) |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL or Docker

### 2. Database Setup (Docker Compose)
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Demo Credentials:**
- **Email**: `demo@dayblocks.app`
- **Password**: `demo1234`

---

## 🧪 Running Tests

```bash
# Run backend timeline algorithm unit tests
cd backend
npm test
```
