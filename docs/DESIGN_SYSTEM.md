# SONORA — Visual Identity & Design System Specification

**Document Version:** 1.0.0  
**Design Direction:** Nocturne & Resonance (Audiophile Dark Luxury)  
**Author:** Senior Digital Product Designer & Architect  
**Project Root:** `D:\SONORA`  
**File Location:** `docs/DESIGN_SYSTEM.md`

---

## 1. Design Philosophy: *Nocturne & Resonance*

SONORA's visual language departs sharply from cold, utilitarian dashboards and sterile flat interfaces. It is crafted as a **nocturnal, tactile stage** where music artwork is the hero and every control feels weighted, calibrated, and resonant.

```
┌────────────────────────────────────────────────────────────────────────┐
│  NOCTURNE                                                              │
│  Deep obsidian blacks, smoky charcoal tiers, and specular edge light. │
│  Creates infinite depth without visual noise or flat gray fatigue.     │
├────────────────────────────────────────────────────────────────────────┤
│  RESONANCE                                                             │
│  Dual-frequency accents: Electric Emerald (#00F59B) for energetic     │
│  action, paired with Atmospheric Violet (#8B5CF6) for ambient soul.    │
├────────────────────────────────────────────────────────────────────────┤
│  TACTILITY                                                             │
│  Layered diffuse shadows, controlled glassmorphic sheens, spring-mass  │
│  physics on hover, and continuous artwork-reactive ambient glows.      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Color System & Design Tokens

### 2.1 The Canvas & Neutral Foundation (Obsidian & Charcoal)
Instead of monochromatic grays, SONORA uses an ultra-refined **cool-slate obsidian palette** with blue-violet undertones (`230°` hue angle) that recedes into the background, allowing album art colors to radiate with maximum vibrance.

```css
/* Core Surface Tokens */
--sonora-canvas:        #060709;  /* Deepest viewport canvas */
--sonora-surface-0:     #0B0D12;  /* App shell root panels */
--sonora-surface-1:     #12151D;  /* Base sidebar & card surface */
--sonora-surface-2:     #191D28;  /* Elevated cards, player bar */
--sonora-surface-3:     #222736;  /* Hover highlights, dropdown menus */
--sonora-surface-4:     #2D3447;  /* Active selections, modal dialogs */
--sonora-border-subtle: rgba(255, 255, 255, 0.06); /* Divider hairline */
--sonora-border-glass:  rgba(255, 255, 255, 0.12); /* Glass container border */
--sonora-specular:      rgba(255, 255, 255, 0.18); /* Top highlight border */
```

### 2.2 Sonic Energy Accents (Electric Emerald & Atmospheric Violet)

SONORA rejects generic bright greens in favor of an **Electric Emerald** with higher saturation and cyan luminescence, complemented by a deep **Atmospheric Violet** that represents deep bass resonance and nocturnal mood.

| Color Role | Token | Hex Code | Purpose & Application |
|---|---|---|---|
| **Electric Emerald (Primary)** | `accent-emerald-400` | `#00F59B` | Active play button, scrubber fill, live equalizer bars, active toggles. |
| **Electric Emerald Hover** | `accent-emerald-500` | `#00DF89` | Hover state for primary action buttons. |
| **Electric Emerald Muted** | `accent-emerald-900/20`| `rgba(0, 245, 155, 0.15)` | Subtle badge fills, scrubber hover glow, subtle indicator halos. |
| **Atmospheric Violet (Secondary)** | `accent-violet-400` | `#A78BFA` | Lyrics active verse glow, premium badge text, secondary highlight. |
| **Atmospheric Violet Deep** | `accent-violet-600` | `#7C3AED` | Genre cards, ambient background radial gradients, album spotlight. |
| **Atmospheric Violet Glow** | `accent-violet-500/25`| `rgba(139, 92, 246, 0.25)`| Ambient backdrop bloom for hero artist and lyrics views. |

### 2.3 Typographic Contrast Hierarchy

