# backend-governance

## Purpose

Apply strict backend engineering defaults for Node.js services in this repo.

## Guardrails

1. Use schema validation for all external input (HTTP payloads, query params, env).
2. Keep route/controller layers thin; business rules live in service modules.
3. Emit structured JSON responses and stable error codes.
4. Write or update tests for behavior changes.
5. Keep latency-sensitive paths free of unnecessary allocations and blocking IO.

## Required runbook

1. `npm run skills:verify`
2. Implement minimal, reviewable change.
3. `npm run lint && npm run test && npm run build`
4. Document any new env vars in README.
