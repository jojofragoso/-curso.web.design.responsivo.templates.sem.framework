// "Fazendas fantasmas" — Banco do Brasil
const L = require('./lib');
const { W, H, C, clamp, lerp, prog, eo, eio, eback, pop, rnd, rr, shadow, noShadow, text, fitText, paperBg, finish, rays, card, stamp, calendar, coin, note, createCanvas } = L;
const { SK, bust, fig, cloud } = require('./chars');
const d3 = require('d3-geo'); const topo = require('topojson-client');
const fs = require('fs'); const { spawn } = require('child_process');
const world = require('world-atlas/countries-50m.json');
const brazil = topo.feature(world, world.objects.countries).features.find(f => f.id === '076');

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
const RED = '#E0443A', GRN = '#2E9E5B', BBY = '#F6D33C', BBB = '#2B4C9B';
const SHIRTS = ['#2F5D8A', '#C0392B', '#6C7A3E', '#8E5BA8', '#D68910', '#16A085', '#7B5E57', '#E5534B'];
const SKINS = [SK.a, SK.b, SK.c, SK.b, SK.a, SK.c];
// narrator-ish investor (generic, original)
const INV = { skin: SK.a, skin2: SK.a2, hair: '#2A1A10', hairStyle: 'short', glasses: '#2A1A10', stubble: 'rgba(60,40,25,.35)', robe: '#EFE6D2', robe2: '#D9CDB4', lid: .3 };

// ---------- props ----------
function bank(ctx, x, y, s, name, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wall = o.wall || '#E9E4D8', acc = o.acc || BBB;
  shadow(ctx, 40, 18, .3); ctx.fillStyle = wall; ctx.fillRect(-300, -420, 600, 420); noShadow(ctx);
  ctx.fillStyle = acc; ctx.beginPath(); ctx.moveTo(-340, -420); ctx.lineTo(0, -560); ctx.lineTo(340, -420); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 6; i++) ctx.fillRect(-260 + i * 100, -380, 40, 380);
  ctx.fillStyle = o.sign || BBY; rr(ctx, -280, -500, 560, 90, 14); ctx.fill();
  text(ctx, name, 0, -455, { size: fitText(ctx, name, 520, 56, 900), weight: 900, color: acc });
  ctx.fillStyle = '#3A3A44'; ctx.fillRect(-60, -170, 120, 170);
  if (o.cracks) { ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = 7; for (let k = 0; k < 3; k++) { let xx = -200 + k * 180, yy = -400; ctx.beginPath(); ctx.moveTo(xx, yy); for (let i = 0; i < 6 * o.cracks; i++) { xx += (rnd(k * 9 + i) - .5) * 60; yy += 45; ctx.lineTo(xx, yy); } ctx.stroke(); } }
  ctx.restore();
}
function ghost(ctx, x, y, s, t, o = {}) { // white sheet ghost
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + x) * 10 * s); ctx.scale(s, s); ctx.globalAlpha *= o.a == null ? 1 : o.a;
  shadow(ctx, 20, 8, .2); ctx.fillStyle = '#F7F7FA'; ctx.beginPath(); ctx.moveTo(-60, 60); ctx.lineTo(-60, -20); ctx.arc(0, -20, 60, Math.PI, 0); ctx.lineTo(60, 60);
  for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(45 - i * 30, 40 + Math.sin(t * 6 + i) * 8, 30 - i * 30, 60); ctx.closePath(); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = '#2A1A10'; ctx.beginPath(); ctx.ellipse(-20, -25, 9, 14, 0, 0, 7); ctx.ellipse(20, -25, 9, 14, 0, 0, 7); ctx.fill();
  if (o.mouth) { ctx.beginPath(); ctx.ellipse(0, 8, 10, 12, 0, 0, 7); ctx.fill(); }
  if (o.bag) { ctx.fillStyle = '#C9A26B'; ctx.beginPath(); ctx.arc(70, 30, 34, 0, 7); ctx.fill(); ctx.fillRect(58, -10, 24, 14); text(ctx, 'R$', 70, 34, { size: 26, weight: 900, color: '#5A3A10' }); }
  ctx.restore();
}
function farm(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a == null ? 1 : o.a;
  ctx.fillStyle = o.ghost ? 'rgba(230,236,245,.7)' : '#C0392B'; ctx.fillRect(-40, -40, 80, 60); ctx.fillStyle = o.ghost ? 'rgba(200,210,225,.8)' : '#8E2A20'; ctx.beginPath(); ctx.moveTo(-50, -38); ctx.lineTo(0, -80); ctx.lineTo(50, -38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = o.ghost ? 'rgba(255,255,255,.8)' : '#F4F0E6'; ctx.fillRect(-14, -10, 28, 30); ctx.restore();
}
function phone(ctx, x, y, s, draw) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); shadow(ctx, 40, 20, .35); ctx.fillStyle = '#16181C'; rr(ctx, -230, -440, 460, 880, 56); ctx.fill(); noShadow(ctx); ctx.fillStyle = '#0F1218'; rr(ctx, -210, -410, 420, 820, 40); ctx.fill(); ctx.save(); rr(ctx, -210, -410, 420, 820, 40); ctx.clip(); draw && draw(ctx); ctx.restore(); ctx.restore(); }
function chart(ctx, x0, y0, w, h, pts, p, col, o = {}) { // pts: array of 0..1 values
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 - i * h / 5); ctx.lineTo(x0 + w, y0 - i * h / 5); ctx.stroke(); }
  const n = pts.length - 1, m = p * n; ctx.strokeStyle = col; ctx.lineWidth = o.lw || 10; ctx.lineJoin = 'round'; ctx.beginPath(); let lx = x0, ly = y0 - pts[0] * h;
  for (let i = 0; i <= Math.floor(m); i++) { lx = x0 + i / n * w; ly = y0 - pts[i] * h; i ? ctx.lineTo(lx, ly) : ctx.moveTo(lx, ly); }
  const f = m - Math.floor(m); if (f > 0 && Math.floor(m) < n) { const i = Math.floor(m); lx = x0 + (i + f) / n * w; ly = y0 - lerp(pts[i], pts[i + 1], f) * h; ctx.lineTo(lx, ly); }
  ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx, ly, (o.lw || 10) * 1.6, 0, 7); ctx.fill(); return [lx, ly];
}
function moneyBag(ctx, x, y, s, label = 'R$') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); shadow(ctx, 16, 8, .3); ctx.fillStyle = '#C9A26B'; ctx.beginPath(); ctx.arc(0, 20, 70, 0, 7); ctx.fill(); noShadow(ctx); ctx.fillStyle = '#A8814B'; ctx.fillRect(-28, -60, 56, 30); ctx.strokeStyle = '#7A5A2B'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-34, -32); ctx.lineTo(34, -32); ctx.stroke(); text(ctx, label, 0, 26, { size: 46, weight: 900, color: '#5A3A10' }); ctx.restore(); }
function idCard(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  shadow(ctx, 40, 18, .4); ctx.fillStyle = '#E8F0E4'; rr(ctx, -300, -190, 600, 380, 26); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = '#2E7D4F'; rr(ctx, -300, -190, 600, 80, 26); ctx.fill(); ctx.fillRect(-300, -140, 600, 30);
  text(ctx, 'CADASTRO DE PESSOA FÍSICA', 0, -150, { size: 30, weight: 800, color: '#fff' });
  ctx.fillStyle = '#B9C4B4'; rr(ctx, -260, -80, 160, 200, 14); ctx.fill(); ctx.fillStyle = '#8E9A8A'; ctx.beginPath(); ctx.arc(-180, -10, 44, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-180, 100, 66, 46, 0, Math.PI, 0); ctx.fill();
  text(ctx, '?', -180, 10, { size: 90, weight: 900, color: '#fff' });
  text(ctx, 'CPF', 40, -50, { size: 36, weight: 800, color: '#5D6D60', align: 'left' });
  text(ctx, '***.***.***-**', 40, 10, { size: 46, weight: 900, color: C.ink, align: 'left' });
  ctx.fillStyle = 'rgba(42,26,16,.25)'; ctx.fillRect(40, 60, 200, 14); ctx.fillRect(40, 92, 150, 14);
  ctx.restore();
}

