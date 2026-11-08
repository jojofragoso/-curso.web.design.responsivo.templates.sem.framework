// node render.mjs stills <dir> t1,t2,...  |  node render.mjs sfx <out.json>  |  node render.mjs video <out.mp4> <fps> <frameStart> <frameEnd>
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [mode, out, a3, a4, a5] = process.argv.slice(2);
const URL = process.env.URL || 'http://127.0.0.1:8767/index.html?render';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGEERR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
await page.goto(URL);
await page.waitForFunction(() => window.READY === true, null, { timeout: 300000 });
if (mode === 'sfx') {
  fs.writeFileSync(out, JSON.stringify(await page.evaluate(() => ({ sfx: window.SFX, duration: window.DURATION })), null, 1));
} else if (mode === 'stills') {
  fs.mkdirSync(out, { recursive: true });
  for (const t of a3.split(',').map(Number)) { await page.evaluate(t => window.renderAt(t), t); await page.screenshot({ path: `${out}/t${t.toFixed(1).padStart(6, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
} else {
  const fps = Number(a3 || 30); const dur = await page.evaluate(() => window.DURATION);
  const f0 = Number(a4 || 0), f1 = Math.min(Number(a5 || 1e9), Math.round(dur * fps));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const T = Date.now();
  for (let i = f0; i < f1; i++) {
    await page.evaluate(t => window.renderAt(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - f0) % 300 === 0) console.log(`${out}: ${i - f0}/${f1 - f0} ${((Date.now() - T) / 1000) | 0}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
