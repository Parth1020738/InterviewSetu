import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0D14",
        surface: {
          1: "#121620",
          2: "#1A202C",
        },
        border: {
          subtle: "#232B3E",
        },
        brand: {
          accent: "#F59E0B",
          DEFAULT: "#F59E0B",
          hover: "#D97706",
        },
        voice: {
          active: "#10B981",
        },
        ai: {
          speaking: "#3B82F6",
        },
        text: {
          primary: "#F8FAFC",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

