// Parte 2 — "Vocês escolheram dente". Mesmo estilo 2D da parte 1.
// Pessoa genérica (primo, dentista, professora, pacientes do posto).
function pessoa(o = {}) {
  const s = o.s || 1, x = o.x || 0, y = o.y || 0;
  const skin = o.skin || '#c98a5e', top = o.top || '#3a9a5a', pants = o.pants || '#2f3b52';
  let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
  g += `<ellipse cx="0" cy="8" rx="110" ry="15" fill="rgba(0,0,0,.18)"/>`;
  g += `<rect x="-56" y="-200" width="50" height="196" rx="12" ${st(pants, 6)}/><rect x="6" y="-200" width="50" height="196" rx="12" ${st(pants, 6)}/>`;
  g += `<ellipse cx="-30" cy="0" rx="36" ry="12" ${st('#2d2d33', 5)}/><ellipse cx="30" cy="0" rx="36" ry="12" ${st('#2d2d33', 5)}/>`;
  const armA = (side, a) => `<g transform="translate(${side * 82} -370) rotate(${-side * a})"><rect x="-17" y="0" width="34" height="170" rx="17" ${st(o.coat ? '#f4f6f8' : top, 6)}/><circle cx="0" cy="182" r="22" ${st(skin, 6)}/></g>`;
  g += armA(-1, o.armL ?? 8) + armA(1, o.armR ?? 8);
  g += `<path d="M-88 -380 Q-100 -300 -84 -190 L84 -190 Q100 -300 88 -380 Q0 -400 -88 -380Z" ${st(o.coat ? '#f4f6f8' : top)}/>`;
  if (o.coat) g += `<path d="M0 -380 V-190" stroke="${OL}" stroke-width="5"/><path d="M-30 -385 L0 -330 L30 -385" ${st(top, 5)}/>`;
  if (o.num) g += `<text x="0" y="-250" text-anchor="middle" font-family="P" font-weight="900" font-size="80" fill="#fff" stroke="${OL}" stroke-width="5">${o.num}</text>`;
  g += `<rect x="-20" y="-425" width="40" height="55" ${st(skin, 6)}/>`;
  g += `<g transform="translate(0 -500)">`;
  g += `<ellipse cx="0" cy="0" rx="82" ry="92" ${st(skin)}/>`;
  if (o.hair === 'bun') g += `<circle cx="0" cy="-96" r="30" ${st(o.hairC || '#3a251b', 6)}/>`;
  if (o.hair) g += `<path d="M-84 -6 Q-90 -96 0 -98 Q90 -96 84 -6 Q70 -54 0 -60 Q-70 -54 -84 -6Z" ${st(o.hairC || '#3a251b', 6)}/>`;
  if (o.cap) g += `<path d="M-84 -20 Q-90 -110 0 -112 Q90 -110 84 -20Z" ${st(o.cap, 6)}/>`;
  const ey = o.sleep ? `<path d="M-42 0 Q-28 8 -14 0 M14 0 Q28 8 42 0" stroke="${OL}" stroke-width="5" fill="none"/>` :
    `<ellipse cx="-28" cy="0" rx="15" ry="17" ${st('#fff', 4)}/><ellipse cx="28" cy="0" rx="15" ry="17" ${st('#fff', 4)}/><circle cx="${-28 + (o.look || 0) * 5}" cy="3" r="7" fill="#1b1410"/><circle cx="${28 + (o.look || 0) * 5}" cy="3" r="7" fill="#1b1410"/>`;
  g += ey;
  if (o.glasses) g += `<circle cx="-28" cy="0" r="22" fill="none" stroke="${OL}" stroke-width="5"/><circle cx="28" cy="0" r="22" fill="none" stroke="${OL}" stroke-width="5"/>`;
  if (o.mask) g += `<path d="M-70 20 Q0 10 70 20 L64 70 Q0 96 -64 70Z" ${st('#7fc8e8', 5)}/>`;
  else g += `<path d="M-16 44 Q0 ${o.worry ? 36 : 56} 16 44" stroke="${OL}" stroke-width="5" fill="none"/>`;
  if (o.sweat) g += `<path d="M66 -30 q-10 16 0 22 q10 -6 0 -22Z" fill="#7cc7f2" stroke="${OL}" stroke-width="4"/>`;
  g += `</g></g>`;
  return g;
}
function badgeTop(t, dias, pct, plus) {
  const k = ease(t / 0.4);
  return `<div style="position:absolute;left:40px;top:${-160 + 210 * k}px;display:flex;gap:16px;z-index:5">
   <div class="badge" style="width:190px;padding:10px"><div style="font-size:16px">FALTAM</div><div style="font-size:42px;color:#ffd23f;line-height:1.1">${dias} DIAS</div></div>
   <div class="badge" style="width:440px;padding:14px 18px;text-align:left;position:relative"><div style="font-size:16px">PARECIDO COM A FOTO</div><div style="display:flex;align-items:center;gap:12px;margin-top:8px"><div style="flex:1;height:18px;background:#4a3d38;border-radius:9px"><div style="width:${pct}%;height:100%;background:#ed2b4a;border-radius:9px"></div></div><span style="color:#ed2b4a;font-size:34px">${Math.round(pct)}%</span></div>
   ${plus ? `<div style="position:absolute;right:-10px;top:-26px;background:#3aa35a;border:4px solid #2b211d;border-radius:10px;padding:2px 10px;font-size:22px;transform:scale(${pop(plus)})">+4%</div>` : ''}</div></div>`;
}
const clinicBg = () => `<rect width="720" height="1280" fill="#cfe7df"/>${Array.from({ length: 13 }, (_, i) => `<path d="M0 ${i * 100} H720" stroke="#bcdcd1" stroke-width="40"/>`).join('')}`;
const P2 = {
  // 1) "Vocês escolheram dente. E sinceramente... tava feio mesmo."
  abertura(t) {
    const E = window.E || { feio: 2.5 };
    const side = t > E.feio;
    const c = claudio({ x: 360, y: 1180, s: 1, armL: 6, armR: 6, head: { eyes: side ? 'sleepy' : 'open', mouth: side ? 'grimace' : 'grin', lookX: side ? -.9 : 0, brow: side ? .8 : 0 } });
    const banner = `<div style="position:absolute;left:110px;top:200px;width:500px;padding:12px;background:#2b211d;border:5px solid #fff;border-radius:16px;color:#fff;text-align:center;font-weight:800;font-size:28px;transform:scale(${pop((t - 0.3) / 0.4)}) rotate(-2deg);z-index:5">VOCÊS ESCOLHERAM<div style="font-size:52px;color:#ffd23f;line-height:1.05">DENTE 🦷</div></div>`;
    return svg(cam(room('sun') + props() + c, 2.3 + .15 * ease(t / 4), 360, 760)) + badgeTop(t, 30, 3) + banner;
  },
  // 2) orçamento R$ 800
  orcamento(t) {
    const E = window.E || { val: 1.2 };
    const shock = t > E.val;
    const c = claudio({ x: 520, y: 1420, s: 1.25, armL: 6, armR: 6, head: { eyes: shock ? 'wide' : 'sleepy', mouth: shock ? 'o' : 'flat', sweat: shock ? t : 0, brow: shock ? 1.2 : 0 } });
    const paper = `<g transform="translate(250 520) rotate(-4) scale(${pop(t / 0.4)})"><rect x="-190" y="-230" width="380" height="460" rx="10" ${st('#fffdf6')}/>
     <text x="-150" y="-170" font-family="P" font-weight="900" font-size="34" fill="${OL}">ORÇAMENTO</text>
     <rect x="-150" y="-130" width="280" height="12" rx="6" fill="#ddd"/><rect x="-150" y="-100" width="220" height="12" rx="6" fill="#ddd"/>
     <text x="-150" y="-30" font-family="P" font-weight="600" font-size="22" fill="#555">Restauração (1 dente)</text><path d="M-150 0 H150" stroke="#aaa" stroke-width="3" stroke-dasharray="8 6"/>
     <text x="0" y="${shock ? 110 : 100}" text-anchor="middle" font-family="P" font-weight="900" font-size="${shock ? 92 : 70}" fill="#e2333f">R$ 800</text></g>`;
    const sign = `<g transform="translate(360 140)"><rect x="-190" y="-40" width="380" height="80" rx="12" ${st('#fff')}/><text x="26" y="12" text-anchor="middle" font-family="P" font-weight="800" font-size="30" fill="#2f6fb0">ODONTO SORRISO+</text><text x="-176" y="16" font-size="40">🦷</text></g>`;
    return svg(clinicBg() + sign + paper + c);
  },
  // 3) carteira: R$ 112 e um vale-pizza
  carteira(t) {
    const E = window.E || { pizza: 1.6 };
    const open = ease(t / 0.5);
    const note = (x, y, r, c, v, d) => `<g transform="translate(${x} ${y - 60 * ease((t - d) / 0.4)}) rotate(${r})"><rect x="-110" y="-55" width="220" height="110" rx="8" ${st(c)}/><text x="40" y="20" font-family="P" font-weight="900" font-size="48" fill="#fff" stroke="${OL}" stroke-width="3">${v}</text></g>`;
    const coin = (x, y, d) => `<circle cx="${x}" cy="${y - 40 * ease((t - d) / 0.3)}" r="30" ${st('#f2c94c')}/>`;
    const pizza = t > E.pizza ? `<g transform="translate(360 900) rotate(-6) scale(${pop((t - E.pizza) / 0.4)})"><rect x="-170" y="-60" width="340" height="120" rx="10" ${st('#fff8e6')}/><text x="-130" y="18" font-size="60">🍕</text><text x="-50" y="0" font-family="P" font-weight="900" font-size="34" fill="#c0392b">VALE 1 PIZZA</text><text x="-50" y="34" font-family="P" font-weight="600" font-size="20" fill="#555">broto · só terça</text></g>` : '';
    return svg(`<rect width="720" height="1280" fill="#a9744b"/>${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${i * 150} H720" stroke="#946240" stroke-width="6"/>`).join('')}
     <g transform="translate(360 640) scale(${0.9 + 0.1 * open})"><rect x="-300" y="-200" width="600" height="400" rx="30" ${st('#6b4226')}/><rect x="-270" y="-170" width="540" height="340" rx="20" fill="none" stroke="#8a5a36" stroke-width="5" stroke-dasharray="14 10"/></g>
     ${note(250, 560, -6, '#4a8fd8', '100', .3)}${note(470, 590, 5, '#d0577a', '10', .45)}${coin(230, 760, .6)}${coin(300, 780, .7)}${pizza}
     <g transform="translate(360 300) scale(${pop((t - .2) / .4)})"><rect x="-130" y="-50" width="260" height="100" rx="14" ${st('#2b211d')}/><text x="0" y="22" text-anchor="middle" font-family="P" font-weight="900" font-size="58" fill="#ffd23f">R$ 112</text></g>`);
  },
  // 4) duas noites consertando celular
  conserto(t) {
    const E = window.E || { mais: 2.5, faltam: 4 };
    const money = t < E.mais ? 112 : Math.round(lerp(112, 192, ease((t - E.mais) / 0.8)));
    const night = Math.sin(t * 1.4) > 0;
    const c = claudio({ x: 360, y: 1320, s: 1.15, armL: 40 + 14 * Math.sin(t * 9), armR: 50 + 14 * Math.sin(t * 9 + 1), armRFront: true, head: { eyes: 'sleepy', mouth: 'grin', lookY: .9 } });
    let cups = ''; const n = 2 + Math.floor(t * 1.2); for (let i = 0; i < Math.min(n, 7); i++) cups += `<rect x="${470 + i * 32}" y="930" width="26" height="40" rx="4" ${st('#fff', 5)}/>`;
    return svg(`<rect width="720" height="1280" fill="${night ? '#2d3d61' : '#55627e'}"/><rect x="430" y="140" width="220" height="220" ${st('#1c2747')}/><path d="M540 140 V360 M430 250 H650" stroke="${OL}" stroke-width="8"/><circle cx="600" cy="190" r="24" fill="#f6e9b0"/>` + c +
      `<rect x="-20" y="960" width="760" height="400" ${st('#9a6a45')}/><rect x="250" y="920" width="130" height="50" rx="8" ${st('#1b1b22', 5)}/><rect x="262" y="928" width="106" height="34" rx="4" fill="#5aa8f0"/><path d="M400 950 L460 900" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M400 950 L460 900" stroke="#e8b04a" stroke-width="5"/>${cups}`) +
      `<div style="position:absolute;left:40px;top:120px;padding:10px 20px;background:#2b211d;border:4px solid #fff;border-radius:14px;color:#3fd07a;font-weight:900;font-size:44px">R$ ${money}<div style="font-size:20px;color:#ff6a6a">FALTAM R$ ${800 - money}</div></div>`;
  },
  // 5) posto de saúde: senha 147, chamando 9
  posto(t) {
    const E = window.E || { close: 2.2 };
    if (t > E.close) {
      const k = t - E.close;
      return svg(`<rect width="720" height="1280" fill="#efe6cf"/><g transform="translate(360 520) rotate(-5) scale(${pop(k / .4)})"><rect x="-200" y="-240" width="400" height="480" rx="10" ${st('#fff')}/><text x="0" y="-150" text-anchor="middle" font-family="P" font-weight="700" font-size="30" fill="#666">SUA SENHA</text><text x="0" y="70" text-anchor="middle" font-family="P" font-weight="900" font-size="200" fill="${OL}">147</text><text x="0" y="170" text-anchor="middle" font-family="P" font-weight="600" font-size="22" fill="#888">aguarde ser chamado</text></g>
      <g transform="translate(360 900) scale(${pop((k - .6) / .4)})"><rect x="-190" y="-55" width="380" height="110" rx="14" ${st('#1b1b22')}/><text x="0" y="22" text-anchor="middle" font-family="P" font-weight="900" font-size="56" fill="#ff4a4a">AGORA: 009</text></g>`);
    }
    const c = claudio({ x: 360, y: 1210, s: .9, armL: 30, armR: 6, holdL: 'phone', head: { eyes: 'sleepy', mouth: 'flat' } });
    return svg(`<rect width="720" height="1280" fill="#efe6cf"/><rect x="0" y="930" width="720" height="400" fill="#c9b89a"/>
     <g transform="translate(220 160)"><rect x="-180" y="-40" width="360" height="70" rx="8" ${st('#3aa35a')}/><text x="0" y="10" text-anchor="middle" font-family="P" font-weight="800" font-size="26" fill="#fff">UNIDADE BÁSICA DE SAÚDE</text></g>
     <g transform="translate(200 330)"><rect x="-130" y="-80" width="260" height="160" rx="14" ${st('#1b1b22')}/><text x="0" y="-30" text-anchor="middle" font-family="P" font-weight="700" font-size="24" fill="#aaa">SENHA</text><text x="0" y="50" text-anchor="middle" font-family="P" font-weight="900" font-size="80" fill="#ff4a4a">009</text></g>
     <circle cx="560" cy="330" r="60" ${st('#fff')}/><path d="M560 330 V290 M560 330 L${560 + 34 * Math.cos(t * 3)} ${330 + 34 * Math.sin(t * 3)}" stroke="${OL}" stroke-width="6"/>
     <rect x="20" y="860" width="680" height="40" rx="10" ${st('#3a6fb0')}/>
     ${pessoa({ x: 120, y: 1220, s: .78, skin: '#e9b48e', top: '#c9524a', pants: '#5a4a6a', hair: 1, hairC: '#c9c6cf', hair2: 1, glasses: 1, worry: 1 })}
     ${pessoa({ x: 600, y: 1220, s: .78, skin: '#7a4e2e', top: '#3a6fb0', sleep: 1 })}${c}
     <text x="640" y="560" font-family="P" font-weight="900" font-size="40" fill="${OL}" opacity="${.5 + .5 * Math.sin(t * 4)}">z z z</text>`);
  },
  // 6) primo da dona Neide: dente de vampiro
  primo(t) {
    const E = window.E || { vamp: 2.2, festa: 3.4 };
    if (t > E.vamp) {
      const c = claudio({ x: 360, y: 1180, s: 1, armL: 6, armR: 6, head: { eyes: 'squint', mouth: 'fangs', flush: 1 } });
      return svg(rays('#6a3d8f', '#5c3480', t) + cam(c, 2.5, 360, 700) + (t > E.festa ? `<text x="560" y="300" font-size="90">🦇</text>` : ''));
    }
    const box = `<g transform="translate(500 900) rotate(-8) scale(${pop((t - .5) / .4)})"><rect x="-140" y="-80" width="280" height="160" rx="10" ${st('#3b2350')}/><text x="0" y="-20" text-anchor="middle" font-family="P" font-weight="900" font-size="30" fill="#ff4a6a">DENTES DE</text><text x="0" y="20" text-anchor="middle" font-family="P" font-weight="900" font-size="30" fill="#ff4a6a">VAMPIRO</text><text x="0" y="56" text-anchor="middle" font-family="P" font-weight="600" font-size="18" fill="#fff">festa · 2 unidades</text></g>`;
    return svg(`<rect width="720" height="1280" fill="#a9c4b0"/><rect x="0" y="960" width="720" height="400" fill="#8aa592"/>` + pessoa({ x: 300, y: 1420, s: 1.45, skin: '#7a4e2e', top: '#2f9a4a', pants: '#3a3a4a', num: '10', armR: 40 }) + box);
  },
  // 7) cola de tela: durou dois segundos; Neide confisca
  cola(t) {
    const E = window.E || { cai: 3.0, neide: 4.2 };
    if (t > E.neide) {
      const k = t - E.neide;
      const n = neide({ x: 360, y: 1260, s: 1.2, phoneUp: 1, frown: 1 }).replace(/<g transform="translate\(0 -\d+\)"><rect x="-60"[\s\S]*?<\/g>(?=<\/g>$)/, '');
      return svg(rays('#e7c49c', '#dfb98e', t) + n + `<g transform="translate(560 260) rotate(20)"><rect x="-26" y="-90" width="52" height="150" rx="10" ${st('#f4f4f4')}/><rect x="-14" y="-120" width="28" height="34" ${st('#e2333f', 5)}/></g>`) +
        `<div style="position:absolute;left:80px;top:150px;color:#e2333f;font-weight:900;font-size:64px;-webkit-text-stroke:3px #2b211d;transform:rotate(-8deg) scale(${pop(k / .3)})">CONFISCADO!</div>`;
    }
    const fall = t > E.cai ? ease((t - E.cai) / .5) : 0;
    const c = claudio({ x: 360, y: 1180, s: 1, armL: 6, armR: t < E.cai ? 150 : 6, armRFront: true, head: { eyes: t > E.cai ? 'wide' : 'squint', mouth: t > E.cai ? 'grin' : 'fangs', brow: t > E.cai ? 1 : 0 } });
    const fang = fall > 0 ? `<path d="M${352 + 20 * fall} ${772 + 320 * fall} l6 26 l6 -26Z" ${st('#fff', 3)}/>` : '';
    const tube = `<g transform="translate(120 420) rotate(-20)"><rect x="-24" y="-80" width="48" height="140" rx="10" ${st('#f4f4f4')}/><text x="0" y="0" text-anchor="middle" font-family="P" font-weight="900" font-size="14" fill="${OL}" transform="rotate(-90)">COLA DE TELA</text><rect x="-12" y="-108" width="24" height="30" ${st('#e2333f', 5)}/></g>`;
    return svg(bathroom() + `<rect x="150" y="280" width="420" height="560" rx="20" ${st('#d8f0f6')}/>` + cam(c + fang, 2.1, 360, 760) + tube);
  },
  // 8) clínica da faculdade (de graça)
  clinica(t) {
    const E = window.E || { gratis: 1.6 };
    let w = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) w += `<rect x="${170 + c * 100}" y="${560 + r * 110}" width="70" height="70" ${st('#7fc8e8', 5)}/>`;
    return svg(`<rect width="720" height="1280" fill="#9fd6ee"/><rect x="0" y="1060" width="720" height="300" fill="#8a8a8a"/><rect x="120" y="420" width="480" height="640" ${st('#f1e6cc')}/>${w}
     <rect x="140" y="440" width="440" height="90" rx="8" ${st('#2f6fb0')}/><text x="360" y="482" text-anchor="middle" font-family="P" font-weight="900" font-size="30" fill="#fff">CLÍNICA-ESCOLA</text><text x="360" y="516" text-anchor="middle" font-family="P" font-weight="700" font-size="22" fill="#ffd23f">DE ODONTOLOGIA</text>
     <rect x="320" y="940" width="80" height="120" ${st('#6b4226')}/>
     <circle cx="70" cy="980" r="60" ${st('#4f9a5e')}/><rect x="62" y="1030" width="16" height="40" ${st('#6b4226', 5)}/><circle cx="650" cy="980" r="60" ${st('#4f9a5e')}/><rect x="642" y="1030" width="16" height="40" ${st('#6b4226', 5)}/>
     <rect x="80" y="160" width="140" height="44" rx="22" ${st('#fff')}/><rect x="480" y="240" width="170" height="48" rx="24" ${st('#fff')}/>
     ${t > E.gratis ? `<g transform="translate(470 330) rotate(12) scale(${pop((t - E.gratis) / .35)})"><rect x="-150" y="-60" width="300" height="120" rx="16" fill="none" stroke="#2fa35a" stroke-width="12"/><text x="0" y="24" text-anchor="middle" font-family="P" font-weight="900" font-size="62" fill="#2fa35a">GRÁTIS</text></g>` : ''}`);
  },
  // 9) cadeira: aluna nervosa, professora segura a mão dela
  cadeira(t) {
    const E = window.E || { mao: 2.0 };
    const shake = 3 * Math.sin(t * 40);
    const chair = `<path d="M120 960 L560 880 L600 940 L160 1030Z" ${st('#3aa38a')}/><rect x="320" y="1000" width="40" height="160" ${st('#888')}/>`;
    const ch = `<g transform="translate(590 930) rotate(-80)">${claudio({ x: 0, y: 0, s: .66, armL: 6, armR: 6, head: { eyes: 'wide', mouth: 'open', sweat: t, brow: 1 } })}</g>`;
    const aluna = pessoa({ x: 300 + shake, y: 1000, s: .66, skin: '#f1c7a5', top: '#2f6fb0', coat: 1, mask: 1, hair: 'bun', hairC: '#6b3d24', sweat: 1, armL: 60 });
    const prof = pessoa({ x: 470, y: 1000, s: .7, skin: '#7a4e2e', top: '#5a5a7a', coat: 1, hair: 1, hairC: '#ddd', glasses: 1, armL: t > E.mao ? 55 : 8 });
    const lamp = `<path d="M300 200 L420 420" stroke="${OL}" stroke-width="10"/><ellipse cx="420" cy="440" rx="70" ry="34" ${st('#f6e9a0')}/><path d="M420 470 L330 900 L520 900Z" fill="#fff8c0" opacity=".35"/>`;
    return svg(clinicBg() + cam(lamp + aluna + prof + chair + ch + (t > E.mao ? `<circle cx="385" cy="735" r="40" fill="none" stroke="#e2333f" stroke-width="6"/>` : ''), 1.55, 390, 800));
  },
  // 10) três dias, duas anestesias, restauração, limpeza
  dias(t) {
    const E = window.E || { anest: .8, rest: 1.8, limp: 2.8 };
    const day = 1 + Math.min(2, Math.floor(t / 1.1));
    const c = claudio({ x: 360, y: 1180, s: 1, armL: 6, armR: 6, head: { eyes: 'closed', mouth: 'numb' } });
    const icon = (at, txt, x, y) => t > at ? `<g transform="translate(${x} ${y}) scale(${pop((t - at) / .35)})"><circle r="70" ${st('#fff')}/><text y="24" text-anchor="middle" font-size="70">${txt}</text></g>` : '';
    return svg(rays('#f29bb0', '#ec8aa2', t) + cam(c, 2.2, 360, 760) + `<g transform="translate(360 200)"><rect x="-90" y="-80" width="180" height="170" rx="12" ${st('#fff')}/><rect x="-90" y="-80" width="180" height="50" rx="12" ${st('#e2333f')}/><text x="0" y="60" text-anchor="middle" font-family="P" font-weight="900" font-size="80" fill="${OL}">${day}</text></g>` +
      icon(E.anest, '💉', 120, 420) + icon(E.anest + .3, '💉', 120, 580) + icon(E.rest, '🦷', 600, 440) + icon(E.limp, '✨', 600, 600));
  },
  // 11) o sorriso voltou — espelho, +4%
  espelho(t) {
    const E = window.E || { desde: 3.0 };
    const c = claudio({ x: 360, y: 1180, s: 1, armL: 6, armR: 6, head: { eyes: t > E.desde ? 'wide' : 'squint', mouth: 'fullgrin', flush: 1 } });
    return svg(bathroom() + `<rect x="120" y="220" width="480" height="720" rx="24" ${st('#d8f0f6')}/>` + cam(c + sparkle(330, 740, ((t - .3) % 1.2) / .6) + sparkle(400, 760, ((t - .8) % 1.2) / .6), 2.3, 360, 720)) +
      badgeTop(t, 27, lerp(3, 7, ease((t - .6) / .8)), t > .8 ? (t - .8) / .3 : 0);
  },
  // 12) áudio pra Bia com a boca dormente
  audio(t) {
    const E = window.E || { dorm: 1.3, beb: 3.0, video: 5.0 };
    if (t > E.dorm && t < E.beb - .1) {
      const c = claudio({ x: 360, y: 1180, s: 1, armL: 6, armR: 150, holdR: 'phone', armRFront: true, head: { eyes: 'sleepy', mouth: 'numb', flush: 1 } });
      return svg(room('night') + cam(c, 2.2, 360, 740));
    }
    const wave = `<div style="display:flex;align-items:center;gap:10px"><div style="width:30px;height:30px;border-radius:50%;background:#fff;color:#3797f0;display:flex;align-items:center;justify-content:center;font-size:16px">▶</div>${Array.from({ length: 16 }, (_, i) => `<i style="display:block;width:5px;height:${8 + 18 * Math.abs(Math.sin(i * 1.7))}px;background:#fff;border-radius:3px"></i>`).join('')}<span style="font-size:16px">0:14</span></div>`;
    const msgs = [{ x: wave, o: 1, at: .1 }, { x: 'você tá bêbado? kkkk', at: E.beb }, { x: 'amanhã a gente faz chamada de vídeo? 📹', at: E.video }];
    const vid = t > E.video + 1.0 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,.0)"></div>` : '';
    return scenes.chat(t, msgs, '21:15') + vid;
  },
  // 13) navio cada vez mais perto
  mapa(t) {
    const k = ease(t / 3);
    const sx = lerp(560, 420, k), sy = lerp(220, 760, k);
    let dots = ''; for (let i = 0; i < 14; i++) { const q = i / 14; if (q > k) break; dots += `<circle cx="${lerp(600, 380, q)}" cy="${lerp(180, 820, q)}" r="5" fill="#fff"/>`; }
    return svg(`<rect width="720" height="1280" fill="#2a8fb8"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${(i * 137) % 720} ${100 + i * 120} q12 -8 24 0" stroke="#7fc8e8" stroke-width="4" fill="none"/>`).join('')}
     <path d="M0 760 Q120 820 180 900 Q260 1000 300 1100 Q330 1200 340 1280 L0 1280Z" ${st('#9ccf8a')}/>
     <ellipse cx="160" cy="300" rx="40" ry="26" ${st('#9ccf8a', 5)}/>${dots}
     <g transform="translate(300 900)"><path d="M0 0 q-28 -50 0 -70 q28 20 0 70Z" ${st('#e2333f', 5)}/><circle cx="0" cy="-46" r="10" fill="#fff"/><text x="22" y="-40" font-family="P" font-weight="900" font-size="34" fill="#fff" stroke="${OL}" stroke-width="2">SANTOS</text></g>
     <g transform="translate(${sx} ${sy})"><path d="M-40 0 L40 0 L30 18 L-30 18Z" ${st('#fff', 5)}/><rect x="-14" y="-24" width="24" height="24" ${st('#e2333f', 4)}/></g>
     <g transform="translate(110 160)"><circle r="44" ${st('#fff', 5)}/><path d="M0 -36 L10 0 L0 36 L-10 0Z" fill="#e2333f"/><text y="-52" text-anchor="middle" font-family="P" font-weight="900" font-size="26" fill="#fff">N</text></g>`);
  },
  // 14) final: barba ou cabelo
  final2(t) {
    const face = (x, flip) => `<div style="position:absolute;left:${x}px;top:560px;width:270px;height:270px;border-radius:50%;overflow:hidden;border:7px solid #2b211d;background:#fff;transform:scale(${pop((t - 0.2) / 0.4)}) ${flip ? 'scaleX(-1)' : ''}"><svg width="270" height="270" viewBox="-150 -170 300 300">${claudioHead({ eyes: 'open', mouth: 'fullgrin', lookX: flip ? -.5 : .5 })}</svg></div>`;
    return `<div style="position:absolute;inset:0;background:#3f6fd0"></div><div style="position:absolute;inset:0;background:#2fa35a;clip-path:polygon(56% 0,100% 0,100% 100%,44% 100%)"></div>
  <div style="position:absolute;left:44%;top:0;width:12%;height:100%;background:linear-gradient(105deg,transparent 45%,#2b211d 45%,#2b211d 55%,transparent 55%)"></div>
  ${badgeTop(t, 27, 7)}
  <div style="position:absolute;left:150px;top:290px;width:420px;padding:10px;background:#2b211d;border:4px solid #fff;border-radius:14px;color:#fff;text-align:center;font-weight:800;font-size:30px;transform:scale(${pop((t - 0.4) / 0.4)})">COMENTE UMA PALAVRA</div>
  <div style="position:absolute;left:30px;top:400px;width:300px;text-align:center;color:#fff;font-weight:900;font-size:64px;-webkit-text-stroke:3px #2b211d;text-shadow:0 5px 0 #2b211d">BARBA<div style="font-size:20px;font-weight:700;-webkit-text-stroke:0;text-shadow:none">custa 1 dia</div></div>
  <div style="position:absolute;right:30px;top:400px;width:300px;text-align:center;color:#fff;font-weight:900;font-size:64px;-webkit-text-stroke:3px #2b211d;text-shadow:0 5px 0 #2b211d">CABELO<div style="font-size:20px;font-weight:700;-webkit-text-stroke:0;text-shadow:none">custa 2 dias</div></div>
  ${face(45, 0)}${face(405, 1)}
  <div style="position:absolute;left:310px;top:650px;width:100px;height:100px;border-radius:50%;background:#2b211d;border:5px solid #fff;color:#ffd23f;font-weight:900;font-size:38px;display:flex;align-items:center;justify-content:center;transform:scale(${pop((t - 0.6) / 0.3)})">OU</div>`;
  },
};
Object.assign(scenes, P2);
