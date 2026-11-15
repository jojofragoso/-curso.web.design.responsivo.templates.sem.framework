// "5 teorias da conspiração que eram verdade" — Nº3 vigilância em massa (Snowden / PRISM)
const L = require('./lib');
const { W, H, C, clamp, lerp, prog, eo, eio, eback, pop, rnd, rr, shadow, noShadow, text, fitText, paperBg, finish, rays, card, stamp, calendar, createCanvas } = L;
const { SK, bust, fig } = require('./chars');
const d3 = require('d3-geo'); const topo = require('topojson-client');
const fs = require('fs'); const { spawn } = require('child_process');
const world = require('world-atlas/countries-50m.json');
const countries = topo.feature(world, world.objects.countries).features;
const land = topo.feature(world, world.objects.land);

const blink = (t, seed = 0) => { const p = (t + seed * 1.37) % 3.3; return p < .14 ? Math.sin(p / .14 * Math.PI) : 0; };
const fill = (ctx, c) => { ctx.fillStyle = c; ctx.fillRect(-300, -300, W + 600, H + 600); };
const vgrad = (ctx, a, b) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); };
const RED = '#E0443A', CYAN = '#4FD1E8', NIGHT1 = '#0E1A26', NIGHT2 = '#1E3142';
function headline(ctx, l1, l2, t, o = {}) {
  if (t <= 0) return; const y = o.y || 330;
  ctx.save(); ctx.globalAlpha *= clamp(t * 4);
  for (const [s, yy, col, i] of [[l1, y, o.c1 || '#FFFFFF', 0], [l2, y + (o.gap || 125), o.c2 || C.gold, 1]]) {
    if (!s) continue; const k = eback(clamp(t * 1.6 - i * .3)); if (k <= 0) continue;
    const size = fitText(ctx, s, 960, i ? (o.size2 || o.size || 130) : (o.size || 130), 900);
    ctx.save(); ctx.translate(W / 2, yy); ctx.scale(k, k); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
    text(ctx, s, 0, 0, { size, weight: 900, color: col, stroke: 18, strokeColor: '#24150C' }); ctx.restore();
    ctx.save(); ctx.translate(W / 2, yy); ctx.scale(k, k); text(ctx, s, 0, 0, { size, weight: 900, color: col }); ctx.restore();
  }
  ctx.restore();
}
// ---------- props ----------
function eye(ctx, x, y, s, t, o = {}) { // giant surveillance eye
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const open = o.open == null ? 1 : o.open;
  ctx.save(); ctx.beginPath(); ctx.moveTo(-300, 0); ctx.quadraticCurveTo(0, -260 * open, 300, 0); ctx.quadraticCurveTo(0, 260 * open, -300, 0); ctx.closePath();
  ctx.shadowColor = o.glow || RED; ctx.shadowBlur = 60; ctx.fillStyle = '#F4EFE6'; ctx.fill(); ctx.clip(); noShadow(ctx);
  const lx = (o.look || 0) * 60, ly = (o.lookY || 0) * 30;
  ctx.fillStyle = o.iris || RED; ctx.beginPath(); ctx.arc(lx, ly, 120, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 6; for (let i = 0; i < 18; i++) { const a = i / 18 * 7; ctx.beginPath(); ctx.moveTo(lx + Math.cos(a) * 60, ly + Math.sin(a) * 60); ctx.lineTo(lx + Math.cos(a) * 115, ly + Math.sin(a) * 115); ctx.stroke(); }
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(lx, ly, 55 + Math.sin(t * 3) * 6, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx - 35, ly - 40, 20, 0, 7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-300, 0); ctx.quadraticCurveTo(0, -260 * open, 300, 0); ctx.stroke();
  ctx.restore();
}
function cctv(ctx, x, y, s, ang, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  ctx.fillStyle = '#5B6670'; ctx.fillRect(-10, -10, 20, 70); ctx.fillRect(-40, 50, 80, 16);
  ctx.rotate(ang); ctx.fillStyle = '#E9EDF0'; rr(ctx, -20, -45, 170, 70, 16); ctx.fill(); ctx.fillStyle = '#9AA6AF'; ctx.fillRect(-20, -45, 170, 16);
  ctx.fillStyle = '#1B232B'; ctx.beginPath(); ctx.arc(150, -10, 28, 0, 7); ctx.fill(); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(150, -10, 10, 0, 7); ctx.fill();
  if (o.led) { ctx.fillStyle = (Math.floor(o.t * 3) % 2) ? RED : '#550'; ctx.beginPath(); ctx.arc(20, -20, 7, 0, 7); ctx.fill(); }
  ctx.restore();
}
function skyline(ctx, base, col, seed, lit, t) {
  for (let i = 0; i < 12; i++) { const w = 90 + rnd(seed + i) * 80, h = 200 + rnd(seed + i * 3) * 520, x = -100 + i * 110 + rnd(i + seed) * 30;
    ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h);
    if (lit) for (let r = 0; r < h / 50 - 1; r++) for (let c = 0; c < w / 34 - 1; c++) { if (rnd(seed + i * 99 + r * 7 + c) > .55) { ctx.fillStyle = `rgba(255,214,120,${.5 + .3 * Math.sin(t + r + c)})`; ctx.fillRect(x + 14 + c * 30, base - h + 20 + r * 50, 14, 22); } } }
}
function doc(ctx, x, y, s, rot, label = 'ULTRA SECRETO') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); shadow(ctx, 14, 6, .3); ctx.fillStyle = '#F7F2E6'; ctx.fillRect(-80, -105, 160, 210); noShadow(ctx);
  ctx.fillStyle = 'rgba(42,26,16,.3)'; for (let i = 0; i < 6; i++) ctx.fillRect(-60, -60 + i * 22, 120 - (i % 3) * 25, 9);
  ctx.save(); ctx.rotate(-.2); ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.strokeRect(-70, -95, 140, 38); text(ctx, label, 0, -76, { size: fitText(ctx, label, 125, 22, 900), weight: 900, color: RED }); ctx.restore();
  ctx.restore();
}
function server(ctx, x, y, w, h, label, t, on) {
  shadow(ctx, 30, 12, .4); ctx.fillStyle = '#26323D'; rr(ctx, x - w / 2, y - h, w, h, 14); ctx.fill(); noShadow(ctx);
  for (let i = 0; i < 7; i++) { const yy = y - h + 24 + i * (h - 90) / 7; ctx.fillStyle = '#34444F'; rr(ctx, x - w / 2 + 14, yy, w - 28, (h - 90) / 7 - 10, 6); ctx.fill();
    for (let k = 0; k < 3; k++) { ctx.fillStyle = (Math.sin(t * 9 + i * 2 + k * 3 + x) > .2) ? (on ? RED : '#5BE38A') : '#1A242C'; ctx.beginPath(); ctx.arc(x - w / 2 + 34 + k * 20, yy + 14, 6, 0, 7); ctx.fill(); } }
  if (label) text(ctx, label, x, y - 36, { size: fitText(ctx, label, w - 16, 38, 900), weight: 900, color: '#fff' });
}
function globe(ctx, rot, scale, cx, cy, hi) {
  const pr = d3.geoOrthographic().rotate(rot).scale(scale).translate([cx, cy]).clipAngle(90); const p = d3.geoPath(pr, ctx);
  ctx.beginPath(); p({ type: 'Sphere' }); ctx.fillStyle = '#1F4E6B'; ctx.fill();
  ctx.beginPath(); p(d3.geoGraticule10()); ctx.strokeStyle = 'rgba(79,209,232,.15)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); p(land); ctx.fillStyle = hi || '#3E7D90'; ctx.fill(); ctx.strokeStyle = CYAN; ctx.lineWidth = 2; ctx.stroke();
  return pr;
}
function newspaper(ctx, x, y, s, rot, name, head) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  shadow(ctx, 40, 20, .4); ctx.fillStyle = '#F7F2E6'; ctx.fillRect(-380, -270, 760, 540); noShadow(ctx);
  text(ctx, name, 0, -215, { size: fitText(ctx, name, 680, 54, 800), weight: 800, color: C.ink, ls: 2 });
  ctx.fillStyle = C.ink; ctx.fillRect(-340, -175, 680, 5); ctx.fillRect(-340, -165, 680, 2);
  head.split('\n').forEach((l, i) => text(ctx, l, 0, -110 + i * 74, { size: fitText(ctx, l, 690, 72, 900), weight: 900, color: C.ink }));
  ctx.fillStyle = '#5A6670'; ctx.fillRect(-340, 30, 300, 200); eye(ctx, -190, 130, .35, 0, { open: .9 });
  ctx.fillStyle = 'rgba(42,26,16,.3)'; for (let i = 0; i < 8; i++) ctx.fillRect(10, 40 + i * 24, 320 - (i % 3) * 40, 10);
  ctx.restore();
}
function phoneIcon(ctx, x, y, s, kind) { // floating data icons
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#fff'; shadow(ctx, 20, 8, .35); rr(ctx, -60, -60, 120, 120, 26); ctx.fill(); noShadow(ctx);
  ctx.strokeStyle = ctx.fillStyle = kind === 'call' ? '#2E9E5B' : kind === 'mail' ? '#2F6FB5' : '#D9772B'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'call') { ctx.beginPath(); ctx.moveTo(-28, -30); ctx.quadraticCurveTo(-34, 30, 30, 30); ctx.stroke(); ctx.fillRect(-36, -38, 20, 20); ctx.fillRect(18, 22, 20, 20); }
  if (kind === 'mail') { ctx.strokeRect(-36, -24, 72, 50); ctx.beginPath(); ctx.moveTo(-36, -24); ctx.lineTo(0, 6); ctx.lineTo(36, -24); ctx.stroke(); }
  if (kind === 'web') { ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 14, 34, 0, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function podium(ctx, x, y) { ctx.fillStyle = '#5A3A22'; ctx.beginPath(); ctx.moveTo(x - 200, y); ctx.lineTo(x + 200, y); ctx.lineTo(x + 160, y + 520); ctx.lineTo(x - 160, y + 520); ctx.fill(); ctx.fillStyle = '#C9A26B'; ctx.beginPath(); ctx.arc(x, y + 150, 60, 0, 7); ctx.fill(); ctx.fillStyle = '#5A3A22'; ctx.beginPath(); ctx.arc(x, y + 150, 40, 0, 7); ctx.fill(); }
function usFlag(ctx, x, y, w, wave, t) { // stars & stripes, simplified
  const h = w * .55; ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 13; i++) { ctx.fillStyle = i % 2 ? '#F5F2EA' : '#B83A3A'; ctx.beginPath(); for (let k = 0; k <= 20; k++) { const xx = k / 20 * w, yy = i * h / 13 + Math.sin(xx / 60 + t * 3) * wave * (xx / w); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } for (let k = 20; k >= 0; k--) { const xx = k / 20 * w, yy = (i + 1) * h / 13 + Math.sin(xx / 60 + t * 3) * wave * (xx / w); ctx.lineTo(xx, yy); } ctx.fill(); }
  ctx.fillStyle = '#2E3F73'; ctx.fillRect(0, 0, w * .42, h * 7 / 13); ctx.restore();
}
const SNOW = { skin: SK.a, skin2: SK.a2, hair: '#8A6A4A', hairStyle: 'short', stubble: 'rgba(120,90,60,.45)', glasses: '#2A1A10', robe: '#2B3540', robe2: '#E9E6DE', lid: .35 };
const SUITS = ['#2B3540', '#3A2F45', '#1F3A4D', '#4A3A2A', '#2E4232'];
const SHIRTS = ['#2F5D8A', '#C0392B', '#6C7A3E', '#8E5BA8', '#D68910', '#16A085', '#7B5E57', '#E5534B'];
const SKINS = [SK.a, SK.b, SK.c, SK.b, SK.a, SK.c];

