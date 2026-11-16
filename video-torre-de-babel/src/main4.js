// "5 mistérios que a humanidade nunca explicou" — Torre de Babel
const L = require('./lib');
const { W, H, C, clamp, lerp, prog, eo, eio, eback, pop, rnd, rr, shadow, noShadow, text, fitText, paperBg, finish, rays, card, stamp, calendar, createCanvas } = L;
const { SK, bust, fig, mountains, cloud, scroll } = require('./chars');
const fs = require('fs'); const { spawn } = require('child_process');

const blink = (t, seed = 0) => { const p = (t + seed * 1.37) % 3.3; return p < .14 ? Math.sin(p / .14 * Math.PI) : 0; };
const fill = (ctx, c) => { ctx.fillStyle = c; ctx.fillRect(-300, -300, W + 600, H + 600); };
const vgrad = (ctx, a, b) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); };
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
const SAND1 = '#E3B676', SAND2 = '#C99A58', STONE = '#D8B27A', STONE2 = '#B98E55', STONE3 = '#8F6A3C';
const ROBES = ['#8E5A38', '#B5651D', '#6C7A3E', '#A0522D', '#7B5E57', '#C08A3E', '#5D6D7E', '#9C4A3A', '#2F5D8A', '#8E5BA8'];
const SKINS = [SK.a, SK.b, SK.c, SK.b, SK.a, SK.c];
const HB = ['#C0392B', '#2F5D8A', '#F2C14E', '#6C7A3E', '#F4F0E6'];

// ---------- the tower: stacked tiers with arches and a spiral ramp ----------
// levels: number of tiers built (fractional = tier rising), base at (x,y), o.ruin (0..1), o.glow
function tower(ctx, x, y, s, levels, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const N = 12, tierH = 110;
  for (let i = 0; i < N; i++) {
    const k = clamp(levels - i); if (k <= 0) break;
    const w = 860 - i * 62, top = -(i + 1) * tierH, h = tierH * k;
    const yy = -i * tierH - h;
    const rui = o.ruin ? clamp(o.ruin * 1.6 - (N - i) / N * .8) : 0;
    ctx.save();
    if (rui > 0 && i > N * .55) { ctx.beginPath(); ctx.rect(-w / 2, yy, w * (1 - rui * .5 * ((i % 2) + .5)), h); ctx.clip(); }
    ctx.fillStyle = i % 2 ? STONE : '#DDB985'; ctx.fillRect(-w / 2, yy, w, h);
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(w / 2 - w * .22, yy, w * .22, h); // side shading
    ctx.fillStyle = STONE3; ctx.fillRect(-w / 2 - 10, yy - 2, w + 20, 14); // ledge
    // arches
    const n = Math.max(3, Math.floor(w / 90));
    for (let a = 0; a < n; a++) { const ax = -w / 2 + (a + .5) * w / n; if (h < 70) continue; ctx.fillStyle = o.lit ? `rgba(255,200,110,${.5 + .4 * Math.sin(o.t * 3 + a + i)})` : '#6E4A28'; ctx.beginPath(); ctx.moveTo(ax - 18, yy + h - 14); ctx.lineTo(ax - 18, yy + 46); ctx.arc(ax, yy + 46, 18, Math.PI, 0); ctx.lineTo(ax + 18, yy + h - 14); ctx.closePath(); ctx.fill(); }
    // spiral ramp
    ctx.strokeStyle = STONE2; ctx.lineWidth = 16; ctx.beginPath(); const dir = i % 2 ? 1 : -1; ctx.moveTo(-dir * w / 2, yy + h); ctx.lineTo(dir * w / 2, yy + h * .15); ctx.stroke();
    ctx.restore();
    if (o.scaffold && k < 1.01 && i === Math.floor(levels)) { }
  }
  // scaffolding around the top tier being built
  if (o.scaffold) { const i = Math.floor(levels); const w = 860 - i * 62 + 80, yy = -i * tierH - tierH; ctx.strokeStyle = '#7A4E2D'; ctx.lineWidth = 8; for (let k = 0; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(-w / 2 + k * w / 6, yy - 40); ctx.lineTo(-w / 2 + k * w / 6, -i * tierH + 20); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-w / 2, yy + 20); ctx.lineTo(w / 2, yy + 20); ctx.moveTo(-w / 2, yy + 80); ctx.lineTo(w / 2, yy + 80); ctx.stroke(); }
  if (o.glow) { const top = -Math.min(levels, N) * tierH; ctx.save(); ctx.globalAlpha = o.glow; const g = ctx.createRadialGradient(0, top, 10, 0, top, 500); g.addColorStop(0, 'rgba(120,220,255,.9)'); g.addColorStop(1, 'rgba(120,220,255,0)'); ctx.fillStyle = g; ctx.fillRect(-600, top - 600, 1200, 1200); ctx.fillStyle = 'rgba(160,235,255,.5)'; ctx.fillRect(-30, top - 3000, 60, 3000); ctx.restore(); }
  ctx.restore();
}
function brick(ctx, x, y, s = 1) { ctx.fillStyle = '#B5653A'; rr(ctx, x - 34 * s, y - 16 * s, 68 * s, 32 * s, 5); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(x - 30 * s, y - 13 * s, 60 * s, 6 * s); }
function bubble(ctx, x, y, s, txt, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); font(ctx); const size = o.size || 46; L.font(ctx, size, 900); const w = Math.max(120, ctx.measureText(txt).width + 60), h = size * 1.7;
  shadow(ctx, 16, 6, .25); ctx.fillStyle = o.bg || '#FFFDF7'; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); noShadow(ctx);
  ctx.beginPath(); ctx.moveTo(o.tail || -20, h / 2 - 4); ctx.lineTo((o.tail || -20) - 20, h / 2 + 34); ctx.lineTo((o.tail || -20) + 22, h / 2 - 4); ctx.fill();
  text(ctx, txt, 0, 2, { size, weight: 900, color: o.col || C.dbrown }); ctx.restore();
}
function font() {}
function glyph(ctx, x, y, s, col) { // the one shared "perfect language" symbol
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col || C.dgold; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.moveTo(0, -40); ctx.lineTo(0, 40); ctx.moveTo(-36, 18); ctx.lineTo(36, -18); ctx.stroke(); ctx.restore();
}
function sky(ctx, a, b, t, o = {}) { vgrad(ctx, a, b); if (o.sun) { ctx.fillStyle = o.sunCol || 'rgba(255,236,180,.9)'; ctx.beginPath(); ctx.arc(o.sun[0], o.sun[1], 130, 0, 7); ctx.fill(); } }
function ground(ctx, y, c1 = SAND1, c2 = SAND2) { ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(-300, y); ctx.quadraticCurveTo(540, y - 60, 1400, y); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill(); ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(-300, y + 300); ctx.quadraticCurveTo(500, y + 200, 1400, y + 330); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill(); }
function sandWind(ctx, t, a = 1) { ctx.save(); for (let i = 0; i < 90; i++) { const x = ((rnd(i) * 1400 + t * (400 + rnd(i + 3) * 500)) % 1400) - 160, y = rnd(i + 9) * H; ctx.fillStyle = `rgba(235,200,140,${.45 * a})`; ctx.beginPath(); ctx.ellipse(x, y, 18, 3, 0, 0, 7); ctx.fill(); } ctx.restore(); }
function worker(ctx, x, y, s, i, t, o = {}) { return fig(ctx, x, y, s, { robe: ROBES[i % ROBES.length], skin: SKINS[i % 6], hair: '#2A1A10', beard: i % 3 === 0 ? '#2A1A10' : null, headband: true, ...o, t }); }
function carrier(ctx, x, y, s, i, t, walk) { fig(ctx, x, y, s, { robe: ROBES[i % ROBES.length], skin: SKINS[i % 6], hair: '#2A1A10', walk, la: 2.9, ra: -2.9 }); brick(ctx, x, y - 395 * s, s * 1.3); }

