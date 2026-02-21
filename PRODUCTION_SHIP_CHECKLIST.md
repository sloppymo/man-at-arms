# Production Ship Checklist - Yarn Narrative Engine

## ✅ Pre-Ship Validation (CI Gate)

**Run on every commit before deployment:**

```bash
# 1. Canonical web reliability gate (legacy boundary + Jest + smoke + build)
npm run ci:web

# 2. Optional manual production preview
npm run preview
```

**Expected Results:**
- ✅ Legacy import boundary: no `src/` imports from `js/`
- ✅ Smoke tests: Active runtime stories pass parser-shape validation (allowlist/skiplist aware)
- ✅ Unit tests: Canonical Jest suite passes
- ✅ Build: Completes without errors
- ✅ Preview: Server starts and serves content correctly

## ✅ Technical Implementation Verified

**Yarn-Bound Integration:**
- ✅ Uses correct API: `YarnBound.TextResult`, `OptionsResult`, `CommandResult`
- ✅ `opt.isAvailable` for option availability (hides unavailable options)
- ✅ `handleCommand` with `{ command, hashtags, metadata }` signature
- ✅ `variableStorage.get/set` with `$` prefix handling
- ✅ `combineTextAndOptionsResults: true` for prompt text

**UI Integration:**
- ✅ `OptionsResult.text` displayed above choice buttons
- ✅ Pause commands (`<<pause>>`) trigger continue button via `DIALOG_PAUSED`
- ✅ Text advancement works for non-choice content
- ✅ Choice selection calls `advance(choiceIndex)`

**Build System:**
- ✅ `import.meta.glob('../../stories-yarn/**/*.yarn', { as: 'raw' })` for hot-reload
- ✅ Multiple key fallback patterns for Vite glob resilience
- ✅ No dynamic `import()` patterns that break in production
- ✅ Canonical test/deploy scripts aligned in `package.json`

## ✅ Content Authoring Standards

**Unavailable Options UX:**
- **Design Choice:** Hide unavailable options completely (not disable/gray them)
- **Rationale:** Cleaner UI, reduces cognitive load, matches RPG conventions
- **Alternative:** Could show disabled options if preferred (requires DialogUI changes)

**Conditional Options - Canonical Pattern:**
- **Simple conditions:** `-> "Choice" <<if $condition>>` (inline)
- **Complex logic:** `<<if>>`/`<<elseif>>`/`<<else>>` blocks (block-wrapped)
- **Consistency:** Reduces authoring errors and tooling drift

**Lookahead Prevention:**
- Migration utility auto-inserts `<<pause>>` before `resolveAction` + conditionals
- Manual `<<pause>>` needed for custom variable-setting patterns
- UI handles pause with explicit continue button

## ✅ Migration Complete

**Ink to Yarn Conversion:**
- ✅ All 9 Ink story files converted successfully
- ✅ Conditional blocks handled (`{success:}` → `<<if $success>>`)
- ✅ Commands converted (`{advanceTime(30)}` → `<<advanceTime 30>>`)
- ✅ Variable references updated (`$stats.strength` format)
- ✅ Lookahead prevention added where needed

**Legacy Cleanup:**
- ✅ Ink dependencies removed (`inkjs`, `@busthorne/inkjs`)
- ✅ Old Ink artifacts deleted (`public/js/ink/`)
- ✅ Obsolete scripts removed (`compile-ink-proper.js`)
- ✅ DialogueService archived (preserved in backup)

## ✅ Documentation Complete

**For Content Creators:**
- ✅ `YARN_AUTHORING_GUIDE.md` - Complete reference
- ✅ Command usage examples for all game systems
- ✅ Variable mapping and conditional patterns
- ✅ Testing and validation instructions

**For Developers:**
- ✅ Inline code documentation
- ✅ API compatibility notes
- ✅ Build and deployment instructions

## 🚀 Deployment Ready

**Zero-Downtime Migration:**
- ✅ All existing game functionality preserved
- ✅ Same UI, encounters, and player experience
- ✅ Hot-reload enabled for instant content updates
- ✅ No breaking changes to game logic

**Production Stability:**
- ✅ Tested in development and production builds
- ✅ Error handling for malformed stories
- ✅ Graceful fallbacks for missing content
- ✅ Performance verified (no runtime bloat)

## 📋 Post-Ship Maintenance

**Content Workflow:**
```bash
# Add new stories
echo "title: NewStory\n---\n== start\nHello world!\n===" > stories-yarn/new_story.yarn

# Test changes
npm run test:smoke

# Deploy
npm run build
```

**Monitoring:**
- Watch for yarn-bound updates (currently `^0.4.3`)
- Monitor story loading performance in production
- Track authoring patterns for consistency

---

**Status: 🟢 PRODUCTION-FINAL - READY FOR DEPLOYMENT**

All validations passed, implementation hardened, documentation complete. The Yarn Spinner narrative engine replacement is production-ready with enterprise-grade quality assurance. 🎯
