import { getFontsByLang, loadGoogleFont } from './fontLibrary.js';

/**
 * Central State System
 */
const editorState = {
    canvas: null,
    ctx: null,
    texts: [],
    selectedText: null,
    backgroundImage: null,
    backgroundMode: "transparent", // transparent, white, black, custom
    customBgColor: "#ffffff",
    bgX: 480,
    bgY: 270,
    bgScale: 1,
    bgRotation: 0,
    fontsLoaded: false,
    fontLoading: false,
    initializationLock: true // v7 Double-Lock: Blocks all rendering until first verified font
};

const interaction = {
    dragging: false,
    resizing: false,
    rotating: false,
    handle: null, // 'nw', 'ne', 'sw', 'se', 'rotate'
    startX: 0,
    startY: 0,
    startSize: 0,
    startRotation: 0
};

const loadedPatterns = {};

/**
 * Font Virtualization & Optimization
 */
const fontObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const fontName = el.dataset.font;
            if (fontName) {
                loadGoogleFont(fontName);
                el.style.fontFamily = `"${fontName}", sans-serif`;
                fontObserver.unobserve(el);
            }
        }
    });
}, { rootMargin: '100px' });

/**
 * Initialization
 */
document.addEventListener("DOMContentLoaded", async () => {
    // Stage 0: Block all rendering immediately
    editorState.fontLoading = true;
    editorState.initializationLock = true;
    await initializeEditor();
});

async function initializeEditor() {
    editorState.canvas = document.getElementById("fontCanvas");
    if (!editorState.canvas) return;

    editorState.ctx = editorState.canvas.getContext("2d");
    editorState.canvas.width = 960;
    editorState.canvas.height = 540;

    // Load state -> Bind UI
    await loadInitialState();
    bindUIEvents();
    populateFontPicker('latin');

    // The first applyFont within loadInitialState will eventually clear initializationLock
}

async function loadInitialState() {
    const params = new URLSearchParams(window.location.search);
    const initialFont = params.get("font") || localStorage.getItem("fontastic_font") || "Roboto";
    const initialColor = params.get("color") || "#ffffff";
    const initialText = localStorage.getItem('fontastic_text') || "Fontastic";

    const text = createTextObject(initialText, 480, 270, initialFont, 80, initialColor);
    editorState.texts.push(text);
    editorState.selectedText = text;

    await applyFont(initialFont);
    syncUI();
}

function createTextObject(content, x, y, font, size, color) {
    return {
        content: content,
        x: x,
        y: y,
        font: font,
        size: size,
        color: color,
        color2: "#00d4ff",
        weight: "700",
        rotation: 0,
        opacity: 1,
        align: "center",
        lineHeight: 1.2,
        fillType: "solid",
        fillPattern: "gold",
        outlineEnabled: false,
        outlineColor: "#000000",
        outlineColor2: "#000000",
        outlineWidth: 2,
        outlineType: "single",
        shadowEnabled: false,
        shadowColor: "#000000",
        shadowBlur: 10,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowOpacity: 0.5,
        enable3D: false,
        glowEnabled: false,
        glowColor: "#ffffff",
        glowStrength: 40,
        glowOpacity: 1,
        threeDDepth: 5,
        warp: 0,
        spacing: 0,
        neonEffectEnabled: false,
        glitchEnabled: false
    };
}

/**
 * Background Rendering
 */
function drawTransparentBackground() {
    const canvas = editorState.canvas;
    const ctx = editorState.ctx;
    const size = 20;
    for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
            ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? "#eeeeee" : "#ffffff";
            ctx.fillRect(x, y, size, size);
        }
    }
}