const S = []; const scene = (start, fn, o = {}) => S.push({ start, fn, ...o });

// 0. HOOK — tower silhouette in the fog, 5 glowing mysteries rise, explorer with torch
scene(0, (ctx, t) => {
  sky(ctx, '#0F0B14', '#3A2A2A', t);
  for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,240,210,${.2 + .5 * Math.abs(Math.sin(t * 2 + i))})`; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 9) * 1100, 2, 0, 7); ctx.fill(); }
  ctx.save(); ctx.globalAlpha = .9; ctx.filter = 'none'; tower(ctx, W / 2, 1500, 1.05 * lerp(.92, 1, eo(prog(t, 0, 2.6))), 12, {}); ctx.restore();
  fill(ctx, 'rgba(15,10,20,.55)');
  for (let i = 0; i < 4; i++) cloud(ctx, ((i * 330 + t * 40) % 1500) - 200, 1250 + (i % 2) * 120, 2.2, 'rgba(70,55,60,.6)');
  // 5 orbs
  for (let i = 0; i < 5; i++) { const k = eback(prog(t, .3 + i * .28, .6 + i * .28)); if (k <= 0) continue; const x = 140 + i * 200, y = 820 - Math.sin(i / 4 * Math.PI) * 160 + Math.sin(t * 2 + i) * 14;
    const g = ctx.createRadialGradient(x, y, 5, x, y, 110 * k); g.addColorStop(0, 'rgba(255,214,120,.9)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 110 * k, 0, 7); ctx.fill();
    text(ctx, '?', x, y, { size: 90 * k, weight: 900, color: '#fff', stroke: 10, strokeColor: '#5A3A10' }); }
  ctx.fillStyle = '#1A1210'; ctx.fillRect(-300, 1500, W + 600, 900);
  // explorer with torch from behind
  fig(ctx, 760, 1830, 1.7, { robe: '#3A2A20', hood: '#4A3424', skin: '#3A2A20', ra: -2.5 });
  const fx = 760 + 1.7 * 60, fy = 1830 - 1.7 * 360; const fl = 1 + .1 * Math.sin(t * 20); const g = ctx.createRadialGradient(fx, fy, 5, fx, fy, 260); g.addColorStop(0, 'rgba(255,190,90,.6)'); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 260, 0, 7); ctx.fill(); ctx.fillStyle = '#FFB648'; ctx.beginPath(); ctx.ellipse(fx, fy - 10, 18 * fl, 34 * fl, 0, 0, 7); ctx.fill();
  headline(ctx, '5 MISTÉRIOS QUE A HUMANIDADE', 'NUNCA EXPLICOU', prog(t, .05, .6), { y: 250, size: 74, size2: 120, c2: '#FF5A4D' });
}, { noZoom: true });

// 1. Torre de Babel — reveal, tilt up
scene(2.8, (ctx, t) => {
  sky(ctx, '#E9A65E', '#F8E1AE', t, { sun: [820, 420] });
  rays(ctx, 820, 420, 1500, 20, t * .1, '#fff', .18);
  const tilt = eio(prog(t, 2.8, 6.0));
  ctx.save(); ctx.translate(0, lerp(-500, 380, tilt));
  for (let i = 0; i < 3; i++) cloud(ctx, ((i * 420 + t * 30) % 1500) - 200, -380 + i * 160, 1.8);
  tower(ctx, W / 2, 1900, 1.1, 12, {});
  ground(ctx, 1900);
  for (let i = 0; i < 6; i++) fig(ctx, 120 + i * 170, 2080 + (i % 2) * 40, .7, { robe: ROBES[i], skin: SKINS[i], hair: '#2A1A10', walk: t * 6 + i });
  ctx.restore();
  for (let i = 0; i < 5; i++) { const x = ((i * 230 + t * 90) % 1400) - 150, y = 700 + Math.sin(t * 2 + i) * 30 + i * 30; ctx.strokeStyle = '#3E2A1E'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.quadraticCurveTo(x - 10, y - 12 * Math.sin(t * 10 + i), x, y); ctx.quadraticCurveTo(x + 10, y - 12 * Math.sin(t * 10 + i), x + 20, y); ctx.stroke(); }
  headline(ctx, 'TORRE', 'DE BABEL', prog(t, 2.85, 3.3), { y: 300, size: 170, c2: C.gold });
  card(ctx, W / 2, 620, ['ANTIGUIDADE'], { t: prog(t, 7.36, 7.6), size: 60, col: C.dbrown });
}, { noZoom: true });

// 2. one language united everyone
scene(8.48, (ctx, t) => {
  sky(ctx, '#9FC6D6', '#F3E2BF', t);
  // city walls / houses
  for (let i = 0; i < 7; i++) { const x = -60 + i * 170, h = 220 + rnd(i) * 160; ctx.fillStyle = i % 2 ? '#D9B27A' : '#C9A26B'; ctx.fillRect(x, 1100 - h, 160, h); ctx.fillStyle = '#6E4A28'; rr(ctx, x + 55, 1100 - h + 50, 50, 70, 25); ctx.fill(); }
  tower(ctx, 860, 1100, .35, 6, {});
  ground(ctx, 1100, '#E6C48C', '#D2AC70');
  // circle of people, holding hands when "unia todos"
  const unite = prog(t, 14.76, 15.3);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const row = i < 4 ? 0 : 1; const x = 150 + (i % 4) * 260 + row * 120, y = 1500 + row * 300;
    const talk = Math.sin(t * 4 + i * 1.7) > 0;
    fig(ctx, x, y, 1.05, { robe: ROBES[i], skin: SKINS[i % 6], hair: '#2A1A10', beard: i % 3 === 0 ? '#2A1A10' : null, mouth: talk && unite < .5 ? 'open' : null, la: unite > .5 ? -1.4 : null, ra: unite > .5 ? 1.4 : null, dir: i % 2 ? -1 : 1 });
    if (talk && t > 9.4 && unite < .5) { ctx.save(); ctx.translate(x + 60, y - 420); const k = eback(prog((t * 4 + i * 1.7) % (Math.PI * 2) / 4, 0, .1)); ctx.scale(k, k); shadow(ctx, 12, 5, .2); ctx.fillStyle = '#FFFDF7'; rr(ctx, -60, -45, 120, 90, 40); ctx.fill(); noShadow(ctx); glyph(ctx, 0, 0, .8, C.dgold); ctx.restore(); }
  }
  if (unite > 0) { ctx.strokeStyle = `rgba(242,193,78,${unite})`; ctx.lineWidth = 8; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.ellipse(W / 2 + 60, 1650, 470, 240, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  card(ctx, W / 2, 330, ['UMA SÓ LÍNGUA'], { t: prog(t, 12.44, 12.8), size: 84, col: C.dbrown });
  if (t > 13.6) { ctx.save(); const k = eback(prog(t, 13.6, 14.0)); ctx.translate(W / 2, 560); ctx.scale(k, k); glyph(ctx, 0, 0, 2.2, C.gold); ctx.restore(); }
});

// 3. ambition — king with the plan
scene(15.96, (ctx, t) => {
  vgrad(ctx, '#6E2A3A', '#C46A4A');
  rays(ctx, W / 2, 1100, 1400, 18, t * .15, C.gold, .15);
  // scroll with tower plan behind
  const op = eo(prog(t, 18.5, 19.3));
  if (op > 0) { scroll(ctx, 780, 620, 460, 640, op, 'O PLANO'); ctx.save(); ctx.globalAlpha = op; ctx.strokeStyle = '#2F5D8A'; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { const w = 300 - i * 32; ctx.strokeRect(780 - w / 2, 860 - (i + 1) * 46, w, 46); } ctx.restore(); }
  bust(ctx, 400, 1200, 1.4, { skin: SK.b, skin2: SK.b2, hair: '#2A1A10', hairStyle: 'long', beard: 'long', beardCol: '#1E140E', robe: '#5B2A6E', sash: C.gold, brows: 'angry', mouth: t > 17 ? 'smile' : 'neutral', blink: blink(t), look: .6, lid: .5 });
  // crown
  ctx.save(); ctx.translate(400, 1200); ctx.scale(1.4, 1.4); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(-100, -110); ctx.lineTo(-100, -175); ctx.lineTo(-60, -140); ctx.lineTo(-25, -195); ctx.lineTo(0, -145); ctx.lineTo(25, -195); ctx.lineTo(60, -140); ctx.lineTo(100, -175); ctx.lineTo(100, -110); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, -128, 12, 0, 7); ctx.fill(); ctx.restore();
  card(ctx, W / 2, 300, ['AMBIÇÃO', 'SEM LIMITES'], { t: prog(t, 17.0, 17.35) * (1 - prog(t, 19.9, 20.0)), size: 90, size2: 70, col2: C.red });
  card(ctx, W / 2, 300, ['UMA TORRE GIGANTESCA'], { t: prog(t, 20.0, 20.3), size: 66 });
});

// 4. so tall it would reach the heavens
scene(21.1, (ctx, t) => {
  sky(ctx, '#3E5B7A', '#F2C98B', t);
  const g = ctx.createRadialGradient(W / 2, -100, 50, W / 2, -100, 900); g.addColorStop(0, 'rgba(255,245,200,.8)'); g.addColorStop(1, 'rgba(255,245,200,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  tower(ctx, W / 2, 2000, 1.0, 12, {}); // top pierces the clouds
  for (let i = 0; i < 6; i++) cloud(ctx, ((i * 300 + t * 50) % 1600) - 300, 640 + (i % 3) * 70, 2.4, 'rgba(255,255,255,.85)');
  if (t > 23.2) { const fl = Math.sin(t * 30) > .6; if (fl) { ctx.strokeStyle = '#FFF6C9'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(800, 150); ctx.lineTo(740, 330); ctx.lineTo(790, 330); ctx.lineTo(700, 560); ctx.stroke(); } }
  for (let i = 0; i < 6; i++) fig(ctx, 110 + i * 170, 1900, .9, { robe: ROBES[i], skin: SKINS[i], hair: '#2A1A10', ra: -2.6, la: i % 2 ? 2.6 : .3 });
  headline(ctx, 'ATÉ', 'O CÉU', prog(t, 21.5, 21.9), { y: 300, size: 160, c2: C.gold });
  card(ctx, W / 2, 1650, ['DESAFIANDO OS DEUSES'], { t: prog(t, 23.26, 23.6), size: 62, col: C.red });
});

// 5. construction at full force, tower growing
scene(25.34, (ctx, t) => {
  sky(ctx, '#F0B46A', '#F8E2B0', t, { sun: [880, 380] });
  const lv = lerp(3, 9.5, eio(prog(t, 25.6, 31.3)));
  ctx.save(); const z = lerp(1, .8, eio(prog(t, 25.6, 31.3))); ctx.translate(W / 2, 1600); ctx.scale(z, z); ctx.translate(-W / 2, -1600);
  tower(ctx, W / 2, 1600, 1.0, lv, { scaffold: true });
  // crane with stone
  const cy = 1600 - Math.floor(lv) * 110 - 220; const sw = Math.sin(t * 2) * 30;
  ctx.strokeStyle = '#6B4423'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(140, 1600); ctx.lineTo(260, cy - 150); ctx.lineTo(520, cy - 200); ctx.stroke();
  const lift = ((t * .5) % 1); ctx.lineWidth = 4; ctx.strokeStyle = '#3E2A1E'; ctx.beginPath(); ctx.moveTo(500, cy - 200); ctx.lineTo(500 + sw, lerp(1500, cy - 40, lift)); ctx.stroke(); ctx.fillStyle = '#9A8A70'; rr(ctx, 450 + sw, lerp(1500, cy - 40, lift), 100, 70, 8); ctx.fill();
  ctx.restore();
  ground(ctx, 1600);
  for (let i = 0; i < 5; i++) { const p = ((t * .25 + i / 5) % 1); carrier(ctx, lerp(-100, 700, p), 1780 + (i % 2) * 60, .95, i, t, t * 9 + i); }
  for (let i = 0; i < 3; i++) { worker(ctx, 820 + i * 90, 1750, .9, i + 5, t, { arms: 'hammer' }); }
  const lvl = Math.floor(lv); card(ctx, W / 2, 300, ['ANDAR ' + lvl], { t: prog(t, 27.66, 28.0), size: 90, col: C.dbrown });
  card(ctx, W / 2, 300, ['FORÇA TOTAL'], { t: prog(t, 26.38, 26.7) * (1 - prog(t, 27.5, 27.6)), size: 90, col: C.red });
});

// 6. suddenly... something inexplicable
scene(31.5, (ctx, t) => {
  const d = prog(t, 31.6, 33.0);
  vgrad(ctx, `rgb(${lerp(240, 30, d) | 0},${lerp(180, 26, d) | 0},${lerp(106, 50, d) | 0})`, `rgb(${lerp(248, 70, d) | 0},${lerp(226, 50, d) | 0},${lerp(176, 60, d) | 0})`);
  const sh = t > 33.27 && t < 34.6 ? (rnd(Math.floor(t * 50)) - .5) * 26 : 0;
  ctx.save(); ctx.translate(sh, sh * .5);
  tower(ctx, W / 2, 1650, 1.0, 9.5, { scaffold: true });
  if (t > 33.2) { // swirling energy vortex above
    for (let i = 0; i < 10; i++) { ctx.strokeStyle = `rgba(160,235,255,${.5 - i * .04})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(W / 2, 360, 120 + i * 50, 40 + i * 15, t * (1 + i * .2), 0, 5); ctx.stroke(); }
    if (Math.sin(t * 25) > .5) { ctx.strokeStyle = '#E8FBFF'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(W / 2, 400); ctx.lineTo(W / 2 - 60, 600); ctx.lineTo(W / 2 + 10, 620); ctx.lineTo(W / 2 - 40, 850); ctx.stroke(); }
  }
  ground(ctx, 1650, '#8A6A48', '#6E5236');
  for (let i = 0; i < 6; i++) fig(ctx, 110 + i * 170, 1860, 1.0, { robe: ROBES[i], skin: SKINS[i], hair: '#2A1A10', mouth: t > 33 ? 'open' : null, ra: t > 33 ? -2.4 : null, la: t > 33 ? 2.4 : null });
  ctx.restore();
  card(ctx, W / 2, 1540, ['ATÉ QUE DE REPENTE...'], { t: prog(t, 31.6, 31.9) * (1 - prog(t, 32.9, 33.0)), size: 62 });
  headline(ctx, 'ALGO', 'INEXPLICÁVEL', prog(t, 33.27, 33.7), { y: 1000, size: 140, c2: '#7FE3FF' });
}, { noZoom: true });

