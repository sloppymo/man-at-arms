# Legacy `js/` Tree (Read-Only)

This directory is legacy Phase 1 code and is not the active runtime stack.

- Canonical application code lives under `src/` (Vite root).
- Do not add new features or fixes in `js/`.
- Do not add imports from `src/` into `js/`, or from `src/` to `js/`.
- Keep this tree only for historical reference during migration.

Enforcement:
- CI runs `npm run guard:legacy-imports` to block `src/` imports that target `js/`.
