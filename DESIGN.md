# Design Brief — Local Rank Tracker (v2: Satellite Map)

**Tone:** Cold precision meets 2026 futurism. Geographic data visualization as visual system. Neon authority.

**Differentiation:** Mapbox satellite map is the canvas. Rank pins are neon badges pinned at real coordinates. Center origin marked with pulsing crosshair. Draggable radius slider. Data-forward, minimal chrome.

## Palette

| Token | OKLCH | Purpose |
|-------|--------|----------|
| Top-3 | `0.72 0.32 180` (cyan) | Ranks 1–3, pin glow, slider accent |
| Mid-Rank | `0.68 0.30 285` (purple) | Ranks 4–10, pin glow |
| Poor-Rank | `0.80 0.30 15` (magenta) | Ranks 11+, pin glow |
| Not-Found | `0.14 0.01 270` (dark grey) | N/A indicator on map |

## Typography

| Role | Font | Usage |
|------|------|-------|
| Display | Space Grotesk | Headers, labels |
| Body | Inter | Copy, descriptions |
| Mono | JetBrains Mono | Rank numbers on pins, coordinates |

## Structural Zones

| Zone | Treatment |
|------|----------|
| Map Canvas | Satellite tiles, full bleed |
| Rank Pins | 48px neon circles, positioned absolutely at lat/lng |
| Center Origin | Pulsing crosshair ring, 56px, cyan glow |
| Radius Slider | Top/side panel, glassmorphism, draggable 0.5–10mi |
| Summary Bar | Glassmorphism overlay, performance metrics |

## Motion

- Pins fade in as results resolve (slide-in 0.4s)
- Center pin pulses 3s infinite (scale 1→1.05, glow shift)
- Slider thumb glows on hover (box-shadow expand)
- All transitions 0.3s cubic-bezier(0.4, 0, 0.2, 1)

## Constraints

- Neon glows only on rank pins, not backgrounds
- Satellite map never blurred or filtered
- Pins must be readable over any terrain (white text, 18px mono bold)
- Center marker always visible (high z-index, 56px size)

## Signature Detail

Satellite map with neon rank indicators. Geographic precision meets sci-fi aesthetic. Draggable radius visualizes search scope. Pulsing center pin anchors origin.
