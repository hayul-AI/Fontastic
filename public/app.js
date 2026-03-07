import { Engine } from './engine.js';
import { PRESETS } from './presets.js';

class App {
    constructor() {
        this.engine = new Engine('text-canvas');
        this.initRouter();
        this.initEventListeners();
        
        // Timeout allows CSS layout to stabilize before initial render
        setTimeout(() => this.handleRoute(), 50);
    }

    initRouter() {
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Intercept navigation
        document.body.addEventListener('click', e => {
            if (e.target.matches('nav a')) {
                e.preventDefault();
                const url = e.target.getAttribute('href');
                history.pushState(null, '', url);
                this.handleRoute();
            }
        });
    }

    handleRoute() {
        const path = window.location.pathname;
        const route = PRESETS[path] || PRESETS['/'];

        // Update Standard SEO Tags
        document.title = route.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', route.description);
        
        // Update Open Graph Tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
        ogTitle.setAttribute('content', route.title);

        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
        ogDesc.setAttribute('content', route.description);

        const canLink = document.querySelector('link[rel="canonical"]');
        if (canLink) canLink.setAttribute('href', window.location.origin + path);

        // Update Semantic Content
        this.updateSEOContent(route);
        this.updateSchema(route);

        // Apply visual config to engine
        this.engine.updateConfig(route.config);
        this.syncFormInputs(route.config);
    }

    syncFormInputs(config) {
        const map = {
            'text-input': 'text',
            'font-select': 'fontFamily',
            'font-size': 'fontSize',
            'letter-spacing': 'letterSpacing',
            'line-height': 'lineHeight',
            'text-curve': 'textCurve',
            'text-color': 'textColor',
            'accent-color': 'accentColor',
            'stroke-width': 'strokeWidth',
            'bg-color': 'bgColor',
            'texture-select': 'texture'
        };
        for(const [id, key] of Object.entries(map)) {
            const el = document.getElementById(id);
            if(el && config[key] !== undefined) {
                el.value = config[key];
            }
        }
        
        // Sync background type button
        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.bg === config.bgType);
        });
        document.getElementById('bg-color').style.display = config.bgType === 'solid' ? 'block' : 'none';
    }

    updateSEOContent(route) {
        document.getElementById('seo-content').innerHTML = `
            <h1>${route.h1}</h1>
            <p>${route.content}</p>
        `;

        const imageGrid = document.getElementById('image-examples');
        if (route.examples && route.examples.length > 0) {
            imageGrid.innerHTML = route.examples.map(ex => `
                <figure class="example-item">
                    <img src="${ex.src}" alt="${ex.alt}" loading="lazy" width="300" height="150">
                </figure>
            `).join('');
        } else {
            imageGrid.innerHTML = '';
        }

        document.getElementById('faq-content').innerHTML = `
            <h2>Frequently Asked Questions</h2>
            <div class="faq-item">
                <h3>Is this ${route.h1} free?</h3>
                <p>Yes, Fontastic is completely free to use for both personal and commercial projects without watermarks.</p>
            </div>
            <div class="faq-item">
                <h3>How do I download high-quality text images?</h3>
                <p>Use the export resolution dropdown to select 2x (Retina) or 4x (4K) before clicking Download PNG or JPG.</p>
            </div>
        `;
    }

    updateSchema(route) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": route.h1,
            "operatingSystem": "All",
            "applicationCategory": "MultimediaApplication",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "description": route.description
        };
        
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": `Is this ${route.h1} free?`,
                    "acceptedAnswer": { "@type": "Answer", "text": "Yes, Fontastic is completely free to use for both personal and commercial projects without watermarks." }
                },
                {
                    "@type": "Question",
                    "name": "How do I download high-quality text images?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Use the export resolution dropdown to select 2x (Retina) or 4x (4K) before clicking Download PNG or JPG." }
                }
            ]
        };

        let script = document.getElementById('schema-data');
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'schema-data';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify([schema, faqSchema]);
    }

    initEventListeners() {
        const inputs = {
            'text-input': 'text',
            'font-select': 'fontFamily',
            'font-size': 'fontSize',
            'letter-spacing': 'letterSpacing',
            'line-height': 'lineHeight',
            'text-curve': 'textCurve',
            'text-color': 'textColor',
            'accent-color': 'accentColor',
            'stroke-width': 'strokeWidth',
            'bg-color': 'bgColor',
            'texture-select': 'texture'
        };

        Object.entries(inputs).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('input', (e) => {
                    let val = e.target.value;
                    if(e.target.type === 'range') val = parseFloat(val);
                    this.engine.updateConfig({ [key]: val });
                });
            }
        });

        document.getElementById('export-res')?.addEventListener('change', e => {
            this.engine.updateConfig({ resolution: parseInt(e.target.value) });
        });

        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const bgType = btn.dataset.bg;
                this.engine.updateConfig({ bgType });
                document.getElementById('bg-color').style.display = bgType === 'solid' ? 'block' : 'none';
            });
        });

        document.getElementById('download-png')?.addEventListener('click', () => this.engine.download('png'));
        document.getElementById('download-jpg')?.addEventListener('click', () => this.engine.download('jpg'));
    }
}

new App();