// 7. languages confused
const LANGS = ['OLÁ?', 'HELLO?', '¿HOLA?', 'CIAO?', 'HALLO?', 'SALUT?', 'PRIVET?', 'MERHABA?', 'HEJ?', 'AHOJ?'];
scene(35.03, (ctx, t) => {
  vgrad(ctx, '#3A2C3E', '#8A5A4A');
  // two workers facing each other
  bust(ctx, 260, 1260, 1.05, { skin: SK.b, skin2: SK.b2, hair: '#2A1A10', hairStyle: 'short', beard: 'short', beardCol: '#2A1A10', robe: '#A0522D', headband: '#C0392B', brows: 'up', talk: Math.abs(Math.sin(t * 10)) * (Math.sin(t * 2) > 0 ? 1 : 0), blink: blink(t), look: .8 });
  bust(ctx, 820, 1300, 1.05, { skin: SK.a, skin2: SK.a2, hair: '#5A3A22', hairStyle: 'short', robe: '#2F5D8A', headband: '#F2C14E', brows: 'up', talk: Math.abs(Math.sin(t * 10)) * (Math.sin(t * 2) <= 0 ? 1 : 0), blink: blink(t, 2), look: -.8 });
  LANGS.forEach((l, i) => { const t0 = 35.2 + i * .35; const k = eback(prog(t, t0, t0 + .3)); if (k <= 0) return; const x = 180 + rnd(i + 3) * 720, y = 420 + rnd(i + 11) * 520 + Math.sin(t * 2 + i) * 12; bubble(ctx, x, y, k, l, { size: 44, tail: i % 2 ? 30 : -30, col: i % 3 ? C.dbrown : C.red }); });
  if (t > 37.0) { const k = pop(t, 37.0, .3); text(ctx, '?!', 540, 820, { size: 220 * k, weight: 900, color: '#FF5A4D', stroke: 16, strokeColor: '#24150C' }); }
  headline(ctx, 'COMUNICAÇÃO', 'IMPOSSÍVEL', prog(t, 37.91, 38.3), { y: 250, size: 110, c2: '#FF5A4D' });
});