const S = []; const scene = (start, fn, o = {}) => S.push({ start, fn, ...o });

// 0. HOOK — conspiracy board: 5 files stamped VERDADE
scene(0, (ctx, t) => {
  vgrad(ctx, '#2A1C12', '#120B07');
  ctx.save(); const z = lerp(1.15, 1, eo(prog(t, 0, 2.2))); ctx.translate(W / 2, 1050); ctx.scale(z, z); ctx.translate(-W / 2, -1050);
  // cork board
  ctx.fillStyle = '#B88B57'; rr(ctx, 40, 540, 1000, 800, 20); ctx.fill(); for (let i = 0; i < 260; i++) { ctx.fillStyle = 'rgba(90,55,25,.2)'; ctx.beginPath(); ctx.arc(60 + rnd(i) * 960, 560 + rnd(i + 3) * 760, 3 + rnd(i + 5) * 4, 0, 7); ctx.fill(); }
  const P = [[230, 720], [850, 740], [540, 960], [240, 1170], [840, 1190]];
  ctx.strokeStyle = RED; ctx.lineWidth = 6; const sp = prog(t, .2, 1.4);
  [[0, 2], [1, 2], [2, 3], [2, 4], [0, 3], [1, 4]].forEach(([a, b], i) => { const q = clamp(sp * 6 - i); if (q <= 0) return; ctx.beginPath(); ctx.moveTo(...P[a]); ctx.lineTo(lerp(P[a][0], P[b][0], q), lerp(P[a][1], P[b][1], q)); ctx.stroke(); });
  P.forEach(([x, y], i) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate((rnd(i) - .5) * .2); shadow(ctx, 16, 8, .35); ctx.fillStyle = '#E8C77A'; ctx.fillRect(-150, -110, 300, 220); noShadow(ctx);
    ctx.fillStyle = '#D9B465'; ctx.fillRect(-150, -130, 110, 26); text(ctx, '#' + (i + 1), 0, -50, { size: 70, weight: 900, color: '#6E4A1E' });
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, -100, 14, 0, 7); ctx.fill(); ctx.restore();
    stamp(ctx, x, y + 40, 'VERDADE', prog(t, .45 + i * .3, .7 + i * .3), { size: 52, rot: -.18 + rnd(i) * .1 });
  });
  ctx.restore();
  // hanging bulb
  const sw = Math.sin(t * 2) * .08; ctx.save(); ctx.translate(540, -20); ctx.rotate(sw); ctx.strokeStyle = '#111'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 330); ctx.stroke(); ctx.fillStyle = '#FFE9A8'; ctx.shadowColor = '#FFD970'; ctx.shadowBlur = 60; ctx.beginPath(); ctx.arc(0, 360, 34, 0, 7); ctx.fill(); ctx.restore(); noShadow(ctx);
  headline(ctx, '5 TEORIAS DA CONSPIRAÇÃO', 'QUE ERAM VERDADE', prog(t, .05, .6), { y: 250, size: 86, size2: 104, c2: '#FF5A4D' });
}, { noZoom: true });

