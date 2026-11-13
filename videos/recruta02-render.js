const { chromium } = require('playwright');
const fs = require('fs');
const [mode] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 576, height: 1024 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/recruta02-animacao.html');
  const times = mode === 'test' ? [0.6, 2.2, 5.2, 5.95, 7.8, 9.2, 10.3, 11.2, 13.1, 14.8] : null;
  const FPS = 24, DUR = 15.2;
  const list = times || Array.from({ length: Math.round(DUR * FPS) }, (_, i) => i / FPS);
  fs.mkdirSync(mode === 'test' ? 'test' : 'frames', { recursive: true });
  for (let i = 0; i < list.length; i++) {
    const d = await p.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/png'); }, list[i]);
    fs.writeFileSync(`${mode === 'test' ? 'test' : 'frames'}/f${String(i).padStart(4, '0')}.png`, Buffer.from(d.split(',')[1], 'base64'));
  }
  console.log('frames', list.length, 'errors', errs);
  await b.close();
})();
