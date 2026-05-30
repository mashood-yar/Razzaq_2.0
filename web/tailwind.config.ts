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

        /* Gold System */
        gold: {
          deep: "var(--gold-deep)",
          earth: "var(--gold-earth)",
          warm: "var(--gold-warm)",
          bright: "var(--gold-bright)",
          pale: "var(--gold-pale)",
          DEFAULT: "var(--gold-warm)", // backward compat
          light: "var(--gold-bright)",
          muted: "var(--gold-earth)",
        },

        /* Cream System */
        cream: {
          bone: "var(--cream-bone)",
          warm: "var(--cream-warm)",
          muted: "var(--cream-muted)",
          ghost: "var(--cream-ghost)",
        },

        /* Semantic */
        ember: "var(--ember)",
        sage: "var(--sage)",
        "rose-dust": "var(--rose-dust)",
        success: "var(--sage)",
        error: "var(--ember)",
        warning: "var(--gold-earth)",
        info: "var(--gold-deep)",

        /* Legacy Fallbacks mapping to new variables */
        charcoal: "var(--bg-dusk)",
        graphite: "var(--bg-ash)",
        smoke: "var(--cream-muted)",
        ivory: "var(--cream-bone)",
        
        /* Base mapped variables */
        background: "var(--bg-obsidian)",
        foreground: "var(--cream-bone)",
        muted: {
          DEFAULT: "var(--bg-ash)",
          foreground: "var(--cream-muted)",
        },
        card: {
          DEFAULT: "var(--bg-dusk)",
          foreground: "var(--cream-bone)",
        },
        border: "var(--bg-ash)",
        primary: {
          DEFAULT: "var(--gold-warm)",
          foreground: "var(--bg-void)",
        },
        secondary: {
          DEFAULT: "transparent",
          foreground: "var(--cream-bone)",
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
        warning: "#D4A832",

        /* Legacy aliases → Nocturne Doré (storefront); ocean-* kept for admin */
        "rice-paper": "#0A0A08",
        "mughal-moss": "#C49A1E",
        terracotta: "#D4A832",
        sand: "#111110",
        parchment: "#111110",
        "warm-cream": "#0A0A08",
        "warm-sand": "#111110",
        "warm-accent": "#C8BFA8",
        "luxe-gold": "#C49A1E",
        "luxe-gold-bright": "#D4A832",
        obsidian: "#0A0A08",
        charcoal: "#111110",
        graphite: "#181816",
        ash: "#7A7468",
        smoke: "#7A7468",
        ivory: "#F5F0E8",
        cream: "#F5F0E8",
        brand: {
          slate: "#181816",
          mist: "#C49A1E",
          sky: "#D4A832",
          frost: "#F5F0E8",
        },
        "navy-deep": "#0A0A08",
        "navy-brand": "#C49A1E",
        "emerald-deep": "#181816",
        "emerald-brand": "#D4A832",
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
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
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
        "marquee-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      animation: {
        "marquee-row": "marquee-seamless 28s linear infinite",
        "marquee-row-slow": "marquee-seamless 52s linear infinite",
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
