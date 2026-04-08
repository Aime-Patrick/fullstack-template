# Backend (NestJS)

This backend provides:

- JWT authentication (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`)
- Protected items CRUD (`/items`)
- DTO validation and global exception handling
- Repository abstractions for reusable data layer swaps

## Environment

Copy and configure:

```bash
cp .env.example .env
```

Required values:

- `PORT` (default `3000`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default `1d`)
- `CORS_ORIGIN` (default `http://localhost:3001`)

## Development

```bash
npm install
npm run start:dev
```

## Quality checks

```bash
npm run lint
npm run build
```

## Reusability note

Current persistence is in-memory. To switch to Prisma/TypeORM:

- implement `UsersRepository` in `src/users/users.repository.ts`
- implement `ItemsRepository` in `src/items/items.repository.ts`
- remap providers in `src/users/users.module.ts` and `src/items/items.module.ts`