// 8. chaos: workers can't understand each other, orders lost, plans destroyed
scene(40.15, (ctx, t) => {
  sky(ctx, '#B8673E', '#E8B47A', t);
  tower(ctx, W / 2, 1450, .9, 9.5, { scaffold: true });
  ground(ctx, 1450, '#C99A58', '#A97C42');
  // falling bricks
  for (let i = 0; i < 10; i++) { const p = ((t * .7 + rnd(i)) % 1); brick(ctx, 150 + rnd(i + 4) * 780, lerp(500, 1500, p * p), 1.1); }
  // workers bumping into each other
  for (let i = 0; i < 6; i++) { const x = 140 + i * 160 + Math.sin(t * 3 + i) * 50; fig(ctx, x, 1760 + (i % 2) * 60, 1.0, { robe: ROBES[i], skin: SKINS[i], hair: '#2A1A10', mouth: 'open', walk: t * 8 + i, dir: Math.sin(t * 1.5 + i) > 0 ? 1 : -1, la: 2.5, ra: -2.5 }); if (Math.sin(t * 5 + i) > .3) text(ctx, ['?!', '?', '!!', '??'][i % 4], x, 1270 + (i % 2) * 60, { size: 60, weight: 900, color: '#FFF', stroke: 10, strokeColor: '#24150C' }); }
  // foreman with orders that get lost
  if (t > 44.2 && t < 45.8) { for (let i = 0; i < 5; i++) { const p = prog(t, 44.39 + i * .08, 45.6); bubble(ctx, 540 + Math.cos(i * 1.3) * p * 700, 900 - p * 500 + i * 30, .8 * (1 - p * .5), 'ORDEM #' + (i + 1), { size: 34 }); } }
  // blueprint tearing
  if (t > 45.7) { const p = eo(prog(t, 45.83, 46.6)); ctx.save(); ctx.translate(540, 820); for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * p * 160, p * 60); ctx.rotate(sx * p * .3); ctx.beginPath(); if (sx < 0) { ctx.moveTo(-260, -170); ctx.lineTo(0, -170); for (let k = 0; k < 8; k++) ctx.lineTo(k % 2 ? 14 : -10, -170 + k * 48); ctx.lineTo(0, 170); ctx.lineTo(-260, 170); } else { ctx.moveTo(260, -170); ctx.lineTo(0, -170); for (let k = 0; k < 8; k++) ctx.lineTo(k % 2 ? 14 : -10, -170 + k * 48); ctx.lineTo(0, 170); ctx.lineTo(260, 170); } ctx.closePath(); ctx.fillStyle = '#2F5D8A'; ctx.fill(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4; for (let i = 0; i < 7; i++) { const w = 380 - i * 45; ctx.strokeRect(-w / 2, 150 - (i + 1) * 40, w, 40); } ctx.restore(); } ctx.restore(); }
  headline(ctx, 'IMAGINE', 'O CAOS', prog(t, 40.2, 40.6) * (1 - prog(t, 43.9, 44.0)), { y: 300, size: 150, c2: '#FF5A4D' });
  card(ctx, W / 2, 300, ['PLANOS DESTRUÍDOS'], { t: prog(t, 45.9, 46.2), size: 72, col: C.red });
  card(ctx, W / 2, 300, ['ORDENS PERDIDAS'], { t: prog(t, 44.39, 44.7) * (1 - prog(t, 45.8, 45.9)), size: 72, col: C.dbrown });
});

