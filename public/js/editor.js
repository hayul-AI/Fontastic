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
    backgroundMode: "transparent", // transparent, white, black
    bgX: 480,
    bgY: 270,
    bgScale: 1,
    bgRotation: 0,
    fontsLoaded: false
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
 * Initialization
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeEditor();
});

function initializeEditor() {
    editorState.canvas = document.getElementById("fontCanvas");
    if (!editorState.canvas) return;
    
    editorState.ctx = editorState.canvas.getContext("2d");
    editorState.canvas.width = 960;
    editorState.canvas.height = 540;

    loadInitialState();
    bindUIEvents();
    populateFontPicker('latin');
    syncUI();
    renderCanvas();
}

function loadInitialState() {
    const params = new URLSearchParams(window.location.search);
    const initialFont = params.get("font") || localStorage.getItem("fontastic_font") || "Roboto";
    const initialColor = params.get("color") || "#ffffff";
    const initialText = localStorage.getItem('fontastic_text') || "Fontastic";

    const text = createTextObject(initialText, 480, 270, initialFont, 80, initialColor);
    editorState.texts.push(text);
    editorState.selectedText = text;
    
    applyFont(initialFont);
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
        weight: "700",
        rotation: 0,
        opacity: 1,
        align: "center",
        fillType: "solid",
        fillPattern: "gold",
        outlineEnabled: false,
        outlineColor: "#000000",
        outlineWidth: 5,
        shadowEnabled: false,
        shadowColor: "#000000",
        shadowBlur: 10,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        enable3D: false,
        glowEnabled: false,
        glowColor: "#ffffff",
        glowStrength: 40
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
    if (editorState.backgroundMode === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (editorState.backgroundMode === "black") {
        ctx.fillStyle = "#000000";
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
    ctx.font = `${text.weight || '400'} ${text.size}px '${text.font}'`;
    
    // STEP 1 — Fix Text Alignment
    ctx.textAlign = text.align || "center";
    ctx.textBaseline = "middle";
    
    ctx.translate(text.x, text.y);
    ctx.rotate(text.rotation * Math.PI / 180);

    // STEP 4 — Fix Shadow Effect
    if (text.shadowEnabled) {
        ctx.shadowColor = text.shadowColor || "rgba(0,0,0,0.5)";
        ctx.shadowBlur = text.shadowBlur || 10;
        ctx.shadowOffsetX = text.shadowOffsetX || 5;
        ctx.shadowOffsetY = text.shadowOffsetY || 5;
    }

    // STEP 5 — Fix Glow Effect
    if (text.glowEnabled) {
        ctx.shadowColor = text.glowColor || text.color || "#ffffff";
        ctx.shadowBlur = text.glowStrength || 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    // STEP 6 — Fix 3D Effect
    if (text.enable3D) {
        ctx.save();
        ctx.shadowColor = "transparent";
        for (let i = 5; i > 0; i--) {
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillText(text.content, i, i);
        }
        ctx.restore();
    }

    // STEP 2 — Fix Fill Style Pattern / Texture
    if (text.fillType === 'pattern' && text.fillPattern) {
        if (loadedPatterns[text.fillPattern]) {
            ctx.fillStyle = loadedPatterns[text.fillPattern];
        } else {
            const img = new Image();
            img.src = `/patterns/${text.fillPattern}.png`;
            img.onload = () => {
                loadedPatterns[text.fillPattern] = ctx.createPattern(img, "repeat");
                renderCanvas();
            };
            ctx.fillStyle = text.color || "#ffffff";
        }
    } else {
        ctx.fillStyle = text.color || "#ffffff";
    }

    // STEP 7 — Render Order
    ctx.fillText(text.content, 0, 0);

    // STEP 3 — Fix Outline Controls
    if (text.outlineEnabled && text.outlineWidth > 0) {
        ctx.lineWidth = text.outlineWidth;
        ctx.strokeStyle = text.outlineColor || "#000000";
        ctx.strokeText(text.content, 0, 0);
    }

    ctx.restore();
}

function drawHandles(text) {
    if (!text) return;
    const ctx = editorState.ctx;
    ctx.save();
    ctx.translate(text.x, text.y);
    ctx.rotate(text.rotation * Math.PI / 180);
    
    ctx.font = `${text.weight || '400'} ${text.size}px '${text.font}'`;
    const metrics = ctx.measureText(text.content);
    const w = metrics.width;
    const h = text.size;
    const pad = 10;

    ctx.strokeStyle = "#7c5cff";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-w/2 - pad, -h/2 - pad, w + pad*2, h + pad*2);
    ctx.setLineDash([]);
    
    const handleSize = 8;
    ctx.fillStyle = "#ffffff";
    const corner = [w/2 + pad, h/2 + pad];
    ctx.fillRect(corner[0] - handleSize/2, corner[1] - handleSize/2, handleSize, handleSize);
    ctx.strokeRect(corner[0] - handleSize/2, corner[1] - handleSize/2, handleSize, handleSize);
    
    ctx.beginPath();
    ctx.moveTo(0, -h/2 - pad);
    ctx.lineTo(0, -h/2 - pad - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -h/2 - pad - 35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

function renderCanvas() {
    const ctx = editorState.ctx;
    const canvas = editorState.canvas;
    if (!ctx || !canvas) return;

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
            ctx.font = `${t.weight || '400'} ${t.size}px '${t.font}'`;
            const metrics = ctx.measureText(t.content);
            const w = metrics.width;
            const h = t.size;
            const pad = 10;

            const dx = mouseX - t.x;
            const dy = mouseY - t.y;
            const angle = -t.rotation * Math.PI / 180;
            const lx = dx * Math.cos(angle) - dy * Math.sin(angle);
            const ly = dx * Math.sin(angle) + dy * Math.cos(angle);

            if (Math.sqrt(lx**2 + (ly + h/2 + pad + 35)**2) < 15) {
                interaction.rotating = true;
                interaction.startRotation = t.rotation;
                return;
            }
            if (Math.abs(lx - (w/2 + pad)) < 15 && Math.abs(ly - (h/2 + pad)) < 15) {
                interaction.resizing = true;
                interaction.startSize = t.size;
                return;
            }
            if (lx >= -w/2 - pad && lx <= w/2 + pad && ly >= -h/2 - pad && ly <= h/2 + pad) {
                interaction.dragging = true;
                return;
            }
        }

        let hit = false;
        for (let i = editorState.texts.length - 1; i >= 0; i--) {
            const t = editorState.texts[i];
            const dist = Math.sqrt((mouseX - t.x)**2 + (mouseY - t.y)**2);
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
            const dist = Math.sqrt((mouseX - t.x)**2 + (mouseY - t.y)**2);
            const startDist = Math.sqrt((interaction.startX - t.x)**2 + (interaction.startY - t.y)**2);
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

    canvas.addEventListener("wheel", (e) => {
        if (!editorState.backgroundImage) return;
        e.preventDefault();
        editorState.bgScale += e.deltaY * -0.001;
        editorState.bgScale = Math.max(0.1, Math.min(5, editorState.bgScale));
        renderCanvas();
    }, { passive: false });

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
            ctx.font = `${t.weight || '400'} ${t.size}px '${t.font}'`;
            const metrics = ctx.measureText(t.content);
            const w = metrics.width;
            const h = t.size;
            const pad = 10;

            if (lx >= -w/2 - pad && lx <= w/2 + pad && ly >= -h/2 - pad && ly <= h/2 + pad) {
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

    document.getElementById('textColorPicker')?.addEventListener('input', (e) => {
        if (editorState.selectedText) { editorState.selectedText.color = e.target.value; renderCanvas(); }
    });

    // FIX 2 — Canvas Background Buttons
    document.getElementById('bgTransparent')?.addEventListener('click', () => setBackgroundMode('transparent'));
    document.getElementById('bgWhite')?.addEventListener('click', () => setBackgroundMode('white'));
    document.getElementById('bgBlack')?.addEventListener('click', () => setBackgroundMode('black'));

    document.getElementById('addTextBtn')?.addEventListener('click', addText);
    document.getElementById('deleteTextBtn')?.addEventListener('click', deleteSelectedText);
    document.getElementById('bgUpload')?.addEventListener('change', uploadBackground);

    document.getElementById('alignLeft')?.addEventListener('click', () => { if (editorState.selectedText) { editorState.selectedText.align = 'left'; renderCanvas(); } });
    document.getElementById('alignCenter')?.addEventListener('click', () => { if (editorState.selectedText) { editorState.selectedText.align = 'center'; renderCanvas(); } });
    document.getElementById('alignRight')?.addEventListener('click', () => { if (editorState.selectedText) { editorState.selectedText.align = 'right'; renderCanvas(); } });

    document.getElementById('fillType')?.addEventListener('change', (e) => { 
        if (editorState.selectedText) { 
            editorState.selectedText.fillType = e.target.value; 
            syncUI(); 
            renderCanvas(); 
        } 
    });
    document.getElementById('patternSelect')?.addEventListener('change', (e) => { if (editorState.selectedText) { editorState.selectedText.fillPattern = e.target.value; renderCanvas(); } });

    document.getElementById('outlineToggle')?.addEventListener('change', (e) => { 
        if (editorState.selectedText) { 
            editorState.selectedText.outlineEnabled = e.target.checked; 
            syncUI();
            renderCanvas(); 
        } 
    });
    document.getElementById('outlineColor')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.outlineColor = e.target.value; renderCanvas(); } });
    document.getElementById('outlineWidth')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.outlineWidth = parseInt(e.target.value); renderCanvas(); } });

    document.getElementById('shadowToggle')?.addEventListener('change', (e) => { if (editorState.selectedText) { editorState.selectedText.shadowEnabled = e.target.checked; syncUI(); renderCanvas(); } });
    document.getElementById('shadowColor')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.shadowColor = e.target.value; renderCanvas(); } });
    document.getElementById('shadowBlur')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.shadowBlur = parseInt(e.target.value); renderCanvas(); } });

    document.getElementById('threeDToggle')?.addEventListener('change', (e) => { if (editorState.selectedText) { editorState.selectedText.enable3D = e.target.checked; renderCanvas(); } });

    document.getElementById('neonToggle')?.addEventListener('change', (e) => { if (editorState.selectedText) { editorState.selectedText.glowEnabled = e.target.checked; renderCanvas(); } });
    document.getElementById('neonColor')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.glowColor = e.target.value; renderCanvas(); } });
    document.getElementById('neonBlur')?.addEventListener('input', (e) => { if (editorState.selectedText) { editorState.selectedText.glowStrength = parseInt(e.target.value); renderCanvas(); } });

    setupSyncControl('sizeRange', 'sizeNum', 'size');
    setupSyncControl('sideRotation', 'rotationNum', 'rotation');
    
    document.getElementById('weightSelect')?.addEventListener('change', (e) => { if (editorState.selectedText) { editorState.selectedText.weight = e.target.value; renderCanvas(); } });
    document.getElementById('fontSelect')?.addEventListener('change', (e) => applyFont(e.target.value));

    document.getElementById('fontPickerTrigger')?.addEventListener('click', (e) => {
        const dropdown = document.getElementById('fontPickerDropdown');
        if (dropdown) dropdown.style.display = (dropdown.style.display === 'none') ? 'block' : 'none';
        e.stopPropagation();
    });

    document.getElementById('langSelect')?.addEventListener('change', (e) => populateFontPicker(e.target.value));
    document.getElementById('downloadPng')?.addEventListener('click', exportPng);
}

