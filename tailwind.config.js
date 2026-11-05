/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#060709",
        surface: {
          0: "#0B0D12",
          1: "#12151D",
          2: "#191D28",
          3: "#222736",
          4: "#2D3447",
        },
        emerald: {
          DEFAULT: "#00F59B",
          hover: "#00DF89",
          muted: "rgba(0, 245, 155, 0.15)",
        },
        violet: {
          DEFAULT: "#8B5CF6",
          ambient: "rgba(139, 92, 246, 0.25)",
          glow: "#A78BFA",
        },
        content: {
          primary: "#FFFFFF",
          secondary: "#94A3B8",
          tertiary: "#64748B",
          muted: "#475569",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.06)",
          glass: "rgba(255, 255, 255, 0.12)",
          specular: "rgba(255, 255, 255, 0.18)",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        pill: "9999px",
      },
      boxShadow: {
        "glow-emerald": "0 8px 24px -2px rgba(0, 245, 155, 0.45), 0 2px 8px 0px rgba(0, 245, 155, 0.25)",
        "glow-violet": "0 12px 32px -4px rgba(139, 92, 246, 0.35)",
        "glass-panel": "0 12px 32px -4px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        "glass-capsule": "0 8px 24px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
        "elevation-1": "0 2px 8px -1px rgba(0, 0, 0, 0.4), 0 1px 3px 0px rgba(0, 0, 0, 0.3)",
        "elevation-2": "0 12px 28px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.4)",
        "elevation-3": "0 24px 54px -8px rgba(0, 0, 0, 0.8), 0 8px 24px -4px rgba(0, 0, 0, 0.5)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
}
