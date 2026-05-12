import type { Config } from "tailwindcss";

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
        /* Winter Chill palette */
        obsidian:      "#0B2E33",
        charcoal:      "#0F383F",
        graphite:      "#4F7C82",
        ash:           "#93B1B5",
        smoke:         "#A3C2C6",
        ivory:         "#B8E3E9",
        cream:         "#C8ECF1",
        gold: {
          DEFAULT:     "#B8E3E9",
          light:       "#D4F1F5",
          muted:       "#93B1B5",
          surface:     "#08292E",
        },
        success:       "#3A7D5B",
        error:         "#8B3A3A",
        warning:       "#8B6A2A",

        brand: {
          slate: "#4F7C82",
          mist:  "#93B1B5",
          sky:   "#B8E3E9",
          frost: "#D4F1F5",
        },
        "emerald-deep": "#0B2E33",
        "emerald-brand": "#4F7C82",

        /* Metallic logo gold — distinct from Winter Chill `gold.*` icy accents */
        "luxe-gold": "#C9A84C",
        "luxe-gold-bright": "#d8c470",

        // Semantic aliases (used by shadcn-style components)
        background:    "hsl(var(--background))",
        foreground:    "hsl(var(--foreground))",
        card: {
          DEFAULT:     "hsl(var(--card))",
          foreground:  "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT:     "hsl(var(--muted))",
          foreground:  "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:     "hsl(var(--accent))",
          foreground:  "hsl(var(--accent-foreground))",
        },
        border:        "hsl(var(--border))",
        ring:          "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Didot", "Georgia", "serif"],
        body:    ["var(--font-jost)", "Gill Sans", "Optima", "sans-serif"],
        mono:    ["Courier Prime", "Courier New", "monospace"],
        // legacy aliases
        serif:   ["var(--font-cormorant)", "Didot", "Georgia", "serif"],
        sans:    ["var(--font-jost)", "Gill Sans", "Optima", "sans-serif"],
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "marquee-seamless": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "drawer-in": {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "marquee-row":           "marquee-seamless 52s linear infinite",
        "marquee-row-reverse": "marquee-seamless 62s linear infinite reverse",
        "fade-up":               "fade-up 0.7s ease-out forwards",
        shimmer:                "shimmer 1.2s ease-in-out infinite",
        "drawer-in":           "drawer-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
