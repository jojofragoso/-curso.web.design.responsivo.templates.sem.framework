const L = require('./lib');
const { W, H, C, clamp, lerp, prog, eo, eio, eback, pop, rnd, rr, shadow, noShadow, text, fitText, paperBg, finish, rays, coin, note, card, stamp, calendar, person, cart, tomb, balance, dollar, createCanvas } = L;
const d3 = require('d3-geo');
const topo = require('topojson-client');
const fs = require('fs');
const { spawn } = require('child_process');

// ---------------- geo ----------------
const world = require('world-atlas/countries-50m.json');
const countries = topo.feature(world, world.objects.countries).features;
const brazil = countries.find(f => f.id === '076');
const sphere = { type: 'Sphere' };
const grat = d3.geoGraticule10();
const flatProj = d3.geoMercator().fitExtent([[110, 330], [970, 1290]], brazil);
function drawGlobe(ctx, rot, scale, cx, cy, o = {}) {
  const pr = d3.geoOrthographic().rotate(rot).scale(scale).translate([cx, cy]).clipAngle(90);
  const p = d3.geoPath(pr, ctx);
  // atmosphere glow
  const g = ctx.createRadialGradient(cx, cy, scale * .95, cx, cy, scale * 1.18); g.addColorStop(0, 'rgba(140,200,230,.55)'); g.addColorStop(1, 'rgba(140,200,230,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, scale * 1.2, 0, 7); ctx.fill();
  ctx.beginPath(); p(sphere); const og = ctx.createRadialGradient(cx - scale * .3, cy - scale * .3, scale * .1, cx, cy, scale); og.addColorStop(0, C.ocean2); og.addColorStop(1, C.ocean); ctx.fillStyle = og; ctx.fill();
  ctx.beginPath(); p(grat); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); for (const f of countries) if (f.id !== '076') p(f); ctx.fillStyle = C.land; ctx.fill(); ctx.strokeStyle = C.land2; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.beginPath(); p(brazil); shadow(ctx, 30, 0, .0); ctx.fillStyle = o.brCol || C.green; ctx.fill();
  ctx.lineWidth = o.brLine || 6; ctx.strokeStyle = C.gold; ctx.stroke(); ctx.restore();
  // terminator shading
  const sh = ctx.createRadialGradient(cx - scale * .4, cy - scale * .4, scale * .2, cx, cy, scale * 1.02); sh.addColorStop(0, 'rgba(255,255,255,.08)'); sh.addColorStop(1, 'rgba(0,20,40,.35)');
  ctx.beginPath(); p(sphere); ctx.fillStyle = sh; ctx.fill();
  return pr;
}
function brazilFlat(ctx, o = {}) { // flat brazil shape in canvas coords (fitExtent)
  const p = d3.geoPath(flatProj, ctx);
  ctx.save(); ctx.beginPath(); p(brazil); shadow(ctx, 40, 20, .35); ctx.fillStyle = o.fill || C.green; ctx.fill(); noShadow(ctx);
  ctx.lineWidth = o.lw || 8; ctx.strokeStyle = o.stroke || C.gold; ctx.stroke(); ctx.restore();
}
function starsBg(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0E1824'); g.addColorStop(1, '#1D2E3C'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  for (let i = 0; i < 140; i++) { const a = .3 + .5 * Math.abs(Math.sin(t * 2 + i)); ctx.fillStyle = `rgba(255,240,210,${a})`; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 99) * H, 1 + rnd(i + 7) * 2.5, 0, 7); ctx.fill(); }
}
function ekg(ctx, t, y, flat, col) { // heartbeat line across screen
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; shadow(ctx, 20, 0, .0);
  ctx.shadowColor = col; ctx.shadowBlur = 25; ctx.beginPath();
  for (let x = 0; x <= W; x += 6) {
    const ph = ((x / W) * 2.2 - t * 1.4) % 1; const q = ph < 0 ? ph + 1 : ph;
    let v = 0; if (q > .4 && q < .45) v = -1; else if (q >= .45 && q < .5) v = 1.4; else if (q >= .5 && q < .55) v = -.5;
    const amp = 110 * (1 - flat * clamp((x / W) * 1.6 + flat * .5));
    x ? ctx.lineTo(x, y - v * amp) : ctx.moveTo(x, y - v * amp);
  }
  ctx.stroke(); ctx.restore();
}

// ---------------- scenes ----------------
// each: [start, draw(ctx, t(global), lt(local), dur)]
const S = [];
const scene = (start, fn, o = {}) => S.push({ start, fn, ...o });

// 0. HOOK: globe zoom to Brazil, 8 coins destroyed, 9th dying
scene(0, (ctx, t) => {
  starsBg(ctx, t);
  const z = eio(prog(t, 0, 1.5));
  const scale = lerp(330, 2350, z), rot = [lerp(25, 53, eio(prog(t, 0, 1.3))), lerp(-5, 13, eio(prog(t, 0, 1.3))), 0];
  const cy = lerp(H * .5, H * .47, z);
  const shake = (t > 2.55 && t < 2.85) ? (rnd(Math.floor(t * 60)) - .5) * 30 * (1 - prog(t, 2.55, 2.85)) : 0;
  ctx.save(); ctx.translate(shake, shake * .6);
  drawGlobe(ctx, rot, scale, W / 2, cy, { brLine: lerp(3, 8, z) });
  ctx.restore();
  // dim map when coins arrive
  ctx.fillStyle = `rgba(10,20,30,${.35 * prog(t, 1.2, 1.6) + .25 * prog(t, 4.1, 4.8)})`; ctx.fillRect(-200, -200, W + 400, H + 400);
  // 8 coins rain
  const pos = []; for (let i = 0; i < 8; i++) { const a = Math.PI * (1.08 + i / 7 * .84) ; pos.push([180 + (i % 4) * 240, 1000 + Math.floor(i / 4) * 220]); }
  for (let i = 0; i < 8; i++) {
    const t0 = 1.3 + i * .09; const p = prog(t, t0, t0 + .35); if (p <= 0) continue;
    const [x, y] = pos[i]; const yy = lerp(-200, y, eo(p)) ;
    const dead = prog(t, t0 + .35, t0 + .7); const fade = prog(t, 2.45, 2.75);
    ctx.save(); ctx.globalAlpha = 1 - fade * .55;
    coin(ctx, x, yy + fade * 40, 92, { label: ['RÉIS', 'CR$', 'NCR$', 'CR$', 'CZ$', 'NCZ$', 'CR$', 'CR$'][i], gray: dead > .3, crack: dead, seed: i + 2, rot: (rnd(i) - .5) * .5 });
    ctx.restore();
  }
  // big number 8
  const k8 = pop(t, 1.36, .4) * (1 - prog(t, 2.4, 2.6));
  if (k8 > 0) { ctx.save(); ctx.translate(W / 2, 640); ctx.scale(k8, k8); text(ctx, '8', 0, 0, { size: 330, weight: 900, color: C.gold, stroke: 26, strokeColor: C.ink }); ctx.restore(); }
  card(ctx, W / 2, 360, ['MOEDAS DESTRUÍDAS'], { t: prog(t, 1.76, 2.1) * (1 - prog(t, 2.4, 2.5)), size: 66, rot: -.03 });
  // 9th: the real
  if (t > 2.48) {
    const p = prog(t, 2.48, 2.78); const y = lerp(-300, 860, eo(p));
    const dying = prog(t, 4.3, 5.1);
    rays(ctx, W / 2, 860, 900, 18, t * .3, C.gold, .22 * (1 - dying));
    coin(ctx, W / 2, y, 250, { label: 'R$', sub: 'REAL · 1994', crack: dying, seed: 4, gray: dying > .7 });
    card(ctx, W / 2, 400, ['9ª TENTATIVA'], { t: prog(t, 3.2, 3.55), size: 92, rot: .025, col: C.red });
    if (t > 4.15) { ctx.save(); ctx.globalAlpha = prog(t, 4.15, 4.4); ekg(ctx, t, 1260, dying, dying > .8 ? '#E74C3C' : '#5BE38A'); ctx.restore(); }
    if (dying > .2) { ctx.fillStyle = `rgba(180,20,10,${.18 * (.5 + .5 * Math.sin(t * 18)) * dying})`; ctx.fillRect(-200, -200, W + 400, H + 400); }
  }
}, { noZoom: true });