// 1. Nº3 — mass surveillance: eye over the night city + cameras
scene(2.24, (ctx, t) => {
  vgrad(ctx, NIGHT1, NIGHT2);
  for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(255,255,255,${.3 + .4 * rnd(i)})`; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 9) * 900, 2, 0, 7); ctx.fill(); }
  eye(ctx, W / 2, 900, 1.25, t, { open: eo(prog(t, 2.3, 2.9)), look: Math.sin(t * 1.5) * .6 });
  // scan beam
  const bx = W / 2 + Math.sin(t * 1.5) * 380; ctx.fillStyle = 'rgba(224,68,58,.18)'; ctx.beginPath(); ctx.moveTo(W / 2 - 40, 950); ctx.lineTo(W / 2 + 40, 950); ctx.lineTo(bx + 220, 1950); ctx.lineTo(bx - 220, 1950); ctx.closePath(); ctx.fill();
  skyline(ctx, 1950, '#0B141C', 7, true, t);
  [[120, 1300, 1], [960, 1250, -1], [300, 1520, 1], [800, 1560, -1]].forEach(([x, y, d], i) => { const k = eback(prog(t, 2.6 + i * .15, 2.9 + i * .15)); if (k > 0) cctv(ctx, x, y, .9 * k, .25 + Math.sin(t * 2 + i) * .2, { dir: d, led: true, t }); });
  headline(ctx, 'Nº 3', 'VIGILÂNCIA EM MASSA', prog(t, 2.3, 2.8), { y: 330, size: 150, size2: 110, c2: '#FF5A4D' });
}, { noZoom: true });

// 2. government spied on millions?
scene(3.92, (ctx, t) => {
  vgrad(ctx, '#2C4A66', '#8FB3C9');
  // government building with dome
  const bx = W / 2, by = 1050;
  ctx.fillStyle = '#E9E4D8'; ctx.fillRect(bx - 380, by - 260, 760, 260); ctx.fillStyle = '#D5CFC0'; ctx.fillRect(bx - 420, by, 840, 40);
  ctx.beginPath(); ctx.moveTo(bx - 410, by - 260); ctx.lineTo(bx, by - 360); ctx.lineTo(bx + 410, by - 260); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E9E4D8'; ctx.beginPath(); ctx.arc(bx, by - 360, 150, Math.PI, 0); ctx.fill(); ctx.fillRect(bx - 12, by - 560, 24, 60);
  ctx.fillStyle = '#CFC8B6'; for (let i = 0; i < 9; i++) ctx.fillRect(bx - 340 + i * 82, by - 230, 30, 230);
  usFlag(ctx, bx + 12, by - 700, 220, 14, t); ctx.fillStyle = '#555'; ctx.fillRect(bx + 6, by - 700, 8, 200);
  // data beams to crowd of tiny people
  const n = 60; const sp = prog(t, 5.3, 6.4);
  for (let i = 0; i < n; i++) { const x = 60 + (i % 12) * 88 + (Math.floor(i / 12) % 2) * 40, y = 1250 + Math.floor(i / 12) * 120;
    if (i / n < sp) { ctx.strokeStyle = 'rgba(224,68,58,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by - 360); ctx.lineTo(x, y - 90); ctx.stroke(); }
    fig(ctx, x, y + 60, .5, { robe: SHIRTS[i % 8], pants: '#2B3540', skin: SKINS[i % 6], hair: '#2A1A10', mouth: i / n < sp ? 'open' : null }); }
  const cnt = Math.floor(eio(prog(t, 5.9, 6.8)) * 1000000);
  card(ctx, W / 2, 300, ['ESPIONOU MILHÕES?'], { t: prog(t, 5.36, 5.7), size: 80, col: C.red });
  if (t > 5.9) text(ctx, cnt.toLocaleString('pt-BR') + '+', W / 2, 480, { size: 90, weight: 900, color: '#fff', stroke: 14, strokeColor: '#24150C' });
});

// 3. "just a conspiracy theory" — tinfoil hat guy, people laughing
scene(6.88, (ctx, t) => {
  paperBg(ctx, '#E9DDC8', '#CDBB9F');
  ctx.fillStyle = '#B88B57'; rr(ctx, 520, 360, 500, 560, 16); ctx.fill();
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#F7F2E6'; ctx.fillRect(560 + (i % 2) * 230, 400 + Math.floor(i / 2) * 170, 180, 130); }
  ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(650, 460); ctx.lineTo(880, 640); ctx.lineTo(650, 800); ctx.lineTo(880, 470); ctx.stroke();
  eye(ctx, 770, 640, .25, t);
  // guy ranting (bust) with foil hat
  const talk = Math.abs(Math.sin(t * 11)) * (t < 11.9 ? 1 : 0);
  bust(ctx, 330, 1180, 1.15, { skin: SK.a, skin2: SK.a2, hair: '#5A3A22', hairStyle: 'short', stubble: 'rgba(90,60,40,.4)', robe: '#6C7A3E', robe2: '#E9E6DE', brows: 'up', talk, blink: blink(t), lid: .2 });
  ctx.save(); ctx.translate(330, 1180); ctx.scale(1.15, 1.15); ctx.fillStyle = '#D9DEE3'; ctx.beginPath(); ctx.moveTo(-120, -80); ctx.lineTo(0, -300); ctx.lineTo(120, -80); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#9AA6AF'; ctx.lineWidth = 4; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-100 + i * 30, -90); ctx.lineTo(-40 + i * 25, -250); ctx.stroke(); } ctx.restore();
  // laughing people
  for (let i = 0; i < 3; i++) { const j = Math.abs(Math.sin(t * 9 + i)) * 14 * prog(t, 8.0, 8.4); fig(ctx, 640 + i * 150, 1700 - j, 1.15, { robe: SHIRTS[i + 2], pants: '#3A3A44', skin: SKINS[i + 1], hair: '#2A1A10', mouth: t > 8.0 ? 'open' : null, la: t > 8 ? -.6 : null, ra: t > 8 ? .6 : null }); if (t > 8.1) text(ctx, 'HAHA', 640 + i * 150, 1270 - j - (i % 2) * 40, { size: 40, weight: 900, color: C.dred }); }
  card(ctx, W / 2, 230, ['SÓ UMA TEORIA', 'DA CONSPIRAÇÃO...'], { t: prog(t, 11.22, 11.5), size: 72, size2: 56 });
  card(ctx, W / 2, 230, ['DURANTE ANOS...'], { t: prog(t, 7.2, 7.5) * (1 - prog(t, 11.0, 11.15)), size: 72 });
});

// 4. truth surfaced, shocked the planet
scene(12.34, (ctx, t) => {
  vgrad(ctx, '#071018', '#13283A');
  const rot = [90 + (t - 12.34) * 25, -20];
  globe(ctx, rot, 360, W / 2, 980);
  const sh = prog(t, 13.78, 14.58);
  for (let i = 0; i < 4; i++) { const r = 380 + ((sh * 900 + i * 220) % 900); const a = (1 - (r - 380) / 900) * (sh > 0 ? 1 : 0); ctx.strokeStyle = `rgba(224,68,58,${a})`; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(W / 2, 980, r, 0, 7); ctx.stroke(); }
  // flying docs
  for (let i = 0; i < 8; i++) { const p = prog(t, 12.6 + i * .08, 13.6 + i * .08); if (p <= 0) continue; const a = i / 8 * 7; doc(ctx, W / 2 + Math.cos(a) * p * 520, 980 + Math.sin(a) * p * 620, .8, a + p * 2); }
  headline(ctx, 'A VERDADE', 'VEIO À TONA', prog(t, 12.66, 13.1), { y: 300, size: 130, c2: '#FF5A4D' });
}, { noZoom: true });

// 5. 2013 — Snowden at his desk copying documents
scene(14.58, (ctx, t) => {
  vgrad(ctx, '#0F1A24', '#1B2B38');
  // monitors glow
  ctx.fillStyle = 'rgba(79,209,232,.12)'; ctx.beginPath(); ctx.arc(540, 820, 700, 0, 7); ctx.fill();
  const mon = (x, y, w, h) => { ctx.fillStyle = '#111A22'; rr(ctx, x - w / 2 - 14, y - h / 2 - 14, w + 28, h + 28, 14); ctx.fill(); ctx.fillStyle = '#0F3343'; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = 'rgba(79,209,232,.7)'; for (let i = 0; i < 8; i++) ctx.fillRect(x - w / 2 + 20, y - h / 2 + 20 + i * (h - 40) / 8, (w - 40) * (.3 + .7 * rnd(i + Math.floor(t * 4) + x)), 8); };
  mon(220, 700, 340, 240); mon(860, 700, 340, 240); mon(540, 560, 380, 260);
  calendar(ctx, 160, 340, .55 * pop(t, 14.6, .3), 'ANO', '2013', { color: C.red });
  bust(ctx, 540, 1250, 1.45, { ...SNOW, blink: blink(t, 2), look: Math.sin(t) * .5 });
  ctx.fillStyle = 'rgba(79,209,232,.10)'; ctx.fillRect(-300, -300, W + 600, H + 600);
  card(ctx, W / 2, 230, ['EX-ANALISTA', 'CIA · NSA'], { t: prog(t, 15.38, 15.7) * (1 - prog(t, 16.8, 16.9)), size: 80, size2: 60, col2: C.red });
  card(ctx, W / 2, 230, ['EDWARD SNOWDEN'], { t: prog(t, 17.14, 17.45), size: 80 });
  // copying docs into a USB drive
  if (t > 18.2) {
    const ux = 880, uy = 1050; ctx.fillStyle = '#C9D1D8'; rr(ctx, ux - 50, uy - 20, 100, 60, 8); ctx.fill(); ctx.fillStyle = '#1F2A33'; rr(ctx, ux - 60, uy + 30, 120, 170, 18); ctx.fill(); ctx.fillStyle = (Math.floor(t * 8) % 2) ? '#5BE38A' : '#1A3A26'; ctx.beginPath(); ctx.arc(ux, uy + 160, 10, 0, 7); ctx.fill();
    for (let i = 0; i < 10; i++) { const p = ((t - 18.2) * 1.4 + i / 10) % 1; doc(ctx, lerp(540, ux, p), lerp(560, uy, p) - Math.sin(p * Math.PI) * 120, .45 * (1 - p * .7), p * 3); }
    const n = Math.floor(prog(t, 18.4, 20.0) * 1700000);
    text(ctx, n.toLocaleString('pt-BR') + ' ARQUIVOS', ux - 150, 1460, { size: 46, weight: 900, color: '#5BE38A', stroke: 10, strokeColor: '#0B141C' });
  }
});

// 6. leak to the newspapers
scene(20.2, (ctx, t) => {
  paperBg(ctx, '#2A2F36', '#15191E');
  const a = eo(prog(t, 21.4, 21.9)), b = eo(prog(t, 22.5, 23.0));
  if (a > 0) newspaper(ctx, lerp(-600, 430, a), 820, .95, lerp(-2, -.08, a), 'THE GUARDIAN', 'EUA ESPIONAM\nMILHÕES');
  if (b > 0) newspaper(ctx, lerp(1700, 640, b), 1180, .95, lerp(2, .06, b), 'THE WASHINGTON POST', 'PROGRAMA\nSECRETO REVELADO');
  // "vazou": docs bursting from USB at start
  for (let i = 0; i < 12; i++) { const p = prog(t, 20.3 + i * .04, 21.3 + i * .04); if (p <= 0 || p >= 1) continue; doc(ctx, W / 2 + (rnd(i) - .5) * 1200 * p, 1500 - p * 1400 + p * p * 400, .6, i + p * 4); }
  card(ctx, W / 2, 1680, ['ESPIONAGEM REVELADA'], { t: prog(t, 23.56, 23.9), size: 72, col: C.red });
});

// 7. PRISM
scene(25.16, (ctx, t) => {
  fill(ctx, '#05070A');
  const k = eback(prog(t, 25.2, 25.9));
  // incoming white beam
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 14; ctx.shadowColor = '#fff'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(-100, 1150); ctx.lineTo(470, 960); ctx.stroke(); noShadow(ctx);
  ['#E5534B', '#F0A04B', '#F5D547', '#6BBF59', '#4A90C2', '#7B5EA7'].forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(610, 960); ctx.lineTo(1300, 760 + i * 70 + Math.sin(t * 3 + i) * 6); ctx.stroke(); }); ctx.restore();
  ctx.save(); ctx.translate(540, 960); ctx.scale(k, k); ctx.rotate(Math.sin(t) * .03);
  const g = ctx.createLinearGradient(-200, -200, 200, 200); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(120,160,200,.25)'); ctx.fillStyle = g; ctx.strokeStyle = '#E8F2FA'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(0, -230); ctx.lineTo(220, 160); ctx.lineTo(-220, 160); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  headline(ctx, 'O MAIOR PROGRAMA:', 'PRISM', prog(t, 26.3, 26.8), { y: 380, size: 90, size2: 200, c2: CYAN, gap: 170 });
}, { noZoom: true });

// 8. direct access to big tech servers
scene(27.4, (ctx, t) => {
  vgrad(ctx, '#0B141C', '#18293A');
  // agency hub
  eye(ctx, W / 2, 520, .55, t, { open: 1, look: Math.sin(t * 2) * .7 });
  card(ctx, W / 2, 260, ['ACESSO DIRETO'], { t: prog(t, 28.12, 28.4), size: 80, col: C.red });
  const names = [['GOOGLE', 31.32], ['FACEBOOK', 31.72], ['APPLE', 32.43], ['MICROSOFT', 32.91]];
  const xs = [150, 410, 670, 930];
  names.forEach(([n, t0], i) => {
    const show = eback(prog(t, 29.9 + i * .1, 30.3 + i * .1)); if (show <= 0) return;
    const x = xs[i], y = 1250; ctx.save(); ctx.translate(x, y); ctx.scale(show, show); ctx.translate(-x, -y);
    server(ctx, x, y, 220, 460, t >= t0 ? n : 'SERVIDOR', t, t >= t0); ctx.restore();
    // cable + packets to eye
    ctx.strokeStyle = 'rgba(79,209,232,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y - 460); ctx.quadraticCurveTo(x, 760, W / 2, 640); ctx.stroke();
    for (let k = 0; k < 4; k++) { const p = ((t * .8 + k / 4 + i * .13) % 1); const qx = (1 - p) * (1 - p) * x + 2 * (1 - p) * p * x + p * p * W / 2, qy = (1 - p) * (1 - p) * (y - 460) + 2 * (1 - p) * p * 760 + p * p * 640; ctx.fillStyle = t >= t0 ? RED : CYAN; ctx.beginPath(); ctx.arc(qx, qy, 10, 0, 7); ctx.fill(); }
    if (t >= t0) stamp(ctx, x, y - 230, 'ACESSO', prog(t, t0, t0 + .25), { size: 34, color: RED });
  });
});

// 9. not only suspects — calls, emails, browsing of millions
scene(33.55, (ctx, t) => {
  vgrad(ctx, '#C9D6DD', '#EEE6D6');
  skyline(ctx, 1150, '#AFC0C9', 3, false, t);
  ctx.fillStyle = '#9AA3A8'; ctx.fillRect(-300, 1150, W + 600, 1000);
  const all = prog(t, 35.95, 36.4);
  for (let i = 0; i < 14; i++) {
    const row = Math.floor(i / 7), x = 90 + (i % 7) * 150 + row * 70, y = 1500 + row * 220;
    const sus = i === 5; const hit = sus || all > 0;
    fig(ctx, x, y, 1.0, { robe: SHIRTS[i % 8], pants: ['#2B3540', '#4A3A2A', '#1F3A4D'][i % 3], skin: SKINS[i % 6], hair: ['#2A1A10', '#5A3A22', '#8A6A4A'][i % 3], phone: '#4FD1E8', ra: -1.9, la: .2, glasses: i % 4 === 1 });
    if (hit && (sus ? t > 34.4 : true)) { ctx.strokeStyle = RED; ctx.lineWidth = 6; const r = 70 + Math.sin(t * 6 + i) * 6; ctx.save(); ctx.globalAlpha = sus ? 1 : all; ctx.beginPath(); ctx.arc(x, y - 250, r, 0, 7); ctx.moveTo(x - r - 20, y - 250); ctx.lineTo(x - r + 20, y - 250); ctx.moveTo(x + r - 20, y - 250); ctx.lineTo(x + r + 20, y - 250); ctx.stroke(); ctx.restore(); }
  }
  if (t > 34.4 && t < 35.95) card(ctx, 630, 1050, ['SUSPEITO'], { t: prog(t, 34.4, 34.7), size: 44, col: C.red });
  // data icons flying up
  const kinds = [['call', 36.67], ['mail', 37.31], ['web', 37.63]];
  kinds.forEach(([k, t0], j) => { for (let i = 0; i < 5; i++) { const p = ((t - t0) * .5 + i / 5) % 1; if (t < t0) continue; phoneIcon(ctx, 150 + i * 200 + j * 40, lerp(1250, 300, p), .7 * (1 - p * .3), k); } });
  card(ctx, W / 2, 230, ['NÃO SÓ SUSPEITOS'], { t: prog(t, 34.43, 34.7) * (1 - prog(t, 36.5, 36.6)), size: 72, col: C.red });
  card(ctx, W / 2, 230, ['MILHÕES DE', 'CIDADÃOS COMUNS'], { t: prog(t, 38.91, 39.2), size: 76, size2: 56 });
});

// 10. allied heads of state spied on
scene(40.27, (ctx, t) => {
  vgrad(ctx, '#5C4632', '#2E2218');
  // flags (generic)
  const flagCols = [['#2E5BA8', '#F5F2EA', '#C0392B'], ['#1E1E1E', '#C0392B', '#F2C14E'], ['#2E8B57', '#F5F2EA', '#C0392B'], ['#C0392B', '#F5F2EA', '#C0392B'], ['#2E5BA8', '#F2C14E', '#2E5BA8']];
  for (let i = 0; i < 5; i++) { const x = 140 + i * 200; ctx.fillStyle = '#888'; ctx.fillRect(x, 420, 8, 520); flagCols[i].forEach((c, k) => { ctx.fillStyle = c; ctx.fillRect(x + 8, 430 + k * 40 + Math.sin(t * 3 + i) * 4, 150, 40); }); }
  // leaders behind table
  for (let i = 0; i < 5; i++) fig(ctx, 140 + i * 200, 1380, 1.35, { robe: SUITS[i], pants: '#1E1E24', tie: ['#C0392B', '#2E5BA8', '#6C7A3E', '#8E5BA8', '#D68910'][i], skin: SKINS[i], hair: ['#CFCFCF', '#2A1A10', '#5A3A22', '#9A9A9A', '#2A1A10'][i], glasses: i === 3 });
  ctx.fillStyle = '#6E4A2E'; ctx.fillRect(-300, 1260, W + 600, 70); ctx.fillStyle = '#4A3020'; ctx.fillRect(-300, 1330, W + 600, 700);
  // hidden bug under the table
  const k = eback(prog(t, 42.0, 42.4)); if (k > 0) { ctx.save(); ctx.translate(540, 1390); ctx.scale(k, k); ctx.fillStyle = '#111'; rr(ctx, -50, -20, 100, 40, 10); ctx.fill(); ctx.fillStyle = (Math.floor(t * 4) % 2) ? RED : '#550'; ctx.beginPath(); ctx.arc(30, 0, 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-90, 30); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 3; i++) { const r = 40 + ((t * 120 + i * 50) % 150); ctx.strokeStyle = `rgba(224,68,58,${1 - r / 190})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(540, 1390, r, -1.2, -.2); ctx.stroke(); } }
  card(ctx, W / 2, 250, ['CHEFES DE ESTADO', 'PAÍSES ALIADOS'], { t: prog(t, 40.5, 40.8), size: 70, size2: 54 });
  stamp(ctx, W / 2, 1650, 'ESPIONADOS', prog(t, 42.51, 42.8), { size: 96 });
});

