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

## Current Plan & Features

### Core Features
- Live text preview on Homepage Font Grid
- Robust Editor UI (`editor.html` & `editor.js`)
- **Dynamic Font Selector**: Change fonts instantly within the editor, with search, 22+ curated fonts, and URL routing (`/fonts/font-slug`).
- Multi-layered Canvas rendering (Gradients, Outlines, Shadows, 3D Effects, Neon Glow).
- Export to high-res transparent PNG.

### In Progress / Planned
- SVG & GIF Export improvements.