// 9. stopped within days
scene(47.35, (ctx, t) => {
  sky(ctx, '#C88A5A', '#EBCB98', t);
  tower(ctx, W / 2, 1600, 1.0, 9.5, { scaffold: true });
  ground(ctx, 1600);
  // tools dropped
  ctx.save(); ctx.translate(300, 1720); ctx.rotate(.4); ctx.fillStyle = '#6B4423'; ctx.fillRect(-6, -90, 12, 120); ctx.fillStyle = '#5B5752'; ctx.fillRect(-30, -100, 60, 24); ctx.restore();
  for (let i = 0; i < 4; i++) brick(ctx, 620 + i * 70, 1740 - (i % 2) * 30, 1.1);
  const day = Math.min(7, 1 + Math.floor(prog(t, 50.47, 51.6) * 7));
  if (t > 50.4) calendar(ctx, W / 2, 900, .9 * pop(t, 50.4, .3), 'DIA', '' + day, { color: C.red, flip: (prog(t, 50.47, 51.6) * 7) % 1 * (day < 7 ? 1 : 0) });
  stamp(ctx, W / 2, 360, 'PAROU', prog(t, 49.35, 49.65), { size: 130 });
  card(ctx, W / 2, 600, ['EM QUESTÃO DE DIAS'], { t: prog(t, 50.63, 50.9), size: 60 });
});

// 10. abandoned — people leave in every direction
scene(51.91, (ctx, t) => {
  sky(ctx, '#B86E45', '#E6B27C', t);
  tower(ctx, W / 2, 1500, .95, 9.5, { ruin: prog(t, 52.5, 57.5) * .6 });
  ground(ctx, 1500, '#D6A866', '#B98A4E');
  const lt = t - 51.91;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI - .1; const dir = Math.cos(a) > 0 ? 1 : -1; const x = 540 + Math.cos(a) * (60 + lt * 120), y = 1650 + Math.sin(a) * (20 + lt * 60); fig(ctx, x, y, .9 + lt * .04, { robe: ROBES[i], skin: SKINS[i % 6], hair: '#2A1A10', walk: lt * 7 + i, dir, pack: i % 3 ? '#8A5A33' : null }); }
  sandWind(ctx, t, .6);
  card(ctx, W / 2, 300, ['ABANDONADA'], { t: prog(t, 52.95, 53.3) * (1 - prog(t, 54.8, 54.9)), size: 96, col: C.red });
  card(ctx, W / 2, 300, ['SÍMBOLO DA', 'AMBIÇÃO HUMANA'], { t: prog(t, 54.95, 55.3), size: 76, size2: 58 });
});

