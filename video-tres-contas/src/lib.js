// Helpers + flat illustration primitives
const { GlobalFonts, createCanvas, Path2D } = require('@napi-rs/canvas');
const path = require('path');
const FD = path.join(__dirname, 'node_modules/@fontsource/poppins/files/');
for (const w of [400, 600, 700, 800, 900]) GlobalFonts.registerFromPath(FD + `poppins-latin-${w}-normal.woff2`, 'Poppins');

const W = 1080, H = 1920;
const C = {
  paper: '#F3E6C8', paper2: '#E8D3A8', tan: '#D9B98A', tan2: '#C49A62',
  brown: '#7A4E2D', dbrown: '#3E2A1E', ink: '#2A1A10',
  green: '#3E8B4F', dgreen: '#2C6639', lgreen: '#7DB46C',
  gold: '#F2C14E', dgold: '#C9922B', lgold: '#FBE39A',
  red: '#C0392B', dred: '#8E2A20', blue: '#2F5D8A', lblue: '#7FB3D5', sky: '#BFDCE8',
  grey: '#8E8A84', lgrey: '#C9C4BB', dgrey: '#5B5752', skin: '#E9B98F', skin2: '#C98F67', white: '#FFFDF7',
  ocean: '#2E6E8E', ocean2: '#3F87A6', land: '#E3CFA3', land2: '#CDB27E', night: '#13202B',
};

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo = (t) => 1 - Math.pow(1 - t, 3);            // ease out cubic
const eio = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eback = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const eel = (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1;
const pop = (t, a, d = .35) => eback(prog(t, a, a + d));
// pseudo-random deterministic
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function shadow(ctx, blur = 30, oy = 14, a = .28) { ctx.shadowColor = `rgba(40,20,5,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy; ctx.shadowOffsetX = 0; }
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
function font(ctx, size, weight = 800) { ctx.font = `${weight} ${size}px Poppins`; }
function text(ctx, s, x, y, o = {}) {
  font(ctx, o.size || 60, o.weight || 800);
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  if (o.ls) ctx.letterSpacing = o.ls + 'px'; else ctx.letterSpacing = '0px';
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || C.ink; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y);
  ctx.letterSpacing = '0px';
}
function fitText(ctx, s, maxW, size, weight = 800) { font(ctx, size, weight); const w = ctx.measureText(s).width; return w > maxW ? size * maxW / w : size; }

// ---------- textures ----------
const grain = (() => {
  const c = createCanvas(540, 960), x = c.getContext('2d'); const img = x.createImageData(540, 960);
  for (let i = 0; i < img.data.length; i += 4) { const v = rnd(i * .37) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 14; }
  x.putImageData(img, 0, 0); return c;
})();
function paperBg(ctx, c1 = C.paper, c2 = C.paper2) {
  const g = ctx.createRadialGradient(W / 2, H * .42, 100, W / 2, H / 2, H * .75);
  g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
}
function finish(ctx) { // grain + vignette, in screen space
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(grain, 0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .78);
  g.addColorStop(0, 'rgba(30,15,5,0)'); g.addColorStop(1, 'rgba(30,15,5,.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function rays(ctx, x, y, r, n, rot, col, a = .25) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a; ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { const a0 = i * 2 * Math.PI / n; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a0 + Math.PI / n); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

// ---------- objects ----------
// coin. o: {label, sub, gray, crack(0..1), color}
function coin(ctx, x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  const sx = o.flip == null ? 1 : o.flip; ctx.scale(sx, 1);
  const gold = o.gray ? ['#D8D3CB', '#9C968E', '#6E6963', '#B9B3AA'] : o.silver ? ['#F2F2EE', '#B9BBBE', '#7D8085', '#D9DADB'] : [C.lgold, C.gold, C.dgold, '#E9B44A'];
  shadow(ctx, r * .35, r * .14, .3);
  ctx.fillStyle = gold[2]; ctx.beginPath(); ctx.arc(0, r * .07, r, 0, 7); ctx.fill(); noShadow(ctx);
  const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, gold[0]); g.addColorStop(.55, gold[1]); g.addColorStop(1, gold[3]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = gold[2]; ctx.lineWidth = r * .06; ctx.beginPath(); ctx.arc(0, 0, r * .8, 0, 7); ctx.stroke();
  // dots ring
  ctx.fillStyle = gold[2]; for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .9, Math.sin(a) * r * .9, r * .022, 0, 7); ctx.fill(); }
  if (o.label) {
    const s = fitText(ctx, o.label, r * 1.3, r * (o.sub ? .62 : .78), 900);
    text(ctx, o.label, 0, o.sub ? -r * .1 : r * .03, { size: s, weight: 900, color: gold[2] });
    if (o.sub) text(ctx, o.sub, 0, r * .42, { size: fitText(ctx, o.sub, r * 1.1, r * .2, 800), weight: 800, color: gold[2] });
  }
  if (o.cross) { ctx.strokeStyle = gold[2]; ctx.lineWidth = r * .12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -r * .5); ctx.lineTo(0, r * .5); ctx.moveTo(-r * .5, 0); ctx.lineTo(r * .5, 0); ctx.stroke(); }
  // shine
  ctx.globalAlpha *= .35; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .45, r * .32, r * .12, -.7, 0, 7); ctx.fill(); ctx.globalAlpha /= .35;
  if (o.crack) crackLines(ctx, r, o.crack, o.seed || 1);
  ctx.restore();
}
function crackLines(ctx, r, p, seed) {
  ctx.save(); ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = r * .045; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    let a = seed + k * 1.7, x = 0, y = 0; ctx.beginPath(); ctx.moveTo(0, 0);
    const steps = 6; const lim = Math.floor(steps * p);
    for (let i = 0; i < lim; i++) { a += (rnd(seed * 9 + k * 13 + i) - .5) * 1.2; x += Math.cos(a) * r * .17; y += Math.sin(a) * r * .17; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}
// banknote o: {color, label, year, gray, val}
function note(ctx, x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  const col = o.gray ? '#A9A49C' : (o.color || C.green);
  shadow(ctx, 24, 10, .28); ctx.fillStyle = col; rr(ctx, -w / 2, -h / 2, w, h, h * .08); ctx.fill(); noShadow(ctx);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = h * .03; rr(ctx, -w / 2 + h * .07, -h / 2 + h * .07, w - h * .14, h - h * .14, h * .05); ctx.stroke();
  // portrait medallion
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(w * .2, 0, h * .3, h * .34, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(w * .2, -h * .08, h * .11, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * .2, h * .2, h * .2, h * .13, 0, Math.PI, 0); ctx.fill();
  if (o.val) text(ctx, o.val, -w / 2 + h * .2, -h / 2 + h * .25, { size: h * .2, weight: 900, color: 'rgba(255,255,255,.95)', align: 'left' });
  if (o.label) { const s = fitText(ctx, o.label, w * .55, h * .17, 900); text(ctx, o.label, -w * .2, h * .12, { size: s, weight: 900, color: '#fff' }); }
  if (o.year) text(ctx, o.year, -w * .2, h * .32, { size: h * .11, weight: 700, color: 'rgba(255,255,255,.85)' });
  if (o.x) { // red cross
    ctx.strokeStyle = C.red; ctx.lineWidth = h * .09; ctx.lineCap = 'round'; const p = o.x;
    ctx.beginPath(); ctx.moveTo(-w * .4, -h * .38); ctx.lineTo(lerp(-w * .4, w * .4, clamp(p * 2)), lerp(-h * .38, h * .38, clamp(p * 2))); ctx.stroke();
    if (p > .5) { ctx.beginPath(); ctx.moveTo(w * .4, -h * .38); ctx.lineTo(lerp(w * .4, -w * .4, clamp(p * 2 - 1)), lerp(-h * .38, h * .38, clamp(p * 2 - 1))); ctx.stroke(); }
  }
  ctx.restore();
}
// callout card like reference
function card(ctx, x, y, lines, o = {}) {
  const t = o.t == null ? 1 : o.t; if (t <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -.02); const s = eback(clamp(t)); ctx.scale(s, s); ctx.globalAlpha *= clamp(t * 3);
  const size = o.size || 64, pad = size * .45; let wmax = 0;
  lines.forEach((l, i) => { font(ctx, i ? (o.size2 || size * .45) : size, i ? 700 : 900); wmax = Math.max(wmax, ctx.measureText(l).width); });
  const lh = lines.map((l, i) => i ? (o.size2 || size * .45) * 1.5 : size * 1.18);
  const w = Math.max(wmax + pad * 2, o.minW || 0), h = lh.reduce((a, b) => a + b, 0) + pad * 1.2 + (lines.length > 1 ? 14 : 0);
  shadow(ctx, 30, 14, .3); ctx.fillStyle = o.bg || C.white; rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill(); noShadow(ctx);
  ctx.strokeStyle = o.border || 'rgba(122,78,45,.35)'; ctx.lineWidth = 4; rr(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 6); ctx.stroke();
  let yy = -h / 2 + pad * .6 + lh[0] / 2;
  lines.forEach((l, i) => {
    if (i === 1) { ctx.fillStyle = o.accent || C.red; ctx.fillRect(-wmax * .3, yy - lh[0] / 2 + 6, wmax * .6, 6); yy += 14; }
    text(ctx, l, 0, yy, { size: i ? (o.size2 || size * .45) : size, weight: i ? 700 : 900, color: i ? (o.col2 || C.brown) : (o.col || C.dbrown), ls: i ? 3 : 0 });
    yy += (lh[i] + (lh[i + 1] || 0)) / 2;
  });
  ctx.restore();
}
// stamp (rotated, red outline)
function stamp(ctx, x, y, s, t, o = {}) {
  if (t <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot == null ? -.15 : o.rot);
  const k = lerp(2.2, 1, eo(clamp(t * 2.5))); ctx.scale(k, k); ctx.globalAlpha *= clamp(t * 4);
  const col = o.color || C.red; const size = o.size || 80;
  font(ctx, size, 900); const w = ctx.measureText(s).width + size * .8, h = size * 1.4;
  ctx.strokeStyle = col; ctx.lineWidth = size * .09; rr(ctx, -w / 2, -h / 2, w, h, size * .15); ctx.stroke();
  text(ctx, s, 0, size * .05, { size, weight: 900, color: col });
  ctx.restore();
}
function calendar(ctx, x, y, s, top, big, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shadow(ctx, 30, 16, .3);
  ctx.fillStyle = C.white; rr(ctx, -160, -150, 320, 330, 26); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = o.color || C.red; rr(ctx, -160, -150, 320, 100, 26); ctx.fill(); ctx.fillRect(-160, -80, 320, 30);
  ctx.fillStyle = C.dbrown; for (const dx of [-90, 90]) { rr(ctx, dx - 10, -175, 20, 55, 10); ctx.fill(); }
  text(ctx, top, 0, -98, { size: 46, weight: 800, color: '#fff', ls: 4 });
  const fs = fitText(ctx, big, 270, 120, 900);
  text(ctx, big, 0, 62, { size: fs, weight: 900, color: C.dbrown });
  if (o.flip) { // page flipping down
    const p = o.flip; ctx.save(); ctx.translate(0, -50); ctx.scale(1, Math.cos(p * Math.PI / 2)); ctx.globalAlpha = 1 - p * .5;
    ctx.fillStyle = '#EFE6D5'; rr(ctx, -160, 0, 320, 230, 20); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
function person(ctx, x, y, s, o = {}) { // flat figure, feet at (x,y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  const ph = o.walk || 0, sw = Math.sin(ph) * .5;
  ctx.lineCap = 'round'; ctx.strokeStyle = o.pants || C.dbrown; ctx.lineWidth = 26;
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(Math.sin(sw) * 70, 0); ctx.moveTo(0, -150); ctx.lineTo(-Math.sin(sw) * 70, 0); ctx.stroke();
  ctx.fillStyle = o.shirt || C.blue; rr(ctx, -42, -290, 84, 160, 34); ctx.fill();
  ctx.strokeStyle = o.shirt || C.blue; ctx.lineWidth = 22;
  ctx.beginPath(); ctx.moveTo(0, -260); ctx.lineTo(o.armF ? 80 : -Math.sin(sw) * 60, o.armF ? -200 : -160); ctx.stroke();
  ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -330, 40, 0, 7); ctx.fill();
  ctx.fillStyle = o.hair || C.dbrown; ctx.beginPath(); ctx.arc(0, -340, 40, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(18, -330, 4.5, 0, 7); ctx.fill();
  ctx.restore();
}
function cart(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = C.dgrey; ctx.lineWidth = 9; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-120, -150); ctx.lineTo(-90, -40); ctx.lineTo(90, -40); ctx.lineTo(110, -130); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-120, -150); ctx.lineTo(-150, -170); ctx.stroke();
  ctx.fillStyle = C.red; rr(ctx, -80, -175, 60, 70, 8); ctx.fill(); ctx.fillStyle = C.gold; rr(ctx, -10, -160, 50, 55, 8); ctx.fill(); ctx.fillStyle = C.green; rr(ctx, 45, -150, 45, 45, 8); ctx.fill();
  ctx.fillStyle = C.ink; for (const dx of [-70, 70]) { ctx.beginPath(); ctx.arc(dx, -10, 14, 0, 7); ctx.fill(); }
  ctx.restore();
}
function tomb(ctx, x, y, s, label, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shadow(ctx, 20, 10, .3); ctx.fillStyle = o.color || '#9E978C';
  ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(-110, -200); ctx.arc(0, -200, 110, Math.PI, 0); ctx.lineTo(110, 0); ctx.closePath(); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(-110, -200); ctx.arc(0, -200, 110, Math.PI, Math.PI * 1.5); ctx.lineTo(-60, -280); ctx.lineTo(-60, 0); ctx.fill();
  text(ctx, 'RIP', 0, -235, { size: 50, weight: 900, color: 'rgba(40,30,20,.55)' });
  if (label) { const lines = label.split('\n'); lines.forEach((l, i) => text(ctx, l, 0, -160 + i * 38 - (lines.length - 1) * 19, { size: fitText(ctx, l, 190, 34, 800), weight: 800, color: 'rgba(40,30,20,.75)' })); }
  if (o.sub) text(ctx, o.sub, 0, -70, { size: 26, weight: 700, color: 'rgba(40,30,20,.6)' });
  ctx.fillStyle = C.dgreen; ctx.beginPath(); ctx.ellipse(0, 0, 150, 22, 0, 0, 7); ctx.fill();
  ctx.restore();
}
function balance(ctx, x, y, s, tilt, left, right) { // left/right callbacks draw at pan
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = C.dbrown; rr(ctx, -120, 300, 240, 40, 14); ctx.fill(); ctx.fillRect(-14, -140, 28, 450);
  ctx.save(); ctx.translate(0, -140); ctx.rotate(tilt);
  ctx.fillStyle = C.brown; rr(ctx, -330, -14, 660, 28, 14); ctx.fill();
  for (const [dx, cb] of [[-310, left], [310, right]]) {
    ctx.save(); ctx.translate(dx, 0); ctx.rotate(-tilt);
    ctx.strokeStyle = C.brown; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-120, 200); ctx.moveTo(0, 0); ctx.lineTo(120, 200); ctx.stroke();
    ctx.fillStyle = C.dgold; ctx.beginPath(); ctx.ellipse(0, 205, 150, 30, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(0, 200, 150, 22, 0, 0, 7); ctx.fill();
    ctx.translate(0, 195); cb && cb(ctx);
    ctx.restore();
  }
  ctx.restore(); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, -140, 26, 0, 7); ctx.fill();
  ctx.restore();
}
function dollar(ctx, x, y, w, rot = 0) { note(ctx, x, y, w, w * .45, { color: '#6E8F5E', val: 'US$ 1', label: 'DÓLAR', rot }); }

module.exports = { W, H, C, clamp, lerp, prog, eo, eio, eback, eel, pop, rnd, rr, shadow, noShadow, font, text, fitText, paperBg, finish, rays, coin, note, card, stamp, calendar, person, cart, tomb, balance, dollar, crackLines, createCanvas, Path2D };
