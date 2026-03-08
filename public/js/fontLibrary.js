/**
 * Fontastic - Multilingual Font Library
 * All fonts are from Google Fonts (SIL Open Font License) — Commercial use allowed.
 * Each font is a { name, lang } object for language-based filtering.
 */

export const FONT_STYLES = {
    gradient1: {
        css: "linear-gradient(135deg, #6a5cff, #4fd1ff)",
        colors: ["#6a5cff", "#4fd1ff"]
    },
    gradient2: {
        css: "linear-gradient(135deg, #ff7a18, #ffb347)",
        colors: ["#ff7a18", "#ffb347"]
    },
    gradient3: {
        css: "linear-gradient(135deg, #00c6ff, #0072ff)",
        colors: ["#00c6ff", "#0072ff"]
    },
    gradient4: {
        css: "linear-gradient(135deg, #ff4e50, #f9d423)",
        colors: ["#ff4e50", "#f9d423"]
    }
};

export const FONT_DATABASE = [
    // ══════════════════════════════════════
    //  LATIN (ENGLISH)
    // ══════════════════════════════════════

    // Display / Futuristic
    { name: "Orbitron", lang: "latin", color: "gradient1" },
    { name: "Sigmar", lang: "latin", color: "gradient2" },
    { name: "Audiowide", lang: "latin", color: "gradient3" },
    { name: "Monoton", lang: "latin", color: "gradient4" },
    { name: "Syncopate", lang: "latin", color: "gradient1" },
    { name: "Squada One", lang: "latin" },
    { name: "Anton", lang: "latin" },
    { name: "Bebas Neue", lang: "latin" },
    { name: "Oswald", lang: "latin" },
    { name: "Righteous", lang: "latin" },
    { name: "Russo One", lang: "latin" },
    { name: "Bungee", lang: "latin" },
    { name: "Black Ops One", lang: "latin" },
    { name: "Titan One", lang: "latin" },
    { name: "Archivo Black", lang: "latin" },
    { name: "Alfa Slab One", lang: "latin" },
    { name: "Staatliches", lang: "latin" },
    { name: "Teko", lang: "latin" },

    // Modern Sans-Serif
    { name: "Sora", lang: "latin" },
    { name: "Outfit", lang: "latin" },
    { name: "Manrope", lang: "latin" },
    { name: "Urbanist", lang: "latin" },
    { name: "Space Grotesk", lang: "latin" },
    { name: "DM Sans", lang: "latin" },
    { name: "Red Hat Display", lang: "latin" },
    { name: "Karla", lang: "latin" },
    { name: "Libre Franklin", lang: "latin" },
    { name: "Public Sans", lang: "latin" },
    { name: "Work Sans", lang: "latin" },
    { name: "Inter", lang: "latin" },
    { name: "Montserrat", lang: "latin" },
    { name: "Poppins", lang: "latin" },
    { name: "Raleway", lang: "latin" },
    { name: "Rubik", lang: "latin" },
    { name: "Nunito", lang: "latin" },
    { name: "Mulish", lang: "latin" },
    { name: "Kanit", lang: "latin" },
    { name: "Plus Jakarta Sans", lang: "latin" },
    { name: "Cabin", lang: "latin" },
    { name: "Barlow", lang: "latin" },
    { name: "Exo", lang: "latin" },
    { name: "IBM Plex Sans", lang: "latin" },

    // Script / Handwritten
    { name: "Lobster", lang: "latin" },
    { name: "Pacifico", lang: "latin" },
    { name: "Dancing Script", lang: "latin" },
    { name: "Great Vibes", lang: "latin" },
    { name: "Satisfy", lang: "latin" },
    { name: "Kaushan Script", lang: "latin" },
    { name: "Yellowtail", lang: "latin" },
    { name: "Allura", lang: "latin" },
    { name: "Cookie", lang: "latin" },
    { name: "Sacramento", lang: "latin" },
    { name: "Parisienne", lang: "latin" },
    { name: "Marck Script", lang: "latin" },
    { name: "Alex Brush", lang: "latin" },
    { name: "Courgette", lang: "latin" },
    { name: "Damion", lang: "latin" },
    { name: "Kalam", lang: "latin" },

    // Fun / Quirky
    { name: "Fredoka", lang: "latin" },
    { name: "Baloo 2", lang: "latin" },
    { name: "Luckiest Guy", lang: "latin" },
    { name: "Press Start 2P", lang: "latin" },
    { name: "Permanent Marker", lang: "latin" },
    { name: "Carter One", lang: "latin" },
    { name: "Bangers", lang: "latin" },
    { name: "Boogaloo", lang: "latin" },
    { name: "Racing Sans One", lang: "latin" },
    { name: "Faster One", lang: "latin" },
    { name: "Special Elite", lang: "latin" },

    // Geometric / Techy
    { name: "Unica One", lang: "latin" },
    { name: "Graduate", lang: "latin" },
    { name: "Oxanium", lang: "latin" },
    { name: "Rajdhani", lang: "latin" },
    { name: "Chakra Petch", lang: "latin" },
    { name: "Michroma", lang: "latin" },
    { name: "Quantico", lang: "latin" },
    { name: "Wallpoet", lang: "latin" },
    { name: "Share Tech Mono", lang: "latin" },
    { name: "Space Mono", lang: "latin" },
    { name: "VT323", lang: "latin" },
    { name: "Silkscreen", lang: "latin" },
    { name: "Major Mono Display", lang: "latin" },

    // Mono / Code
    { name: "JetBrains Mono", lang: "latin" },
    { name: "Roboto Mono", lang: "latin" },
    { name: "Fira Mono", lang: "latin" },
    { name: "IBM Plex Mono", lang: "latin" },
    { name: "Inconsolata", lang: "latin" },
    { name: "Source Code Pro", lang: "latin" },
    { name: "Ubuntu Mono", lang: "latin" },
    { name: "Anonymous Pro", lang: "latin" },

    // Serif
    { name: "Abril Fatface", lang: "latin" },
    { name: "Cinzel", lang: "latin" },
    { name: "Cormorant Garamond", lang: "latin" },
    { name: "Playfair Display", lang: "latin" },
    { name: "Merriweather", lang: "latin" },
    { name: "Lora", lang: "latin" },
    { name: "PT Serif", lang: "latin" },
    { name: "Zilla Slab", lang: "latin" },

    // General / Universal
    { name: "Roboto", lang: "latin" },
    { name: "Open Sans", lang: "latin" },
    { name: "Lato", lang: "latin" },
    { name: "Noto Sans", lang: "latin" },
    { name: "Josefin Sans", lang: "latin" },
    { name: "Titillium Web", lang: "latin" },
    { name: "Varela Round", lang: "latin" },
    { name: "Quicksand", lang: "latin" },
    { name: "Syne", lang: "latin" },
    { name: "Comfortaa", lang: "latin" },
    { name: "Bungee Shade", lang: "latin" },
    { name: "Bungee Inline", lang: "latin" },
    { name: "Creepster", lang: "latin" },
    { name: "Fascinate Inline", lang: "latin" },
    { name: "Shadows Into Light", lang: "latin" },
    { name: "Amatic SC", lang: "latin" },
    { name: "Caveat", lang: "latin" },

    // ══════════════════════════════════════
    //  KOREAN (한국어)
    // ══════════════════════════════════════
    { name: "Noto Sans KR", lang: "korean" },
    { name: "Noto Serif KR", lang: "korean" },
    { name: "Nanum Gothic", lang: "korean" },
    { name: "Nanum Myeongjo", lang: "korean" },
    { name: "Nanum Square", lang: "korean" },
    { name: "Black Han Sans", lang: "korean" },
    { name: "Do Hyeon", lang: "korean" },
    { name: "Gowun Dodum", lang: "korean" },
    { name: "Gowun Batang", lang: "korean" },
    { name: "Jua", lang: "korean" },
    { name: "Gugi", lang: "korean" },
    { name: "Sunflower", lang: "korean" },
    { name: "Dokdo", lang: "korean" },
    { name: "East Sea Dokdo", lang: "korean" },
    { name: "Hi Melody", lang: "korean" },
    { name: "Gaegu", lang: "korean" },
    { name: "Gamja Flower", lang: "korean" },
    { name: "Gothic A1", lang: "korean" },
    { name: "IBM Plex Sans KR", lang: "korean" },

    // ══════════════════════════════════════
    //  JAPANESE (日本語)
    // ══════════════════════════════════════
    { name: "Noto Sans JP", lang: "japanese" },
    { name: "Noto Serif JP", lang: "japanese" },
    { name: "Zen Kaku Gothic New", lang: "japanese" },
    { name: "Zen Maru Gothic", lang: "japanese" },
    { name: "Zen Old Mincho", lang: "japanese" },
    { name: "Shippori Mincho", lang: "japanese" },
    { name: "Kosugi", lang: "japanese" },
    { name: "Kosugi Maru", lang: "japanese" },
    { name: "M PLUS 1p", lang: "japanese" },
    { name: "M PLUS Rounded 1c", lang: "japanese" },
    { name: "Sawarabi Gothic", lang: "japanese" },
    { name: "Sawarabi Mincho", lang: "japanese" },
    { name: "Zen Antique", lang: "japanese" },

    // ══════════════════════════════════════
    //  CHINESE (中文)
    // ══════════════════════════════════════
    { name: "Noto Sans SC", lang: "chinese" },
    { name: "Noto Serif SC", lang: "chinese" },
    { name: "Noto Sans TC", lang: "chinese" },
    { name: "Noto Serif TC", lang: "chinese" },
    { name: "ZCOOL XiaoWei", lang: "chinese" },
    { name: "ZCOOL QingKe HuangYou", lang: "chinese" },
    { name: "Ma Shan Zheng", lang: "chinese" },
    { name: "Long Cang", lang: "chinese" },
    { name: "Liu Jian Mao Cao", lang: "chinese" },
    { name: "Zhi Mang Xing", lang: "chinese" },

    // ══════════════════════════════════════
    //  ARABIC (عربي)
    // ══════════════════════════════════════
    { name: "Cairo", lang: "arabic" },
    { name: "Amiri", lang: "arabic" },
    { name: "Tajawal", lang: "arabic" },
    { name: "Almarai", lang: "arabic" },
    { name: "El Messiri", lang: "arabic" },
    { name: "Lateef", lang: "arabic" },
    { name: "Reem Kufi", lang: "arabic" },
    { name: "Scheherazade New", lang: "arabic" },
    { name: "Aref Ruqaa", lang: "arabic" },
    { name: "Changa", lang: "arabic" },
    { name: "Harmattan", lang: "arabic" },

    // ══════════════════════════════════════
    //  HINDI / DEVANAGARI (हिन्दी)
    // ══════════════════════════════════════
    { name: "Noto Sans Devanagari", lang: "hindi" },
    { name: "Noto Serif Devanagari", lang: "hindi" },
    { name: "Hind", lang: "hindi" },
    { name: "Mukta", lang: "hindi" },
    { name: "Rajdhani", lang: "hindi" },
    { name: "Teko", lang: "hindi" },
    { name: "Laila", lang: "hindi" },
    { name: "Rozha One", lang: "hindi" },
    { name: "Baloo Bhai 2", lang: "hindi" },
    { name: "Khand", lang: "hindi" },
    { name: "Tiro Devanagari Hindi", lang: "hindi" },
    { name: "Yatra One", lang: "hindi" },

    // ══════════════════════════════════════
    //  CYRILLIC (Кирилица)
    // ══════════════════════════════════════
    { name: "PT Sans", lang: "cyrillic" },
    { name: "PT Serif", lang: "cyrillic" },
    { name: "Russo One", lang: "cyrillic" },
    { name: "Exo 2", lang: "cyrillic" },
    { name: "Rubik", lang: "cyrillic" },
    { name: "Ubuntu", lang: "cyrillic" },
    { name: "Jost", lang: "cyrillic" },
    { name: "Philosopher", lang: "cyrillic" },
    { name: "Neucha", lang: "cyrillic" },
    { name: "Marmelad", lang: "cyrillic" },
    { name: "Ruslan Display", lang: "cyrillic" },
    { name: "Kelly Slab", lang: "cyrillic" },
    { name: "Yeseva One", lang: "cyrillic" }
];

