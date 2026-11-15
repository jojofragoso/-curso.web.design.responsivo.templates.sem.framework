// "Os 7 objetos bíblicos sumidos" — Arca de Noé + Tumba de Moisés
const L = require('./lib');
const { W, H, C, clamp, lerp, prog, eo, eio, eback, pop, rnd, rr, shadow, noShadow, text, fitText, paperBg, finish, rays, card, stamp, calendar, tomb, createCanvas } = L;
const K = require('./chars');
const { SK, bust, fig, elephant, giraffe, lion, sheep, dove, ark, mountains, cloud, rainbow, pyramid, scroll } = K;
const d3 = require('d3-geo'); const topo = require('topojson-client');
const fs = require('fs'); const { spawn } = require('child_process');

const world = require('world-atlas/countries-50m.json');
const countries = topo.feature(world, world.objects.countries).features;
const turkey = countries.find(f => f.id === '792');
const blink = (t, seed = 0) => { const p = (t + seed * 1.37) % 3.3; return p < .14 ? Math.sin(p / .14 * Math.PI) : 0; };
const fill = (ctx, c) => { ctx.fillStyle = c; ctx.fillRect(-300, -300, W + 600, H + 600); };
const vgrad = (ctx, a, b) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); };
function headline(ctx, l1, l2, t, o = {}) { // big 2-line title like the reference screenshots
  if (t <= 0) return; const y = o.y || 330;
  ctx.save(); ctx.globalAlpha *= clamp(t * 4);
  for (const [s, yy, col, i] of [[l1, y, o.c1 || '#FFFFFF', 0], [l2, y + 125, o.c2 || C.gold, 1]]) {
    if (!s) continue; const k = eback(clamp(t * 1.6 - i * .3)); if (k <= 0) continue;
    const size = fitText(ctx, s, 960, o.size || 130, 900);
    ctx.save(); ctx.translate(W / 2, yy); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
    text(ctx, s, 0, 0, { size, weight: 900, color: col, stroke: 18, strokeColor: '#24150C' }); ctx.restore();
    ctx.save(); ctx.translate(W / 2, yy); ctx.scale(k, k); text(ctx, s, 0, 0, { size, weight: 900, color: col }); ctx.restore();
  }
  ctx.restore();
}
function rain(ctx, t, a = 1) { ctx.save(); ctx.strokeStyle = `rgba(200,220,240,${.45 * a})`; ctx.lineWidth = 4; for (let i = 0; i < 120; i++) { const x = (rnd(i) * 1400 + t * 300) % 1400 - 200, y = (rnd(i + 50) * 2100 + t * 2600) % 2100 - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 60); ctx.stroke(); } ctx.restore(); }
function sand(ctx, t, a = 1) { ctx.save(); for (let i = 0; i < 90; i++) { const x = ((rnd(i) * 1400 + t * (400 + rnd(i + 3) * 500)) % 1400) - 160, y = rnd(i + 9) * H; ctx.fillStyle = `rgba(230,190,120,${.5 * a})`; ctx.beginPath(); ctx.ellipse(x, y, 16, 3, 0, 0, 7); ctx.fill(); } ctx.restore(); }
function desert(ctx, t, o = {}) {
  vgrad(ctx, o.sky1 || '#F2B46B', o.sky2 || '#F7DFA7');
  const sy = o.sunY || 760; ctx.fillStyle = 'rgba(255,240,190,.9)'; ctx.beginPath(); ctx.arc(o.sunX || 760, sy, 150, 0, 7); ctx.fill();
  ctx.fillStyle = '#E3B676'; ctx.beginPath(); ctx.moveTo(-300, 1150); ctx.quadraticCurveTo(300, 1020, 700, 1120); ctx.quadraticCurveTo(1000, 1180, 1400, 1080); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill();
  ctx.fillStyle = '#D29E5D'; ctx.beginPath(); ctx.moveTo(-300, 1400); ctx.quadraticCurveTo(400, 1280, 1400, 1450); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill();
}
const ROBES = ['#8E5A38', '#B5651D', '#6C7A3E', '#A0522D', '#7B5E57', '#C08A3E', '#5D6D7E', '#9C4A3A'];
const SKINS = [SK.a, SK.b, SK.c, SK.b, SK.a, SK.c];

const S = []; const scene = (start, fn, o = {}) => S.push({ start, fn, ...o });

// 0. HOOK — vault with 7 empty pedestals lighting up, guard with flashlight
scene(0, (ctx, t) => {
  vgrad(ctx, '#0D0A08', '#24180F');
  // back wall bricks
  ctx.fillStyle = 'rgba(255,220,160,.04)'; for (let r = 0; r < 26; r++) for (let c = 0; c < 8; c++) rr(ctx, c * 150 - (r % 2) * 75, r * 75, 140, 65, 6), ctx.fill();
  const pos = [[180, 820], [540, 820], [900, 820], [180, 1180], [540, 1180], [900, 1180], [800, 1720]];
  // camera push in
  ctx.save(); const z = lerp(1, 1.12, eio(prog(t, 0, 2.6))); ctx.translate(W / 2, 1100); ctx.scale(z, z); ctx.translate(-W / 2, -1100);
  pos.forEach(([x, y], i) => {
    const on = prog(t, .1 + i * .3, .35 + i * .3);
    if (on > 0) { const g = ctx.createLinearGradient(x, y - 700, x, y); g.addColorStop(0, `rgba(255,220,140,0)`); g.addColorStop(1, `rgba(255,220,140,${.35 * on})`); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 30, y - 700); ctx.lineTo(x + 30, y - 700); ctx.lineTo(x + 150, y - 60); ctx.lineTo(x - 150, y - 60); ctx.closePath(); ctx.fill(); }
    // pedestal
    ctx.fillStyle = '#5A4330'; rr(ctx, x - 90, y - 60, 180, 200, 10); ctx.fill(); ctx.fillStyle = '#6E543D'; rr(ctx, x - 110, y - 80, 220, 34, 8); ctx.fill();
    // glass case
    ctx.strokeStyle = `rgba(200,230,255,${.25 + .4 * on})`; ctx.lineWidth = 5; ctx.strokeRect(x - 85, y - 290, 170, 210); ctx.fillStyle = 'rgba(200,230,255,.06)'; ctx.fillRect(x - 85, y - 290, 170, 210);
    if (on > .3) text(ctx, '?', x, y - 185 + Math.sin(t * 4 + i) * 10, { size: 110 * eback(prog(t, .2 + i * .3, .5 + i * .3)), weight: 900, color: C.gold });
    text(ctx, '' + (i + 1), x, y + 40, { size: 50, weight: 900, color: 'rgba(242,193,78,.8)' });
  });
  ctx.restore();
  // guard walking in with flashlight, shocked
  const gx = lerp(-200, 170, eo(prog(t, .4, 1.6)));
  fig(ctx, gx, 1880, 1.6, { robe: '#2F3E5C', hat: '#1F2A40', skin: SK.b, walk: t < 1.6 ? t * 10 : null, mouth: t > 1.6 ? 'open' : null, ra: -1.3, la: .2 });
  if (t > .4) { ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = '#FFF2C0'; ctx.beginPath(); ctx.moveTo(gx + 150, 1880 - 330); ctx.lineTo(gx + 900, 1880 - 760); ctx.lineTo(gx + 900, 1880 - 300); ctx.closePath(); ctx.fill(); ctx.restore(); }
  headline(ctx, '7 OBJETOS BÍBLICOS', 'SUMIDOS ATÉ HOJE', prog(t, .05, .6), { y: 250, size: 104 });
}, { noZoom: true });

