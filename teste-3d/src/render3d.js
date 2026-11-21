// Render a three.js page frame-by-frame in headless Chromium and pipe to ffmpeg
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const [page_, dur, out, stillsArg] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[err]', e.message));
  await page.goto('file://' + path.resolve(page_));
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const FPS = 30;
  if (stillsArg) {
    const fs = require('fs');
    for (const t of stillsArg.split(',').map(Number)) { const d = await page.evaluate((t) => window.renderFrame(t), t); fs.writeFileSync(`${out}_${t.toFixed(2)}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
  } else {
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(+dur * FPS); const t0 = Date.now();
    for (let f = 0; f < N; f++) { const d = await page.evaluate((t) => window.renderFrame(t), f / FPS); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 30 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
