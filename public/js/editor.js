import { FONT_LIBRARY, FONT_DATABASE, FONT_STYLES, getFontsByLang, loadGoogleFont, batchLoadFonts } from './fontLibrary.js';

const loadedPatterns = {};

async function getPattern(imgId) {
    if (loadedPatterns[imgId]) return loadedPatterns[imgId];
    return new Promise((resolve) => {
        const img = new Image();
        img.src = `/patterns/${imgId}.png`;
        img.onload = () => {
            loadedPatterns[imgId] = img;
            resolve(img);
        };
        img.onerror = () => resolve(null); // Fallback
    });
}

async function initEditor() {
    // READ FONT FROM URL
    const params = new URLSearchParams(window.location.search);
    const fontName = params.get("font") || localStorage.getItem("fontastic_font") || "Inter";
    let font = fontName;

    const pathParts = window.location.pathname.split('/');

    if (pathParts[1] === 'fonts' && pathParts[2]) {
        const slug = pathParts[2];
        const unslugged = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const matched = FONT_DATABASE.find(f => f.name.toLowerCase() === unslugged.toLowerCase());
        if (matched) font = matched.name;
        else font = unslugged;
    } else if (params.get('font')) {
        font = params.get('font');
    } else {
        // STEP 2 — LOAD SETTINGS IN EDITOR PAGE (from user's requested key)
        const savedFont = localStorage.getItem("fontastic_font");
        if (savedFont) font = savedFont;
    }

    // LOAD GOOGLE FONT
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/ /g, "+") + "&display=swap";
    link.id = 'font-link';
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Ensure font is loaded before rendering
    await document.fonts.load(`100px "${font}"`);

    const initialMatched = FONT_DATABASE.find(f => f.name === font);
    if (initialMatched && initialMatched.color && FONT_STYLES[initialMatched.color]) {
        const style = FONT_STYLES[initialMatched.color];
        document.getElementById('fillType').value = 'linear';
        document.getElementById('textColor1').value = style.colors[0];
        document.getElementById('textColor2').value = style.colors[1];
    } else {
        // STEP 2 — LOAD SETTINGS IN EDITOR PAGE (from user's requested key)
        const savedFillType = localStorage.getItem("selectedFillType");
        const savedColor1 = localStorage.getItem("selectedFontColor") || localStorage.getItem("fontastic_color");
        const savedColor2 = localStorage.getItem("selectedFontColor2");

        if (savedFillType) document.getElementById('fillType').value = savedFillType;
        if (savedColor1) document.getElementById('textColor1').value = savedColor1;
        if (savedColor2) document.getElementById('textColor2').value = savedColor2;

        // Fallback default color if nothing is stored
        if (!savedColor1 && (!initialMatched || !initialMatched.color)) {
            document.getElementById('textColor1').value = "#ffffff";
        }
    }
    updatePanels();

    // INITIALIZE CANVAS
    const canvas = document.getElementById("previewCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 300;

    // ─── Custom Font Picker ──────────────────────────────────────
    const fontPickerTrigger = document.getElementById('fontPickerTrigger');
    const fontPickerDropdown = document.getElementById('fontPickerDropdown');
    const fontPickerList = document.getElementById('fontPickerList');
    const fontPickerLabel = document.getElementById('fontPickerLabel');
    const fontSelect = document.getElementById('fontSelect');
    const fontSearch = document.getElementById('fontSearch');
    const langSelect = document.getElementById('langSelect');

    let currentItems = []; // full list for the active language

    /** Load a Google Font, tagging the link element with a unique id */
    function ensureFontLoaded(fontName) {
        const id = 'gf-' + fontName.replace(/\s+/g, '-');
        if (document.getElementById(id)) return;
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        document.head.appendChild(link);
    }

    /** Render font items into the picker list, each in its own font */
    function renderFontItems(items) {
        fontPickerList.innerHTML = '';
        items.forEach(f => {
            ensureFontLoaded(f.name);
            const item = document.createElement('div');
            item.className = 'font-item' + (f.name === font ? ' selected' : '');
            item.textContent = f.name;
            item.style.fontFamily = `"${f.name}", sans-serif`;
            item.dataset.font = f.name;
            item.addEventListener('click', () => selectFont(f.name));
            fontPickerList.appendChild(item);
        });
    }

    /** Select a font: update label, hidden select, fire change event */
    function selectFont(name) {
        font = name;
        fontPickerLabel.textContent = name;
        fontPickerLabel.style.fontFamily = `"${name}", sans-serif`;
        updateFontLabel(name);

        // Sync hidden select value
        fontSelect.value = name;

        // Highlight selected item
        fontPickerList.querySelectorAll('.font-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.font === name);
        });

        closeDropdown();

        // Load font and re-render canvas
        ensureFontLoaded(name);

        // Apply predefined color style if exists
        const matched = FONT_DATABASE.find(f => f.name === name);
        if (matched && matched.color && FONT_STYLES[matched.color]) {
            const style = FONT_STYLES[matched.color];
            const fillTypeSelect = document.getElementById('fillType');
            const color1Input = document.getElementById('textColor1');
            const color2Input = document.getElementById('textColor2');

            if (fillTypeSelect && color1Input && color2Input) {
                fillTypeSelect.value = 'linear';
                color1Input.value = style.colors[0];
                color2Input.value = style.colors[1];
                updatePanels();
            }
        }

        document.fonts.load(`100px "${name}"`).then(() => {
            document.fonts.ready.then(renderTextPreview);
        });
    }

    function openDropdown() {
        fontPickerDropdown.style.display = 'block';
        fontPickerTrigger.classList.add('open');
        // Scroll selected item into view
        const sel = fontPickerList.querySelector('.selected');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
    }

    function closeDropdown() {
        fontPickerDropdown.style.display = 'none';
        fontPickerTrigger.classList.remove('open');
    }

    fontPickerTrigger.addEventListener('click', () => {
        fontPickerDropdown.style.display === 'none' ? openDropdown() : closeDropdown();
    });

    document.addEventListener('click', e => {
        if (!fontPickerTrigger.contains(e.target) && !fontPickerDropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    /** Populate picker from a language group */
    function populateFontSelect(langKey, activeFont) {
        const fonts = getFontsByLang(langKey);
        currentItems = fonts;
        fontSearch.value = '';

        // Sync hidden select options (for random font / value reading)
        fontSelect.innerHTML = '';
        fonts.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.name;
            opt.textContent = f.name;
            if (f.name === activeFont) opt.selected = true;
            fontSelect.appendChild(opt);
        });
        if (!fonts.find(f => f.name === activeFont)) {
            const opt = document.createElement('option');
            opt.value = activeFont;
            opt.textContent = activeFont;
            opt.selected = true;
            fontSelect.insertBefore(opt, fontSelect.firstChild);
            currentItems = [{ name: activeFont, lang: langKey }, ...currentItems];
        }

        renderFontItems(currentItems);

        // Update trigger label
        fontPickerLabel.textContent = activeFont;
        fontPickerLabel.style.fontFamily = `"${activeFont}", sans-serif`;
    }

    populateFontSelect('latin', font);

    // Language switch — jump to first font of new group
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            const lang = langSelect.value;
            const groupFonts = getFontsByLang(lang);
            const newFont = groupFonts.length > 0 ? groupFonts[0].name : font;
            font = newFont;
            updateFontLabel(font);
            populateFontSelect(lang, font);
            ensureFontLoaded(font);
            document.fonts.load(`100px "${font}"`).then(() => {
                document.fonts.ready.then(renderTextPreview);
            });
        });
    }

    // Font search — filter visible items in the picker
    fontSearch.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = q
            ? currentItems.filter(f => f.name.toLowerCase().includes(q))
            : currentItems;
        renderFontItems(filtered);
        if (filtered.length > 0) openDropdown();
    });



    // UI Toggles
    const fillType = document.getElementById('fillType');
    const outlineToggle = document.getElementById('outlineToggle');
    const shadowToggle = document.getElementById('shadowToggle');
    const threeDToggle = document.getElementById('threeDToggle');
    const neonToggle = document.getElementById('neonToggle');
    const outlineType = document.getElementById('outlineType');

    function updatePanels() {
        const vFill = fillType.value;
        document.getElementById('color1Container').style.display = (vFill === 'solid' || vFill === 'linear' || vFill === 'radial') ? 'block' : 'none';
        document.getElementById('color2Container').style.display = (vFill === 'linear' || vFill === 'radial') ? 'block' : 'none';
        document.getElementById('patternContainer').style.display = (vFill === 'pattern') ? 'block' : 'none';

        document.querySelector('.outline-controls').style.display = outlineToggle.checked ? 'block' : 'none';
        document.getElementById('outlineColor2Container').style.display = outlineType.value === 'double' ? 'block' : 'none';

        document.querySelector('.shadow-controls').style.display = shadowToggle.checked ? 'block' : 'none';
        document.querySelector('.threed-controls').style.display = threeDToggle.checked ? 'block' : 'none';
        document.querySelector('.neon-controls').style.display = neonToggle.checked ? 'block' : 'none';
    }

    fillType.addEventListener('change', () => { updatePanels(); renderTextPreview(); });
    outlineToggle.addEventListener('change', () => { updatePanels(); renderTextPreview(); });
    outlineType.addEventListener('change', () => { updatePanels(); renderTextPreview(); });
    shadowToggle.addEventListener('change', () => { updatePanels(); renderTextPreview(); });
    threeDToggle.addEventListener('change', () => { updatePanels(); renderTextPreview(); });
    neonToggle.addEventListener('change', () => { updatePanels(); renderTextPreview(); });
    document.getElementById('bgSelect').addEventListener('change', (e) => {
        document.querySelector('.canvas-area').className = `canvas-area bg-${e.target.value}`;
    });

    let activePattern = null;

    function drawStyledText(targetCtx, x, y, width, height, scale = 1) {
        const text = document.getElementById('textInput').value;
        const fontSize = parseInt(document.getElementById('sizeRange').value) * scale;
        const spacing = parseInt(document.getElementById('spacingRange').value) * scale;
        const lineHeight = parseFloat(document.getElementById('lineHeightRange').value);
        const fontWeight = document.getElementById('weightSelect').value;

        const ft = fillType.value;
        const color1 = document.getElementById('textColor1').value;
        const color2 = document.getElementById('textColor2').value;

        const isOutline = outlineToggle.checked;
        const oType = outlineType.value;
        const oColor = document.getElementById('outlineColor').value;
        const oColor2 = document.getElementById('outlineColor2').value;
        const oWidth = parseInt(document.getElementById('outlineWidth').value) * scale;

        const isShadow = shadowToggle.checked;
        const sType = document.getElementById('shadowType').value;
        const sColor = document.getElementById('shadowColor').value;
        const sBlur = parseInt(document.getElementById('shadowBlur').value) * scale;
        const sOffsetX = parseInt(document.getElementById('shadowOffsetX').value) * scale;
        const sOffsetY = parseInt(document.getElementById('shadowOffsetY').value) * scale;

        const is3D = threeDToggle.checked;
        const dType = document.getElementById('threeDType').value;
        const dColor = document.getElementById('threeDColor').value;
        const dDepth = parseInt(document.getElementById('threeDDepth').value) * scale;
        const dAngle = parseInt(document.getElementById('threeDDirection').value) * Math.PI / 180;

        const isNeon = neonToggle.checked;
        const nType = document.getElementById('glowType').value;
        const nColor = document.getElementById('neonColor').value;
        const nIntensity = parseInt(document.getElementById('neonIntensity').value) * scale;

        const opacityElem = document.getElementById('opacityRange');
        const opacity = opacityElem ? parseFloat(opacityElem.value) : 1;

        targetCtx.clearRect(0, 0, width, height);
        targetCtx.globalAlpha = opacity;

        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';
        targetCtx.font = `${fontWeight} ${fontSize}px "${font}"`;
        targetCtx.letterSpacing = `${spacing}px`;

        const lines = text.split('\n');
        const verticalSpacing = fontSize * lineHeight;
        const totalHeight = verticalSpacing * (lines.length - 1);
        const startY = y - (totalHeight / 2);

        const drawPass = (line, dx, dy, pass) => {
            targetCtx.shadowColor = 'transparent';
            targetCtx.shadowBlur = 0;
            targetCtx.shadowOffsetX = 0;
            targetCtx.shadowOffsetY = 0;
            targetCtx.lineWidth = 0;
            targetCtx.setLineDash([]);

            if (pass === '3d') {
                targetCtx.fillStyle = dColor;
                targetCtx.fillText(line, dx, dy);
                if (dType === 'stacked') {
                    targetCtx.lineWidth = 2 * scale;
                    targetCtx.strokeStyle = '#000';
                    targetCtx.strokeText(line, dx, dy);
                }
            } else if (pass === 'shadow') {
                targetCtx.fillStyle = 'rgba(0,0,0,0)';
                targetCtx.shadowColor = sColor;
                targetCtx.shadowBlur = sBlur;
                targetCtx.shadowOffsetX = sOffsetX;
                targetCtx.shadowOffsetY = sOffsetY;
                targetCtx.fillText(line, dx, dy);
            } else if (pass === 'neon') {
                targetCtx.fillStyle = 'rgba(0,0,0,0)';
                targetCtx.shadowColor = nColor;
                targetCtx.shadowBlur = nIntensity;
                let reps = nType === 'aura' ? 4 : (nType === 'neon' ? 2 : 1);
                for (let i = 0; i < reps; i++) targetCtx.fillText(line, dx, dy);
            } else if (pass === 'fill') {
                if (ft === 'linear') {
                    const metrics = targetCtx.measureText(line);
                    const gradient = targetCtx.createLinearGradient(dx - metrics.width / 2, 0, dx + metrics.width / 2, 0);
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(1, color2);
                    targetCtx.fillStyle = gradient;
                } else if (ft === 'radial') {
                    const gradient = targetCtx.createRadialGradient(dx, dy, 0, dx, dy, fontSize);
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(1, color2);
                    targetCtx.fillStyle = gradient;
                } else if (ft === 'pattern' && activePattern) {
                    const patternCanvas = document.createElement('canvas'); // Workaround for HDPI scaling
                    targetCtx.fillStyle = targetCtx.createPattern(activePattern, 'repeat');
                } else {
                    targetCtx.fillStyle = color1;
                }
                targetCtx.fillText(line, dx, dy);
            } else if (pass === 'outline') {
                if (oWidth > 0) {
                    if (oType === 'double') {
                        targetCtx.lineWidth = oWidth * 2;
                        targetCtx.strokeStyle = oColor2;
                        targetCtx.strokeText(line, dx, dy);
                        targetCtx.lineWidth = oWidth;
                        targetCtx.strokeStyle = oColor;
                        targetCtx.strokeText(line, dx, dy);
                    } else if (oType === 'gradient') {
                        const metrics = targetCtx.measureText(line);
                        const gradient = targetCtx.createLinearGradient(dx - metrics.width / 2, 0, dx + metrics.width / 2, 0);
                        gradient.addColorStop(0, color1);
                        gradient.addColorStop(1, color2 || '#ffffff');
                        targetCtx.lineWidth = oWidth;
                        targetCtx.strokeStyle = gradient;
                        targetCtx.strokeText(line, dx, dy);
                    } else {
                        targetCtx.lineWidth = oWidth;
                        targetCtx.strokeStyle = oColor;
                        targetCtx.strokeText(line, dx, dy);
                    }
                }
            }
        };

        lines.forEach((line, index) => {
            const currentY = startY + (index * verticalSpacing);

            // 3D Layer
            if (is3D) {
                let step = (dType === 'stacked') ? 5 : 1;
                for (let i = dDepth * step; i > 0; i -= step) {
                    const offsetX = Math.cos(dAngle) * i;
                    const offsetY = Math.sin(dAngle) * i;
                    drawPass(line, x + offsetX, currentY + offsetY, '3d');
                }
            }

            // Shadow Layer
            if (isShadow) {
                if (sType === 'long' || sType === 'deep') {
                    let len = sType === 'long' ? 100 : 30;
                    for (let i = len; i > 0; i--) {
                        drawPass(line, x + i, currentY + i, '3d'); // Cheat long shadow using 3D logic
                    }
                } else {
                    drawPass(line, x, currentY, 'shadow');
                }
            }

            // Glow Layer
            if (isNeon) drawPass(line, x, currentY, 'neon');

            // Outline Back Layer (if not stroke override)
            if (isOutline) drawPass(line, x, currentY, 'outline');

            // Fill Layer
            drawPass(line, x, currentY, 'fill');
        });
    }

    async function renderTextPreview() {
        if (fillType.value === 'pattern') {
            const pid = document.getElementById('patternSelect').value;
            activePattern = await getPattern(pid);
        } else {
            activePattern = null;
        }
        // Draw whatever user typed — empty text simply renders nothing
        drawStyledText(ctx, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 1);
    }

    // Macro Presets
    document.getElementById('macroSelect').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'none') return;

        // Reset basic toggles
        outlineToggle.checked = false;
        shadowToggle.checked = false;
        threeDToggle.checked = false;
        neonToggle.checked = false;

        switch (val) {
            case 'fire':
                fillType.value = 'linear';
                document.getElementById('textColor1').value = '#ffff00';
                document.getElementById('textColor2').value = '#ff0000';
                neonToggle.checked = true;
                document.getElementById('glowType').value = 'neon';
                document.getElementById('neonColor').value = '#ff5500';
                document.getElementById('neonIntensity').value = 40;
                break;
            case 'ice':
                fillType.value = 'pattern';
                document.getElementById('patternSelect').value = 'ice';
                outlineToggle.checked = true;
                document.getElementById('outlineType').value = 'single';
                document.getElementById('outlineColor').value = '#ffffff';
                document.getElementById('outlineWidth').value = '1';
                neonToggle.checked = true;
                document.getElementById('glowType').value = 'soft';
                document.getElementById('neonColor').value = '#00ffff';
                break;
            case 'chrome':
                fillType.value = 'pattern';
                document.getElementById('patternSelect').value = 'chrome';
                outlineToggle.checked = true;
                document.getElementById('outlineType').value = 'double';
                document.getElementById('outlineColor').value = '#ffffff';
                document.getElementById('outlineColor2').value = '#000000';
                break;
            case 'gold':
                fillType.value = 'pattern';
                document.getElementById('patternSelect').value = 'gold';
                threeDToggle.checked = true;
                document.getElementById('threeDType').value = 'extrude';
                document.getElementById('threeDColor').value = '#3d2b00';
                document.getElementById('threeDDepth').value = '15';
                break;
            case 'neon':
                fillType.value = 'solid';
                document.getElementById('textColor1').value = '#ffffff';
                outlineToggle.checked = true;
                document.getElementById('outlineType').value = 'single';
                document.getElementById('outlineColor').value = '#ff00ff';
                document.getElementById('outlineWidth').value = '4';
                neonToggle.checked = true;
                document.getElementById('glowType').value = 'aura';
                document.getElementById('neonColor').value = '#ff00ff';
                document.getElementById('neonIntensity').value = '50';
                break;
            case 'cyberpunk':
                fillType.value = 'linear';
                document.getElementById('textColor1').value = '#00ffff';
                document.getElementById('textColor2').value = '#ff00ff';
                threeDToggle.checked = true;
                document.getElementById('threeDType').value = 'extrude';
                document.getElementById('threeDColor').value = '#111111';
                document.getElementById('threeDDirection').value = '135';
                outlineToggle.checked = true;
                document.getElementById('outlineType').value = 'single';
                document.getElementById('outlineColor').value = '#000000';
                document.getElementById('outlineWidth').value = '2';
                break;
            case 'holographic':
                fillType.value = 'radial';
                document.getElementById('textColor1').value = '#ffffff';
                document.getElementById('textColor2').value = '#ff00ff';
                neonToggle.checked = true;
                document.getElementById('glowType').value = 'aura';
                document.getElementById('neonColor').value = '#00ffff';
                outlineToggle.checked = true;
                document.getElementById('outlineType').value = 'single';
                document.getElementById('outlineColor').value = '#00ffff';
                break;
            case 'liquid':
                fillType.value = 'radial';
                document.getElementById('textColor1').value = '#ffffff';
                document.getElementById('textColor2').value = '#aaaaaa';
                shadowToggle.checked = true;
                document.getElementById('shadowType').value = 'soft';
                document.getElementById('shadowColor').value = '#000000';
                document.getElementById('shadowBlur').value = '30';
                break;
        }

        updatePanels();
        renderTextPreview();
    });

    const inputs = document.querySelectorAll('input, select:not(#bgSelect):not(#resSelect), textarea');
    inputs.forEach(el => el.addEventListener('input', renderTextPreview));
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(el => el.addEventListener('change', renderTextPreview));

    // Pattern load triggers
    document.getElementById('patternSelect').addEventListener('change', renderTextPreview);

    document.getElementById('downloadPng').addEventListener('click', () => {
        const resolution = parseInt(document.getElementById('resSelect').value);
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = resolution;
        exportCanvas.height = Math.round(resolution * (600 / 1400));
        const exportCtx = exportCanvas.getContext('2d');
        const scaleMultiplier = resolution / 1400;

        drawStyledText(
            exportCtx,
            exportCanvas.width / 2,
            exportCanvas.height / 2,
            exportCanvas.width,
            exportCanvas.height,
            scaleMultiplier
        );

        const url = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `fontastic-${font.toLowerCase()}-${resolution}px.png`;
        link.click();
    });

    // Parse styling URL parameters
    if (params.has('color')) document.getElementById('textColor1').value = params.get('color');
    if (params.has('color2')) document.getElementById('textColor2').value = params.get('color2');

    if (params.get('gradient') === '1') {
        fillType.value = 'linear';
    }

    if (params.get('shadow') === '1') {
        shadowToggle.checked = true;
        if (params.has('shadowColor')) document.getElementById('shadowColor').value = params.get('shadowColor');
    }

    if (params.get('outline') === '1') {
        outlineToggle.checked = true;
        if (params.has('outlineColor')) document.getElementById('outlineColor').value = params.get('outlineColor');
    }

    if (params.get('glow') === '1') {
        neonToggle.checked = true;
        if (params.has('glowColor')) document.getElementById('neonColor').value = params.get('glowColor');
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('macroSelect').value = 'none';
            document.getElementById('textInput').value = 'Fontastic';
            document.getElementById('sizeRange').value = '100';
            document.getElementById('spacingRange').value = '0';
            document.getElementById('lineHeightRange').value = '1.2';
            document.getElementById('weightSelect').value = '700';
            document.getElementById('fillType').value = 'solid';
            document.getElementById('textColor1').value = '#6c4cff';

            const opacityElem = document.getElementById('opacityRange');
            if (opacityElem) opacityElem.value = '1';

            outlineToggle.checked = false;
            shadowToggle.checked = false;
            threeDToggle.checked = false;
            neonToggle.checked = false;

            updatePanels();
            renderTextPreview();
        });
    }

    const randomFontBtn = document.getElementById('randomFontBtn');
    if (randomFontBtn) {
        randomFontBtn.addEventListener('click', () => {
            const currentLang = langSelect ? langSelect.value : 'latin';
            const group = getFontsByLang(currentLang);
            const randomEntry = group[Math.floor(Math.random() * group.length)];
            selectFont(randomEntry.name);
        });
    }

    updatePanels();
    document.getElementById('bgSelect').dispatchEvent(new Event('change'));

    // RENDER PREVIEW
    function renderPreview() {
        // Fallback for text if input is empty
        const textValue = document.getElementById("textInput")?.value || "Fontastic";
        renderTextPreview(textValue);
    }

    // RUN ON PAGE LOAD
    window.addEventListener("load", renderPreview);

    // LIVE TEXT UPDATE
    const textInput = document.getElementById("textInput");
    if (textInput) {
        textInput.addEventListener("input", renderPreview);
    }

    // Export current font to global for other functions if needed
    window.currentFontName = font;

    // Initial render
    renderPreview();
}

// Ensure initEditor runs
document.addEventListener('DOMContentLoaded', initEditor);