// 1. Nº3 — the ark in the storm
scene(2.64, (ctx, t) => {
  vgrad(ctx, '#1C2733', '#3B4F5E');
  const fl = (t > 3.2 && t < 3.3) || (t > 3.45 && t < 3.5); if (fl) fill(ctx, 'rgba(255,255,255,.6)');
  for (let i = 0; i < 4; i++) cloud(ctx, ((i * 330 + t * 60) % 1500) - 200, 300 + (i % 2) * 80, 1.6, 'rgba(40,50,62,.95)');
  if (fl) { ctx.strokeStyle = '#FFF6C9'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(760, 360); ctx.lineTo(700, 560); ctx.lineTo(760, 560); ctx.lineTo(680, 820); ctx.stroke(); }
  // sea waves
  const sea = (y, c, a, sp) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-300, 2300); for (let x = -300; x <= 1400; x += 30) ctx.lineTo(x, y + Math.sin(x / 90 + t * sp) * a); ctx.lineTo(1400, 2300); ctx.fill(); };
  sea(1250, '#2E5A70', 30, 2);
  ark(ctx, W / 2, 1230 + Math.sin(t * 2) * 15, 1.05, { rot: Math.sin(t * 1.6) * .04 });
  sea(1330, '#1F4558', 40, 2.6);
  rain(ctx, t);
  headline(ctx, 'Nº 3', 'A ARCA DE NOÉ', prog(t, 2.7, 3.2), { y: 420, size: 150 });
}, { noZoom: true });

// 2. Bible opening, ark pops out
scene(4.16, (ctx, t) => {
  paperBg(ctx, '#F2E2BF', '#D9BE8C');
  rays(ctx, W / 2, 1050, 1300, 22, t * .2, C.gold, .2 * prog(t, 4.5, 5));
  const op = eo(prog(t, 4.2, 4.9));
  ctx.save(); ctx.translate(W / 2, 1150);
  shadow(ctx, 40, 20, .35); ctx.fillStyle = '#5A2E1A'; rr(ctx, -470, -300, 940, 600, 26); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = '#F7EED8'; ctx.save(); ctx.scale(op, 1); rr(ctx, 0, -280, 450, 560, 10); ctx.fill(); ctx.restore(); rr(ctx, -450, -280, 450, 560, 10); ctx.fill();
  ctx.fillStyle = 'rgba(62,42,30,.25)'; for (let i = 0; i < 9; i++) { ctx.fillRect(-410, -220 + i * 50, 360 - (i % 3) * 50, 14); if (op > .9) ctx.fillRect(40, -220 + i * 50, 340 - (i % 2) * 70, 14); }
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-6, -280, 12, 560);
  ctx.restore();
  // ark popping up from book
  const k = eback(prog(t, 4.88, 5.4));
  if (k > 0) { ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(k, k); rainbow(ctx, 0, 0, 470, .9); ark(ctx, 0, -40, .8); ctx.restore(); }
  for (let i = 0; i < 14; i++) { const a = i / 14 * 7 + t; const r = 200 + ((t * 120 + i * 40) % 400); ctx.fillStyle = `rgba(255,230,140,${.8 * prog(t, 4.9, 5.2)})`; ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * r, 950 + Math.sin(a) * r * .6, 6, 0, 7); ctx.fill(); }
  card(ctx, W / 2, 330, ['A HISTÓRIA MAIS', 'CONHECIDA DA BÍBLIA'], { t: prog(t, 5.6, 5.95), size: 72, size2: 46 });
});

// 3. Noah building the ark + family
scene(6.8, (ctx, t) => {
  vgrad(ctx, '#F3C98B', '#F7E6C0');
  mountains(ctx, 1150, [[150, 380, 320], [700, 300, 360], [1050, 420, 300]], '#C9A27A');
  ctx.fillStyle = '#B9935E'; ctx.fillRect(-300, 1150, W + 600, 900);
  const b = lerp(.15, 1.0, prog(t, 6.9, 9.2));
  ark(ctx, 600, 1230, 1.0, { build: b < .99 ? b : 1, door: true });
  // scaffolding ladder
  ctx.strokeStyle = '#7A4E2D'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(160, 1380); ctx.lineTo(230, 1050); ctx.moveTo(220, 1380); ctx.lineTo(290, 1050); ctx.stroke();
  // wood planks pile
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#9C6B3F' : '#8A5A33'; rr(ctx, 700 + i * 8, 1500 - i * 26, 280, 24, 6); ctx.fill(); }
  // Noah hammering (full body)
  fig(ctx, 330, 1640, 1.55, { robe: '#7B5E57', belt: '#3E2A1E', skin: SK.a, hair: '#EDEDED', beard: '#F4F4F2', longBeard: true, arms: 'hammer', t });
  if (Math.sin(t * 9) > .95) { ctx.fillStyle = C.gold; for (let i = 0; i < 6; i++) { const a = i; ctx.beginPath(); ctx.arc(420 + Math.cos(a) * 40, 1220 + Math.sin(a) * 40, 6, 0, 7); ctx.fill(); } }
  // family appears
  const fam = [[640, '#B5651D', SK.a, '#5A3A22', 0], [760, '#6C7A3E', SK.b, '#2A1A10', 1], [870, '#A0522D', SK.a, '#3E2A1E', 2], [980, '#5D6D7E', SK.c, '#2A1A10', 3]];
  fam.forEach(([x, robe, skin, hair, i]) => { const k = eback(prog(t, 9.3 + i * .12, 9.6 + i * .12)); if (k <= 0) return; fig(ctx, x, 1760, 1.1 * k, { robe, skin, hair, arms: i === 1 ? 'up' : 'down', t, dir: -1 }); });
  card(ctx, W / 2, 300, ['SEGUNDO RELATOS...'], { t: prog(t, 6.9, 7.2) * (1 - prog(t, 8.6, 8.8)), size: 66 });
  card(ctx, W / 2, 300, ['SALVAR SUA FAMÍLIA'], { t: prog(t, 9.3, 9.6), size: 70, col: C.dgreen });
});

