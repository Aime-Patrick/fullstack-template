# create-fullstack-template

Interactive installer CLI for the fullstack template.

## Usage

```bash
npx create-fullstack-template my-app
```

The installer will:

- download template from `Aime-Patrick/fullstack-template`
- let you choose mode: fullstack / backend / frontend
- let you choose package manager: `pnpm` (default) or `npm`
- ask for backend/frontend ports
- ask whether to use `inmemory` or `prisma` DB provider
- create:
  - `backend/.env`
  - `frontend/.env.local`
- optionally install dependencies and run Prisma setup
