#!/usr/bin/env node
// Renderiza um projeto do motor 3D Palito para MP4 (sem áudio) ou quadros de teste.
// Uso:
//   node render.mjs <pasta-do-projeto> saida.mp4 [--de 0] [--ate 70] [--fps 24] [--escala 1]
//   node render.mjs <pasta-do-projeto> --quadros 1.5,10,20 [--saida pasta]
// A pasta do projeto precisa de um cenas.js que exporte CENAS, DURACAO e FPS.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const projeto = path.resolve(args[0]);
const saida = args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : null;
const quadros = opt('quadros');
const escala = +opt('escala', 1);

const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(RAIZ) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const porta = server.address().port;
const rel = path.relative(path.join(RAIZ, 'motor3d'), path.join(projeto, 'cenas.js')).split(path.sep).map(encodeURIComponent).join('/');
const W = Math.round(1080 * escala), H = Math.round(1920 * escala);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-gl=angle'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[pagina]', m.text()); });
page.on('pageerror', (e) => { console.error('[erro na pagina]', e.message); process.exit(1); });
await page.goto(`http://127.0.0.1:${porta}/motor3d/render.html?proj=${rel}&w=${W}&h=${H}&ss=${opt('ss', 1)}`);
await page.waitForFunction('window.pronto === true', null, { timeout: 120000 });
const DUR = await page.evaluate('window.DURACAO');
const FPS = +opt('fps', await page.evaluate('window.FPS'));

if (quadros) {
  const dir = path.resolve(opt('saida', path.join(projeto, 'quadros')));
  fs.mkdirSync(dir, { recursive: true });
  for (const t of quadros.split(',').map(Number)) {
    const url = await page.evaluate((t) => window.renderAt(t, 'image/png'), t);
    const f = path.join(dir, `q_${t.toFixed(2)}.png`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(f);
  }
} else {
  const de = +opt('de', 0), ate = Math.min(+opt('ate', DUR), DUR);
  const n = Math.round((ate - de) * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), saida], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const url = await page.evaluate((t) => window.renderAt(t), de + i / FPS);
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 48 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`quadro ${i}/${n}  (${(de + i / FPS).toFixed(1)}s)  ${(i / Math.max(el, 0.01)).toFixed(1)} q/s`);
    }
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('Pronto:', saida);
}
await browser.close();
server.close();
