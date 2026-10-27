import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8');
const jsFiles = ['solver.js', 'core.js', 'm1.js', 'm2.js', 'm3.js', 'm4.js', 'm5.js', 'app.js'];
const js = jsFiles.map(f => {
  const code = fs.readFileSync(path.join(src, f), 'utf8');
  return `/* ===== ${f} ===== */\n${code}`;
}).join('\n\n');

const template = fs.readFileSync(path.join(src, 'template.html'), 'utf8');
const stamp = new Date().toISOString();
const html = template
  .replace('/*__CSS__*/', css)
  .replace('/*__JS__*/', js)
  .replace('<head>', `<head>\n<!-- built ${stamp} · 单文件自包含 · 无外部资源 -->`);

fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`built dist/index.html (${kb} KB) at ${stamp}`);