function drawBackgroundMode() {
    const ctx = editorState.ctx;
    const canvas = editorState.canvas;
    if (editorState.backgroundMode === "none") return;
    if (editorState.backgroundMode === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (editorState.backgroundMode === "black") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (editorState.backgroundMode === "custom") {
        ctx.fillStyle = editorState.customBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        drawTransparentBackground();
    }
}

function drawBackground() {
    if (!editorState.backgroundImage) return;
    const ctx = editorState.ctx;
    ctx.save();
    ctx.translate(editorState.bgX, editorState.bgY);
    ctx.rotate(editorState.bgRotation * Math.PI / 180);
    ctx.scale(editorState.bgScale, editorState.bgScale);
    ctx.drawImage(
        editorState.backgroundImage,
        -editorState.backgroundImage.width / 2,
        -editorState.backgroundImage.height / 2
    );
    ctx.restore();
}

/**
 * Text Rendering
 */
function drawText(text) {
    const ctx = editorState.ctx;
    ctx.save();
    ctx.globalAlpha = text.opacity || 1;

    // Base font settings
    const weight = text.weight || '400';
    const fontSize = text.size || 60;
    const font = text.font || 'Roboto';
    ctx.font = `${weight} ${fontSize}px "${font}"`;
    ctx.textBaseline = "middle";

    ctx.translate(text.x, text.y);
    ctx.rotate(text.rotation * Math.PI / 180);

    const lines = text.content.split('\n');
    const lineHeight = text.lineHeight || 1.2;
    const spacing = (text.spacing || 0) * (fontSize / 100);
    const warp = text.warp || 0;

    // First pass: Calculate max width for the entire block
    let maxW = 0;
    const lineData = lines.map(line => {
        const charWidths = line.split('').map(c => ctx.measureText(c).width);
        const totalW = charWidths.reduce((a, b) => a + b, 0) + (spacing * (line.length - 1));
        if (totalW > maxW) maxW = totalW;
        return { line, totalW, charWidths };
    });

    lineData.forEach((data, i) => {
        const { line, totalW, charWidths } = data;
        const yBase = (i - (lines.length - 1) / 2) * fontSize * lineHeight;

        ctx.save();

        // Internal alignment within the bounding box (centered on anchor)
        let lineXStart = -totalW / 2;
        if (text.align === 'left') lineXStart = -maxW / 2;
        if (text.align === 'right') lineXStart = maxW / 2 - totalW;

        // Fill logic (line-level gradient)
        let lineFill;
        if (text.fillType === 'linear' || text.fillType === 'radial') {
            const grad = text.fillType === 'linear'
                ? ctx.createLinearGradient(-maxW / 2, 0, maxW / 2, 0)
                : ctx.createRadialGradient(0, 0, 0, 0, 0, maxW / 2);
            grad.addColorStop(0, text.color || "#ffffff");
            grad.addColorStop(1, text.color2 || "#00d4ff");
            lineFill = grad;
        } else if (text.fillType === 'pattern' && text.fillPattern && loadedPatterns[text.fillPattern]) {
            lineFill = loadedPatterns[text.fillPattern];
        } else {
            lineFill = text.color || "#ffffff";
        }

        if (Math.abs(warp) > 1) {
            const radius = Math.max(100, 10000 / Math.abs(warp));
            const dir = warp > 0 ? 1 : -1;
            const centerY = dir * radius;
            let currentAngle = (lineXStart + charWidths[0] / 2) / radius;

            line.split('').forEach((char, index) => {
                const charW = charWidths[index];
                ctx.save();
                const angle = currentAngle;
                ctx.translate(Math.sin(angle) * radius, centerY - Math.cos(angle) * radius * dir);
                ctx.rotate(angle * dir);
                renderChar(ctx, char, 0, yBase, text, lineFill);
                ctx.restore();
                if (index < line.length - 1) {
                    const nextW = charWidths[index + 1];
                    currentAngle += (charW / 2 + nextW / 2 + spacing) / radius;
                }
            });
        } else {
            let currentX = lineXStart;
            line.split('').forEach((char, index) => {
                const charW = charWidths[index];
                renderChar(ctx, char, currentX + charW / 2, yBase, text, lineFill);
                currentX += charW + spacing;
            });
        }
        ctx.restore();
    });

    ctx.restore();
}

function renderChar(ctx, char, x, y, text, fill) {
    if (text.shadowEnabled) {
        ctx.shadowColor = hexToRgba(text.shadowColor || "#000000", text.shadowOpacity || 0.5);
        ctx.shadowBlur = text.shadowBlur || 10;
        ctx.shadowOffsetX = text.shadowOffsetX || 5;
        ctx.shadowOffsetY = text.shadowOffsetY || 5;
    }

    if (text.glowEnabled || text.neonEffectEnabled) {
        const baseColor = text.glowColor || text.color || "#ffffff";
        const strength = text.glowStrength || 40;
        const opacity = text.glowOpacity || 1;

        if (text.neonEffectEnabled) {
            // Triple-pass Neon Glow
            ctx.save();
            // 1. Outer broad glow
            ctx.shadowColor = hexToRgba(baseColor, opacity * 0.4);
            ctx.shadowBlur = strength * 1.5;
            ctx.fillText(char, x, y);

            // 2. Medium glow
            ctx.shadowBlur = strength;
            ctx.shadowColor = hexToRgba(baseColor, opacity * 0.8);
            ctx.fillText(char, x, y);

            // 3. Tight inner glow
            ctx.shadowBlur = strength * 0.3;
            ctx.shadowColor = hexToRgba("#ffffff", opacity);
            ctx.fillText(char, x, y);
            ctx.restore();

            // Set a bright "hot" fill for the final pass
            ctx.fillStyle = "#ffffff";
        } else {
            ctx.shadowColor = hexToRgba(baseColor, opacity);
            ctx.shadowBlur = strength;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }

    if (text.glitchEnabled) {
        ctx.save();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        // Cyberpunk Glitch: Offset Cyan and Red layers
        ctx.fillStyle = "rgba(0, 255, 255, 0.7)";
        ctx.fillText(char, x - 2, y);
        ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
        ctx.fillText(char, x + 2, y);
        ctx.restore();
    }

    ctx.fillStyle = fill;
    ctx.textAlign = "center";

    if (text.enable3D) {
        const depth = text.threeDDepth || 5;
        // Draw extrusion layers
        ctx.save();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        // Darken the fill color for the extrusion effect
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        for (let j = 1; j <= depth; j++) {
            ctx.fillText(char, x + j * 0.5, y + j * 0.5);
        }
        ctx.restore();
    }

    ctx.fillText(char, x, y);

    if (text.outlineEnabled && text.outlineWidth > 0) {
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
        if (text.outlineType === 'double') {
            ctx.lineWidth = text.outlineWidth * 2;
            ctx.strokeStyle = text.outlineColor2 || "#000000";
            ctx.strokeText(char, x, y);
            ctx.lineWidth = text.outlineWidth;
            ctx.strokeStyle = text.outlineColor || "#ffffff";
            ctx.strokeText(char, x, y);
        } else {
            ctx.lineWidth = text.outlineWidth;
            ctx.strokeStyle = text.outlineColor || "#ffffff";
            ctx.strokeText(char, x, y);
        }
    }
}

function drawHandles(text) {
    if (!text) return;
    const ctx = editorState.ctx;
    ctx.save();
    ctx.translate(text.x, text.y);
    ctx.rotate(text.rotation * Math.PI / 180);

    ctx.font = `${text.weight || '400'} ${text.size}px "${text.font}"`;
    const lines = text.content.split('\n');
    const lineHeight = text.lineHeight || 1.2;
    const spacing = (text.spacing || 0) * (text.size / 100);
    let maxW = 0;
    lines.forEach(line => {
        let lw = 0;
        line.split('').forEach(char => {
            lw += ctx.measureText(char).width;
        });
        lw += (line.length - 1) * spacing;
        if (lw > maxW) maxW = lw;
    });

    const w = maxW;
    const h = lines.length * text.size * lineHeight;
    const pad = 10;

    // Stabilize Bounding Box: Always center-based since origin is center
    let xOffset = -w / 2;
    // Align property can still exist for multi-line internal align, 
    // but the object anchor is center.

    ctx.strokeStyle = "#7c5cff";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(xOffset - pad, -h / 2 - pad, w + pad * 2, h + pad * 2);
    ctx.setLineDash([]);

    const handleSize = 8;
    ctx.fillStyle = "#ffffff";
    const corner = [xOffset + w + pad, h / 2 + pad];
    ctx.fillRect(corner[0] - handleSize / 2, corner[1] - handleSize / 2, handleSize, handleSize);
    ctx.strokeRect(corner[0] - handleSize / 2, corner[1] - handleSize / 2, handleSize, handleSize);

    ctx.beginPath();
    ctx.moveTo(xOffset + w / 2, -h / 2 - pad);
    ctx.lineTo(xOffset + w / 2, -h / 2 - pad - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xOffset + w / 2, -h / 2 - pad - 35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function renderCanvas() {
    const ctx = editorState.ctx;
    const canvas = editorState.canvas;
    // v7 Gate: fontLoading OR initializationLock blocks the render
    if (!ctx || !canvas || editorState.fontLoading || editorState.initializationLock) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackgroundMode();
    drawBackground();
    editorState.texts.forEach(drawText);

    if (editorState.selectedText) {
        drawHandles(editorState.selectedText);
    }
}

/**
 * Event Binding
 */
function bindUIEvents() {
    const canvas = editorState.canvas;

    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

        interaction.startX = mouseX;
        interaction.startY = mouseY;

        if (editorState.selectedText) {
            const t = editorState.selectedText;
            const ctx = editorState.ctx;
            ctx.font = `${t.weight || '400'} ${t.size}px "${t.font}"`;
            const metrics = ctx.measureText(t.content);
            const w = metrics.width;
            const h = t.size;
            const pad = 10;

            const dx = mouseX - t.x;
            const dy = mouseY - t.y;
            const angle = -t.rotation * Math.PI / 180;
            const lx = dx * Math.cos(angle) - dy * Math.sin(angle);
            const ly = dx * Math.sin(angle) + dy * Math.cos(angle);

            if (Math.sqrt(lx ** 2 + (ly + h / 2 + pad + 35) ** 2) < 15) {
                interaction.rotating = true;
                interaction.startRotation = t.rotation;
                return;
            }
            if (Math.abs(lx - (w / 2 + pad)) < 15 && Math.abs(ly - (h / 2 + pad)) < 15) {
                interaction.resizing = true;
                interaction.startSize = t.size;
                return;
            }
            if (lx >= -w / 2 - pad && lx <= w / 2 + pad && ly >= -h / 2 - pad && ly <= h / 2 + pad) {
                interaction.dragging = true;
                return;
            }
        }

        let hit = false;
        for (let i = editorState.texts.length - 1; i >= 0; i--) {
            const t = editorState.texts[i];
            const dist = Math.sqrt((mouseX - t.x) ** 2 + (mouseY - t.y) ** 2);
            if (dist < t.size * 0.8) {
                editorState.selectedText = t;
                interaction.dragging = true;
                hit = true;
                syncUI();
                break;
            }
        }
        if (!hit) {
            editorState.selectedText = null;
            interaction.dragging = true;
        }
        renderCanvas();
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!interaction.dragging && !interaction.resizing && !interaction.rotating) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
        const dx = mouseX - interaction.startX;
        const dy = mouseY - interaction.startY;

        if (interaction.dragging) {
            if (editorState.selectedText) {
                editorState.selectedText.x += dx;
                editorState.selectedText.y += dy;
            } else if (editorState.backgroundImage) {
                editorState.bgX += dx;
                editorState.bgY += dy;
            }
            interaction.startX = mouseX;
            interaction.startY = mouseY;
        } else if (interaction.resizing) {
            const t = editorState.selectedText;
            const dist = Math.sqrt((mouseX - t.x) ** 2 + (mouseY - t.y) ** 2);
            const startDist = Math.sqrt((interaction.startX - t.x) ** 2 + (interaction.startY - t.y) ** 2);
            t.size = Math.max(10, interaction.startSize * (dist / startDist));
        } else if (interaction.rotating) {
            const t = editorState.selectedText;
            const angle = Math.atan2(mouseY - t.y, mouseX - t.x) * 180 / Math.PI;
            const startAngle = Math.atan2(interaction.startY - t.y, interaction.startX - t.x) * 180 / Math.PI;
            t.rotation = interaction.startRotation + (angle - startAngle);
        }

        renderCanvas();
        syncUI();
    });

    window.addEventListener("mouseup", () => {
        interaction.dragging = false;
        interaction.resizing = false;
        interaction.rotating = false;
    });

    /* Wheel zoom removed as per request - replaced with bottom controls */

    // FIX 4 — Double Click Behavior: ONLY edit existing text
    canvas.addEventListener("dblclick", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

        let hit = false;
        for (let i = editorState.texts.length - 1; i >= 0; i--) {
            const t = editorState.texts[i];
            const dx = mouseX - t.x;
            const dy = mouseY - t.y;
            const angle = -t.rotation * Math.PI / 180;
            const lx = dx * Math.cos(angle) - dy * Math.sin(angle);
            const ly = dx * Math.sin(angle) + dy * Math.cos(angle);

            const ctx = editorState.ctx;
            ctx.font = `${t.weight || '400'} ${t.size}px "${t.font}"`;
            const metrics = ctx.measureText(t.content);
            const w = metrics.width;
            const h = t.size;
            const pad = 10;

            if (lx >= -w / 2 - pad && lx <= w / 2 + pad && ly >= -h / 2 - pad && ly <= h / 2 + pad) {
                editorState.selectedText = t;
                const textInput = document.getElementById('textInput');
                if (textInput) {
                    textInput.focus();
                    textInput.select();
                }
                hit = true;
                break;
            }
        }
        if (hit) {
            syncUI();
            renderCanvas();
        }
    });

    window.addEventListener("keydown", (e) => {
        // FIX 1 — Prevent double text by ignoring if an input is focused
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        if (!editorState.selectedText) return;
        if (e.key === "Backspace") {
            editorState.selectedText.content = editorState.selectedText.content.slice(0, -1);
        } else if (e.key === "Enter") {
            editorState.selectedText.content += "\n";
        } else if (e.key.length === 1) {
            editorState.selectedText.content += e.key;
        }
        renderCanvas();
        syncUI();
    });

    // --- UI Controls ---
    document.getElementById('textInput')?.addEventListener('input', (e) => {
        if (editorState.selectedText) { editorState.selectedText.content = e.target.value; renderCanvas(); }
    });

    document.getElementById('textColor1')?.addEventListener('input', (e) => {
        if (editorState.selectedText) { editorState.selectedText.color = e.target.value; renderCanvas(); }
    });

    // FIX 2 — Canvas Background Buttons
    document.getElementById('bgTransparent')?.addEventListener('click', () => {
        editorState.backgroundImage = null;
        setBackgroundMode('transparent');
    });
    document.getElementById('bgWhite')?.addEventListener('click', () => {
        editorState.backgroundImage = null;
        setBackgroundMode('white');
    });
    document.getElementById('bgBlack')?.addEventListener('click', () => {
        editorState.backgroundImage = null;
        setBackgroundMode('black');
    });
    document.getElementById('bgCustom')?.addEventListener('click', () => {
        document.getElementById('bgColorPicker').click();
    });
    document.getElementById('bgColorPicker')?.addEventListener('input', (e) => {
        editorState.backgroundImage = null;
        editorState.customBgColor = e.target.value;
        setBackgroundMode('custom');
    });

    document.getElementById('addTextBtn')?.addEventListener('click', addText);
    document.getElementById('randomFontBtn')?.addEventListener('click', setRandomFont);
    document.getElementById('deleteTextBtn')?.addEventListener('click', deleteSelectedText);
    document.getElementById('bgUpload')?.addEventListener('change', uploadBackground);

    // FIX 4 — Alignment Logic Correction (Mapping straight)
    document.getElementById('alignLeft')?.addEventListener('click', () => setAlignment('left'));
    document.getElementById('alignCenter')?.addEventListener('click', () => setAlignment('center'));
    document.getElementById('alignRight')?.addEventListener('click', () => setAlignment('right'));

    document.getElementById('fillType')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.fillType = e.target.value;
            syncUI();
            renderCanvas();
        }
    });
    document.getElementById('textColor2')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.color2 = e.target.value; renderCanvas(); } });
    document.getElementById('patternSelect')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.fillPattern = e.target.value;
            loadPattern(e.target.value).then(() => renderCanvas());
        }
    });

    document.getElementById('outlineToggle')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.outlineEnabled = e.target.checked;
            syncUI();
            renderCanvas();
        }
    });
    document.getElementById('outlineColor')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.outlineColor = e.target.value; renderCanvas(); } });
    document.getElementById('outlineColor2')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.outlineColor2 = e.target.value; renderCanvas(); } });
    document.getElementById('outlineWidth')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.outlineWidth = parseFloat(e.target.value); renderCanvas(); } });
    document.getElementById('outlineType')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.outlineType = e.target.value;
            syncUI();
            renderCanvas();
        }
    });

    document.getElementById('shadowToggle')?.addEventListener('change', (e) => { if (editorState.selectedText) { editorState.selectedText.shadowEnabled = e.target.checked; syncUI(); renderCanvas(); } });
    document.getElementById('shadowColor')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.shadowColor = e.target.value; renderCanvas(); } });
    document.getElementById('shadowBlur')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.shadowBlur = parseInt(e.target.value); renderCanvas(); } });

    document.getElementById('threeDToggle')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.enable3D = e.target.checked;
            syncUI();
            renderCanvas();
        }
    });

    document.getElementById('neonEffectToggle')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.neonEffectEnabled = e.target.checked;
            if (e.target.checked) {
                // Initialize with Mint #00FFD8 if not set
                if (!editorState.selectedText.glowColor || editorState.selectedText.glowColor === '#ffffff') {
                    editorState.selectedText.glowColor = '#00FFD8';
                    editorState.selectedText.glowStrength = 60;
                }
                document.getElementById('neonColor')?.click();
            }
            syncUI();
            renderCanvas();
        }
    });

    document.getElementById('glitchToggle')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.glitchEnabled = e.target.checked;
            renderCanvas();
        }
    });

    document.getElementById('neonToggle')?.addEventListener('change', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.glowEnabled = e.target.checked;
            if (e.target.checked) {
                // Auto-open color picker on check
                document.getElementById('neonColor')?.click();
            }
            syncUI();
            renderCanvas();
        }
    });
    document.getElementById('neonColor')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.glowColor = e.target.value; renderCanvas(); } });
    document.getElementById('neonBlur')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.glowStrength = parseInt(e.target.value); renderCanvas(); } });

    setupSyncControl('sizeRange', 'sizeNum', 'size');
    setupSyncControl('sideRotation', 'rotationNum', 'rotation');
    setupSyncControl('warpRange', 'warpNum', 'warp');
    setupSyncControl('spacingRange', 'spacingNum', 'spacing');
    setupSyncControl('lineHeightRange', 'lineHeightNum', 'lineHeight');

    // Custom Opacity Sync (0-1 range vs 0-100 num)
    const oRange = document.getElementById('opacityRange');
    const oNum = document.getElementById('opacityNum');
    if (oRange && oNum) {
        oRange.addEventListener('input', () => {
            const val = parseFloat(oRange.value);
            oNum.value = Math.round(val * 100);
            if (editorState.selectedText) { editorState.selectedText.opacity = val; renderCanvas(); }
        });
        oNum.addEventListener('input', () => {
            const val = parseFloat(oNum.value) / 100;
            oRange.value = val;
            if (editorState.selectedText) { editorState.selectedText.opacity = val; renderCanvas(); }
        });
    }

    // Bind Shadow Controls
    setupSyncControl('shadowBlur', 'shadowBlurNum', 'shadowBlur');
    setupSyncControl('shadowOffsetX', 'shadowOXNum', 'shadowOffsetX');
    setupSyncControl('shadowOffsetY', 'shadowOYNum', 'shadowOffsetY');
    setupSyncControl('shadowOpacity', 'shadowOpacityNum', 'shadowOpacity');

    // Bind Neon/Glow Controls
    setupSyncControl('neonBlur', 'neonBlurNum', 'glowStrength');
    setupSyncControl('neonOpacity', 'neonOpacityNum', 'glowOpacity');

    document.getElementById('weightSelect')?.addEventListener('change', (e) => { if (editorState.selectedText) { editorState.selectedText.weight = e.target.value; renderCanvas(); } });
    document.getElementById('fontSelect')?.addEventListener('change', (e) => applyFont(e.target.value));

    // FIX 1 — X/Y Pos Bidirectional Sync
    document.getElementById('posXNum')?.addEventListener('input', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.x = parseFloat(e.target.value);
            renderCanvas();
        }
    });
    document.getElementById('posYNum')?.addEventListener('input', (e) => {
        if (editorState.selectedText) {
            editorState.selectedText.y = parseFloat(e.target.value);
            renderCanvas();
        }
    });

    document.getElementById('fontPickerTrigger')?.addEventListener('click', (e) => {
        const dropdown = document.getElementById('fontPickerDropdown');
        if (dropdown) dropdown.style.display = (dropdown.style.display === 'none') ? 'block' : 'none';
        e.stopPropagation();
    });

    document.getElementById('langSelect')?.addEventListener('change', (e) => populateFontPicker(e.target.value));

    // FIX 4 — Optimized Font Search
    document.getElementById('fontSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const lang = document.getElementById('langSelect').value;
        populateFontPicker(lang, query);
    });

    setupSyncControl('threeDDepth', 'threeDDepthNum', 'threeDDepth');

    document.getElementById('downloadPng')?.addEventListener('click', exportPng);
    document.getElementById('downloadJpg')?.addEventListener('click', exportJpg);
    document.getElementById('downloadSvg')?.addEventListener('click', exportSvg);

    // Background Scale Controls
    const bgScaleRange = document.getElementById('bgScaleRange');
    const bgScaleDown = document.getElementById('bgScaleDown');
    const bgScaleUp = document.getElementById('bgScaleUp');

    if (bgScaleRange) {
        bgScaleRange.addEventListener('input', (e) => {
            if (editorState.backgroundImage) {
                editorState.bgScale = parseFloat(e.target.value);
                renderCanvas();
            }
        });
    }

    if (bgScaleDown) {
        bgScaleDown.addEventListener('click', () => {
            if (editorState.backgroundImage) {
                editorState.bgScale = Math.max(0.1, editorState.bgScale - 0.1);
                renderCanvas();
                syncUI();
            }
        });
    }

    if (bgScaleUp) {
        bgScaleUp.addEventListener('click', () => {
            if (editorState.backgroundImage) {
                editorState.bgScale = Math.min(5, editorState.bgScale + 0.1);
                renderCanvas();
                syncUI();
            }
        });
    }
}

