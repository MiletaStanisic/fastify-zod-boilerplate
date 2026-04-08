# api-contracts

## Purpose

Keep HTTP contracts explicit, stable, and frontend-friendly.

## Rules

1. Define request/response schemas before route implementation.
2. Use predictable envelope fields for list/pagination metadata.
3. Preserve status codes semantics (`2xx` success, `4xx` client, `5xx` server).
4. Keep route naming resource-oriented and version-ready.
5. Update README examples when contract changes.
