// Original flat characters, animals and props
const L = require('./lib');
const { C, clamp, lerp, rr, shadow, noShadow, text } = L;

const SK = { a: '#EDBB8E', a2: '#D49A6A', b: '#C98D5E', b2: '#A86F45', c: '#8E5A38', c2: '#6E4228' };

// ---------- front-facing bust (close-up style) ----------
// o: skin, skin2, hair, hairStyle(bald|short|long|ring), beard(null|short|long), beardCol, robe, robe2, sash, hood, wrinkles, blink(0..1), mouth(neutral|smile|open|frown), brows(neutral|sad|angry|up), look(-1..1), talk(0..1)
function bust(ctx, x, y, s, o = {}) {
  const skin = o.skin || SK.a, skin2 = o.skin2 || SK.a2;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const br = o.breath || 0; ctx.translate(0, br * 4);
  // hood back / long hair back
  if (o.hood) { ctx.fillStyle = o.hood; ctx.beginPath(); ctx.ellipse(0, -20, 175, 210, 0, 0, 7); ctx.fill(); }
  if (o.hairStyle === 'long') { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.moveTo(-120, -60); ctx.quadraticCurveTo(-150, 120, -120, 230); ctx.lineTo(120, 230); ctx.quadraticCurveTo(150, 120, 120, -60); ctx.closePath(); ctx.fill(); }
  // body
  ctx.fillStyle = o.robe || C.brown; shadow(ctx, 30, 10, .2);
  ctx.beginPath(); ctx.moveTo(-300, 520); ctx.lineTo(-290, 300); ctx.quadraticCurveTo(-280, 200, -150, 180); ctx.lineTo(150, 180); ctx.quadraticCurveTo(280, 200, 290, 300); ctx.lineTo(300, 520); ctx.closePath(); ctx.fill(); noShadow(ctx);
  if (o.robe2) { ctx.fillStyle = o.robe2; ctx.beginPath(); ctx.moveTo(-70, 180); ctx.lineTo(0, 300); ctx.lineTo(70, 180); ctx.closePath(); ctx.fill(); }
  if (o.sash) { ctx.fillStyle = o.sash; ctx.beginPath(); ctx.moveTo(-230, 200); ctx.lineTo(-140, 185); ctx.lineTo(120, 520); ctx.lineTo(-20, 520); ctx.closePath(); ctx.fill(); }
  if (o.suit) { ctx.fillStyle = '#F4F4F0'; ctx.beginPath(); ctx.moveTo(-80, 180); ctx.lineTo(0, 420); ctx.lineTo(80, 180); ctx.closePath(); ctx.fill();
    if (o.tie) { ctx.fillStyle = o.tie; ctx.beginPath(); ctx.moveTo(-18, 195); ctx.lineTo(18, 195); ctx.lineTo(30, 380); ctx.lineTo(0, 420); ctx.lineTo(-30, 380); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.moveTo(-80, 180); ctx.lineTo(0, 430); ctx.lineTo(-40, 430); ctx.lineTo(-150, 200); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(80, 180); ctx.lineTo(0, 430); ctx.lineTo(40, 430); ctx.lineTo(150, 200); ctx.closePath(); ctx.fill(); }
  // neck
  ctx.fillStyle = skin2; rr(ctx, -45, 100, 90, 100, 20); ctx.fill();
  // ears
  ctx.fillStyle = skin2; ctx.beginPath(); ctx.ellipse(-108, -5, 22, 34, 0, 0, 7); ctx.ellipse(108, -5, 22, 34, 0, 0, 7); ctx.fill();
  // head
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -10, 108, 130, 0, 0, 7); ctx.fill();
  // jaw shading
  ctx.fillStyle = 'rgba(150,80,40,.10)'; ctx.beginPath(); ctx.ellipse(30, 10, 80, 110, 0, -1.2, 1.4); ctx.fill();
  // hair
  if (o.hairStyle === 'short' || o.hairStyle === 'long') { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.ellipse(0, -75, 112, 75, 0, Math.PI, 0); ctx.lineTo(112, -40); ctx.quadraticCurveTo(60, -95, 0, -88); ctx.quadraticCurveTo(-60, -95, -112, -40); ctx.closePath(); ctx.fill(); }
  if (o.hairStyle === 'ring') { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.ellipse(-100, -40, 26, 60, -.15, 0, 7); ctx.ellipse(100, -40, 26, 60, .15, 0, 7); ctx.fill(); }
  if (o.hood) { ctx.fillStyle = o.hood; ctx.beginPath(); ctx.moveTo(-175, 60); ctx.quadraticCurveTo(-170, -220, 0, -225); ctx.quadraticCurveTo(170, -220, 175, 60); ctx.lineTo(150, 170); ctx.quadraticCurveTo(120, -150, 0, -150); ctx.quadraticCurveTo(-120, -150, -150, 170); ctx.closePath(); ctx.fill(); }
  if (o.headband) { ctx.fillStyle = o.headband; ctx.fillRect(-112, -88, 224, 22); }
  if (o.hat) { ctx.fillStyle = o.hat; ctx.beginPath(); ctx.ellipse(0, -95, 170, 30, 0, 0, 7); ctx.fill(); rr(ctx, -95, -190, 190, 110, 30); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-95, -110, 190, 20); }
  // wrinkles
  if (o.wrinkles) { ctx.strokeStyle = 'rgba(120,60,30,.35)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const yy of [-82, -68]) { ctx.beginPath(); ctx.moveTo(-40, yy); ctx.quadraticCurveTo(0, yy - 8, 40, yy); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-78, 10); ctx.lineTo(-68, 18); ctx.moveTo(78, 10); ctx.lineTo(68, 18); ctx.stroke(); }
  // eyes
  const lx = (o.look || 0) * 8, bl = clamp(o.blink || 0);
  for (const sx of [-1, 1]) {
    const ex = sx * 42 + lx, ey = -12;
    ctx.fillStyle = '#2A1A10'; ctx.beginPath(); ctx.ellipse(ex, ey, 14, 11, 0, 0, 7); ctx.fill();
    // eyelid (half-lidded style)
    const lid = lerp(o.lid == null ? .45 : o.lid, 1, bl);
    ctx.fillStyle = skin; ctx.fillRect(ex - 18, ey - 14, 36, 28 * lid - 3);
    ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 18, ey - 14 + 28 * lid - 3); ctx.lineTo(ex + 18, ey - 14 + 28 * lid - 3); ctx.stroke();
    // brows
    ctx.strokeStyle = o.browCol || o.hair || '#4A3020'; ctx.lineWidth = 10;
    const b = o.brows || 'neutral'; const bi = b === 'angry' ? 10 : b === 'sad' ? -10 : 0, bu = b === 'up' ? -12 : 0;
    ctx.beginPath(); ctx.moveTo(ex - sx * 26, ey - 36 + bu - bi * .2); ctx.lineTo(ex + sx * 22, ey - 36 + bu + bi); ctx.stroke();
  }
  // nose
  ctx.fillStyle = skin2; ctx.beginPath(); ctx.moveTo(-6, -15); ctx.lineTo(8, -15); ctx.lineTo(26, 52); ctx.quadraticCurveTo(10, 66, -14, 56); ctx.closePath(); ctx.fill();
  // beard
  if (o.beard) {
    const bc = o.beardCol || o.hair; ctx.fillStyle = bc; const len = o.beard === 'long' ? 280 : 150;
    ctx.beginPath(); ctx.moveTo(-104, 0); ctx.quadraticCurveTo(-110, len * .6, -30, len); ctx.quadraticCurveTo(0, len + 30, 30, len); ctx.quadraticCurveTo(110, len * .6, 104, 0);
    ctx.quadraticCurveTo(80, 70, 0, 72); ctx.quadraticCurveTo(-80, 70, -104, 0); ctx.closePath(); ctx.fill();
    // moustache
    ctx.beginPath(); ctx.moveTo(-60, 88); ctx.quadraticCurveTo(0, 50, 60, 88); ctx.quadraticCurveTo(0, 74, -60, 88); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 4; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 30, 120); ctx.quadraticCurveTo(i * 26, len * .7, i * 12, len - 10); ctx.stroke(); }
  }
  if (o.stubble) { ctx.fillStyle = o.stubble; ctx.beginPath(); ctx.moveTo(-100, 20); ctx.quadraticCurveTo(-90, 120, 0, 125); ctx.quadraticCurveTo(90, 120, 100, 20); ctx.quadraticCurveTo(60, 70, 0, 70); ctx.quadraticCurveTo(-60, 70, -100, 20); ctx.fill(); }
  if (o.glasses) { ctx.strokeStyle = o.glasses; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-78, -34, 66, 46, 12); ctx.roundRect(12, -34, 66, 46, 12); ctx.moveTo(-12, -16); ctx.lineTo(12, -16); ctx.moveTo(-78, -20); ctx.lineTo(-104, -24); ctx.moveTo(78, -20); ctx.lineTo(104, -24); ctx.stroke(); }
  // mouth
  const m = o.mouth || 'neutral', tk = o.talk || 0;
  ctx.strokeStyle = '#5A2A18'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  if (tk > .05 || m === 'open') { ctx.fillStyle = '#5A2A18'; ctx.beginPath(); ctx.ellipse(0, 92, 22, 6 + 16 * (m === 'open' ? 1 : tk), 0, 0, 7); ctx.fill(); }
  else if (m === 'smile') { ctx.beginPath(); ctx.moveTo(-32, 86); ctx.quadraticCurveTo(0, 108, 32, 86); ctx.stroke(); }
  else if (m === 'frown') { ctx.beginPath(); ctx.moveTo(-28, 98); ctx.quadraticCurveTo(0, 84, 28, 98); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-24, 92); ctx.lineTo(24, 92); ctx.stroke(); }
  ctx.restore();
}