/**
 * Ultimate Font Loading Trigger (DOM-based)
 * Forces the browser to recognize and download the font in a document context.
 */
function triggerDomFontLoad(fontName) {
    let loader = document.getElementById('font-trigger-element');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'font-trigger-element';
        // v7: Technically in render tree but clipped to invisibility. More robust than visibility/opacity alone.
        loader.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
        document.body.appendChild(loader);
    }
    loader.textContent = `V7-${fontName}-${Math.random().toString(36).substring(7)}`;
    loader.style.fontFamily = `"${fontName}", monospace`; // Monospace fallback for width trigger
}

async function applyFont(fontName) {
    if (!editorState.selectedText) return;
    editorState.selectedText.font = fontName;

    editorState.fontLoading = true;
    triggerDomFontLoad(fontName);

    const label = document.getElementById('fontPickerLabel');
    if (label) {
        label.textContent = fontName;
        label.style.fontFamily = `"${fontName}", sans-serif`;
    }

    const weight = editorState.selectedText.weight || '700';
    const testSize = 100;
    const testBaseline = "monospace";
    const testString = "MWli10lI!@#";

    try {
        await loadGoogleFont(fontName);
        await document.fonts.ready;

        let attempts = 0;
        let isConfirmed = false;

        // Sentinel Canvas: Offscreen canvas specifically for Zero-Tolerance width delta check
        const sentinel = document.createElement('canvas');
        const sctx = sentinel.getContext('2d');

        while (attempts < 60) { // 3.0s total budget for extreme reliability
            triggerDomFontLoad(fontName);

            sctx.font = `${weight} ${testSize}px ${testBaseline}`;
            const baselineWidth = sctx.measureText(testString).width;

            sctx.font = `${weight} ${testSize}px "${fontName}", ${testBaseline}`;
            const targetWidth = sctx.measureText(testString).width;

            // Zero-Tolerance check: the second the width changes from monospace, we know the webfont is active.
            // Also check document.fonts.check as a parallel signal.
            if (Math.abs(baselineWidth - targetWidth) > 0.1 || document.fonts.check(`${weight} 60px "${fontName}"`)) {
                isConfirmed = true;
                break;
            }

            await new Promise(r => setTimeout(r, 50));
            attempts++;
        }
    } catch (e) {
        console.error("V7 Sentinel System encountered an error:", e);
    }

    editorState.fontLoading = false;
    editorState.initializationLock = false; // Release the Double-Lock (safe after sentinel check)
    renderCanvas();

    // v7 Decaying Pulse: 50, 150, 400, 1000, 2500, 5000ms
    const timeline = [50, 150, 400, 1000, 2500, 5000];
    timeline.forEach(ms => {
        setTimeout(() => { if (!editorState.fontLoading) renderCanvas(); }, ms);
    });
}