// 11. government's defense: counter terrorism
scene(43.71, (ctx, t) => {
  vgrad(ctx, '#2C3E50', '#4A6378');
  usFlag(ctx, 560, 380, 520, 18, t); ctx.fillStyle = '#777'; ctx.fillRect(552, 380, 10, 900);
  const talk = (t < 47.9) ? Math.abs(Math.sin(t * 12)) : 0;
  bust(ctx, W / 2, 1180, 1.4, { skin: SK.a, skin2: SK.a2, hair: '#B9B9B9', hairStyle: 'short', robe: '#1F2A36', suit: true, tie: '#2E5BA8', wrinkles: true, talk, blink: blink(t, 3), lid: .4 });
  podium(ctx, W / 2, 1450);
  ctx.strokeStyle = '#222'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(W / 2 - 40, 1450); ctx.lineTo(W / 2 - 20, 1330); ctx.stroke(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(W / 2 - 20, 1320, 14, 22, 0, 0, 7); ctx.fill();
  card(ctx, W / 2, 260, ['"SEGURANÇA', 'NACIONAL"'], { t: prog(t, 44.67, 45.0) * (1 - prog(t, 47.3, 47.4)), size: 76, size2: 76, col2: C.blue });
  card(ctx, W / 2, 260, ['CONTRA O', 'TERRORISMO'], { t: prog(t, 47.43, 47.75), size: 76, size2: 76, col2: C.red });
});

// 12. global debate: privacy vs abuse of power
scene(48.23, (ctx, t) => {
  vgrad(ctx, '#0B1622', '#16304A');
  const pr = d3.geoEquirectangular().fitExtent([[30, 620], [1050, 1280]], { type: 'Sphere' }); const p = d3.geoPath(pr, ctx);
  ctx.beginPath(); p(land); ctx.fillStyle = '#2E5A72'; ctx.fill(); ctx.strokeStyle = CYAN; ctx.lineWidth = 2; ctx.stroke();
  const spots = [[-100, 40], [-47, -15], [2, 51], [10, 50], [37, 55], [116, 39], [139, 35], [77, 28], [151, -33], [28, -26], [-74, 4], [55, 25]];
  spots.forEach(([lo, la], i) => { const k = eback(prog(t, 48.5 + i * .18, 48.8 + i * .18)); if (k <= 0) return; const [x, y] = pr([lo, la]); ctx.save(); ctx.translate(x, y - 40); ctx.scale(k, k); ctx.fillStyle = '#fff'; rr(ctx, -40, -30, 80, 56, 16); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10, 24); ctx.lineTo(0, 44); ctx.lineTo(12, 24); ctx.fill(); ctx.fillStyle = i % 2 ? RED : '#2F6FB5'; for (let d = -1; d <= 1; d++) { ctx.beginPath(); ctx.arc(d * 18, -2, 7, 0, 7); ctx.fill(); } ctx.restore(); });
  card(ctx, W / 2, 330, ['DEBATE GLOBAL'], { t: prog(t, 49.51, 49.8), size: 86 });
  if (t > 50.4) { card(ctx, 290, 1520, ['PRIVACIDADE'], { t: prog(t, 50.47, 50.8), size: 58, col: C.blue, rot: -.05 }); text(ctx, 'x', W / 2, 1530, { size: 90, weight: 900, color: '#fff' }); card(ctx, 800, 1640, ['ABUSO DE PODER'], { t: prog(t, 51.19, 51.5), size: 58, col: C.red, rot: .05 }); }
});

