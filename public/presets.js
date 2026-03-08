/**
 * Fontastic - Style Presets
 */

export const PRESETS = {
  'default': {
    name: 'Default',
    font: 'Inter',
    color: '#7c5cff',
    fontSize: 100,
    letterSpacing: 0,
    outlineWidth: 0,
    outlineColor: '#000000',
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffsetX: 0,
    shadowOffsetY: 5,
    gradient: false,
    effect: 'none'
  },
  'neon-glow': {
    name: 'Neon Glow',
    font: 'Orbitron',
    color: '#ff00ff',
    shadowBlur: 30,
    shadowColor: '#ff00ff',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    outlineWidth: 2,
    outlineColor: '#ffffff'
  },
  '3d-extrude': {
    name: '3D Extrude',
    font: 'Anton',
    color: '#ffffff',
    effect: '3d',
    shadowBlur: 0,
    shadowColor: '#333333',
    shadowOffsetX: 10,
    shadowOffsetY: 10
  },
  'graffiti-spray': {
    name: 'Graffiti Spray',
    font: 'Bangers',
    color: '#fbff00',
    outlineWidth: 5,
    outlineColor: '#000000',
    shadowBlur: 20,
    shadowColor: '#000000',
    shadowOffsetX: 5,
    shadowOffsetY: 5
  },
  'cyberpunk-glow': {
    name: 'Cyberpunk Glow',
    font: 'Russo One',
    color: '#00f2ff',
    shadowBlur: 25,
    shadowColor: '#00f2ff',
    outlineWidth: 1,
    outlineColor: '#ffffff'
  },
  'retro-80s': {
    name: 'Retro 80s',
    font: 'Monoton',
    color: '#ff2d95',
    gradient: {
      colors: ['#ff2d95', '#00f2ff']
    }
  },
  'gold-shine': {
    name: 'Gold Shine',
    font: 'Playfair Display',
    color: '#ffd700',
    texture: 'gold'
  }
};

export const ROUTES = {
  '/fonts/': 'font',
  '/3d-text-generator': '3d-extrude',
  '/neon-text-generator': 'neon-glow',
  '/graffiti-text-generator': 'graffiti-spray',
  '/cyberpunk-text-generator': 'cyberpunk-glow',
  '/gold-text-generator': 'gold-shine',
  '/retro-text-generator': 'retro-80s'
};