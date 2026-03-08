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
- **Logo Design:**
    - **Text:** "Fontastic" in `#FFFFFF`.
    - **Icon:** Multi-color pencil icon using Blue (`#4285F4`), Red (`#EA4335`), and Yellow (`#FBBC05`).

### Current Plan & Features
- **UI Refinement**: Removed the "Edit Selected Text" input field from the Left Sidebar to streamline the interface and reduce redundancy with the top bar input.
- **UI Reordering**: Moved the "Text Alignment" control directly below the "Add Text" and "Delete" buttons for better workflow.
- **Multiline Text Support**: Users can now create multiline text logos by pressing Enter in the text input fields.
- **Text Alignment**: Added Left, Center, and Right alignment controls to the editor for precise text positioning.
- **Background Image Transforms**: Users can now move (drag), scale, and rotate uploaded background images using dedicated sliders or wheel zoom.

### Core Features
- **Mini Logo Editor (Font Tool Page)**: 
    - **3-Column Professional Layout**: Optimized interface with Text Tools (Left), 16:9 Canvas (Center), and Style Tools (Right - Text Color, Warp, Rotation).
    - **Optimized Side-Panel Order**: The left sidebar now follows a logical flow: Add/Delete Text -> Text Alignment -> X/Y Position -> Font Size -> Letter Spacing -> Line Height -> Font Weight.
    - **Multi-Text Layer System**: Support for adding multiple independent text objects with centralized control panels.
    - **Interactive Transform Controls**: Dashed transform box with 8 resize handles and a rotation handle for each layer.
    - **Dynamic Background Logic**: Transparent by default with a visual checkerboard pattern for clarity. Instant toggle for White/Black backgrounds.
    - **Advanced Style Tools**: Precise control over color, outline, opacity, rotation, and multi-layered effects. Includes comprehensive Text Shadow controls, a Text Color Picker, Text Warp, and an advanced **Glow Effect (Neon/Ambient)** with color, blur, and opacity adjustments.
    - **Numeric Precision Controls**: Fine-tune X/Y position, font size, rotation, spacing, shadow properties, warp intensity, glow levels, and opacity using dedicated numeric inputs with real-time sync.
    - **Multiline & Alignment**: Full support for multiline text blocks with Left, Center, and Right justification.
    - **Background Image Support**: Upload background images with full transform support (position, scale, rotation).
    - **16:9 Fixed Canvas**: Standard 960x540 canvas for production-ready design.
    - **Live Text Sync**: Text and font selection transitions seamlessly from homepage to editor.
- **Updated Home Tagline**: "Create fantastic text logos with Fontastic." for better brand alignment.
- Live text preview on Homepage Font Grid.
- **Improved Banner Layout**: Centered font banner area with an 820px wide search bar layout for better visual balance.
- Robust Editor UI (`editor.html` & `editor.js`).
- **Dynamic Font Selector**: Instant font switching with search, language filtering, and URL routing. Optimized for performance with a 300+ font library (60 curated samples on homepage).
- Multi-layered Canvas rendering (Gradients, Outlines, Shadows, 3D Effects, Neon Glow).
- Export to high-res PNG (up to 1920x1080).
- **Scalable Vector Graphics (SVG) Export**: Support for downloading designs in SVG format, preserving text, color, outline, shadow, and positioning.

### In Progress / Planned
- GIF Export improvements.