// 4. animals boarding in pairs
scene(10.58, (ctx, t) => {
  vgrad(ctx, '#8EB9C9', '#EAD8B0');
  cloud(ctx, 260 + t * 20, 330, 1.2); cloud(ctx, 860 - t * 15, 460, .9);
  ctx.fillStyle = '#9DBF6E'; ctx.fillRect(-300, 1250, W + 600, 900);
  ark(ctx, 820, 1180, 1.25, { door: true });
  // ramp
  ctx.fillStyle = '#7A4E2D'; ctx.beginPath(); ctx.moveTo(640, 1180); ctx.lineTo(800, 1180); ctx.lineTo(560, 1520); ctx.lineTo(340, 1520); ctx.closePath(); ctx.fill();
  const lt = t - 10.58; const parade = [[elephant, .55, 0], [elephant, .5, 1], [giraffe, .6, 2], [giraffe, .55, 3], [lion, .7, 4], [lion, .65, 5], [sheep, .8, 6], [sheep, .75, 7]];
  parade.forEach(([fn, s, i]) => { const x = 150 - i * 170 + lt * 850; const y = 1640 + (i % 2) * 70; if (x > -400 && x < 1300) fn(ctx, x, y, s, lt * 9 + i); });
  card(ctx, W / 2, 300, ['OS ANIMAIS', 'DO DILÚVIO'], { t: prog(t, 10.66, 11.0), size: 84, size2: 56, col2: C.blue });
});

// 5. waters recede, ark on Ararat, Turkey map
scene(11.62, (ctx, t) => {
  vgrad(ctx, '#A9D3E3', '#F6E7C4');
  rays(ctx, 800, 300, 1500, 18, t * .1, '#fff', .2);
  ctx.fillStyle = '#FFF0B8'; ctx.beginPath(); ctx.arc(820, 300, 120, 0, 7); ctx.fill();
  rainbow(ctx, W / 2, 1000, 650, .5 * prog(t, 12.2, 13));
  mountains(ctx, 1500, [[540, 760, 520], [100, 420, 300], [1000, 480, 330]], '#9C7A5B', '#F7F3EA');
  const wl = lerp(780, 1460, eio(prog(t, 11.7, 13.6)));
  // ark lands on the peak area
  const ay = Math.min(wl - 40, 985); ark(ctx, 540, ay + Math.sin(t * 2) * (ay < 985 ? 8 : 0), .55, { rot: ay >= 985 ? -.05 : Math.sin(t * 1.5) * .05 });
  ctx.fillStyle = 'rgba(46,110,142,.92)'; ctx.fillRect(-300, wl, W + 600, 2000);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 6; ctx.beginPath(); for (let x = -100; x < 1200; x += 40) ctx.lineTo(x, wl + Math.sin(x / 50 + t * 3) * 8); ctx.stroke();
  // dove
  const dp = prog(t, 12.6, 15); if (dp > 0 && dp < 1) dove(ctx, lerp(1200, -100, dp), 620 + Math.sin(dp * 9) * 40, 1.3, t * 14);
  card(ctx, W / 2, 330, ['MONTE ARARAT'], { t: prog(t, 13.86, 14.2) * (1 - prog(t, 14.9, 15.0)), size: 90, col: C.dbrown });
  // Turkey map card
  if (t > 14.9) {
    const k = eback(prog(t, 14.95, 15.4)); ctx.save(); ctx.translate(W / 2, 640); ctx.scale(k, k); ctx.rotate(-.02);
    shadow(ctx, 40, 18, .35); ctx.fillStyle = C.white; rr(ctx, -440, -300, 880, 600, 20); ctx.fill(); noShadow(ctx);
    const pr = d3.geoMercator().fitExtent([[-400, -230], [400, 220]], turkey); const p = d3.geoPath(pr, ctx);
    ctx.beginPath(); for (const f of countries) if (f.id !== '792') p(f); ctx.save(); ctx.beginPath(); ctx.rect(-430, -290, 860, 580); ctx.clip(); ctx.beginPath(); for (const f of countries) if (f.id !== '792') p(f); ctx.fillStyle = '#E9DDC2'; ctx.fill(); ctx.strokeStyle = '#CDBB97'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    ctx.beginPath(); p(turkey); ctx.fillStyle = C.red; ctx.fill(); ctx.strokeStyle = C.dred; ctx.lineWidth = 4; ctx.stroke();
    const [px, py] = pr([44.3, 39.7]); const pk = eback(prog(t, 15.4, 15.8));
    ctx.save(); ctx.translate(px, py); ctx.scale(pk, pk); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, -60, 32, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.dbrown; ctx.beginPath(); ctx.arc(0, -60, 12, 0, 7); ctx.fill(); ctx.restore();
    text(ctx, 'TURQUIA', -60, 150, { size: 64, weight: 900, color: C.white, stroke: 10, strokeColor: C.dred });
    ctx.restore();
  }
});

