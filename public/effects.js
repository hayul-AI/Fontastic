/**
 * Fontastic Rendering Engine (Advanced Canvas)
 * Supports: 3D, Textures, Gradients, Filters, Multi-layer effects.
 */

export class TextEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            width: 1400,
            height: 700,
            dpr: window.devicePixelRatio || 1
        };
        this.textures = {}; // Cache for loaded textures
        this.init();
    }

    init() {
        this.canvas.width = this.config.width * this.config.dpr;
        this.canvas.height = this.config.height * this.config.dpr;
        this.canvas.style.width = `${this.config.width}px`;
        this.canvas.style.height = `${this.config.height}px`;
        this.ctx.scale(this.config.dpr, this.config.dpr);
    }

    async render(state) {
        const {
            text, font, fontSize, color, letterSpacing,
            outlineWidth, outlineColor, shadowBlur, shadowColor,
            shadowOffsetX, shadowOffsetY, texture, gradient, effect,
            styleType, gradColor1, gradColor2, gradDir,
            patternType, patternColor1, patternColor2, patternSize,
            outlineType, outlineGradColor1, outlineGradColor2,
            bgImage, // New: background image element
            animEffect, animFrame = 0, animTotalFrames = 24 // New: Animation params
        } = state;

        // Clear with transparency
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);

        // Draw Background Image if exists
        if (bgImage) {
            this.ctx.drawImage(bgImage, 0, 0, this.config.width, this.config.height);
        }

        // Font Setup
        this.ctx.font = `800 ${fontSize}px "${font}", sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.letterSpacing = `${letterSpacing}px`;

        const x = this.config.width / 2;
        const y = this.config.height / 2;

        // 1. Layered Background / 3D Extrude (Underneath)
        if (effect === '3d') {
            this.ctx.shadowBlur = 0;
            for (let i = 1; i <= 12; i++) {
                this.ctx.fillStyle = '#222';
                this.ctx.fillText(text, x + i, y + i);
            }
        }

        // 2. Prep Shadows/Glow
        this.ctx.shadowBlur = shadowBlur;
        this.ctx.shadowColor = shadowColor;
        this.ctx.shadowOffsetX = shadowOffsetX;
        this.ctx.shadowOffsetY = shadowOffsetY;

        // 3. Fill Logic (Solid / Gradient / Pattern / Texture)
        let fillStyle = color;
        if (texture && texture !== 'none') {
            await this.renderTextured(text, x, y, texture);
            return; // renderTextured handles its own drawing for now
        } else if (styleType === 'gradient') {
            fillStyle = this.createGradient(x, y, gradColor1, gradColor2, gradDir);
        } else if (styleType === 'pattern') {
            fillStyle = this.createDynamicPattern(patternType, patternColor1, patternColor2, patternSize);
        }

        // --- ANIMATION INJECTION ---
        const animState = this.calculateAnimation(animEffect, animFrame, animTotalFrames, {
            x, y, fontSize, shadowBlur, color
        });

        this.ctx.fillStyle = fillStyle;

        if (animState.glitch) {
            this.renderGlitch(text, x, y, animState.glitch);
        } else if (animState.wave) {
            this.renderWave(text, x, y, animState.wave);
        } else {
            if (animState.opacity !== undefined) this.ctx.globalAlpha = animState.opacity;
            if (animState.shadowBlur !== undefined) this.ctx.shadowBlur = animState.shadowBlur;

            this.ctx.fillText(text, x + (animState.offsetX || 0), y + (animState.offsetY || 0));
            this.ctx.globalAlpha = 1.0;
        }

        // 4. Overlays (Outline)
        if (outlineWidth > 0) {
            this.ctx.shadowBlur = 0;
            this.ctx.lineWidth = outlineWidth;
            this.ctx.lineJoin = 'round';

            if (outlineType === 'gradient') {
                const outGrad = this.createGradient(x, y, outlineGradColor1, outlineGradColor2, 'horizontal');
                this.ctx.strokeStyle = outGrad;
            } else {
                this.ctx.strokeStyle = outlineColor;
            }
            this.ctx.strokeText(text, x + (animState.offsetX || 0), y + (animState.offsetY || 0));
        }
    }

    calculateAnimation(effect, frame, total, params) {
        const state = { opacity: 1, shadowBlur: params.shadowBlur, offsetX: 0, offsetY: 0 };
        const progress = frame / total;

        switch (effect) {
            case 'neon-flicker':
                if (Math.random() > 0.9) state.opacity = 0.3;
                if (Math.random() > 0.95) state.shadowBlur = params.shadowBlur * 0.2;
                break;
            case 'glow-pulse':
                const pulse = (Math.sin(progress * Math.PI * 2) + 1) / 2;
                state.shadowBlur = params.shadowBlur * (0.5 + pulse * 1.5);
                state.opacity = 0.8 + pulse * 0.2;
                break;
            case 'glitch':
                if (Math.random() > 0.85) {
                    state.glitch = {
                        offset: (Math.random() - 0.5) * 20,
                        slice: Math.random() < 0.3
                    };
                }
                break;
            case 'wave':
                state.wave = {
                    amplitude: params.fontSize * 0.1,
                    frequency: 2,
                    progress: progress
                };
                break;
        }
        return state;
    }

    renderGlitch(text, x, y, glitch) {
        this.ctx.save();
        // Red shift
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillText(text, x + glitch.offset, y);
        // Blue shift
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillText(text, x - glitch.offset, y);
        this.ctx.restore();
    }

    renderWave(text, x, y, wave) {
        const chars = text.split('');
        const charWidth = this.ctx.measureText('W').width; // Approx
        const totalWidth = this.ctx.measureText(text).width;
        let currentX = x - totalWidth / 2;

        chars.forEach((char, i) => {
            const offset = Math.sin((wave.progress + i / chars.length) * Math.PI * 2 * wave.frequency) * wave.amplitude;
            const w = this.ctx.measureText(char).width;
            this.ctx.fillText(char, currentX + w / 2, y + offset);
            currentX += w;
        });
    }

    createGradient(x, y, c1, c2, dir) {
        let grad;
        const w = 600; // Approx text width
        const h = 200; // Approx text height

        if (dir === 'vertical') {
            grad = this.ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
        } else if (dir === 'diagonal') {
            grad = this.ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
        } else {
            grad = this.ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
        }

        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        return grad;
    }

    createDynamicPattern(type, c1, c2, size) {
        const pCanvas = document.createElement('canvas');
        const pCtx = pCanvas.getContext('2d');
        const s = parseInt(size, 10);

        pCanvas.width = s;
        pCanvas.height = s;

        // Background
        pCtx.fillStyle = c2;
        pCtx.fillRect(0, 0, s, s);

        pCtx.fillStyle = c1;

        switch (type) {
            case 'stripes':
                pCtx.fillRect(0, 0, s / 2, s);
                break;
            case 'dots':
                pCtx.beginPath();
                pCtx.arc(s / 2, s / 2, s / 4, 0, Math.PI * 2);
                pCtx.fill();
                break;
            case 'grid':
                pCtx.fillRect(0, 0, s, 2);
                pCtx.fillRect(0, 0, 2, s);
                break;
            case 'checkerboard':
                pCtx.fillRect(0, 0, s / 2, s / 2);
                pCtx.fillRect(s / 2, s / 2, s / 2, s / 2);
                break;
            case 'diagonal':
                pCtx.beginPath();
                pCtx.moveTo(0, s);
                pCtx.lineTo(s, 0);
                pCtx.lineWidth = s / 4;
                pCtx.strokeStyle = c1;
                pCtx.stroke();
                break;
        }

        return this.ctx.createPattern(pCanvas, 'repeat');
    }

    renderGradient(text, x, y, gradient) {
        const grad = this.ctx.createLinearGradient(x - 300, y, x + 300, y);
        const colors = gradient.colors || ['#7c5cff', '#00f2ff'];
        colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
        this.ctx.fillStyle = grad;
        this.ctx.fillText(text, x, y);
    }

    async renderTextured(text, x, y, textureId) {
        this.ctx.save();
        // Step A: Draw text to define mask
        this.ctx.fillText(text, x, y);
        // Step B: Mask with source-in
        this.ctx.globalCompositeOperation = 'source-in';

        const img = await this.getTexture(textureId);
        if (img) {
            const pattern = this.ctx.createPattern(img, 'repeat');
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(0, 0, this.config.width, this.config.height);
        }
        this.ctx.restore();
    }

    async getTexture(id) {
        if (this.textures[id]) return this.textures[id];

        const textureUrls = {
            'gold': '/textures/gold.jpg',
            'metal': '/textures/metal.jpg',
            'marble': '/textures/marble.jpg',
            'carbon': '/textures/carbon.jpg'
        };
        const url = textureUrls[id];
        if (!url) return null;

        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                this.textures[id] = img;
                resolve(img);
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    getExportDataURL(format = 'png', scale = 1, options = { transparent: true, bgColor: '#ffffff' }) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.config.width * scale;
        tempCanvas.height = this.config.height * scale;
        const tempCtx = tempCanvas.getContext('2d');

        // JPG MUST have a background color
        if (format === 'jpg' || !options.transparent) {
            tempCtx.fillStyle = format === 'jpg' ? '#ffffff' : options.bgColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        tempCtx.scale(scale * this.config.dpr, scale * this.config.dpr);
        tempCtx.drawImage(this.canvas, 0, 0, this.config.width, this.config.height);

        return tempCanvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
    }
}