// 13. mapping every step of your digital life
scene(52.07, (ctx, t) => {
  fill(ctx, '#E9E4D8');
  // city map grid
  ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(-.12); ctx.translate(-W / 2, -1000);
  ctx.fillStyle = '#D6CFBE'; for (let r = 0; r < 12; r++) for (let c = 0; c < 8; c++) rr(ctx, -200 + c * 200, 200 + r * 180, 170, 150, 12), ctx.fill();
  ctx.fillStyle = '#A8D08D'; rr(ctx, 600, 560, 370, 330, 20); ctx.fill(); ctx.fillStyle = '#8EC1DD'; ctx.beginPath(); ctx.ellipse(200, 1500, 220, 120, 0, 0, 7); ctx.fill();
  // tracked path
  const path = [[150, 1800], [150, 1350], [550, 1350], [550, 980], [960, 980], [960, 560], [560, 560], [560, 380]]; const lp = prog(t, 52.3, 55.6) * (path.length - 1);
  ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.setLineDash([24, 18]); ctx.beginPath(); ctx.moveTo(...path[0]);
  let cx = path[0][0], cy = path[0][1];
  for (let i = 1; i < path.length; i++) { const q = clamp(lp - (i - 1)); if (q <= 0) break; cx = lerp(path[i - 1][0], path[i][0], q); cy = lerp(path[i - 1][1], path[i][1], q); ctx.lineTo(cx, cy); }
  ctx.stroke(); ctx.setLineDash([]);
  for (let i = 1; i < path.length - 1; i++) { if (lp < i) break; const k = eback(prog(lp, i, i + .4)); ctx.save(); ctx.translate(...path[i]); ctx.scale(k, k); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, -50, 30, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -52, 11, 0, 7); ctx.fill(); ctx.restore();
    phoneIcon(ctx, path[i][0] + 70, path[i][1] - 110, .45 * eback(prog(lp, i, i + .4)), ['web', 'mail', 'call'][i % 3]); }
  ctx.restore();
  // walker following the path (approx, unrotated)
  fig(ctx, cx * Math.cos(-.12) - (cy - 1000) * Math.sin(-.12) + 0, (cx - W / 2) * Math.sin(-.12) + (cy - 1000) * Math.cos(-.12) + 1000 + 40, .8, { robe: '#2F5D8A', pants: '#2B3540', skin: SK.b, hair: '#2A1A10', walk: t * 9, phone: CYAN, ra: -1.9 });
  headline(ctx, 'CADA PASSO', 'DA SUA VIDA DIGITAL', prog(t, 54.39, 54.8), { y: 230, size: 110, size2: 86, c2: '#FF5A4D' });
});

