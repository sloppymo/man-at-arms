# Phase 2: Canonical Equipment + Save Schema Migration Plan

**Summary:** Implement explicit save schema versioning with migration pipeline to eliminate runtime dual equipment formats, ensuring old saves auto-migrate to canonical layered equipment structure.

## Canonical Equipment Schema Definition
**Exact Shape:**
```
gameState.equipment = {
  head: { base: Item|null, padding: Item|null, mail: Item|null, plate: Item|null },
  torso: { base: Item|null, padding: Item|null, mail: Item|null, plate: Item|null, surcoat: Item|null },
  arms: { base: Item|null, padding: Item|null, mail: Item|null, plate: Item|null },
  legs: { base: Item|null, padding: Item|null, mail: Item|null, plate: Item|null },
  weapon: { main: Item|null, offhand: Item|null },
  missile: { main: Item|null },
  accessory: { primary: Item|null },
  bag: Item[]
}
```

Where `Item = { id: string, name?: string, condition: number (0-100), fit: 'off-the-rack'|'tailored'|'custom' }`

## Storage Location in gameState
Stored as `gameState.equipment` object with layered slots as defined above.

## Save Format Versioning and Migration
- Add `const SAVE_SCHEMA_VERSION = 2;` in constants.js
- Saved payload format:
  ```
  {
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    gameState: <full gameState object>
  }
  ```
- Migration pipeline: `migrateSavePayload(payload)` applies sequential transforms from payload.schemaVersion to current version
- Migrations stored as array of functions: `[migrateV0ToV1, migrateV1ToV2, ...]`
- Each migration is pure function: `(payload) => payload`

## File-by-File Change List
- **src/core/constants.js**: Add SAVE_SCHEMA_VERSION constant
- **src/core/gameState.js**: Update hydrateLoadedState to handle new save format; ensure schemaVersion set correctly
- **src/systems/save-load.js**: Modify saveGame/loadGame to wrap/unwrap save payload with schema versioning
- **src/core/save-migration.js** (new): Implement migrateSavePayload and migration functions
- **src/ui/equipment-ui.js**: Verify no dual-format branching remains; all reads use canonical format
- **src/scenes/battles/** and related: Ensure equip/unequip operations update canonical equipment
- **tests/smoke-test.js** (new): Add lightweight smoke tests for migration and save/load

## Acceptance Criteria
1. Old saves (missing schemaVersion) load successfully and auto-migrate equipment to layered format
2. After save, localStorage contains wrapped payload with schemaVersion=2, savedAt, and gameState.equipment in canonical layered format only
3. Equipment screen opens and renders equipped items correctly from canonical data
4. Equip/unequip works and persists after browser refresh
5. No runtime branches checking legacy vs canonical equipment formats
6. No ReferenceError regressions; window.* bindings preserved

## Risk List with Mitigations
- **Risk: Migration fails on corrupted save data** - Mitigation: Wrap migrations in try/catch; fall back to fresh gameState if migration fails
- **Risk: Breaking existing saves** - Mitigation: Keep backup of last good save key; test migration on sample legacy saves before deployment
- **Risk: Performance impact on load** - Mitigation: Migrations are lightweight transforms; profile and optimize if needed
- **Risk: UI fails to render migrated equipment** - Mitigation: Add validation in hydrateLoadedState; log warnings for invalid items

## Rollback Plan
- Save to `manAtArmsGame_v2` key; keep `manAtArmsGame_backup` as fallback
- If load fails, attempt loading from backup key
- Rollback: Change localStorage key back to original and remove migration code
- Monitor error logs for migration failures

## Implementation Steps
1. Add SAVE_SCHEMA_VERSION and migration pipeline infrastructure
2. Update save-load.js to wrap save payload
3. Update save-load.js loadGame to unwrap and migrate before hydrateLoadedState
4. Verify equipment UI and operations work with canonical format only
5. Add smoke tests and verify with legacy save payloads
