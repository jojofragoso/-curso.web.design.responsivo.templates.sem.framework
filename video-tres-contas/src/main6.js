// "3 contas" — minimalist black / white line-art aesthetic
const L = require('./lib');
const { W, H, clamp, lerp, prog, eo, eio, eback, rnd, rr, text, fitText, createCanvas } = L;
const fs = require('fs'); const { spawn } = require('child_process');

const WH = '#F4F4F2', GR = '#8C8C8C', DG = '#3A3A3A', FLOOR = 1450;
const pop = (t, a, d = .35) => eback(prog(t, a, a + d));
function glow(ctx, b = 18) { ctx.shadowColor = 'rgba(255,255,255,.75)'; ctx.shadowBlur = b; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
function noGlow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; }
function stroke(ctx, w = 4, c = WH) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
function label(ctx, s, x, y, a = 1, o = {}) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; text(ctx, s, x, y, { size: o.size || 30, weight: o.weight || 700, color: o.color || '#C9C9C9', ls: o.ls == null ? 9 : o.ls, align: o.align }); ctx.restore(); }
function pill(ctx, s, x, y, t, o = {}) { const k = eback(clamp(t)); if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const size = o.size || 30; L.font(ctx, size, 800); ctx.letterSpacing = '3px'; const w = ctx.measureText(s).width + size * 1.6, h = size * 1.75; ctx.letterSpacing = '0px'; glow(ctx, 14); ctx.fillStyle = o.bg || WH; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); noGlow(ctx); text(ctx, s, 0, 2, { size, weight: 800, color: o.col || '#111', ls: 3 }); ctx.restore(); }
function bigNum(ctx, s, x, y, size, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; glow(ctx, 22); text(ctx, s, x, y, { size, weight: 800, color: WH }); noGlow(ctx); ctx.restore(); }
function spot(ctx, x, a = 1, w0 = 50, w1 = 260) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const g = ctx.createLinearGradient(0, 0, 0, FLOOR); g.addColorStop(0, 'rgba(255,255,255,.02)'); g.addColorStop(1, 'rgba(255,255,255,.16)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w0, -50); ctx.lineTo(x + w0, -50); ctx.lineTo(x + w1, FLOOR); ctx.lineTo(x - w1, FLOOR); ctx.closePath(); ctx.fill();
  const e = ctx.createRadialGradient(x, FLOOR, 10, x, FLOOR, w1 * 1.1); e.addColorStop(0, 'rgba(255,255,255,.22)'); e.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = e; ctx.beginPath(); ctx.ellipse(x, FLOOR, w1 * 1.1, 40, 0, 0, 7); ctx.fill(); ctx.restore(); }
function floor(ctx, a = 1) { ctx.save(); ctx.globalAlpha *= a; stroke(ctx, 2, 'rgba(255,255,255,.25)'); ctx.beginPath(); ctx.moveTo(40, FLOOR); ctx.lineTo(W - 40, FLOOR); ctx.stroke(); ctx.restore(); }
function person(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y + (o.bob || 0)); ctx.scale(s, s); ctx.globalAlpha *= o.a == null ? 1 : o.a; glow(ctx, 20); ctx.fillStyle = o.dim ? GR : WH;
  rr(ctx, -34, -120, 68, 120, 30); ctx.fill(); ctx.beginPath(); ctx.arc(0, -150, 26, 0, 7); ctx.fill();
  if (o.arms) { stroke(ctx, 14, o.dim ? GR : WH); ctx.beginPath(); ctx.moveTo(-26, -100); ctx.lineTo(-62, -175); ctx.moveTo(26, -100); ctx.lineTo(62, -175); ctx.stroke(); }
  noGlow(ctx); ctx.restore(); }
function box(ctx, x, y, w, h, p, o = {}) { // outline rect drawn progressively
  if (p <= 0) return; ctx.save(); glow(ctx, o.glow == null ? 16 : o.glow); stroke(ctx, o.lw || 4, o.col || WH); if (o.dash) ctx.setLineDash(o.dash);
  const per = 2 * (w + h), len = per * clamp(p); ctx.beginPath(); const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; let acc = 0; ctx.moveTo(x, y);
  for (let i = 1; i < 5; i++) { const seg = i % 2 ? w : h; if (acc + seg >= len) { const f = (len - acc) / seg; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break; } ctx.lineTo(...pts[i]); acc += seg; }
  ctx.stroke(); ctx.setLineDash([]); noGlow(ctx); ctx.restore(); }
