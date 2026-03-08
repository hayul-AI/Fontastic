/**
 * Fontastic - Texture Database
 */

export const TEXTURES = [
    { id: 'none', name: 'None', url: null },
    { id: 'gold', name: 'Gold', url: '/textures/gold.jpg' },
    { id: 'metal', name: 'Metal', url: '/textures/metal.jpg' },
    { id: 'marble', name: 'Marble', url: '/textures/marble.jpg' },
    { id: 'stone', name: 'Stone', url: '/textures/stone.jpg' },
    { id: 'carbon', name: 'Carbon', url: '/textures/carbon.jpg' },
    { id: 'fire', name: 'Fire', url: '/textures/fire.jpg' },
    { id: 'ice', name: 'Ice', url: '/textures/ice.jpg' },
    { id: 'galaxy', name: 'Galaxy', url: '/textures/galaxy.jpg' },
    { id: 'retro-grid', name: 'Retro Grid', url: '/textures/retro-grid.jpg' }
];

// Texture Loader Helper
export async function loadTexture(url) {
    if (!url) return null;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });
}