import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        forest: {
          950: "#080e14",
          900: "#0d1620",
          850: "#13202e",
          800: "#1a2a3c",
          700: "#243b53",
          600: "#334e68",
        },
        tactical: {
          950: "#090f17",
          900: "#0e1724",
          850: "#142132",
          800: "#1b2c42",
          700: "#273e5c",
          600: "#38567d",
        },
        emerald: {
          500: "#10b981",
          400: "#34d399",
          neon: "#10b981",
          glow: "rgba(16, 185, 129, 0.2)",
        },
        crimson: {
          neon: "#f43f5e",
          glow: "rgba(244, 63, 94, 0.25)",
        },
        amber: {
          neon: "#f59e0b",
          glow: "rgba(245, 158, 11, 0.2)",
        },
        cyan: {
          neon: "#0ea5e9",
          glow: "rgba(14, 165, 233, 0.2)",
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
        display: ["Outfit", '"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-subtle": "0 4px 20px 0 rgba(0, 0, 0, 0.25)",
        "card-hover": "0 12px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave-bar": "waveBar 1.2s ease-in-out infinite alternate",
      },
      keyframes: {
        waveBar: {
          "0%": { height: "20%" },
          "100%": { height: "100%" },
        }
      }
    },
  },
  plugins: [],
};
export default config;

