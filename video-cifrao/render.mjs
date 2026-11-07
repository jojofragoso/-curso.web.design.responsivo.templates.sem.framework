// Uso: node render.mjs stills <dir> [t1,t2,...]   |   node render.mjs video <saida.mp4> [fps]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'child_process';
import fs from 'fs';
const [mode, out, extra] = process.argv.slice(2);
const URL = process.env.URL || 'http://127.0.0.1:8765/index.html?render';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
page.on('pageerror', e => console.error('PAGEERR:', e.message));
await page.goto(URL);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
if (mode === 'stills') {
  fs.mkdirSync(out, { recursive: true });
  const ts = extra.split(',').map(Number);
  for (const t of ts) { await page.evaluate(t => window.renderAt(t), t); await page.screenshot({ path: `${out}/t${String(t).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
} else {
  const fps = Number(extra || 30); const dur = await page.evaluate(() => window.DURATION);
  const n = Math.round(dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.renderAt(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
