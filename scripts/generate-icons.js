const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // White square inner
  const pad = size * 0.18;
  const inner = size - pad * 2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(pad, pad, inner, inner, size * 0.08);
  ctx.fill();

  // "DL" text
  ctx.fillStyle = '#111111';
  ctx.font = `bold ${size * 0.32}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DL', size / 2, size * 0.42);

  // "STUDIO" text
  ctx.font = `bold ${size * 0.12}px Arial`;
  ctx.fillText('STUDIO', size / 2, size * 0.68);

  return canvas.toBuffer('image/png');
}

const publicDir = path.join(__dirname, '../public');

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), generateIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), generateIcon(512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generateIcon(180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generateIcon(32));

console.log('Icons generated!');