// Get fonts filtered by language
export function getFontsByLang(lang) {
    if (lang === 'all') return FONT_DATABASE;
    return FONT_DATABASE.filter(f => f.lang === lang);
}

// Flat name list for backward compat (homepage gallery uses latin only)
export const FONT_LIBRARY = FONT_DATABASE.filter(f => f.lang === 'latin').map(f => f.name);

/**
 * Load a single Google Font dynamically.
 * Skips if already loaded to avoid duplicate requests.
 */
export function loadGoogleFont(fontName) {
    const encoded = fontName.replace(/\s+/g, '+');
    if (!document.querySelector(`link[href*="family=${encoded}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`;
        document.head.appendChild(link);
    }
}

/**
 * Batch load multiple fonts at once for dropdown previews.
 * Splits into chunks to avoid excessively long URLs.
 */
export function batchLoadFonts(fontNames) {
    const CHUNK_SIZE = 15;
    for (let i = 0; i < fontNames.length; i += CHUNK_SIZE) {
        const chunk = fontNames.slice(i, i + CHUNK_SIZE);
        const batchList = chunk.map(f => f.replace(/\s+/g, '+')).join('&family=');
        if (batchList.length > 0) {
            const encoded = `family=${batchList}`;
            if (!document.querySelector(`link[href*="${encoded}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${batchList}&display=swap`;
                document.head.appendChild(link);
            }
        }
    }
}