// ---------- small full-body figure (crowds, walkers) ----------
// feet at (x,y). o: robe, skin, hair, beard, staff, walk(phase), arms('down'|'up'|'hammer'|'point'), armA (angle override), headwear, dir
function fig(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  const skin = o.skin || SK.a, sw = Math.sin(o.walk || 0);
  const bob = o.walk != null ? Math.abs(Math.cos(o.walk || 0)) * -6 : 0; ctx.translate(0, bob);
  // legs
  ctx.strokeStyle = o.skin2 || SK.a2; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, -60); ctx.lineTo(-14 + sw * 22, 0); ctx.moveTo(14, -60); ctx.lineTo(14 - sw * 22, 0); ctx.stroke();
  if (o.pants) { ctx.strokeStyle = o.pants; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(-14, -110); ctx.lineTo(-14 + sw * 24, -4); ctx.moveTo(14, -110); ctx.lineTo(14 - sw * 24, -4); ctx.stroke();
    ctx.fillStyle = o.robe || C.blue; rr(ctx, -40, -215, 80, 120, 22); ctx.fill(); if (o.tie) { ctx.fillStyle = o.tie; ctx.beginPath(); ctx.moveTo(-6, -205); ctx.lineTo(6, -205); ctx.lineTo(9, -140); ctx.lineTo(0, -128); ctx.lineTo(-9, -140); ctx.closePath(); ctx.fill(); } }
  else {
  // robe
  ctx.fillStyle = o.robe || C.brown; ctx.beginPath(); ctx.moveTo(-36, -210); ctx.quadraticCurveTo(-50, -100, -58, -40); ctx.lineTo(58, -40); ctx.quadraticCurveTo(50, -100, 36, -210); ctx.closePath(); ctx.fill();
  }
  if (o.belt) { ctx.fillStyle = o.belt; ctx.fillRect(-46, -130, 92, 12); }
  // arms
  ctx.strokeStyle = o.robe || C.brown; ctx.lineWidth = 20;
  const arm = (side, ang) => { ctx.save(); ctx.translate(side * 34, -195); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 85); ctx.stroke(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, 92, 11, 0, 7); ctx.fill(); ctx.restore(); };
  const a = o.arms || 'down';
  let la = .15 + sw * .35, ra = -.15 - sw * .35;
  if (a === 'up') { la = 2.7 + Math.sin(o.t * 10 || 0) * .15; ra = -2.7 - Math.cos(o.t * 10 || 0) * .15; }
  if (a === 'hammer') { ra = -1.6 - Math.max(0, Math.sin(o.t * 9)) * 1.2; la = -.9; }
  if (a === 'point') { ra = -1.7; }
  if (a === 'staff') { ra = -.5; }
  if (a === 'pray') { la = -.7; ra = .7; }
  if (o.la != null) la = o.la; if (o.ra != null) ra = o.ra;
  arm(-1, la); arm(1, ra);
  if (a === 'staff' || o.staff) { ctx.strokeStyle = '#6B4423'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(78, -330); ctx.quadraticCurveTo(95, -345, 80, -310); ctx.lineTo(78, 0); ctx.stroke(); }
  if (a === 'hammer') { ctx.save(); ctx.translate(34, -195); ctx.rotate(ra); ctx.fillStyle = '#6B4423'; ctx.fillRect(-4, 80, 8, 60); ctx.fillStyle = C.dgrey; ctx.fillRect(-18, 130, 36, 20); ctx.restore(); }
  // head
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -248, 34, 40, 0, 0, 7); ctx.fill();
  if (o.hair) { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.ellipse(0, -262, 36, 30, 0, Math.PI, 0); ctx.fill(); }
  if (o.beard) { ctx.fillStyle = o.beard; ctx.beginPath(); ctx.moveTo(-32, -245); ctx.quadraticCurveTo(-30, o.longBeard ? -170 : -200, 0, o.longBeard ? -160 : -195); ctx.quadraticCurveTo(30, o.longBeard ? -170 : -200, 32, -245); ctx.quadraticCurveTo(0, -225, -32, -245); ctx.fill(); }
  if (o.hood) { ctx.fillStyle = o.hood; ctx.beginPath(); ctx.moveTo(-44, -200); ctx.quadraticCurveTo(-50, -300, 0, -300); ctx.quadraticCurveTo(50, -300, 44, -200); ctx.lineTo(32, -205); ctx.quadraticCurveTo(36, -280, 0, -282); ctx.quadraticCurveTo(-36, -280, -32, -205); ctx.closePath(); ctx.fill(); }
  if (o.hat) { ctx.fillStyle = o.hat; ctx.beginPath(); ctx.ellipse(0, -282, 54, 10, 0, 0, 7); ctx.fill(); rr(ctx, -30, -318, 60, 38, 10); ctx.fill(); }
  // face: eyes + mouth
  ctx.fillStyle = '#2A1A10'; ctx.beginPath(); ctx.arc(-11, -252, 4.2, 0, 7); ctx.arc(13, -252, 4.2, 0, 7); ctx.fill();
  if (o.mouth === 'open') { ctx.beginPath(); ctx.ellipse(1, -230, 8, 9, 0, 0, 7); ctx.fill(); }
  else if (!o.beard) { ctx.strokeStyle = '#5A2A18'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1, -238, 9, .3, Math.PI - .3); ctx.stroke(); }
  if (o.phone) { ctx.save(); ctx.translate(34, -195); ctx.rotate(ra); ctx.fillStyle = '#222'; rr(ctx, -12, 86, 24, 40, 5); ctx.fill(); ctx.fillStyle = o.phone; ctx.fillRect(-9, 90, 18, 30); ctx.restore(); }
  if (o.glasses) { ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-11, -252, 9, 0, 7); ctx.moveTo(22, -252); ctx.arc(13, -252, 9, 0, 7); ctx.stroke(); }
  if (o.pack) { ctx.fillStyle = o.pack; rr(ctx, -70, -200, 36, 90, 12); ctx.fill(); }
  ctx.restore();
}