// 6. explorers through the centuries find fossil wood
scene(16.1, (ctx, t) => {
  vgrad(ctx, '#7FA9C4', '#E4EEF2');
  mountains(ctx, 1300, [[540, 900, 700]], '#8B7A6B', '#F7F7F5');
  for (let i = 0; i < 70; i++) { const x = (rnd(i) * 1300 + t * 80) % 1300 - 100, y = (rnd(i + 3) * 2000 + t * 200) % 2000; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#EEF2F3'; ctx.beginPath(); ctx.moveTo(-300, 1350); ctx.quadraticCurveTo(540, 1180, 1400, 1380); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill();
  // year counter (centuries)
  const yr = Math.round(lerp(1800, 2010, eio(prog(t, 16.2, 18.2))));
  calendar(ctx, 870, 560, .6 * pop(t, 16.2, .3), 'SÉCULOS', '' + yr, { color: C.blue });
  // three explorers climbing in line
  const lt = t - 16.1;
  [[0, '#C0392B', '#3E5B2E'], [1, '#2F5D8A', '#8A5A33'], [2, '#D68910', '#5D6D7E']].forEach(([i, robe, pack]) => {
    const x = lerp(-150, 760, clamp(lt / 3.2)) - i * 170; const y = 1560 - (x - 100) * .12;
    if (t < 18.42 || i) fig(ctx, x, y, 1.15, { robe, hat: '#6B4423', pack, skin: SKINS[i], walk: t < 18.4 ? lt * 9 + i : null, staff: true, arms: 'staff' });
  });
  // finding the wood
  if (t > 18.42) {
    const k = eback(prog(t, 18.42, 18.8)); const x = 760, y = 1480;
    fig(ctx, x, y, 1.15, { robe: '#C0392B', hat: '#6B4423', pack: '#3E5B2E', skin: SKINS[0], arms: 'up', t: 0, mouth: 'open', la: 2.4, ra: -2.4 });
    ctx.save(); ctx.translate(x, y - 470); ctx.scale(k, k); ctx.rotate(Math.sin(t * 3) * .1); ctx.fillStyle = '#5E4128'; rr(ctx, -90, -26, 180, 52, 14); ctx.fill(); ctx.strokeStyle = '#3E2A1E'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-80, -14 + i * 10); ctx.lineTo(80, -18 + i * 10); ctx.stroke(); } ctx.restore();
    rays(ctx, x, y - 470, 400, 14, t, C.gold, .3 * k);
    card(ctx, W / 2, 330, ['MADEIRA', 'FOSSILIZADA?'], { t: prog(t, 19.4, 19.7), size: 84, size2: 64, col2: C.red });
  }
});