// 11. unsolved mystery — ruin at night
scene(58.39, (ctx, t) => {
  sky(ctx, '#0E1420', '#2E3248', t);
  ctx.fillStyle = '#F4EBD0'; ctx.beginPath(); ctx.arc(820, 380, 90, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(244,235,208,.12)'; ctx.beginPath(); ctx.arc(820, 380, 160, 0, 7); ctx.fill();
  for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,240,210,${.2 + .5 * rnd(i)})`; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 9) * 1000, 2, 0, 7); ctx.fill(); }
  ctx.save(); ctx.filter = 'none'; tower(ctx, W / 2, 1600, 1.0, 8.5, { ruin: .7 }); ctx.restore(); fill(ctx, 'rgba(20,25,45,.45)');
  ground(ctx, 1600, '#3A3A48', '#2A2A36');
  const k = pop(t, 58.6, .4); text(ctx, '?', W / 2, 820 + Math.sin(t * 3) * 14, { size: 360 * k, weight: 900, color: C.gold, stroke: 22, strokeColor: '#24150C' });
  headline(ctx, 'MISTÉRIO', 'NÃO RESOLVIDO', prog(t, 58.55, 59.0), { y: 250, size: 130, c2: C.gold });
});

// 12. just a legend told over the centuries? — storyteller by the fire
scene(60.87, (ctx, t) => {
  sky(ctx, '#140D0A', '#2B1A12', t);
  const fl = 1 + .08 * Math.sin(t * 18) + .05 * Math.sin(t * 31);
  const g = ctx.createRadialGradient(540, 1500, 20, 540, 1500, 900 * fl); g.addColorStop(0, 'rgba(255,170,80,.55)'); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // smoke shaped like tower
  ctx.save(); ctx.globalAlpha = .35 + .1 * Math.sin(t * 2); tower(ctx, 540, 1250, .45, 10, {}); ctx.restore();
  bust(ctx, 270, 1500, .95, { skin: SK.b, skin2: SK.b2, hair: '#D8D8D8', hairStyle: 'long', beard: 'long', beardCol: '#ECECE8', robe: '#6E4228', hood: '#4A3020', wrinkles: true, talk: Math.abs(Math.sin(t * 9)), blink: blink(t), look: .8 });
  // kids
  for (let i = 0; i < 3; i++) fig(ctx, 760 + i * 110, 1820, .75, { robe: ROBES[i + 3], skin: SKINS[i], hair: '#2A1A10', dir: -1 });
  // fire
  ctx.fillStyle = '#5A3A22'; ctx.fillRect(470, 1700, 140, 24); ctx.fillStyle = '#FF8A2A'; ctx.beginPath(); ctx.moveTo(480, 1700); ctx.quadraticCurveTo(540, 1520 - 40 * fl, 600, 1700); ctx.fill(); ctx.fillStyle = '#FFD25A'; ctx.beginPath(); ctx.moveTo(505, 1700); ctx.quadraticCurveTo(540, 1590 - 30 * fl, 575, 1700); ctx.fill();
  headline(ctx, 'APENAS', 'UMA LENDA?', prog(t, 62.39, 62.8), { y: 300, size: 140, c2: C.gold });
});

// 13. advanced lost civilization?
scene(65.2, (ctx, t) => {
  sky(ctx, '#070B18', '#16203A', t);
  for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(200,230,255,${.2 + .6 * Math.abs(Math.sin(t + i))})`; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 9) * H, 1.5 + rnd(i + 2) * 2, 0, 7); ctx.fill(); }
  tower(ctx, W / 2, 1700, 1.0, 12, { lit: true, t, glow: prog(t, 67.36, 68.2) });
  // circuit lines climbing the tower
  ctx.strokeStyle = 'rgba(120,220,255,.8)'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { const p = ((t * .4 + i / 6) % 1); ctx.beginPath(); ctx.moveTo(540 + (i - 2.5) * 110, 1700); ctx.lineTo(540 + (i - 2.5) * 110 * (1 - p), 1700 - p * 1300); ctx.stroke(); }
  // orbiting symbols
  for (let i = 0; i < 8; i++) { const a = t * .6 + i / 8 * 7; glyph(ctx, 540 + Math.cos(a) * 420, 700 + Math.sin(a) * 160, .9, 'rgba(160,235,255,.9)'); }
  ctx.fillStyle = '#0A0E1A'; ctx.fillRect(-300, 1700, W + 600, 700);
  card(ctx, W / 2, 300, ['CIVILIZAÇÃO', 'AVANÇADA?'], { t: prog(t, 67.36, 67.7), size: 90, size2: 90, col2: '#2F8AB5' });
  card(ctx, W / 2, 1560, ['PERDIDA NO TEMPO'], { t: prog(t, 68.96, 69.3), size: 60 });
});

