'use strict';
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const tpl = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');

const engine = fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');
const appParts = ['core.js', 'sched.js', 'pv.js', 'bitmap.js', 'review.js', 'main.js']
  .map(f => fs.readFileSync(path.join(dir, f), 'utf8'));

const app = appParts.join('\n;\n');

const out = tpl
  .replace('/*__ENGINE__*/', () => engine)
  .replace('/*__APP__*/', () => app);

const target = path.join(dir, 'os-visual.html');
fs.writeFileSync(target, out, 'utf8');

const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
console.log('已生成 ' + target + '（' + kb + ' KB）');
