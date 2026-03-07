/**
 * Fontastic Core Engine v1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // Canvas & Context Setup
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');
    
    // UI Controls
    const textInput = document.getElementById('textInput');
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const textColorInput = document.getElementById('textColor');
    const colorHex = document.getElementById('colorHex');
    const downloadBtn = document.getElementById('downloadBtn');

    // Default Configuration
    const config = {
        width: 800,
        height: 500,
        padding: 40
    };

    // Initialize Canvas
    function initCanvas() {
        // High DPI Support
        const dpr = window.devicePixelRatio || 1;
        canvas.width = config.width * dpr;
        canvas.height = config.height * dpr;
        canvas.style.width = `${config.width}px`;
        canvas.style.height = `${config.height}px`;
        ctx.scale(dpr, dpr);
        
        render();
    }

    // Core Rendering Function
    function render() {
        const text = textInput.value || '';
        const fontSize = parseInt(fontSizeInput.value, 10);
        const color = textColorInput.value;

        // Clear Canvas (Transparent)
        ctx.clearRect(0, 0, config.width, config.height);

        // Text Styles
        ctx.font = `800 ${fontSize}px 'Inter', sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Optional: Add subtle shadow for premium feel
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;

        // Draw Text at Center
        ctx.fillText(text, config.width / 2, config.height / 2);

        // Update UI Indicators
        fontSizeValue.textContent = fontSize;
        colorHex.textContent = color.toUpperCase();
    }

    // Event Listeners
    textInput.addEventListener('input', render);
    fontSizeInput.addEventListener('input', render);
    textColorInput.addEventListener('input', render);

    // Download Handler
    downloadBtn.addEventListener('click', () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Match original size for download
        tempCanvas.width = config.width;
        tempCanvas.height = config.height;
        
        // Re-render on temp canvas for clean download
        tempCtx.font = `800 ${fontSizeInput.value}px 'Inter', sans-serif`;
        tempCtx.fillStyle = textColorInput.value;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        
        // Same shadow for consistency
        tempCtx.shadowColor = 'rgba(0,0,0,0.3)';
        tempCtx.shadowBlur = 15;
        tempCtx.fillText(textInput.value, config.width / 2, config.height / 2);

        const dataURL = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `fontastic-${textInput.value.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = dataURL;
        link.click();
    });

    // Start App
    initCanvas();
    
    // Performance: Handle window resize if needed
    window.addEventListener('resize', () => {
        // Redraw to maintain visual consistency
        render();
    });
});