// 14. forbidden secret: hidden or destroyed
scene(72.8, (ctx, t) => {
  vgrad(ctx, '#1E140D', '#3A2716');
  // chamber walls
  for (let r = 0; r < 18; r++) for (let c = 0; c < 6; c++) { ctx.fillStyle = (r + c) % 2 ? '#4A3420' : '#553B24'; ctx.fillRect(c * 190 - (r % 2) * 95, r * 110, 186, 106); }
  // torches
  for (const x of [120, 960]) { const fl = 1 + .1 * Math.sin(t * 20 + x); const g = ctx.createRadialGradient(x, 700, 5, x, 700, 300); g.addColorStop(0, 'rgba(255,180,80,.5)'); g.addColorStop(1, 'rgba(255,180,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, 700, 300, 0, 7); ctx.fill(); ctx.fillStyle = '#6B4423'; ctx.fillRect(x - 8, 700, 16, 120); ctx.fillStyle = '#FFB648'; ctx.beginPath(); ctx.ellipse(x, 690, 18 * fl, 36 * fl, 0, 0, 7); ctx.fill(); }
  // altar with glowing tablet
  ctx.fillStyle = '#6E5236'; rr(ctx, 290, 1300, 500, 260, 16); ctx.fill(); ctx.fillStyle = '#5A4028'; ctx.fillRect(270, 1280, 540, 40);
  const crack = prog(t, 79.47, 80.2);
  const glow = (1 - crack) * (.7 + .3 * Math.sin(t * 4));
  ctx.save(); ctx.translate(540, 1080); const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 420); g.addColorStop(0, `rgba(120,220,255,${.6 * glow})`); g.addColorStop(1, 'rgba(120,220,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 420, 0, 7); ctx.fill();
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * crack * 120, crack * crack * 200); ctx.rotate(sx * crack * .5); ctx.beginPath(); if (sx < 0) { ctx.moveTo(-150, -200); ctx.lineTo(10, -200); ctx.lineTo(-20, -60); ctx.lineTo(15, 60); ctx.lineTo(-10, 200); ctx.lineTo(-150, 200); } else { ctx.moveTo(150, -200); ctx.lineTo(10, -200); ctx.lineTo(-20, -60); ctx.lineTo(15, 60); ctx.lineTo(-10, 200); ctx.lineTo(150, 200); } ctx.closePath(); ctx.fillStyle = '#7C7A8A'; ctx.fill(); ctx.clip(); for (let i = 0; i < 5; i++) glyph(ctx, -90 + (i % 2) * 180 - sx * 0, -120 + i * 60, .6, `rgba(160,235,255,${glow + .2})`); ctx.restore(); }
  ctx.restore();
  // chains
  ctx.strokeStyle = '#8E8A84'; ctx.lineWidth = 8; for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(540 + sx * (180 + i * 40), 1000 - i * 70, 16, 10, sx * .8, 0, 7); ctx.stroke(); }
  // hiding: stone door slides down
  const hide = eio(prog(t, 78.0, 78.9)) * (1 - prog(t, 79.2, 79.4));
  if (hide > 0) { ctx.fillStyle = '#3A2716'; ctx.fillRect(-300, -300, W + 600, (H + 300) * hide); }
  card(ctx, W / 2, 300, ['SEGREDO PROIBIDO'], { t: prog(t, 74.72, 75.1) * (1 - prog(t, 77.9, 78.0)), size: 76, col: C.red });
  card(ctx, W / 2, 300, ['ESCONDIDO...'], { t: prog(t, 78.32, 78.5) * (1 - prog(t, 79.3, 79.4)), size: 84 });
  card(ctx, W / 2, 300, ['...OU DESTRUÍDO?'], { t: prog(t, 79.47, 79.8), size: 84, col: C.red });
});

// 15. archaeologists search, nothing concrete
scene(80.35, (ctx, t) => {
  sky(ctx, '#F1C27D', '#FBE6BC', t, { sun: [840, 360] });
  ground(ctx, 1000, '#E3B676', '#D29E5D');
  // excavation grid & tent
  ctx.fillStyle = '#F4EFE4'; ctx.beginPath(); ctx.moveTo(760, 1080); ctx.lineTo(900, 880); ctx.lineTo(1040, 1080); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#D9D2C2'; ctx.beginPath(); ctx.moveTo(900, 880); ctx.lineTo(1040, 1080); ctx.lineTo(940, 1080); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#B5864A'; ctx.fillRect(140, 1300, 800, 380); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(140 + i * 200, 1300); ctx.lineTo(140 + i * 200, 1680); ctx.stroke(); } for (let i = 0; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(140, 1300 + i * 190); ctx.lineTo(940, 1300 + i * 190); ctx.stroke(); }
  // a couple of foundation stones
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#9A8A70'; rr(ctx, 240 + i * 240, 1420 + (i % 2) * 80, 140, 70, 10); ctx.fill(); }
  const shrug = t > 85.95;
  [[260, 1290, '#C9A26B', SK.a], [560, 1260, '#8A6A48', SK.c], [840, 1310, '#6C7A3E', SK.b]].forEach(([x, y, robe, skin], i) => fig(ctx, x, y, 1.1, { robe, pants: '#5A4028', hat: '#8A5A33', skin, hair: '#3E2A1E', arms: shrug ? null : (i === 1 ? 'point' : 'hammer'), t: t + i, la: shrug ? -1.9 : null, ra: shrug ? 1.9 : null, mouth: shrug ? 'open' : null, glasses: i === 1 }));
  sandWind(ctx, t, .3);
  card(ctx, W / 2, 300, ['ARQUEÓLOGOS E', 'HISTORIADORES'], { t: prog(t, 81.15, 81.5) * (1 - prog(t, 85.3, 85.4)), size: 72, size2: 72, col2: C.dgreen });
  stamp(ctx, W / 2, 400, 'NADA CONCRETO', prog(t, 85.63, 85.95), { size: 92 });
});

// 16. buried under the sands of time — cross-section
scene(87.47, (ctx, t) => {
  sky(ctx, '#E39A55', '#F7D49A', t, { sun: [800, 300] });
  const sy = 760; // surface
  ctx.fillStyle = '#E3B676'; ctx.beginPath(); ctx.moveTo(-300, sy); for (let x = -300; x <= 1400; x += 40) ctx.lineTo(x, sy + Math.sin(x / 150 + 1) * 30); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill();
  // sand layers
  ['#D9A963', '#C99A58', '#B98A4E', '#A57A42'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-300, sy + 220 + i * 260); for (let x = -300; x <= 1400; x += 40) ctx.lineTo(x, sy + 220 + i * 260 + Math.sin(x / 200 + i) * 25); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill(); });
  // buried tower glowing
  const rev = prog(t, 89.87, 90.8);
  ctx.save(); ctx.globalAlpha = .35 + .5 * rev; tower(ctx, W / 2, 1900, .85, 9, { ruin: .5, lit: rev > .5, t }); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, 1450, 20, W / 2, 1450, 600); g.addColorStop(0, `rgba(255,214,120,${.4 * rev})`); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 700, W, 1300);
  // lone traveler on the surface
  fig(ctx, lerp(-100, 1180, prog(t, 87.5, 91.8)), sy + 10, .55, { robe: '#3A2A20', hood: '#4A3424', skin: '#3A2A20', walk: t * 7, staff: true, arms: 'staff' });
  // falling sand grains
  for (let i = 0; i < 60; i++) { const p = ((t * .5 + rnd(i)) % 1); ctx.fillStyle = 'rgba(240,210,150,.7)'; ctx.beginPath(); ctx.arc(rnd(i + 5) * W, sy + p * 1200, 3, 0, 7); ctx.fill(); }
  headline(ctx, 'SOB AS AREIAS', 'DO TEMPO?', prog(t, 90.43, 90.8), { y: 250, size: 110, c2: '#FF5A4D' });
});

