// Render a three.js page frame-by-frame in headless Chromium and pipe to ffmpeg
// usage: node render3d.js page.html <wordsJson|-> <out> --stills=t1,t2 | --frames=a:b
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'); const fs = require('fs');
(async () => {
  const [page_, wordsF, out, mode] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('[err]', e.message)); page.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text()); });
  await page.goto('file://' + path.resolve(page_));
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  if (wordsF && wordsF !== '-') await page.evaluate((w) => window.setWords && window.setWords(w), JSON.parse(fs.readFileSync(wordsF, 'utf8')));
  const FPS = 30;
  if (mode.startsWith('--stills=')) {
    for (const t of mode.slice(9).split(',').map(Number)) { const d = await page.evaluate((t) => window.renderFrame(t), t); fs.writeFileSync(`${out}_${t.toFixed(2).padStart(6, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
  } else {
    const [a, b] = mode.slice(9).split(':').map(Number);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = a; f < b; f++) { const d = await page.evaluate((t) => window.renderFrame(t), f / FPS); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if ((f - a) % 150 === 0) console.log(path.basename(out), 'frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
