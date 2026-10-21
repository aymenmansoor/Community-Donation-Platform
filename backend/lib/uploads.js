const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'));
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 6, fieldSize: 4096, parts: 8 } });
async function saveImage(file) {
  if (!file) return null;
  // Decode and re-encode, stripping metadata and rejecting malformed/polyglot payloads.
  const image = sharp(file.buffer, { limitInputPixels: 25000000, failOn: 'warning', animated: false });
  try {
    const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) > 1) throw new Error('Unsupported image');
    const output = await image.rotate().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const name = `${crypto.randomUUID()}.webp`;
    await fs.promises.writeFile(path.join(uploadDir, name), output, { flag: 'wx' });
    return name;
  } catch (error) {
    if (error.code && ['ENOSPC', 'EACCES'].includes(error.code)) throw error;
    const invalid = new Error('Invalid image'); invalid.status = 400; throw invalid;
  }
}
async function removeImage(name) {
  if (name && path.basename(name) === name) await fs.promises.unlink(path.join(uploadDir, name)).catch(() => {});
}
module.exports = { upload, uploadDir, saveImage, removeImage };
