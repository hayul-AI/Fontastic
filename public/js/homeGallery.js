/**
 * Fontastic - Homepage Gallery
 * Dynamically generates 120 curated font cards with lazy loading.
 */

import { FONT_LIBRARY } from './fontLibrary.js';

let currentText = "Fontastic";

function updateAllPreviews() {
    const previews = document.querySelectorAll('.font-preview');
    previews.forEach(p => {
        p.textContent = currentText;
    });
}

const fontObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const fontName = card.dataset.font;
            const fontUrlName = fontName.replace(/\s+/g, '+');

            if (!document.querySelector(`link[href*="${fontUrlName}"]`)) {
                const link = document.createElement('link');
                link.href = `https://fonts.googleapis.com/css2?family=${fontUrlName}&display=swap`;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }

            const preview = card.querySelector('.font-preview');
            preview.style.fontFamily = `'${fontName}'`;

            observer.unobserve(card);
        }
    });
}, { rootMargin: '200px' });

function generateGallery() {
    const grid = document.getElementById('font-grid');
    const fontSearchInput = document.getElementById('fontSearchInput');

    if (!grid) return;

    grid.innerHTML = '';

    const gradients = [
        'linear-gradient(135deg,#7f5af0,#2cb67d)',
        'linear-gradient(135deg,#ff7a18,#ffb347)',
        'linear-gradient(135deg,#00c6ff,#0072ff)',
        'linear-gradient(135deg,#ff4e50,#f9d423)',
        'linear-gradient(135deg,#43cea2,#185a9d)',
        'linear-gradient(135deg,#ff6a00,#ee0979)',
        'linear-gradient(135deg,#8e2de2,#4a00e0)',
        'linear-gradient(135deg,#f7971e,#ffd200)',
        'linear-gradient(135deg,#56ccf2,#2f80ed)',
        'linear-gradient(135deg,#eb3349,#f45c43)',
        'linear-gradient(135deg,#11998e,#38ef7d)',
        'linear-gradient(135deg,#c471ed,#f64f59)',
    ];

    FONT_LIBRARY.forEach((font) => {
        const card = document.createElement('div');
        card.className = 'font-card';
        card.dataset.font = font;

        const gradient = gradients[Math.floor(Math.random() * gradients.length)];

        card.innerHTML = `
            <div class="font-preview" style="background:${gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                ${currentText}
            </div>
            <div class="font-name">${font}</div>
        `;

        card.onclick = () => {
            window.location.href = `/editor?font=${encodeURIComponent(font)}`;
        };

        grid.appendChild(card);
        fontObserver.observe(card); // Lazy Load
    });

    const previewTextInput = document.getElementById('previewTextInput');

    if (previewTextInput) {
        previewTextInput.addEventListener('input', (e) => {
            const query = e.target.value;
            currentText = query || "Fontastic";
            updateAllPreviews();
        });
    }

    if (fontSearchInput) {
        fontSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            const queryLower = query.toLowerCase();

            const cards = document.querySelectorAll('.font-card');
            cards.forEach(card => {
                const fontName = card.dataset.font.toLowerCase();
                if (!query || fontName.includes(queryLower)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', generateGallery);