| Level | Token | Hex / RGBA | Contrast vs Surface-1 | Usage |
|---|---|---|---|---|
| **High Emphasis** | `text-primary` | `#FFFFFF` | 17.5:1 (AAA) | Song titles, hero headings, active lyric line, primary button text. |
| **Medium Emphasis** | `text-secondary` | `#94A3B8` | 8.2:1 (AAA) | Artist names, column headers, album titles in cards. |
| **Subdued Emphasis** | `text-tertiary` | `#64748B` | 4.8:1 (AA) | Track durations, timestamps, release years, copyright notices. |
| **Muted / Inactive** | `text-muted` | `#475569` | 3.1:1 | Inactive lyrics, disabled control icons, keyboard shortcuts hint. |

---

## 3. Controlled Glassmorphism & Surface Materiality

SONORA avoids "frosted-glass overkill" that muddies text readability. Glassmorphism is applied surgically to **floating controllers, navigation capsules, and contextual menus** using a 3-layer light model:

```css
/* Premium Glassmorphic Surface Class */
.sonora-glass-panel {
  background: linear-gradient(
    135deg,
    rgba(25, 29, 40, 0.72) 0%,
    rgba(14, 16, 23, 0.85) 100%
  );
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.16); /* Specular light source from top */
  box-shadow: 
    0 12px 32px -4px rgba(0, 0, 0, 0.65),
    0 4px 12px -2px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}

/* Floating Navigation Capsule Glass */
.sonora-glass-capsule {
  background: rgba(18, 21, 29, 0.68);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 8px 24px -2px rgba(0, 0, 0, 0.5);
}
```

---

## 4. Typography System

### 4.1 Typeface Selection
- **Display & Headings:** `Plus Jakarta Sans` — Modern, geometric, clean humanistic grotesk with crisp apertures.
- **Body & Controls:** `Inter` — Precision micro-typography with exceptional legibility at 11px–14px.
- **Numerics & Scrubber Time:** `JetBrains Mono` or tabular figures (`font-variant-numeric: tabular-nums`) to prevent layout jitter during seconds playback.

```css
/* Typography Scale Tokens */
--font-display-hero:  clamp(36px, 5.5vw, 76px); /* Artist & Playlist hero title */
--font-title-1:       32px;                     /* Section big headings */
--font-title-2:       24px;                     /* Shelf titles, Modal headers */
--font-title-3:       18px;                     /* Card titles, Drawer headers */
--font-body-large:    16px;                     /* Primary navigation, Now Playing song */
--font-body:          14px;                     /* Default UI, tracklist row title */
--font-caption:       12px;                     /* Artist subtitles, table column headers */
--font-micro:         11px;                     /* Explicit badge, timecode counters */
```

### 4.2 Typographic Hierarchy Table

| Style Role | Font Family | Size | Weight | Line Height | Tracking | Text Transform |
|---|---|---|---|---|---|---|
| **Display Hero** | Plus Jakarta Sans | 48px–72px | 800 (Extrabold) | 1.05 | -0.035em | Normal |
| **Section Title** | Plus Jakarta Sans | 24px | 700 (Bold) | 1.2 | -0.02em | Normal |
| **Card Title** | Plus Jakarta Sans | 15px | 600 (Semibold) | 1.3 | -0.01em | Normal |
| **Table Header** | Inter | 12px | 500 (Medium) | 1.0 | +0.06em | Uppercase |
| **Track Title** | Inter | 14px | 500 (Medium) | 1.3 | 0 | Normal |
| **Subdued Meta** | Inter | 13px | 400 (Regular) | 1.4 | 0 | Normal |
| **Timecode Monospace** | JetBrains Mono | 12px | 500 (Medium) | 1.0 | +0.02em | Tabular |
| **Badge Micro** | Inter | 10px | 700 (Bold) | 1.0 | +0.08em | Uppercase |

---

## 5. Spacing, Sizing & Grid System

SONORA operates on an **8px rhythm** with a **4px half-step** for dense micro-components (player controls, badges, table padding).

```css
/* Spacing Scale */
--space-1:    4px;   /* Micro gap between icons and badge text */
--space-2:    8px;   /* Panel gap, card internal text padding */
--space-3:    12px;  /* Compact table row padding, button gap */
--space-4:    16px;  /* Card padding, container gutters, player height offset */
--space-5:    20px;  /* Shelf margin-bottom, list item spacing */
--space-6:    24px;  /* Hero padding, modal body inset */
--space-8:    32px;  /* Section separation gap */
--space-10:   40px;  /* Page top header offset */
--space-12:   48px;  /* Large hero spacing */
```