// 1. July 1994 launch
scene(5.12, (ctx, t, lt) => {
  paperBg(ctx);
  rays(ctx, W / 2, 780, 1100, 22, t * .15, C.gold, .18 * prog(t, 8.6, 9.0));
  // calendar flipping months up to JULHO 1994
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JULHO'];
  const fp = prog(t, 5.2, 6.4); const idx = Math.min(6, Math.floor(fp * 6.99));
  const cs = lerp(1.25, .85, eio(prog(t, 6.8, 7.3)));
  const cx = lerp(W / 2, W / 2, 0), cy = lerp(800, 520, eio(prog(t, 6.8, 7.3)));
  calendar(ctx, cx, cy, cs * pop(t, 5.12, .3), months[idx], idx < 6 ? '' + (1 + idx) : '1994', { color: C.green, flip: idx < 6 ? (fp * 7) % 1 : 0 });
  // newspaper
  const np = prog(t, 7.0, 7.5);
  if (np > 0) {
    ctx.save(); ctx.translate(W / 2, 1060); ctx.rotate(lerp(6, -.04, eo(np))); const s = lerp(.1, 1, eo(np)); ctx.scale(s, s);
    shadow(ctx, 40, 20, .35); ctx.fillStyle = '#F7F2E6'; ctx.fillRect(-380, -260, 760, 520); noShadow(ctx);
    text(ctx, 'GAZETA DO POVO BRASILEIRO', 0, -205, { size: 30, weight: 800, color: C.ink, ls: 3 });
    ctx.fillStyle = C.ink; ctx.fillRect(-340, -175, 680, 5);
    text(ctx, 'NASCE O REAL', 0, -110, { size: 92, weight: 900, color: C.ink });
    ctx.fillStyle = 'rgba(42,26,16,.25)'; for (let i = 0; i < 7; i++) ctx.fillRect(40, -30 + i * 34, 300 - (i % 3) * 40, 14);
    note(ctx, -170, 70, 300, 140, { color: '#4E8FA8', val: 'R$ 1', label: 'REAL', year: '1994' });
    ctx.restore();
  }
  if (t > 8.75) coin(ctx, 830, 1370, 130 * pop(t, 8.75, .4), { label: 'R$', sub: 'NOVA' });
});

// 2. 1 real = 1 dollar
scene(10.1, (ctx, t, lt) => {
  paperBg(ctx);
  const tilt = (1 - eo(prog(t, 10.3, 12.4))) * .25 * Math.cos(t * 7);
  balance(ctx, W / 2, 960, 1.15, tilt,
    (c) => { if (t > 10.34) coin(c, 0, -90 + (1 - eo(prog(t, 10.34, 10.6))) * -700, 95, { label: 'R$1' }); },
    (c) => { if (t > 11.54) dollar(c, 0, -60 + (1 - eo(prog(t, 11.54, 11.8))) * -700, 250); });
  card(ctx, W / 2, 380, ['1 = 1', 'PARIDADE'], { t: prog(t, 11.94, 12.3), size: 120, col: C.dgreen });
});

// 3. new era + hyperinflation
scene(13.06, (ctx, t, lt) => {
  // sunrise over brazil
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#F6C77A'); g.addColorStop(1, '#F3E6C8'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  const sunY = lerp(1300, 700, eo(prog(t, 13.06, 14.2)));
  rays(ctx, W / 2, sunY, 1400, 20, t * .2, '#fff', .25);
  ctx.fillStyle = '#FFE08A'; ctx.beginPath(); ctx.arc(W / 2, sunY, 220, 0, 7); ctx.fill();
  const out = prog(t, 14.3, 14.7);
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, 220); brazilFlat(ctx); ctx.restore();
  card(ctx, W / 2, 330, ['UMA NOVA ERA'], { t: prog(t, 13.3, 13.6) * (1 - out), size: 80 });
  if (out > 0) {
    ctx.save(); ctx.globalAlpha = out;
    ctx.fillStyle = 'rgba(243,230,200,.92)'; ctx.fillRect(-200, -200, W + 400, H + 400);
    // chart
    const x0 = 140, y0 = 1350, w = 800, h = 820;
    ctx.strokeStyle = C.dbrown; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0, y0 - h); ctx.lineTo(x0, y0); ctx.lineTo(x0 + w, y0); ctx.stroke();
    ctx.strokeStyle = 'rgba(62,42,30,.15)'; ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 - i * h / 5); ctx.lineTo(x0 + w, y0 - i * h / 5); ctx.stroke(); }
    const lp = eio(prog(t, 14.9, 17.0)); const pts = [];
    for (let i = 0; i <= 60; i++) { const u = i / 60; if (u > lp) break; pts.push([x0 + u * w, y0 - (Math.pow(u, 4) * 1.15 * h + Math.sin(u * 30) * 12 * u)]); }
    ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
    const last = pts[pts.length - 1]; if (last) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(last[0], last[1], 22, 0, 7); ctx.fill(); }
    ['1980', '1985', '1990', '1993'].forEach((y, i) => text(ctx, y, x0 + i * w / 3, y0 + 50, { size: 34, weight: 700, color: C.brown }));
    card(ctx, W / 2, 300, ['HIPERINFLAÇÃO', '1993 · 2.477% AO ANO'], { t: prog(t, 16.9, 17.3), size: 84, col: C.red, rot: -.03 });
    ctx.restore();
  }
});

