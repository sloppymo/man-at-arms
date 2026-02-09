# Character Portraits

This directory contains character portraits for the dialog system.

## Directory Structure

Each character should have their own subdirectory containing emotion variations:

```
portraits/
├── james_olooney/
│   ├── neutral.png
│   ├── smirk.png
│   ├── furious.png
│   ├── disappointed.png
│   ├── intrigued.png
│   ├── wary.png
│   └── disgusted.png
├── lord_david/
│   ├── neutral.png
│   ├── gentle_smile.png
│   ├── stern.png
│   ├── worried.png
│   ├── shocked.png
│   ├── anxious.png
│   └── disappointed.png
└── ...
```

## Portrait Specifications

- **Format**: PNG with transparency
- **Size**: 400x400 pixels (will be scaled to 200x200 in UI)
- **Style**: Consistent medieval portrait style
- **Background**: Transparent
- **Lighting**: Consistent across all portraits
- **Emotion**: Clear, recognizable emotional expressions

## Required Emotions

Each character should have the following emotions:

### Core Emotions
- `neutral.png` - Default/resting expression
- `happy.png` - Positive emotion (smile, smirk, etc.)
- `angry.png` - Negative emotion (frown, glare, etc.)
- `sad.png` - Sadness or disappointment
- `surprised.png` - Surprise or shock

### Advanced Emotions
- `fearful.png` - Fear or anxiety
- `contempt.png` - Disgust or contempt

## Character-Specific Emotion Names

Some characters may have more descriptive emotion names:

- **James "The Reaver"**: `smirk.png` instead of `happy.png`, `furious.png` instead of `angry.png`
- **Lord David**: `gentle_smile.png` instead of `happy.png`, `stern.png` instead of `angry.png`
- **Baron Caley**: `satisfied.png` instead of `happy.png`, `imperious.png` instead of `angry.png`
- **Count Charles**: `rare_smile.png` instead of `happy.png`, `cynical.png` for contempt
- **Ashkhan**: `approving.png` instead of `happy.png`, `intense.png` instead of `angry.png`

## Art Style Guidelines

- **Historical Accuracy**: Appropriate medieval clothing and appearance
- **Consistent Lighting**: Same light source and direction across all portraits
- **Color Palette**: Earth tones, muted colors appropriate for the period
- **Resolution**: High enough quality for scaling without pixelation
- **Expression**: Clear, readable emotions that work at small sizes

## Implementation Notes

The portrait system will automatically:
- Load portraits on demand
- Apply emotion-based CSS filters for additional effect
- Scale portraits to fit the UI
- Handle missing portraits gracefully

Place character portraits in their respective subdirectories following the naming conventions above.