function rbox(ctx, x, y, w, h, r, a = 1, o = {}) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; glow(ctx, 16); stroke(ctx, o.lw || 4, o.col || WH); if (o.dash) ctx.setLineDash(o.dash); rr(ctx, x, y, w, h, r); if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); } ctx.stroke(); ctx.setLineDash([]); noGlow(ctx); ctx.restore(); }
function check(ctx, x, y, s, p) { if (p <= 0) return; ctx.save(); glow(ctx, 12); stroke(ctx, 6); ctx.beginPath(); ctx.moveTo(x - 16 * s, y); const a = clamp(p * 2), b = clamp(p * 2 - 1); ctx.lineTo(lerp(x - 16 * s, x - 4 * s, a), lerp(y, y + 12 * s, a)); if (b > 0) ctx.lineTo(lerp(x - 4 * s, x + 20 * s, b), lerp(y + 12 * s, y - 16 * s, b)); ctx.stroke(); noGlow(ctx); ctx.restore(); }
function coinO(ctx, x, y, r, a = 1, fillIt) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; glow(ctx, 14); stroke(ctx, 4); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (fillIt) { ctx.fillStyle = WH; ctx.fill(); } ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r * .55, 0, 7); ctx.strokeStyle = fillIt ? '#111' : WH; ctx.stroke(); noGlow(ctx); ctx.restore(); }
function arrow(ctx, x1, y1, x2, y2, p, dash) { if (p <= 0) return; const x = lerp(x1, x2, p), y = lerp(y1, y2, p); ctx.save(); glow(ctx, 10); stroke(ctx, 4); if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 22 * Math.cos(a - .5), y - 22 * Math.sin(a - .5)); ctx.moveTo(x, y); ctx.lineTo(x - 22 * Math.cos(a + .5), y - 22 * Math.sin(a + .5)); ctx.stroke(); noGlow(ctx); ctx.restore(); }
function phoneO(ctx, x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rbox(ctx, -60, -110, 120, 220, 22, a); rbox(ctx, -20, -96, 40, 8, 4, a); ctx.save(); ctx.globalAlpha *= a; glow(ctx, 10); stroke(ctx, 3); ctx.beginPath(); ctx.arc(0, 88, 8, 0, 7); ctx.stroke(); noGlow(ctx); ctx.restore(); ctx.restore(); }
function vault(ctx, x, y, s, t, a, spin = 0) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rbox(ctx, -170, -170, 340, 340, 26, a); rbox(ctx, -140, -140, 280, 280, 18, a * .6); ctx.save(); ctx.globalAlpha *= a; glow(ctx, 14); stroke(ctx, 5); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.stroke(); ctx.rotate(spin); for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -100); ctx.stroke(); } noGlow(ctx); ctx.restore(); ctx.restore(); }
function umbrella(ctx, x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; glow(ctx, 16); stroke(ctx, 5); ctx.beginPath(); ctx.arc(0, 0, 160, Math.PI, 0); for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(120 - i * 80, -30, 80 - i * 80, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -160); ctx.lineTo(0, 150); ctx.arc(-24, 150, 24, 0, Math.PI); ctx.stroke(); noGlow(ctx); ctx.restore(); }
function bars(ctx, x0, y0, n, w, gap, hs, p, o = {}) { for (let i = 0; i < n; i++) { const q = clamp(p * n - i); if (q <= 0) break; const h = hs[i] * eo(q); rbox(ctx, x0 + i * (w + gap), y0 - h, w, h, 6, 1, { fill: i === n - 1 && o.lastFill ? WH : null }); ctx.save(); glow(ctx, 10); ctx.fillStyle = WH; ctx.beginPath(); ctx.arc(x0 + i * (w + gap) + w / 2, y0 - h - 22, 9, 0, 7); ctx.fill(); noGlow(ctx); ctx.restore(); } }
function accountCard(ctx, x, y, num, name, t, t0, o = {}) { // tall account card
  const p = eo(prog(t, t0, t0 + .7)); if (p <= 0) return; const w = o.w || 260, h = o.h || 360;
  box(ctx, x - w / 2, y - h / 2, w, h, p, { dash: o.dim ? [10, 10] : null, col: o.dim ? GR : WH });
  label(ctx, num, x, y - h / 2 + 50, prog(t, t0 + .3, t0 + .7), { size: 60, weight: 800, color: o.dim ? GR : WH, ls: 2 });
  if (name) label(ctx, name, x, y + h / 2 - 50, prog(t, t0 + .4, t0 + .8), { size: fitText(ctx, name, w - 30, 26, 700), ls: 4, color: o.dim ? GR : '#D8D8D8' });
  if (o.icon) { ctx.save(); ctx.globalAlpha *= prog(t, t0 + .4, t0 + .8); o.icon(ctx, x, y + 10); ctx.restore(); }
}
const ICONS = {
  card: (ctx, x, y) => { rbox(ctx, x - 70, y - 45, 140, 90, 12); ctx.save(); glow(ctx, 8); stroke(ctx, 4); ctx.beginPath(); ctx.moveTo(x - 70, y - 18); ctx.lineTo(x + 70, y - 18); ctx.moveTo(x - 50, y + 22); ctx.lineTo(x - 10, y + 22); ctx.stroke(); noGlow(ctx); ctx.restore(); },
  safe: (ctx, x, y) => vault(ctx, x, y, .32, 0, 1),
  chart: (ctx, x, y) => { ctx.save(); glow(ctx, 10); stroke(ctx, 5); ctx.beginPath(); ctx.moveTo(x - 70, y + 40); ctx.lineTo(x - 30, y); ctx.lineTo(x + 5, y + 20); ctx.lineTo(x + 70, y - 45); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 70, y - 45); ctx.lineTo(x + 40, y - 45); ctx.moveTo(x + 70, y - 45); ctx.lineTo(x + 70, y - 15); ctx.stroke(); noGlow(ctx); ctx.restore(); },
};