function populateFontPicker(lang, query = "") {
    const allFonts = getFontsByLang(lang);
    const fonts = query ? allFonts.filter(f => f.name.toLowerCase().includes(query)) : allFonts;

    const list = document.getElementById('fontPickerList');
    if (!list) return;

    list.innerHTML = '';

    // Performance: Use DocumentFragment for batch appending
    const fragment = document.createDocumentFragment();

    fonts.forEach(f => {
        const item = document.createElement('div');
        item.className = 'font-item';
        item.textContent = f.name;
        item.dataset.font = f.name;

        // Lazy Load: Let observer handle font loading and style
        fontObserver.observe(item);

        item.addEventListener('click', () => {
            applyFont(f.name);
            const d = document.getElementById('fontPickerDropdown');
            if (d) d.style.display = 'none';
        });
        fragment.appendChild(item);
    });

    list.appendChild(fragment);
}

function setBackgroundMode(mode) {
    editorState.backgroundMode = mode;
    if (mode !== 'none') {
        editorState.backgroundImage = null;
    }
    syncUI();
    renderCanvas();
}

function setAlignment(align) {
    if (!editorState.selectedText) return;
    editorState.selectedText.align = align;
    updateAlignmentUI(align);
    renderCanvas();
}

function updateAlignmentUI(align) {
    document.querySelectorAll('.align-btn').forEach(btn => btn.classList.remove('active'));
    if (align === 'left') document.getElementById('alignLeft')?.classList.add('active');
    if (align === 'center') document.getElementById('alignCenter')?.classList.add('active');
    if (align === 'right') document.getElementById('alignRight')?.classList.add('active');
}

