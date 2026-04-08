# Fullstack Template (Next.js + NestJS)

Production-ready starter template with:

- Next.js (App Router), Tailwind CSS, reusable shadcn-style UI components
- NestJS REST API with modular architecture
- JWT authentication and protected routes
- Reusable CRUD module example (`items`)

## Project Structure

```text
fullstack-template/
  backend/     # NestJS API
  frontend/    # Next.js app
```

## Features Included

- Auth: register, login, logout, `/auth/me`
- Password hashing with `bcrypt`
- Backend route protection with JWT guard
- Frontend route protection with middleware + auth token cookie
- Dashboard layout with responsive sidebar + navbar
- Items CRUD (create/read/update/delete)
- Global backend exception filter
- Frontend global error boundary (`app/error.tsx`)
- Loading UI with skeletons (`dashboard/items/loading.tsx`)

## Setup

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Backend runs on `http://localhost:3000`.

### 2) Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on `http://localhost:3001` (or default Next.js port).

## API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout` (protected)
- `GET /auth/me` (protected)

### Items (Protected)

- `GET /items`
- `GET /items/:id`
- `POST /items`
- `PATCH /items/:id`
- `DELETE /items/:id`

## Notes

- Current storage is in-memory for template simplicity.
- Data access is already abstracted behind repository tokens:
  - `USERS_REPOSITORY` in `backend/src/users/users.repository.ts`
  - `ITEMS_REPOSITORY` in `backend/src/items/items.repository.ts`
- To reuse in other projects with a database, create Prisma/TypeORM repository classes and change the provider mapping in:
  - `backend/src/users/users.module.ts`
  - `backend/src/items/items.module.ts`