// 7. scientist: no definitive proof
scene(20.68, (ctx, t) => {
  vgrad(ctx, '#DCE7EA', '#B9CDD3');
  // lab shelves
  ctx.fillStyle = '#9FB4BB'; ctx.fillRect(-300, 600, W + 600, 20); ctx.fillRect(-300, 900, W + 600, 20);
  ['#E5534B', '#6BBF59', '#4A90C2', '#F5D547', '#7B5EA7', '#E5534B', '#6BBF59'].forEach((c, i) => { const x = 60 + i * 150; ctx.fillStyle = 'rgba(255,255,255,.6)'; rr(ctx, x, 470 + (i % 2) * 300, 70, 130, 18); ctx.fill(); ctx.fillStyle = c; rr(ctx, x + 6, 530 + (i % 2) * 300, 58, 64, 14); ctx.fill(); const by = (t * 60 + i * 30) % 60; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(x + 35, 580 - by + (i % 2) * 300, 5, 0, 7); ctx.fill(); });
  const shake = t > 21.48 ? Math.sin(t * 14) * .5 * (1 - prog(t, 22.6, 23.0)) : 0;
  bust(ctx, W / 2 + shake * 30, 1300, 1.45, { skin: SK.a, skin2: SK.a2, hair: '#D8D8D8', hairStyle: 'ring', robe: '#F7F7F2', robe2: '#5D6D7E', wrinkles: true, blink: blink(t), brows: t > 21.4 ? 'sad' : 'neutral', mouth: t > 21.4 ? 'frown' : 'neutral', look: shake });
  // glasses
  ctx.save(); ctx.translate(W / 2 + shake * 30, 1300); ctx.scale(1.45, 1.45); ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(-42, -12, 30, 0, 7); ctx.moveTo(18, -12); ctx.arc(42, -12, 30, Math.PI, Math.PI * 3); ctx.moveTo(-12, -14); ctx.lineTo(12, -14); ctx.stroke(); ctx.restore();
  // wood sample in petri dish + microscope
  ctx.fillStyle = '#5E6B73'; rr(ctx, 760, 1520, 260, 40, 10); ctx.fill(); ctx.fillRect(860, 1330, 40, 200); ctx.save(); ctx.translate(880, 1330); ctx.rotate(-.4); rr(ctx, -30, -160, 60, 180, 20); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(220, 1560, 130, 30, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#5E4128'; rr(ctx, 160, 1530, 110, 34, 10); ctx.fill();
  stamp(ctx, W / 2, 380, 'SEM PROVA', prog(t, 21.88, 22.2), { size: 100 });
  card(ctx, W / 2, 600, ['NÃO ACEITA PELA CIÊNCIA'], { t: prog(t, 23.0, 23.3), size: 56, col: C.dred });
});

// 8. mystery among the mountains
scene(23.96, (ctx, t) => {
  vgrad(ctx, '#3D4A63', '#C7A98A');
  rainbow(ctx, W / 2, 1100, 560, .35);
  mountains(ctx, 1450, [[150, 700, 420], [900, 760, 460]], '#5E5A6E', '#E9E7EE');
  // hidden ark peeking among peaks
  ctx.save(); ctx.globalAlpha = .55 + .2 * Math.sin(t * 2); ark(ctx, 540, 1150, .5, { rot: -.08 }); ctx.restore();
  mountains(ctx, 1600, [[540, 620, 520], [-50, 500, 350], [1130, 520, 350]], '#7C7389', '#F2F0F5');
  for (let i = 0; i < 6; i++) cloud(ctx, ((i * 260 + t * (40 + i * 10)) % 1600) - 300, 1050 + (i % 3) * 140, 2.2, 'rgba(240,236,245,.55)');
  ctx.fillStyle = '#4B4A5A'; ctx.fillRect(-300, 1600, W + 600, 900);
  headline(ctx, 'LENDA', 'OU REALIDADE?', prog(t, 26.44, 26.9), { y: 330, size: 130, c2: C.gold });
  card(ctx, W / 2, 330, ['UM MISTÉRIO FASCINANTE'], { t: prog(t, 25.4, 25.7) * (1 - prog(t, 26.3, 26.4)), size: 60 });
  const q = pop(t, 28.4, .4); if (q > 0) text(ctx, '?', 840, 900 + Math.sin(t * 3) * 15, { size: 260 * q, weight: 900, color: C.gold, stroke: 18, strokeColor: '#24150C' });
});

// 9. Nº2 — tomb of Moses
scene(30.38, (ctx, t) => {
  desert(ctx, t, { sky1: '#E07B39', sky2: '#F5C77E', sunY: 1000, sunX: 540 });
  // stone tomb door in cliff
  ctx.fillStyle = '#A9744A'; ctx.beginPath(); ctx.moveTo(-300, 1500); ctx.lineTo(-300, 820); ctx.quadraticCurveTo(300, 760, 560, 1000); ctx.lineTo(560, 1500); ctx.fill();
  ctx.fillStyle = '#3E2A1E'; ctx.beginPath(); ctx.arc(250, 1300, 170, Math.PI, 0); ctx.lineTo(420, 1500); ctx.lineTo(80, 1500); ctx.fill();
  ctx.fillStyle = '#8A8178'; ctx.beginPath(); ctx.arc(250 + lerp(0, 200, eo(prog(t, 30.6, 31.4))), 1350, 160, 0, 7); ctx.fill(); ctx.strokeStyle = '#6E665E'; ctx.lineWidth = 10; ctx.stroke();
  sand(ctx, t, .8);
  headline(ctx, 'Nº 2', 'A TUMBA DE MOISÉS', prog(t, 30.45, 30.9), { y: 400, size: 150, c2: '#FF6A4D' });
}, { noZoom: true });

// 10. Moses portrait (great leader)
const MOSES = { skin: SK.b, skin2: SK.b2, hair: '#DADAD6', hairStyle: 'long', beard: 'long', beardCol: '#ECECE8', robe: '#9C3B2E', robe2: '#E6D3A8', hood: '#C9A26B', wrinkles: true, lid: .5 };
scene(31.58, (ctx, t) => {
  vgrad(ctx, '#E9A65E', '#F6D9A0');
  rays(ctx, W / 2, 1000, 1500, 22, t * .12, '#fff', .2);
  mountains(ctx, 1500, [[200, 500, 400], [880, 620, 420]], '#C98B53');
  // staff
  ctx.strokeStyle = '#6B4423'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(870, 1950); ctx.lineTo(870, 700); ctx.quadraticCurveTo(880, 600, 800, 610); ctx.stroke();
  const wind = Math.sin(t * 2) * .02;
  ctx.save(); ctx.translate(W / 2, 1180); ctx.rotate(wind); bust(ctx, 0, 0, 1.7, { ...MOSES, blink: blink(t, 1), brows: 'neutral' }); ctx.restore();
  // hand on staff
  ctx.fillStyle = SK.b; ctx.beginPath(); ctx.ellipse(870, 1250, 50, 60, 0, 0, 7); ctx.fill();
  card(ctx, W / 2, 300, ['UM DOS MAIORES', 'LÍDERES DA BÍBLIA'], { t: prog(t, 32.38, 32.7), size: 76, size2: 54 });
});

// 11. freeing the Hebrews from Egypt
scene(34.22, (ctx, t) => {
  desert(ctx, t, { sky1: '#F0A55A', sky2: '#F9DDA4', sunY: 520, sunX: 820 });
  pyramid(ctx, 260, 1150, 380); pyramid(ctx, 720, 1150, 300, '#CFA460');
  // crowd with chains breaking
  const br = prog(t, 34.94, 35.4);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) {
    const x = 110 + i * 175 + (r % 2) * 80, y = 1420 + r * 170, idx = r * 6 + i;
    const cheer = br > .5; const j = cheer ? Math.abs(Math.sin(t * 7 + idx)) * 25 : 0;
    fig(ctx, x, y - j, 1.0, { robe: ROBES[idx % 8], skin: SKINS[idx % 6], hair: '#2A1A10', beard: idx % 3 === 0 ? '#2A1A10' : null, arms: cheer ? 'up' : 'down', t: t + idx * .3, la: cheer ? null : .6, ra: cheer ? null : -.6, mouth: cheer ? 'open' : null });
    if (!cheer || br < 1) { ctx.save(); ctx.globalAlpha = 1 - br; ctx.strokeStyle = '#6E6963'; ctx.lineWidth = 8; ctx.setLineDash([14, 8]); ctx.beginPath(); ctx.moveTo(x - 25, y - 105); ctx.lineTo(x + 25, y - 105); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  }
  // chain links flying
  if (br > 0 && br < 1) for (let i = 0; i < 20; i++) { const a = rnd(i) * 7; ctx.strokeStyle = '#8E8A84'; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(540 + Math.cos(a) * br * 600, 1500 + Math.sin(a) * br * 500 - br * 200, 14, 9, a, 0, 7); ctx.stroke(); }
  card(ctx, W / 2, 300, ['LIBERTOU O POVO HEBREU'], { t: prog(t, 34.94, 35.3), size: 64 });
  card(ctx, W / 2, 470, ['DA ESCRAVIDÃO NO EGITO'], { t: prog(t, 36.22, 36.5), size: 52, col: C.dred, rot: .02 });
});

// 12. leading to the promised land
scene(37.42, (ctx, t) => {
  desert(ctx, t, { sky1: '#F2B46B', sky2: '#FBE9C0', sunY: 980, sunX: 900 });
  // promised land: green hills on horizon
  const g = prog(t, 38.2, 38.8); ctx.save(); ctx.globalAlpha = g; ctx.fillStyle = '#7DB46C'; ctx.beginPath(); ctx.moveTo(620, 1140); ctx.quadraticCurveTo(820, 980, 1000, 1080); ctx.quadraticCurveTo(1100, 1020, 1400, 1100); ctx.lineTo(1400, 1160); ctx.lineTo(620, 1160); ctx.fill();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = '#4E8A42'; ctx.beginPath(); ctx.arc(760 + i * 70, 1080 - (i % 2) * 20, 30, 0, 7); ctx.fill(); } ctx.restore();
  rays(ctx, 900, 1060, 900, 16, t * .2, '#fff', .25 * g);
  const lt = t - 37.42;
  // Moses leading, crowd following (walking right)
  for (let i = 11; i >= 0; i--) {
    const x = 640 - i * 95 + lt * 60 - (i ? 60 : 0), y = 1500 + (i % 3) * 60 - (i ? 0 : 30);
    if (i === 0) fig(ctx, x, y, 1.35, { robe: '#9C3B2E', hood: '#C9A26B', beard: '#ECECE8', longBeard: true, skin: SK.b, walk: lt * 7, arms: 'staff' });
    else fig(ctx, x, y, 1.05, { robe: ROBES[i % 8], skin: SKINS[i % 6], hair: '#2A1A10', beard: i % 4 === 0 ? '#3E2A1E' : null, walk: lt * 7 + i });
  }
  sand(ctx, t, .5);
  card(ctx, W / 2, 330, ['RUMO À', 'TERRA PROMETIDA'], { t: prog(t, 38.3, 38.6), size: 70, size2: 64, col2: C.dgreen });
});