function uploadBackground(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = () => {
            editorState.backgroundImage = img;
            editorState.bgScale = Math.max(editorState.canvas.width / img.width, editorState.canvas.height / img.height);
            editorState.backgroundMode = 'none';
            syncUI();
            renderCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset to allow re-upload of same file
}

function addText() {
    let text;
    if (editorState.selectedText) {
        // Full Clone Style logic
        const s = editorState.selectedText;
        text = JSON.parse(JSON.stringify(s)); // Deep copy style properties
        text.content = "New Text";
        text.x = s.x + 30; // Offset for visibility
        text.y = s.y + 30;
    } else {
        text = createTextObject("New Text", 480, 270, "Roboto", 60, "#ffffff");
    }
    editorState.texts.push(text);
    editorState.selectedText = text;
    syncUI();
    renderCanvas();
}

function loadPattern(id) {
    if (!id || id === 'none') return Promise.resolve(null);
    if (loadedPatterns[id]) return Promise.resolve(loadedPatterns[id]);

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const pattern = editorState.ctx.createPattern(img, 'repeat');
            loadedPatterns[id] = pattern;
            resolve(pattern);
        };
        img.onerror = () => resolve(null);
        img.src = `/patterns/${id}.png?v=${Date.now()}`;
    });
}

function deleteSelectedText() {
    if (!editorState.selectedText) return;
    editorState.texts = editorState.texts.filter(t => t !== editorState.selectedText);
    editorState.selectedText = editorState.texts.length > 0 ? editorState.texts[editorState.texts.length - 1] : null;
    syncUI();
    renderCanvas();
}

