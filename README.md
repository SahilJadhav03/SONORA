<div align="center">

# SONORA
### *Nocturne & Resonance — Ultra-Luxury Audiophile Web Streaming Client*

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Audiophile_Graph-00F59B?style=for-the-badge&logo=soundcharts&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![PWA](https://img.shields.io/badge/PWA-Installable_Offline-8B5CF6?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

<p align="center">
  A world-class music streaming web application blending the sensory elegance of <b>Apple Music</b>, the discovery speed of <b>Spotify</b>, the tactile craft of <b>Bang & Olufsen</b>, and the keyboard efficiency of <b>Linear</b> and <b>Raycast</b>.
</p>

</div>

---

## Overview & Design Philosophy

SONORA was engineered to transcend conventional music streaming web apps. Rather than a standard dark-mode interface with a bare HTML5 `<audio>` tag, SONORA operates like high-end audiophile hardware:

- **Apple Music Sing & Glow Lyrics**: Real-time time-synced lyrics with depth-of-field focal blur, spring auto-scrolling, interactive timestamp seeking, and karaoke vocal attenuation.
- **Dynamic Ambient Fluid Mesh**: An organic, GPU-accelerated background color mesh driven by real-time dominant palette extraction with zero-banding SVG film grain.
- **Hardware-Grade Web Audio API Graph**: A serial DSP pipeline featuring an active 5-band graphic equalizer, smooth crossfade volume ramps, a vocal notch ducking filter, and a 60fps FFT spectrum visualizer.
- **Continuous Shared-Element Choreography**: Seamless Framer Motion `layoutId` morphing between the floating mobile glass capsule and the full-bleed Now Playing Theatre mode.
- **Raycast-Style Sonic Command Palette**: Global `⌘K` fuzzy search across tracks, albums, artists, custom playlists, and instant executive actions.
- **PWA & Native Touch Gestures**: Built as an installable standalone PWA with horizontal swipe-to-skip gestures, vertical pull-to-dismiss sheet mechanics, and edge-to-edge safe area inset compliance.

---

## Key Features

### 1. Apple Music Sing & Time-Synced Depth Lyrics
- **Depth-of-Field Visual Hierarchy**: Active line illuminates in high-contrast crisp white (`scale-105`) with an ambient text glow; adjacent lines soften with micro-blur (`blur-[0.5px]`), while distant lines fade into deep atmospheric blur (`blur-[3px] opacity-30`).
- **Interactive Lyric Seeking**: Clicking any lyric line smoothly scrubs the audio engine directly to that timestamp with a ripple highlight.
- **Vocal Attenuation ("Sing Mode")**: Engaging Sing Mode inserts an active 1.8kHz peaking notch filter (`-18dB, Q: 1.35`) into the Web Audio graph, attenuating vocals so listeners can sing along.

### 2. Audiophile 5-Band Graphic Equalizer
- **Hardware Biquad Filter Pipeline**:
  - **60 Hz** — Lowshelf Filter (Sub-bass weight & rumble)
  - **230 Hz** — Peaking Filter (Bass warmth & kick punch)
  - **910 Hz** — Peaking Filter (Vocal body & fundamental midrange)
  - **3.6 kHz** — Peaking Filter (Vocal presence & percussion attack)
  - **14 kHz** — Highshelf Filter (Air, sheen, and ultra-high acoustic detail)
- **Engineered Presets**: Instant switching between *Flat*, *Bass Boost*, *Vocal Presence*, *Late Night*, *Studio Reference*, and *Custom*.
- **Integrated FFT Mini-Visualizer**: Embedded directly into the EQ popover for instant acoustic feedback.

### 3. Spotify-Style Contextual Bento Companion Drawer
- Seamless right-hand drawer toggleable via hotkeys (<kbd>I</kbd> for Bento, <kbd>L</kbd> for Lyrics, <kbd>Q</kbd> for Queue).
- **Living Canvas Hero Header**: Ken-Burns zoom on current artwork with live streaming bitrate and audio master badges.
- **About the Artist Bento Card**: Full artist biography, monthly listener metrics, verified badge, and instant follow state.
- **Interactive Drag-and-Drop Queue**: Reorder upcoming tracks with spring physics using Framer Motion `Reorder.Group`.

### 4. Dynamic Ambient Fluid Canvas & 21st.dev Spotlights
- **Dominant Palette Extractor**: Downsamples artwork to 36x36 in an offscreen canvas with vibrancy and saturation scoring, caching results in an LRU memory map.
- **Audio-Reactive Energy Halo**: Audio visualizer metrics pipe real-time sub-bass energy directly into CSS custom property `--sonora-bass` to pulse album covers and ambient blobs without triggering React component re-renders.
- **Mouse-Tracking Radial Spotlights & 3D Tilt**: Album and artist cards track cursor coordinates with spring smoothing (`stiffness: 300, damping: 20`) and spotlight border illumination.

### 5. Immersive Full-Screen Theatre ("Living Room / TV Mode")
- **Shared-Element Morphing**: Clicking the bottom mini-player smoothly expands artwork, title, artist, and timeline scrubber into the focal layout using Framer Motion `layoutId`.
- **4-Second Inactivity Auto-Hide**: Secondary controls and the mouse cursor vanish after 4 seconds of stillness, creating an unobstructed ambient vinyl display; awakens instantly on cursor movement or keyboard interaction.

---

## Audio Engine Architecture

SONORA's audio pipeline is built on a singleton `AudioEngine` orchestrating a Web Audio API graph:

```
[ HTML5 Audio Element ]
           │
           ▼
[ MediaElementAudioSourceNode ]
           │
           ▼
[ BiquadFilter (60Hz Lowshelf) ]
           │
           ▼
[ BiquadFilter (230Hz Peaking) ]
           │
           ▼
[ BiquadFilter (910Hz Peaking) ]
           │
           ▼
[ BiquadFilter (3.6kHz Peaking) ]
           │
           ▼
[ BiquadFilter (14kHz Highshelf) ]
           │
           ▼
[ Sing Mode Vocal Filter (1.8kHz Notch) ]
           │
           ▼
[ Master GainNode (Volume / Smooth Crossfade Ramp) ]
           │
           ▼
[ AnalyserNode (fftSize: 256, 60fps Frequency Spectrum) ]
           │
           ▼
[ AudioContext.destination ] (Hardware Output)
```

### Zero-Render 60fps Visualizer Bridge
To prevent high-frequency visualizer data from forcing React reconciliation across the component tree:
1. `useAudioVisualizer` samples the `AnalyserNode` frequency bins using `requestAnimationFrame`.
2. Normalized energy averages for bass, mid, and treble are written directly to CSS custom properties on `document.documentElement`:
   ```css
   --sonora-bass: 0.42;
   --sonora-mid: 0.28;
   --sonora-treble: 0.19;
   ```
3. Hardware-accelerated GPU transforms and glowing auras read these variables via `transform: scale(calc(1 + var(--sonora-bass) * 0.24))` in pure CSS.
4. **Lifecycle & Visibility**: When the browser tab is hidden (`document.visibilityState === 'hidden'`), all rAF loops pause and CSS variables reset to `0`, preserving battery and CPU.

---

## Keyboard Shortcuts

SONORA is fully keyboard-navigable. Global shortcuts intercept cleanly without interfering with form inputs or search bars:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Space</kbd> or <kbd>K</kbd> | **Play / Pause** | Toggles playback with instant feedback toast |
| <kbd>Shift</kbd> + <kbd>→</kbd> or <kbd>N</kbd> | **Next Track** | Advances to next track in queue |
| <kbd>Shift</kbd> + <kbd>←</kbd> or <kbd>P</kbd> | **Previous Track** | Returns to previous track |
| <kbd>→</kbd> | **Seek Forward** | Fast forwards 5 seconds |
| <kbd>←</kbd> | **Seek Backward** | Rewinds 5 seconds |
| <kbd>↑</kbd> | **Volume Up** | Increases volume by +5% |
| <kbd>↓</kbd> | **Volume Down** | Decreases volume by -5% |
| <kbd>M</kbd> | **Mute / Unmute** | Toggles audio output mute |
| <kbd>L</kbd> | **Like / Favorite** | Toggles heart on current track |
| <kbd>E</kbd> | **Equalizer** | Opens / closes 5-Band Audiophile EQ |
| <kbd>W</kbd> | **Waveform Scrubber** | Toggles between Smooth and High-Density Waveform |
| <kbd>I</kbd> | **Bento Drawer** | Toggles Now Playing Right Companion Panel |
| <kbd>Q</kbd> | **Queue Panel** | Toggles Up Next Queue Drawer |
| <kbd>F</kbd> | **Theatre Mode** | Enters / exits Full-Screen Immersive Theatre |
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | **Sonic Palette** | Opens Raycast-style command search |
| <kbd>Esc</kbd> | **Dismiss Overlay** | Closes active modal / theatre / EQ in priority hierarchy |

---

## Interactive Showcase Tour

Recruiters and evaluators can immediately test SONORA's signature capabilities using the `"✨ Explore Features"` pill in the top navigation bar, or by typing `> showcase` in the Command Palette:

1. **Launch Glow Lyrics**: Directly opens time-synced lyrics with depth blur and Sing Mode toggle.
2. **Open 5-Band EQ**: Opens the hardware equalizer with live spectrum analysis.
3. **Trigger Sonic Palette**: Launches instant fuzzy search and executive actions.
4. **Enter Full-Screen Theatre**: Activates full-bleed visualizer with 4s auto-hide living room mode.
5. **Cycle Accent Themes**: Dynamically shifts between *Electric Emerald*, *Electric Violet*, *Cyber Amber*, and *Rose Quartz*.

---

## Project Structure

```
D:\SONORA
├── docs/
│   └── QA_REPORT.md            # Comprehensive production QA & performance report
├── public/
│   ├── icons/                  # PWA maskable & standard vector / PNG icons (192, 512)
│   ├── favicon.svg             # Vector favicon
│   ├── logo.svg                # Brand soundwave insignia
│   ├── manifest.webmanifest    # Standalone PWA web manifest
│   └── sw.js                   # Service Worker precache & offline fallback
├── src/
│   ├── components/
│   │   ├── cards/              # Category, QuickReplay, Album, Artist, Playlist cards
│   │   ├── common/             # AmbientFluidCanvas, SpotlightTiltCard, StickyHeader, Tour
│   │   ├── feedback/           # ToastContainer, EmptyState
│   │   ├── lyrics/             # TimeSyncedLyrics (Depth-of-field blur & Sing Mode)
│   │   ├── modals/             # PlaylistEditModal (Canvas cover generator)
│   │   ├── palette/            # CommandPalette (Raycast-style ⌘K fuzzy actions)
│   │   ├── player/             # PlayerControls, TimelineScrubber, Volume, EQ, Visualizer
│   │   ├── table/              # TracklistTable, TracklistRow (React.memo optimized)
│   │   └── theatre/            # NowPlayingTheatre (Shared-element layoutId view)
│   ├── data/
│   │   ├── mockData.ts         # High-resolution audiophile catalog with synced lyrics
│   │   └── repository/         # MockMusicRepository (Async cached service interface)
│   ├── hooks/
│   │   ├── useAudioVisualizer.ts   # 60fps Web Audio FFT hook with visibility pausing
│   │   ├── useDominantColors.ts    # Offscreen canvas palette extractor hook
│   │   └── useGlobalShortcuts.ts   # Global keyboard shortcuts interceptor
│   ├── layouts/
│   │   ├── AppShell.tsx            # Master application shell
│   │   ├── BottomPlayerBar.tsx     # Desktop bottom player bar
│   │   ├── LeftSidebar.tsx         # Resizable navigation & library sidebar
│   │   ├── MobileNavigation.tsx    # Floating glass mini-player pill & mobile tab bar
│   │   ├── RightCompanionPanel.tsx # Bento drawer (Artist info, lyrics, queue)
│   │   └── TopNavBar.tsx           # Global search trigger, history, and tour pill
│   ├── services/
│   │   └── audio/
│   │       └── AudioEngine.ts      # Singleton Web Audio API graph & fallback synth
│   ├── stores/
│   │   ├── useAudioStore.ts        # Zustand audio playback & EQ state
│   │   ├── useLibraryStore.ts      # Zustand library, likes, & custom playlist CRUD
│   │   ├── useUIStore.ts           # Zustand drawer, theme accent, & modal state
│   │   └── useContextMenuStore.ts  # Right-click track context menu store
│   ├── types/                      # TypeScript definitions (Audio, Music, UI)
│   ├── utils/                      # Color extractor, formatters, image fallbacks, cn
│   ├── App.tsx                     # Route configuration
│   ├── index.css                   # Tailwind theme, focus rings, & custom scrollbars
│   └── main.tsx                    # Entry point & PWA service worker registration
├── index.html                      # HTML5 template with PWA meta tags & Google fonts
├── package.json                    # Project scripts & dependencies
├── tailwind.config.js              # Luxury color palette & custom keyframe definitions
├── tsconfig.json                   # Strict TypeScript compiler options
├── vercel.json                     # Production Vercel SPA rewrites & caching headers
└── vite.config.ts                  # Vite build configuration
```

---

## Local Development & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` or `pnpm` / `yarn`

### Installation
```bash
# Clone or navigate to the project directory
cd D:\SONORA

# Install dependencies
npm install

# Start development server with Hot Module Replacement (HMR)
npm run dev
```
The application will launch at `http://localhost:5173/`.

### Production Build & Preview
```bash
# Type check and build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Production Deployment

SONORA is fully preconfigured for **one-click deployment on Vercel**:

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy directly from workspace
vercel --prod
```

### Option 2: Git Repository (GitHub / GitLab / Bitbucket)
1. Push `D:\SONORA` to your Git repository.
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. The included [`vercel.json`](file:///D:/SONORA/vercel.json) automatically sets up:
   - Framework preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - SPA wildcard rewrite: `/(.*) -> /index.html`
   - Immutable cache headers for `/assets/*`
   - Uncached Service Worker updates for `/sw.js`

---

## License & Credits

Developed with precision by the **SONORA Design & Systems Engineering Team**. Inspired by the timeless design standards of Apple Music, Spotify, Bang & Olufsen, and Linear.