// 4. supermarket
scene(18.26, (ctx, t, lt) => {
  paperBg(ctx, '#F4EAD5', '#E3D2AE');
  // shelves
  const sx = -lt * 40;
  ctx.fillStyle = '#E0C9A0'; ctx.fillRect(-200, 300, W + 400, 900);
  for (let r = 0; r < 3; r++) {
    const y = 560 + r * 280; ctx.fillStyle = C.brown; ctx.fillRect(-200, y, W + 400, 26);
    for (let i = 0; i < 9; i++) {
      const x = ((i * 170 + sx + r * 60) % 1530 + 1530) % 1530 - 200; const col = [C.red, C.gold, C.green, C.blue, '#D9773B'][(i + r) % 5];
      shadow(ctx, 10, 6, .2); ctx.fillStyle = col; rr(ctx, x, y - 170, 110, 170, 12); ctx.fill(); noShadow(ctx);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; rr(ctx, x + 14, y - 120, 82, 50, 8); ctx.fill();
      // price tag
      const ph = Math.floor((t - 18.3) * 6 + i + r * 3); const val = (1200 + ph * 137 + i * 90).toLocaleString('pt-BR');
      ctx.fillStyle = '#FFF6C9'; rr(ctx, x - 5, y + 30, 120, 50, 6); ctx.fill();
      text(ctx, 'CR$' + val, x + 55, y + 55, { size: 22, weight: 800, color: C.red });
    }
  }
  ctx.fillStyle = '#CDB48A'; ctx.fillRect(-200, 1200, W + 400, 900);
  // running people
  const rp = prog(t, 18.66, 23.3);
  for (let i = 0; i < 4; i++) {
    const x = lerp(-300 - i * 260, W + 500 - i * 260, rp * 1.0 + 0);
    person(ctx, x, 1560 + (i % 2) * 40, .95, { walk: t * 14 + i, shirt: [C.blue, C.red, C.green, '#8E5BA8'][i], dir: 1 });
    cart(ctx, x + 170, 1560 + (i % 2) * 40, .95);
  }
  card(ctx, W / 2, 230, ['DIA DO PAGAMENTO'], { t: prog(t, 20.1, 20.4) * (1 - prog(t, 21.3, 21.5)), size: 70 });
  card(ctx, W / 2, 230, ['NO DIA SEGUINTE...'], { t: prog(t, 21.46, 21.8), size: 70, col: C.red });
  // giant price tag
  if (t > 22.3) {
    ctx.fillStyle = `rgba(20,10,5,${.45 * prog(t, 22.3, 22.6)})`; ctx.fillRect(-200, -200, W + 400, H + 400);
    const k = pop(t, 22.34, .4); ctx.save(); ctx.translate(W / 2, 880); ctx.rotate(-.06); ctx.scale(k, k);
    shadow(ctx, 40, 20, .4); ctx.fillStyle = '#FFE36E'; rr(ctx, -330, -150, 660, 300, 30); ctx.fill(); noShadow(ctx);
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(-270, 0, 26, 0, 7); ctx.fill();
    const v = Math.floor(1200 * Math.pow(1.9, prog(t, 22.5, 23.5) * 3));
    text(ctx, 'CR$ ' + v.toLocaleString('pt-BR'), 30, 10, { size: 104, weight: 900, color: C.red });
    ctx.restore();
    stamp(ctx, 780, 620, 'SUBIU!', prog(t, 23.0, 23.3), { size: 70 });
  }
});

// 5. six currencies in 8 years -> chaos -> real arrives
const notesCols = ['#B5651D', '#6C5B9E', '#2E86AB', '#C0392B', '#27AE60', '#D68910'];
scene(23.55, (ctx, t, lt) => {
  paperBg(ctx);
  const chaos = prog(t, 27.6, 28.4), calm = eio(prog(t, 28.95, 29.5));
  for (let i = 0; i < 6; i++) {
    const t0 = 24.6 + i * .2; const p = eo(prog(t, t0, t0 + .3)); if (p <= 0) continue;
    let x = W / 2 + (i % 2 ? 1 : -1) * 20, y = 1250 - i * 70, r = (rnd(i) - .5) * .3;
    const ang = t * (1.5 + i * .3) + i;
    x = lerp(x, W / 2 + Math.cos(ang) * (300 + i * 30), chaos); y = lerp(y, 900 + Math.sin(ang * 1.3) * (420 + i * 20), chaos); r += chaos * t * (i % 2 ? 3 : -3);
    x = lerp(x, x + (x - W / 2) * 3, calm); y = lerp(y, y + (y - 900) * 3, calm);
    note(ctx, x, lerp(-300, y, p), 480, 220, { color: notesCols[i], val: '' + (1000 * (i + 1)), rot: r, gray: chaos > .5 });
  }
  const cnt = Math.min(6, Math.floor(prog(t, 24.9, 25.9) * 6) + (t > 24.6 ? 1 : 0));
  card(ctx, W / 2, 330, [cnt + 'X EM 8 ANOS', 'TROCAS DE MOEDA'], { t: prog(t, 24.99, 25.3) * (1 - chaos), size: 90, col: C.red });
  card(ctx, W / 2, 330, ['DÉCADAS DE CAOS'], { t: prog(t, 27.8, 28.1) * (1 - calm), size: 84, col: C.red, rot: .04 });
  if (calm > 0) {
    rays(ctx, W / 2, 900, 1300, 22, t * .3, C.gold, .3 * calm);
    coin(ctx, W / 2, 900, 280 * eback(prog(t, 29.0, 29.45)), { label: 'R$', sub: 'REAL' });
    card(ctx, W / 2, 330, ['CHEGOU O REAL'], { t: prog(t, 29.2, 29.5), size: 84, col: C.dgreen });
  }
});

// 6. 2026: R$5.20 per dollar
scene(29.95, (ctx, t, lt) => {
  paperBg(ctx);
  const yp = prog(t, 30.0, 31.4); const year = Math.round(lerp(1994, 2026, eio(yp)));
  const calOut = eio(prog(t, 32.0, 32.4));
  calendar(ctx, W / 2, lerp(820, 380, calOut), lerp(1.4, .7, calOut), '+32 ANOS', '' + year, { color: C.red });
  if (t > 32.19) {
    const n = Math.floor(prog(t, 32.4, 33.6) * 6.99); // coins piling
    const val = Math.min(5.2, prog(t, 32.4, 33.6) * 5.2);
    balance(ctx, W / 2, 1130, .95, (1 - eo(prog(t, 32.4, 33.8))) * -.22,
      (c) => { for (let i = 0; i < n; i++) coin(c, (i % 3 - 1) * 70, -60 - Math.floor(i / 3) * 70 - (i % 2) * 20, 62, { label: '1' }); },
      (c) => dollar(c, 0, -60, 250));
    card(ctx, W / 2 - 230, 690, ['R$ ' + val.toFixed(2).replace('.', ',')], { t: prog(t, 32.5, 32.8), size: 80, col: C.red, rot: -.05 });
    card(ctx, W / 2 + 260, 690, ['US$ 1'], { t: prog(t, 34.4, 34.7), size: 80, col: C.dgreen, rot: .05 });
  }
  if (t > 35.1) { ctx.fillStyle = `rgba(243,230,200,${.85 * prog(t, 35.1, 35.4)})`; ctx.fillRect(-200, -200, W + 400, H + 400); card(ctx, W / 2, 900, ['1994', 'US$ 1 = R$ 1,00'], { t: prog(t, 35.2, 35.5), size: 120, rot: -.03 }); }
});