function setRandomFont() {
    if (!editorState.selectedText) return;
    const fonts = getFontsByLang('all');
    if (fonts.length === 0) return;
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    applyFont(randomFont.name);
}

function setupSyncControl(rangeId, numId, prop) {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(numId);
    if (!range || !num) return;
    const update = (val) => {
        if (editorState.selectedText) {
            editorState.selectedText[prop] = parseFloat(val);
            renderCanvas();
        }
    };
    range.addEventListener('input', () => { num.value = range.value; update(range.value); });
    num.addEventListener('input', () => { range.value = num.value; update(num.value); });
}

function syncUI() {
    if (!editorState.selectedText) return;
    const t = editorState.selectedText;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };

    setVal('textInput', t.content);
    updateAlignmentUI(t.align || 'center');
    setVal('opacityRange', t.opacity || 1);
    setVal('opacityNum', Math.round((t.opacity || 1) * 100));
    setVal('sizeNum', Math.round(t.size));
    setVal('sizeRange', Math.round(t.size));
    setVal('rotationNum', Math.round(t.rotation));
    setVal('sideRotation', Math.round(t.rotation));
    setVal('textColor1', t.color);
    setVal('textColor2', t.color2 || "#00d4ff");
    setVal('fillType', t.fillType);
    setVal('patternSelect', t.fillPattern);
    setCheck('outlineToggle', t.outlineEnabled);
    setVal('outlineColor', t.outlineColor);
    setVal('outlineColor2', t.outlineColor2);
    setVal('outlineWidth', t.outlineWidth);
    setVal('outlineType', t.outlineType);
    setCheck('shadowToggle', t.shadowEnabled);
    setVal('shadowColor', t.shadowColor);
    setVal('shadowBlur', t.shadowBlur);
    setVal('shadowOpacity', t.shadowOpacity || 0.5);
    setCheck('threeDToggle', t.enable3D);
    setCheck('neonToggle', t.glowEnabled);
    setCheck('neonEffectToggle', t.neonEffectEnabled);
    setCheck('glitchToggle', t.glitchEnabled);
    setVal('neonColor', t.glowColor);
    setVal('neonBlur', t.glowStrength);
    setVal('neonOpacity', t.glowOpacity || 1);
    setCheck('threeDToggle', t.enable3D);
    setVal('threeDDepth', t.threeDDepth || 5);
    setVal('threeDDepthNum', t.threeDDepth || 5);
    setVal('warpRange', t.warp || 0);
    setVal('warpNum', t.warp || 0);
    setVal('spacingRange', t.spacing || 0);
    setVal('spacingNum', t.spacing || 0);
    setVal('lineHeightRange', t.lineHeight || 1.2);
    setVal('lineHeightNum', t.lineHeight || 1.2);
    setVal('posXNum', Math.round(t.x));
    setVal('posYNum', Math.round(t.y));

    const label = document.getElementById('fontPickerLabel');
    if (label) { label.textContent = t.font; label.style.fontFamily = `"${t.font}", sans-serif`; }

    // FIX 1 — Outline Controls Visibility
    const outlineControls = document.querySelector('.outline-controls');
    if (outlineControls) {
        outlineControls.style.display = t.outlineEnabled ? 'block' : 'none';
    }

    // FIX — Double Outline Color Visibility
    const outlineColor2Container = document.getElementById('outlineColor2Container');
    if (outlineColor2Container) {
        outlineColor2Container.style.display = (t.outlineEnabled && t.outlineType === 'double') ? 'block' : 'none';
    }

    // FIX 3 — Pattern / Texture Selector Visibility
    const patternContainer = document.getElementById('patternContainer');
    if (patternContainer) {
        patternContainer.style.display = (t.fillType === 'pattern') ? 'block' : 'none';
    }

    // FIX — Gradient Color Visibility
    const color2Container = document.getElementById('color2Container');
    if (color2Container) {
        color2Container.style.display = (t.fillType === 'linear' || t.fillType === 'radial') ? 'flex' : 'none';
        // Using flex instead of block to maintain label/input alignment if needed
    }

    // FIX — Shadow & Neon Controls Visibility
    const shadowControls = document.querySelector('.shadow-controls');
    if (shadowControls) shadowControls.style.display = t.shadowEnabled ? 'block' : 'none';

    const neonControls = document.querySelector('.neon-controls');
    if (neonControls) neonControls.style.display = (t.glowEnabled || t.neonEffectEnabled) ? 'block' : 'none';

    const threeDControls = document.querySelector('.three-d-controls');
    if (threeDControls) threeDControls.style.display = t.enable3D ? 'block' : 'none';

    // Background Scale Control Visibility & Sync
    const bgScaleControl = document.getElementById('bgScaleControl');
    if (bgScaleControl) {
        bgScaleControl.style.display = editorState.backgroundImage ? 'flex' : 'none';
        const bgScaleRange = document.getElementById('bgScaleRange');
        if (bgScaleRange) {
            bgScaleRange.value = editorState.bgScale;
        }
    }
}