### Layout Grid Tokens
- **Root Gap:** `8px` (`--panel-gap: 8px`) separating sidebar, main view, and companion panel.
- **Sidebar Width Bounds:** `min: 240px`, `default: 300px`, `max: 420px`, `collapsed-rail: 68px`.
- **Player Bar Height:** `84px` fixed at the bottom.
- **Top Navigation Height:** `64px` sticky at the top.

---

## 6. Border Radius System

```css
--radius-xs:    4px;   /* Explicit badge, mini tags */
--radius-sm:    6px;   /* Context menu items, small tooltips */
--radius-md:    10px;  /* Table rows hover state, category cards */
--radius-lg:    14px;  /* Content cards, album artwork containers */
--radius-xl:    20px;  /* Modal dialogs, lyrics floating container */
--radius-pill:  9999px;/* Action buttons, search capsule, filter pills */
```

---

## 7. Layered Shadows & Ambient Illumination

Rather than muddy black drop-shadows, SONORA utilizes **multi-layered soft ambient shadows** paired with **colored optical glows** derived from music artwork.

```css
/* Elevation 1: Subtle Card Separation */
--shadow-elevation-1: 
  0 2px 8px -1px rgba(0, 0, 0, 0.4),
  0 1px 3px 0px rgba(0, 0, 0, 0.3);

/* Elevation 2: Floating Player & Dropdown Menus */
--shadow-elevation-2: 
  0 12px 28px -4px rgba(0, 0, 0, 0.6),
  0 4px 12px -2px rgba(0, 0, 0, 0.4);

/* Elevation 3: Modals & Full-Screen Overlays */
--shadow-elevation-3: 
  0 24px 54px -8px rgba(0, 0, 0, 0.8),
  0 8px 24px -4px rgba(0, 0, 0, 0.5);

/* Sonic Glow: Play Button Active Halo */
--shadow-glow-emerald: 
  0 8px 24px -2px rgba(0, 245, 155, 0.45),
  0 2px 8px 0px rgba(0, 245, 155, 0.25);

/* Ambient Artwork Glow (Dynamic Injection) */
--shadow-ambient-artwork: 
  0 20px 60px -10px var(--ambient-color-glow, rgba(139, 92, 246, 0.3));
```

---

## 8. Interactive Component Architecture

### 8.1 Primary Action Play Button (Floating FAB & Controls)
The quintessential music interaction is the Play Button. In SONORA, it is engineered with spring dynamics:

```css
.sonora-play-button-fab {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  background-color: var(--sonora-emerald, #00F59B);
  color: #060709;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow-emerald);
  transform: translateY(8px) scale(0.92);
  opacity: 0;
  transition: 
    transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), /* Spring overshoot */
    opacity 0.2s ease,
    background-color 0.15s ease;
}

.sonora-card:hover .sonora-play-button-fab {
  transform: translateY(0px) scale(1);
  opacity: 1;
}

.sonora-play-button-fab:hover {
  transform: scale(1.08) !important;
  background-color: #00DF89;
  box-shadow: 0 10px 30px -2px rgba(0, 245, 155, 0.65);
}

.sonora-play-button-fab:active {
  transform: scale(0.96) !important;
}
```

### 8.2 The Content Card (`TrackCard` / `AlbumCard`)
- **Structure:**
  - 14px outer radius.
  - 16px internal padding.
  - 1:1 square artwork frame with smooth 10px inner radius.
  - Floating Play FAB anchored at bottom-right (`bottom: 8px; right: 8px`).
  - Text meta group with 2-line clamp title in `Plus Jakarta Sans 15px (Semibold)` and single-line artist link in `Inter 13px (Subdued)`.
- **Card Hover Transition:**
  - Background interpolates from `#12151D` to `#1C202B` over `200ms ease`.
  - Subtle upward translation: `translateY(-3px)`.
  - Artwork receives a faint internal ambient glow reflection matching its dominant tint.

### 8.3 The Hybrid Tracklist Row
- **Default State:**
  - `#` column displays track number in `JetBrains Mono 13px (Subdued)`.
  - Heart and 3-dots action icons are completely hidden (`opacity: 0`).
  - Background is completely transparent.