// 7. lost 80% vs dollar, 89% purchasing power, inflation balloon
scene(35.98, (ctx, t, lt) => {
  paperBg(ctx);
  const ph2 = eio(prog(t, 38.8, 39.3));
  // part A: coin with 80% chunk falling
  ctx.save(); ctx.translate(lerp(0, -W, ph2), 0);
  const cp = prog(t, 37.0, 37.8);
  ctx.save(); ctx.beginPath(); ctx.moveTo(W / 2, 900); ctx.arc(W / 2, 900, 400, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * .2); ctx.closePath(); ctx.clip(); coin(ctx, W / 2, 900, 300, { label: 'R$' }); ctx.restore();
  ctx.save(); ctx.translate(0, eo(cp) * 1400 * cp); ctx.rotate(cp * .3); ctx.beginPath(); ctx.moveTo(W / 2, 900); ctx.arc(W / 2, 900, 400, -Math.PI / 2 + Math.PI * 2 * .2, Math.PI * 1.5); ctx.closePath(); ctx.clip(); coin(ctx, W / 2, 900, 300, { label: 'R$', gray: cp > .1 }); ctx.restore();
  stamp(ctx, W / 2, 400, '−80%', prog(t, 37.02, 37.3), { size: 150 });
  card(ctx, W / 2, 1720, ['CONTRA O DÓLAR'], { t: prog(t, 38.14, 38.4), size: 70 });
  ctx.restore();
  // part B: real vs real -> basket
  if (ph2 > 0) {
    ctx.save(); ctx.translate(lerp(W, 0, ph2), 0);
    card(ctx, W / 2, 330, ['REAL x REAL'], { t: prog(t, 39.9, 40.3) * (1 - prog(t, 41.1, 41.3)), size: 90 });
    const items = 9, lost = Math.floor(prog(t, 41.4, 42.6) * 8);
    const bx = W / 2, by = 1000;
    for (let i = 0; i < items; i++) {
      const gone = i < lost; const f = gone ? prog(t, 41.4 + i * .15, 41.4 + i * .15 + .6) : 0;
      const x = bx + ((i % 3) - 1) * 130 + f * (i % 2 ? 500 : -500), y = by - 170 - Math.floor(i / 3) * 90 - f * 600 + f * f * 1400;
      ctx.save(); ctx.translate(x, y); ctx.rotate(f * 4); ctx.fillStyle = [C.red, C.gold, C.green, '#D9773B', C.blue][i % 5]; shadow(ctx, 10, 6, .2); rr(ctx, -55, -60, 110, 120, 14); ctx.fill(); noShadow(ctx); ctx.restore();
    }
    // basket front
    ctx.fillStyle = C.tan2; ctx.beginPath(); ctx.moveTo(bx - 300, by - 140); ctx.lineTo(bx + 300, by - 140); ctx.lineTo(bx + 240, by + 140); ctx.lineTo(bx - 240, by + 140); ctx.closePath(); shadow(ctx, 30, 15, .3); ctx.fill(); noShadow(ctx);
    ctx.strokeStyle = C.brown; ctx.lineWidth = 8; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(bx - 300 + i * 120, by - 140); ctx.lineTo(bx - 240 + i * 96, by + 140); ctx.stroke(); }
    ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(bx, by - 140, 260, Math.PI, 0); ctx.stroke();
    stamp(ctx, W / 2, 380, '−89%', prog(t, 41.82, 42.1), { size: 150 });
    card(ctx, W / 2, 1720, ['PODER DE COMPRA'], { t: prog(t, 43.18, 43.5) * (1 - prog(t, 44.2, 44.35)), size: 72 });
    // inflation balloon
    if (t > 44.3) {
      const b = eo(prog(t, 44.4, 45.15)); const r = lerp(40, 330, b);
      ctx.strokeStyle = C.dbrown; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(W / 2, 1000 + r); ctx.quadraticCurveTo(W / 2 + 40, 1300, W / 2, 1500); ctx.stroke();
      shadow(ctx, 40, 20, .3); const g = ctx.createRadialGradient(W / 2 - r * .3, 1000 - r * .4, r * .1, W / 2, 1000, r); g.addColorStop(0, '#F07D6E'); g.addColorStop(1, C.red); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(W / 2, 1000, r * .9, r, 0, 0, 7); ctx.fill(); noShadow(ctx);
      text(ctx, 'INFLAÇÃO', W / 2, 1000, { size: fitText(ctx, 'INFLAÇÃO', r * 1.5, 110, 900), weight: 900, color: '#fff' });
    }
    ctx.restore();
  }
});

