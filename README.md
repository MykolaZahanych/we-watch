# We Watch

A shared movie watchlist app for couples to track films they've watched or plan to watch, with ratings and more.

## Project Structure

This project consists of two separate applications:

- **backend/** - Node.js + Express + Prisma backend API
- **frontend/** - React + Vite frontend

## Getting Started

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Database Setup

1. Install PostgreSQL
2. Create database: `createdb wewatch`
3. Run migrations: `cd backend && npm run prisma:migrate`