const S = []; const scene = (start, fn, o = {}) => S.push({ start, fn, ...o });

// 0. where should I keep my money?
scene(0, (ctx, t) => {
  spot(ctx, W / 2, 1); floor(ctx);
  person(ctx, W / 2, FLOOR, 1.3, { bob: Math.sin(t * 2) * 3 });
  // coin floating above head
  coinO(ctx, W / 2, 1050 + Math.sin(t * 3) * 10, 46, pop(t, .2));
  [W / 2 - 330, W / 2, W / 2 + 330].forEach((x, i) => { rbox(ctx, x - 110, 560, 220, 260, 18, prog(t, .3 + i * .15, .6 + i * .15), { dash: [10, 10], col: GR }); label(ctx, '?', x, 690, prog(t, .4 + i * .15, .7 + i * .15), { size: 90, weight: 800, color: GR, ls: 0 }); });
  label(ctx, 'ONDE GUARDAR', W / 2, 420, prog(t, .05, .4)); label(ctx, 'O SEU DINHEIRO?', W / 2, 468, prog(t, .15, .5));
});

// 1. never rich at 20 without these 3 accounts
scene(1.28, (ctx, t) => {
  spot(ctx, 200, 1, 40, 200); floor(ctx);
  person(ctx, 200, FLOOR, 1.1, { dim: t < 4.08 });
  label(ctx, 'AOS 20 ANOS', 200, 1180, prog(t, 2.96, 3.3));
  // patrimony label + counter (stuck)
  label(ctx, 'PATRIMÔNIO', 200, 980, prog(t, 1.9, 2.3), { size: 24 }); bigNum(ctx, 'R$ 0', 200, 1040, 54, prog(t, 2.0, 2.4));
  const xs = [480, 700, 920];
  xs.forEach((x, i) => accountCard(ctx, x, 1180, '0' + (i + 1), '', t, 4.08 + i * .1, { w: 190, h: 280 }));
  label(ctx, 'VOCÊ NUNCA FICARÁ', W / 2, 420, prog(t, 1.6, 2.0)); label(ctx, 'RICO', W / 2, 500, prog(t, 2.4, 2.7), { size: 70, weight: 800, color: WH, ls: 14 });
  pill(ctx, 'SEM ESSAS 3 CONTAS', W / 2, 640, prog(t, 4.08, 4.4));
});