// 8. "o mais perturbador?"
scene(45.2, (ctx, t, lt) => {
  ctx.fillStyle = '#120C08'; ctx.fillRect(-200, -200, W + 400, H + 400);
  const g = ctx.createRadialGradient(W / 2, 880, 50, W / 2, 880, 700); g.addColorStop(0, 'rgba(242,193,78,.35)'); g.addColorStop(1, 'rgba(242,193,78,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const k = pop(t, 45.3, .5) * (1 + .03 * Math.sin(t * 9));
  ctx.save(); ctx.translate(W / 2, 880); ctx.scale(k, k); ctx.rotate(Math.sin(t * 3) * .05);
  text(ctx, '?', 0, 0, { size: 620, weight: 900, color: C.gold, stroke: 30, strokeColor: '#3a2408' }); ctx.restore();
}, { noFlash: false });

// 9. 9 currencies since independence - map
scene(46.72, (ctx, t, lt) => {
  paperBg(ctx, '#EFDDB5', '#D9BE8C');
  ctx.save(); const k = lerp(.9, 1, eo(prog(t, 46.72, 47.4))); ctx.translate(W / 2, 810); ctx.scale(k, k); ctx.translate(-W / 2, -810); ctx.globalAlpha = prog(t, 46.72, 47.1);
  brazilFlat(ctx, { fill: '#B8A06A', stroke: C.dbrown, lw: 6 }); ctx.restore();
  // orbit coins
  const n = Math.min(9, Math.floor(prog(t, 49.5, 50.4) * 9) + (t > 49.5 ? 1 : 0));
  for (let i = 0; i < n; i++) { const a = t * .5 + i / 9 * Math.PI * 2; coin(ctx, W / 2 + Math.cos(a) * 430, 810 + Math.sin(a) * 520, 62 * pop(t, 49.5 + i * .1, .3), { label: '' + (i + 1), gray: i < 8 && t > 50.8 }); }
  if (t > 49.76) { const k9 = pop(t, 49.76, .4); ctx.save(); ctx.translate(W / 2, 800); ctx.scale(k9, k9); text(ctx, '9', 0, 0, { size: 380, weight: 900, color: C.gold, stroke: 28, strokeColor: C.ink }); ctx.restore(); }
  card(ctx, W / 2, 1720, ['MOEDAS DIFERENTES'], { t: prog(t, 50.0, 50.3), size: 72 });
  card(ctx, W / 2, 270, ['DESDE 1822', 'INDEPENDÊNCIA'], { t: prog(t, 51.2, 51.5), size: 90, col: C.dgreen });
  card(ctx, W / 2, 270, ['NÃO É A PRIMEIRA VEZ'], { t: prog(t, 47.3, 47.6) * (1 - prog(t, 49.0, 49.2)), size: 68, col: C.red });
});

// 10. currency parade grid
const CUR = [['RÉIS', '1500–1942', '#8D6E63', 52.24], ['CRUZEIRO', '1942', '#2E86AB', 52.8], ['CRUZEIRO NOVO', '1967', '#6C5B9E', 53.44], ['CRUZEIRO', '1970', '#16A085', 54.24], ['CRUZADO', '1986', '#B5651D', 55.52], ['CRUZADO NOVO', '1989', '#C0392B', 56.16], ['CRUZEIRO', '1990', '#7D8C2E', 57.15], ['CRUZEIRO REAL', '1993', '#AD5A8C', 58.27], ['REAL', '1994', '#2E7D4F', 59.79]];
function parade(ctx, t, grayAll) {
  CUR.forEach(([n, y, c, t0], i) => {
    const p = pop(t, t0, .35); if (p <= 0) return;
    const col = i % 3, row = Math.floor(i / 3); const x = 200 + col * 340, yy = 560 + row * 340;
    ctx.save(); ctx.translate(x, yy); ctx.scale(p, p);
    note(ctx, 0, 0, 310, 200, { color: c, label: n, year: y, rot: (rnd(i) - .5) * .12, gray: grayAll && i < 8, x: grayAll && i < 8 ? prog(t, 60.5 + i * .08, 60.8 + i * .08) : 0 });
    ctx.restore();
  });
}
scene(52.24, (ctx, t) => {
  paperBg(ctx);
  parade(ctx, t, t > 60.43);
  if (t > 59.79) { const p = prog(t, 59.79, 60.2); ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 12; ctx.globalAlpha = .5 + .5 * Math.sin(t * 10); rr(ctx, 1080 - 200 - 175 - 340 + 340 + 0, 1240 - 120, 350, 240, 20); ctx.restore(); }
  const cnt = CUR.filter(c => t >= c[3]).length;
  card(ctx, W / 2, 260, [cnt + ' / 9'], { t: prog(t, 52.3, 52.6), size: 100, col: C.red });
});

// 11. cemetery
const DEAD = ['RÉIS', 'CRUZEIRO', 'CRUZEIRO\nNOVO', 'CRUZEIRO', 'CRUZADO', 'CRUZADO\nNOVO', 'CRUZEIRO', 'CRUZEIRO\nREAL'];
function cemeteryBg(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3B4A5C'); g.addColorStop(.6, '#8B7E86'); g.addColorStop(1, '#C9A98A'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.fillStyle = '#F4EBD0'; ctx.beginPath(); ctx.arc(820, 300, 110, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(244,235,208,.15)'; ctx.beginPath(); ctx.arc(820, 300, 170, 0, 7); ctx.fill();
  ctx.fillStyle = '#4C5E3C'; ctx.beginPath(); ctx.moveTo(-200, 1050); ctx.quadraticCurveTo(W / 2, 930, W + 200, 1050); ctx.lineTo(W + 200, H + 200); ctx.lineTo(-200, H + 200); ctx.fill();
  ctx.fillStyle = '#3B4C2E'; ctx.fillRect(-200, 1500, W + 400, 800);
}
function graves(ctx, t, o = {}) {
  DEAD.forEach((n, i) => {
    const row = i < 4 ? 0 : 1; const col = i % 4; const x = 150 + col * 260 + (row ? 0 : 0), y = row ? 1560 : 1180;
    const t0 = 60.43 + i * .3; const p = eo(prog(t, t0, t0 + .4)); if (p <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 200, y - 600, 400, 600); ctx.clip();
    tomb(ctx, x, y + (1 - p) * 330, row ? 1 : .82, n, { sub: o.cause ? '' : CUR[i][1].split('–').pop() });
    ctx.restore();
    if (o.cause) stamp(ctx, x, y - 110 * (row ? 1 : .82), '???', prog(t, o.cause + i * .05, o.cause + .3 + i * .05), { size: 34, rot: -.2 });
  });
}
scene(60.43, (ctx, t) => {
  cemeteryBg(ctx, t); graves(ctx, t, { cause: t > 63.6 ? 63.95 : 0 });
  card(ctx, W / 2, 620, ['NASCERAM · PERDERAM VALOR · MORRERAM'], { t: prog(t, 61.5, 61.8) * (1 - prog(t, 63.4, 63.6)), size: 44, rot: -.02 });
  card(ctx, W / 2, 620, ['MESMO MOTIVO'], { t: prog(t, 64.59, 64.9), size: 84, col: C.red, rot: .03 });
});

// 12. the question: why would the real be different
scene(65.15, (ctx, t) => {
  cemeteryBg(ctx, t);
  ctx.save(); ctx.globalAlpha = .55; graves(ctx, 70, { cause: 0 }); ctx.restore();
  ctx.fillStyle = 'rgba(15,10,20,.45)'; ctx.fillRect(-200, -200, W + 400, H + 400);
  // spotlight
  const g = ctx.createRadialGradient(W / 2, 1150, 40, W / 2, 1150, 520); g.addColorStop(0, 'rgba(255,230,160,.45)'); g.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // empty tomb rising behind
  const tp = eo(prog(t, 69.4, 70.2));
  if (tp > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1250); ctx.clip(); tomb(ctx, W / 2, 1250 + (1 - tp) * 500, 1.5, 'REAL ?', { color: '#B8B1A6', sub: '1994 – ????' }); ctx.restore(); }
  coin(ctx, W / 2, 1230, 190 * pop(t, 65.3, .4), { label: 'R$', sub: 'REAL' });
  card(ctx, W / 2, 380, ['A PERGUNTA QUE', 'NINGUÉM FAZ'], { t: prog(t, 65.4, 65.7) * (1 - prog(t, 67.5, 67.7)), size: 72, size2: 72 * .9, col2: C.red });
  card(ctx, W / 2, 380, ['VAI SER DIFERENTE?'], { t: prog(t, 69.57, 69.9), size: 76, col: C.red });
});

// 13. born, lived, died
scene(70.37, (ctx, t) => {
  paperBg(ctx);
  const ys = [480, 830, 1180];
  const labels = [['NASCEU', 73.01], ['VIVEU', 73.73], ['MORREU', 74.37]];
  card(ctx, W / 2, 230, ['A HISTÓRIA DE CADA UMA'], { t: prog(t, 71.5, 71.8), size: 60 });
  labels.forEach(([l, t0], i) => {
    const p = pop(t, t0 - .25, .4); if (p <= 0) return;
    ctx.save(); ctx.translate(W / 2, ys[i]); ctx.scale(p, p);
    shadow(ctx, 30, 14, .25); ctx.fillStyle = C.white; rr(ctx, -440, -150, 880, 300, 30); ctx.fill(); noShadow(ctx);
    if (i === 0) { coin(ctx, -250, 0, 110, { label: 'R$', sub: 'NOVA' }); rays(ctx, -250, 0, 200, 12, t, C.gold, .4); }
    if (i === 1) { coin(ctx, -250, 0, 110, { label: 'R$' }); ctx.save(); ctx.beginPath(); ctx.rect(-400, -160, 300, 320); ctx.clip(); ctx.translate(-400, -1260 + 0); ekg(ctx, t, 1260, 0, C.green); ctx.restore(); }
    if (i === 2) tomb(ctx, -250, 120, .62, '');
    text(ctx, l, 140, 0, { size: 110, weight: 900, color: [C.dgreen, C.gold, C.red][i], stroke: i === 1 ? 10 : 0, strokeColor: C.dbrown });
    ctx.restore();
  });
});

// 14. proof board
scene(74.85, (ctx, t) => {
  paperBg(ctx, '#C9A577', '#A9834F'); // cork
  for (let i = 0; i < 300; i++) { ctx.fillStyle = 'rgba(90,55,25,.18)'; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 3) * H, 3 + rnd(i + 5) * 4, 0, 7); ctx.fill(); }
  const pics = [[220, 520], [860, 560], [200, 1300], [870, 1320]];
  pics.forEach(([x, y], i) => {
    const p = pop(t, 75.0 + i * .15, .35); if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.rotate((rnd(i) - .5) * .2);
    shadow(ctx, 20, 10, .3); ctx.fillStyle = C.white; ctx.fillRect(-150, -180, 300, 340); noShadow(ctx);
    ctx.fillStyle = '#5E6B73'; ctx.fillRect(-125, -155, 250, 240); tomb(ctx, 0, 80, .55, DEAD[i * 2].split('\n')[0]);
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, -165, 14, 0, 7); ctx.fill();
    ctx.restore();
  });
  // red strings
  const sp = prog(t, 75.7, 76.6);
  ctx.strokeStyle = C.red; ctx.lineWidth = 6;
  pics.forEach(([x, y], i) => { const q = clamp(sp * 4 - i); if (q <= 0) return; ctx.beginPath(); ctx.moveTo(x, y - 165); ctx.lineTo(lerp(x, W / 2, q), lerp(y - 165, 930, q)); ctx.stroke(); });
  coin(ctx, W / 2, 930, 170 * pop(t, 75.2, .4), { label: 'R$', crack: prog(t, 76.8, 77.6) * .7, seed: 3 });
  // magnifier
  if (t > 76.2) { const a = t * 2; const mx = W / 2 + Math.cos(a) * 60, my = 930 + Math.sin(a) * 40; ctx.save(); ctx.globalAlpha = prog(t, 76.2, 76.5); ctx.strokeStyle = C.dbrown; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(mx, my, 210, 0, 7); ctx.stroke(); ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx + 150, my + 150); ctx.lineTo(mx + 330, my + 330); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(mx, my, 200, 0, 7); ctx.fill(); ctx.restore(); }
  stamp(ctx, W / 2, 1730, 'PROVA', prog(t, 75.89, 76.2), { size: 110 });
});

