# Fontastic - Project Blueprint

## Overview
Fontastic is a modern, production-ready, SEO-optimized, and AdSense-monetized static web application. It allows users to generate custom text effects and logos using a powerful Canvas-based engine, featuring real-time Google Fonts integration and high-resolution downloads.

## Architecture
- **Frontend:** Vanilla HTML5, CSS3 (Modern Baseline features), and JavaScript (ES Modules).
- **Routing:** Custom Vanilla JS Client-Side Router for dynamic SEO updates.
- **Rendering:** Canvas API for high-performance text effect generation.
- **Deployment:** Firebase Hosting (Static).
- **SEO:** Dynamic meta tags, JSON-LD injection, semantic HTML, sitemap.xml, and robots.txt.
- **Monetization:** Pre-defined AdSense slots with fixed dimensions to prevent Cumulative Layout Shift (CLS).

## Design System
- **Background:** `#0f0f12`
- **Panel:** `#18181c`
- **Accent:** `#7c5cff`
- **Typography:** Inter (Preloaded via Google Fonts)
- **Style:** Minimalist, tool-focused, dark mode.

## Implementation Plan
1. **Scaffold Structure:** Create `public/` directory and basic files.
2. **SEO & Routing:** Implement the `Router` in `app.js` to handle `/3d-text-generator`, etc.
3. **Canvas Engine:** Build the core rendering logic in `canvas.js`.
4. **UI Components:** Develop the responsive layout in `index.html` and `style.css`.
5. **Metadata & Schema:** Logic for dynamic title, description, and JSON-LD updates.
6. **Deployment Config:** `firebase.json` for performance headers and SPA rewrites.
