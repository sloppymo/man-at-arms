# Runtime Stabilization Notes

## Logger Usage (`runtime_log.gd`)
- `RuntimeLog.debug(message)`:
  - Emits only in debug builds.
  - Use for high-frequency diagnostics (transition traces, pool internals).
- `RuntimeLog.info(message)`:
  - Emits in all builds.
  - Use for important runtime milestones.
- `RuntimeLog.warn(message)`:
  - Emits warning-level diagnostics.
  - Use for recoverable problems.
- `RuntimeLog.error(message)`:
  - Emits error-level diagnostics.
  - Use for serious runtime issues that do not require a crash.

`push_warning` and `push_error` are still used directly where callsites already provide explicit engine warnings/errors.

## Runtime Service Helper (`runtime_services.gd`)
- Use `RuntimeServices` accessors instead of direct `"/root/..."` lookups in runtime scripts:
  - `game_modes(context)`
  - `game_state(context)`
  - `event_bus(context)`
  - `audio_manager(context)`
  - `particle_manager(context)`
- Accessors return `Node` or `null`, and safely handle missing tree/root context.

## Startup Validator (`startup_validator.gd`)
- `StartupValidator.validate_once(context)` runs a one-time non-fatal startup check.
- Validation covers:
  - Required autoload availability: `GameModes`, `GameState`, `EventBus`, `AudioManager`, `ParticleManager`.
  - Critical runtime assets (audio + core combat/overworld sprites/effects/map).
- On failures:
  - Logs warnings/errors only.
  - Does not hard-crash startup flow.

## Save Recovery (`game_state.gd`)
- Save load path now validates JSON parse + payload root type before applying data.
- Corrupt/invalid save files are quarantined instead of deleted:
  - `user://savegame.json` -> `user://savegame.json.corrupt-<timestamp>`
  - Collision-safe suffixing is applied when needed.
- Load then continues with defaults (deterministic baseline).
- Schema merge behavior remains backward-compatible:
  - Missing fields are filled from defaults.
  - Unknown extra fields are preserved.
