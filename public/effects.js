export function applyEffect(ctx, text, config, x, y, textureImg, scale) {
    const drawBaseText = () => {
        if (config.strokeWidth > 0) {
            ctx.lineWidth = config.strokeWidth * scale;
            ctx.strokeStyle = config.accentColor;
            ctx.lineJoin = 'round';
            ctx.strokeText(text, x, y);
        }
        ctx.fillText(text, x, y);
    };

    const fillWithTexture = () => {
        if (textureImg) {
            ctx.save();
            ctx.globalCompositeOperation = "source-in";
            const pat = ctx.createPattern(textureImg, 'repeat');
            ctx.fillStyle = pat;
            ctx.translate(x, y);
            ctx.fillRect(-ctx.canvas.width, -ctx.canvas.height, ctx.canvas.width*2, ctx.canvas.height*2);
            ctx.restore();
        }
    };

    ctx.fillStyle = config.textColor;

    switch (config.effect) {
        case '3d': {
            const depth = 15 * scale;
            ctx.fillStyle = config.accentColor;
            for (let i = 0; i < depth; i++) {
                ctx.fillText(text, x + i, y + i);
            }
            ctx.fillStyle = config.textColor;
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 15 * scale;
            ctx.shadowOffsetX = 10 * scale;
            ctx.shadowOffsetY = 10 * scale;
            drawBaseText();
            fillWithTexture();
            break;
        }
            
        case 'neon': {
            ctx.strokeStyle = config.textColor;
            ctx.lineWidth = 4 * scale;
            ctx.lineJoin = 'round';
            ctx.shadowColor = config.accentColor;
            ctx.shadowBlur = 20 * scale;
            ctx.strokeText(text, x, y);
            ctx.shadowBlur = 40 * scale;
            ctx.strokeText(text, x, y);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10 * scale;
            ctx.fillText(text, x, y);
            break;
        }
            
        case 'glitch': {
            ctx.fillStyle = '#ff0055';
            ctx.fillText(text, x - 4*scale, y);
            ctx.fillStyle = '#00ffff';
            ctx.fillText(text, x + 4*scale, y);
            ctx.fillStyle = config.textColor;
            drawBaseText();
            break;
        }
            
        case 'cyberpunk': {
            ctx.fillStyle = config.textColor;
            ctx.shadowColor = config.accentColor;
            ctx.shadowBlur = 20 * scale;
            ctx.fillText(text, x, y);
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = '#ffffff'; // inner core
            ctx.fillText(text, x, y);
            break;
        }
            
        case 'retro': {
            const grad = ctx.createLinearGradient(x, y - 40*scale, x, y + 40*scale);
            grad.addColorStop(0, '#00ffff');
            grad.addColorStop(0.48, '#0000aa');
            grad.addColorStop(0.5, '#ffffff');
            grad.addColorStop(0.52, '#ff00ff');
            grad.addColorStop(1, '#ff0055');
            ctx.fillStyle = grad;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * scale;
            drawBaseText();
            fillWithTexture();
            break;
        }
            
        case 'emboss': {
            // Drop shadow
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 10 * scale;
            ctx.shadowOffsetX = 5 * scale;
            ctx.shadowOffsetY = 5 * scale;
            drawBaseText();
            fillWithTexture();
            break;
        }

        case 'outline': {
            ctx.lineWidth = (config.strokeWidth || 8) * scale;
            ctx.strokeStyle = config.accentColor;
            ctx.lineJoin = 'round';
            ctx.strokeText(text, x, y);
            ctx.fillStyle = config.textColor;
            ctx.fillText(text, x, y);
            fillWithTexture();
            break;
        }
            
        case 'graffiti': {
            ctx.save();
            ctx.rotate(-0.05);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillText(text, x + 10*scale, y + 10*scale);
            ctx.fillStyle = config.textColor;
            ctx.strokeStyle = config.accentColor;
            ctx.lineWidth = 8 * scale;
            ctx.lineJoin = 'round';
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
            ctx.restore();
            break;
        }

        case 'fire': {
            ctx.shadowColor = config.accentColor;
            ctx.shadowBlur = 30 * scale;
            ctx.shadowOffsetY = -15 * scale;
            drawBaseText();
            fillWithTexture();
            break;
        }
            
        default: {
            drawBaseText();
            fillWithTexture();
            break;
        }
    }
}