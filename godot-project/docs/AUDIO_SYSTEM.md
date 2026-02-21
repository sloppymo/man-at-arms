# Audio System Documentation

## Day 6-7 Deliverable: Combat Audio Completion

---

## Overview

All SFX are bundled, normalized, and protected by anti-spam. Works on desktop and web exports.

---

## SFX Inventory

| SFX Name | File | Volume | Description |
|----------|------|--------|-------------|
| `swing` | swing.wav | -10 dB | Player weapon swing |
| `hit` | hit.wav | -5 dB | Impact/hit |
| `death` | death.wav | -5 dB | Enemy death |
| `block` | hit.wav | -8 dB | Shield block (placeholder) |
| `projectile` | swing.wav | -10 dB | Arrow fire (placeholder) |
| `perfect_block` | hit.wav | -4 dB | Perfect block reward (placeholder) |
| `shield_break` | hit.wav | -6 dB | Shield break (placeholder) |

**Note**: Placeholder SFX reuse existing files. Replace with distinct sounds when available.

---

## Usage

### Playing SFX (Recommended)

```gdscript
# Uses normalized volume + anti-spam automatically
audio_manager.play_sfx_by_name("swing")
audio_manager.play_sfx_by_name("hit")
audio_manager.play_sfx_by_name("block")
```

### Playing SFX (Legacy)

```gdscript
# Manual volume control (bypasses normalization)
var stream = audio_manager.get_sfx("swing")
audio_manager.play_sfx(stream, -10.0, "swing")  # Pass name for anti-spam
```

---

## Anti-Spam System

Prevents audio overlap spam while allowing legitimate rapid sounds.

### Cooldowns per SFX Type

| SFX | Cooldown | Notes |
|-----|----------|-------|
| swing | 80ms | Allows rapid attacks |
| hit | 30ms | Can overlap slightly |
| death | 150ms | Distinct, don't overlap |
| block | 60ms | Moderate cooldown |
| projectile | 80ms | Distinct shots |

### Consecutive Play Limit

- Max 3 consecutive plays of same SFX
- Then forced 500ms cooldown
- Resets after cooldown period

---

## Volume Normalization

All SFX use consistent volume levels:

```gdscript
AUDIO_VOLUME_SWING = -10.0
AUDIO_VOLUME_HIT = -5.0
AUDIO_VOLUME_DEATH = -5.0
AUDIO_VOLUME_BLOCK = -8.0
AUDIO_VOLUME_PROJECTILE = -10.0
AUDIO_VOLUME_PERFECT_BLOCK = -4.0
AUDIO_VOLUME_SHIELD_BREAK = -6.0
AUDIO_VOLUME_SFX_BUS = -2.0      # Master SFX bus
AUDIO_VOLUME_MUSIC_BUS = -12.0   # Music bus
```

---

## Web Export

All audio files are bundled via `include_filter` in export presets:

```ini
[preset.0]
include_filter="*.wav,*.ogg,*.mp3"
```

### Preloading for Web

Call during loading screen to avoid hitches:

```gdscript
audio_manager.preload_all_sfx()
```

---

## Bus Configuration

Three audio buses configured automatically:

- **Master** - Overall volume
- **SFX** - All sound effects
- **Music** - Background music

### Volume Control

```gdscript
audio_manager.set_master_volume(-5.0)
audio_manager.set_sfx_volume(-2.0)
audio_manager.set_music_volume(-15.0)
```

---

## Testing

```bash
# Run audio validation
godot --headless --script scripts/audio_validation_test.gd
```

Checks:
- All required SFX available
- Volume normalization
- Anti-spam functional
- Web export compatible
- Bus configuration

---

## Adding New SFX

1. Add audio file to `assets/audio/`
2. Add entry to `AUDIO_PATHS` in `audio_manager.gd`
3. Add entry to `AUDIO_STREAMS` if preloading
4. Add volume constant to `combat_constants.gd`
5. Add default volume to `_get_default_volume_for_sfx()`
6. Update this documentation

---

## Diagnostics

```gdscript
var diag = audio_manager.get_diagnostics()
print(diag)
# {
#   "is_web_export": false,
#   "pool_size": 12,
#   "cached_sfx": ["swing", "hit", "death"],
#   "bus_volumes": {"master": 0.0, "sfx": -2.0, "music": -12.0},
#   "anti_spam_tracking": 5
# }
```
