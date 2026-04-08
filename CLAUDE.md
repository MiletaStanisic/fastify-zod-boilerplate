# CLAUDE

Use this repo as a strict backend starter, not as a throwaway prototype.

## Execution policy

1. Follow `AGENTS.md` and `.agents/skills/backend-governance/SKILL.md`.
2. Run `npm run skills:verify` before substantial code edits.
3. Validate all request bodies and environment variables with schemas.
4. Keep handlers thin; move business logic to dedicated modules.
5. Before finalizing, run:

```bash
npm run lint
npm run test
npm run build
```