// 15. protect your wealth
scene(77.97, (ctx, t) => {
  paperBg(ctx);
  // house + piggy
  const hx = W / 2, hy = 1200;
  ctx.fillStyle = C.tan2; shadow(ctx, 30, 15, .3); ctx.fillRect(hx - 230, hy - 260, 460, 300); noShadow(ctx);
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(hx - 280, hy - 250); ctx.lineTo(hx, hy - 470); ctx.lineTo(hx + 280, hy - 250); ctx.fill();
  ctx.fillStyle = C.brown; ctx.fillRect(hx - 50, hy - 140, 100, 180); ctx.fillStyle = C.sky; ctx.fillRect(hx - 190, hy - 200, 100, 90); ctx.fillRect(hx + 90, hy - 200, 100, 90);
  // piggy bank
  ctx.save(); ctx.translate(hx + 290, hy - 20); ctx.fillStyle = '#F2A7B5'; ctx.beginPath(); ctx.ellipse(0, -80, 130, 100, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(120, -90, 40, 34, 0, 0, 7); ctx.fill();
  ctx.fillRect(-80, -20, 30, 40); ctx.fillRect(50, -20, 30, 40); ctx.fillStyle = C.ink; ctx.fillRect(-30, -175, 60, 10); ctx.beginPath(); ctx.arc(70, -110, 7, 0, 7); ctx.fill(); ctx.restore();
  // falling broken coins
  const shieldP = eo(prog(t, 79.6, 80.1));
  for (let i = 0; i < 10; i++) {
    const ph = ((t * .7 + rnd(i)) % 1); const x = 100 + rnd(i + 20) * 880; let y = -150 + ph * 1500;
    const dome = hy - 120 - Math.sqrt(Math.max(0, 560 * 560 - (x - hx) * (x - hx)));
    let bx = 0; if (shieldP > .5 && y > dome) { const over = y - dome; y = dome - over * .6; bx = (x < hx ? -1 : 1) * over * 1.3; }
    coin(ctx, x + bx, y, 50, { gray: true, crack: .8, seed: i, rot: t * 3 + i });
  }
  if (shieldP > 0) {
    ctx.save(); ctx.globalAlpha = shieldP; const g = ctx.createRadialGradient(hx, hy - 120, 100, hx, hy - 120, 560); g.addColorStop(0, 'rgba(120,200,255,.05)'); g.addColorStop(1, 'rgba(90,170,240,.45)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy - 120, 560 * shieldP, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(80,160,230,.9)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(hx, hy - 120, 560 * shieldP, Math.PI, 0); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = C.dgreen; ctx.fillRect(-200, hy + 40, W + 400, 1000);
  card(ctx, W / 2, 330, ['PROTEJA SEU', 'PATRIMÔNIO'], { t: prog(t, 79.8, 80.2) * (1 - prog(t, 81.2, 81.4)), size: 80, size2: 64, col2: C.dgreen });
  if (t > 81.3) { // repeat arrows
    ctx.save(); ctx.translate(W / 2, 360); ctx.rotate(t * 3); ctx.strokeStyle = C.red; ctx.lineWidth = 26; ctx.lineCap = 'round';
    const k = pop(t, 81.3, .35); ctx.scale(k, k);
    for (const a0 of [0, Math.PI]) { ctx.beginPath(); ctx.arc(0, 0, 130, a0 + .3, a0 + Math.PI - .3); ctx.stroke(); const ax = Math.cos(a0 + Math.PI - .3) * 130, ay = Math.sin(a0 + Math.PI - .3) * 130; ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(ax, ay, 30, 0, 7); ctx.fill(); }
    ctx.restore(); text(ctx, 'A HISTÓRIA SE REPETE', W / 2, 590, { size: 60, weight: 900, color: C.red, stroke: 0 });
  }
});

// 16. CTA like/subscribe
scene(83.41, (ctx, t) => {
  paperBg(ctx);
  // phone
  const px = W / 2, py = 900;
  shadow(ctx, 50, 25, .35); ctx.fillStyle = C.ink; rr(ctx, px - 330, py - 600, 660, 1200, 70); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = '#F7F2E6'; rr(ctx, px - 300, py - 560, 600, 1120, 50); ctx.fill();
  // video thumbnail
  ctx.save(); rr(ctx, px - 280, py - 520, 560, 330, 24); ctx.clip(); ctx.fillStyle = '#E8D3A8'; ctx.fillRect(px - 280, py - 520, 560, 330);
  coin(ctx, px - 120, py - 355, 100, { label: 'R$' }); tomb(ctx, px + 130, py - 220, .55, 'REAL ?'); ctx.restore();
  ctx.fillStyle = 'rgba(42,26,16,.3)'; rr(ctx, px - 280, py - 160, 480, 30, 10); ctx.fill(); rr(ctx, px - 280, py - 115, 320, 26, 10); ctx.fill();
  // like
  const liked = t > 84.95; const lk = liked ? 1 + .25 * Math.sin(prog(t, 84.95, 85.3) * Math.PI) : 1;
  ctx.save(); ctx.translate(px - 150, py + 30); ctx.scale(lk, lk); ctx.fillStyle = liked ? C.blue : '#D8CDB8'; rr(ctx, -110, -60, 220, 120, 60); ctx.fill();
  text(ctx, '👍', -38, 0, { size: 1, color: 'transparent' });
  // thumb icon
  ctx.fillStyle = '#fff'; rr(ctx, -70, -10, 26, 50, 6); ctx.fill(); ctx.beginPath(); ctx.moveTo(-38, -8); ctx.lineTo(-10, -45); ctx.quadraticCurveTo(5, -48, 2, -25); ctx.lineTo(-2, -10); ctx.lineTo(30, -10); ctx.quadraticCurveTo(45, -8, 40, 10); ctx.lineTo(30, 40); ctx.lineTo(-38, 40); ctx.closePath(); ctx.fill();
  text(ctx, liked ? '1' : '0', 75, 0, { size: 40, weight: 800, color: '#fff' }); ctx.restore();
  // subscribe
  const sub = t > 86.0; ctx.save(); ctx.translate(px + 90, py + 200); const sk = sub ? 1 + .15 * Math.sin(prog(t, 86.0, 86.3) * Math.PI) : 1; ctx.scale(sk, sk);
  ctx.fillStyle = sub ? '#B9B1A2' : C.red; rr(ctx, -190, -55, 380, 110, 55); ctx.fill(); text(ctx, sub ? 'INSCRITO ✓' : 'INSCREVER-SE', 0, 3, { size: 40, weight: 800, color: '#fff' }); ctx.restore();
  // hand cursor
  const tgt = t < 85.6 ? [px - 150, py + 30, 84.6] : [px + 90, py + 200, 85.7];
  const cp = eio(prog(t, tgt[2], tgt[2] + .35)); const fromX = t < 85.6 ? W + 100 : px - 150, fromY = t < 85.6 ? 1700 : py + 30;
  if (t > 84.2 && t < 87.2) { const cx = lerp(fromX, tgt[0], cp) + 30, cy = lerp(fromY, tgt[1], cp) + 30; ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.lineTo(28, 84); ctx.lineTo(48, 130); ctx.lineTo(68, 120); ctx.lineTo(48, 76); ctx.lineTo(85, 76); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // algorithm + team (after 87)
  if (t > 87.2) {
    ctx.fillStyle = `rgba(243,230,200,${.9 * prog(t, 87.2, 87.5)})`; ctx.fillRect(-200, -200, W + 400, H + 400);
    // network nodes
    const nodes = []; for (let i = 0; i < 14; i++) nodes.push([160 + rnd(i) * 760, 380 + rnd(i + 40) * 900]);
    const lit = prog(t, 87.5, 93.5) * 14;
    ctx.lineWidth = 6; nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j <= i || Math.hypot(a[0] - b[0], a[1] - b[1]) > 380) return; ctx.strokeStyle = (i < lit && j < lit) ? C.gold : 'rgba(62,42,30,.2)'; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }));
    nodes.forEach((a, i) => { ctx.fillStyle = i < lit ? C.red : '#CDB48A'; ctx.beginPath(); ctx.arc(a[0], a[1], i < lit ? 30 : 22, 0, 7); ctx.fill(); });
    card(ctx, W / 2, 280, ['ALGORITMO'], { t: prog(t, 87.6, 87.9), size: 90, col: C.red });
    // team
    if (t > 90.4) for (let i = 0; i < 5; i++) { const j = Math.abs(Math.sin(t * 8 + i)) * 30 * prog(t, 90.6, 91); person(ctx, 160 + i * 190, 1560 - j, .85 * pop(t, 90.4 + i * .08, .3), { shirt: [C.blue, C.red, C.green, '#8E5BA8', C.gold][i], armF: true }); }
    if (t > 94.0) { const k = pop(t, 94.1, .4) * (1 + .08 * Math.sin(t * 12)); ctx.save(); ctx.translate(W / 2, 900); ctx.scale(k * 3.2, k * 3.2); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-70, -20, -40, -80, 0, -45); ctx.bezierCurveTo(40, -80, 70, -20, 0, 30); ctx.fill(); ctx.restore(); }
  }
});