// 2. account 1: checking account — salary, no fees, easy on the phone
scene(4.8, (ctx, t) => {
  spot(ctx, 330, 1); floor(ctx);
  accountCard(ctx, 330, 1180, '01', 'CONTA CORRENTE', t, 4.9, { icon: ICONS.card });
  label(ctx, 'A PRIMEIRA', W / 2, 360, prog(t, 4.85, 5.2));
  bigNum(ctx, 'CONTA CORRENTE', W / 2, 440, 72, prog(t, 5.52, 5.9));
  // salary flowing in
  if (t > 6.8) { pill(ctx, 'SALÁRIO', 820, 700, prog(t, 7.2, 7.5)); for (let i = 0; i < 4; i++) { const p = ((t - 7.4) * .9 + i / 4) % 1; if (t < 7.4) continue; coinO(ctx, lerp(820, 380, p), lerp(780, 1100, p) - Math.sin(p * Math.PI) * 80, 22, 1 - p * .3); } }
  // checklist
  const rows = [['SEM TAXAS', 9.36], ['FÁCIL NO CELULAR', 10.58]];
  rows.forEach(([s, t0], i) => { const y = 1040 + i * 150; label(ctx, s, 640, y, prog(t, t0 - .2, t0 + .2), { align: 'left', size: 32, color: WH, ls: 5 }); check(ctx, 600, y, 1.2, prog(t, t0, t0 + .35)); });
  phoneO(ctx, 880, 1340, .8, prog(t, 10.98, 11.3));
});

// 3. account 2: savings with good interest — emergency reserve 4–5 months — life's twists
scene(11.38, (ctx, t) => {
  const twist = prog(t, 18.9, 19.3);
  spot(ctx, 330, 1); floor(ctx);
  accountCard(ctx, 330, 1180, '02', 'POUPANÇA', t, 11.45, { icon: ICONS.safe });
  label(ctx, 'A SEGUNDA', W / 2, 360, prog(t, 11.42, 11.8));
  bigNum(ctx, 'CONTA POUPANÇA', W / 2, 440, 72, prog(t, 12.18, 12.5));
  pill(ctx, 'BONS JUROS', W / 2, 560, prog(t, 12.9, 13.2) * (1 - prog(t, 14.8, 15.0)));
  pill(ctx, 'RESERVA DE EMERGÊNCIA', W / 2, 560, prog(t, 14.98, 15.3));
  // month boxes (5) filling with coins
  if (t > 15.9 && twist < 1) { ctx.save(); ctx.globalAlpha = 1 - twist; for (let i = 0; i < 5; i++) { const x = 560 + (i % 3) * 140, y = 860 + Math.floor(i / 3) * 160; rbox(ctx, x - 55, y - 55, 110, 110, 14, prog(t, 16.0 + i * .1, 16.3 + i * .1)); coinO(ctx, x, y, 30, prog(t, 16.9 + i * .25, 17.2 + i * .25), i < 4); } bigNum(ctx, '4–5', 760, 1330, 64, prog(t, 17.38, 17.7)); label(ctx, 'MESES DE GASTOS', 760, 1385, prog(t, 17.62, 18.0), { size: 22 }); ctx.restore(); }
  // life's twist: a zigzag path + umbrella protecting the person
  if (twist > 0) {
    ctx.save(); ctx.globalAlpha = twist;
    person(ctx, 760, FLOOR, 1.1); spot(ctx, 760, 1, 40, 200);
    // lightning zigzag
    const z = prog(t, 19.3, 20.6); ctx.save(); glow(ctx, 18); stroke(ctx, 6); ctx.beginPath(); const P = [[980, 700], [880, 900], [960, 920], [840, 1120]]; ctx.moveTo(...P[0]); for (let i = 1; i < 4; i++) { const q = clamp(z * 3 - (i - 1)); if (q <= 0) break; ctx.lineTo(lerp(P[i - 1][0], P[i][0], q), lerp(P[i - 1][1], P[i][1], q)); } ctx.stroke(); noGlow(ctx); ctx.restore();
    umbrella(ctx, 760, 1170, .9, prog(t, 20.4, 20.9));
    label(ctx, 'IMPREVISTOS', 760, 1520, prog(t, 20.34, 20.7));
    ctx.restore();
  }
});