const S = []; const scene = (start, fn, o = {}) => S.push({ start, fn, ...o });

// 0. HOOK — breaking news TV
scene(0, (ctx, t) => {
  vgrad(ctx, '#151A22', '#2B2F3A');
  // TV
  const on = eo(prog(t, 0, .35));
  ctx.save(); ctx.translate(W / 2, 900);
  shadow(ctx, 50, 20, .5); ctx.fillStyle = '#1B1D22'; rr(ctx, -470, -360, 940, 640, 40); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = '#0A0C10'; rr(ctx, -430, -320, 860, 520, 20); ctx.fill();
  ctx.save(); rr(ctx, -430, -320, 860, 520, 20); ctx.clip(); ctx.scale(1, on);
  ctx.fillStyle = '#1F4E6B'; ctx.fillRect(-430, -320, 860, 520);
  const pr = d3.geoMercator().fitExtent([[-300, -290], [300, 170]], brazil); const p = d3.geoPath(pr, ctx);
  ctx.beginPath(); p(brazil); ctx.fillStyle = GRN; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = BBY; ctx.stroke();
  // warning pulses on map
  for (let i = 0; i < 3; i++) { const r = ((t * 120 + i * 60) % 180); ctx.strokeStyle = `rgba(224,68,58,${1 - r / 180})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(60, -40, r, 0, 7); ctx.stroke(); }
  ctx.fillStyle = RED; ctx.fillRect(-430, 110, 860, 90); text(ctx, 'URGENTE', -300, 155, { size: 52, weight: 900, color: '#fff' });
  ctx.fillStyle = '#fff'; ctx.fillRect(-170, 110, 600, 90); const tick = 'ESCÂNDALO • BANCO DO BRASIL • FAZENDAS FANTASMAS • '; ctx.save(); ctx.beginPath(); ctx.rect(-170, 110, 600, 90); ctx.clip(); text(ctx, tick + tick, 430 - ((t * 260) % 1700), 155, { size: 40, weight: 800, color: C.ink, align: 'left' }); ctx.restore();
  ctx.restore();
  ctx.fillStyle = '#1B1D22'; ctx.fillRect(-40, 280, 80, 120); rr(ctx, -200, 390, 400, 30, 12); ctx.fill();
  ctx.restore();
  // newspapers piling up
  for (let i = 0; i < 4; i++) { const p = eo(prog(t, 1.0 + i * .3, 1.4 + i * .3)); if (p <= 0) continue; ctx.save(); ctx.translate(lerp(i % 2 ? 1400 : -300, 200 + i * 230, p), 1660 - i * 18); ctx.rotate((i % 2 ? 1 : -1) * (.2 + (1 - p) * 2)); ctx.fillStyle = '#F7F2E6'; shadow(ctx, 20, 8, .3); ctx.fillRect(-170, -110, 340, 220); noShadow(ctx); text(ctx, ['CRISE!', 'ESCÂNDALO', 'ROMBO', 'ALERTA'][i], 0, -60, { size: 50, weight: 900, color: C.ink }); ctx.fillStyle = 'rgba(42,26,16,.3)'; for (let k = 0; k < 4; k++) ctx.fillRect(-140, -10 + k * 26, 280 - k * 30, 10); ctx.restore(); }
  headline(ctx, 'A PIOR NOTÍCIA', 'É SEMPRE A PRÓXIMA', prog(t, .05, .6), { y: 230, size: 120, size2: 96, c2: '#FF5A4D' });
}, { noZoom: true });

// 1. Master scandal -> Banco do Brasil scandal
scene(3.04, (ctx, t) => {
  vgrad(ctx, '#8FB7CF', '#E8E2D2');
  const pan = eio(prog(t, 4.9, 5.7));
  ctx.save(); ctx.translate(lerp(0, -900, pan), 0);
  bank(ctx, W / 2, 1450, 1.2, 'BANCO MASTER', { acc: '#3A3A44', sign: '#C9CCD1', wall: '#DCDDE0', cracks: prog(t, 3.6, 4.6) });
  stamp(ctx, W / 2, 600, 'ESCÂNDALO', prog(t, 3.52, 3.8), { size: 100 });
  bank(ctx, W / 2 + 900, 1450, 1.2, 'BANCO DO BRASIL', {});
  ctx.fillStyle = '#9DA6AC'; ctx.fillRect(-400, 1450, 2400, 700);
  ctx.restore();
  if (pan > .5) { ctx.save(); ctx.globalAlpha = pan; const g = ctx.createRadialGradient(W / 2, 1100, 50, W / 2, 1100, 700); g.addColorStop(0, 'rgba(255,240,180,.0)'); g.addColorStop(1, 'rgba(20,10,10,.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  stamp(ctx, W / 2, 600, 'ESCÂNDALO', prog(t, 5.76, 6.05), { size: 100 });
  card(ctx, W / 2, 330, ['NOVO ESCÂNDALO'], { t: prog(t, 5.2, 5.5), size: 84, col: C.red });
  for (let i = 0; i < 6; i++) fig(ctx, 120 + i * 170, 1820, .9, { robe: SHIRTS[i], pants: '#2B3540', skin: SKINS[i], hair: '#2A1A10', mouth: t > 6 ? 'open' : null });
});

// 2. 112 ghost farms taking billion-real loans
scene(7.68, (ctx, t) => {
  vgrad(ctx, '#8DBF6E', '#6FA356');
  // field grid
  ctx.strokeStyle = 'rgba(60,90,40,.35)'; ctx.lineWidth = 4; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(-100, 300 + i * 120); ctx.lineTo(1200, 260 + i * 120); ctx.stroke(); }
  const n = Math.min(112, Math.floor(eio(prog(t, 7.7, 8.8)) * 112));
  const gh = prog(t, 9.04, 9.9);
  for (let i = 0; i < n; i++) { const c = i % 8, r = Math.floor(i / 8); const x = 90 + c * 128 + (r % 2) * 30, y = 520 + r * 72; farm(ctx, x, y, .55, { ghost: gh > rnd(i), a: gh > rnd(i) ? .6 + .3 * Math.sin(t * 4 + i) : 1 }); }
  // ghosts rising out, money bags flying in
  if (t > 10.0) for (let i = 0; i < 6; i++) { const x = 140 + i * 160, y = 1300 - prog(t, 10 + i * .1, 10.6 + i * .1) * 120; ghost(ctx, x, y, .9, t + i, { bag: t > 11.6 + i * .12 }); }
  if (t > 11.04) { for (let i = 0; i < 6; i++) { const p = prog(t, 11.04 + i * .12, 11.7 + i * .12); if (p <= 0 || p >= 1) continue; moneyBag(ctx, lerp(W / 2, 140 + i * 160 + 70, p), lerp(-100, 1330, p) - Math.sin(p * Math.PI) * 200, .6); } }
  const cnt = n;
  headline(ctx, cnt + ' FAZENDAS', 'FANTASMAS', prog(t, 7.7, 8.1), { y: 250, size: 120, c2: '#FFFFFF', c1: BBY });
  card(ctx, W / 2, 1650, ['EMPRÉSTIMOS BILIONÁRIOS'], { t: prog(t, 11.6, 11.9), size: 58, col: C.red });
});

// 3. ...not paying, because they don't exist
scene(13.4, (ctx, t) => {
  vgrad(ctx, '#DCE3E8', '#B9C6CE');
  // invoice
  ctx.save(); ctx.translate(W / 2, 780); ctx.rotate(-.04); shadow(ctx, 30, 14, .3); ctx.fillStyle = '#FFFDF7'; ctx.fillRect(-300, -330, 600, 660); noShadow(ctx);
  text(ctx, 'COBRANÇA', 0, -260, { size: 64, weight: 900, color: C.ink }); ctx.fillStyle = C.ink; ctx.fillRect(-250, -215, 500, 5);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(42,26,16,.3)'; ctx.fillRect(-250, -170 + i * 50, 300, 16); ctx.fillRect(130, -170 + i * 50, 120, 16); }
  text(ctx, 'R$ BILHÕES', 0, 150, { size: 76, weight: 900, color: RED });
  ctx.fillStyle = C.ink; for (let i = 0; i < 40; i++) ctx.fillRect(-250 + i * 12.5, 230, (i % 3 ? 4 : 8), 60);
  ctx.restore();
  stamp(ctx, W / 2, 800, 'NÃO PAGO', prog(t, 13.72, 14.0), { size: 110 });
  // ghost waves bye and fades
  const f = 1 - prog(t, 15.4, 16.2);
  ghost(ctx, 820, 1600, 1.6, t, { bag: true, a: f, mouth: true });
  if (f > .2) { ctx.save(); ctx.globalAlpha = f; text(ctx, 'TCHAU!', 820, 1360, { size: 60, weight: 900, color: '#fff', stroke: 12, strokeColor: '#24150C' }); ctx.restore(); }
  card(ctx, 280, 1600, ['NÃO EXISTEM'], { t: prog(t, 15.56, 15.85), size: 60, col: C.red, rot: -.05 });
});

// 4. 256 billion in debt
scene(16.36, (ctx, t) => {
  vgrad(ctx, '#2C1A1A', '#5A2A24');
  bank(ctx, W / 2, 1500, 1.0, 'BANCO DO BRASIL', {});
  // debt paper pile rising next to bank
  const lvl = eio(prog(t, 17.0, 20.8));
  for (let i = 0; i < Math.floor(lvl * 30); i++) { const side = i % 2 ? 1 : -1; ctx.save(); ctx.translate(W / 2 + side * 400, 1500 - Math.floor(i / 2) * 50 - 30); ctx.rotate((rnd(i) - .5) * .2); ctx.fillStyle = '#FFFDF7'; shadow(ctx, 8, 4, .3); ctx.fillRect(-90, -24, 180, 48); noShadow(ctx); text(ctx, 'DÍVIDA', 0, 0, { size: 28, weight: 900, color: RED }); ctx.restore(); }
  ctx.fillStyle = '#3A2420'; ctx.fillRect(-300, 1500, W + 600, 700);
  const v = Math.floor(eio(prog(t, 17.88, 19.6)) * 256);
  if (t > 17.8) { const k = pop(t, 17.8, .4); ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k); text(ctx, 'R$ ' + v, 0, 0, { size: 200, weight: 900, color: RED, stroke: 20, strokeColor: '#1A0A08' }); text(ctx, 'BILHÕES EM DÍVIDAS', 0, 150, { size: 64, weight: 900, color: '#fff', stroke: 12, strokeColor: '#1A0A08' }); ctx.restore(); }
  card(ctx, W / 2, 230, ['MAIS DE'], { t: prog(t, 17.56, 17.8), size: 56 });
});

// 5. report blamed agribusiness
scene(21.4, (ctx, t) => {
  vgrad(ctx, '#EDE6D6', '#D6CBB2');
  // report on the left
  ctx.save(); ctx.translate(330, 760); ctx.rotate(-.05); shadow(ctx, 30, 14, .3); ctx.fillStyle = '#FFFDF7'; ctx.fillRect(-230, -320, 460, 640); noShadow(ctx);
  text(ctx, 'RELATÓRIO', 0, -260, { size: 52, weight: 900, color: C.ink }); ctx.fillStyle = '#1F2A33'; ctx.fillRect(-190, -200, 380, 260);
  chart(ctx, -170, 40, 340, 220, [.8, .75, .78, .6, .55, .35, .3, .12], prog(t, 21.6, 23.0), RED, { lw: 7 });
  ctx.fillStyle = 'rgba(42,26,16,.3)'; for (let i = 0; i < 5; i++) ctx.fillRect(-190, 100 + i * 36, 380 - (i % 2) * 90, 12);
  ctx.restore();
  // farmer being blamed
  const fx = 780, fy = 1500;
  fig(ctx, fx, fy, 1.7, { robe: '#3E6FA3', pants: '#5A4028', hat: '#C9A26B', skin: SK.b, hair: '#3E2A1E', beard: '#3E2A1E', la: t > 26.4 ? -1.9 : null, ra: t > 26.4 ? 1.9 : null, mouth: t > 26.4 ? 'open' : null });
  card(ctx, fx, 1000, ['AGRO'], { t: prog(t, 24.04, 24.3), size: 64, col: C.dgreen });
  // pointing fingers at the farmer
  for (let i = 0; i < 3; i++) { const p = eo(prog(t, 23.32 + i * .15, 23.7 + i * .15)); if (p <= 0) continue; const y = 1100 + i * 140; ctx.save(); ctx.translate(lerp(-200, 470, p), y); ctx.fillStyle = SKINS[i]; rr(ctx, -140, -30, 140, 60, 26); ctx.fill(); rr(ctx, -10, -14, 110, 28, 14); ctx.fill(); ctx.fillStyle = SHIRTS[i + 3]; ctx.fillRect(-260, -38, 130, 76); ctx.restore(); }
  // ledger not closing
  if (t > 28.0) { ctx.save(); ctx.translate(W / 2, 360); const k = eback(prog(t, 28.0, 28.4)); ctx.scale(k, k); shadow(ctx, 30, 12, .3); ctx.fillStyle = '#2B3540'; rr(ctx, -330, -120, 660, 240, 24); ctx.fill(); noShadow(ctx); ctx.fillStyle = '#B9E7C9'; rr(ctx, -300, -95, 600, 120, 14); ctx.fill(); text(ctx, Math.sin(t * 20) > 0 ? 'ERRO' : '- - - -', 0, -35, { size: 80, weight: 900, color: RED }); text(ctx, 'AS CONTAS NÃO FECHAM', 0, 75, { size: 40, weight: 800, color: '#fff' }); ctx.restore(); }
  else card(ctx, W / 2, 330, ['CULPANDO O AGRO'], { t: prog(t, 23.32, 23.6), size: 76, col: C.red });
});

// 6. even worse: all 112 farms under one CPF
scene(29.67, (ctx, t) => {
  fill(ctx, '#0E0B0A');
  const g = ctx.createRadialGradient(W / 2, 1000, 40, W / 2, 1000, 700); g.addColorStop(0, 'rgba(255,220,150,.25)'); g.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // farms in a ring connected to one CPF
  const conn = prog(t, 32.4, 34.3);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, x = W / 2 + Math.cos(a) * 440, y = 1000 + Math.sin(a) * 560; const k = eback(prog(t, 30.9 + i * .03, 31.3 + i * .03)); if (k <= 0) continue;
    if (conn > i / 24) { ctx.strokeStyle = 'rgba(224,68,58,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(W / 2, 1000); ctx.stroke(); }
    farm(ctx, x, y + 20, .55 * k, { ghost: true }); }
  const ck = eback(prog(t, 33.9, 34.5)); if (ck > 0) idCard(ctx, W / 2, 1000, .85 * ck, t);
  card(ctx, W / 2, 1000, ['112 FAZENDAS'], { t: prog(t, 31.75, 32.0) * (1 - prog(t, 33.8, 33.9)), size: 80, col: C.red });
  headline(ctx, 'SABE O QUE', 'É PIOR AINDA?', prog(t, 29.7, 30.1) * (1 - prog(t, 33.9, 34.0)), { y: 260, size: 110, c2: '#FF5A4D' });
  headline(ctx, 'O MESMO', 'CPF', prog(t, 33.99, 34.4), { y: 230, size: 120, size2: 150, c2: BBY });
});

// 7. that CPF doesn't exist at the Receita Federal
scene(35.11, (ctx, t) => {
  vgrad(ctx, '#203040', '#3A5266');
  // computer screen search
  ctx.save(); ctx.translate(W / 2, 860); shadow(ctx, 50, 20, .45); ctx.fillStyle = '#1B1D22'; rr(ctx, -440, -360, 880, 620, 30); ctx.fill(); noShadow(ctx);
  ctx.fillStyle = '#F4F6F8'; rr(ctx, -410, -330, 820, 560, 14); ctx.fill();
  ctx.fillStyle = '#2E7D4F'; ctx.fillRect(-410, -330, 820, 90); text(ctx, 'RECEITA FEDERAL · CONSULTA CPF', 0, -285, { size: 34, weight: 800, color: '#fff' });
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#9AA6AF'; ctx.lineWidth = 4; rr(ctx, -340, -180, 680, 90, 12); ctx.fill(); ctx.stroke();
  const typed = '***.***.***-**'.slice(0, Math.floor(prog(t, 35.2, 36.0) * 14)); text(ctx, typed + (Math.floor(t * 3) % 2 ? '|' : ''), -310, -135, { size: 44, weight: 800, color: C.ink, align: 'left' });
  if (t > 36.2) { const k = eback(prog(t, 36.2, 36.6)); ctx.save(); ctx.scale(k, k); ctx.fillStyle = '#FDE3E1'; rr(ctx, -340, -40, 680, 200, 18); ctx.fill(); text(ctx, '✕', -250, 60, { size: 110, weight: 900, color: RED }); text(ctx, 'CPF NÃO', 60, 20, { size: 64, weight: 900, color: RED }); text(ctx, 'ENCONTRADO', 60, 100, { size: 64, weight: 900, color: RED }); ctx.restore(); }
  ctx.restore();
  stamp(ctx, W / 2, 330, 'NÃO EXISTE', prog(t, 37.16, 37.45), { size: 110 });
});

// 8. "they keep taking us for fools"
scene(37.64, (ctx, t) => {
  vgrad(ctx, '#E9A65E', '#F6D9A0');
  rays(ctx, W / 2, 1100, 1300, 20, t * .3, '#fff', .15);
  bust(ctx, W / 2, 1120, 1.5, { skin: SK.b, skin2: SK.b2, hair: '#2A1A10', hairStyle: 'short', robe: '#2F5D8A', robe2: '#E9E6DE', brows: 'angry', mouth: 'frown', blink: blink(t), lid: .25 });
  // steam from ears
  for (let i = 0; i < 6; i++) { const p = ((t * 1.5 + i / 6) % 1); for (const sx of [-1, 1]) { ctx.fillStyle = `rgba(255,255,255,${.8 * (1 - p)})`; ctx.beginPath(); ctx.arc(W / 2 + sx * (190 + p * 120), 1100 - p * 260, 20 + p * 30, 0, 7); ctx.fill(); } }
  // clown nose pops on (being made a fool)
  if (t > 40.04) { const k = eback(prog(t, 40.04, 40.4)); ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(W / 2 + 12, 1120 + 40 * 1.5, 34 * k * 1.5, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(W / 2, 1120 + 28 * 1.5, 10 * k * 1.5, 0, 7); ctx.fill(); }
  card(ctx, W / 2, 330, ['FAZENDO A GENTE', 'DE IDIOTA'], { t: prog(t, 39.16, 39.5), size: 74, size2: 74, col2: C.red });
});

// 9. investors affected
scene(40.68, (ctx, t) => {
  vgrad(ctx, '#1E2833', '#2E3D4C');
  bust(ctx, W / 2, 1520, 1.35, { ...INV, brows: 'sad', mouth: 'frown', blink: blink(t, 2), look: Math.sin(t) * .3 });
  // sweat drops
  for (let i = 0; i < 2; i++) { const p = ((t * .8 + i * .5) % 1); ctx.fillStyle = '#7FC8F0'; ctx.beginPath(); const x = W / 2 + (i ? 140 : -150), y = 1400 + p * 140; ctx.moveTo(x, y - 30); ctx.quadraticCurveTo(x + 18, y, x, y + 10); ctx.quadraticCurveTo(x - 18, y, x, y - 30); ctx.fill(); }
  // phone with portfolio
  phone(ctx, W / 2, 620, .62, (c) => { c.fillStyle = '#0F1218'; c.fillRect(-210, -410, 420, 820); text(c, 'MINHA CARTEIRA', 0, -340, { size: 34, weight: 800, color: '#fff' }); text(c, 'AÇÕES BB', 0, -260, { size: 50, weight: 900, color: BBY }); chart(c, -180, 160, 360, 340, [.8, .82, .7, .72, .55, .5, .3, .2], prog(t, 41.0, 45.0), RED, { lw: 8 }); text(c, '▼', 0, 300, { size: 90, weight: 900, color: RED }); });
  card(ctx, W / 2, 1080, ['INVESTIDOR'], { t: prog(t, 41.48, 41.8), size: 60, col: C.blue });
});

// 10. shares melting below R$15
scene(45.8, (ctx, t) => {
  fill(ctx, '#0D1117');
  const x0 = 110, y0 = 1250, w = 860, h = 760;
  // R$15 line
  const ly = y0 - h * .45; ctx.strokeStyle = BBY; ctx.lineWidth = 5; ctx.setLineDash([20, 14]); ctx.beginPath(); ctx.moveTo(x0, ly); ctx.lineTo(x0 + w, ly); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'R$ 15', x0 + 10, ly - 40, { size: 50, weight: 900, color: BBY, align: 'left' });
  const pts = [.9, .86, .88, .78, .74, .7, .62, .58, .5, .44, .38, .3, .2, .1];
  const [lx, ly2] = chart(ctx, x0, y0, w, h, pts, prog(t, 45.9, 53.3), RED, { lw: 12 });
  // melting drips
  for (let i = 0; i < 6; i++) { const p = ((t * .6 + i / 6) % 1); ctx.fillStyle = 'rgba(224,68,58,.7)'; ctx.beginPath(); ctx.ellipse(lx - 20 + i * 8, ly2 + p * 300, 8, 14, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(224,68,58,.12)'; ctx.fillRect(x0, ly2, w, y0 - ly2);
  card(ctx, W / 2, 300, ['AÇÕES DERRETENDO'], { t: prog(t, 47.88, 48.2) * (1 - prog(t, 50.8, 50.9)), size: 76, col: C.red });
  headline(ctx, 'ABAIXO', 'DE R$ 15', prog(t, 50.91, 51.3), { y: 260, size: 130, c2: BBY });
  if (t > 52.5) { const k = pop(t, 52.5, .4); text(ctx, '▼', W / 2, 1550, { size: 240 * k, weight: 900, color: RED }); }
});

// 11. "today I invested R$1,000 in BB shares"
scene(53.55, (ctx, t) => {
  vgrad(ctx, '#EFE6D2', '#D9CDB4');
  calendar(ctx, 180, 330, .6 * pop(t, 53.6, .3), 'DIA', 'HOJE', { color: C.red });
  // phone with BUY button
  const bought = t > 56.91;
  phone(ctx, 720, 860, .75, (c) => {
    c.fillStyle = '#0F1218'; c.fillRect(-210, -410, 420, 820);
    text(c, 'AÇÕES BB', 0, -320, { size: 48, weight: 900, color: BBY });
    text(c, 'R$ 1.000', 0, -170, { size: 86, weight: 900, color: '#fff' });
    const pressed = bought && t < 57.4; c.fillStyle = bought ? '#2E9E5B' : '#3A8A5A'; rr(c, -160, 40 + (pressed ? 8 : 0), 320, 120, 60); c.fill();
    text(c, bought ? 'COMPRADO ✓' : 'COMPRAR', 0, 100 + (pressed ? 8 : 0), { size: 46, weight: 900, color: '#fff' });
  });
  // finger tapping
  if (t < 57.4) { const p = eio(prog(t, 56.2, 56.9)); ctx.save(); ctx.translate(lerp(1000, 760, p), lerp(1500, 1000, p)); ctx.rotate(-.5); ctx.fillStyle = SK.a; rr(ctx, -30, 0, 60, 260, 30); ctx.fill(); ctx.restore(); }
  // investor
  bust(ctx, 270, 1620, .95, { ...INV, mouth: bought && t < 58.7 ? 'smile' : (t > 58.7 ? 'open' : 'neutral'), brows: t > 58.7 ? 'up' : 'neutral', blink: blink(t, 4), look: .8 });
  // coins flying in
  if (bought) for (let i = 0; i < 8; i++) { const p = prog(t, 57.0 + i * .08, 57.6 + i * .08); if (p <= 0 || p >= 1) continue; coin(ctx, lerp(270, 720, p), lerp(1300, 700, p) - Math.sin(p * Math.PI) * 200, 40, { label: 'R$' }); }
  // the news arrives after
  if (t > 58.6) { const p = eo(prog(t, 58.6, 59.1)); ctx.save(); ctx.translate(lerp(-400, 300, p), 760); ctx.rotate(lerp(-2, -.08, p)); ctx.fillStyle = '#F7F2E6'; shadow(ctx, 30, 14, .35); ctx.fillRect(-220, -150, 440, 300); noShadow(ctx); text(ctx, 'ESCÂNDALO', 0, -80, { size: 64, weight: 900, color: RED }); text(ctx, 'BANCO DO BRASIL', 0, -10, { size: 40, weight: 900, color: C.ink }); ctx.fillStyle = 'rgba(42,26,16,.3)'; for (let k = 0; k < 3; k++) ctx.fillRect(-180, 40 + k * 30, 360 - k * 50, 12); ctx.restore(); }
  card(ctx, W / 2, 230, ['INVESTI R$ 1.000'], { t: prog(t, 56.43, 56.75), size: 80, col: C.dgreen });
});

// 12. not sure it was a good deal
scene(60.67, (ctx, t) => {
  vgrad(ctx, '#2A2F3A', '#3E4656');
  bust(ctx, W / 2, 1520, 1.4, { ...INV, brows: 'sad', mouth: 'frown', blink: blink(t, 1), look: Math.sin(t * 2) * .6 });
  // thought bubble with falling chart
  const k = eback(prog(t, 61.0, 61.5));
  ctx.save(); ctx.translate(W / 2, 600); ctx.scale(k, k); shadow(ctx, 30, 12, .3); ctx.fillStyle = '#fff'; for (const [x, y, r] of [[-200, 0, 150], [0, -60, 190], [200, 0, 150], [0, 80, 170]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } noShadow(ctx);
  ctx.beginPath(); ctx.arc(80, 300, 40, 0, 7); ctx.arc(40, 380, 24, 0, 7); ctx.fill();
  ctx.fillStyle = '#0D1117'; rr(ctx, -260, -170, 520, 330, 20); ctx.fill(); chart(ctx, -230, 130, 460, 260, [.8, .7, .74, .5, .45, .25, .1], prog(t, 61.4, 65.6), RED, { lw: 8 });
  ctx.restore();
  card(ctx, W / 2, 1060, ['BOM NEGÓCIO?'], { t: prog(t, 63.07, 63.4), size: 70, col: C.blue });
  if (t > 64.9) text(ctx, '▼', 900, 600, { size: 160 * pop(t, 64.9, .3), weight: 900, color: RED });
});

// 13. more to come — storm over the bank
scene(66.15, (ctx, t) => {
  vgrad(ctx, '#1C232D', '#3C4654');
  bank(ctx, W / 2, 1550, 1.1, 'BANCO DO BRASIL', {});
  ctx.fillStyle = '#2A313B'; ctx.fillRect(-300, 1550, W + 600, 700);
  for (let i = 0; i < 6; i++) cloud(ctx, lerp(-500 + i * 200, 100 + i * 180, eo(prog(t, 66.2, 67.4))), 380 + (i % 3) * 90, 2.2, 'rgba(50,58,70,.95)');
  if (Math.sin(t * 13) > .85) { fill(ctx, 'rgba(255,255,255,.25)'); ctx.strokeStyle = '#FFF6C9'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(600, 480); ctx.lineTo(540, 700); ctx.lineTo(600, 700); ctx.lineTo(520, 980); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(200,220,240,.4)'; ctx.lineWidth = 4; for (let i = 0; i < 80; i++) { const x = (rnd(i) * 1400 + t * 300) % 1400 - 200, y = (rnd(i + 50) * 2100 + t * 2400) % 2100 - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 16, y + 56); ctx.stroke(); }
  headline(ctx, 'TEM MUITO MAIS', 'POR VIR...', prog(t, 66.2, 66.6), { y: 250, size: 110, c2: '#FF5A4D' });
});

// 14. buy or sell?
scene(67.99, (ctx, t) => {
  vgrad(ctx, '#151A22', '#26303D');
  const pulse = 1 + .05 * Math.sin(t * 8);
  const bk = eback(prog(t, 70.07, 70.4)), sk = eback(prog(t, 71.0, 71.3));
  ctx.save(); ctx.translate(290, 1000); ctx.scale(bk * pulse, bk * pulse); ctx.fillStyle = GRN; shadow(ctx, 30, 14, .4); rr(ctx, -220, -120, 440, 240, 40); ctx.fill(); noShadow(ctx); text(ctx, '▲', 0, -40, { size: 70, color: '#fff', weight: 900 }); text(ctx, 'COMPRAR', 0, 50, { size: 64, weight: 900, color: '#fff' }); ctx.restore();
  ctx.save(); ctx.translate(790, 1000); ctx.scale(sk * pulse, sk * pulse); ctx.fillStyle = RED; shadow(ctx, 30, 14, .4); rr(ctx, -220, -120, 440, 240, 40); ctx.fill(); noShadow(ctx); text(ctx, '▼', 0, -40, { size: 70, color: '#fff', weight: 900 }); text(ctx, 'VENDER', 0, 50, { size: 64, weight: 900, color: '#fff' }); ctx.restore();
  // cursor hesitating
  const cx = 540 + Math.sin(t * 2.2) * 250, cy = 1220 + Math.cos(t * 3) * 30; ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.lineTo(28, 84); ctx.lineTo(48, 130); ctx.lineTo(68, 120); ctx.lineTo(48, 76); ctx.lineTo(85, 76); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  headline(ctx, 'E VOCÊ,', 'INVESTIDOR?', prog(t, 68.15, 68.6), { y: 330, size: 130, c2: BBY });
  text(ctx, '?', W / 2, 1000, { size: 200 * pop(t, 70.4, .3), weight: 900, color: '#fff', stroke: 14, strokeColor: '#24150C' });
});

// 15. end card
scene(71.7, (ctx, t) => {
  vgrad(ctx, '#1A120B', '#2B1D12');
  rays(ctx, W / 2, 1000, 1400, 24, t * .15, C.gold, .08);
  const k = pop(t, 71.7, .5);
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k);
  for (const [dx, a] of [[-70, 1], [70, .55]]) { ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, 0); ctx.fillStyle = C.ocean; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, 0, 50, 120, 0, 0, 7); ctx.moveTo(-120, 0); ctx.lineTo(120, 0); ctx.stroke(); ctx.restore(); }
  ctx.restore();
  text(ctx, 'MUNDO PARALELO', W / 2, 700, { size: 104 * pop(t, 71.85, .4), weight: 900, color: '#fff' });
  ctx.fillStyle = C.gold; const lw = 520 * eo(prog(t, 72.05, 72.45)); ctx.fillRect(W / 2 - lw / 2, 772, lw, 8);
  text(ctx, 'COMENTA: COMPRAR OU VENDER?', W / 2, 840, { size: 44, weight: 800, color: C.gold, ls: 2 });
  const tp = eback(prog(t, 72.3, 72.8));
  if (tp > 0) {
    ctx.save(); ctx.translate(W / 2, 1230); ctx.scale(tp, tp); ctx.rotate(-.02);
    shadow(ctx, 50, 25, .5); ctx.fillStyle = '#8DBF6E'; rr(ctx, -420, -240, 840, 480, 30); ctx.fill(); noShadow(ctx);
    ctx.save(); rr(ctx, -420, -240, 840, 480, 30); ctx.clip(); vgrad(ctx, '#8DBF6E', '#6FA356'); for (let i = 0; i < 5; i++) farm(ctx, -320 + i * 110, 160, .6, { ghost: true }); ghost(ctx, 230, 60, 1.3, t, { bag: true });
    ctx.fillStyle = 'rgba(20,10,5,.75)'; ctx.fillRect(-420, -240, 840, 110); text(ctx, 'AS FAZENDAS FANTASMAS', 0, -185, { size: 50, weight: 900, color: '#fff' });
    ctx.restore(); ctx.restore();
    const pk = (1 + .08 * Math.sin(t * 8)) * pop(t, 72.8, .35);
    ctx.save(); ctx.translate(W / 2, 1720); ctx.scale(pk, pk); ctx.fillStyle = C.red; rr(ctx, -340, -70, 680, 140, 70); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-270, -32); ctx.lineTo(-270, 32); ctx.lineTo(-215, 0); ctx.closePath(); ctx.fill();
    text(ctx, 'SIGA O CANAL', 35, 4, { size: 54, weight: 900, color: '#fff' }); ctx.restore();
  }
  fill(ctx, `rgba(0,0,0,${prog(t, 74.2, 74.7)})`);
}, { noZoom: true });

// ---------------- captions ----------------
const words = JSON.parse(fs.readFileSync(process.env.WORDS, 'utf8'));
const FIX = { 'que.': 'R$', '15': '15', 'mil': 'mil' };
words.forEach(w => { if (w.w === 'que.' && w.s > 50) w.w = 'R$'; });
const KEY = new Set(['pior', 'notícia', 'brasil', 'próxima', 'escândalo', 'banco', 'master', '112', 'fazendas', 'fantasmas', 'existem', 'empréstimos', 'bilionários', 'pagando', 'existe', '256', 'bilhões', 'dívidas', 'relatório', 'culpando', 'agro', 'negativo', 'contas', 'fechando', 'cpf', 'receita', 'federal', 'idiota', 'investidor', 'afetado', 'ações', 'derretendo', '15', 'r$', 'cair', 'investi', 'mil', 'reais', 'hoje', 'negócio', 'comprar', 'vender']);
const clean = (s) => s.toLowerCase().replace(/[.,!?…]/g, '');
const chunks = []; { let cur = []; const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  words.forEach((w) => { const txt = cur.map(x => x.w).join(' '); if (cur.length && (cur.length >= 3 || (txt + ' ' + w.w).length > 18 || w.s - cur[cur.length - 1].s > .9)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.w)) flush(); }); flush(); }
chunks.forEach((c, i) => { c.s = c[0].s; const nx = chunks[i + 1]; c.e = Math.min(nx ? nx[0].s : 71.7, c[c.length - 1].s + 1.2); });
function captions(ctx, t) {
  if (t >= 71.7) return;
  const c = chunks.find(c => t >= c.s - .02 && t < c.e); if (!c) return;
  const k = c.s < .1 ? 1 : eback(prog(t, c.s - .02, c.s + .14)); const size = 84;
  const parts = c.map(w => ({ w: w.w.toUpperCase().replace(/[.,]$/, ''), key: KEY.has(clean(w.w)) }));
  L.font(ctx, size, 900); const sp = size * .28; const widths = parts.map(p => ctx.measureText(p.w).width); const tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  const sc = Math.min(1, 960 / tot); ctx.save(); ctx.translate(W / 2, 1395); ctx.scale(k * sc, k * sc); let x = -tot / 2;
  parts.forEach((p, i) => { const cx = x + widths[i] / 2; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8; text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF', stroke: 16, strokeColor: '#24150C' }); ctx.restore(); text(ctx, p.w, cx, 0, { size, weight: 900, color: p.key ? '#FFC83D' : '#FFFFFF' }); x += widths[i] + sp; });
  ctx.restore();
}

// ---------------- render ----------------
const FPS = 30, DUR = 74.7;
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
  if (mode === 'stills') { for (const ts of process.argv.slice(3).map(Number)) { frame(ts); fs.writeFileSync(`${process.env.OUT}/m_${ts.toFixed(2).padStart(6, '0')}.jpg`, cv.toBuffer('image/jpeg', 80)); } }
  else {
    const [a, b, out] = [+process.argv[3], +process.argv[4], process.argv[5]];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    (async () => { for (let f = a; f < b; f++) { frame(f / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  }
}
