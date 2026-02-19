# Man-at-Arms Godot Development Guide (Godot 4.6)

## Purpose
This document is the engineering contract for Godot development in this repository.

It has two goals:
1. Define how we build and maintain game systems in Godot 4.6.
2. Give developers a curated, current learning path (official docs first) for Godot development.

This guide is intentionally practical: it describes what to do in this codebase now, and what to migrate later.

## Scope and Source of Truth
- Runtime truth for gameplay work: `godot-project/`
- Main scene: `res://scenes/landing_scene.tscn`
- Engine target: Godot 4.6-stable
- When docs conflict with runtime scripts/scenes, trust runtime scripts/scenes.

## Verification Window
External links and compatibility notes were re-checked on **February 19, 2026**.

---

## Official Learning Path (Recommended)
Start here before using third-party tutorials.

### Core onboarding
1. Introduction: https://docs.godotengine.org/en/stable/about/introduction.html
2. Step by step: https://docs.godotengine.org/en/stable/getting_started/step_by_step/
3. Your first 2D game: https://docs.godotengine.org/en/stable/getting_started/first_2d_game/index.html

### Core scripting and architecture
1. Using signals: https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html
2. GDScript style guide: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/gdscript_styleguide.html
3. Static typing in GDScript: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html
4. Scene organization: https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html
5. Project organization: https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html
6. Autoloads versus regular nodes: https://docs.godotengine.org/en/stable/tutorials/best_practices/autoloads_versus_internal_nodes.html
7. Singletons (Autoload): https://docs.godotengine.org/en/stable/tutorials/scripting/singletons_autoload.html

### Systems used in this project
1. Using TileSets: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html
2. Using TileMaps / TileMapLayer: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html
3. AStarGrid2D: https://docs.godotengine.org/en/stable/classes/class_astargrid2d.html
4. AStar2D: https://docs.godotengine.org/en/stable/classes/class_astar2d.html
5. Input events and InputMap usage: https://docs.godotengine.org/en/stable/tutorials/inputs/inputevent.html
6. Saving games: https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html

### Debugging, profiling, and shipping
1. Debugger panel: https://docs.godotengine.org/en/stable/tutorials/scripting/debug/debugger_panel.html
2. Profiler: https://docs.godotengine.org/en/stable/tutorials/scripting/debug/the_profiler.html
3. Exporting projects: https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html
4. Command line tutorial: https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html

### Official demos and curated tutorial index
1. Godot demo projects (GitHub): https://github.com/godotengine/godot-demo-projects
2. Web-playable official demos: https://godotengine.github.io/godot-demo-projects/
3. Community tutorials index (official docs page): https://docs.godotengine.org/en/stable/community/tutorials.html

---

## Project Context (Current)
This project is a migration from legacy web code to Godot.

Implemented gameplay loop in Godot includes:
- Overworld travel on a hex coordinate model
- Random encounter transition into combat
- Dialogue hotspot transitions
- Combat victory/defeat returning to game state
- Death scene flow

### Current architecture snapshot
- Mode control via autoload `GameModes`
- Persistent state via autoload `GameState`
- Event payload coordination via `EventBus`
- Combat in dedicated scene with player/enemy/projectile scripts
- Dialogue currently script-driven

---

## Engineering Rules for This Repository
Use these rules for all new code and refactors.

### Must
- Use typed GDScript for new gameplay code.
- Keep scene scripts focused (single-responsibility per script).
- Prefer signal-based communication over brittle node-path coupling.
- Keep controls and feel stable unless a task explicitly asks to retune them.
- Maintain headless test compatibility for gameplay changes.

### Should
- Minimize direct `/root/...` singleton lookups in low-level domain objects.
- Encapsulate mode transitions behind clear APIs (`GameModes`, event payloads).
- Use `Resource` models for static game data definitions.
- Keep per-frame allocations low and avoid expensive scene-tree scans in hot paths.

### May
- Use autoloads for broad cross-scene systems only when scope is truly global.
- Keep JSON save for now while migration path to `Resource`-based save is designed.

---

## Data and Save Architecture

### Current
- Save/load is JSON in `user://savegame.json`.

### Recommended direction
- Static definitions: `Resource`-based data (`ItemDef`, encounter defs, dialogue defs).
- Runtime state: either
  1. Continue JSON with strict schema/versioning and migration helpers, or
  2. Move to `ResourceSaver.save()` with nested resources for complex state.

### Practical policy now
- Do not break existing JSON saves without migration code.
- Add schema version checks for each structural change.
- Cover save/load round-trip in headless validation.

Reference: https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html

---

## Hex Overworld Standards

### Current implementation
- Axial-style coordinate dictionaries (`q`, `r`) with custom conversion/math.

### Guidance
- Keep gameplay logic in axial/cube-friendly coordinate math.
- If moving to editor-driven map workflows, prefer TileSet + TileMapLayer for authoring.
- For pathfinding, start with AStarGrid2D or AStar2D as needed before adopting heavier systems.

