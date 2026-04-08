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
- `DB_PROVIDER` (`inmemory` or `prisma`, default `inmemory`)
- `DATABASE_URL` (required when `DB_PROVIDER=prisma`)

## Development

```bash
pnpm install
pnpm run start:dev
```

## Quality checks

```bash
pnpm run lint
pnpm run build
```

## Custom module generator

Use the project generator to scaffold feature modules with your template pattern:

```bash
pnpm run generate:module
```

It asks for:

- module name (plural)
- whether routes are JWT-protected
- whether to include Prisma repository scaffold + `DB_PROVIDER` switching

Generated files include DTOs, interface, repository token/interface, in-memory repository, service, controller, and module.

## Prisma setup (PostgreSQL)

```bash
# set DB_PROVIDER=prisma in .env first
pnpm run prisma:generate
pnpm run prisma:migrate
```

## Reusability note

Current persistence is in-memory. To switch to Prisma/TypeORM:

- implement `UsersRepository` in `src/users/users.repository.ts`
- implement `ItemsRepository` in `src/items/items.repository.ts`
- remap providers in `src/users/users.module.ts` and `src/items/items.module.ts`