// ---------- animals (side view, facing right) ----------
function legs(ctx, xs, top, len, ph, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; xs.forEach((x, i) => { const a = Math.sin(ph + i * Math.PI) * .35; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + Math.sin(a) * len, top + Math.cos(a) * len); ctx.stroke(); }); }
function elephant(ctx, x, y, s, ph = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = '#9A9AA0', c2 = '#7E7E86';
  legs(ctx, [-70, -30, 40, 80], -90, 90, ph, c2, 34);
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -140, 130, 85, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(125, -170, 60, 58, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(165, -160); ctx.quadraticCurveTo(200 + Math.sin(ph) * 10, -80, 185, -40); ctx.stroke();
  ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(95, -165, 38, 55, -.2, 0, 7); ctx.fill();
  ctx.fillStyle = '#2A1A10'; ctx.beginPath(); ctx.arc(145, -185, 6, 0, 7); ctx.fill();
  ctx.fillStyle = '#F5EEDC'; ctx.beginPath(); ctx.moveTo(160, -135); ctx.quadraticCurveTo(190, -120, 200, -140); ctx.lineTo(165, -150); ctx.fill();
  ctx.restore();
}
function giraffe(ctx, x, y, s, ph = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = '#E8B54A', sp = '#B9782C';
  legs(ctx, [-50, -25, 35, 60], -120, 120, ph, c, 16);
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(5, -150, 85, 50, -.1, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(65, -170); ctx.rotate(-.35 + Math.sin(ph) * .05); ctx.fillRect(-14, -230, 34, 240);
  ctx.beginPath(); ctx.ellipse(18, -240, 42, 24, .3, 0, 7); ctx.fill();
  ctx.strokeStyle = sp; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-2, -255); ctx.lineTo(-6, -285); ctx.moveTo(12, -258); ctx.lineTo(10, -290); ctx.stroke();
  ctx.fillStyle = '#2A1A10'; ctx.beginPath(); ctx.arc(22, -250, 5, 0, 7); ctx.fill();
  ctx.fillStyle = sp; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(3 + (i % 2) * 10, -40 - i * 40, 8, 0, 7); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = sp; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-50 + (i % 4) * 32, -165 + Math.floor(i / 4) * 30, 11, 0, 7); ctx.fill(); }
  ctx.restore();
}
function lion(ctx, x, y, s, ph = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = '#D9A24A', m = '#9C5A23';
  legs(ctx, [-60, -30, 30, 60], -70, 70, ph, c, 20);
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -100, 95, 45, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-90, -110); ctx.quadraticCurveTo(-140, -150 + Math.sin(ph) * 20, -130, -170); ctx.stroke();
  ctx.fillStyle = m; ctx.beginPath(); ctx.arc(95, -130, 60, 0, 7); ctx.fill();
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(108, -128, 36, 0, 7); ctx.fill();
  ctx.fillStyle = '#2A1A10'; ctx.beginPath(); ctx.arc(118, -138, 5, 0, 7); ctx.arc(140, -122, 6, 0, 7); ctx.fill();
  ctx.restore();
}
function sheep(ctx, x, y, s, ph = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  legs(ctx, [-30, -10, 20, 40], -50, 50, ph, '#3A2A20', 10);
  ctx.fillStyle = '#F4F0E6'; for (const [dx, dy, r] of [[-30, -80, 34], [0, -92, 38], [30, -80, 34], [0, -66, 34]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#3A2A20'; ctx.beginPath(); ctx.ellipse(62, -92, 20, 24, .3, 0, 7); ctx.fill();
  ctx.restore();
}
function dove(ctx, x, y, s, flap) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#FFFDF7';
  ctx.beginPath(); ctx.ellipse(0, 0, 40, 18, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(36, -8, 14, 0, 7); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(48, -8); ctx.lineTo(62, -4); ctx.lineTo(48, 0); ctx.fill();
  ctx.fillStyle = '#ECE6D8'; const f = Math.sin(flap); ctx.beginPath(); ctx.moveTo(-10, -4); ctx.quadraticCurveTo(-20, -60 * f, -50, -70 * f); ctx.quadraticCurveTo(0, -30 * f, 20, -4); ctx.fill();
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.ellipse(66, 2, 10, 4, .4, 0, 7); ctx.fill();
  ctx.restore();
}

// ---------- props ----------
function ark(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.rot) ctx.rotate(o.rot);
  const build = o.build == null ? 1 : o.build;
  // hull
  const hull = () => { ctx.beginPath(); ctx.moveTo(-420, -120); ctx.lineTo(420, -120); ctx.quadraticCurveTo(400, 40, 300, 60); ctx.lineTo(-300, 60); ctx.quadraticCurveTo(-400, 40, -420, -120); ctx.closePath(); };
  if (build < 1) { // ribs being built
    ctx.strokeStyle = '#8A5A33'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    const n = 13; for (let i = 0; i < n; i++) { if (i / n > build * 1.4) break; const xx = -380 + i * 63; ctx.beginPath(); ctx.moveTo(xx, -120); ctx.quadraticCurveTo(xx * .95, 30, xx * .72, 60); ctx.stroke(); }
    ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-300, 60); ctx.lineTo(lerp(-300, 300, clamp(build * 2)), 60); ctx.stroke();
    ctx.save(); hull(); ctx.clip(); ctx.fillStyle = '#9C6B3F'; const ph = clamp(build * 1.4 - .4); for (let i = 0; i < 6; i++) { if (i / 6 > ph) break; ctx.fillRect(-430, 60 - (i + 1) * 30, 860, 26); } ctx.restore();
  } else {
    shadow(ctx, 30, 15, .3); ctx.fillStyle = '#8A5A33'; hull(); ctx.fill(); noShadow(ctx);
    ctx.strokeStyle = 'rgba(60,35,15,.35)'; ctx.lineWidth = 5; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-410, -120 + i * 30); ctx.lineTo(410, -120 + i * 30); ctx.stroke(); }
    // house
    ctx.fillStyle = '#A8754A'; ctx.fillRect(-260, -260, 520, 140); ctx.fillStyle = '#6E4228'; ctx.beginPath(); ctx.moveTo(-300, -255); ctx.lineTo(0, -350); ctx.lineTo(300, -255); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3E2A1E'; for (let i = 0; i < 5; i++) rr(ctx, -220 + i * 95, -225, 50, 60, 8), ctx.fill();
    if (o.door) { ctx.fillStyle = '#3E2A1E'; ctx.fillRect(-60, -110, 120, 110); }
  }
  ctx.restore();
}
function mountains(ctx, base, peaks, col, snow) {
  peaks.forEach(([x, h, w]) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x, base - h); ctx.lineTo(x + w, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(x, base - h); ctx.lineTo(x + w, base); ctx.lineTo(x + w * .2, base); ctx.closePath(); ctx.fill();
    if (snow) { const k = .28; ctx.fillStyle = snow; ctx.beginPath(); ctx.moveTo(x, base - h); ctx.lineTo(x + w * k, base - h * (1 - k)); ctx.lineTo(x + w * k * .3, base - h * (1 - k * .7)); ctx.lineTo(x - w * k * .2, base - h * (1 - k)); ctx.lineTo(x - w * k, base - h * (1 - k)); ctx.closePath(); ctx.fill(); }
  });
}
function cloud(ctx, x, y, s, col = 'rgba(255,255,255,.9)') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; for (const [dx, dy, r] of [[-80, 10, 55], [-20, -20, 75], [60, 0, 60], [110, 20, 40], [0, 25, 60]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, 7); ctx.fill(); } ctx.restore(); }
function rainbow(ctx, x, y, r, a) { ctx.save(); ctx.globalAlpha *= a; ['#E5534B', '#F0A04B', '#F5D547', '#6BBF59', '#4A90C2', '#7B5EA7'].forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(x, y, r - i * 26, Math.PI, 0); ctx.stroke(); }); ctx.restore(); }
function pyramid(ctx, x, base, h, col = '#D9B26F') { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - h, base); ctx.lineTo(x, base - h); ctx.lineTo(x + h, base); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.moveTo(x, base - h); ctx.lineTo(x + h, base); ctx.lineTo(x + h * .1, base); ctx.closePath(); ctx.fill(); }
function scroll(ctx, x, y, w, h, open, title) {
  ctx.save(); ctx.translate(x, y); const ww = w * open;
  shadow(ctx, 30, 12, .3); ctx.fillStyle = '#F1E2BC'; ctx.fillRect(-ww / 2, -h / 2, ww, h); noShadow(ctx);
  ctx.save(); ctx.beginPath(); ctx.rect(-ww / 2, -h / 2, ww, h); ctx.clip();
  if (title) text(ctx, title, 0, -h / 2 + 70, { size: 46, weight: 900, color: C.dred });
  ctx.fillStyle = 'rgba(62,42,30,.35)'; for (let i = 0; i < 9; i++) ctx.fillRect(-w / 2 + 70, -h / 2 + 130 + i * 40, w - 140 - (i % 3) * 60, 12);
  ctx.restore();
  ctx.fillStyle = '#8A5A33'; for (const sx of [-1, 1]) { rr(ctx, sx * ww / 2 - 26, -h / 2 - 30, 52, h + 60, 26); ctx.fill(); }
  ctx.restore();
}
module.exports = { SK, bust, fig, elephant, giraffe, lion, sheep, dove, ark, mountains, cloud, rainbow, pyramid, scroll };