// 4. account 3: investment account with tax advantages — growth over time — millionaire
scene(21.46, (ctx, t) => {
  spot(ctx, 200, 1, 40, 200); floor(ctx);
  accountCard(ctx, 200, 1240, '03', 'INVESTIMENTOS', t, 21.5, { icon: ICONS.chart, w: 230, h: 320 });
  label(ctx, 'TERCEIRO', W / 2, 360, prog(t, 21.48, 21.8));
  bigNum(ctx, 'CONTA DE INVESTIMENTOS', W / 2, 440, 60, prog(t, 22.1, 22.5));
  pill(ctx, 'VANTAGENS FISCAIS', W / 2, 560, prog(t, 23.22, 23.5) * (1 - prog(t, 27.9, 28.1)));
  // growth bars over time
  const hs = [70, 95, 125, 165, 215, 280, 360, 450, 560];
  bars(ctx, 380, FLOOR - 40, 9, 56, 18, hs, prog(t, 24.9, 28.6), { lastFill: t > 29.0 });
  label(ctx, 'ANO 1', 410, FLOOR - 10, prog(t, 25.0, 25.3), { size: 20, ls: 4 }); label(ctx, 'ANO 30', 980, FLOOR - 10, prog(t, 27.6, 27.9), { size: 20, ls: 4 });
  label(ctx, 'AO LONGO DO TEMPO', 690, 760, prog(t, 25.87, 26.2) * (1 - prog(t, 27.6, 27.8)));
  pill(ctx, 'MERCADO DE AÇÕES', 690, 700, prog(t, 26.99, 27.3) * (1 - prog(t, 28.1, 28.2)));
  pill(ctx, 'COM SORTE', W / 2, 560, prog(t, 28.19, 28.5));
  // millionaire
  if (t > 28.9) { const m = Math.floor(eio(prog(t, 29.0, 29.9)) * 1000000); label(ctx, 'PATRIMÔNIO', 690, 690, prog(t, 28.9, 29.2), { size: 24 }); bigNum(ctx, 'R$ ' + m.toLocaleString('pt-BR'), 690, 770, 76, prog(t, 28.9, 29.2)); }
  pill(ctx, 'LIVRE DE IMPOSTOS', 690, 880, prog(t, 29.55, 29.85), { bg: '#111', col: WH });
  if (t > 29.9) rbox(ctx, 690 - 190, 880 - 27, 380, 54, 27, 1);
});

// 5. recap + end card
scene(30.6, (ctx, t) => {
  const k = prog(t, 30.65, 31.2);
  const items = [['01', 'CORRENTE', ICONS.card], ['02', 'POUPANÇA', ICONS.safe], ['03', 'INVESTIMENTOS', ICONS.chart]];
  items.forEach(([n, s, ic], i) => { const x = 220 + i * 320; accountCard(ctx, x, 760, n, s, t, 30.65 + i * .12, { icon: ic, w: 260, h: 340 }); });
  spot(ctx, W / 2, prog(t, 31.4, 31.9), 40, 200); floor(ctx, prog(t, 31.4, 31.9));
  person(ctx, W / 2, FLOOR, 1.2, { arms: true, a: prog(t, 31.5, 31.9) });
  label(ctx, 'RESUMO', W / 2, 460, k);
  label(ctx, 'MUNDO PARALELO', W / 2, 1600, prog(t, 32.0, 32.5), { size: 48, weight: 800, color: WH, ls: 12 });
  pill(ctx, 'SIGA O CANAL', W / 2, 1700, prog(t, 32.4, 32.8));
  ctx.fillStyle = `rgba(0,0,0,${prog(t, 33.9, 34.4)})`; ctx.fillRect(0, 0, W, H);
});

