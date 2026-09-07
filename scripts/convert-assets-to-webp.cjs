/**
 * One-time/reusable asset pipeline step (see Guide.md §12 "OPTIMIZE").
 * Converts every PNG/JPEG under public/assets to WebP in place, then
 * removes the original raster file. SVGs are left untouched.
 *
 * Usage: node scripts/convert-assets-to-webp.cjs
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(__dirname, "..", "public", "assets");
const RASTER_EXT = new Set([".png", ".jpg", ".jpeg"]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (RASTER_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

async function main() {
  const files = walk(ASSETS_DIR);
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const file of files) {
    const before = fs.statSync(file).size;
    const outFile = file.replace(/\.(png|jpe?g)$/i, ".webp");

    await sharp(file).webp({ quality: 82, effort: 6 }).toFile(outFile);

    const after = fs.statSync(outFile).size;
    beforeTotal += before;
    afterTotal += after;

    fs.unlinkSync(file);

    console.log(
      `${path.relative(ASSETS_DIR, file)} -> ${path.basename(outFile)} ` +
        `(${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB)`
    );
  }

  console.log(
    `\nTotal: ${(beforeTotal / 1024 / 1024).toFixed(2)}MB -> ${(afterTotal / 1024 / 1024).toFixed(2)}MB`
  );
}

main();