function exportJpg() {
    const canvas = editorState.canvas;
    if (!canvas) return;

    // Hide selection handles before export
    const activeText = editorState.selectedText;
    editorState.selectedText = null;
    renderCanvas();

    // To JPG (no transparency): Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');

    tCtx.fillStyle = "#ffffff";
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `fontastic-design-${getFormattedDate()}.jpg`;
    link.href = tempCanvas.toDataURL("image/jpeg", 0.9);
    link.click();

    // Restore selection after export
    editorState.selectedText = activeText;
    renderCanvas();
}

function exportPng() {
    const canvas = editorState.canvas;
    if (!canvas) return;

    // Hide selection handles before export
    const activeText = editorState.selectedText;
    editorState.selectedText = null;
    renderCanvas();

    const link = document.createElement('a');
    link.download = `fontastic-design-${getFormattedDate()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Restore selection after export
    editorState.selectedText = activeText;
    renderCanvas();
}

function exportSvg() {
    const canvas = editorState.canvas;
    if (!canvas) return;

    // Hide selection handles before export (though SVG is generated from state)
    const activeText = editorState.selectedText;
    editorState.selectedText = null;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">`;

    // 1. Background
    if (editorState.backgroundMode === "white") {
        svgContent += `<rect width="100%" height="100%" fill="#ffffff" />`;
    } else if (editorState.backgroundMode === "black") {
        svgContent += `<rect width="100%" height="100%" fill="#000000" />`;
    } else if (editorState.backgroundMode === "custom") {
        svgContent += `<rect width="100%" height="100%" fill="${editorState.customBgColor}" />`;
    }

    // 2. Background Image (if any)
    if (editorState.backgroundImage) {
        const img = editorState.backgroundImage;
        const transform = `translate(${editorState.bgX} ${editorState.bgY}) rotate(${editorState.bgRotation}) scale(${editorState.bgScale})`;
        // Note: Inline image in SVG is complex, for simple vector export we might skip or use simplified rect
        svgContent += `<!-- Background Image Placeholder -->`;
    }

    // 3. Texts
    editorState.texts.forEach(text => {
        const opacity = text.opacity || 1;
        const fontSize = text.size || 60;
        const font = text.font || 'Roboto';
        const weight = text.weight || '700';
        const color = text.color || "#ffffff";
        const rotate = text.rotation || 0;

        const lines = text.content.split('\n');
        const lineHeight = text.lineHeight || 1.2;

        lines.forEach((line, i) => {
            const yOffset = (i - (lines.length - 1) / 2) * fontSize * lineHeight;
            const x = text.x;
            const y = text.y + yOffset;

            // Simple SVG text representation
            svgContent += `<text x="${x}" y="${y}" font-family="${font}" font-size="${fontSize}" font-weight="${weight}" fill="${color}" fill-opacity="${opacity}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rotate} ${text.x} ${text.y})">${escapeSvg(line)}</text>`;
        });
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `fontastic-design-${getFormattedDate()}.svg`;
    link.href = url;
    link.click();

    // Restore selection
    editorState.selectedText = activeText;
    renderCanvas();
}

function escapeSvg(str) {
    return str.replace(/[&<>"']/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;'
        }[m];
    });
}

function getFormattedDate() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

/**
 * Color Helpers
 */
function hexToRgba(hex, opacity) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
