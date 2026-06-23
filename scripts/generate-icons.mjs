import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const svg = readFileSync(path.join(publicDir, 'icon.svg'));

async function main() {
  await sharp(svg).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512.png'));
  await sharp(svg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated pwa-192.png, pwa-512.png, apple-touch-icon.png');
}

main();
