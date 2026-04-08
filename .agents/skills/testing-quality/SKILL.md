# testing-quality

## Purpose

Maintain reliable behavior through meaningful backend tests.

## Rules

1. Cover happy path, validation failures, and key business invariants.
2. Keep tests deterministic (no time/order randomness without control).
3. Prefer scenario-focused tests over implementation-coupled assertions.
4. Add regression tests when fixing defects.
5. Keep test runtime fast enough for PR feedback loops.