// 17. time travel
scene(95.35, (ctx, t) => {
  const sep = prog(t, 96.5, 98.7);
  ctx.fillStyle = '#1A120B'; ctx.fillRect(-200, -200, W + 400, H + 400);
  // vortex rings
  for (let i = 0; i < 16; i++) {
    const z = ((i / 16 + t * .45) % 1); const r = Math.pow(z, 2) * 1500;
    ctx.strokeStyle = `rgba(242,193,78,${.5 * (1 - z)})`; ctx.lineWidth = 6 + z * 30; ctx.beginPath(); ctx.arc(W / 2, 900, r, 0, 7); ctx.stroke();
  }
  // clock
  ctx.save(); ctx.translate(W / 2, 900); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(0, 0, 260, 0, 7); ctx.fill(); ctx.strokeStyle = C.dgold; ctx.lineWidth = 24; ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillStyle = C.dbrown; ctx.beginPath(); ctx.arc(Math.sin(a) * 210, -Math.cos(a) * 210, 12, 0, 7); ctx.fill(); }
  const sp = -(t - 95.35) * (2 + (t - 95.35) * 6);
  ctx.strokeStyle = C.dbrown; ctx.lineCap = 'round'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(sp) * 170, -Math.cos(sp) * 170); ctx.stroke();
  ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(sp / 12) * 110, -Math.cos(sp / 12) * 110); ctx.stroke(); ctx.restore();
  const yr = Math.round(lerp(2026, 1500, Math.pow(prog(t, 95.6, 98.6), 1.6)));
  text(ctx, '' + yr, W / 2, 400, { size: 170, weight: 900, color: C.gold, stroke: 18, strokeColor: '#3a2408' });
  card(ctx, W / 2, 1720, ['ONDE TUDO COMEÇOU'], { t: prog(t, 97.75, 98.1), size: 70 });
  ctx.fillStyle = `rgba(255,240,200,${Math.pow(prog(t, 98.4, 98.79), 2)})`; ctx.fillRect(-200, -200, W + 400, H + 400);
}, { noZoom: true });

// 18. colonial origin: the first real
scene(98.79, (ctx, t) => {
  paperBg(ctx, '#EAD3A2', '#C9A66B');
  // sepia sea + coast of brazil map
  ctx.save(); ctx.globalAlpha = .9; ctx.translate(0, 0); brazilFlat(ctx, { fill: '#C7A56B', stroke: '#7A4E2D', lw: 6 }); ctx.restore();
  // waves
  ctx.strokeStyle = 'rgba(122,78,45,.35)'; ctx.lineWidth = 5; for (let i = 0; i < 8; i++) { const y = 500 + i * 140, x = 880 + Math.sin(t * 2 + i) * 20; ctx.beginPath(); ctx.arc(x, y, 30, Math.PI, 0); ctx.arc(x + 60, y, 30, Math.PI, 0); ctx.stroke(); }
  // caravel
  const sx = lerp(1250, 830, eo(prog(t, 98.79, 100.6))), sy = 820 + Math.sin(t * 3) * 10;
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.sin(t * 2.5) * .05); ctx.fillStyle = C.brown; ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(150, 0); ctx.lineTo(110, 70); ctx.lineTo(-110, 70); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.dbrown; ctx.fillRect(-6, -230, 12, 230); ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(-110, -210); ctx.quadraticCurveTo(0, -170, 110, -210); ctx.lineTo(100, -40); ctx.quadraticCurveTo(0, -10, -100, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.red; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, -180); ctx.lineTo(0, -60); ctx.moveTo(-50, -125); ctx.lineTo(50, -125); ctx.stroke(); ctx.restore();
  // old silver coin
  if (t > 101.2) {
    ctx.fillStyle = `rgba(30,18,8,${.55 * prog(t, 101.2, 101.6)})`; ctx.fillRect(-200, -200, W + 400, H + 400);
    const k = eback(prog(t, 101.3, 101.9)); rays(ctx, W / 2, 920, 1300, 24, t * .3, '#fff', .2 * k);
    coin(ctx, W / 2, 920, 300 * k, { silver: true, cross: t < 103.4, label: t >= 103.4 ? 'REAL' : '', rot: (1 - k) * 2 });
    card(ctx, W / 2, 380, ['A PRIMEIRA MOEDA', 'DO BRASIL'], { t: prog(t, 101.45, 101.8), size: 74, size2: 56 });
    if (t >= 103.43) { ctx.fillStyle = `rgba(255,255,255,${.8 * (1 - prog(t, 103.43, 103.75))})`; ctx.fillRect(-200, -200, W + 400, H + 400); }
  }
  card(ctx, W / 2, 380, ['PORTUGAL · SÉC. XVI'], { t: prog(t, 99.3, 99.6) * (1 - prog(t, 101.2, 101.3)), size: 64 });
});


