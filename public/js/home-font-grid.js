import { FONT_DATABASE, FONT_STYLES } from './fontLibrary.js';

const colors = [
    "#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#845ec2", "#ff8fab"
];

const themes = [
    'theme-neon', 'theme-3d', 'theme-gradient',
    'theme-fire', 'theme-gold', 'theme-retro',
    'theme-pastel', 'theme-outline', 'theme-blue-neon'
];

function generateFontGrid(filter = '') {
    const gallery = document.getElementById('font-gallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    const filteredFonts = FONT_DATABASE.filter(font =>
        font.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredFonts.length === 0) {
        gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #9a9aa3;">No fonts found matching your search.</div>';
        return;
    }

    filteredFonts.forEach((font, index) => {
        const card = document.createElement('a');
        const fontSlug = font.name.toLowerCase().replace(/\s+/g, '-');
        card.href = `/fonts/${fontSlug}`;
        card.className = 'font-card';

        const themeClass = themes[index % themes.length];

        let previewStyle = '';
        if (font.color && FONT_STYLES[font.color]) {
            const style = FONT_STYLES[font.color];
            previewStyle = `background: ${style.css}; -webkit-background-clip: text; color: transparent;`;
        } else {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            previewStyle = `color: ${randomColor};`;
        }

        const fontFamily = `'${font.name}', sans-serif`;

        card.innerHTML = `
            <div class="card-label">${font.name}</div>
            <div class="card-preview ${themeClass}" style="font-family: ${fontFamily}; ${previewStyle}">Fontastic</div>
        `;

        card.setAttribute('data-font', font.name);

        // Click event to handle navigation (STEP 1)
        card.addEventListener('click', (e) => {
            e.preventDefault();

            // SAVE FONT PREVIEW SETTINGS (Extended logic for sync)
            localStorage.setItem("fontastic_font", font.name);

            if (font.color && FONT_STYLES[font.color]) {
                const style = FONT_STYLES[font.color];
                localStorage.setItem("selectedFillType", "linear");
                localStorage.setItem("selectedFontColor", style.colors[0]);
                localStorage.setItem("selectedFontColor2", style.colors[1]);
                localStorage.setItem("fontastic_color", style.colors[0]);
            } else {
                // If it's a solid random color (not using style map)
                const preview = card.querySelector('.card-preview');
                const color = window.getComputedStyle(preview).color;

                // Convert RGB to HEX if needed for the editor's color input
                const rgb2hex = (rgb) => {
                    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                    if (!match) return rgb; // Already hex or other
                    const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
                    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
                };

                const hexColor = rgb2hex(color);
                localStorage.setItem("selectedFillType", "solid");
                localStorage.setItem("selectedFontColor", hexColor);
                localStorage.removeItem("selectedFontColor2");
                localStorage.setItem("fontastic_color", hexColor);
            }

            // Direct navigation to editor with parameter (STEP 1)
            window.location.href = "/editor?font=" + encodeURIComponent(font.name);
        });

        gallery.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Initial generation
    generateFontGrid();

    // Search filter logic
    const searchInput = document.getElementById('fontSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            generateFontGrid(e.target.value);
        });
    }
});
