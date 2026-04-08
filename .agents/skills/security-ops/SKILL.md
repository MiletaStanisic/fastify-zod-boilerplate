# security-ops

## Purpose

Apply baseline security and operational hygiene for production-grade APIs.

## Rules

1. Keep security headers, CORS policy, and rate-limit strategy explicit.
2. Never log secrets or raw credentials.
3. Validate authorization assumptions for all mutation endpoints.
4. Define health/readiness checks for container orchestration.
5. Prefer least-privilege service configuration in local/prod environments.
