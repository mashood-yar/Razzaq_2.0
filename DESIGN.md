# DESIGN.md — Razzaq Luxe
**Version:** 1.1 · **Updated:** May 2025  
**Purpose:** Complete design system + implementation spec for Cursor. This file is the single source of truth for every visual, structural, and functional decision on the Razzaq Luxe e-commerce platform.

> A luxury fashion & lifestyle e-commerce platform. Every pixel should feel like it belongs in a Milan showroom. Quiet confidence. Editorial restraint. Built to convert.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Brand Identity](#3-brand-identity)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Spacing & Layout](#6-spacing--layout)
7. [Border, Radius & Elevation](#7-border-radius--elevation)
8. [Components](#8-components)
9. [Motion & Animation](#9-motion--animation)
10. [Iconography](#10-iconography)
11. [Imagery & Media](#11-imagery--media)
12. [Pages & Routes](#12-pages--routes)
13. [Forms](#13-forms)
14. [Payments & Currency](#14-payments--currency)
15. [Shipping & Tracking](#15-shipping--tracking)
16. [Admin Dashboard](#16-admin-dashboard)
17. [Responsive Breakpoints](#17-responsive-breakpoints)
18. [Accessibility](#18-accessibility)
19. [Development Priorities](#19-development-priorities)
20. [Design Tokens](#20-design-tokens)
21. [Do & Don't](#21-do--dont)

---

## 1. Project Overview

| Property | Value |
|---|---|
| **Brand** | Razzaq Luxe |
| **Tagline** | *Crafted for the exceptional.* |
| **Category** | Luxury fashion & lifestyle e-commerce |
| **Platform** | Web (mobile-first, responsive) |
| **Primary market** | Pakistan (PKR) · Secondary: international (USD) |
| **Default language** | English |
| **Default currency** | PKR with USD toggle |

### Core Capabilities

| Feature | Description |
|---|---|
| Product catalogue | Collections, filters, size guide, zoom, variants (color/size) |
| Cart & checkout | Guest + registered checkout, promo codes, order summary |
| Accounts | Register, login, wishlist, order history, address book |
| Payments | Stripe, COD, JazzCash, EasyPaisa, multi-currency |
| Shipping & tracking | Local & international rates, real-time order tracking |
| Admin dashboard | Inventory, orders, analytics, discount management |

---

## 2. Tech Stack

### Recommended Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS | SSR + static generation for product pages |
| **Backend** | Node.js + Supabase | Auth, DB, real-time, storage |
| **CMS** | Sanity.io | Headless CMS for products, collections, editorial content |
| **Payments** | Stripe + JazzCash + EasyPaisa | Stripe for cards; JazzCash/EasyPaisa for PK mobile wallets |
| **Hosting** | Vercel (frontend) + Cloudflare CDN | Edge functions, image optimisation, global CDN |
| **Search** | Algolia | Instant product search with faceted filters |
| **Email** | Resend / SendGrid | Transactional emails (orders, shipping, welcome) |
| **Analytics** | Vercel Analytics + PostHog | Core metrics + session replay |

### File Structure (Next.js App Router)

```
/app
  /(store)
    /page.tsx                        → Homepage
    /collections/[slug]/page.tsx
    /products/[slug]/page.tsx
    /search/page.tsx
    /cart/page.tsx
    /checkout/page.tsx
    /account/
      /orders/page.tsx
      /wishlist/page.tsx
      /addresses/page.tsx
      /settings/page.tsx
    /order/[id]/page.tsx             → Order tracking
  /(auth)
    /login/page.tsx
    /register/page.tsx
    /forgot-password/page.tsx
  /(info)
    /about/page.tsx
    /contact/page.tsx
    /policies/[slug]/page.tsx        → privacy, returns, shipping, terms
  /admin/
    /dashboard/page.tsx
    /products/page.tsx
    /orders/page.tsx
    /customers/page.tsx
    /analytics/page.tsx
    /discounts/page.tsx
/components
  /ui/          → Primitives: Button, Input, Badge, etc.
  /layout/      → Nav, Footer, CartDrawer, MobileMenu
  /product/     → ProductCard, ProductGallery, SizeSelector, etc.
  /checkout/    → CheckoutSteps, OrderSummary, PaymentForm
  /account/     → AccountSidebar, OrderRow, AddressCard
/lib
  /sanity/      → CMS client, queries, types
  /supabase/    → DB client, auth helpers
  /stripe/      → Payment intent, webhooks
  /utils/       → formatPrice, cn, etc.
```

---

## 3. Brand Identity

| Property | Value |
|---|---|
| **Tone** | Refined · Exclusive · Quiet confidence |
| **Archetype** | The Sage meets The Ruler — timeless authority with editorial intellect |
| **Personality words** | Heritage · Bespoke · Understated · Elevated · Curated |
| **Mode** | Dark mode default; light mode available as toggle |
| **Avoid** | Loud, garish, discount-feel, cluttered, fast-fashion energy |

---

## 4. Color System

The palette is built on near-black and warm ivory, punctuated by a single gold accent. Gold is a luxury signal — use it sparingly.

### CSS Variables

```css
:root {
  /* Foundations — dark mode default */
  --color-obsidian:      #0D0C0A;   /* page background */
  --color-charcoal:      #1A1814;   /* card / surface */
  --color-graphite:      #2C2921;   /* borders, subtle surfaces */
  --color-ash:           #6B6560;   /* muted text, dividers */
  --color-smoke:         #A09890;   /* secondary text */
  --color-ivory:         #F5F0E8;   /* primary text on dark */
  --color-cream:         #EDE8DF;   /* body text on dark */

  /* Brand Accent */
  --color-gold:          #C9A84C;   /* primary accent — CTAs, highlights */
  --color-gold-light:    #E0C47A;   /* hover states */
  --color-gold-muted:    #8A6E2F;   /* subtle accents */
  --color-gold-surface:  #1E1A0F;   /* gold-tinted background */

  /* Semantic */
  --color-success:       #3A7D5B;
  --color-error:         #8B3A3A;
  --color-warning:       #8B6A2A;
  --color-info:          #2A4A6B;

  /* Light mode overrides */
  --color-bg-light:      #F5F0E8;
  --color-surface-light: #EDEAE2;
  --color-border-light:  #D8D3CA;
  --color-text-light:    #1A1814;
}
```

### Color Role Map

| Role | Dark Mode | Light Mode |
|---|---|---|
| Page background | `--color-obsidian` | `--color-bg-light` |
| Card / surface | `--color-charcoal` | `--color-surface-light` |
| Border | `--color-graphite` | `--color-border-light` |
| Body text | `--color-cream` | `--color-text-light` |
| Muted text | `--color-smoke` | `--color-ash` |
| Primary CTA | `--color-gold` | `--color-gold` |
| Destructive | `--color-error` | `--color-error` |

### Usage Rules

- Dark mode is the **default**. Light mode is a user-togglable preference.
- Gold is used **once per section** — never competing with itself.
- Never use pure `#000` or `#FFF` — always use the CSS variables above.
- Surface depth stacks: `obsidian → charcoal → graphite`. Never skip levels.

---

## 5. Typography

Typography is the most important differentiator. The pairing should feel like a luxury print magazine.

### Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

:root {
  --font-display: 'Cormorant Garamond', 'Didot', Georgia, serif;
  --font-body:    'Jost', 'Gill Sans', 'Optima', sans-serif;
  --font-mono:    'Courier Prime', 'Courier New', monospace;
}
```

**Cormorant Garamond** — hero headings, product names, collection titles, pull quotes, editorial copy.  
**Jost** — all UI text: navigation, body copy, labels, buttons, prices, form fields.  
**Courier Prime** — order IDs, tracking numbers, admin data tables.

### Type Scale

```css
:root {
  /* Display (Cormorant Garamond) */
  --text-hero:    clamp(3rem, 7vw, 7rem);
  --text-display: clamp(2.25rem, 5vw, 4.5rem);
  --text-title:   clamp(1.5rem, 3vw, 2.5rem);
  --text-heading: clamp(1.125rem, 2vw, 1.5rem);

  /* UI (Jost) */
  --text-lg:   1.125rem;
  --text-base: 1rem;
  --text-sm:   0.875rem;
  --text-xs:   0.75rem;

  /* Letter spacing */
  --tracking-tight:   -0.02em;
  --tracking-normal:   0em;
  --tracking-wide:     0.08em;
  --tracking-widest:   0.18em;

  /* Line height */
  --leading-tight:  1.1;
  --leading-snug:   1.3;
  --leading-normal: 1.6;
  --leading-loose:  1.8;
}
```

### Type Usage Rules

| Element | Font | Weight | Style |
|---|---|---|---|
| Hero headline | Cormorant Garamond | 300 | Italic, `--text-hero` |
| Product name | Cormorant Garamond | 400 | Normal |
| Collection title | Cormorant Garamond | 300 | Normal |
| Pull quotes | Cormorant Garamond | 300 | Italic, 32–48px |
| Navigation labels | Jost | 300 | Uppercase, widest tracking |
| Body copy | Jost | 300 | `leading-loose` |
| Prices | Jost | 500 | Tabular nums |
| CTA buttons | Jost | 500 | Uppercase, wide tracking |
| Section eyebrows | Jost | 300 | Uppercase, widest, gold, 11px |
| Form labels | Jost | 300 | Uppercase, widest, 11px |
| Order IDs | Courier Prime | 400 | Mono |

---

## 6. Spacing & Layout

### Spacing Scale

```css
:root {
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   24px;
  --space-6:   32px;
  --space-7:   48px;
  --space-8:   64px;
  --space-9:   96px;
  --space-10:  128px;
  --space-11:  192px;
}
```

### Container & Grid

```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding-inline: clamp(1.5rem, 5vw, 6rem);
}

/* Standard product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

/* Editorial / asymmetric layout */
.editorial-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-8);
}

/* Sidebar + content */
.page-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-8);
}
```

### Layout Principles

- Section padding minimum: `var(--space-9)` top and bottom.
- Hero sections are `100dvh`.
- Never center-align body copy — left-align for reading; center only for hero headlines ≤3 lines.
- Content max-width: **1440px**; editorial inner max: **1200px**.

---

## 7. Border, Radius & Elevation

```css
:root {
  --radius-none: 0px;
  --radius-sm:   2px;
  --radius-md:   6px;
  --radius-lg:   12px;
  --radius-xl:   20px;
  --radius-full: 9999px;

  --border-thin:  1px solid var(--color-graphite);
  --border-gold:  1px solid var(--color-gold-muted);
  --border-focus: 2px solid var(--color-gold);

  --shadow-modal: 0 32px 80px rgba(0, 0, 0, 0.6);
}
```

**Elevation philosophy:** Depth via background-color shifts and borders — not shadows. Shadows are reserved exclusively for modals and drawers.

---

## 8. Components

### 8.1 Navigation

**Structure:**
```
[RL monogram logo] | Collections  New In  Lookbook  About | [Search] [Wishlist] [Bag (3)]
```

- Fixed top, full-width, `height: 72px`
- Background: transparent on hero → `--color-obsidian` + `--border-thin` bottom on scroll
- Logo: gold monogram "RL", Cormorant Garamond italic 24px
- Links: Jost 300, uppercase, `--tracking-widest`, 12px, `--color-smoke` → `--color-ivory` on hover
- Icons: 40px tap target, Phosphor `weight="light"` 22px
- Cart badge: 16px circle, `--color-gold` bg, `--color-obsidian` text, Jost 500 10px
- Mobile: hamburger → full-screen slide-from-left drawer

---

### 8.2 Hero Banner

**Structure:**
```
[Full-bleed image or video — 100dvh]
  Eyebrow: "New Collection — SS 2025"     ← Jost 300 uppercase gold 11px
  Headline: "The Art of Quiet Luxury"     ← Cormorant italic --text-hero white
  Subline: "Handcrafted pieces for those who know."
  [CTA: "Explore Collection →"]
```

- Image/video: `object-fit: cover`, `width: 100%`, `height: 100dvh`
- Overlay: `linear-gradient(to top, rgba(13,12,10,0.85) 0%, transparent 60%)`
- Text anchored bottom-left, `padding: var(--space-9)`
- CTA fades in 400ms after headline animation completes

---

### 8.3 Buttons

```css
/* Primary — gold fill */
.btn-primary {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-obsidian);
  background: var(--color-gold);
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 250ms ease, transform 150ms ease;
}
.btn-primary:hover  { background: var(--color-gold-light); }
.btn-primary:active { transform: scale(0.98); }

/* Secondary — outlined */
.btn-secondary {
  background: transparent;
  color: var(--color-ivory);
  border: 1px solid var(--color-ivory);
  transition: background 250ms ease, color 250ms ease;
}
.btn-secondary:hover {
  background: var(--color-ivory);
  color: var(--color-obsidian);
}

/* Ghost — text + arrow */
.btn-ghost {
  background: transparent;
  color: var(--color-gold);
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
.btn-ghost::after { content: '→'; transition: transform 200ms ease; }
.btn-ghost:hover::after { transform: translateX(4px); }

/* Destructive */
.btn-destructive {
  background: var(--color-error);
  color: var(--color-ivory);
}
```

---

### 8.4 Product Card

**Visual layout:**
```
┌───────────────────────────┐
│   [Image — 3:4 aspect]    │
│   [♡ Wishlist] top-right  │
│   [Quick View] on hover   │
├───────────────────────────┤
│  LAWN · UNSTITCHED        │  ← eyebrow (Jost 300 uppercase gold 10px)
│  Gulbarg Collection       │  ← product name (Cormorant 400 18px ivory)
│  PKR 12,500               │  ← price (Jost 500 14px ivory)
│  ● ○ ●  (color swatches)  │  ← 10px dots
└───────────────────────────┘
```

- Card bg: `--color-charcoal`, `--radius-lg`
- Image: `aspect-ratio: 3/4`, `overflow: hidden`
- Hover: image scales to `1.04` over `600ms`
- Wishlist icon: `opacity: 0 → 1` on card hover, 200ms
- Quick View slides in from bottom on hover
- "Add to Bag" ghost bar slides from card bottom on hover
- Badge (`NEW`, `SALE`, `SOLD OUT`) — top-left of image

**Badges:**
```css
.badge-new     { background: var(--color-gold-surface); color: var(--color-gold); }
.badge-sale    { background: var(--color-error); color: var(--color-ivory); }
.badge-soldout { background: var(--color-graphite); color: var(--color-smoke); }
.badge-limited { border: 1px solid var(--color-gold-muted); color: var(--color-gold); }
```

---

### 8.5 Form Elements

```css
.input {
  width: 100%;
  height: 52px;
  padding: 0 var(--space-4);
  background: var(--color-charcoal);
  border: 1px solid var(--color-graphite);
  border-radius: var(--radius-md);
  color: var(--color-ivory);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 300;
  transition: border-color 200ms ease;
}
.input::placeholder { color: var(--color-ash); }
.input:focus        { outline: none; border-color: var(--color-gold); }
.input.error        { border-color: var(--color-error); }

.textarea {
  /* same as .input */
  height: auto;
  min-height: 120px;
  padding: var(--space-4);
  resize: vertical;
}

.label {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 300;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-smoke);
  display: block;
  margin-bottom: var(--space-2);
}

.field-error {
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: var(--space-1);
}
```

---

### 8.6 Size Selector

```css
.size-pill {
  min-width: 44px;
  height: 44px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-graphite);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-ivory);
  background: transparent;
  cursor: pointer;
  transition: border-color 200ms, background 200ms;
}
.size-pill--active   { border-color: var(--color-gold); color: var(--color-gold); }
.size-pill--disabled { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }
```

Use `role="radiogroup"` on the wrapper; `role="radio"` + `aria-checked` on each pill.

---

### 8.7 Color Swatch Selector

```css
.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 150ms;
}
.color-swatch--active  { border-color: var(--color-gold); }
.color-swatch--soldout { opacity: 0.4; cursor: not-allowed; }
```

---

### 8.8 Cart Drawer

**Structure:**
```
[Overlay — rgba(0,0,0,0.6)]
┌──────────────────── Slides from right ────────────┐
│  Your Bag (3)                              [×]     │
│  ─────────────────────────────────────────────    │
│  [Thumb] Product Name                             │
│          Variant: Black / M                       │
│          PKR 12,500      [−][1][+]    [🗑]         │
│  ─────────────────────────────────────────────    │
│  Subtotal                         PKR 25,000      │
│  [Promo code input]       [Apply]                 │
│  [Checkout →]  ← btn-primary full-width           │
└───────────────────────────────────────────────────┘
```

- Width: `420px` desktop / `100vw` mobile
- Background: `--color-charcoal`, `--shadow-modal`
- Subtotal pinned to bottom
- Empty state: Cormorant italic "Your bag is empty." + ghost CTA

---

### 8.9 Quantity Stepper

```css
.quantity-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-graphite);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.quantity-btn {
  width: 36px; height: 36px;
  background: transparent; border: none;
  color: var(--color-ivory); cursor: pointer;
  transition: background 150ms;
}
.quantity-btn:hover { background: var(--color-graphite); }
.quantity-value {
  min-width: 36px; text-align: center;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-ivory);
}
```

---

### 8.10 Accordion

```css
.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-graphite);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-ivory);
}
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 500ms var(--ease-in-out);
  font-family: var(--font-body);
  font-weight: 300;
  font-size: var(--text-base);
  color: var(--color-smoke);
  line-height: var(--leading-loose);
}
.accordion--open .accordion-content { max-height: 600px; }
```

---

### 8.11 Modal

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: var(--color-charcoal);
  border: var(--border-thin);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  max-width: 640px; width: 90%;
  max-height: 90dvh; overflow-y: auto;
  padding: var(--space-7);
}
```

Used for: size guide, image zoom, quick view, address form.

---

### 8.12 Toast Notification

```css
.toast {
  position: fixed; bottom: var(--space-6); right: var(--space-6);
  background: var(--color-charcoal);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-ivory);
  display: flex; align-items: center; gap: var(--space-3);
  animation: slideUp 300ms var(--ease-out-expo) forwards;
  z-index: 200;
}
.toast--success { border-left: 3px solid var(--color-success); }
.toast--error   { border-left: 3px solid var(--color-error); }
```

---

## 9. Motion & Animation

Animation is deliberate — like the movement of fine fabric. Nothing bounces or spins.

```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-luxury:   cubic-bezier(0.25, 0.1, 0.0, 1.0);

  --duration-fast:  150ms;
  --duration-base:  250ms;
  --duration-slow:  500ms;
  --duration-crawl: 800ms;
}
```

### Animation Patterns

| Element | Animation | Duration |
|---|---|---|
| Page entry | Fade + `translateY(24px → 0)`, staggered | `--duration-slow` |
| Hero headline | Clip reveal, word-by-word | 80ms stagger per word |
| Cart drawer | `translateX(100% → 0)` | `--duration-slow`, `ease-out-expo` |
| Product image hover | `scale(1.04)` | `--duration-slow`, `ease-luxury` |
| Product image change | Crossfade | `--duration-slow` |
| Accordion open | `max-height` expand | `--duration-slow`, `ease-in-out` |
| Toast entry | `translateY(24px → 0)` | `300ms`, `ease-out-expo` |
| Ghost CTA arrow | `translateX(4px)` | `--duration-base` |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Iconography

Use **Phosphor Icons** throughout, `weight="light"`, outline style.

```html
<script src="https://unpkg.com/phosphor-icons"></script>
```

| Context | Size |
|---|---|
| Navigation | 22px |
| Product card | 20px |
| Inline body | 16px |
| Decorative / hero | 40–64px |

Always use `weight="light"`. Gold color only on active/selected states (e.g. saved wishlist).

---

## 11. Imagery & Media

### Photography Direction

- Mood: Low-key lit, natural textures, editorial restraint
- Backgrounds: warm neutrals (cream, stone, taupe) — never pure white studios
- Colour grade: warm shadows, desaturated highlights
- Models: composed, confident, aspirational stillness

### Image Specs

| Usage | Aspect Ratio | Min Resolution | Format |
|---|---|---|---|
| Hero banner | 16:9 or 21:9 | 2560×1080 | WebP + JPEG |
| Product main | 3:4 | 1200×1600 | WebP + JPEG |
| Product thumbnail | 1:1 | 400×400 | WebP |
| Collection cover | 4:5 | 1080×1350 | WebP |
| Lookbook editorial | 2:3 | 1200×1800 | WebP |
| About / team | 1:1 | 800×800 | WebP |

### Performance

- All images via Cloudflare CDN with lazy loading
- `srcset` for responsive sizes; WebP with JPEG fallback
- Hero images preloaded: `<link rel="preload" as="image">`
- Blur-up LQIP placeholder while loading
- Video banners: `autoplay muted loop playsinline`, `preload="none"` on mobile

---

## 12. Pages & Routes

### 12.1 Homepage `/`

**Section order:**
1. **Hero** — Full-bleed video/image, animated headline, single CTA "Explore Collection →"
2. **Category tiles** — 3-column grid; hover reveals description; Cormorant italic name overlay
3. **Featured products** — "The Edit" heading; 4-up grid; horizontal scroll on mobile
4. **Lookbook strip** — Full-width horizontal scroll; editorial photos with text overlay
5. **Brand statement** — Full-width large Cormorant pull quote; dark bg; no images
6. **Instagram feed** — 6-column grid; desaturated → colour reveal on hover
7. **Newsletter** — Centered: eyebrow + heading + email input + CTA

---

### 12.2 Collections `/collections/[slug]`

**Layout:**
```
[Collection hero banner — Cormorant display name]
┌─────────────────┬─────────────────────────────────────────┐
│ Filter panel    │ Sort: [Featured ▾]   Showing 24 of 86   │
│ (240px sticky)  │                                         │
│  Category ▾     │  [Product grid — 4 columns]             │
│  Size ▾         │                                         │
│  Color ▾        │  [Load More — ghost button, centered]   │
│  Price ▾        │                                         │
└─────────────────┴─────────────────────────────────────────┘
```

- Active filters: dismissible chips below collection title
- On mobile: filter panel becomes bottom sheet
- Product count: "Showing 24 of 86 pieces" — Jost 300 12px `--color-smoke`

---

### 12.3 Product Detail `/products/[slug]`

**Layout:**
```
┌──────────────────────────────┬──────────────────────────────┐
│  Gallery (55%) — sticky      │  Product info (45%)          │
│  [Large image]               │  Category eyebrow (gold)     │
│  [Thumbnails — vertical]     │  Product name (Cormorant 36) │
│                              │  Price (Jost 500)            │
│                              │  ─────────────────           │
│                              │  Color swatches              │
│                              │  Size selector + Size guide  │
│                              │  Quantity stepper            │
│                              │  [Add to Bag — btn-primary]  │
│                              │  [Add to Wishlist — ghost]   │
│                              │  ─────────────────           │
│                              │  Accordion: Description      │
│                              │  Accordion: Size & Fit       │
│                              │  Accordion: Delivery & Ret.  │
└──────────────────────────────┴──────────────────────────────┘
[Complete the Look — 3 related products]
[Recently Viewed — horizontal scroll, max 6]
```

- Gallery sticky: `top: 72px; height: calc(100dvh - 72px)`
- Image zoom on click → modal lightbox; keyboard + swipe navigation
- **Sticky Add to Bag bar (mobile only):** fixed bottom bar appears when main CTA scrolls out of view
- Size guide opens in modal (not new page)

---

### 12.4 Search `/search`

- Search bar full-width, pre-focused
- Results: tabbed — Products · Collections · Editorial
- Algolia InstantSearch for real-time results
- No results: "We couldn't find anything for [query]" + suggestions

---

### 12.5 Cart `/cart`

- Full-page cart: line items (left) + order summary (right)
- Order summary: subtotal · estimated shipping · discount · total
- Promo code field + "Apply"
- Trust badges: "Secure checkout · Free returns · Authentic luxury"
- CTA: "Proceed to Checkout →" (btn-primary)

---

### 12.6 Checkout `/checkout`

**3-step flow with progress indicator:**
```
Progress bar (gold):  [1 Details] ──── [2 Shipping] ──── [3 Payment]
```

**Step 1 — Details:**
- Email + "Continue as guest / Sign in" toggle
- First name, Last name, Phone number

**Step 2 — Shipping:**
- Address line 1, Address line 2 (optional)
- City, Province, Postal code, Country
- Shipping method selection with carrier + ETA + price

**Step 3 — Payment:**
- Payment tabs: Card · JazzCash · EasyPaisa · Cash on Delivery
- Card: Stripe Elements embedded
- JazzCash / EasyPaisa: phone number + OTP flow
- COD: confirmation message only
- Order summary (collapsible on mobile)
- "Place Order" button disabled until form valid

**Checkout shell:**
- Remove main nav — show only logo + "Need help?" link
- Gold progress bar under simplified header

---

### 12.7 My Account `/account`

**Sidebar navigation:** Orders · Wishlist · Addresses · Settings

**Orders tab:**
- List: Order ID · Date · Items · Total · Status badge · "View" link
- Status badges: Processing · Shipped · Delivered · Cancelled

**Wishlist tab:**
- Product grid with "Add to Bag" + "Remove"
- Empty state: "Your wishlist is empty." + ghost CTA

**Addresses tab:**
- Cards: Edit · Delete · Set as default
- "Add new address" → opens modal form

**Settings tab:**
- Update name, email, password
- Delete account → destructive confirmation modal

---

### 12.8 Order Tracking `/order/[id]`

1. Header: Order #ID · Date · Status badge
2. Tracking timeline (vertical stepper): Placed ✓ · Processing ✓ · Shipped (carrier + link) · Out for delivery · Delivered
3. Shipping address summary
4. Line items: thumbnails + names + quantities
5. Order total breakdown

---

### 12.9 About `/about`

- Brand story: full-width editorial, large Cormorant display
- Founding values: 3-column icon + text cards
- Team: image grid, names/roles on hover
- "Shop the Collection" CTA

---

### 12.10 Contact `/contact`

See [§13.3 Contact Form](#133-contact-form).

Additional info:
- Email address
- Business hours
- WhatsApp link
- Map embed (optional)

---

### 12.11 Policies `/policies/[slug]`

Slugs: `privacy-policy` · `return-policy` · `shipping-policy` · `terms-of-service`

- Max-width 720px, centered, editorial layout
- Cormorant display headline + Jost body
- Last updated date in `--color-smoke` below title
- Table of contents with anchor links

---

## 13. Forms

### 13.1 Register Form `/register`

```
Full Name           [text — required, min 2 chars]
Email Address       [email — required, valid format]
Password            [password + show/hide — required, min 8 chars, 1 uppercase, 1 number]
Confirm Password    [password — must match]
                    [Create Account — btn-primary full-width]
                    [Already have an account? Sign in →]
```

---

### 13.2 Login Form `/login`

```
Email Address       [email — required]
Password            [password + show/hide]     [Forgot password? →]
                    [Sign In — btn-primary full-width]
                    [Continue as guest →]
                    [Don't have an account? Register →]
```

---

### 13.3 Contact Form `/contact`

```
Full Name           [text — required]
Email Address       [email — required]
Subject             [select: Order Enquiry / Returns / Product Info / Other]
Message             [textarea — required, min 20 chars]
                    [Send Message — btn-primary]
```

On success: replace form with Cormorant italic confirmation. Send auto-reply via Resend.

---

### 13.4 Address Form

Used in: Checkout Step 2 + Account Addresses (modal)

```
First Name [text]         Last Name [text]
Address Line 1            [text — full width, required]
Address Line 2            [text — full width, optional]
City [text]               Postal Code [text]
Province [select]         Country [select, default: Pakistan]
Phone Number              [tel — required]
□ Save as default address
                          [Save Address — btn-primary]
```

---

### 13.5 Promo Code Form

Used in: Cart page + cart drawer

```
[Input — placeholder: "Enter promo code"]    [Apply →]
```

- Valid code: green inline message, discount applied
- Invalid code: red inline error "Code not valid or expired"
- Applied code: dismissible chip

---

### 13.6 Newsletter Form

Used in: Homepage + footer

```
[Email input — placeholder: "Your email address"]    [Subscribe →]
```

- On success: input replaced with "Thank you for subscribing."
- Error: "Please enter a valid email."

---

### 13.7 Password Reset

**Forgot** `/forgot-password`:
```
Email Address    [email — required]
                 [Send Reset Link — btn-primary]
```

**Reset** `/reset-password?token=...`:
```
New Password     [password — required]
Confirm Password [password — must match]
                 [Reset Password — btn-primary]
```

---

## 14. Payments & Currency

### Payment Methods

| Method | Type | Availability |
|---|---|---|
| Credit / Debit Card | Stripe Elements | All orders |
| JazzCash | Mobile wallet | Pakistan only |
| EasyPaisa | Mobile wallet | Pakistan only |
| Cash on Delivery | COD | Domestic orders only |

### Stripe Integration

```js
// Server: create payment intent (amounts in paisa for PKR)
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalInPaisa,
  currency: 'pkr',
  automatic_payment_methods: { enabled: true },
  metadata: { orderId, userId },
});

// Client: Stripe Elements (not redirect)
const elements = stripe.elements({ clientSecret });
const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');
```

### Currency Display

```js
const formatPKR = (amount) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', minimumFractionDigits: 0,
  }).format(amount);
// → PKR 12,500

const formatUSD = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
  }).format(amount);
```

- Default: **PKR** · Toggle in header → USD (display-only conversion)
- Exchange rate: fetched daily, cached in Supabase
- All stored prices in PKR

### Order States

```
pending → confirmed → processing → shipped → out_for_delivery → delivered
                                ↘ cancelled
                                ↘ refunded
```

---

## 15. Shipping & Tracking

### Shipping Options

| Option | Carrier | ETA | Notes |
|---|---|---|---|
| Standard domestic | TCS / Leopards | 3–5 business days | Pakistan |
| Express domestic | TCS / Leopards | 1–2 business days | Pakistan |
| International Economy | DHL | 7–14 days | Worldwide |
| International Express | DHL | 3–5 days | Worldwide |
| Free shipping | — | — | PKR 5,000+ domestic orders |

### Tracking

- Domestic: TCS / Leopards webhook → update Supabase order status
- International: DHL tracking API
- Customer view: timeline stepper on `/order/[id]`
- Email notification at every status change (Resend)

### Shipping Rate Logic

```js
const getShippingRate = ({ weight, destination, subtotal }) => {
  if (destination === 'PK' && subtotal >= 5000) return 0;
  if (destination === 'PK') return weight <= 1 ? 250 : 250 + (weight - 1) * 100;
  return destination === 'intl_economy' ? 2500 : 4500;
};
```

---

## 16. Admin Dashboard

All routes under `/admin` — protected, `role: admin` only.

### 16.1 Dashboard `/admin/dashboard`

**KPI cards:** Total revenue · Total orders · New customers · Conversion rate (today/week/month toggle)

**Charts:**
- Revenue over time — line chart, last 30 days
- Orders by status — donut chart
- Top products — horizontal bar chart

---

### 16.2 Products `/admin/products`

**Table:** Thumbnail · Name · SKU · Price · Stock · Status · Actions (Edit / Duplicate / Archive)

**Add/Edit product form:**
```
Product name          [text]
Slug                  [text, auto-generated from name]
Description           [rich text / markdown]
Category              [select]
Collections           [multi-select]
Price (PKR)           [number]
Compare-at price      [number — optional, shows "was" price]
SKU                   [text]
Stock quantity        [number]
Variants              [color + size matrix builder]
Images                [drag-drop upload, reorderable, max 8]
Status                [Draft / Active / Archived]
Tags                  [text chips]
SEO title             [text]
SEO description       [textarea]
```

---

### 16.3 Orders `/admin/orders`

**Table:** Order ID · Date · Customer · Items · Total · Payment · Status · Actions

**Filters:** Status · Date range · Payment method

**Order detail actions:**
- Mark as shipped (enter tracking number)
- Mark as delivered
- Cancel order
- Refund (full or partial via Stripe)

---

### 16.4 Customers `/admin/customers`

**Table:** Name · Email · Phone · Orders · Total spent · Joined · Actions

**Customer detail:** Order history · Saved addresses · Account status (active / banned)

---

### 16.5 Analytics `/admin/analytics`

- Revenue chart (30/60/90 days)
- Sessions + conversion funnel
- Top products by revenue and by units
- Customer acquisition source
- Geographic breakdown (Pakistan cities)

---

### 16.6 Discounts `/admin/discounts`

**Table:** Code · Type · Value · Usage · Expires · Status

**Create discount form:**
```
Code                  [text — or auto-generate]
Type                  [Percentage / Fixed amount / Free shipping]
Value                 [number]
Minimum order         [number — optional]
Usage limit           [number — optional]
Expiry date           [date picker]
Applicable to         [All / Specific collections / Specific products]
```

---

## 17. Responsive Breakpoints

```css
:root {
  --bp-sm:  640px;
  --bp-md:  768px;
  --bp-lg:  1024px;
  --bp-xl:  1280px;
  --bp-2xl: 1536px;
}
```

| Element | Desktop (>1024) | Tablet (768–1024) | Mobile (<768) |
|---|---|---|---|
| Navigation | Full horizontal | Full horizontal | Hamburger drawer |
| Hero text | `--text-hero` | 4rem | 2.5rem |
| Product grid | 4 columns | 2–3 columns | 2 columns |
| Product detail | Side-by-side | Side-by-side | Stacked |
| Cart | Side drawer | Side drawer | Full screen |
| Filters | Left sidebar | Slide-in drawer | Bottom sheet |
| Checkout | 2-column | 2-column | 1 column |
| Account | Sidebar + content | Sidebar + content | Tab nav |
| Admin tables | Full columns | Horizontal scroll | Card view |
| Container padding | 6rem | 3rem | 1.5rem |

---

## 18. Accessibility

- WCAG 2.1 AA compliance minimum
- Gold (`#C9A84C`) on obsidian (`#0D0C0A`) — contrast **6.8:1** ✓
- Ivory (`#F5F0E8`) on obsidian — contrast **15.3:1** ✓
- All interactive elements: `outline: var(--border-focus); outline-offset: 3px`
- Images: descriptive `alt`; decorative use `alt=""`
- Full keyboard navigation throughout
- `aria-live` for cart updates, form feedback
- Size selector: `role="radiogroup"` + `role="radio"` + `aria-checked`
- Skip-to-main-content link as first focusable element
- Modals: focus trap on open, restore on close
- Form errors: `aria-describedby` linking field to error message

---

## 19. Development Priorities

### Phase 1 — Must Have (Launch)

- [ ] Product catalogue: collections, filters, variants, size guide, zoom
- [ ] Cart (drawer + full page)
- [ ] Checkout (3-step) + order confirmation email
- [ ] Payments: Stripe + JazzCash + EasyPaisa + COD
- [ ] User accounts: register, login, order history, wishlist, addresses
- [ ] Admin: products CRUD, orders management, basic inventory
- [ ] Order tracking page
- [ ] Pages: Home, Collections, Product, Search, Cart, Checkout, Account, Order Tracking, About, Contact, Policies

### Phase 2 — Should Have (Post-launch)

- [ ] Lookbook editorial section
- [ ] Loyalty / reward points system
- [ ] Product reviews & ratings
- [ ] Blog / editorial content
- [ ] Full admin analytics dashboard
- [ ] Discount codes + promotions
- [ ] Email marketing: welcome sequence, abandoned cart, shipping notifications

### Phase 3 — Nice to Have

- [ ] AI size recommendation
- [ ] Live chat support (Crisp / Intercom)
- [ ] Product comparison tool
- [ ] Saved size profiles
- [ ] Wholesale / B2B portal

---

## 20. Design Tokens

```json
{
  "color": {
    "obsidian":     "#0D0C0A",
    "charcoal":     "#1A1814",
    "graphite":     "#2C2921",
    "ash":          "#6B6560",
    "smoke":        "#A09890",
    "ivory":        "#F5F0E8",
    "cream":        "#EDE8DF",
    "gold":         "#C9A84C",
    "gold-light":   "#E0C47A",
    "gold-muted":   "#8A6E2F",
    "gold-surface": "#1E1A0F",
    "success":      "#3A7D5B",
    "error":        "#8B3A3A",
    "warning":      "#8B6A2A"
  },
  "font": {
    "display": "Cormorant Garamond",
    "body":    "Jost",
    "mono":    "Courier Prime"
  },
  "spacing": {
    "1":"4px",  "2":"8px",   "3":"12px",  "4":"16px",
    "5":"24px", "6":"32px",  "7":"48px",  "8":"64px",
    "9":"96px", "10":"128px","11":"192px"
  },
  "radius": {
    "none":"0px", "sm":"2px", "md":"6px",
    "lg":"12px",  "xl":"20px","full":"9999px"
  },
  "duration": {
    "fast":"150ms", "base":"250ms",
    "slow":"500ms", "crawl":"800ms"
  }
}
```

---

## 21. Do & Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use generous whitespace | Crowd elements together |
| Use gold as a single accent per section | Use gold on every element |
| Use Cormorant for headings, product names, titles | Use Cormorant for body copy or labels |
| Animate subtly and purposefully | Use bouncy or elastic easing |
| Keep CTAs singular per section | Stack 3+ CTAs in one row |
| Left-align body copy | Centre-align long body text |
| Default to dark mode | Build only for light mode |
| Use CSS variable names (not raw hex) | Hardcode colour values in components |
| Use `object-fit: cover` on all product images | Let images stretch or distort |
| Implement `prefers-reduced-motion` | Assume all users want animation |
| Test on real mobile devices | Trust desktop-only previews |
| Express luxury through restraint and space | Add decorative flourishes everywhere |

---

*Razzaq Luxe Design System · v1.1 · May 2025*  
*This document is the canonical implementation spec. Every design decision, component, page, and form described here should be implemented exactly as specified. Justified deviations must be documented.*