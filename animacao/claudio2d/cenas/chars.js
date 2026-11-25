// Personagens em 2D chapado (traço grosso, cores lisas) desenhados em SVG.
// Coordenadas locais: pés em (0,0), cabeça do Cláudio em (0,-500).
const OL = '#2b211d', SW = 7;
const C = {
  skin: '#f1b98f', skinSh: '#d99c74', beard: '#3d2b22', beardHi: '#523a2e', hair: '#3a251b',
  cap: '#24242a', capHi: '#3a3a44', shirt: '#26262c', shirtSh: '#18181c', jeans: '#6f95cb',
  jeansSh: '#5579af', sole: '#2d2d33', strap: '#2f7ed8', bag: '#7a5aa8', spot: '#d9534f',
  eyeBag: '#b48a9a', iris: '#6b4a2e', white: '#ffffff',
};
const st = (f, w = SW) => `fill="${f}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const R = (d) => d * Math.PI / 180;

// ---------- CABEÇA DO CLÁUDIO ----------
// o: {mouth, eyes, lookX, lookY, brow, sweat, blink, flush}
function claudioHead(o = {}) {
  const m = o.mouth || 'smile', e = o.eyes || 'sleepy', lx = o.lookX || 0, ly = o.lookY || 0;
  const brow = o.brow || 0; // >0 = preocupado (pontas internas sobem)
  let s = '';
  // cabelo atrás (cachos saindo pelas laterais)
  const curls = (side) => {
    let c = '';
    [[-60, 18], [-30, 22], [2, 20], [32, 17]].forEach(([y, r], i) => {
      c += `<circle cx="${side * (94 + (i % 2) * 8)}" cy="${y}" r="${r}" ${st(C.hair, 6)}/>`;
    });
    return c;
  };
  s += curls(-1) + curls(1);
  // orelhas
  s += `<ellipse cx="-92" cy="8" rx="18" ry="24" ${st(C.skin, 6)}/><ellipse cx="92" cy="8" rx="18" ry="24" ${st(C.skin, 6)}/>`;
  // rosto
  s += `<path d="M-88 -50 Q-92 70 -40 100 Q0 118 40 100 Q92 70 88 -50 Q80 -110 0 -112 Q-80 -110 -88 -50Z" ${st(C.skin)}/>`;
  // sombra lateral do rosto
  s += `<path d="M60 -80 Q90 -20 70 60 Q84 10 80 -50Z" fill="${C.skinSh}" opacity=".6"/>`;
  // barba
  s += `<path d="M-86 0 Q-90 80 -38 104 Q0 122 38 104 Q90 80 86 0 Q78 34 56 40 Q30 30 0 32 Q-30 30 -56 40 Q-78 34 -86 0Z" ${st(C.beard, 6)}/>`;
  s += `<path d="M-60 70 l8 6 M-40 88 l6 6 M44 84 l-6 6 M64 64 l-8 6 M-20 100 l4 6 M24 100 l-4 6" stroke="${C.beardHi}" stroke-width="4"/>`;
  // olheiras
  s += `<path d="M-58 14 Q-38 26 -16 14" stroke="${C.eyeBag}" stroke-width="6" fill="none"/><path d="M16 14 Q38 26 58 14" stroke="${C.eyeBag}" stroke-width="6" fill="none"/>`;
  // espinhas (quadradinhos)
  [[-50, -70, 20], [44, -78, -10], [-62, 30, 30], [58, 34, 15], [-24, -88, 0], [66, -20, 25]].forEach(([x, y, r]) => {
    s += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${C.spot}" transform="rotate(${r} ${x} ${y})"/>`;
  });
  // olhos
  const eye = (cx) => {
    const cy = -8;
    if (o.blink || e === 'closed') return `<path d="M${cx - 18} ${cy} Q${cx} ${cy + 10} ${cx + 18} ${cy}" stroke="${OL}" stroke-width="6" fill="none"/>`;
    const wide = e === 'wide', rx = wide ? 22 : 19, ry = wide ? 26 : 20;
    let g = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${st(C.white, 5)}/>`;
    const ir = wide ? 8 : 11;
    g += `<circle cx="${cx + lx * 7}" cy="${cy + 2 + ly * 6}" r="${ir}" fill="${C.iris}"/><circle cx="${cx + lx * 7}" cy="${cy + 2 + ly * 6}" r="${ir * 0.55}" fill="#1b1410"/>`;
    g += `<circle cx="${cx + lx * 7 + 3}" cy="${cy - 2 + ly * 6}" r="3" fill="#fff"/>`;
    if (e === 'sleepy') g += `<path d="M${cx - rx - 3} ${cy + 1} Q${cx} ${cy - ry - 8} ${cx + rx + 3} ${cy + 1} L${cx + rx + 3} ${cy - ry - 6} L${cx - rx - 3} ${cy - ry - 6}Z" fill="${C.skin}"/><path d="M${cx - rx - 2} ${cy} Q${cx} ${cy - 8} ${cx + rx + 2} ${cy}" stroke="${OL}" stroke-width="6" fill="none"/>`;
    if (e === 'squint') g += `<path d="M${cx - rx - 3} ${cy - 4} L${cx + rx + 3} ${cy - 4} L${cx + rx + 3} ${cy - ry - 6} L${cx - rx - 3} ${cy - ry - 6}Z" fill="${C.skin}"/><path d="M${cx - rx - 2} ${cy - 4} L${cx + rx + 2} ${cy - 4}" stroke="${OL}" stroke-width="6"/><path d="M${cx - rx} ${cy + 12} Q${cx} ${cy + 4} ${cx + rx} ${cy + 12}" fill="${C.skin}" stroke="${OL}" stroke-width="4"/>`;
    return g;
  };
  s += eye(-36) + eye(36);
  // sobrancelhas grossas
  const by = e === 'wide' ? -48 : -38;
  s += `<path d="M-62 ${by + 4} Q-40 ${by - 10 - brow * 6} -14 ${by + 2 - brow * 10}" stroke="${C.hair}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M62 ${by + 4} Q40 ${by - 10 - brow * 6} 14 ${by + 2 - brow * 10}" stroke="${C.hair}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  // nariz
  s += `<path d="M-4 0 Q-14 30 -2 34 Q10 36 14 30" ${st(C.skinSh, 5)}/>`;
  // bigode
  s += `<path d="M-36 50 Q-20 38 0 44 Q20 38 36 50 Q20 48 0 52 Q-20 48 -36 50Z" ${st(C.beard, 5)}/>`;
  // boca
  const my = 66;
  if (m === 'smile') s += `<path d="M-20 ${my - 4} Q0 ${my + 10} 20 ${my - 4}" stroke="${OL}" stroke-width="6" fill="none"/>`;
  if (m === 'grin' || m === 'grimace') {
    const h = m === 'grin' ? 22 : 14;
    s += `<path d="M-30 ${my - 6} Q0 ${my - 10} 30 ${my - 6} Q26 ${my + h} 0 ${my + h + 2} Q-26 ${my + h} -30 ${my - 6}Z" ${st('#fff', 5)}/>`;
    s += `<rect x="-14" y="${my - 8}" width="13" height="${h - 2}" fill="#3a1c18"/>`; // falta o dente
    s += `<path d="M-1 ${my - 7} L-1 ${my + h - 6} M14 ${my - 7} L14 ${my + h - 8} M-24 ${my - 6} L-24 ${my + h - 10}" stroke="#d8d2c8" stroke-width="3"/>`;
    if (m === 'grimace') s += `<path d="M-30 ${my + 4} Q0 ${my + 9} 30 ${my + 4}" stroke="${OL}" stroke-width="4" fill="none"/>`;
  }
  if (m === 'open') s += `<path d="M-24 ${my - 6} Q0 ${my - 10} 24 ${my - 6} Q22 ${my + 30} 0 ${my + 32} Q-22 ${my + 30} -24 ${my - 6}Z" ${st('#5a1f1f', 5)}/><rect x="-12" y="${my - 8}" width="10" height="9" fill="#fff"/><rect x="2" y="${my - 8}" width="10" height="9" fill="#fff"/><path d="M-12 ${my + 24} Q0 ${my + 12} 12 ${my + 24}" fill="#e2777a"/>`;
  if (m === 'fullgrin') {
    s += `<path d="M-34 ${my - 8} Q0 ${my - 12} 34 ${my - 8} Q30 ${my + 26} 0 ${my + 28} Q-30 ${my + 26} -34 ${my - 8}Z" ${st('#5a1f1f', 5)}/>`;
    s += `<path d="M-30 ${my - 7} Q0 ${my - 11} 30 ${my - 7} L28 ${my + 6} Q0 ${my + 9} -28 ${my + 6}Z" fill="#fff"/>`;
    s += `<path d="M-15 ${my - 9} V${my + 7} M0 ${my - 10} V${my + 8} M15 ${my - 9} V${my + 7}" stroke="#d8d2c8" stroke-width="3"/>`;
    s += `<path d="M-14 ${my + 20} Q0 ${my + 12} 14 ${my + 20}" fill="#e2777a"/>`;
  }
  if (m === 'fangs') {
    s += `<path d="M-30 ${my - 6} Q0 ${my - 10} 30 ${my - 6} Q26 ${my + 22} 0 ${my + 24} Q-26 ${my + 22} -30 ${my - 6}Z" ${st('#fff', 5)}/>`;
    s += `<path d="M-22 ${my - 7} L-16 ${my + 20} L-10 ${my - 7}Z M10 ${my - 7} L16 ${my + 20} L22 ${my - 7}Z" ${st('#fff', 4)}/>`;
    s += `<rect x="-6" y="${my - 8}" width="10" height="14" fill="#3a1c18"/>`;
  }
  if (m === 'numb') s += `<path d="M-26 ${my - 2} Q-6 ${my - 6} 22 ${my + 6} Q14 ${my + 26} -4 ${my + 22} Q-22 ${my + 18} -26 ${my - 2}Z" ${st('#5a1f1f', 5)}/><path d="M14 ${my + 20} q4 18 0 30" stroke="#8fd0ff" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  if (m === 'o') s += `<ellipse cx="0" cy="${my + 6}" rx="12" ry="16" ${st('#5a1f1f', 5)}/>`;
  if (m === 'duck') s += `<ellipse cx="0" cy="${my + 2}" rx="14" ry="10" ${st('#d9707a', 5)}/>`;
  if (m === 'flat') s += `<path d="M-18 ${my} L18 ${my}" stroke="${OL}" stroke-width="6"/>`;
  // boné (vista de frente): copa + aba
  s += `<g transform="translate(0 -12)">`;
  s += `<path d="M-100 -56 Q-104 -168 0 -170 Q104 -168 100 -56Z" ${st(C.cap)}/>`;
  s += `<path d="M-60 -150 Q0 -176 60 -150" stroke="${C.capHi}" stroke-width="8" fill="none"/>`;
  s += `<circle cx="0" cy="-168" r="8" ${st(C.cap, 5)}/>`;
  s += `<path d="M-108 -58 Q0 -86 108 -58 Q118 -40 100 -34 Q0 -60 -100 -34 Q-118 -40 -108 -58Z" ${st('#1a1a1f')}/>`;
  // cachos que escapam do boné na testa
  s += `<path d="M-30 -42 Q-20 -24 -6 -40 Q4 -22 16 -40" ${st(C.hair, 5)}/>`;
  s += `</g>`;
  // suor
  if (o.sweat) {
    const d = (x, y, k) => `<path d="M${x} ${y} q-11 18 0 24 q11 -6 0 -24Z" fill="#7cc7f2" stroke="${OL}" stroke-width="4" transform="translate(0 ${k})"/>`;
    s += d(78, -40, (o.sweat * 30) % 30) + d(-80, -20, ((o.sweat * 30) + 14) % 30);
  }
  if (o.flush) s += `<ellipse cx="-56" cy="24" rx="14" ry="8" fill="#ef7f7f" opacity=".6"/><ellipse cx="56" cy="24" rx="14" ry="8" fill="#ef7f7f" opacity=".6"/>`;
  return s;
}

// braço: pivô no ombro, a = ângulo de abertura (0 = pendurado, 180 = pra cima)
function arm(side, a, hold, sleeve = C.shirt) {
  const rot = -side * a;
  let g = `<g transform="translate(${side * 84} -372) rotate(${rot})">`;
  g += `<rect x="-17" y="40" width="34" height="140" rx="17" ${st(C.skin, 6)}/>`;
  g += `<path d="M-30 -6 Q-34 50 -22 62 L22 62 Q34 50 30 -6 Q0 -20 -30 -6Z" ${st(sleeve, 6)}/>`;
  g += `<circle cx="0" cy="184" r="23" ${st(C.skin, 6)}/>`;
  if (hold === 'phone') g += `<rect x="-20" y="168" width="40" height="66" rx="8" ${st('#1b1b22', 5)}/><rect x="-14" y="176" width="28" height="48" rx="4" fill="#5aa8f0"/>`;
  if (hold === 'thumb') g += `<rect x="-8" y="150" width="16" height="30" rx="8" ${st(C.skin, 5)}/>`;
  return g + '</g>';
}

// perna: pivô no quadril
function leg(side, a, torn) {
  const x0 = side * 34;
  let g = `<g transform="translate(${x0} -205) rotate(${-side * a})">`;
  g += `<rect x="-27" y="0" width="54" height="196" rx="12" ${st(C.jeans, 6)}/>`;
  g += `<rect x="${side > 0 ? 8 : -24}" y="10" width="14" height="180" rx="7" fill="${C.jeansSh}" opacity=".7"/>`;
  if (torn && side < 0) g += `<path d="M-16 92 l8 -8 l6 7 l7 -9 l7 8 l6 -6 l-2 18 l-8 -4 l-7 6 l-7 -5 l-8 5Z" ${st(C.skin, 4)}/>`;
  // chinelo normal + pé
  g += `<ellipse cx="${side * 6}" cy="204" rx="38" ry="11" ${st(C.sole, 5)}/>`;
  g += `<ellipse cx="${side * 6}" cy="192" rx="28" ry="13" ${st(C.skin, 5)}/>`;
  g += `<path d="M${side * 6 - 16} 198 L${side * 6} 184 L${side * 6 + 16} 198" stroke="${C.strap}" stroke-width="7" fill="none"/>`;
  return g + '</g>';
}

// ---------- CLÁUDIO DE CORPO INTEIRO ----------
// o: {x,y,s, armL, armR, holdL, holdR, legL, legR, bob, tilt, lean, head:{...}, torn}
function claudio(o = {}) {
  const s = o.s || 1, x = o.x || 0, y = o.y || 0;
  let g = `<g transform="translate(${x} ${y}) scale(${s}) rotate(${o.lean || 0})">`;
  g += `<ellipse cx="0" cy="8" rx="120" ry="16" fill="rgba(0,0,0,.18)"/>`;
  g += `<g transform="translate(0 ${-(o.bob || 0)})">`;
  g += leg(-1, o.legL || 0, o.torn !== false) + leg(1, o.legR || 0, o.torn !== false);
  g += arm(-1, o.armL ?? 8, o.holdL) ;
  if (!o.armRFront) g += arm(1, o.armR ?? 8, o.holdR);
  // tronco (camiseta preta) + pescoço
  g += `<rect x="-22" y="-430" width="44" height="60" ${st(C.skin, 6)}/>`;
  g += `<path d="M-90 -382 Q-104 -300 -84 -196 L84 -196 Q104 -300 90 -382 Q46 -398 26 -394 Q0 -372 -26 -394 Q-46 -398 -90 -382Z" ${st(C.shirt)}/>`;
  g += `<path d="M50 -370 Q74 -300 60 -206" stroke="${C.shirtSh}" stroke-width="10" fill="none"/>`;
  g += `<rect x="-86" y="-212" width="172" height="22" rx="4" ${st('#3a3a42', 5)}/>`;
  if (o.armRFront) g += arm(1, o.armR ?? 8, o.holdR);
  g += `<g transform="translate(0 -500) rotate(${o.tilt || 0} 0 60)">${claudioHead(o.head || {})}</g>`;
  g += '</g></g>';
  return g;
}

// ---------- DONA NEIDE ----------
function neide(o = {}) {
  const s = o.s || 1, x = o.x || 0, y = o.y || 0, up = o.phoneUp ?? 1;
  const dress = '#8b62b8', dressSh = '#6f4b9a', skin = '#e9b48e', hair = '#c9c6cf';
  let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
  g += `<ellipse cx="0" cy="8" rx="120" ry="16" fill="rgba(0,0,0,.18)"/>`;
  g += `<rect x="-50" y="-60" width="36" height="62" ${st(skin, 6)}/><rect x="14" y="-60" width="36" height="62" ${st(skin, 6)}/>`;
  g += `<ellipse cx="-32" cy="0" rx="32" ry="12" ${st('#e87fa6', 5)}/><ellipse cx="32" cy="0" rx="32" ry="12" ${st('#e87fa6', 5)}/>`;
  g += `<path d="M-70 -330 Q-120 -150 -110 -50 L110 -50 Q120 -150 70 -330 Q0 -350 -70 -330Z" ${st(dress)}/>`;
  [[-50, -250], [20, -200], [-30, -130], [60, -110], [-70, -90], [40, -280]].forEach(([a, b]) => {
    g += `<circle cx="${a}" cy="${b}" r="7" fill="#f6e3a1"/>`;
  });
  g += `<rect x="-60" y="-200" width="120" height="110" rx="8" ${st('#f4f0e6', 5)}/>`; // avental
  // braços segurando o celular na frente do rosto
  const ay = -190 - up * 30;
  g += `<path d="M-64 -310 Q-110 -240 -40 ${ay - 60}" ${st('none', 0)} stroke="${OL}" stroke-width="40" fill="none"/>`;
  g += `<path d="M-64 -310 Q-110 -240 -40 ${ay - 60}" stroke="${dress}" stroke-width="28" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M64 -310 Q110 -240 40 ${ay - 60}" stroke="${OL}" stroke-width="40" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M64 -310 Q110 -240 40 ${ay - 60}" stroke="${dress}" stroke-width="28" fill="none" stroke-linecap="round"/>`;
  // cabeça
  g += `<g transform="translate(0 -410)">`;
  g += `<circle cx="0" cy="-92" r="34" ${st(hair, 6)}/>`; // coque
  g += `<ellipse cx="0" cy="0" rx="78" ry="84" ${st(skin)}/>`;
  g += `<path d="M-78 -10 Q-80 -80 0 -84 Q80 -80 78 -10 Q60 -50 0 -52 Q-60 -50 -78 -10Z" ${st(hair, 6)}/>`;
  g += `<circle cx="-28" cy="2" r="20" ${st('rgba(255,255,255,.4)', 5)}/><circle cx="28" cy="2" r="20" ${st('rgba(255,255,255,.4)', 5)}/><path d="M-8 2 L8 2" stroke="${OL}" stroke-width="5"/>`;
  g += `<circle cx="${-28 + (o.look || 0) * 5}" cy="4" r="6" fill="#222"/><circle cx="${28 + (o.look || 0) * 5}" cy="4" r="6" fill="#222"/>`;
  g += `<path d="M-14 46 Q0 ${o.frown ? 38 : 56} 14 46" stroke="${OL}" stroke-width="5" fill="none"/>`;
  g += `<ellipse cx="-46" cy="30" rx="12" ry="7" fill="#ef8f8f" opacity=".6"/><ellipse cx="46" cy="30" rx="12" ry="7" fill="#ef8f8f" opacity=".6"/>`;
  g += `</g>`;
  // celular nas mãos
  g += `<g transform="translate(0 ${ay - 60})"><rect x="-60" y="-50" width="120" height="76" rx="10" ${st('#1b1b22', 6)}/><circle cx="-58" cy="0" r="18" ${st(skin, 5)}/><circle cx="58" cy="0" r="18" ${st(skin, 5)}/></g>`;
  g += '</g>';
  return g;
}

// ---------- BIA (retrato para o post) ----------
function biaPortrait(w = 476) {
  const skin = '#f6c9a5', hair = '#f2c94c', hairSh = '#d9a92e';
  return `<svg width="${w}" height="${w}" viewBox="0 0 476 476">
  <rect width="476" height="300" fill="#ffa66b"/><rect y="0" width="476" height="150" fill="#ff8a6b"/>
  <circle cx="370" cy="270" r="56" ${st('#ffe08a', 0)}/>
  <rect y="290" width="476" height="80" fill="#3db3c9"/><path d="M0 300 Q60 292 120 300 T240 300 T360 300 T480 300" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>
  <rect y="370" width="476" height="106" fill="#f3d39b"/>
  <path d="M60 476 L84 220 L100 220 L86 476Z" ${st('#8a5a36', 5)}/>
  <g ${st('#3aa35a', 5)}><path d="M92 222 q-70 -30 -90 20 q50 -30 90 -20z"/><path d="M92 222 q60 -60 110 -10 q-60 -20 -110 10z"/><path d="M92 222 q-10 -70 -60 -80 q40 30 60 80z"/></g>
  <g transform="translate(250 250)">
   <path d="M-120 230 Q-110 150 -60 130 L60 130 Q110 150 120 230Z" ${st('#ffd23f')}/>
   <path d="M-40 130 L-40 100 M40 130 L40 100" stroke="${OL}" stroke-width="6"/>
   <path d="M-92 -40 Q-110 60 -96 140 Q-60 120 -70 40Z" ${st(hair, 6)}/><path d="M92 -40 Q110 60 96 140 Q60 120 70 40Z" ${st(hair, 6)}/>
   <rect x="-18" y="60" width="36" height="50" ${st(skin, 6)}/>
   <ellipse cx="0" cy="0" rx="80" ry="88" ${st(skin)}/>
   <path d="M-84 10 Q-96 -100 0 -100 Q96 -100 84 10 Q78 -40 40 -46 Q10 -30 -20 -50 Q-60 -40 -84 10Z" ${st(hair, 6)}/>
   <path d="M-40 -60 Q-10 -40 20 -62" stroke="${hairSh}" stroke-width="5" fill="none"/>
   <ellipse cx="-30" cy="4" rx="15" ry="17" ${st('#fff', 4)}/><ellipse cx="30" cy="4" rx="15" ry="17" ${st('#fff', 4)}/>
   <circle cx="-28" cy="6" r="9" fill="#3fa36b"/><circle cx="32" cy="6" r="9" fill="#3fa36b"/><circle cx="-28" cy="6" r="4" fill="#111"/><circle cx="32" cy="6" r="4" fill="#111"/>
   <circle cx="-25" cy="2" r="3" fill="#fff"/><circle cx="35" cy="2" r="3" fill="#fff"/>
   <path d="M-48 -18 Q-30 -28 -14 -20 M14 -20 Q30 -28 48 -18" stroke="#b58a2a" stroke-width="5" fill="none"/>
   <ellipse cx="-48" cy="32" rx="12" ry="7" fill="#f28c8c" opacity=".6"/><ellipse cx="48" cy="32" rx="12" ry="7" fill="#f28c8c" opacity=".6"/>
   <path d="M-22 42 Q0 64 22 42 Z" ${st('#c94a5a', 5)}/><path d="M-14 44 L14 44" stroke="#fff" stroke-width="5"/>
  </g></svg>`;
}