function applyFont(fontName) {
    if (!editorState.selectedText) return;
    editorState.selectedText.font = fontName;
    loadGoogleFont(fontName);
    const label = document.getElementById('fontPickerLabel');
    if (label) { label.textContent = fontName; label.style.fontFamily = `"${fontName}", sans-serif`; }
    document.fonts.load(`${editorState.selectedText.size}px '${fontName}'`).then(() => renderCanvas());
}

function populateFontPicker(lang) {
    const fonts = getFontsByLang(lang);
    const list = document.getElementById('fontPickerList');
    if (!list) return;
    list.innerHTML = '';
    fonts.forEach(f => {
        const item = document.createElement('div');
        item.className = 'font-item';
        item.textContent = f.name;
        item.style.fontFamily = `"${f.name}", sans-serif`;
        item.addEventListener('click', () => { applyFont(f.name); const d = document.getElementById('fontPickerDropdown'); if (d) d.style.display = 'none'; });
        list.appendChild(item);
    });
}

function setBackgroundMode(mode) {
    editorState.backgroundMode = mode;
    renderCanvas();
}

function uploadBackground(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = () => {
            editorState.backgroundImage = img;
            editorState.bgScale = Math.max(editorState.canvas.width / img.width, editorState.canvas.height / img.height);
            renderCanvas();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function addText() {
    const text = createTextObject("New Text", 480, 270, "Roboto", 60, "#ffffff");
    editorState.texts.push(text);
    editorState.selectedText = text;
    syncUI();
    renderCanvas();
}

function deleteSelectedText() {
    if (!editorState.selectedText) return;
    editorState.texts = editorState.texts.filter(t => t !== editorState.selectedText);
    editorState.selectedText = editorState.texts.length > 0 ? editorState.texts[editorState.texts.length - 1] : null;
    syncUI();
    renderCanvas();
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
    setVal('sizeNum', Math.round(t.size));
    setVal('sizeRange', Math.round(t.size));
    setVal('rotationNum', Math.round(t.rotation));
    setVal('sideRotation', Math.round(t.rotation));
    setVal('textColorPicker', t.color);
    setVal('fillType', t.fillType);
    setVal('patternSelect', t.fillPattern);
    setCheck('outlineToggle', t.outlineEnabled);
    setVal('outlineColor', t.outlineColor);
    setVal('outlineWidth', t.outlineWidth);
    setCheck('shadowToggle', t.shadowEnabled);
    setVal('shadowColor', t.shadowColor);
    setVal('shadowBlur', t.shadowBlur);
    setCheck('threeDToggle', t.enable3D);
    setCheck('neonToggle', t.glowEnabled);
    setVal('neonColor', t.glowColor);
    setVal('neonBlur', t.glowStrength);
    
    const label = document.getElementById('fontPickerLabel');
    if (label) { label.textContent = t.font; label.style.fontFamily = `"${t.font}", sans-serif`; }

    // FIX 1 — Outline Controls Visibility
    const outlineControls = document.querySelector('.outline-controls');
    if (outlineControls) {
        outlineControls.style.display = t.outlineEnabled ? 'block' : 'none';
    }

    // FIX 3 — Pattern / Texture Selector Visibility
    const patternContainer = document.getElementById('patternContainer');
    if (patternContainer) {
        patternContainer.style.display = (t.fillType === 'pattern') ? 'block' : 'none';
    }
}

function exportPng() {
    const canvas = editorState.canvas;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'fontastic-export.png';
    link.href = canvas.toDataURL("image/png");
    link.click();
}