References:
- TileMaps: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html
- TileSets: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilesets.html
- AStarGrid2D: https://docs.godotengine.org/en/stable/classes/class_astargrid2d.html
- AStar2D: https://docs.godotengine.org/en/stable/classes/class_astar2d.html

---

## Dialogue Stack Guidance

### Current
- Script-driven dialogue scenes and branching UI.

### Target options
1. Keep script-driven branching for small scenes and deterministic tests.
2. Adopt Ink pipeline for scalable narrative authoring:
   - C# route: GodotInk
   - GDScript route: inkgd

### Ink integration references
- GodotInk (Godot 4, C#/.NET): https://github.com/paulloz/godot-ink
- inkgd (GDScript implementation): https://github.com/ephread/inkgd

---

## Combat Engineering Standards
- Preserve responsive input handling.
- Keep hit, collision, and push behavior physically consistent and directional.
- Prefer explicit collision-layer/mask design over ad hoc positional hacks.
- Validate changes both with synthetic harnesses and full scene flow.

### Combat Improvement Roadmap (Next)
Prioritize combat depth and readability without regressing current control feel.

#### Priority 1: Enemy readability pass
- Add clearer melee windup/read windows per enemy type (`grunt`, `heavy`, `archer`).
- Add stronger telegraph cues (color + timing + optional SFX) before damage frames.
- Files: `godot-project/scenes/combat/enemy.gd`, `godot-project/scripts/combat_constants.gd`
- Validation:
  - `flatpak run org.godotengine.Godot --headless --path godot-project --script res://scripts/combat_improvements_validation.gd`
  - `bash godot-project/scripts/run_headless_smoke.sh`

#### Priority 2: Combo payoff design
- Convert combo from UI-only to gameplay value (tiered damage/stagger/armor-break bonuses).
- Keep baseline attack responsiveness (no heavy animation lock).
- Files: `godot-project/scenes/combat/player.gd`, `godot-project/scenes/combat/combat_scene.gd`, `godot-project/scripts/combat_constants.gd`
- Validation:
  - Extend combat harness with combo tier assertions.
  - Re-run full smoke harness.

#### Priority 3: Shield skill ceiling
- Add a narrow perfect-block window while preserving standard hold-to-block behavior.
- Perfect block outcome examples: stronger stagger, projectile reflect, reduced shield HP loss.
- Files: `godot-project/scenes/combat/player.gd`, `godot-project/scenes/combat/projectile.gd`, `godot-project/scripts/combat_constants.gd`
- Validation:
  - Add harness checks for normal block vs perfect block outcomes.
  - Verify no regression for projectile interception.

#### Priority 4: Encounter pacing
- Improve short-fight pacing with controlled spawn pressure and type sequencing rules.
- Avoid sudden unfair spikes while retaining danger in the chevauchee fantasy.
- Files: `godot-project/scenes/combat/combat_scene.gd`, `godot-project/scripts/combat_constants.gd`
- Validation:
  - Keep weighted distribution tests and add wave/pacing sanity checks.

#### Priority 5: Combat feedback polish
- Harmonize hit-stop, stagger, camera shake, and audio layering for clearer impact hierarchy.
- Use profiler-guided limits to keep current performance envelope.
- Files: `godot-project/scenes/combat/player.gd`, `godot-project/scenes/combat/enemy.gd`, `godot-project/scripts/combat_constants.gd`
- Validation:
  - `flatpak run org.godotengine.Godot --headless --path godot-project --script res://scripts/combat_performance_harness.gd`
  - Optional GUI feedback pass: `flatpak run org.godotengine.Godot --path godot-project --script res://scripts/desktop_combat_feedback_validation.gd`

---

## Testing and Validation Policy

### Required for gameplay changes
Run all relevant checks before handoff.

#### Deterministic runtime release gate (primary)
```bash
bash godot-project/scripts/run_runtime_release_gate.sh
```

This is the canonical integrated validation for runtime changes. It runs smoke + regression suites and writes:
- Machine-readable summary: `godot-project/artifacts/runtime-gate/runtime_gate_summary.json`
- Human report: `godot-project/artifacts/runtime-gate/runtime_gate_report.md`
- Step logs: `godot-project/artifacts/runtime-gate/logs/`

When a gate step fails:
1. Read `runtime_gate_summary.json` to identify the failing step.
2. Open the corresponding step log under `artifacts/runtime-gate/logs/`.
3. For runtime metric drift, inspect:
   - `godot-project/artifacts/runtime-gate/runtime_regression_comparison_latest.json`
   - `godot-project/artifacts/runtime-gate/runtime_regression_metrics_latest.json`

#### Baseline update policy (runtime regression)
Only update runtime baselines for intentional, reviewed behavior changes.

```bash
bash godot-project/scripts/update_runtime_regression_baseline.sh
```

This refreshes:
- `godot-project/tests/runtime_gate/baselines/runtime_regression_baseline.json`

After updating baseline, rerun:
```bash
bash godot-project/scripts/run_runtime_release_gate.sh
```

#### Combat scene smoke
```bash
flatpak run org.godotengine.Godot --headless --path godot-project --scene res://scenes/combat/combat_scene.tscn --quit-after 10 --verbose
```

#### Full smoke harness
```bash
bash godot-project/scripts/run_headless_smoke.sh
```

#### Combat validation harness
```bash
flatpak run org.godotengine.Godot --headless --path godot-project --script res://scripts/combat_improvements_validation.gd
```

### Test framework options (for new test suites)
- GUT (Asset Library entry): https://godotengine.org/asset-library/asset/1709
- GUT docs: https://gut.readthedocs.io/en/latest/
- gdUnit4 repo: https://github.com/godot-gdunit-labs/gdUnit4
- gdUnit4 tutorials page: https://mikeschulze.github.io/gdUnit4/latest/tutorials/index/

Recommendation:
- Keep existing harnesses as baseline.
- Introduce one framework at a time (avoid mixed framework sprawl).
- Prefer extending existing runtime harnesses first:
  - `godot-project/scripts/runtime_regression_harness.gd`
  - `godot-project/scripts/runtime_regression_compare.gd`
  - `godot-project/scripts/run_runtime_release_gate.sh`

---

## Performance Workflow
1. Reproduce issue in an isolated scene when possible.
2. Use Debugger + Profiler first.
3. Measure before and after each optimization.
4. Prefer structural fixes (algorithm/data flow) before micro-optimizations.

References:
- Profiler: https://docs.godotengine.org/en/stable/tutorials/scripting/debug/the_profiler.html
- Debugger panel: https://docs.godotengine.org/en/stable/tutorials/scripting/debug/debugger_panel.html

---

## Export and CI Workflow

### Export requirements
- Keep `export_presets.cfg` in repo when export pipeline is active.
- Keep secret credentials out of version control.

### CLI export pattern
```bash
godot --headless --path /path/to/project --export-release "Linux/X11" build/game.x86_64
```

References:
- Exporting projects: https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html
- Command line tutorial: https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html

---

## Plugin Guidance and Compatibility Notes
Use plugin sources directly and verify compatibility before pinning.

### Resource Databases
- Asset Library listing indicates Godot 4 tooling and MIT license.
- Reference: https://godotengine.org/asset-library/asset/3461

### LimboAI
- Supports Godot 4.4-4.6 according to current README.
- Behavior trees + state machines, with docs and demo.
- Reference: https://github.com/limbonaut/limboai

### GUT
- Asset Library entry currently targets Godot 4.5 for latest listed release.
- Validate version alignment before adopting for 4.6-only pipelines.
- Reference: https://godotengine.org/asset-library/asset/1709

### gdUnit4
- Supports GDScript and C#, version compatibility tied to engine versions.
- Reference: https://github.com/godot-gdunit-labs/gdUnit4

---

## Licensing and Compliance
Maintain `godot-project/docs/THIRD_PARTY_NOTICES.md` with:
- Library/plugin name
- Version/commit
- License
- Upstream URL
- Attribution obligations

For Godot engine licensing and attribution guidance:
https://docs.godotengine.org/en/stable/about/complying_with_licenses.html

---

## Cursor and Windsurf Project Rules

### Expected local rule files
- `.cursor/rules/godot-architecture.mdc`
- `.cursor/rules/gdscript-style.mdc`

### Expected workflow docs
- `.windsurf/workflows/*.md`

Keep these in sync with this guide to avoid policy drift.

---

## Practical Checklists

### New developer checklist
- [ ] Open and run `godot-project/`.
- [ ] Run full smoke harness once.
- [ ] Read official Step by step and first 2D docs.
- [ ] Read local combat/overworld/dialogue scripts before changes.
- [ ] Confirm plugin versions against engine version.

### Pre-merge gameplay checklist
- [ ] Controls unchanged unless task explicitly retunes input/feel.
- [ ] Scene smoke passes.
- [ ] Full smoke passes.
- [ ] Relevant domain harness passes (combat/transition/etc.).
- [ ] Save/load compatibility validated.
- [ ] New constants are documented and named for tuning.

### Architecture-change checklist
- [ ] Record current state and target state.
- [ ] Define migration plan with rollback path.
- [ ] Add validation coverage for migrated surface area.
- [ ] Update this guide with final decision and rationale.

---

## Change Log Policy
When architecture decisions change, update this file in the same PR with:
- Decision summary
- Affected systems/files
- Migration status (current vs target)
- Validation commands run and outcomes

This keeps the guide accurate and prevents drift from live runtime behavior.
