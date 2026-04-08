# AGENTS

## Scope

This repository is a backend-only Node.js boilerplate. Keep implementation production-oriented and demo-ready.

## Non-negotiable rules

1. Keep TypeScript `strict` compatible.
2. Do not bypass validation for request payloads and env variables.
3. Preserve clean architecture boundaries (`config`, `routes`, `services`, `store`).
4. Every change must keep `lint`, `test`, and `build` green.
5. Never commit secrets or `.env` files.

## Required checks before merge

```bash
npm run skills:verify
npm run lint
npm run test
npm run build
```

## Required skill set

- Local backend skills (required):
  - `.agents/skills/backend-governance/SKILL.md`
  - `.agents/skills/api-contracts/SKILL.md`
  - `.agents/skills/validation-and-errors/SKILL.md`
  - `.agents/skills/data-layer/SKILL.md`
  - `.agents/skills/testing-quality/SKILL.md`
  - `.agents/skills/security-ops/SKILL.md`
- Vendor skill packs are optional and controlled through `skills-lock.json`.

## Working agreement for assistants

1. Read this file and all required local skill files before coding.
2. If requested behavior conflicts with these guardrails, propose a safe alternative first.
3. Keep commits small and explain architecture-impacting decisions in PR notes.
