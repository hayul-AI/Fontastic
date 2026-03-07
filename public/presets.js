export const PRESETS = {
  '/': {
    title: 'Fontastic – Free Font Generator & Text Effects Creator',
    description: 'Create stunning 3D, neon, logo and social media text styles instantly. Download high-quality PNG or JPG text images.',
    h1: 'Free Online Font Generator',
    content: 'Transform plain text into eye-catching graphics with Fontastic. Our easy-to-use tool lets you create professional logos, social media banners, and YouTube thumbnails in seconds without any software.',
    config: { text: 'Fontastic', effect: 'default', fontFamily: 'Inter', fontSize: 100, textColor: '#ffffff', accentColor: '#7c5cff', texture: 'none', bgType: 'transparent' },
    examples: []
  },
  '/neon-text-generator': {
    title: 'Free Neon Text Generator & Font Maker',
    description: 'Create glowing neon sign text effects online. Perfect for cyberpunk or retro aesthetics. Free to download.',
    h1: 'Neon Text Generator',
    content: 'Make your text glow with our realistic neon text generator. Choose vibrant colors and high-contrast backgrounds to create the perfect cyberpunk or late-night vibe for your graphics.',
    config: { text: 'NEON', effect: 'neon', fontFamily: 'Monoton', fontSize: 120, textColor: '#ffffff', accentColor: '#ff00ff', bgColor: '#000000', bgType: 'solid', texture: 'none' },
    examples: [{src: 'examples/neon-example.jpg', alt: 'Neon glowing text effect example design'}]
  },
  '/3d-text-generator': {
    title: 'Free 3D Text Generator & Font Maker',
    description: 'Easily generate high-resolution 3D text effects with extruded depth and shadows. No software needed.',
    h1: '3D Text Generator',
    content: 'Our 3D engine creates bold, extruded text perfect for gaming logos, thumbnails, and impactful headlines. Customize the depth colors and lighting easily.',
    config: { text: '3D MAX', effect: '3d', fontFamily: 'Bungee', fontSize: 130, textColor: '#ffcc00', accentColor: '#cc5500', texture: 'none', bgType: 'transparent' },
    examples: [{src: 'examples/3d-example.jpg', alt: 'High quality 3D extruded text effect example'}]
  },
  '/metal-text-generator': {
    title: 'Chrome & Metal Text Generator',
    description: 'Create sleek metallic and chrome text effects instantly. High-resolution export for professional logos.',
    h1: 'Metal Text Generator',
    content: 'Give your words a heavy, industrial feel with realistic metallic textures, chrome reflections, and deep bevel embossing.',
    config: { text: 'HEAVY METAL', effect: 'emboss', texture: 'metal', fontFamily: 'Inter', fontSize: 100, textColor: '#e0e0e0', accentColor: '#333333', bgType: 'transparent' },
    examples: [{src: 'examples/metal-example.jpg', alt: 'Chrome metallic industrial text effect example'}]
  },
  '/gold-text-generator': {
    title: 'Gold Text Generator - Shiny Metallic Effects',
    description: 'Create luxurious gold and metallic text effects. High-res download for VIP and premium brand logos.',
    h1: 'Gold Text Generator',
    content: 'Apply a realistic, shining gold texture to any font for a premium, luxurious look suitable for high-end branding.',
    config: { text: 'PREMIUM', effect: 'emboss', texture: 'gold', fontFamily: 'Inter', fontSize: 100, textColor: '#ffd700', accentColor: '#886600', bgType: 'transparent' },
    examples: [{src: 'examples/gold-example.jpg', alt: 'Shiny premium gold metal text effect example'}]
  },
  '/cyberpunk-text-generator': {
    title: 'Cyberpunk Text Generator & Font Maker',
    description: 'Create futuristic cyberpunk text designs with glowing edges, neon colors and high-tech fonts.',
    h1: 'Cyberpunk Text Generator',
    content: 'Step into the future with high-tech, glowing text effects inspired by cyberpunk culture and futuristic user interfaces.',
    config: { text: 'CYBERPUNK', effect: 'cyberpunk', fontFamily: 'Bungee', fontSize: 100, textColor: '#fcee0a', accentColor: '#00ffff', bgColor: '#0f0f12', bgType: 'solid', texture: 'none' },
    examples: [{src: 'examples/cyberpunk-example.jpg', alt: 'Futuristic cyberpunk glowing neon text example'}]
  },
  '/glitch-text-generator': {
    title: 'Glitch Text Generator - Cyberpunk RGB Split',
    description: 'Generate distorted glitch text effects with RGB split and static lines for modern edgy designs.',
    h1: 'Glitch Text Generator',
    content: 'Create a dystopian, hacker-style aesthetic with our RGB color-split glitch text maker, perfect for streams and music covers.',
    config: { text: 'GLITCHED', effect: 'glitch', fontFamily: 'Inter', fontSize: 120, textColor: '#ffffff', accentColor: '#00ffff', bgColor: '#111111', bgType: 'solid', texture: 'none' },
    examples: [{src: 'examples/glitch-example.jpg', alt: 'RGB split glitch distortion text effect example'}]
  },
  '/fire-text-generator': {
    title: 'Fire Text Generator - Burning Flame Effects',
    description: 'Make your text burn with realistic fire and flame text effects. Download high-res PNG instantly.',
    h1: 'Fire Text Effect',
    content: 'Add burning flames to your typography using our dynamic fire texture generator with realistic shadow casting.',
    config: { text: 'BLAZE', effect: 'fire', texture: 'fire', fontFamily: 'Bebas Neue', fontSize: 160, textColor: '#ffaa00', accentColor: '#ff0000', bgType: 'transparent' },
    examples: [{src: 'examples/fire-example.jpg', alt: 'Burning fire flame text effect example'}]
  },
  '/graffiti-text-generator': {
    title: 'Graffiti Text Generator - Urban Street Fonts',
    description: 'Create custom graffiti text designs with street-style fonts and paint effects.',
    h1: 'Graffiti Text Generator',
    content: 'Generate urban-style graffiti art with customizable gradients, thick outlines, and rotated dynamic alignments.',
    config: { text: 'Urban Art', effect: 'graffiti', fontFamily: 'Pacifico', fontSize: 110, textColor: '#ff0055', accentColor: '#00ffff', bgType: 'transparent', texture: 'none' },
    examples: [{src: 'examples/graffiti-example.jpg', alt: 'Graffiti style street art text example'}]
  },
  '/retro-text-generator': {
    title: 'Retro 80s Text Generator - Synthwave Fonts',
    description: 'Generate vintage 80s synthwave and outrun text effects with chrome and neon aesthetics.',
    h1: 'Retro 80s Text Generator',
    content: 'Travel back in time with chrome gradients, neon grids, and vintage 80s styling typical of synthwave and outrun graphics.',
    config: { text: 'SYNTHWAVE', effect: 'retro', fontFamily: 'Pacifico', fontSize: 100, textColor: '#ffffff', accentColor: '#ff00ff', texture: 'none', bgType: 'transparent' },
    examples: [{src: 'examples/retro-example.jpg', alt: 'Retro 80s synthwave outrun text effect example'}]
  },
  '/pixel-text-generator': {
    title: 'Pixel Text Generator - 8-Bit Retro Game Fonts',
    description: 'Generate 8-bit and 16-bit pixel text for retro gaming projects and indie devs.',
    h1: '8-Bit Pixel Text Generator',
    content: 'Create authentic retro gaming text with our pixel-perfect font generator, complete with blocky outlines and flat colors.',
    config: { text: 'LEVEL UP', effect: 'outline', fontFamily: 'Press Start 2P', fontSize: 60, textColor: '#ffffff', accentColor: '#000000', strokeWidth: 8, bgType: 'transparent', texture: 'none' },
    examples: [{src: 'examples/pixel-example.jpg', alt: '8-bit pixel retro game text example'}]
  },
  '/gaming-font-generator': {
    title: 'Gaming Font Generator for Esports & Twitch',
    description: 'Create aggressive, sharp gaming text logos for your clan, esports team, or Twitch stream.',
    h1: 'Gaming Font Generator',
    content: 'Level up your branding with aggressive typography and 3D effects designed specifically for gamers and streamers.',
    config: { text: 'ESPORTS', effect: '3d', fontFamily: 'Bebas Neue', fontSize: 140, textColor: '#00ffcc', accentColor: '#0044aa', bgType: 'transparent', texture: 'none' },
    examples: [{src: 'examples/gaming-example.jpg', alt: 'Esports gaming logo text effect example'}]
  },
  '/youtube-thumbnail-font': {
    title: 'YouTube Thumbnail Font Generator',
    description: 'Create high-contrast, readable text for YouTube thumbnails to boost your CTR.',
    h1: 'YouTube Thumbnail Text Maker',
    content: 'Design click-worthy thumbnail text with heavy strokes, sharp fonts, and high contrast to maximize your video visibility.',
    config: { text: 'SHOCKING!', effect: 'outline', fontFamily: 'Bungee', fontSize: 110, textColor: '#ffffff', accentColor: '#ff0000', strokeWidth: 15, bgType: 'transparent', texture: 'none', textCurve: -5 },
    examples: [{src: 'examples/youtube-example.jpg', alt: 'High contrast YouTube thumbnail text example'}]
  },
  '/logo-text-generator': {
    title: 'Free Text Logo Maker & Generator',
    description: 'Create professional text-based logos for your brand or startup instantly.',
    h1: 'Text Logo Generator',
    content: 'Build a beautiful, scalable text logo with fine-tuned kerning and elegant typography settings.',
    config: { text: 'Startup Inc.', effect: 'default', fontFamily: 'Inter', fontSize: 100, letterSpacing: -2, textColor: '#ffffff', bgType: 'transparent', texture: 'none' },
    examples: [{src: 'examples/logo-example.jpg', alt: 'Minimalist modern text logo example'}]
  }
};