// 13. a detail: tomb never found
scene(39.18, (ctx, t) => {
  desert(ctx, t, { sky1: '#C86A3A', sky2: '#F1BF7A', sunY: 600, sunX: 260 });
  // archaeologist digging, finds nothing
  const dig = Math.max(0, Math.sin(t * 6));
  ctx.fillStyle = '#9C6B3F'; ctx.beginPath(); ctx.ellipse(620, 1560, 260, 70, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#5E4128'; ctx.beginPath(); ctx.ellipse(620, 1560, 200, 46, 0, 0, 7); ctx.fill();
  const shrug = t > 41.6;
  fig(ctx, 330, 1640, 1.5, { robe: '#C9A26B', hat: '#8A5A33', skin: SK.a, hair: '#3E2A1E', beard: '#3E2A1E', arms: shrug ? null : 'hammer', t, la: shrug ? -1.9 : null, ra: shrug ? 1.9 : null, mouth: shrug ? 'open' : null });
  if (!shrug) { ctx.save(); ctx.translate(380, 1360); ctx.rotate(-1.2 + dig); ctx.strokeStyle = '#6B4423'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 200); ctx.stroke(); ctx.fillStyle = '#8E8A84'; ctx.beginPath(); ctx.ellipse(0, 220, 30, 40, 0, 0, 7); ctx.fill(); ctx.restore(); }
  if (dig > .9) for (let i = 0; i < 8; i++) { ctx.fillStyle = '#B98A55'; ctx.beginPath(); ctx.arc(620 + (rnd(i + Math.floor(t * 6)) - .5) * 300, 1450 - rnd(i * 3) * 150, 10, 0, 7); ctx.fill(); }
  if (shrug) text(ctx, '?', 330, 1000 + Math.sin(t * 4) * 12, { size: 200 * pop(t, 41.6, .3), weight: 900, color: '#FFF', stroke: 16, strokeColor: '#24150C' });
  card(ctx, W / 2, 330, ['UM DETALHE', 'CHAMA ATENÇÃO'], { t: prog(t, 39.58, 39.9) * (1 - prog(t, 40.9, 41.0)), size: 76, size2: 56 });
  headline(ctx, 'NUNCA FOI', 'ENCONTRADA', prog(t, 41.6, 42.0), { y: 330, size: 130, c2: '#FF6A4D' });
});

// 14. Deuteronomy scroll -> buried by God in a valley
scene(42.64, (ctx, t) => {
  paperBg(ctx, '#EAD3A2', '#C9A66B');
  const v = prog(t, 45.6, 46.0);
  if (v < 1) { ctx.save(); ctx.globalAlpha = 1 - v; scroll(ctx, W / 2, 950, 760, 560, eo(prog(t, 42.7, 43.4)), 'DEUTERONÔMIO 34');
    // highlight
    if (t > 44.3) { ctx.fillStyle = 'rgba(242,193,78,.5)'; ctx.fillRect(W / 2 - 310, 950 - 280 + 168, 600 * prog(t, 44.3, 45.0), 34); }
    ctx.restore(); }
  if (v > 0) {
    ctx.save(); ctx.globalAlpha = v;
    vgrad(ctx, '#3E3550', '#C79B6D');
    mountains(ctx, 1500, [[-50, 900, 520], [1130, 950, 540]], '#6E5A6A');
    mountains(ctx, 1600, [[150, 600, 380], [930, 640, 380]], '#8C6E6E');
    ctx.fillStyle = '#A88466'; ctx.beginPath(); ctx.moveTo(-300, 1600); ctx.quadraticCurveTo(540, 1480, 1400, 1600); ctx.lineTo(1400, 2300); ctx.lineTo(-300, 2300); ctx.fill();
    // divine light into valley
    const g = ctx.createLinearGradient(0, 0, 0, 1550); g.addColorStop(0, 'rgba(255,240,190,.75)'); g.addColorStop(1, 'rgba(255,240,190,.08)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(470, -100); ctx.lineTo(610, -100); ctx.lineTo(760, 1560); ctx.lineTo(320, 1560); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(255,245,210,.8)'; ctx.beginPath(); ctx.arc(420 + rnd(i) * 240, ((rnd(i + 4) * 1500) + t * 120) % 1500, 4, 0, 7); ctx.fill(); }
    // small grave mound with stones
    ctx.fillStyle = '#7A5C44'; ctx.beginPath(); ctx.ellipse(540, 1560, 130, 40, 0, Math.PI, 0); ctx.fill();
    card(ctx, W / 2, 300, ['ENTERRADO POR DEUS', 'EM UM VALE'], { t: prog(t, 46.4, 46.7), size: 64, size2: 50 });
    ctx.restore();
  }
});

