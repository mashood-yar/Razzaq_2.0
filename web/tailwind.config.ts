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
        /* Primary Backgrounds */
        void: "var(--bg-void)",
        obsidian: "var(--bg-obsidian)",
        dusk: "var(--bg-dusk)",
        stone: "var(--bg-stone)",
        ash: "var(--bg-ash)",

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
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["Courier Prime", "Courier New", "monospace"],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '12px',
        pill: '9999px',
        DEFAULT: '4px',
        full: "9999px",
        luxe: "4px", /* Re-map old luxe class */
      },
      boxShadow: {
        modal: "0 32px 80px rgba(0, 0, 0, 0.6)",
        card: "0 8px 32px -8px rgba(0, 0, 0, 0.35)", /* subtle base shadow */
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "luxury": "cubic-bezier(0.25, 0.1, 0.0, 1.0)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
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
        "fade-up": "fade-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-right": "slide-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s ease-in-out infinite",
        "marquee-right": "marquee-right 25s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
