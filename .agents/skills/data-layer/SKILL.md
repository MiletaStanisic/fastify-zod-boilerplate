# data-layer

## Purpose

Keep persistence logic explicit and easy to migrate across storage engines.

## Rules

1. Encapsulate persistence calls in service/repository modules.
2. Avoid leaking DB-specific types into route/controller layers.
3. Prefer idempotent writes for retry-safe operations.
4. Include index and query-shape considerations in design notes.
5. Document required migrations and seed updates.
