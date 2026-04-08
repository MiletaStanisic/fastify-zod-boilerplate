# backend-fastify-zod-boilerplate

Fastify + TypeScript starter for backend demo apps with strict lint/test/build and agent governance.

## Quick start

```bash
npm install
npm run skills:sync
npm run skills:verify
npm run dev
```

## Scripts

- `npm run dev` starts local API on `PORT` (default `4000`)
- `npm run lint` runs ESLint
- `npm run format:check` validates Prettier formatting
- `npm run test` runs Vitest tests
- `npm run build` emits `dist/`
- `npm run skills:sync` pins Vercel agent skills from lockfile
- `npm run skills:verify` verifies locked skills + local governance skill

## API sample

- `GET /health`
- `GET /tasks`
- `POST /tasks` with `{ "title": "Ship demo" }`
