/**
 * Fontastic - Global SPA Controller & Engine Integration
 */

import { GOOGLE_FONTS } from './fonts.js';
import { PRESETS, ROUTES } from './presets.js';
import { TEXTURES } from './textures.js';
import { TextEngine } from './effects.js';
import { GIFExporter } from './js/gif-export.js';

class App {
    constructor() {
        this.ctx = document.getElementById('generatorCanvas');
        this.engine = new TextEngine(this.ctx);
        this.gifExporter = new GIFExporter(this.engine);
        this.state = {
            ...PRESETS.default,
            text: 'Fontastic',
            animEffect: 'none',
            animFrame: 0,
            animTotalFrames: 24,
            animSpeed: 60
        };

        this.views = {
            home: document.getElementById('view-home'),
            editor: document.getElementById('view-editor')
        };

        this.init();
        this.startPreviewLoop();
    }

    init() {
        this.setupFonts();
        // this.renderGallery(); // Handled by home-font-grid.js
        this.bindEvents();
        this.handleRouting();

        /* Search handled by home-font-grid.js */

        window.onpopstate = () => this.handleRouting();
    }

    startPreviewLoop() {
        const loop = () => {
            if (this.views.editor.style.display !== 'none' && this.state.animEffect !== 'none') {
                this.state.animFrame = (this.state.animFrame + 1) % this.state.animTotalFrames;
                this.render();

                setTimeout(() => {
                    requestAnimationFrame(loop);
                }, this.state.animSpeed);
            } else {
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    }

    setupFonts() {
        const select = document.getElementById('fontSelect');
        GOOGLE_FONTS.forEach(font => {
            const opt = document.createElement('option');
            opt.value = font.family;
            opt.textContent = font.name;
            select.appendChild(opt);
        });
    }

    navigateTo(url) {
        history.pushState({}, '', url);
        this.handleRouting();
    }

    switchView(viewName) {
        Object.keys(this.views).forEach(v => {
            this.views[v].style.display = (v === viewName) ? 'block' : 'none';
        });

        // Scroll to top when switching
        window.scrollTo(0, 0);
    }

    updateSEO(title) {
        document.title = title;
    }

    async loadGoogleFont(fontFamily) {
        if (!fontFamily) return;
        const fontName = fontFamily.replace(/\s+/g, '+');
        if (!document.fonts.check(`1em "${fontFamily}"`)) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            try {
                await document.fonts.load(`1em "${fontFamily}"`);
            } catch (e) {
                console.warn('Failed to load font:', fontFamily);
            }
        }
    }

    bindEvents() {
        // Style Tab Switcher
        document.querySelectorAll('.style-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                document.querySelectorAll('.style-tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.style-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(`pane-${style}`).classList.add('active');
                this.render();
            });
        });

        // Outline Style Switcher
        const outlineType = document.getElementById('outlineType');
        if (outlineType) {
            outlineType.addEventListener('change', (e) => {
                const val = e.target.value;
                document.getElementById('outline-solid-ctrl').style.display = val === 'solid' ? 'block' : 'none';
                document.getElementById('outline-grad-ctrl').style.display = val === 'gradient' ? 'block' : 'none';
                this.render();
            });
        }

        // UI Controls (Direct Mapping)
        const inputs = [
            'mainInput', 'sizeRange', 'spacingRange', 'fontSelect',
            'textColor', 'textColorHex', 'outlineColor', 'outlineColorHex', 'outlineWidthRange',
            'gradColor1', 'gradColor2', 'gradDir',
            'patternType', 'patternColor1', 'patternColor2', 'patternSize',
            'outlineGradColor1', 'outlineGradColor2',
            'shadowBlur', 'shadowColor', 'shadowColorHex', 'shadowOffsetX', 'shadowOffsetY',
            'textEffect', 'textTexture',
            'animEffect', 'animSpeed', 'animFrames'
        ];

        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            el.addEventListener('input', (e) => {
                const val = e.target.value;

                // Color Sync Logic
                if (id.endsWith('Hex')) {
                    const colorId = id.replace('Hex', '');
                    document.getElementById(colorId).value = val;
                } else if (document.getElementById(id + 'Hex')) {
                    document.getElementById(id + 'Hex').value = val;
                }

                // Display Value Sync
                if (id === 'sizeRange') document.getElementById('sizeVal').textContent = val;
                if (id === 'spacingRange') document.getElementById('spacingVal').textContent = val;

                if (id === 'fontSelect') this.loadGoogleFont(val);

                if (id === 'animEffect') {
                    const controls = document.getElementById('animControls');
                    const dlBtn = document.getElementById('downloadGif');
                    controls.style.display = val === 'none' ? 'none' : 'block';
                    dlBtn.style.display = val === 'none' ? 'none' : 'block';
                    this.state.animEffect = val;
                }

                if (id === 'animSpeed') {
                    document.getElementById('speedVal').textContent = val;
                    this.state.animSpeed = parseInt(val, 10);
                }

                if (id === 'animFrames') {
                    document.getElementById('framesVal').textContent = val;
                    this.state.animTotalFrames = parseInt(val, 10);
                }

                this.render();
            });
        });

        // Toggle Advanced Download Panel
        const toggleBtn = document.getElementById('toggleAdvanced');
        const advancedPanel = document.getElementById('advancedPanel');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = advancedPanel.style.display === 'none';
                advancedPanel.style.display = isHidden ? 'block' : 'none';
                toggleBtn.textContent = isHidden ? 'Hide Advanced Options' : 'Advanced Download Options';
            });
        }

        // Quick Download PNG (Transparent, 2x)
        const quickBtn = document.getElementById('quickDownload');
        if (quickBtn) {
            quickBtn.addEventListener('click', () => {
                const url = this.engine.getExportDataURL('png', 2, { transparent: true });
                this.downloadFile(url, 'fontastic-text.png');
            });
        }

        // GIF Download
        const gifBtn = document.getElementById('downloadGif');
        if (gifBtn) {
            gifBtn.addEventListener('click', () => {
                const resolution = parseInt(document.getElementById('animRes').value, 10);
                const options = {
                    frameCount: this.state.animTotalFrames,
                    delay: this.state.animSpeed,
                    resolution: resolution
                };
                this.gifExporter.export(this.getCurrentState(), options);
            });
        }

        // Advanced Download
        const advDlBtn = document.getElementById('advancedDownload');
        if (advDlBtn) {
            advDlBtn.addEventListener('click', () => {
                const format = document.getElementById('exportFormat').value;
                const scale = parseInt(document.getElementById('exportRes').value, 10);
                const transparent = document.getElementById('bgTransparent').checked;
                const bgColor = document.getElementById('exportBgColor').value;

                if (format === 'svg') {
                    alert('SVG export coming soon!');
                    return;
                }

                const url = this.engine.getExportDataURL(format, scale, { transparent, bgColor });
                this.downloadFile(url, `fontastic-logo.${format}`);
            });
        }

        // Handle Background Transparency Checkbox
        const bgTransCheck = document.getElementById('bgTransparent');
        const bgColInput = document.getElementById('exportBgColor');
        const formatSelect = document.getElementById('exportFormat');

        if (bgTransCheck) {
            bgTransCheck.addEventListener('change', (e) => {
                bgColInput.disabled = e.target.checked;
                if (e.target.checked) formatSelect.value = 'png';
            });
        }

        if (formatSelect) {
            formatSelect.addEventListener('change', (e) => {
                if (e.target.value === 'jpg') {
                    bgTransCheck.checked = false;
                    bgTransCheck.disabled = true;
                    bgColInput.disabled = false;
                } else {
                    bgTransCheck.disabled = false;
                }
            });
        }

        // Background Image Upload
        const bgUpload = document.getElementById('bgUpload');
        if (bgUpload) {
            bgUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            this.bgImage = img;
                            this.render();
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    getCurrentState() {
        const activeStyleTab = document.querySelector('.style-tab.active');
        return {
            text: document.getElementById('mainInput').value,
            font: document.getElementById('fontSelect').value,
            fontSize: parseInt(document.getElementById('sizeRange').value, 10),
            letterSpacing: parseInt(document.getElementById('spacingRange').value, 10),

            styleType: activeStyleTab ? activeStyleTab.dataset.style : 'solid',
            color: document.getElementById('textColor').value,
            gradColor1: document.getElementById('gradColor1').value,
            gradColor2: document.getElementById('gradColor2').value,
            gradDir: document.getElementById('gradDir').value,

            patternType: document.getElementById('patternType').value,
            patternColor1: document.getElementById('patternColor1').value,
            patternColor2: document.getElementById('patternColor2').value,
            patternSize: document.getElementById('patternSize').value,

            outlineWidth: parseInt(document.getElementById('outlineWidthRange').value, 10),
            outlineType: document.getElementById('outlineType').value,
            outlineColor: document.getElementById('outlineColor').value,
            outlineGradColor1: document.getElementById('outlineGradColor1').value,
            outlineGradColor2: document.getElementById('outlineGradColor2').value,

            shadowBlur: parseInt(document.getElementById('shadowBlur').value, 10),
            shadowColor: document.getElementById('shadowColor').value,
            shadowOffsetX: parseInt(document.getElementById('shadowOffsetX').value, 10),
            shadowOffsetY: parseInt(document.getElementById('shadowOffsetY').value, 10),

            texture: document.getElementById('textTexture').value,
            effect: document.getElementById('textEffect').value,
            bgImage: this.bgImage,

            animEffect: this.state.animEffect,
            animFrame: this.state.animFrame,
            animTotalFrames: this.state.animTotalFrames
        };
    }

    render() {
        if (this.views.editor.style.display === 'none') return;
        const state = this.getCurrentState();
        this.engine.render(state);
    }

    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }

    handleRouting() {
        const path = window.location.pathname;

        if (path === '/' || path === '/index.html') {
            this.switchView('home');
            this.updateSEO("Fontastic | Home of 60+ Stylish Fonts");
        } else {
            this.switchView('editor');

            // Production Presets Mapping
            const presets = {
                '/3d-text-generator': { effect: '3d', color: '#ff4b2b', styleType: 'solid' },
                '/neon-text-generator': { effect: 'neon', shadowBlur: 50, shadowColor: '#00f2ff', styleType: 'solid', color: '#ffffff' },
                '/logo-text-generator': { styleType: 'gradient', gradColor1: '#7c5cff', gradColor2: '#00f2ff', outlineWidthRange: 5 },
                '/graffiti-text-generator': { font: 'Bangers', color: '#f1f1f1', outlineWidthRange: 10, outlineColor: '#000000' },
                '/glitch-text-generator': { styleType: 'pattern', patternType: 'stripes', patternColor1: '#ff00ff', patternColor2: '#00ffff' },
                '/metal-text-generator': { texture: 'metal' },
                '/gold-text-generator': { texture: 'gold' },
                '/fire-text-generator': { styleType: 'gradient', gradColor1: '#ff8c00', gradColor2: '#ff0000', effect: 'neon', shadowColor: '#ff4500' },
                '/cyberpunk-text-generator': { styleType: 'gradient', gradColor1: '#fcee0a', gradColor2: '#00f2ff', effect: 'neon' },
                '/instagram-font-generator': { font: 'Lobster', styleType: 'gradient', gradColor1: '#833ab4', gradColor2: '#fd1d1d' },
                '/youtube-thumbnail-font': { font: 'Anton', color: '#ffffff', outlineWidthRange: 15, outlineColor: '#ff0000' }
            };

            if (presets[path]) {
                const p = presets[path];
                Object.entries(p).forEach(([key, val]) => {
                    if (key === 'styleType') {
                        const tab = document.querySelector(`.style-tab[data-style="${val}"]`);
                        if (tab) tab.click();
                    } else {
                        const el = document.getElementById(key);
                        if (el) {
                            el.value = val;
                            el.dispatchEvent(new Event('input'));
                        }
                    }
                });
            }

            // Handle Font SEO Pages: /font/<name>/
            const fontMatch = path.match(/\/font\/(.*)\//) || path.match(/\/fonts\/(.*)-font-generator/);
            if (fontMatch) {
                const fontSlug = fontMatch[1];
                const font = GOOGLE_FONTS.find(f => f.name.toLowerCase().replace(/\s+/g, '-') === fontSlug);
                if (font) {
                    document.getElementById('fontSelect').value = font.family;
                    document.getElementById('fontSelect').dispatchEvent(new Event('input'));
                    document.getElementById('current-font-label').textContent = font.name;
                    this.updateSEO(`${font.name} Font Generator - Create Stylish Text`);
                }
            } else if (ROUTES[path]) {
                const presetId = ROUTES[path];
                const pr = PRESETS[presetId];
                if (pr) {
                    Object.entries(pr).forEach(([key, val]) => {
                        const el = document.getElementById(key);
                        if (el) { el.value = val; el.dispatchEvent(new Event('input')); }
                    });
                }
            }

            this.render();
        }
    }
}

// Global Redirect for direct file access
if (window.location.hostname === 'localhost' && window.location.pathname.endsWith('.html')) {
    // history.replaceState({}, '', '/');
}

document.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new App();
});