// 19. end card: Mundo Paralelo
scene(103.95, (ctx, t) => {
  const lt = t - 103.95;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1A120B'); g.addColorStop(1, '#2B1D12'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  rays(ctx, W / 2, 1000, 1400, 24, t * .15, C.gold, .08);
  // logo: two mirrored globes (mundo paralelo)
  const k = pop(t, 103.95, .5);
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k);
  for (const [dx, a] of [[-70, 1], [70, .55]]) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0);
    ctx.fillStyle = C.ocean; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 50, 120, 0, 0, 7); ctx.moveTo(-120, 0); ctx.lineTo(120, 0); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  text(ctx, 'MUNDO PARALELO', W / 2, 700, { size: 104 * pop(t, 104.1, .4), weight: 900, color: '#fff' });
  ctx.fillStyle = C.gold; const lw = 520 * eo(prog(t, 104.3, 104.7)); ctx.fillRect(W / 2 - lw / 2, 772, lw, 8);
  text(ctx, 'VÍDEO COMPLETO NO CANAL', W / 2, 840, { size: 48, weight: 700, color: C.gold, ls: 4 });
  // thumbnail
  const tp = eback(prog(t, 104.5, 105.0));
  if (tp > 0) {
    ctx.save(); ctx.translate(W / 2, 1230); ctx.scale(tp, tp); ctx.rotate(-.02);
    shadow(ctx, 50, 25, .5); ctx.fillStyle = '#E8D3A8'; rr(ctx, -420, -240, 840, 480, 30); ctx.fill(); noShadow(ctx);
    ctx.save(); rr(ctx, -420, -240, 840, 480, 30); ctx.clip();
    rays(ctx, -150, 30, 700, 18, t * .2, C.gold, .25);
    coin(ctx, -170, 40, 150, { label: 'R$', crack: .6, seed: 4 }); tomb(ctx, 230, 210, .9, 'REAL ?', { color: '#9E978C' });
    ctx.fillStyle = 'rgba(20,10,5,.75)'; ctx.fillRect(-420, -240, 840, 110);
    text(ctx, 'O REAL ESTÁ MORRENDO', 0, -185, { size: 58, weight: 900, color: '#fff' });
    ctx.restore(); ctx.restore();
    // play button pulse
    const pk = (1 + .08 * Math.sin(t * 8)) * pop(t, 105.0, .35);
    ctx.save(); ctx.translate(W / 2, 1720); ctx.scale(pk, pk); ctx.fillStyle = C.red; rr(ctx, -340, -70, 680, 140, 70); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-270, -32); ctx.lineTo(-270, 32); ctx.lineTo(-215, 0); ctx.closePath(); ctx.fill();
    text(ctx, 'ASSISTA AGORA', 35, 4, { size: 54, weight: 900, color: '#fff' }); ctx.restore();
  }
  ctx.fillStyle = `rgba(0,0,0,${prog(t, 106.4, 106.9)})`; ctx.fillRect(-200, -200, W + 400, H + 400);
}, { noZoom: true });

// ---------------- captions ----------------
const words = JSON.parse(fs.readFileSync(process.env.WORDS, 'utf8'));
const FIX = { 'validade': 'paridade', '120': 'R$ 5,20', 'gustava': 'que custava', 'Que': 'Por que', 'é.': 'é:' };
words.forEach(w => { if (FIX[w.w] && !(w.w === 'Que' && w.s < 60) && !(w.w === 'é.' && w.s < 60)) w.w = FIX[w.w]; });
const KEY = new Set(['brasil', 'destruiu', '8', 'moedas', 'real', 'nona', 'morrendo', 'julho', '1994', 'moeda', 'nova', 'dólar', 'paridade', 'nova', 'era', 'hiperinflação', 'história', 'supermercado', 'pagamento', 'preço', 'subido', 'seis', 'caos', 'chegou', '32', '2026', 'r$', '5,20', '80%', 'valor', '89%', 'poder', 'inflação', 'perturbador', 'primeira', 'nove', 'independência', 'réis', 'cruzeiro', 'cruzado', 'novo', 'oito', 'nasceram', 'morreram', 'motivo', 'pergunta', 'ninguém', 'diferente', 'nasceu', 'viveu', 'morreu', 'provar', 'proteger', 'patrimônio', 'repita', 'like', 'inscreve', 'canal', 'youtube', 'time', 'algoritmo', 'vida', 'começou', 'chamava', 'mega']);
const clean = (s) => s.toLowerCase().replace(/[.,!?:…]/g, '');
const chunks = []; { let cur = [];
  const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  words.forEach((w, i) => {
    const txt = cur.map(x => x.w).join(' ');
    if (cur.length && (cur.length >= 3 || (txt + ' ' + w.w).length > 18 || w.s - cur[cur.length - 1].s > .9)) flush();
    cur.push(w); if (/[.,!?:]$/.test(w.w)) flush();
  }); flush(); }
chunks.forEach((c, i) => { c.s = c[0].s; const nx = chunks[i + 1]; c.e = Math.min(nx ? nx[0].s : 999, c[c.length - 1].s + 1.2); });
function captions(ctx, t) {
  if (t >= 103.95) return;
  const c = chunks.find(c => t >= c.s - .02 && t < c.e); if (!c) return;
  const k = c.s < .1 ? 1 : eback(prog(t, c.s - .02, c.s + .14)); const size = 82;
  const parts = c.map(w => ({ w: w.w.toUpperCase().replace(/[.,:]$/, '').replace('...', ''), key: KEY.has(clean(w.w).split(' ').pop()) || /\d/.test(w.w), act: t >= w.s }));
  L.font(ctx, size, 900); const sp = size * .28;
  const widths = parts.map(p => ctx.measureText(p.w).width); let tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  const sc = Math.min(1, 960 / tot);
  ctx.save(); ctx.translate(W / 2, 1495); ctx.scale(k * sc, k * sc);
  let x = -tot / 2;
  parts.forEach((p, i) => {
    const cx = x + widths[i] / 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF', stroke: 16, strokeColor: '#24150C' });
    ctx.restore();
    text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF' });
    x += widths[i] + sp;
  });
  ctx.restore();
}

// ---------------- render ----------------
const FPS = 30, DUR = +process.env.DUR || 103.9;
S.forEach((s, i) => s.end = S[i + 1] ? S[i + 1].start : DUR);
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
function frame(t) {
  const s = S.filter(s => t >= s.start).pop(); const lt = t - s.start, d = s.end - s.start;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; noShadow(ctx);
  ctx.save();
  if (!s.noZoom) { const z = 1 + .05 * (lt / d) + .06 * (1 - eo(clamp(lt / .3))); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
  s.fn(ctx, t, lt, d);
  ctx.restore();
  finish(ctx);
  if (lt < .12 && s.start > 0) { ctx.fillStyle = `rgba(255,248,230,${.35 * (1 - lt / .12)})`; ctx.fillRect(0, 0, W, H); }
  captions(ctx, t);
}
module.exports = { frame, cv };

if (require.main === module) {
  const mode = process.argv[2];
  if (mode === 'stills') {
    for (const ts of process.argv.slice(3).map(Number)) { frame(ts); fs.writeFileSync(`${process.env.OUT}/f_${ts.toFixed(2)}.jpg`, cv.toBuffer('image/jpeg', 80)); }
  } else {
    const [a, b, out] = [+process.argv[3], +process.argv[4], process.argv[5]];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    (async () => {
      for (let f = a; f < b; f++) {
        frame(f / FPS); const buf = cv.data();
        if (!ff.stdin.write(Buffer.from(buf))) await new Promise(r => ff.stdin.once('drain', r));
      }
      ff.stdin.end();
    })();
  }
}
