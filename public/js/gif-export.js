/**
 * Fontastic - GIF Export Utility
 * Uses a secondary offscreen canvas to capture frames and encode them into a GIF.
 */

export class GIFExporter {
    constructor(engine) {
        this.engine = engine;
        this.isEncoding = false;
    }

    async export(state, options = {}) {
        if (this.isEncoding) return;
        this.isEncoding = true;

        const {
            frameCount = 24,
            delay = 60,
            quality = 10,
            resolution = 512
        } = options;

        // 1. Setup Offscreen Canvas for Export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = resolution;
        exportCanvas.height = resolution / 2; // Keep 2:1 ratio
        const exportEngine = new this.engine.constructor(exportCanvas);

        // 2. Initialize GIF Encoder (using gif.js if available, or simple alternative)
        // For simplicity in this vanilla setup, we'll assume gif.js is loaded via CDN or similar.
        // If not available, we can provide a fallback or alert.
        if (typeof GIF === 'undefined') {
            await this.loadLibrary('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js');
        }

        const gif = new GIF({
            workers: 2,
            quality: quality,
            width: exportCanvas.width,
            height: exportCanvas.height,
            workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
        });

        const downloadBtn = document.getElementById('downloadGif');
        const originalText = downloadBtn.textContent;
        downloadBtn.disabled = true;

        try {
            // 3. Capture Frames
            for (let i = 0; i < frameCount; i++) {
                downloadBtn.textContent = `Encoding ${Math.round((i / frameCount) * 100)}%`;

                const frameState = {
                    ...state,
                    animFrame: i,
                    animTotalFrames: frameCount,
                    fontSize: state.fontSize * (resolution / 1400) // Scale font for export resolution
                };

                await exportEngine.render(frameState);
                gif.addFrame(exportCanvas, { delay: delay, copy: true });
            }

            // 4. Render & Download
            gif.on('finished', (blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `fontastic-anim-${Date.now()}.gif`;
                link.click();

                this.isEncoding = false;
                downloadBtn.disabled = false;
                downloadBtn.textContent = originalText;
            });

            gif.render();

        } catch (error) {
            console.error('GIF Export Failed:', error);
            this.isEncoding = false;
            downloadBtn.disabled = false;
            downloadBtn.textContent = originalText;
            alert('GIF Export failed. Please try a lower frame count or resolution.');
        }
    }

    loadLibrary(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}