// 15. nobody knows the exact place: map with many ?
scene(47.44, (ctx, t) => {
  paperBg(ctx, '#EAD3A2', '#C9A66B');
  // hand-drawn old map
  ctx.save(); ctx.translate(W / 2, 950); ctx.rotate(-.02); shadow(ctx, 40, 18, .3); ctx.fillStyle = '#F1E2BC'; rr(ctx, -470, -560, 940, 1120, 20); ctx.fill(); noShadow(ctx);
  ctx.strokeStyle = 'rgba(122,78,45,.6)'; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
  ctx.beginPath(); ctx.moveTo(-380, 380); ctx.bezierCurveTo(-200, 100, 50, 300, 120, -60); ctx.bezierCurveTo(180, -300, 300, -320, 360, -440); ctx.stroke(); ctx.setLineDash([]);
  for (const [x, y] of [[-300, -300], [-120, -420], [200, 120], [-260, 120], [330, 360]]) { ctx.fillStyle = 'rgba(122,78,45,.5)'; ctx.beginPath(); ctx.moveTo(x - 60, y + 40); ctx.lineTo(x, y - 50); ctx.lineTo(x + 60, y + 40); ctx.closePath(); ctx.fill(); }
  text(ctx, 'MONTE NEBO', 140, -140, { size: 34, weight: 800, color: C.brown });
  // question pins
  for (let i = 0; i < 9; i++) { const k = eback(prog(t, 47.6 + i * .25, 47.9 + i * .25)); if (k <= 0) continue; const x = -380 + rnd(i + 1) * 760, y = -420 + rnd(i + 20) * 820; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, -50, 34, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); text(ctx, '?', 0, -52, { size: 40, weight: 900, color: '#fff' }); ctx.restore(); }
  ctx.restore();
  // magnifier sweeping
  const a = t * 1.6, mx = W / 2 + Math.cos(a) * 260, my = 950 + Math.sin(a * 1.3) * 360;
  ctx.strokeStyle = C.dbrown; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(mx, my, 150, 0, 7); ctx.stroke(); ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx + 110, my + 110); ctx.lineTo(mx + 240, my + 240); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(mx, my, 140, 0, 7); ctx.fill();
  headline(ctx, 'LOCAL', 'DESCONHECIDO', prog(t, 48.3, 48.7), { y: 230, size: 120, c2: '#FF6A4D' });
});

// 16. hidden on purpose to prevent idolatry
scene(51.14, (ctx, t) => {
  desert(ctx, t, { sky1: '#B85C38', sky2: '#EFB676', sunY: 640, sunX: 540 });
  // tomb + sand storm hiding it
  const hide = eio(prog(t, 52.1, 53.2));
  ctx.fillStyle = '#8A7A6A'; rr(ctx, 360, 1000, 360, 260, 20); ctx.fill(); ctx.fillStyle = '#3E2A1E'; ctx.beginPath(); ctx.arc(540, 1180, 80, Math.PI, 0); ctx.lineTo(620, 1260); ctx.lineTo(460, 1260); ctx.fill();
  ctx.fillStyle = '#E3B676'; ctx.beginPath(); ctx.moveTo(200, 1300); ctx.quadraticCurveTo(540, 1300 - hide * 420, 880, 1300); ctx.fill();
  sand(ctx, t * 2, prog(t, 51.9, 52.3) * (1 - prog(t, 53.4, 53.8)) * 1.8 + .3);
  const ido = prog(t, 53.8, 54.3);
  // crowd kneeling to a golden idol ghost (what was prevented)
  if (ido > 0) {
    ctx.save(); ctx.globalAlpha = ido;
    ctx.fillStyle = 'rgba(30,15,5,.45)'; fill(ctx, 'rgba(30,15,5,.45)');
    rays(ctx, 540, 1000, 900, 18, t * .4, C.gold, .35);
    ctx.fillStyle = C.gold; rr(ctx, 400, 960, 280, 300, 30); ctx.fill(); ctx.fillStyle = C.dgold; ctx.fillRect(400, 1200, 280, 60); text(ctx, 'TUMBA', 540, 1080, { size: 54, weight: 900, color: C.dbrown });
    for (let i = 0; i < 7; i++) { const x = 120 + i * 140, y = 1650 + (i % 2) * 40; const bow = Math.max(0, Math.sin(t * 4 + i)) * .5; ctx.save(); ctx.translate(x, y); ctx.rotate(-bow * (x < 540 ? -1 : 1) * 0 + bow); fig(ctx, 0, 0, .95, { robe: ROBES[i], skin: SKINS[i % 6], hair: '#2A1A10', arms: 'up', t: t + i }); ctx.restore(); }
    // prohibited sign
    const x = prog(t, 54.9, 55.3); if (x > 0) { ctx.save(); ctx.translate(540, 1110); ctx.scale(eback(x), eback(x)); ctx.strokeStyle = C.red; ctx.lineWidth = 40; ctx.beginPath(); ctx.arc(0, 0, 330, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-233, -233); ctx.lineTo(233, 233); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }
  card(ctx, W / 2, 330, ['OCULTADA DE PROPÓSITO?'], { t: prog(t, 52.1, 52.4) * (1 - prog(t, 53.7, 53.8)), size: 64, col: C.dred });
  card(ctx, W / 2, 330, ['PARA EVITAR IDOLATRIA'], { t: prog(t, 54.74, 55.0), size: 64, col: C.dred });
});

// 17. Moses walking into the sunset, fading
scene(55.94, (ctx, t) => {
  desert(ctx, t, { sky1: '#8E3B2E', sky2: '#F2A65A', sunY: 1060, sunX: 540 });
  rays(ctx, 540, 1060, 1500, 22, t * .1, '#FFE3A0', .2);
  const lt = t - 55.94, f = 1 - prog(t, 58.4, 59.6) * .85;
  ctx.save(); ctx.globalAlpha = f;
  const x = 540, y = lerp(1700, 1260, eo(clamp(lt / 4))), s = lerp(1.7, .7, eo(clamp(lt / 4)));
  // silhouette from behind
  fig(ctx, x, y, s, { robe: '#2B1A12', hood: '#3A2418', skin: '#2B1A12', walk: lt * 5, arms: 'staff', staff: true, dir: 1 });
  ctx.restore();
  // footprints
  for (let i = 0; i < 8; i++) { const yy = 1880 - i * 60; if (yy < y) break; ctx.fillStyle = 'rgba(120,70,30,.35)'; ctx.beginPath(); ctx.ellipse(540 + (i % 2 ? 22 : -22), yy, 14, 22, 0, 0, 7); ctx.fill(); }
  sand(ctx, t, .7);
  headline(ctx, 'PARADEIRO', 'DESCONHECIDO', prog(t, 56.58, 57.0), { y: 330, size: 130, c2: '#FF6A4D' });
  card(ctx, W / 2, 620, ['NEM A TUMBA · NEM OS RESTOS'], { t: prog(t, 58.0, 58.3), size: 46, col: C.dbrown });
});

// 18. end card — Mundo Paralelo
scene(60.0, (ctx, t) => {
  vgrad(ctx, '#1A120B', '#2B1D12');
  rays(ctx, W / 2, 1000, 1400, 24, t * .15, C.gold, .08);
  const k = pop(t, 60.0, .5);
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k);
  for (const [dx, a] of [[-70, 1], [70, .55]]) { ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0); ctx.fillStyle = C.ocean; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 50, 120, 0, 0, 7); ctx.moveTo(-120, 0); ctx.lineTo(120, 0); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  text(ctx, 'MUNDO PARALELO', W / 2, 700, { size: 104 * pop(t, 60.15, .4), weight: 900, color: '#fff' });
  ctx.fillStyle = C.gold; const lw = 520 * eo(prog(t, 60.35, 60.75)); ctx.fillRect(W / 2 - lw / 2, 772, lw, 8);
  text(ctx, 'VÍDEO COMPLETO NO CANAL', W / 2, 840, { size: 48, weight: 700, color: C.gold, ls: 4 });
  const tp = eback(prog(t, 60.6, 61.1));
  if (tp > 0) {
    ctx.save(); ctx.translate(W / 2, 1230); ctx.scale(tp, tp); ctx.rotate(-.02);
    shadow(ctx, 50, 25, .5); ctx.fillStyle = '#F2C98B'; rr(ctx, -420, -240, 840, 480, 30); ctx.fill(); noShadow(ctx);
    ctx.save(); rr(ctx, -420, -240, 840, 480, 30); ctx.clip(); vgrad(ctx, '#E9A65E', '#F6D9A0');
    mountains(ctx, 240, [[-250, 300, 260], [250, 260, 240]], '#9C7A5B', '#F7F3EA'); ark(ctx, -230, -10, .28);
    fig(ctx, 260, 230, .9, { robe: '#9C3B2E', hood: '#C9A26B', beard: '#ECECE8', longBeard: true, skin: SK.b, arms: 'staff' });
    ctx.fillStyle = 'rgba(20,10,5,.75)'; ctx.fillRect(-420, -240, 840, 110);
    text(ctx, '7 OBJETOS BÍBLICOS SUMIDOS', 0, -185, { size: 46, weight: 900, color: '#fff' });
    ctx.restore(); ctx.restore();
    const pk = (1 + .08 * Math.sin(t * 8)) * pop(t, 61.1, .35);
    ctx.save(); ctx.translate(W / 2, 1720); ctx.scale(pk, pk); ctx.fillStyle = C.red; rr(ctx, -340, -70, 680, 140, 70); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-270, -32); ctx.lineTo(-270, 32); ctx.lineTo(-215, 0); ctx.closePath(); ctx.fill();
    text(ctx, 'ASSISTA AGORA', 35, 4, { size: 54, weight: 900, color: '#fff' }); ctx.restore();
  }
  fill(ctx, `rgba(0,0,0,${prog(t, 63.7, 64.2)})`);
}, { noZoom: true });