// 14. the scary part: one man risked everything
scene(55.83, (ctx, t) => {
  fill(ctx, '#0A0806');
  const g = ctx.createRadialGradient(W / 2, 900, 50, W / 2, 900, 800); g.addColorStop(0, 'rgba(255,230,180,.35)'); g.addColorStop(1, 'rgba(255,230,180,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const out = prog(t, 59.0, 59.4);
  if (out < 1) { ctx.save(); ctx.globalAlpha = 1 - out; bust(ctx, W / 2, 1150, 1.6, { ...SNOW, blink: blink(t, 5), brows: 'sad', lid: .45 }); card(ctx, W / 2, 300, ['UM SÓ HOMEM'], { t: prog(t, 58.71, 59.0), size: 86 }); ctx.restore(); }
  if (out > 0) {
    ctx.save(); ctx.globalAlpha = out;
    // walking toward the light with a suitcase, cameras watching
    rays(ctx, W / 2, 700, 1300, 22, t * .2, '#FFE9B0', .18);
    ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(W / 2, 700, 200, 0, 7); ctx.fill();
    const lt = t - 59.0; const s = lerp(1.9, 1.1, eo(clamp(lt / 4))), y = lerp(1900, 1450, eo(clamp(lt / 4)));
    fig(ctx, W / 2, y, s, { robe: '#1C1C1C', pants: '#111', skin: '#1C1C1C', hair: '#111', walk: lt * 6 });
    ctx.fillStyle = '#111'; rr(ctx, W / 2 + 40 * s, y - 120 * s, 70 * s, 90 * s, 10); ctx.fill();
    [[120, 500, 1], [960, 560, -1], [140, 1100, 1], [940, 1160, -1]].forEach(([x, yy, d], i) => cctv(ctx, x, yy, .8, .5 + Math.sin(t + i) * .1, { dir: d, led: true, t }));
    card(ctx, W / 2, 300, ['ARRISCOU A', 'LIBERDADE E A VIDA'], { t: prog(t, 59.6, 59.9) * (1 - prog(t, 61.8, 61.9)), size: 74, size2: 56, col2: C.red });
    headline(ctx, 'PARA CONTAR', 'A VERDADE', prog(t, 61.91, 62.3), { y: 280, size: 120, c2: C.gold });
    ctx.restore();
  }
}, { noZoom: false });

// 15. end card
scene(63.6, (ctx, t) => {
  vgrad(ctx, '#1A120B', '#2B1D12');
  rays(ctx, W / 2, 1000, 1400, 24, t * .15, C.gold, .08);
  const k = pop(t, 63.6, .5);
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k);
  for (const [dx, a] of [[-70, 1], [70, .55]]) { ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0); ctx.fillStyle = C.ocean; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 50, 120, 0, 0, 7); ctx.moveTo(-120, 0); ctx.lineTo(120, 0); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  text(ctx, 'MUNDO PARALELO', W / 2, 700, { size: 104 * pop(t, 63.75, .4), weight: 900, color: '#fff' });
  ctx.fillStyle = C.gold; const lw = 520 * eo(prog(t, 63.95, 64.35)); ctx.fillRect(W / 2 - lw / 2, 772, lw, 8);
  text(ctx, 'VÍDEO COMPLETO NO CANAL', W / 2, 840, { size: 48, weight: 700, color: C.gold, ls: 4 });
  const tp = eback(prog(t, 64.2, 64.7));
  if (tp > 0) {
    ctx.save(); ctx.translate(W / 2, 1230); ctx.scale(tp, tp); ctx.rotate(-.02);
    shadow(ctx, 50, 25, .5); ctx.fillStyle = NIGHT1; rr(ctx, -420, -240, 840, 480, 30); ctx.fill(); noShadow(ctx);
    ctx.save(); rr(ctx, -420, -240, 840, 480, 30); ctx.clip(); vgrad(ctx, NIGHT1, NIGHT2); eye(ctx, -120, 60, .6, t); cctv(ctx, 230, 40, 1.0, .35, { dir: -1, led: true, t });
    ctx.fillStyle = 'rgba(20,10,5,.75)'; ctx.fillRect(-420, -240, 840, 110); text(ctx, 'TEORIAS QUE ERAM VERDADE', 0, -185, { size: 48, weight: 900, color: '#fff' });
    ctx.restore(); ctx.restore();
    const pk = (1 + .08 * Math.sin(t * 8)) * pop(t, 64.7, .35);
    ctx.save(); ctx.translate(W / 2, 1720); ctx.scale(pk, pk); ctx.fillStyle = C.red; rr(ctx, -340, -70, 680, 140, 70); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-270, -32); ctx.lineTo(-270, 32); ctx.lineTo(-215, 0); ctx.closePath(); ctx.fill();
    text(ctx, 'ASSISTA AGORA', 35, 4, { size: 54, weight: 900, color: '#fff' }); ctx.restore();
  }
  fill(ctx, `rgba(0,0,0,${prog(t, 66.7, 67.2)})`);
}, { noZoom: true });

