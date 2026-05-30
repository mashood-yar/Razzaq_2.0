import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          DEFAULT: "#0A0A08",
          surface: "#111110",
          elevated: "#181816",
          border: "#2A2A26",
          muted: "#3D3D38",
        },
        "ocean-deep": "#1B262C",
        "ocean-surface": "#16213E",
        "ocean-primary": "#0F4C75",
        "ocean-mid": "#3282B8",
        "ocean-light": "#BBE1FA",
        gold: {
          DEFAULT: "#C49A1E",
          bright: "#D4A832",
          deep: "#A07C12",
          light: "#D4A832",
          warm: "#C49A1E",
          subtle: "rgb(212 168 50 / 0.08)",
        },
        "gold-light": "#D4A832",
        "gold-subtle": "#F5EDD6",
        "text-primary": "#F5F0E8",
        "text-secondary": "#C8BFA8",
        "text-muted": "#7A7468",
        success: "#4CAF82",
        error: "#E05A5A",
        border: {
          DEFAULT: "#2A2A26",
          subtle: "#2A2A26",
        },
        "border-subtle": "#2A2A26",

        /* Semantic — wired to CSS variables */
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        ring: "var(--primary)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        contrast: {
          "on-light": "var(--text-on-light)",
          "muted-on-light": "var(--text-muted-on-light)",
          "caption-on-light": "var(--text-caption-on-light)",
          "on-dark": "var(--text-on-dark)",
          "muted-on-dark": "var(--text-muted-on-dark)",
          "on-primary": "var(--text-on-primary)",
          "on-terracotta": "var(--text-on-ocean-mid)",
        },
        warning: "#3282B8",

        /* Legacy warm palette → ocean */
        "rice-paper": "#1B262C",
        "mughal-moss": "#0F4C75",
        terracotta: "#3282B8",
        sand: "#16213E",
        parchment: "#16213E",
        "warm-cream": "#1B262C",
        "warm-sand": "#16213E",
        "warm-accent": "#BBE1FA",
        "luxe-gold": "#B8961E",
        "luxe-gold-bright": "#D4A832",
        obsidian: "#1B262C",
        charcoal: "#16213E",
        graphite: "#1B3A4B",
        ash: "#8BA3B5",
        smoke: "#8BA3B5",
        ivory: "#F3F4F1",
        cream: "#F3F4F1",
        brand: {
          slate: "#0F4C75",
          mist: "#3282B8",
          sky: "#BBE1FA",
          frost: "#F3F4F1",
        },
        "navy-deep": "#1B262C",
        "navy-brand": "#0F4C75",
        "emerald-deep": "#0F4C75",
        "emerald-brand": "#3282B8",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        body: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["Courier Prime", "Courier New", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "2px",
        pill: "9999px",
        luxe: "4px",
      },
      boxShadow: {
        navy: "0 12px 40px -12px rgba(15, 76, 117, 0.35)",
        moss: "0 12px 40px -12px rgba(15, 76, 117, 0.35)",
        ocean: "0 12px 40px -12px rgba(15, 76, 117, 0.35)",
        card: "0 4px 24px rgba(0,0,0,0.6)",
        nocturne: "0 20px 60px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "marquee-seamless": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gold-shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "organic-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(8px, -12px) scale(1.03)" },
        },
      },
      animation: {
        "marquee-row": "marquee-seamless 52s linear infinite",
        "marquee-row-reverse": "marquee-seamless 62s linear infinite reverse",
        "fade-up": "fade-up 0.7s ease-out forwards",
        "gold-shimmer": "gold-shimmer 4s linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "drawer-in": "drawer-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "organic-float": "organic-float 12s ease-in-out infinite",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
        "organic-shimmer":
          "linear-gradient(90deg, var(--muted) 0%, #C49A1E 50%, var(--muted) 100%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