- **Hover State:**
  - Background fills with `rgba(255, 255, 255, 0.05)` with `8px` corner radius.
  - Track number `#` cross-fades into a solid white Play triangle icon.
  - Heart (Like) button and 3-dots (More) button fade in (`opacity: 1`).
  - Song title takes a crisp white highlight.
- **Currently Playing State:**
  - Song title glows in `Electric Emerald (#00F59B)`.
  - Track number is replaced by an **animated 3-bar soundwave equalizer** pulsing with rhythm.

### 8.4 The Precision Scrubber & Volume Controller
- **Track Bar:** Height `4px`, background `rgba(255, 255, 255, 0.14)`, rounded `9999px`.
- **Buffered Bar:** Sits beneath progress, styled with `rgba(255, 255, 255, 0.25)`.
- **Active Progress Fill:** Solid `Electric Emerald (#00F59B)` or bright white.
- **Thumb Handle (`progress-bar-handle`):**
  - Hidden by default (`opacity: 0, scale: 0.6`).
  - Appears instantly on hover over the scrubber hitzone (`opacity: 1, scale: 1`).
  - Size: 12px solid white circle with shadow `0 2px 6px rgba(0, 0, 0, 0.6)`.
- **Hover Tooltip:** Floating dark pill displaying formatted time `m:ss` directly above cursor position.

---

## 9. Animation Curves & Motion Choreography

All UI animations in SONORA obey natural physical damping rather than robotic linear ramps:

```css
/* Animation Curves */
--ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy spring for buttons & FABs */
--ease-out-expo:     cubic-bezier(0.16, 1, 0.3, 1);     /* Smooth deceleration for modals & drawers */
--ease-in-out-smooth: cubic-bezier(0.4, 0, 0.2, 1);     /* Standard theme cross-fades */

/* Durations */
--duration-micro:    120ms; /* Button click active states */
--duration-normal:   220ms; /* Hover highlights, FAB slide-ups, table row shifts */
--duration-medium:   360ms; /* Drawer slides, accordion expansion, modal popups */
--duration-ambient:  800ms; /* Background color transitions when switching tracks */
```

---

## 10. Responsive Breakpoint Matrix

| Viewport Tier | Width (px) | Layout Adjustments | Navigation Model |
|---|---|---|---|
| **Mobile Portrait** | `< 640px` | Single column; 2-column cards; Sidebars hidden | Bottom 4-tab glass bar + Docked 52px Mini-Player |
| **Mobile Landscape / Phablet** | `640px – 767px` | Single column; 3-column cards | Bottom glass bar + Docked Mini-Player |
| **Tablet** | `768px – 1023px` | 2 columns; Left sidebar in compact 68px icon rail | Sticky top search capsule + Icon sidebar |
| **Desktop** | `1024px – 1439px` | 3 columns: Resizable Library (280–420px) + Main View + Right Companion Panel | Full top bar + Draggable splitter + 3-zone Player Bar |
| **Ultrawide** | `≥ 1440px` | 3 columns with max container width 1800px; 6-column shelves | Expanded library + full lyrics companion |

---

## 11. Complete Tailwind Theme Extension Tokens

The following configuration will be directly integrated into `tailwind.config.ts`:

```typescript
// tailwind.config.ts (Extract)
export default {
  theme: {
    extend: {
      colors: {
        canvas: '#060709',
        surface: {
          0: '#0B0D12',
          1: '#12151D',
          2: '#191D28',
          3: '#222736',
          4: '#2D3447',
        },
        emerald: {
          DEFAULT: '#00F59B',
          hover: '#00DF89',
          muted: 'rgba(0, 245, 155, 0.15)',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          ambient: 'rgba(139, 92, 246, 0.25)',
          glow: '#A78BFA',
        },
        content: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          muted: '#475569',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 8px 24px -2px rgba(0, 245, 155, 0.45)',
        'glow-violet': '0 12px 32px -4px rgba(139, 92, 246, 0.35)',
        'glass-panel': '0 12px 32px -4px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
};
```

---

*This design system specification establishes the unique, commercial-grade visual DNA for SONORA. No proprietary assets or branding from external services are replicated.*
