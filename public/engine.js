import { applyEffect } from './effects.js';
import { loadTexture } from './textures.js';

export class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.config = {
            text: 'Fontastic',
            fontFamily: 'Inter',
            fontSize: 100,
            letterSpacing: 0,
            lineHeight: 1.2,
            textCurve: 0,
            textColor: '#ffffff',
            accentColor: '#ff00ff',
            strokeWidth: 0,
            texture: 'none',
            bgType: 'transparent',
            bgColor: '#000000',
            effect: 'default',
            resolution: 1
        };
        this.textures = {};
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth * this.config.resolution;
        this.canvas.height = container.clientHeight * this.config.resolution;
        this.render();
    }

    async updateConfig(newConfig) {
        let needsResize = false;
        if (newConfig.resolution && newConfig.resolution !== this.config.resolution) {
            needsResize = true;
        }
        
        this.config = { ...this.config, ...newConfig };
        
        if (needsResize) this.resize();

        // Dynamically load font
        const fontName = this.config.fontFamily.replace(/\s+/g, '+');
        if (!document.fonts.check(`1em "${this.config.fontFamily}"`)) {
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            try {
                await document.fonts.load(`1em "${this.config.fontFamily}"`);
            } catch(e) {}
        }

        // Dynamically load texture
        if (this.config.texture !== 'none' && !this.textures[this.config.texture]) {
            this.textures[this.config.texture] = await loadTexture(this.config.texture);
        }

        this.render();
    }

    render() {
        const { ctx, canvas, config } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (config.bgType === 'solid') {
            ctx.fillStyle = config.bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        const scale = this.config.resolution;
        const fontSize = config.fontSize * scale;
        ctx.font = `bold ${fontSize}px "${config.fontFamily}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = config.text.split('\n');
        const lineHeight = fontSize * config.lineHeight;
        const startY = -(lines.length - 1) * lineHeight / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            ctx.save();
            ctx.translate(0, y);
            this.renderLine(line, scale);
            ctx.restore();
        });

        ctx.restore();
    }

    renderLine(text, scale) {
        const { ctx, config } = this;
        
        if (config.letterSpacing !== 0 || config.textCurve !== 0) {
            this.renderAdvancedText(text, scale);
        } else {
            applyEffect(ctx, text, config, 0, 0, this.textures[config.texture], scale);
        }
    }

    renderAdvancedText(text, scale) {
        const { ctx, config } = this;
        const chars = text.split('');
        const spacing = config.letterSpacing * scale;
        
        ctx.save();
        
        if (config.textCurve === 0) {
            let totalWidth = 0;
            const widths = chars.map(c => {
                const w = ctx.measureText(c).width;
                totalWidth += w + spacing;
                return w;
            });
            totalWidth -= spacing; 

            let x = -totalWidth / 2;
            chars.forEach((c, i) => {
                applyEffect(ctx, c, config, x + widths[i]/2, 0, this.textures[config.texture], scale);
                x += widths[i] + spacing;
            });
        } else {
            // Arc curve logic
            const radius = 10000 / Math.abs(config.textCurve) * scale;
            const angleStep = (ctx.measureText('W').width + spacing) / radius;
            const totalAngle = chars.length * angleStep;
            const startAngle = config.textCurve > 0 ? -totalAngle/2 : totalAngle/2;
            
            chars.forEach((c, i) => {
                ctx.save();
                const currentAngle = startAngle + (config.textCurve > 0 ? i * angleStep : -i * angleStep);
                ctx.rotate(currentAngle);
                ctx.translate(0, config.textCurve > 0 ? -radius : radius);
                applyEffect(ctx, c, config, 0, 0, this.textures[config.texture], scale);
                ctx.restore();
            });
        }
        ctx.restore();
    }

    download(format = 'png') {
        const link = document.createElement('a');
        link.download = `fontastic-text-${Date.now()}.${format}`;
        link.href = this.canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 1.0);
        link.click();
    }
}