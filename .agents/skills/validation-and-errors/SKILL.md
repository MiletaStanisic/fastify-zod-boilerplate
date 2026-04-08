# validation-and-errors

## Purpose

Enforce strict input validation and deterministic error handling.

## Rules

1. Validate all `body`, `query`, `params`, and env input with schemas.
2. Return stable machine-readable error codes.
3. Never leak stack traces in production responses.
4. Keep validation messages concise and actionable.
5. Add tests for at least one invalid input per endpoint.
