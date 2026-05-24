const fs = require('fs');

// Generate a simple recognizable PNG using pure buffer math
// 192x192 purple icon with speech bubble
function createPNG(size) {
  const { createCanvas } = (() => { try { return require('canvas'); } catch(e) { return {}; } })();
  if (!createCanvas) return null;

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0f0c29');
  grad.addColorStop(1, '#302b63');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();

  // Speech bubble
  ctx.fillStyle = '#fda085';
  ctx.font = `bold ${size * 0.38}px "Segoe UI"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EN', size / 2, size * 0.58);

  return canvas.toBuffer('image/png');
}

// Try canvas-based PNG, fallback to simple generated PNG
try {
  const png192 = createPNG(192);
  const png512 = createPNG(512);
  if (png192) {
    fs.writeFileSync('public/icon-192.png', png192);
    fs.writeFileSync('public/icon-512.png', png512);
    console.log('PNG icons created with canvas');
    process.exit(0);
  }
} catch(e) { /* fallback */ }

// Fallback: create minimal valid 1x1 PNG, will be replaced by SVG in manifest
console.log('canvas not available, creating placeholder PNGs');
// Minimal valid 1x1 purple PNG (we'll use SVGs for actual display)
const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('public/icon-192.png', png1x1);
fs.writeFileSync('public/icon-512.png', png1x1);
console.log('Placeholder PNGs created');