// ---------------- captions (discreet) ----------------
const words = JSON.parse(fs.readFileSync(process.env.WORDS, 'utf8'));
words.forEach(w => { if (w.w === 'taxa') w.w = 'taxas'; if (w.w === 'seis.') w.w = 'seja'; if (w.w === 'seu' && w.s > 28.5) w.w = 'você'; });
const KEY = new Set(['dinheiro', 'rico', '20', 'três', 'contas', 'corrente', 'salário', 'taxas', 'celular', 'poupança', 'juros', 'reserva', 'emergência', '4', '5', 'meses', 'guinada', 'inesperada', 'investimentos', 'fiscais', 'tempo', 'ações', 'sorte', 'milionário', 'impostos']);
const clean = (s) => s.toLowerCase().replace(/[.,!?…]/g, '');
const chunks = []; { let cur = []; const flush = () => { if (cur.length) chunks.push(cur); cur = []; };
  words.forEach((w) => { const txt = cur.map(x => x.w).join(' '); if (cur.length && (cur.length >= 4 || (txt + ' ' + w.w).length > 24 || w.s - cur[cur.length - 1].s > .9)) flush(); cur.push(w); if (/[.,!?:]$/.test(w.w)) flush(); }); flush(); }
chunks.forEach((c, i) => { c.s = c[0].s; const nx = chunks[i + 1]; c.e = Math.min(nx ? nx[0].s : 30.6, c[c.length - 1].s + 1.2); });
function captions(ctx, t) {
  if (t >= 30.6) return;
  const c = chunks.find(c => t >= c.s - .02 && t < c.e); if (!c) return;
  const a = prog(t, c.s - .02, c.s + .12); const size = 50;
  const parts = c.map(w => ({ w: w.w.toUpperCase().replace(/[.,]$/, ''), key: KEY.has(clean(w.w)), on: t >= w.s }));
  L.font(ctx, size, 700); ctx.letterSpacing = '2px'; const sp = size * .4; const widths = parts.map(p => ctx.measureText(p.w).width); ctx.letterSpacing = '0px';
  const tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1); const sc = Math.min(1, 940 / tot);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 1700 + (1 - a) * 12); ctx.scale(sc, sc); let x = -tot / 2;
  parts.forEach((p, i) => { const cx = x + widths[i] / 2;
    if (p.key && p.on) { const pw = widths[i] + 34, ph = size * 1.5; glow(ctx, 14); ctx.fillStyle = WH; rr(ctx, cx - pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fill(); noGlow(ctx); text(ctx, p.w, cx, 2, { size, weight: 800, color: '#111', ls: 2 }); }
    else text(ctx, p.w, cx, 2, { size, weight: 700, color: p.on ? WH : '#6E6E6E', ls: 2 });
    x += widths[i] + sp; });
  ctx.restore();
}

// ---------------- render ----------------
const FPS = 30, DUR = 34.4;
S.forEach((s, i) => s.end = S[i + 1] ? S[i + 1].start : DUR);
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
const vign = (() => { const c = createCanvas(W, H), x = c.getContext('2d'); const g = x.createRadialGradient(W / 2, H * .45, 200, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); x.fillStyle = g; x.fillRect(0, 0, W, H); return c; })();
function frame(t) {
  const s = S.filter(s => t >= s.start).pop(); const lt = t - s.start, d = s.end - s.start;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; noGlow(ctx);
  ctx.fillStyle = '#060606'; ctx.fillRect(0, 0, W, H);
  ctx.save(); const z = 1 + .03 * (lt / d); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  s.fn(ctx, t, lt, d); ctx.restore();
  ctx.drawImage(vign, 0, 0);
  if (lt < .25 && s.start > 0) { ctx.fillStyle = `rgba(0,0,0,${1 - lt / .25})`; ctx.fillRect(0, 0, W, H); }
  captions(ctx, t);
}
if (require.main === module) {
  const mode = process.argv[2];
  if (mode === 'stills') { for (const ts of process.argv.slice(3).map(Number)) { frame(ts); fs.writeFileSync(`${process.env.OUT}/n_${ts.toFixed(2).padStart(6, '0')}.jpg`, cv.toBuffer('image/jpeg', 85)); } }
  else {
    const [a, b, out] = [+process.argv[3], +process.argv[4], process.argv[5]];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '' + FPS, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    (async () => { for (let f = a; f < b; f++) { frame(f / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); })();
  }
}