// ---------------- captions ----------------
const words = JSON.parse(fs.readFileSync(process.env.WORDS, 'utf8'));
const FIX = { 'Aarati,': 'Ararat,', 'fosse.': 'fossilizada', 'Na': 'na', 'gestos': 'restos', 'um.': 'um', 'Mistério.': 'mistério.', '3,': 'Nº 3:' };
words.forEach(w => { if (FIX[w.w]) w.w = FIX[w.w]; });
const KEY = new Set(['sete', 'objetos', 'bíblicos', 'sumidos', 'hoje', 'nº', '3:', 'arca', 'noé', 'bíblia', 'imensa', 'embarcação', 'família', 'animais', 'dilúvio', 'águas', 'monte', 'ararat', 'turquia', 'séculos', 'exploradores', 'vestígios', 'madeira', 'fossilizada', 'nenhuma', 'prova', 'definitiva', 'ciência', 'mistério', 'fascinante', 'lenda', 'escondida', 'montanhas', 'tumba', 'moisés', 'líderes', 'libertar', 'povo', 'hebreu', 'escravidão', 'egito', 'terra', 'prometida', 'detalhe', 'nunca', 'encontrada', 'deuteronômio', 'morreu', 'enterrado', 'deus', 'vale', 'ninguém', 'exato', 'sepultura', 'ocultada', 'propósito', 'idolatria', 'restos', 'mortais']);
const clean = (s) => s.toLowerCase().replace(/[.,!?…]/g, '');
const chunks = []; { let cur = []; const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  words.forEach((w) => { const txt = cur.map(x => x.w).join(' '); if (cur.length && (cur.length >= 3 || (txt + ' ' + w.w).length > 18 || w.s - cur[cur.length - 1].s > .9)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.w)) flush(); }); flush(); }
chunks.forEach((c, i) => { c.s = c[0].s; const nx = chunks[i + 1]; c.e = Math.min(nx ? nx[0].s : 999, c[c.length - 1].s + 1.2); });
function captions(ctx, t) {
  if (t >= 60.0) return;
  const c = chunks.find(c => t >= c.s - .02 && t < c.e); if (!c) return;
  const k = c.s < .1 ? 1 : eback(prog(t, c.s - .02, c.s + .14)); const size = 84;
  const parts = c.map(w => ({ w: w.w.toUpperCase().replace(/[.,]$/, ''), key: KEY.has(clean(w.w)) }));
  L.font(ctx, size, 900); const sp = size * .28; const widths = parts.map(p => ctx.measureText(p.w).width); const tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  const sc = Math.min(1, 960 / tot); ctx.save(); ctx.translate(W / 2, 1395); ctx.scale(k * sc, k * sc); let x = -tot / 2;
  parts.forEach((p, i) => { const cx = x + widths[i] / 2; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8; text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF', stroke: 16, strokeColor: '#24150C' }); ctx.restore(); text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF' }); x += widths[i] + sp; });
  ctx.restore();
}

// ---------------- render ----------------
const FPS = 30, DUR = 64.2;
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
  if (mode === 'stills') { for (const ts of process.argv.slice(3).map(Number)) { frame(ts); fs.writeFileSync(`${process.env.OUT}/g_${ts.toFixed(2).padStart(6, '0')}.jpg`, cv.toBuffer('image/jpeg', 80)); } }
  else {
    const [a, b, out] = [+process.argv[3], +process.argv[4], process.argv[5]];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    (async () => { for (let f = a; f < b; f++) { frame(f / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  }
}
