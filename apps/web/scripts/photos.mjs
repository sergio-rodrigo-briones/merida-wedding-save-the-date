// Prepares the photos for the web: every photo becomes AVIF and WebP at a few widths,
// with all metadata stripped (EXIF, including any GPS location the camera saved).
//
//   node scripts/photos.mjs real   private/photos/originals/*.jpg  → private/photos/web/  (git-ignored)
//   node scripts/photos.mjs demo   generated placeholders          → public/photos/       (committed)
//
// Output names: <name>-<width>.<avif|webp>. The app builds srcset from the same widths
// (see PHOTO_WIDTHS in src/content/photos.ts); keep both lists in sync.
import { mkdir, readdir, rm } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const WIDTHS = [480, 800, 1200];
const app = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

/** Writes every width and format of one image; sharp drops metadata unless asked to keep it. */
async function export_(input, name, outDir) {
  const source = sharp(input).rotate(); // apply the EXIF orientation before it is dropped
  const { width, height } = await source.clone().metadata();
  const portrait = (height ?? 0) > (width ?? 0);
  for (const w of WIDTHS) {
    const resized = source.clone().resize({ width: w, withoutEnlargement: true });
    await resized
      .clone()
      .avif({ quality: 50, effort: 6 })
      .toFile(join(outDir, `${name}-${w}.avif`));
    await resized
      .clone()
      .webp({ quality: 74 })
      .toFile(join(outDir, `${name}-${w}.webp`));
  }
  const oriented = portrait ? 'portrait' : 'landscape';
  console.log(`${name}: ${width}×${height} (${oriented})`);
}

async function real() {
  const inDir = join(app, 'private/photos/originals');
  const outDir = join(app, 'private/photos/web');
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(inDir)).filter((f) => /\.(jpe?g|png|tiff?|heic)$/i.test(f)).sort();
  if (files.length === 0) throw new Error(`No photos in ${inDir}`);
  for (const file of files) await export_(join(inDir, file), basename(file, extname(file)), outDir);
}

/**
 * Placeholder "photos" for the public demo: a pastel wall with a cross-stitch flower and
 * a label. Generated, so the repo holds no real people and no third-party licences.
 */
async function demo() {
  const outDir = join(app, 'public/photos');
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const walls = ['#f7d5da', '#cde9e7', '#f6e7a8', '#d4ebdd', '#f4efe3'];
  const threads = ['#e07a9b', '#4fa9a6', '#ee9473', '#6faf84', '#e9be4f'];
  for (let i = 0; i < walls.length; i++) {
    const landscape = i === walls.length - 1;
    const [w, h] = landscape ? [1800, 1200] : [1200, 1800];
    await export_(
      Buffer.from(placeholderSvg(w, h, walls[i], threads[i], i + 1)),
      `demo-0${i + 1}`,
      outDir,
    );
  }
}

function placeholderSvg(w, h, wall, thread, n) {
  const cell = 34;
  const flower = ['..XXX..', '.XXXXX.', 'XXX.XXX', 'XX.O.XX', 'XXX.XXX', '.XXXXX.', '..XXX..'];
  const x0 = w / 2 - (7 * cell) / 2;
  const y0 = h / 2 - (7 * cell) / 2 - cell * 2;
  const stitches = flower.flatMap((row, r) =>
    [...row].flatMap((c, col) => {
      if (c === '.') return [];
      const x = x0 + col * cell + 6,
        y = y0 + r * cell + 6,
        s = cell - 12;
      const color = c === 'O' ? '#e9be4f' : thread;
      return [
        `<path d="M${x} ${y + s}L${x + s} ${y}M${x} ${y}L${x + s} ${y + s}" stroke="${color}" stroke-width="9" stroke-linecap="round"/>`,
      ];
    }),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${wall}"/>
  <g opacity=".9">${stitches.join('')}</g>
  <text x="${w / 2}" y="${y0 + 7 * cell + 120}" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#263a2e">Foto de ejemplo ${n}</text>
  <text x="${w / 2}" y="${y0 + 7 * cell + 190}" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" letter-spacing="6" fill="#4b5f52">SAMPLE PHOTO</text>
</svg>`;
}

const mode = process.argv[2];
if (mode === 'real') await real();
else if (mode === 'demo') await demo();
else throw new Error('Usage: node scripts/photos.mjs <real|demo>');
