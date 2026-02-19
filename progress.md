Original prompt: PLEASE IMPLEMENT THIS PLAN: Two-PR Remediation Plan: Web Test Reliability + Deploy Determinism (PR1 immediate blockers + PR2 follow-up hygiene).

## Completed
- PR1 web test/runtime remediation implemented:
  - Jest/Babel config normalization and script wiring updates.
  - `overworld.` variable parsing fix (`substring(10)` via prefix-length constant) and mirrored test/mock fixes.
  - Smoke harness rebuilt around active-story discovery + explicit skiplist.
  - Pages workflows consolidated to canonical `.github/workflows/deploy.yml`.
  - Docs updated for current test/deploy truth.
- PR2 hygiene implemented:
  - Test-runner scene coordinator/manual-start flow in place.
  - `AutomatedCITests` now attaches helper nodes safely (`call_deferred`) and performs owned-node teardown/disconnect.
  - `EdgeCaseTests` switched to manual-start mode with explicit `start()` and lifecycle guards.
  - `PerformanceBenchmark` now tracks/stops monitor timer and frees test player on exit.
  - Legacy governance guard + `js/README.md` added.

## Validation (latest run)
- Web:
  - `npm run build`: PASS
  - `npm run dev -- --host 127.0.0.1 --port 3005` (timeout run): booted successfully
  - `npm test -- --runInBand`: PASS
  - `npm run test:smoke`: PASS
  - `npm run test:basic`: PASS
  - `npm run test:working`: PASS
  - `npm run test:cjs`: PASS
  - `npm run unit-tests`: PASS
- Godot:
  - `bash godot-project/scripts/run_headless_smoke.sh`: PASS
  - `flatpak run org.godotengine.Godot --path godot-project --script res://scripts/desktop_rapid_flow_validation.gd --quit-after 30 --verbose`: PASS
  - `flatpak run org.godotengine.Godot --path godot-project --scene res://scenes/testing/test_runner_scene.tscn --quit-after 12 --verbose`: PASS (no `Parent node is busy...` errors; no `ObjectDB instances leaked at exit`)

## Notes
- Large pre-existing dirty worktree remains; changes were made non-destructively and without reverting unrelated files.
- Keep an eye on excluded legacy Jest suites if/when broadening default coverage.

## Branch split (2026-02-18)
- `pr1-web-test-deploy-determinism` -> `99e8336`
  - includes:
    - `6088c53` stabilize web test runtime and canonicalize pages deploy
    - `99e8336` add legacy import boundary guard artifacts
- `pr2-godot-hygiene-legacy-governance` -> `a1094a8`
  - includes all PR1 commits plus:
    - `a1094a8` harden godot test-runner lifecycle hygiene

Diff scopes:
- `main..pr1-web-test-deploy-determinism`: web test/deploy/runtime + docs + legacy guard artifacts
- `pr1-web-test-deploy-determinism..pr2-godot-hygiene-legacy-governance`: Godot test-runner lifecycle hygiene files only

## 2026-02-19 - Enemy dialog bark system
- Implemented a combat enemy dialog bark system in `godot-project/scenes/combat/enemy.gd`.
  - Added floating bark labels anchored above each enemy.
  - Added contextual bark triggers (`spawn`, `ambient`, `attack`, `hurt`) with random cadence and fade-out.
  - Added per-enemy opt-out via `enable_dialog_barks` export.
- Added bark tuning/data in `godot-project/scripts/combat_constants.gd`.
  - Timing/chance/style constants for bark behavior.
  - Common and enemy-type-specific bark line catalogs.
  - Helper accessor `get_enemy_dialog_bark_lines(type_name, bark_kind)`.
- Validation (post-change):
  - `bash godot-project/scripts/run_headless_smoke.sh`: PASS.
  - Ran develop-web-game Playwright client (`web_game_playwright_client.js`) against `http://127.0.0.1:3005` after installing Chromium runtime.
  - Playwright capture frames were fully black in this project baseline.
- Re-ran `bash godot-project/scripts/run_headless_smoke.sh` after final bark-timer cleanup: PASS.
- Product direction updated: treat Godot project as primary ship target.
- Added Godot web export preset (`godot-project/export_presets.cfg`) and generated deployable web build artifacts in `godot-project/build/web/`.
- Updated `StartupValidator` to use `ResourceLoader.exists/load` for packed Web exports.
- Updated `.github/workflows/deploy.yml` to deploy `godot-project/build/web` directly to GitHub Pages.
- Local browser smoke check for web export: PASS (no page/console errors after startup validator fix).