// 17. end card
scene(91.8, (ctx, t) => {
  vgrad(ctx, '#1A120B', '#2B1D12');
  rays(ctx, W / 2, 1000, 1400, 24, t * .15, C.gold, .08);
  const k = pop(t, 91.8, .5);
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k);
  for (const [dx, a] of [[-70, 1], [70, .55]]) { ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0); ctx.fillStyle = C.ocean; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 50, 120, 0, 0, 7); ctx.moveTo(-120, 0); ctx.lineTo(120, 0); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  text(ctx, 'MUNDO PARALELO', W / 2, 700, { size: 104 * pop(t, 91.95, .4), weight: 900, color: '#fff' });
  ctx.fillStyle = C.gold; const lw = 520 * eo(prog(t, 92.15, 92.55)); ctx.fillRect(W / 2 - lw / 2, 772, lw, 8);
  text(ctx, 'COMENTE SUA TEORIA 👇'.replace(' 👇', ''), W / 2, 840, { size: 50, weight: 800, color: C.gold, ls: 3 });
  const tp = eback(prog(t, 92.4, 92.9));
  if (tp > 0) {
    ctx.save(); ctx.translate(W / 2, 1230); ctx.scale(tp, tp); ctx.rotate(-.02);
    shadow(ctx, 50, 25, .5); ctx.fillStyle = '#E9A65E'; rr(ctx, -420, -240, 840, 480, 30); ctx.fill(); noShadow(ctx);
    ctx.save(); rr(ctx, -420, -240, 840, 480, 30); ctx.clip(); vgrad(ctx, '#E9A65E', '#F8E1AE'); tower(ctx, 0, 300, .42, 12, {}); text(ctx, '?', 300, 60, { size: 200, weight: 900, color: '#FF5A4D', stroke: 14, strokeColor: '#24150C' });
    ctx.fillStyle = 'rgba(20,10,5,.75)'; ctx.fillRect(-420, -240, 840, 110); text(ctx, 'MISTÉRIOS DA HUMANIDADE', 0, -185, { size: 50, weight: 900, color: '#fff' });
    ctx.restore(); ctx.restore();
    const pk = (1 + .08 * Math.sin(t * 8)) * pop(t, 92.9, .35);
    ctx.save(); ctx.translate(W / 2, 1720); ctx.scale(pk, pk); ctx.fillStyle = C.red; rr(ctx, -340, -70, 680, 140, 70); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-270, -32); ctx.lineTo(-270, 32); ctx.lineTo(-215, 0); ctx.closePath(); ctx.fill();
    text(ctx, 'SIGA O CANAL', 35, 4, { size: 54, weight: 900, color: '#fff' }); ctx.restore();
  }
  fill(ctx, `rgba(0,0,0,${prog(t, 95.3, 95.8)})`);
}, { noZoom: true });

// ---------------- captions ----------------
const words = JSON.parse(fs.readFileSync(process.env.WORDS, 'utf8')).filter(w => w.s < 91.75);
const KEY = new Set(['cinco', 'mistérios', 'humanidade', 'nunca', 'explicou', 'torre', 'babel', 'fascinantes', 'misteriosas', 'antiguidade', 'remota', 'mesma', 'língua', 'idioma', 'perfeito', 'ambição', 'limites', 'gigantesca', 'céu', 'deuses', 'força', 'total', 'pedras', 'empilhadas', 'crescia', 'repente', 'inexplicável', 'línguas', 'confundidas', 'impossível', 'caos', 'ordens', 'perdidas', 'planos', 'destruídos', 'grandioso', 'parou', 'dias', 'abandonada', 'símbolo', 'mistério', 'resolvido', 'lenda', 'séculos', 'pista', 'civilização', 'avançada', 'tempo', 'compreensão', 'segredo', 'proibido', 'conhecimento', 'poderoso', 'escondido', 'destruído', 'arqueólogos', 'historiadores', 'colossal', 'nada', 'concreto', 'enterrado', 'areias']);
const clean = (s) => s.toLowerCase().replace(/[.,!?…]/g, '');
const chunks = []; { let cur = []; const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  words.forEach((w) => { const txt = cur.map(x => x.w).join(' '); if (cur.length && (cur.length >= 3 || (txt + ' ' + w.w).length > 18 || w.s - cur[cur.length - 1].s > .9)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.w)) flush(); }); flush(); }
chunks.forEach((c, i) => { c.s = c[0].s; const nx = chunks[i + 1]; c.e = Math.min(nx ? nx[0].s : 91.75, c[c.length - 1].s + 1.2); });
function captions(ctx, t) {
  if (t >= 91.75) return;
  const c = chunks.find(c => t >= c.s - .02 && t < c.e); if (!c) return;
  const k = c.s < .1 ? 1 : eback(prog(t, c.s - .02, c.s + .14)); const size = 84;
  const parts = c.map(w => ({ w: w.w.toUpperCase().replace(/[.,]$/, ''), key: KEY.has(clean(w.w)) }));
  L.font(ctx, size, 900); const sp = size * .28; const widths = parts.map(p => ctx.measureText(p.w).width); const tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  const sc = Math.min(1, 960 / tot); ctx.save(); ctx.translate(W / 2, 1395); ctx.scale(k * sc, k * sc); let x = -tot / 2;
  parts.forEach((p, i) => { const cx = x + widths[i] / 2; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8; text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF', stroke: 16, strokeColor: '#24150C' }); ctx.restore(); text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF' }); x += widths[i] + sp; });
  ctx.restore();
}

// ---------------- render ----------------
const FPS = 30, DUR = 95.8;
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
  if (mode === 'stills') { for (const ts of process.argv.slice(3).map(Number)) { frame(ts); fs.writeFileSync(`${process.env.OUT}/k_${ts.toFixed(2).padStart(6, '0')}.jpg`, cv.toBuffer('image/jpeg', 80)); } }
  else {
    const [a, b, out] = [+process.argv[3], +process.argv[4], process.argv[5]];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    (async () => { for (let f = a; f < b; f++) { frame(f / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  }
}
