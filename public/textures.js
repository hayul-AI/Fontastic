export async function loadTexture(name) {
    if (name === 'none') return null;
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            // Procedurally generate fallback texture if image is missing
            const canvas = document.createElement('canvas');
            canvas.width = 256; 
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            const colors = {
                'gold': ['#bf953f', '#fcf6ba', '#b38728', '#fbf5b7'],
                'metal': ['#d3d3d3', '#a9a9a9', '#808080', '#c0c0c0'],
                'fire': ['#ff0000', '#ff5a00', '#ff9c00', '#ffce00'],
                'galaxy': ['#0b3d91', '#1e1366', '#2a0845', '#640d14']
            };
            const scheme = colors[name] || colors['metal'];
            
            const grad = ctx.createLinearGradient(0, 0, 256, 256);
            scheme.forEach((color, i) => grad.addColorStop(i / (scheme.length - 1), color));
            
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);
            
            // Add some noise
            for(let i=0; i<1000; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.1})`;
                ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
            }
            
            resolve(canvas);
        };
        // Simulated path for Google Image Indexing. 
        img.src = `/textures/${name}.jpg`;
    });
}