// ---------------- captions ----------------
const words = JSON.parse(fs.readFileSync(process.env.WORDS, 'utf8')).filter(w => w.w !== 'Yeah.');
const FIX = { '3,': 'Nº 3:', 'Seita': 'CIA e da', 'NASA': 'NSA', 'População': 'população', 'em@22.36': 'e', 'acesso': 'dava acesso', 'meios': 'e-mails e', 'Prism.': 'PRISM.', 'para.@46.83': 'para', 'A@47.43': 'combater', 'ter@47.59': 'o' };
words.forEach(w => { const k = w.w + '@' + w.s; if (FIX[k]) w.w = FIX[k]; else if (FIX[w.w] && !w.w.match(/^(em|para\.|A|ter)$/)) w.w = FIX[w.w]; });
const KEY = new Set(['cinco', 'teorias', 'conspiração', 'verdade', 'nº', '3:', 'vigilância', 'massa', 'governo', 'americano', 'espionou', 'milhões', 'população', 'tona', 'planeta', '2013', 'cia', 'nsa', 'edward', 'snowden', 'milhares', 'documentos', 'ultra', 'secretos', 'vazou', 'guardian', 'washington', 'post', 'espionagem', 'prism', 'acesso', 'direto', 'google', 'facebook', 'apple', 'microsoft', 'problema', 'suspeitos', 'ligações', 'e-mails', 'históricos', 'navegação', 'cidadãos', 'comuns', 'chefes', 'estado', 'aliados', 'espionados', 'secretamente', 'terrorismo', 'vazamento', 'global', 'privacidade', 'abuso', 'poder', 'mapear', 'digital', 'assustador', 'homem', 'liberdade', 'vida']);
const clean = (s) => s.toLowerCase().replace(/[.,!?…]/g, '');
const chunks = []; { let cur = []; const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  words.forEach((w) => { const txt = cur.map(x => x.w).join(' '); if (cur.length && (cur.length >= 3 || (txt + ' ' + w.w).length > 18 || w.s - cur[cur.length - 1].s > .9)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.w)) flush(); }); flush(); }
chunks.forEach((c, i) => { c.s = c[0].s; const nx = chunks[i + 1]; c.e = Math.min(nx ? nx[0].s : 999, c[c.length - 1].s + 1.2); });
function captions(ctx, t) {
  if (t >= 63.6) return;
  const c = chunks.find(c => t >= c.s - .02 && t < c.e); if (!c) return;
  const k = c.s < .1 ? 1 : eback(prog(t, c.s - .02, c.s + .14)); const size = 84;
  const parts = c.map(w => ({ w: w.w.toUpperCase().replace(/[.,]$/, ''), key: w.w.split(' ').some(x => KEY.has(clean(x))) }));
  L.font(ctx, size, 900); const sp = size * .28; const widths = parts.map(p => ctx.measureText(p.w).width); const tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  const sc = Math.min(1, 960 / tot); ctx.save(); ctx.translate(W / 2, 1395); ctx.scale(k * sc, k * sc); let x = -tot / 2;
  parts.forEach((p, i) => { const cx = x + widths[i] / 2; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8; text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF', stroke: 16, strokeColor: '#24150C' }); ctx.restore(); text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF' }); x += widths[i] + sp; });
  ctx.restore();
}

// ---------------- render ----------------
const FPS = 30, DUR = 67.2;
S.forEach((s, i) => s.end = S[i + 1] ? S[i + 1].start : DUR);
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
function frame(t) {
  const s = S.filter(s => t >= s.start).pop(); const lt = t - s.start, d = s.end - s.start;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; noShadow(ctx); ctx.save();
  if (!s.noZoom) { const z = 1 + .05 * (lt / d) + .06 * (1 - eo(clamp(lt / .3))); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
  s.fn(ctx, t, lt, d); ctx.restore(); finish(ctx);
  if (lt < .12 && s.start > 0) { ctx.fillStyle = `rgba(255,248,230,${.35 * (1 - lt / .12)})`; ctx.fillRect(0, 0, W, H); }
  captions(ctx, t);
}
if (require.main === module) {
  const mode = process.argv[2];
  if (mode === 'stills') { for (const ts of process.argv.slice(3).map(Number)) { frame(ts); fs.writeFileSync(`${process.env.OUT}/h_${ts.toFixed(2).padStart(6, '0')}.jpg`, cv.toBuffer('image/jpeg', 80)); } }
  else {
    const [a, b, out] = [+process.argv[3], +process.argv[4], process.argv[5]];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    (async () => { for (let f = a; f < b; f++) { frame(f / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  }
}
