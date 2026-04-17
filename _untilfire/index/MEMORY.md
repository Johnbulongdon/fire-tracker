# UntilFire Memory Index

## What exists

| File | When to load |
|---|---|
| `state/current.md` | ALWAYS — load first |
| `core/product.md` | Architecture, data flow, onboarding, dashboard |
| `core/decisions.md` | Why something was built a specific way |

## What to ignore

- Do not load `core/` files for UI-only or copy changes
- Do not load `core/decisions.md` unless debugging a non-obvious design choice

## Priority order

1. `state/current.md` — what is happening now
2. `core/product.md` — what the product is
3. `core/decisions.md` — why it was built that way

## Hard limits

- Max 5 files per session
- If a file hasn't been updated in >2 weeks, treat as stale — ask before relying on it
