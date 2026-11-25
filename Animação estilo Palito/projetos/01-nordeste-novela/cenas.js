// Projeto 01: "O Nordeste das novelas", animação 3D estilo palito (motor3d/palito.js)
// Tempos sincronizados com narracao.mp3 (ver decupagem.md e palavras.json).
import * as P from '../../motor3d/palito.js';
const { THREE, COR, mesh, G, put, toon, basic, Palito, seg, ease, easeIO, lerp, clamp, camPath, rnd } = P;

export const FPS = 24;
export const DURACAO = 69.8;

// ======================= elenco =======================
const ator = () => new Palito({ camisa: 0xc9a46a, calca: 0x7a5a3a, chapeu: 'couro', barba: 0x3a2a1a, cabelo: 'curto', seed: 1 });
const diretor = () => new Palito({ camisa: 0x55606e, colete: 0xa89466, calca: 0x2f3b4c, chapeu: 'bone', corBone: 0x2a2a2a, oculos: true, seed: 2 });
const davi = () => {
  const d = new Palito({ camisa: 0x9cc3e4, calca: 0x3d4f6b, cabelo: 'cacheado', seed: 3 });
  put(d.torso, mesh(G.box(0.42, 0.5, 0.2), 0xd9822b, 0.02), 0, 0.55, -0.32); // mochila
  return d;
};
const colega = () => new Palito({ camisa: 0xc0483e, calca: 0x2e3440, cabelo: 'liso', corCabelo: 0xe3c46a, cracha: true, seed: 4 });
const coronel = () => new Palito({ paleto: 0xf0ead8, gravata: 0x6b2a2a, calca: 0xe8dfc8, chapeu: 'coronel', bigode: 'grande', cabelo: 'careca', seed: 5 });
const EQ = [
  { camisa: 0x3a3f47, calca: 0x23262b, chapeu: 'bone', corBone: 0x8a3b3b },
  { camisa: 0x4a5a6a, calca: 0x2a2d33, cabelo: 'liso', corCabelo: 0x5a3a22 },
  { camisa: 0x6b5340, calca: 0x23262b, cabelo: 'coque', corCabelo: 0x222222 },
  { camisa: 0x3f5f55, calca: 0x2b2b2b, chapeu: 'bone', corBone: 0x30455a, barba: 0x2a2a2a },
  { camisa: 0x5d4b6b, calca: 0x2a2a2a, cabelo: 'curto' },
];
const equipe = (i) => new Palito({ ...EQ[i % EQ.length], seed: 10 + i });
const GENTE = [
  { camisa: 0xe07a5f, calca: 0x3d405b, cabelo: 'curto' },
  { camisa: 0xf2cc8f, saia: 0x81b29a, cabelo: 'longo', corCabelo: 0x2b1b12 },
  { camisa: 0x81b29a, calca: 0xe9dcc3, cabelo: 'cacheado' },
  { camisa: 0xffffff, calca: 0x4a6fa5, chapeu: 'palha', cabelo: 'curto' },
  { camisa: 0xd4a5a5, saia: 0x6d597a, cabelo: 'coque', corCabelo: 0x3b2416 },
  { camisa: 0x5fa8d3, calca: 0xd9c49b, cabelo: 'liso', corCabelo: 0x111111, oculos: true },
  { camisa: 0xf4a259, calca: 0x2d3142, cabelo: 'careca', barba: 0x444444 },
  { camisa: 0x9a8c98, saia: 0xc9ada7, cabelo: 'longo', corCabelo: 0x7a4a2a },
];
const pessoa = (i, extra = {}) => new Palito({ ...GENTE[i % GENTE.length], seed: 30 + i, ...extra });

// ======================= utilidades =======================
function painel(w, h, desenhar) {
  const t = P.canvasTex(1024, Math.round(1024 * h / w), desenhar);
  return new THREE.Mesh(G.plane(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
}
function telaoSertao(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#f7c66b'); gr.addColorStop(0.7, '#ec8c48'); gr.addColorStop(1, '#d9713d');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffe6a3'; g.beginPath(); g.arc(w * 0.7, h * 0.33, h * 0.13, 0, 7); g.fill();
  const morro = (cor, y0, amp, f) => { g.fillStyle = cor; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) g.lineTo(x, y0 + Math.sin(x * f) * amp + Math.sin(x * f * 2.7) * amp * 0.4); g.lineTo(w, h); g.fill(); };
  morro('#c4753f', h * 0.68, 18, 0.006); morro('#a85a32', h * 0.8, 12, 0.011);
  g.fillStyle = '#5f6b3c';
  for (const [x, s] of [[0.15, 1], [0.32, 0.6], [0.86, 0.8]]) {
    const cx = w * x, by = h * 0.86, H = 120 * s;
    g.fillRect(cx - 10 * s, by - H, 20 * s, H); g.fillRect(cx - 38 * s, by - H * 0.7, 14 * s, H * 0.4);
    g.fillRect(cx - 38 * s, by - H * 0.36, 30 * s, 10 * s); g.fillRect(cx + 24 * s, by - H * 0.8, 14 * s, H * 0.45); g.fillRect(cx + 8 * s, by - H * 0.4, 30 * s, 10 * s);
  }
  g.strokeStyle = 'rgba(40,20,10,0.6)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
}
function cameraTV(cor = 0x2b2d31) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const p = put(g, new THREE.Group(), 0, 1.45, 0, (i / 3) * Math.PI * 2);
    const l = mesh(G.cyl(0.03, 0.03, 1.6, 6), 0x1a1a1a, 0.01); l.position.set(0, -0.72, 0.3); l.rotation.x = 0.4; p.add(l);
  }
  put(g, mesh(G.box(0.55, 0.5, 0.9), cor, 0.02), 0, 1.75, 0);
  const lente = mesh(G.cyl(0.17, 0.2, 0.45, 16), 0x111111, 0.015); lente.rotation.x = Math.PI / 2; put(g, lente, 0, 1.75, 0.65);
  put(g, mesh(G.box(0.3, 0.22, 0.25), 0x1c1c1c, 0.01), 0.3, 2.08, -0.2);
  put(g, new THREE.Mesh(G.sph(0.05), basic(0xd63b3b)), -0.2, 2.02, 0.3);
  return g;
}
function refletor() {
  const g = new THREE.Group();
  const lata = mesh(G.cyl(0.3, 0.4, 0.6, 16), 0x222428, 0.02); g.add(lata);
  const vidro = new THREE.Mesh(new THREE.CircleGeometry(0.36, 20), basic(0xfff3c4)); vidro.rotation.x = Math.PI / 2; vidro.position.y = -0.31; vidro.userData.semNormal = true; g.add(vidro);
  g.userData.vidro = vidro;
  return g;
}
function claquete() {
  const g = new THREE.Group();
  const listra = P.canvasTex(256, 32, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2f2f2';
    for (let i = -1; i < 9; i++) { c.beginPath(); c.moveTo(i * 32, h); c.lineTo(i * 32 + 16, h); c.lineTo(i * 32 + 32, 0); c.lineTo(i * 32 + 16, 0); c.fill(); } });
  const corpo = P.canvasTex(256, 192, (c, w, h) => { c.fillStyle = '#1b1b1b'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ddd'; c.lineWidth = 4;
    for (const y of [60, 110, 160]) { c.beginPath(); c.moveTo(10, y); c.lineTo(w - 10, y); c.stroke(); }
    c.beginPath(); c.moveTo(w / 2, 60); c.lineTo(w / 2, 160); c.stroke(); });
  put(g, mesh(G.box(1.0, 0.75, 0.05), toon(0xffffff, { map: corpo }), 0.015), 0, 0, 0);
  put(g, mesh(G.box(1.0, 0.14, 0.05), toon(0xffffff, { map: listra }), 0.012), 0, 0.45, 0);
  const piv = put(g, new THREE.Group(), -0.5, 0.52, 0);
  put(piv, mesh(G.box(1.0, 0.14, 0.05), toon(0xffffff, { map: listra }), 0.012), 0.5, 0.07, 0);
  g.userData.piv = piv;
  return g;
}
function mesaCorte() {
  const g = new THREE.Group();
  put(g, mesh(G.box(3.2, 1.0, 1.2), 0x33363c, 0.02), 0, 0.5, 0);
  const topo = put(g, mesh(G.box(3.2, 0.12, 1.3), 0x2a2c31, 0.015), 0, 1.05, 0); topo.rotation.x = 0.25;
  const knobs = [];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) {
    const k = mesh(G.cyl(0.06, 0.06, 0.08, 10), [0xd9d9d9, 0xe0b04a, 0xc95b4a][(i + j) % 3], 0.008);
    put(g, k, -1.3 + i * 0.37, 1.15 - j * 0.07, -0.2 + j * 0.3).rotation.x = 0.25; knobs.push(k);
  }
  const big = mesh(G.cyl(0.13, 0.13, 0.12, 14), 0xf0c75a, 0.012); put(g, big, 1.3, 1.17, 0.25).rotation.x = 0.25;
  put(big, new THREE.Mesh(G.box(0.03, 0.13, 0.2), basic(0x222222)), 0, 0, 0.06);
  for (const x of [-0.9, 0.9]) {
    const m = P.tv('plana', basic(0x223344)); m.scale.setScalar(0.42); put(g, m, x, 0.95, -0.5);
  }
  g.userData.knob = big;
  return g;
}
function carro(cor) {
  const c = new THREE.Group();
  put(c, mesh(G.box(1.3, 0.6, 2.4), cor, 0.02), 0, 0.55, 0);
  put(c, mesh(G.box(1.1, 0.45, 1.2), 0x9fd3ef, 0.015), 0, 1.05, -0.1);
  for (const [x, z] of [[-0.62, 0.8], [0.62, 0.8], [-0.62, -0.8], [0.62, -0.8]]) { const r = mesh(G.cyl(0.25, 0.25, 0.18, 12), 0x1a1a1a, 0.01); r.rotation.z = Math.PI / 2; put(c, r, x, 0.25, z); }
  return c;
}
function megafone(p) { const m = mesh(G.cyl(0.18, 0.06, 0.4, 14), 0xe9e4d8, 0.015); m.rotation.x = -Math.PI / 2; return P.naMao(p, 'R', m, 0, -0.5, 0.12); }

// ======================= estúdio de TV =======================
function estudio(o = {}) {
  const scene = P.novaCena(0x16181d);
  scene.userData.hemi.intensity = 0.7; scene.userData.sol.intensity = 1.2;
  scene.add(P.chao(0x2a2c31, 140, 140));
  put(scene, mesh(G.box(70, 26, 0.5), 0x202227, 0), 0, 13, -14);
  for (const s of [-1, 1]) put(scene, mesh(G.box(0.5, 26, 70), 0x202227, 0), s * 26, 13, 0);
  // set do sertão
  const set = put(scene, new THREE.Group(), 0, 0, 0);
  put(set, mesh(G.box(15, 0.25, 9.5), 0xb9824a, 0.02), 0, 0.125, -0.5);
  const piso = new THREE.Mesh(G.plane(15, 9.5), toon(0xffffff, { map: P.rep(P.texRachado(0xd59a58, 7), 2.4, 1.5) }));
  piso.rotation.x = -Math.PI / 2; put(set, piso, 0, 0.26, -0.5);
  const fundoPiv = put(set, new THREE.Group(), 0, 0.25, -5.2);
  const fundo = painel(17, 8.5, telaoSertao); put(fundoPiv, fundo, 0, 4.25, 0);
  for (const x of [-7, 0, 7]) put(fundoPiv, mesh(G.box(0.25, 8.2, 0.25), COR.madeira, 0.015), x, 4.1, -0.3);
  for (const x of [-7, 7]) { const sp = put(fundoPiv, mesh(G.box(0.2, 5, 0.2), COR.madeira, 0.015), x, 2.2, -1.6); sp.rotation.x = 0.55; }
  const casa = put(set, P.casaBarro(5.2, 4.4, 3.4), 4.3, 0.25, -3.1, -0.25);
  const cactos = [[-4.4, -2.6], [-2.2, -4.0], [6.4, 1.8], [-6.2, 0.4]].map(([x, z], i) => { const c = put(set, P.cacto(0, true), x, 0.25, z, i * 0.6); c.scale.setScalar(1.6); return c; });
  // treliça + refletores
  const lamps = [];
  for (const z of [3, -1]) put(scene, mesh(G.box(28, 0.3, 0.3), 0x3a3c42, 0.015), 0, 10.6, z);
  for (let i = 0; i < 7; i++) {
    const x = -9 + i * 3, z = i % 2 ? 3 : -1;
    const r = refletor(); put(scene, r, x, 10.1, z); r.rotation.x = z > 0 ? -0.35 : 0.2; r.rotation.z = -x * 0.03;
    const cone = P.coneLuz(1.7, 9.5); cone.position.set(0, -4.9, 0); r.add(cone);
    lamps.push({ r, cone });
  }
  const spots = [];
  for (const [x, z] of [[-5, 7], [5, 6], [0, 4]]) {
    const s = new THREE.SpotLight(0xffe2b0, 90, 45, 0.55, 0.6, 1.4); s.position.set(x, 10, z); s.target.position.set(0, 0, -1);
    scene.add(s); scene.add(s.target); spots.push(s);
  }
  // câmeras de TV, cabos, mesa de corte
  const cams = [[-4, 6.2, 0.45], [4.2, 5.8, -0.4], [0.3, 8.2, 0.05]].map(([x, z, r]) => { const c = put(scene, cameraTV(), x, 0, z, Math.PI + r); c.scale.setScalar(1.3); return c; });
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(G.tor(1.2 + i * 0.3, 0.04, Math.PI * 1.3), basic(0x0e0e0e));
    c.rotation.x = -Math.PI / 2; put(scene, c, -6 + i * 2.4, 0.04, 8 + (i % 3)).rotation.z = i;
  }
  const mesa = put(scene, mesaCorte(), -7.5, 0, 6.5, 0.6); mesa.scale.setScalar(1.4);
  // bastidores: suportes de luz e caixas
  for (const [x, z] of [[-2.8, 12.5], [2.6, 13.5], [-6.5, 11]]) {
    put(scene, mesh(G.cyl(0.05, 0.05, 3.6, 6), 0x1e1e1e, 0.01), x, 1.8, z);
    const r = refletor(); r.scale.setScalar(0.8); put(scene, r, x, 3.7, z - 0.2).rotation.x = -1.2;
  }
  for (const [x, z, s] of [[7, 13, 1], [8.6, 14.2, 0.8], [-9, 14, 0.9]]) put(scene, mesh(G.box(1.4 * s, 1.1 * s, 1.1 * s), 0x3b3f46, 0.02), x, 0.55 * s, z);
  // movimento de fundo: técnico atravessando os bastidores com uma caixa, microfone boom balançando
  const andarilho = equipe(2); put(andarilho.root, mesh(G.box(0.7, 0.5, 0.5), 0x9a7a52, 0.015), 0, 2.0, 0.45); put(scene, andarilho.root, 0, 0, 10.3, Math.PI / 2);
  const boom = put(scene, new THREE.Group(), -1.5, 7.5, 1.5);
  put(boom, mesh(G.cyl(0.04, 0.04, 6, 6), 0x2a2a2a, 0.01), 0, 0, 0).rotation.z = Math.PI / 2;
  const mic = put(boom, mesh(G.cap(0.12, 0.35), 0x3a3a3a, 0.012), 3, -0.4, 0); mic.rotation.z = Math.PI / 2;
  const anima = (t) => {
    andarilho.root.position.x = -14 + ((t * 1.4) % 28); andarilho.walk(t * 6.5).setArm('L', 1.3, 0.25, 0.6).setArm('R', 1.3, 0.25, 0.6);
    boom.rotation.y = Math.sin(t * 0.7) * 0.25; boom.rotation.z = Math.sin(t * 0.9) * 0.05;
    lamps.forEach((l, i) => { if (l.cone.visible) l.cone.material.opacity = 0.12 + Math.sin(t * 3 + i) * 0.015; });
  };
  return { scene, set, fundoPiv, casa, cactos, lamps, spots, cams, mesa, anima };
}

function filtroAmarelo(R, amt) { R.fx.tint.setRGB(1.0, 0.8, 0.38); R.fx.tintAmt = amt; }
function camMao(cam, t, k = 0.03) { cam.position.x += Math.sin(t * 7.1) * k; cam.position.y += Math.sin(t * 9.3 + 1) * k; cam.rotation.z += Math.sin(t * 5.3) * k * 0.4; }

// ======================= mini-cenas para telas =======================
function miniSertao(R, comAtor = true) {
  const rt = new THREE.WebGLRenderTarget(640, 480, { samples: 4 });
  const s = P.novaCena(P.ceu([0xf6c36a, 0xed8d4a]));
  s.add(P.chao(0, 80, 80, P.rep(P.texRachado(0xd08a4e, 11), 8)));
  put(s, P.cacto(), -3.5, 0, -4.5).scale.setScalar(1.8); put(s, P.cacto(), 6.5, 0, -3).scale.setScalar(1.8); put(s, P.casaBarro(), 3.5, 0, -9, -0.3);
  const sol = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), basic(0xffe6a0)); put(s, sol, -6, 9, -30);
  const a = ator(); if (comAtor) put(s, a.root, 0, 0, 0);
  const cam = new THREE.PerspectiveCamera(38, 4 / 3, 0.1, 200); cam.position.set(0.4, 2.7, 5.2); cam.lookAt(0, 2.4, 0);
  const mat = new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false });
  return { rt, mat, a, s, cam, update(t) { a.idle(t).talk(t, 1.3).setFace(Math.sin(t * 2) > 0 ? 'surpresa' : 'brava').setArm('R', 0.9 + Math.sin(t * 4) * 0.4, 0.5, 0.6); R.toTarget(rt, s, cam); } };
}
function miniAvenida(R) {
  const rt = new THREE.WebGLRenderTarget(640, 480, { samples: 4 });
  const s = P.novaCena(P.ceu([0x5c9bd6, 0xbfe1f5]));
  s.add(P.chao(0x8fa36b, 300, 300));
  put(s, mesh(G.box(18, 0.05, 300), 0x3d3f44, 0), 0, 0.03, 0);
  for (let z = -140; z < 30; z += 8) put(s, new THREE.Mesh(G.box(0.4, 0.06, 3.2), basic(0xf2f2f2)), 0, 0.05, z);
  const R0 = rnd(9);
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, z = -i * 9 + 6, hgt = 20 + R0() * 40, w = 9 + R0() * 3;
    const cor = [0x6f8fb3, 0x9db8cf, 0x8b9aa8, 0xb9c7d6, 0x55738f][i % 5];
    put(s, mesh(G.box(w, hgt, 8), toon(0xffffff, { map: P.texJanelas(cor, 0x2f4a66, 5, Math.round(hgt / 5.5), 0.15, i + 1) }), 0.03), side * (15 + w / 2 + R0() * 2), hgt / 2, z);
  }
  const carros = [];
  for (let i = 0; i < 10; i++) {
    const c = carro([0xd64545, 0xf2c14e, 0x3d7dd8, 0xf2f2f2, 0x2e8b57][i % 5]); c.scale.setScalar(2.2);
    put(s, c, i % 2 ? 4.5 : -4.5, 0, -i * 14); carros.push(c);
  }
  const cam = new THREE.PerspectiveCamera(42, 4 / 3, 0.1, 300); cam.position.set(0, 10, 24); cam.lookAt(0, 8, -40);
  const mat = new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false });
  return { rt, mat, update(t) { carros.forEach((c, i) => { c.position.z = ((-i * 14 + t * (i % 2 ? 12 : -12)) % 140 + 140) % 140 - 125; c.rotation.y = i % 2 ? 0 : Math.PI; }); R.toTarget(rt, s, cam); } };
}
function miniDaviPraca(R) {
  const rt = new THREE.WebGLRenderTarget(640, 480, { samples: 4 });
  const s = P.novaCena(P.ceu([0x79b8e3, 0xd7eef7]));
  s.add(P.chao(0xd9c7a1, 80, 80));
  const cores = [0xf2a65a, 0x7fb7be, 0xee6c4d, 0xf3d17c, 0x9bc49b];
  for (let i = 0; i < 5; i++) { const h = 9 + (i % 2) * 1.5; put(s, mesh(G.box(5.6, h, 5), toon(0xffffff, { map: P.texJanelas(cores[i], 0x5a3d2b, 3, 3, 0, i) }), 0.03), -11.3 + i * 5.65, h / 2, -9); }
  const cq = [put(s, P.coqueiro(4, 0.6), 4.8, 0, -3), put(s, P.coqueiro(4, -0.4), -5.2, 0, -3.5)]; cq.forEach((c) => c.scale.setScalar(3));
  const d = davi(); put(s, d.root, 0, 0, 0);
  const cam = new THREE.PerspectiveCamera(38, 4 / 3, 0.1, 200); cam.position.set(0, 2.6, 6); cam.lookAt(0, 2.3, 0);
  const mat = new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false });
  return { rt, mat, update(t) { cq.forEach((c) => c.userData.balanca(t)); d.idle(t).setFace('neutra', 'sorriso').setArm('R', 0.3, 2.3 + Math.sin(t * 9) * 0.35, 0.3); R.toTarget(rt, s, cam); } };
}

// ======================= mapa do Nordeste =======================
const ESTADOS = [
  ['MA', 0x9bb57a, [[-48.7, -5.4], [-46, -1.0], [-44, -2.3], [-41.8, -2.8], [-42.5, -4.5], [-43.3, -6.5], [-45.8, -10.2], [-47, -8], [-48, -6.5]]],
  ['PI', 0xd9b26f, [[-41.8, -2.8], [-40.8, -3.0], [-41, -5], [-40.5, -7.5], [-41.3, -7.6], [-41, -8.5], [-41.5, -9.0], [-43, -10.8], [-45.8, -10.2], [-43.3, -6.5], [-42.5, -4.5]]],
  ['CE', 0xe39b62, [[-40.8, -3.0], [-38.5, -3.6], [-37.2, -4.8], [-38.6, -6.9], [-39.3, -7.8], [-40.5, -7.5], [-41, -5]]],
  ['RN', 0x86b8a8, [[-37.2, -4.8], [-35.3, -5.2], [-35.0, -6.3], [-36.5, -6.5], [-38.6, -6.9]]],
  ['PB', 0xc98aa0, [[-38.6, -6.9], [-36.5, -6.5], [-35.0, -6.3], [-34.8, -7.5], [-36.0, -7.4], [-37.2, -7.6], [-38.4, -7.8], [-39.3, -7.8]]],
  ['PE', 0x8fa8d6, [[-41.3, -7.6], [-40.5, -7.5], [-39.3, -7.8], [-38.4, -7.8], [-37.2, -7.6], [-36, -7.4], [-34.8, -7.5], [-35.1, -8.8], [-36.3, -9.0], [-38.0, -9.2], [-40.5, -9.3], [-41, -8.5]]],
  ['AL', 0xe6c95f, [[-38.0, -9.2], [-36.3, -9.0], [-35.1, -8.8], [-35.6, -9.7], [-36.4, -10.5], [-37.9, -9.6]]],
  ['SE', 0xb79ad1, [[-37.9, -9.6], [-36.4, -10.5], [-37.4, -11.5], [-38.2, -11.0], [-38.0, -10.0]]],
  ['BA', 0xd98b6a, [[-45.8, -10.2], [-43, -10.8], [-41.5, -9.0], [-40.5, -9.3], [-38.0, -9.2], [-37.9, -9.6], [-38.0, -10.0], [-38.2, -11.0], [-37.4, -11.5], [-38.5, -13.0], [-39.0, -15.0], [-39.2, -17.8], [-40.2, -17.9], [-41.0, -15.5], [-44.0, -14.5], [-46.2, -13.0], [-45.5, -11.5]]],
];
const MX = (lon) => (lon + 41) * 0.95, MZ = (lat) => -(lat + 9.5) * 0.95;
function jangada(cor = 0xe94f37) {
  const g = new THREE.Group();
  put(g, mesh(G.box(0.25, 0.08, 0.8), COR.madeira, 0.01), 0, 0.04, 0);
  put(g, mesh(G.cyl(0.015, 0.015, 0.8, 5), COR.madeiraEsc, 0), 0, 0.45, 0);
  const vela = new THREE.Shape(); vela.moveTo(0, 0); vela.lineTo(0, 0.75); vela.lineTo(0.5, 0.05); vela.lineTo(0, 0);
  const v = mesh(new THREE.ShapeGeometry(vela), cor, 0.006, { side: THREE.DoubleSide }); v.rotation.y = Math.PI / 2; put(g, v, 0, 0.1, 0.2);
  return g;
}
function predios(n = 4, cores = [0xf1e3c6, 0x8ab6d6, 0xe9c46a, 0xd99a8b], s = 0.35, seed = 1) {
  const g = new THREE.Group(); const R0 = rnd(seed);
  for (let i = 0; i < n; i++) { const h = (1 + R0() * 2.5) * s; put(g, mesh(G.box(0.5 * s * 2, h, 0.5 * s * 2), cores[i % cores.length], 0.008), (i % 2) * s * 1.3 - s * 0.6, h / 2, Math.floor(i / 2) * s * 1.3 - s * 0.6); }
  return g;
}
function frevo() {
  const p = new Palito({ camisa: 0xf2c14e, calca: 0x3d7dd8, cabelo: 'curto', seed: 77 });
  const sombrinha = new THREE.Group();
  const cores = [0xe63946, 0xf4d35e, 0x2a9d8f, 0x3d7dd8, 0xf28482, 0x8ac926];
  cores.forEach((c, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.25, 6, 1, true, i * Math.PI / 3, Math.PI / 3), toon(c, { side: THREE.DoubleSide })); m.position.y = 0.4; sombrinha.add(m); });
  put(sombrinha, mesh(G.cyl(0.015, 0.015, 0.5, 5), COR.preto, 0), 0, 0.15, 0);
  P.naMao(p, 'R', sombrinha, 0, -0.45, 0);
  p.sombrinha = sombrinha; return p;
}
function boi() {
  const g = new THREE.Group();
  const corpo = mesh(G.cap(0.35, 0.6), 0x2b2d42, 0.02); corpo.rotation.z = Math.PI / 2; put(g, corpo, 0, 0.9, 0);
  const saia = mesh(G.cyl(0.55, 0.6, 0.5, 12, 1), 0xe63946, 0.02); put(g, saia, 0, 0.55, 0);
  put(g, mesh(G.box(0.45, 0.4, 0.5), 0xf2f2f2, 0.02), 0.7, 1.15, 0);
  for (const s of [-1, 1]) { const c = mesh(G.cone(0.05, 0.3, 6), 0xf4d35e, 0.01); c.rotation.z = -s * 0.6; put(g, c, 0.75, 1.45, s * 0.18); }
  for (let i = 0; i < 6; i++) put(g, new THREE.Mesh(G.sph(0.06, 8, 6), basic([0xf4d35e, 0x2a9d8f, 0xe63946][i % 3])), -0.5 + i * 0.2, 1.25, 0.32);
  for (const x of [-0.25, 0.25]) put(g, mesh(G.cyl(0.04, 0.04, 0.4, 6), COR.preto, 0), x, 0.2, 0);
  return g;
}
function mapaNordeste() {
  const scene = P.novaCena(0x2b2420);
  scene.userData.hemi.intensity = 0.95;
  const lamp = new THREE.PointLight(0xffe2b0, 220, 60, 1.6); lamp.position.set(0, 16, 4); scene.add(lamp);
  put(scene, mesh(G.box(34, 1, 30), 0x7b5233, 0.03), 0, -0.5, -1);
  const papel = P.canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = '#7fb2c9'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 20, 0.3, 2.6); g.stroke(); }
    g.strokeStyle = '#6b4a2a'; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18); });
  const base = new THREE.Mesh(G.plane(22, 24), toon(0xffffff, { map: papel })); base.rotation.x = -Math.PI / 2; put(scene, base, 0.5, 0.01, -0.5);
  // "resto do Brasil" em tom neutro a oeste/sul
  const resto = new THREE.Shape([[-49, -0.5], [-48.7, -5.4], [-48, -6.5], [-47, -8], [-45.8, -10.2], [-45.5, -11.5], [-46.2, -13.0], [-44.0, -14.5], [-41.0, -15.5], [-40.2, -17.9], [-40.5, -21], [-50, -21]].map(([a, b]) => new THREE.Vector2(MX(a), -MZ(b))));
  const rm = mesh(new THREE.ShapeGeometry(resto), 0xcfc4a8, 0); rm.rotation.x = -Math.PI / 2; put(scene, rm, 0, 0.02, 0);
  const estados = ESTADOS.map(([nome, cor, pts], i) => {
    const sh = new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(MX(a), -MZ(b))));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 });
    const grupo = new THREE.Group(); scene.add(grupo);
    const m = mesh(geo, cor, 0.03); m.rotation.x = -Math.PI / 2; grupo.add(m);
    const cx = pts.reduce((s, p) => s + MX(p[0]), 0) / pts.length, cz = pts.reduce((s, p) => s + MZ(p[1]), 0) / pts.length;
    return { nome, grupo, m, cx, cz, props: [] };
  });
  const E = Object.fromEntries(estados.map((e) => [e.nome, e]));
  const prop = (est, obj, x, z, s = 1, ry = 0) => { obj.scale.setScalar(0.001); obj.userData.s = s; put(E[est].grupo, obj, x, 0.4, z, ry); E[est].props.push(obj); return obj; };
  // Maranhão: dunas e coqueiros
  for (const [x, z] of [[-3.6, -7.5], [-2.6, -7.8], [-4.4, -7.0]]) { const d = mesh(G.sph(0.5, 14, 8), 0xf6efdc, 0.015); d.scale.set(1, 0.35, 0.7); prop('MA', d, x, z); }
  prop('MA', P.coqueiro(4, 0.5), -5.2, -5, 0.5); prop('MA', P.coqueiro(4, -0.5), -3.2, -5.6, 0.48);
  // Piauí: cactos e pedras
  prop('PI', P.cacto(), -1.4, -2.5, 0.45); prop('PI', mesh(G.sph(0.4, 8, 6), 0x9a8a78, 0.015), -1.0, -0.3, 1);
  // Ceará: jangada e coqueiro
  const jang = prop('CE', jangada(), 1.8, -6.6, 1, 0.3); prop('CE', P.coqueiro(4, 0.6), 1.6, -6.0, 0.5);
  prop('CE', predios(4, undefined, 0.55, 2), 3.0, -5.0, 1);
  // RN: dunas, buggy de praia simplificado (coqueiro)
  prop('RN', P.coqueiro(4, 0.3), 5.0, -4.0, 0.45);
  // PB: farol
  const farol = new THREE.Group(); put(farol, mesh(G.cyl(0.12, 0.18, 1.1, 10), 0xf2f2f2, 0.015), 0, 0.55, 0); put(farol, mesh(G.cyl(0.1, 0.12, 0.2, 10), 0xe63946, 0.012), 0, 1.15, 0);
  prop('PB', farol, 5.6, -2.4, 1.4);
  // PE: frevo + sobrados
  const fr = frevo(); prop('PE', fr.root, 5.2, -1.3, 0.2); prop('PE', predios(4, [0xf28482, 0xf6bd60, 0x84a59d, 0xf5cac3], 0.55, 3), 3.4, -0.6, 1);
  // AL: coqueiros e piscina natural
  prop('AL', P.coqueiro(4, 0.5), 4.5, 0.6, 0.45);
  // SE: casinhas
  prop('SE', predios(3, [0xe9c46a, 0x8ab6d6, 0xf1e3c6], 0.5, 4), 3.3, 1.6, 1);
  // BA: chapada, sertão, Salvador, boi
  const chap = mesh(G.cyl(1.1, 1.4, 0.8, 9), 0xb7774a, 0.02); prop('BA', chap, -2.9, 6.6, 1);
  prop('BA', P.cacto(), -3.5, 3.0, 0.45); prop('BA', boi(), -2.2, 1.2, 0.35, 0.6);
  prop('BA', predios(6, [0xf1e3c6, 0xe76f51, 0x8ab6d6, 0xf4a261], 0.55, 5), 1.9, 3.6, 1);
  prop('BA', P.coqueiro(4, 0.4), 1.3, 6.5, 0.48);
  const d = davi(); d.root.scale.setScalar(0.001); put(scene, d.root, -1.6, 0.4, 5);
  const andar = [[-1.6, 5.0], [0.2, 2.6], [0.0, -0.4], [0.6, -3.2], [0.2, -5.0]];
  return {
    scene, estados, E, d, fr, jang,
    animar(t, uSurgir) {
      estados.forEach((e, i) => {
        const k = ease(seg(uSurgir, i * 0.06, i * 0.06 + 0.12));
        e.m.scale.set(1, 1, 0.02 + k * 0.98); e.grupo.position.y = (1 - k) * -0.2;
        e.props.forEach((p, j) => { const kk = ease(seg(uSurgir, i * 0.06 + 0.1 + j * 0.03, i * 0.06 + 0.2 + j * 0.03)); p.scale.setScalar(Math.max(0.001, p.userData.s * (kk + Math.sin(kk * Math.PI) * 0.25))); });
      });
      fr.idle(t).setFace('neutra', 'gargalhada').setArm('R', 0.3, 2.4, 0.3).setArm('L', 0.2, 1.6 + Math.sin(t * 8) * 0.4, 0.6);
      fr.root.rotation.y = t * 2.5; fr.hips.position.y = 1.4 + Math.abs(Math.sin(t * 8)) * 0.12; fr.setLeg('L', Math.sin(t * 8) * 0.6, 0.7); fr.setLeg('R', -Math.sin(t * 8) * 0.6, 0.7);
      jang.position.y = 0.4 + Math.sin(t * 2) * 0.04; jang.rotation.z = Math.sin(t * 1.7) * 0.06;
      // Davi atravessa o mapa
      d.root.scale.setScalar(0.001 + 0.2 * ease(seg(t, 2.3, 2.7))); const pu = clamp((t - 2.4) / 3.6); const n = andar.length - 1; const i = Math.min(n - 1, Math.floor(pu * n)); const f = pu * n - i;
      const [x0, z0] = andar[i], [x1, z1] = andar[i + 1];
      d.root.position.set(lerp(x0, x1, f), 0.4, lerp(z0, z1, f)); d.root.rotation.y = Math.atan2(x1 - x0, z1 - z0);
      d.walk(t * 7).setFace('neutra', 'sorriso').blink(t);
    },
  };
}

// ======================= cenas =======================
export const CENAS = [
  // 1 — bastidores, montagem do sertão de mentira
  { ini: 0, fim: 3.4, build() {
    const E = estudio(); const { scene } = E;
    const a = ator(); put(scene, a.root, 0.6, 0.25, -0.6);
    const dir = diretor(); put(scene, dir.root, -2.4, 0, 5.3, 0.6); megafone(dir);
    const c1 = equipe(0), c2 = equipe(1), c3 = equipe(2), c4 = equipe(3);
    const cac = P.cacto(0, true); put(c1.root, cac, 0, 0.6, 0.55); cac.scale.setScalar(0.85);
    put(scene, c1.root, -6, 0.25, 3.0, Math.PI / 2); put(scene, c2.root, -2.5, 0.25, -2.2, 0.5); put(scene, c3.root, 3.0, 0, 7.4, Math.PI);
    put(scene, c4.root, 5.4, 0.25, 0.4, -Math.PI / 2);
    const pa = new THREE.Group(); put(pa, mesh(G.cyl(0.03, 0.03, 1.4, 6), COR.madeira, 0.01), 0, 0.5, 0); put(pa, mesh(G.box(0.3, 0.35, 0.05), 0x777777, 0.01), 0, -0.25, 0);
    P.naMao(c2, 'R', pa, 0, -0.3, 0.1);
    const terra = []; for (let i = 0; i < 14; i++) { const b = mesh(G.sph(0.07, 6, 5), 0x9a6232, 0.01); scene.add(b); terra.push(b); }
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [-1.2, 2.0, 17.5], [0.2, 1.6, 0]], [1, [0.9, 3.4, 8.8], [0.3, 2.1, -0.8]]], u); E.anima(t);
      a.idle(t).setFace('neutra', 'neutra').setArm('R', 2.3, 0.4, 1.6).look(0.2, 0, Math.sin(t) * 0.1);
      dir.idle(t).setArm('R', 1.3, 0.3, 0.3).setArm('L', 0.9, 0.9, 0.2).setFace('brava').talk(t, 0.9).look(0.4);
      c1.root.position.x = -6 + lt * 1.6; c1.walk(t * 7.5).setArm('L', 1.1, 0.3, 0.5).setArm('R', 1.1, 0.3, 0.5).setFace('neutra', 'neutra');
      const sw = Math.sin(t * 5); c2.idle(t).setArm('R', 0.6 + sw * 0.5, 0.2, 0.6).setArm('L', 0.6 + sw * 0.5, 0.1, 0.8).setFace('desconfiada', 'neutra'); c2.torso.rotation.x = 0.3 + sw * 0.15;
      c3.idle(t).setArm('L', 1.4, 0.2, 0.3).look(0.3, -0.1).setFace('neutra', 'neutra');
      c4.root.position.x = 5.4 - lt * 1.1; c4.walk(t * 7).setFace('neutra', 'neutra');
      terra.forEach((b, i) => { const p = ((t * 1.2 + i / terra.length) % 1); b.position.set(-2.0 + p * 1.6 + (i % 3) * 0.15, 1.2 + Math.sin(p * Math.PI) * 1.1 - p * 0.9, -1.9 + (i % 4) * 0.12); });
    } };
  } },
  // 2 — a mesma receita: filtro amarelo
  { ini: 3.4, fim: 6.3, build({ R }) {
    const E = estudio(); const { scene, mesa } = E;
    const tec = equipe(4); put(scene, tec.root, -6.7, 0, 7.65, Math.PI + 0.6);
    const a = ator(); put(scene, a.root, 0.6, 0.25, -0.6);
    const dir = diretor(); put(scene, dir.root, -3.2, 0.25, 3.4, 0.9); megafone(dir);
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [-9.8, 3.0, 11.2], [-7.3, 1.2, 6.4]], [0.42, [-9.6, 3.1, 10.9], [-7.2, 1.2, 6.3]], [1, [-7.0, 3.4, 11.6], [-0.5, 2.2, -0.5]]], u);
      tec.idle(t).setArm('R', 1.15, 0.05, 0.7).setArm('L', 0.9, 0.05, 0.9).look(0, 0.35).setFace('neutra', 'neutra');
      mesa.userData.knob.rotation.y = -ease(seg(lt, 0.6, 1.6)) * 2.6; E.anima(t);
      dir.idle(t).setArm('R', 1.4 + Math.sin(t * 3) * 0.15, 0.2, 0.2).setArm('L', 1.8, 0.6, 0.4).setFace('brava').talk(t, 1).look(0.3);
      a.idle(t).setFace('surpresa', 'sorriso').look(-0.3);
      filtroAmarelo(R, 0.55 * ease(seg(lt, 1.4, 2.3)));
    } };
  } },
  // 3 — atores forçando sotaque
  { ini: 6.3, fim: 10.0, build({ R }) {
    const E = estudio(); const { scene } = E;
    const a = ator(); put(scene, a.root, 0.5, 0.25, -0.6);
    const dir = diretor(); put(scene, dir.root, 3.1, 0.25, 1.1, -0.9);
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [3.4, 2.6, 7.6], [0.5, 2.5, -0.6], 40], [1, [1.0, 3.0, 2.2], [0.5, 2.95, -0.6], 32]], u); E.anima(t);
      const f = Math.sin(t * 3.2);
      a.idle(t).talk(t * 1.2, 1.5).setFace(f > 0.2 ? 'surpresa' : 'brava').setArm('R', 0.9 + f * 0.5, 0.7 + f * 0.3, 0.5).setArm('L', 0.6 - f * 0.4, 0.9, 0.7).look(f * 0.25, Math.sin(t * 5) * 0.08, -f * 0.12);
      a.torso.rotation.z = f * 0.06;
      const up = Math.abs(Math.sin(t * 4));
      dir.idle(t).setArm('R', 1.2 + up * 1.2, 0.5, 0.4).setArm('L', 1.2 + up * 1.2, 0.5, 0.4).setFace('surpresa', 'aberta');
      filtroAmarelo(R, 0.5);
    } };
  } },
  // 4 — claquete + "passar fome"
  { ini: 10.0, fim: 12.94, build({ R }) {
    const E = estudio(); const { scene, lamps } = E;
    lamps.forEach((l, i) => { l.cone.visible = i === 3; });
    E.spots.forEach((s, i) => s.intensity = i === 2 ? 140 : 15);
    const m = new Palito({ camisa: 0x8a7a62, saia: 0x6b5a45, cabelo: 'coque', corCabelo: 0x3a2a20, seed: 21 });
    put(scene, mesh(G.cyl(0.35, 0.3, 0.7, 12), COR.madeira, 0.02), 0, 0.6, -1.0);
    put(scene, m.root, 0, 0.27, -0.9);
    const prato = mesh(G.cyl(0.3, 0.2, 0.08, 18), 0xeeeeee, 0.012); put(m.torso, prato, 0, 0.08, 0.55);
    const clq = claquete(); scene.add(clq);
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [0.6, 6.4, 8.2], [0, 1.6, -0.9], 40], [0.28, [0.6, 6.2, 8.0], [0, 1.6, -0.9]], [1, [1.1, 2.4, 3.6], [0, 2.1, -0.9], 36]], u);
      // claquete na frente da câmera
      const v = new THREE.Vector3(0, -0.15, -1.6).applyQuaternion(cam.quaternion).add(cam.position);
      clq.position.copy(v); clq.quaternion.copy(cam.quaternion);
      clq.position.y -= ease(seg(lt, 0.55, 0.85)) * 3; clq.userData.piv.rotation.z = -0.5 * (1 - ease(seg(lt, 0.15, 0.3)));
      m.sit(t).setArm('L', 0.85, 0.05, 1.0).setArm('R', 0.85, 0.05, 1.0).setFace('triste', 'triste').look(0, lt < 1.6 ? 0.35 : 0.0);
      filtroAmarelo(R, 0.5); R.fx.vinheta = 1.2;
    } };
  } },
  // 5 — claquete + "fazer piada"
  { ini: 12.94, fim: 14.3, build({ R }) {
    const E = estudio(); const { scene } = E;
    const a = ator(); put(scene, a.root, -2.2, 0.25, 0.2, Math.PI / 2);
    const risos = [0, 1, 4].map((i, k) => { const c = equipe(i); put(scene, c.root, [-3.4, 2.6, 5.6][k], 0, [4.8, 4.9, 4.7][k], [2.6, -2.5, -2.8][k]); return c; });
    const clq = claquete(); scene.add(clq);
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      cam.position.set(1.7, 2.6, 9.6); cam.lookAt(-0.3, 1.7, 0); camMao(cam, t, 0.04);
      const v = new THREE.Vector3(0, -0.1, -1.5).applyQuaternion(cam.quaternion).add(cam.position);
      clq.position.copy(v); clq.quaternion.copy(cam.quaternion); clq.position.y -= ease(seg(lt, 0.25, 0.45)) * 3;
      clq.userData.piv.rotation.z = -0.5 * (1 - ease(seg(lt, 0.05, 0.15)));
      const q = ease(seg(lt, 0.45, 0.95));
      a.root.position.x = -2.2 + Math.min(lt, 0.7) * 2.2;
      a.walk(t * 9, 1 - q).setFace(q > 0.2 ? 'surpresa' : 'neutra', q > 0.2 ? 'aberta' : 'sorriso');
      a.root.rotation.x = q * 1.35; a.setArm('L', 2.4 * q, 1.2 * q, 0.3).setArm('R', 2.6 * q, 1.0 * q, 0.2);
      risos.forEach((c, i) => { c.idle(t).setFace('surpresa', 'gargalhada'); c.hips.position.y = 1.4 + Math.abs(Math.sin(t * 15 + i)) * 0.06; c.setArm('L', 0.6, 0.1, 1.4).setArm('R', 0.7, 0.1, 1.3); c.torso.rotation.x = 0.1 + Math.abs(Math.sin(t * 15 + i)) * 0.12; });
      filtroAmarelo(R, 0.5);
    } };
  } },
  // 6 — parede de monitores: o mesmo nordestino genérico
  { ini: 14.3, fim: 18.8, build({ R }) {
    const scene = P.novaCena(0x101216); scene.userData.hemi.intensity = 0.55;
    const mini = miniSertao(R);
    const mats = [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ map: mini.rt.texture, toneMapped: false }));
    put(scene, mesh(G.box(30, 16, 0.5), 0x1b1d22, 0), 0, 6, -1.4);
    let k = 0;
    for (let c = 0; c < 7; c++) for (let r = 0; r < 8; r++) {
      const tvm = P.tv('tubo', mats[k++ % 3]); tvm.scale.setScalar(0.95); put(scene, tvm, (c - 3) * 1.5, r * 1.12 - 0.6, 0);
    }
    const ops = [0, 2].map((i, n) => { const o = equipe(i); const x = n ? 1.6 : -1.8; put(scene, P.cadeira(0x3a3c42), x, 0, 10.4, Math.PI); put(scene, o.root, x, 0, 10.4, Math.PI); return o; });
    put(scene, mesh(G.box(7, 1.0, 1.4), 0x2a2c31, 0.02), 0, 0.5, 8.4);
    const brilho = new THREE.PointLight(0xffb86b, 60, 30, 1.5); brilho.position.set(0, 4, 4); scene.add(brilho);
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      mini.update(t);
      mats.forEach((m, i) => m.color.setScalar(0.8 + 0.2 * Math.abs(Math.sin(t * 7 + i * 2))));
      camPath(cam, [[0, [-0.08, 4.9, 1.35], [-0.08, 4.9, 0], 40], [1, [0, 4.6, 17], [0, 4.0, 0], 42]], u);
      ops.forEach((o) => o.sit(t).setArm('L', 1.2, 0.1, 0.5).setArm('R', 1.2, 0.1, 0.5));
    } };
  } },
  // 7 — atravessando a janela: Recife e Salvador antigas
  { ini: 18.8, fim: 22.0, build() {
    const scene = P.novaCena(P.ceu([0x8ec5e8, 0xd8eef5, 0xf7e2b5]));
    // parede do estúdio com janelão
    const pw = 0x26282d;
    put(scene, mesh(G.box(30, 20, 0.6), pw, 0.02), -18, 10, 0); put(scene, mesh(G.box(30, 20, 0.6), pw, 0.02), 18, 10, 0);
    put(scene, mesh(G.box(6, 1.2, 0.6), pw, 0.02), 0, 0.6, 0); put(scene, mesh(G.box(6, 11, 0.6), pw, 0.02), 0, 14.5, 0);
    for (const x of [-1.6, 1.6]) put(scene, mesh(G.box(0.18, 7.8, 0.3), 0x3b3d42, 0.01), x, 5, 0);
    put(scene, mesh(G.box(6, 0.18, 0.3), 0x3b3d42, 0.01), 0, 7.4, 0);
    const piso = mesh(G.box(40, 0.1, 14), 0x1e2024, 0); put(scene, piso, 0, -0.05, 7.2);
    // cidade colonial em direção ao mar
    put(scene, P.chao(0xb59a6a, 300, 300), 0, 0, -40);
    const mar = new THREE.Mesh(G.plane(600, 260), toon(0x3f8fb0)); mar.rotation.x = -Math.PI / 2; put(scene, mar, 0, 0.05, -230);
    const R0 = rnd(4); const cores = [0xe9c46a, 0x8ab6d6, 0xd9776a, 0x9bc49b, 0xf1e3c6, 0xd99a8b, 0xf4a261];
    const mats = cores.map((c, i) => toon(0xffffff, { map: P.texJanelas(c, 0x3a2a20, 3, 3, 0, i + 2) }));
    const igrejas = [[-25, -48], [29, -36]];
    for (let x = -50.4; x <= 50.4; x += 8.4) for (let z = -15; z >= -85; z -= 10.5) {
      if (Math.abs(x) < 4.5) continue;
      if (igrejas.some(([ix, iz]) => Math.abs(ix - x) < 13 && Math.abs(iz - z) < 16)) continue;
      const h = 6 + R0() * 7, w = 7.2, d = 8.4;
      const b = put(scene, mesh(G.box(w, h, d), mats[Math.floor(R0() * mats.length)], 0.03), x, h / 2, z);
      const tel = mesh(new THREE.CylinderGeometry(0.01, (w + 0.6) / Math.SQRT2, 2.6, 4, 1), COR.tijolo, 0.03); tel.rotation.y = Math.PI / 4; tel.scale.set(1, 1, (d + 0.5) / (w + 0.6));
      put(scene, tel, b.position.x, h + 1.3, b.position.z);
    }
    for (const [x, z] of igrejas) {
      put(scene, mesh(G.box(14, 16, 20), 0xf3efe4, 0.03), x, 8, z);
      for (const s of [-1, 1]) { put(scene, mesh(G.box(4, 26, 4), 0xf3efe4, 0.03), x + s * 5.2, 13, z + 9.2); put(scene, mesh(G.sph(2.2, 14, 10), 0x6f9ab8, 0.02), x + s * 5.2, 27.2, z + 9.2); }
      put(scene, mesh(G.box(3.2, 6, 0.4), COR.madeiraEsc, 0.015), x, 3, z + 10.1);
    }
    for (let i = 0; i < 6; i++) { const a = P.arvore(COR.verde, 2.5); a.scale.setScalar(2.2); put(scene, a, -45 + i * 18, 0, -94); }
    for (const [x, s] of [[-120, 60], [-40, 45], [60, 70], [150, 55]]) { const m = mesh(G.sph(s, 20, 12), 0x6f9a5a, 0.04); m.scale.y = 0.4; put(scene, m, x, 0, -340); }
    const navios = [];
    for (let i = 0; i < 6; i++) {
      const n = new THREE.Group();
      put(n, mesh(G.box(2.2, 1.2, 7), 0x6b4428, 0.03), 0, 0.6, 0);
      for (const z of [-1.8, 1.2]) { put(n, mesh(G.cyl(0.08, 0.1, 7, 6), COR.madeiraEsc, 0.01), 0, 4.3, z); const v = mesh(G.box(0.1, 3.4, 2.4), 0xf6f1e2, 0.02); put(n, v, 0.1, 4.6, z).rotation.x = 0.05; }
      n.scale.setScalar(3.5); put(scene, n, -60 + i * 26, 0, -125 - (i % 3) * 30, 1.2 + i * 0.2); navios.push(n);
    }
    const nuvs = [put(scene, P.nuvem(6), -60, 70, -300), put(scene, P.nuvem(5), 70, 60, -280)];
    const aves = put(scene, P.passaros(7, 3), -20, 26, -60); aves.scale.setScalar(2);
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [0, 4.6, 15], [0, 4.6, 0]], [0.45, [0, 4.7, -1.5], [0, 4.6, -20]], [1, [0, 30, -12], [0, 0, -95]]], u);
      nuvs.forEach((nv, i) => nv.position.x += 0.04 * (i ? -1 : 1)); aves.position.x = -20 + lt * 6; aves.userData.update(t);
      navios.forEach((n, i) => { n.position.y = Math.sin(t * 1.5 + i) * 0.15; n.rotation.z = Math.sin(t * 1.2 + i) * 0.03; n.position.x += 0.01; });
    } };
  } },
  // 8 — centros ricos e letrados
  { ini: 22.0, fim: 24.9, build() {
    const scene = P.novaCena(P.ceu([0x86bfe6, 0xe5f2f6]));
    const pedra = P.canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#9a9184'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6e665b'; g.lineWidth = 3;
      for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 * 24; x < w; x += 48) { g.beginPath(); g.ellipse(x, y + 16, 22, 14, 0, 0, 7); g.stroke(); } });
    scene.add(P.chao(0, 200, 200, P.rep(pedra, 30)));
    const cores = [0xe9c46a, 0x8ab6d6, 0xd9776a, 0x9bc49b, 0xf1e3c6, 0xf4a261, 0xc5a3c9];
    for (let i = 0; i < 9; i++) {
      const x = -30 + i * 7.6, h = 12 + (i % 3) * 2.4;
      if (i === 5) continue;
      put(scene, mesh(G.box(7.6, h, 8), toon(0xffffff, { map: P.texJanelas(cores[i % 7], 0x3a2a20, 3, 3, 0, i) }), 0.03), x, h / 2, -8);
      put(scene, mesh(G.box(7.9, 0.6, 8.4), 0xefe7d5, 0.02), x, h, -8);
      put(scene, mesh(G.box(2.2, 4.0, 0.2), COR.madeiraEsc, 0.015), x, 2.0, -3.92);
      for (const sx of [-1, 1]) put(scene, mesh(G.box(1.9, 0.15, 1.0), 0x2b2b2b, 0.01), x + sx * 2.1, 6.6, -3.5);
    }
    // faculdade com colunas
    const fx = 8; put(scene, mesh(G.box(9, 14, 8), 0xf3efe4, 0.03), fx, 7, -9);
    for (let i = 0; i < 4; i++) put(scene, mesh(G.cyl(0.45, 0.5, 10.4, 12), 0xffffff, 0.02), fx - 3.3 + i * 2.2, 5.45, -4.2);
    const fr = mesh(G.cyl(0.01, 6.5, 2.6, 3), 0xf3efe4, 0.02); fr.rotation.x = Math.PI / 2; fr.rotation.y = Math.PI; fr.scale.set(1, 0.4, 1); put(scene, fr, fx, 11.6, -4.2);
    put(scene, mesh(G.box(9.6, 0.5, 2.2), 0xe8e0cc, 0.02), fx, 0.25, -3.3);
    put(scene, mesh(G.box(6.8, 28, 6.8), 0xf3efe4, 0.03), -14, 14, -32); put(scene, mesh(G.sph(3.4, 16, 12), 0x6f9ab8, 0.02), -14, 29.6, -32);
    const nuvs = [put(scene, P.nuvem(2.5), -20, 30, -60), put(scene, P.nuvem(2), 15, 34, -70)];
    const aves = put(scene, P.passaros(5, 8), -10, 20, -20);
    const gente = [];
    const extras = [{ chapeu: 'cartola', paleto: 0x3d3d4f }, { saia: 0x8e5572 }, { paleto: 0x5a4632, chapeu: 'cartola' }, {}, { saia: 0x3c6e71 }, { paleto: 0x2f3e46 }];
    for (let i = 0; i < 12; i++) {
      const p = pessoa(i + 2, extras[i % 6]); const livro = mesh(G.box(0.3, 0.4, 0.1), [0x8b2e2e, 0x2e4a8b, 0x3a6b35][i % 3], 0.01);
      P.naMao(p, 'L', livro, 0, -0.45, 0.08);
      const dir = i % 2 ? 1 : -1; const z = dir > 0 ? (i % 4 < 2 ? -1.0 : -0.1) : (i % 4 < 2 ? 0.9 : 1.8); put(scene, p.root, -14 + i * 2.4, 0, z, dir * Math.PI / 2); gente.push({ p, dir, x0: -14 + i * 2.4 });
    }
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [-10, 4.2, 13], [-8, 4.6, -3]], [1, [3, 4.4, 13], [5, 5.2, -3]]], u);
      nuvs.forEach((nv, i) => nv.position.x += 0.03); aves.position.x = -10 + lt * 5; aves.userData.update(t);
      gente.forEach(({ p, dir, x0 }, i) => { p.root.position.x = x0 + dir * lt * 1.2; p.walk(t * 6.5 + i).setFace('neutra', i % 2 ? 'sorriso' : 'neutra').setArm('L', 0.9, 0.1, 1.2); if (i % 3 === 0) p.look(0, 0.2); });
    } };
  } },
  // 9 — rotativas: a mídia
  { ini: 24.9, fim: 28.4, build() {
    const scene = P.novaCena(0x2e2722); scene.userData.hemi.intensity = 0.8;
    const l = new THREE.PointLight(0xffd59a, 160, 40, 1.4); l.position.set(0, 9, 4); scene.add(l);
    scene.add(P.chao(0x4a4038, 100, 100));
    put(scene, mesh(G.box(60, 20, 0.5), 0x3a312b, 0), 0, 10, -6);
    const jornal = P.canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#f1ede2'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2b2b'; g.fillRect(30, 30, w - 60, 46);
      g.fillStyle = '#8f8a80'; g.fillRect(30, 100, 220, 150);
      g.fillStyle = '#5a5751'; for (let c = 0; c < 3; c++) for (let y = 270; y < h - 30; y += 16) g.fillRect(30 + c * 155, y, 140, 6);
      for (let y = 100; y < 250; y += 16) g.fillRect(270, y, 210, 6); });
    jornal.wrapS = THREE.RepeatWrapping; jornal.repeat.set(6, 1);
    const maq = put(scene, new THREE.Group(), 0, 0, 0); maq.scale.setScalar(1.45);
    put(maq, mesh(G.box(18, 1.6, 3), 0x5d6670, 0.03), 0, 0.8, 0);
    const rolos = [];
    for (let i = 0; i < 7; i++) {
      const r = mesh(G.cyl(0.55, 0.55, 3.2, 20), i % 2 ? 0x9a3b34 : 0x8a9097, 0.02); r.rotation.x = Math.PI / 2; put(maq, r, -7.5 + i * 2.5, 2.3, 0); rolos.push(r);
      put(maq, mesh(G.box(0.4, 1.4, 3.4), 0x4a525b, 0.02), -7.5 + i * 2.5, 1.6, 0);
    }
    const tira = new THREE.Mesh(G.plane(18, 2.6), toon(0xffffff, { map: jornal })); tira.rotation.x = -Math.PI / 2; put(maq, tira, 0, 2.87, 0);
    const folhas = [];
    for (let i = 0; i < 14; i++) { const f = new THREE.Mesh(G.plane(1.2, 1.5), toon(0xffffff, { map: P.canvasTex(256, 320, (g, w, h) => g.drawImage(jornal.userData.canvas, 0, 0, w, h)), side: THREE.DoubleSide })); scene.add(f); folhas.push(f); }
    const op = equipe(1); put(scene, op.root, 2, 0, 3.4, 0.2);
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [-8, 8.5, 9], [-4, 3.4, 0]], [1, [6, 7.5, 9.5], [10, 4.5, 0]]], u);
      rolos.forEach((r) => r.rotation.y = -t * 6); jornal.offset.x = -t * 1.5;
      folhas.forEach((f, i) => { const p = (t * 0.45 + i / folhas.length) % 1; f.position.set(13 + p * 4 - Math.sin(p * 6 + i) * 1.5, 4.2 + p * 7, Math.sin(p * 5 + i) * 2.5 + p * 3); f.rotation.set(p * 6 + i, p * 4, p * 3); });
      op.idle(t).setArm('R', 1.2, 0.2, 0.5).setFace('desconfiada', 'neutra').look(-0.6, 0.2);
    } };
  } },
  // 10 — redação no eixo Rio–São Paulo
  { ini: 28.4, fim: 31.4, build() {
    const scene = P.novaCena(P.ceu([0x7fb3db, 0xcfe6f2]));
    scene.add(P.chao(0x8a6a4a, 100, 100));
    // parede com janelão
    put(scene, mesh(G.box(40, 2.2, 0.4), 0xe2d9c6, 0.02), 0, 1.1, -5); put(scene, mesh(G.box(40, 3, 0.4), 0xe2d9c6, 0.02), 0, 8.5, -5);
    for (let x = -18; x <= 18; x += 4) put(scene, mesh(G.box(0.3, 6, 0.4), 0xd4cab4, 0.02), x, 5, -5);
    // horizonte: arranha-céus + morro
    const R0 = rnd(3);
    for (let i = 0; i < 22; i++) { const h = 10 + R0() * 26, w = 3 + R0() * 2; put(scene, mesh(G.box(w, h, 3), toon(0xffffff, { map: P.texJanelas([0x7e93a8, 0xa7b4c2, 0x8b8f96, 0x6a7d91][i % 4], 0x29435e, 5, 16, 0.1, i) }), 0.04), -40 + i * 4, h / 2 - 2, -30 - R0() * 20); }
    const morro = mesh(G.sph(9, 18, 14), 0x5f8a55, 0.05); morro.scale.set(0.6, 1.4, 0.6); put(scene, morro, 22, 0, -70);
    const aves10 = put(scene, P.passaros(6, 5), -12, 16, -20);
    const jornalistas = [];
    for (let i = 0; i < 6; i++) {
      const x = -9 + (i % 3) * 5, z = i < 3 ? -1.8 : 1.6;
      put(scene, mesh(G.box(3, 0.15, 1.6), COR.madeira, 0.02), x, 1.5, z); for (const s of [-1, 1]) put(scene, mesh(G.box(0.12, 1.5, 1.4), COR.madeiraEsc, 0.01), x + s * 1.4, 0.75, z);
      const tvm = P.tv('tubo', basic(0x2c5a3a)); tvm.scale.setScalar(0.45); put(scene, tvm, x - 0.5, 1.55, z - 0.3);
      put(scene, mesh(G.box(0.8, 0.2, 0.5), 0x3a3a3a, 0.01), x + 0.6, 1.68, z + 0.2);
      put(scene, P.cadeira(0x55606e), x, 0, z + 1.2, Math.PI); const j = pessoa(i, { calca: 0x2d3142 }); put(scene, j.root, x, 0, z + 1.2, Math.PI); jornalistas.push(j);
    }
    const ed = new Palito({ camisa: 0xffffff, gravata: 0x7a2f35, calca: 0x3a3f47, cabelo: 'careca', oculos: true, bigode: true, seed: 88 });
    const folha = new THREE.Mesh(G.plane(0.35, 0.45), basic(0xf4f1e8, { side: THREE.DoubleSide })); P.naMao(ed, 'L', folha, 0, -0.5, 0.05);
    put(scene, ed.root, -6, 0, 4.2, Math.PI / 2);
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [-10, 3.6, 10.5], [-6, 2.6, -1]], [1, [3, 3.2, 10.5], [6, 3.2, -4]]], u); aves10.position.x = -12 + lt * 6; aves10.userData.update(t);
      jornalistas.forEach((j, i) => { j.sit(t).setArm('L', 1.25 + Math.sin(t * 18 + i) * 0.1, 0.1, 0.4).setArm('R', 1.25 + Math.cos(t * 18 + i) * 0.1, 0.1, 0.4).look(0, 0.2); j.root.rotation.y = Math.PI; j.root.position.y = 0; });
      ed.root.position.x = -6 + lt * 2.6; ed.walk(t * 6.5).setArm('R', 1.4, 0.4, 0.2).setFace('brava').talk(t, 0.8).look(-0.6);
    } };
  } },
  // 11 — TVs ligando no país inteiro
  { ini: 31.4, fim: 34.5, build() {
    const scene = P.novaCena(P.ceu([0x232c4a, 0x4b4f75, 0xd98b5f])); scene.userData.hemi.intensity = 0.55; scene.userData.sol.intensity = 0.6;
    scene.add(P.chao(0x3a3d44, 200, 200));
    const cols = 3, rows = 5, cw = 4.2, rh = 3.4, quartos = [];
    const R0 = rnd(12); const paredes = [0xd9b48f, 0x9fb7a0, 0xc7a3a3, 0xa8b8d0, 0xe0cfa0];
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const x = (c - 1) * cw, y = 0.6 + r * rh;
      const fundo = new THREE.Mesh(G.plane(cw - 0.6, rh - 0.6), new THREE.MeshToonMaterial({ color: paredes[(c + r) % 5], emissive: 0x000000 }));
      put(scene, fundo, x, y + rh / 2, -1.6);
      put(scene, mesh(G.box(cw - 0.6, 0.1, 1.6), 0x6b4a33, 0), x, y + 0.35, -0.8);
      const sofa = mesh(G.box(2.2, 0.6, 0.7), [0x8d5a4a, 0x4a6a8d, 0x6a8d4a][(c + r) % 3], 0.015); put(scene, sofa, x, y + 0.7, -1.2);
      const p = pessoa(c * 5 + r); p.root.scale.setScalar(0.62); put(scene, p.root, x + (R0() - 0.5) * 0.6, y + 0.6, -1.05);
      const tvm = P.tv('tubo', basic(0x111111)); tvm.scale.setScalar(0.42); put(scene, tvm, x + 1.0, y + 0.35, -0.1, Math.PI + 0.3);
      quartos.push({ fundo, p, liga: R0() * 0.6 + 0.05, tela: tvm.userData.tela });
    }
    const pc = 0x7d6b5d;
    for (let r = 0; r <= rows; r++) put(scene, mesh(G.box(cols * cw + 0.6, 0.6, 0.8), pc, 0.02), 0, 0.6 + r * rh, 0);
    for (let c = 0; c <= cols; c++) put(scene, mesh(G.box(0.6, rows * rh + 0.6, 0.8), pc, 0.02), (c - 1.5) * cw, 0.6 + rows * rh / 2, 0);
    put(scene, mesh(G.box(cols * cw + 1, 1, 6), 0x5d5047, 0.02), 0, 0.3, -2);
    for (const x of [-9, 9]) put(scene, mesh(G.box(5, 22, 5), toon(0xffffff, { map: P.texJanelas(0x4a4f63, 0x1c2030, 3, 7, 0.35, x) }), 0.03), x, 11, -3);
    put(scene, mesh(G.box(80, 0.05, 6), 0x2c2e33, 0), 0, 0.03, 5);
    const carros = [0, 1, 2].map((i) => { const c = carro([0xd64545, 0xf2c14e, 0x3d7dd8][i]); c.scale.setScalar(1.3); put(scene, c, -30 + i * 22, 0, i % 2 ? 6.2 : 3.8, i % 2 ? -Math.PI / 2 : Math.PI / 2); return c; });
    const cam = P.novaCamera(44);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [-3.5, 3, 12], [-1.5, 3.8, 0]], [1, [3, 14.5, 12], [0.5, 13, 0]]], u);
      carros.forEach((c, i) => { c.position.x = -30 + i * 22 + (i % 2 ? -1 : 1) * lt * 7; });
      quartos.forEach((q, i) => {
        const on = u > q.liga; const fl = on ? 0.55 + 0.25 * Math.abs(Math.sin(t * 9 + i)) : 0;
        q.fundo.material.emissive.setRGB(fl * 0.55, fl * 0.42, fl * 0.25);
        q.p.sit(t).setFace(on ? 'surpresa' : 'neutra', on ? 'aberta' : 'neutra').look(0.5, 0.1);
      });
    } };
  } },
  // 12 — família vê o Sudeste "moderno" na TV
  { ini: 34.5, fim: 37.7, build({ R }) {
    const scene = P.novaCena(0x2a2420);
    scene.add(P.chao(0x7a5a3e, 40, 40));
    put(scene, mesh(G.box(16, 8, 0.3), 0xb58f6b, 0.02), 0, 4, -3);
    for (const s of [-1, 1]) put(scene, mesh(G.box(0.3, 8, 14), 0xa8835f, 0.02), s * 6, 4, 3);
    const mini = miniAvenida(R);
    const tvm = P.tv('tubo', mini.mat); tvm.scale.setScalar(1.35); put(scene, tvm, 0, 0.9, -1.8);
    put(scene, mesh(G.box(2.6, 0.9, 1.4), COR.madeiraEsc, 0.02), 0, 0.45, -1.8);
    const sf = P.sofa(0x5d7f5a, 3); put(scene, sf.g, 0, 0, 3.6, Math.PI);
    const fam = [pessoa(0), pessoa(1), pessoa(3)];
    fam.forEach((p, i) => { if (i === 2) p.root.scale.setScalar(0.75); put(sf.g, p.root, sf.lugares[i], i === 2 ? 0.24 : 0.06, 0.05); });
    const luz = new THREE.PointLight(0x9fd0ff, 30, 12, 1.5); luz.position.set(0, 2.2, -0.5); scene.add(luz);
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      mini.update(t);
      camPath(cam, [[0, [0.8, 3.9, 8.5], [0, 2.3, -1.8], 42], [0.35, [0.3, 3.9, 5.2], [-0.1, 2.3, -1.8], 40], [0.7, [-0.1, 2.9, 2.0], [-0.11, 2.27, -1.8], 39], [1, [-0.11, 2.27, 0.15], [-0.11, 2.27, -1.8], 38]], u);
      fam.forEach((p, i) => { p.sit(t); p.look(Math.sin(t + i) * 0.05, 0); });
      luz.intensity = 25 + Math.sin(t * 11) * 6;
    } };
  } },
  // 13 — o mapa do Nordeste ganha vida
  { ini: 37.7, fim: 43.7, build() {
    const M = mapaNordeste(); const cam = P.novaCamera(42);
    return { scene: M.scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [-4, 6.5, 15], [-1, 0, 3.5], 42], [0.5, [3.5, 8, 6], [0.5, 0, -1], 42], [1, [1, 15, 9], [0, 0, -1.2], 44]], u);
      M.animar(lt, u * 1.6);
    } };
  } },
  // 14 — tudo jogado na mesma caixa
  { ini: 43.7, fim: 45.8, build() {
    const M = mapaNordeste(); const { scene } = M;
    const caixa = new THREE.Group(); put(scene, caixa, 8.5, 0, 6);
    const cb = 0xc9a36b;
    put(caixa, mesh(G.box(4.4, 0.1, 4.4), cb, 0.02), 0, 0.05, 0);
    for (const [x, z, w, d] of [[0, 2.15, 4.4, 0.1], [0, -2.15, 4.4, 0.1], [2.15, 0, 0.1, 4.4], [-2.15, 0, 0.1, 4.4]]) put(caixa, mesh(G.box(w, 3, d), cb, 0.02), x, 1.5, z);
    const abas = [[0, 2.2, 0], [0, -2.2, Math.PI], [2.2, 0, -Math.PI / 2], [-2.2, 0, Math.PI / 2]].map(([x, z, ry]) => {
      const piv = put(caixa, new THREE.Group(), x, 3, z, ry); put(piv, mesh(G.box(4.4, 0.06, 2.2), 0xb89262, 0.015), 0, 0, 1.1); piv.rotation.x = 0.6; return piv;
    });
    const maos = [-1, 1].map((s) => {
      const g = new THREE.Group(); scene.add(g);
      put(g, mesh(G.cyl(0.12, 0.12, 14, 8), COR.preto, 0), 0, 7, 0);
      const m = mesh(G.sph(1.1, 16, 12), COR.preto, 0.03); m.scale.set(1.3, 0.6, 1); g.add(m); return g;
    });
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [2, 17, 16], [2.5, 0, 1]], [1, [4.5, 15, 15], [4.5, 0.5, 2.5]]], u);
      M.animar(lt + 6, 2);
      M.d.root.visible = false;
      M.estados.forEach((e, i) => {
        const k = easeIO(seg(u, 0.08 + i * 0.05, 0.42 + i * 0.05));
        const ox = e.cx, oz = e.cz;
        e.grupo.position.set((8.5 - ox) * k, Math.sin(k * Math.PI) * 4 + k * (0.3 + i * 0.25), (6 - oz) * k);
        e.grupo.scale.setScalar(1 - k * 0.8); e.grupo.rotation.y = k * (i % 2 ? 0.8 : -0.8);
      });
      maos.forEach((m, i) => { const s = i ? 1 : -1; const k = ease(seg(u, 0, 0.25)); const v = ease(seg(u, 0.15, 0.7));
        m.position.set(s * (7 - v * 4) + v * 4, lerp(12, 1.6, k), lerp(-2, 4, v)); m.rotation.y = s * 0.5; });
      abas.forEach((a) => a.rotation.x = lerp(0.6, -Math.PI / 2 + 0.02, ease(seg(u, 0.78, 0.97))) * -1 + 0);
    } };
  } },
  // 15 — a imagem se distorce: o sertão de barro rachado
  { ini: 45.8, fim: 50.3, build({ R }) {
    const scene = P.novaCena(0x1a1b20); scene.userData.hemi.intensity = 0.55;
    const papel = P.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5b4a5e'; g.fillRect(0, 0, w, h); g.fillStyle = '#6d5a70'; for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 16; x < w; x += 32) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); } });
    put(scene, mesh(G.box(20, 10, 0.3), toon(0xffffff, { map: P.rep(papel, 8, 4) }), 0.02), 0, 5, -1.5);
    scene.add(P.chao(0x4a3a30, 40, 40));
    const miniA = miniDaviPraca(R), miniB = miniSertao(R);
    const telaMat = new THREE.MeshBasicMaterial({ map: miniA.rt.texture, toneMapped: false });
    put(scene, mesh(G.box(2.6, 0.8, 1.6), COR.madeiraEsc, 0.02), 0, 0.4, 0);
    const tvm = P.tv('antiga', telaMat); tvm.scale.setScalar(1.6); put(scene, tvm, 0, 0.8, 0);
    put(scene, P.arvore(0x4f7a46, 0.6), 2.6, 0, -0.6); put(scene, mesh(G.cyl(0.25, 0.2, 0.6, 10), 0x9a5a3a, 0.02), 2.6, 0.3, -0.6);
    const brilho = new THREE.PointLight(0xffc38a, 40, 15, 1.5); brilho.position.set(0, 2.5, 2.5); scene.add(brilho);
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      const troca = lt > 1.55;
      if (troca) { miniB.update(t); telaMat.map = miniB.rt.texture; } else { miniA.update(t); telaMat.map = miniA.rt.texture; }
      camPath(cam, [[0, [1.6, 3.0, 7.5], [0, 2.4, 0.6], 40], [1, [-0.13, 2.43, 2.35], [-0.13, 2.43, 0.9], 40]], u);
      const g = seg(lt, 1.15, 1.55) * (1 - seg(lt, 1.55, 2.0)) * 2;
      R.fx.glitch = clamp(g + (lt > 1.15 && lt < 2.0 ? 0.25 : 0)); if (troca) { R.fx.tint.setRGB(1, 0.75, 0.45); R.fx.tintAmt = 0.25 * seg(lt, 1.6, 2.6); }
    } };
  } },
  // 16 — coronéis caricatos e povo esperando milagre: e era tudo cenário
  { ini: 50.3, fim: 55.0, build({ R }) {
    const E = estudio(); const { scene } = E;
    const cor = coronel(); put(scene, cor.root, 0.4, 0.25, -0.4);
    const povo = [0, 1, 2].map((i) => { const p = new Palito({ camisa: [0x9a8a6a, 0x7a6a55, 0xa89a7a][i], saia: i === 1 ? 0x5d4a3a : undefined, calca: 0x6b5a45, chapeu: i === 2 ? 'palha' : undefined, cabelo: i === 1 ? 'coque' : 'curto', seed: 60 + i }); put(scene, p.root, [-2.4, -3.6, 2.8][i], 0.25, [0.8, -0.4, 0.9][i], [0.4, 0.6, -0.5][i]); return p; });
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [0.9, 3.0, 3.2], [0.4, 2.8, -0.4], 38], [0.35, [0.8, 3.3, 5.5], [0.2, 2.6, -0.4], 40], [1, [-1, 7.5, 18.5], [0, 3, -1], 44]], u);
      const b = Math.abs(Math.sin(t * 13));
      cor.idle(t).setFace('brava', 'gargalhada').setArm('R', 0.5, 0.15, 1.5).setArm('L', 1.3 + b * 0.2, 0.7, 0.3).look(0, -0.2 - b * 0.08);
      cor.torso.rotation.x = -0.1 - b * 0.06; cor.hips.position.y = 1.4 + b * 0.04;
      povo.forEach((p, i) => { p.kneel(t).setArm('L', 2.5 + Math.sin(t * 2 + i) * 0.1, 0.35, 0.3).setArm('R', 2.5 + Math.sin(t * 2 + i) * 0.1, 0.35, 0.3).setFace('triste', 'aberta').look(0, -0.45); });
      R.fx.tint.setRGB(1, 0.8, 0.4); R.fx.tintAmt = 0.5 * (1 - ease(seg(u, 0.4, 0.9))); E.anima(t);
    } };
  } },
  // 17 — décadas de salas assistindo à mesma coisa
  { ini: 55.0, fim: 58.9, build({ R }) {
    const scene = P.novaCena(0x1c1a18);
    const mini = miniSertao(R);
    const salas = [[0xb5703a, 'antiga', 0x8a5a2a], [0x5f9e9a, 'tubo', 0x7a4a6a], [0x9aa0a8, 'plana', 0x3f5a7a]];
    const gente = [];
    salas.forEach(([parede, tipo, sofaCor], i) => {
      const x = (i - 1) * 7.2;
      const pap = P.canvasTex(128, 128, (g, w, h) => { g.fillStyle = P.hex(parede); g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.18)'; if (i === 0) for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(32 + (k % 2) * 64, 32 + Math.floor(k / 2) * 64, 22, 0, 7); g.fill(); } else if (i === 1) for (let k = 0; k < 8; k++) g.fillRect(k * 16, 0, 6, h); });
      put(scene, mesh(G.box(7, 7, 0.3), toon(0xffffff, { map: P.rep(pap, 4, 4) }), 0.02), x, 3.5, -2.5);
      put(scene, mesh(G.box(7, 0.2, 6), [0x7a5233, 0x9a8a7a, 0x6a6a6a][i], 0.01), x, -0.1, 0.5);
      put(scene, mesh(G.box(0.5, 7.2, 6.4), 0x2a2622, 0.02), x + 3.6, 3.5, 0.5);
      const tvm = P.tv(tipo, mini.mat); tvm.scale.setScalar(tipo === 'plana' ? 1.0 : 0.95); put(scene, tvm, x - 2.0, tipo === 'plana' ? 0.2 : 0.55, -1.4, 0.75);
      if (tipo !== 'plana') put(scene, mesh(G.box(1.6, 0.55, 1.2), COR.madeiraEsc, 0.015), x - 2.0, 0.27, -1.4).rotation.y = 0.75;
      const sf = P.sofa(sofaCor, 2); put(scene, sf.g, x + 1.5, 0, 0.7, -0.9);
      const ex = [{ cabelo: 'cacheado', camisa: 0xe39b3a, calca: 0x6b3a2a }, { chapeu: 'bone', corBone: 0x2a9d8f, camisa: 0x7a4ac2 }, { camisa: 0x3a3a3a, oculos: true }][i];
      for (let k = 0; k < 2; k++) { const p = pessoa(i * 2 + k, ex); put(sf.g, p.root, sf.lugares[k], 0.06, 0.05); gente.push(p); }
      const l = new THREE.PointLight(0xffa860, 35, 10, 1.5); l.position.set(x - 1.4, 1.6, -0.6); scene.add(l);
    });
    const cam = P.novaCamera(40);
    return { scene, cam, update(lt, u, t) {
      mini.update(t);
      camPath(cam, [[0, [-7.6, 3.2, 9], [-7.4, 1.8, -0.6]], [1, [7.4, 3.2, 9], [7.4, 1.8, -0.6]]], u);
      gente.forEach((p, i) => { p.sit(t).setFace(i % 2 ? 'desconfiada' : 'neutra', i % 3 === 0 ? 'sorriso' : 'neutra').look(-0.2, 0.05); });
    } };
  } },
  // 18 — o preconceito na vida real: imitação no escritório
  { ini: 58.9, fim: 61.4, build() { return escritorio(false); } },
  // 19 — Davi percebe
  { ini: 61.4, fim: 63.9, build() { return escritorio(true); } },
  // 20 — luzes se apagam, cenário desmontado
  { ini: 63.9, fim: 66.6, build({ R }) {
    const E = estudio(); const { scene, lamps, spots, cactos, casa, fundoPiv } = E;
    const c1 = equipe(0), c2 = equipe(3); put(scene, c1.root, 1.2, 0.25, -2.4, Math.PI / 2); put(scene, c2.root, -5, 0.25, 2.2, 0.6);
    const cam = P.novaCamera(42);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [0.5, 3.4, 8.5], [0, 2.4, -1]], [1, [0, 8.5, 21], [0, 2.6, -1]]], u);
      const apag = Math.floor(u * 9);
      lamps.forEach((l, i) => { const on = i >= apag; l.cone.visible = on; l.r.userData.vidro.material.color.setHex(on ? 0xfff3c4 : 0x333333); });
      spots.forEach((s, i) => s.intensity = 90 * (1 - ease(seg(u, 0.15 + i * 0.2, 0.35 + i * 0.2))));
      scene.userData.hemi.intensity = lerp(0.7, 0.35, u);
      cactos.forEach((c, i) => { const k = ease(seg(u, 0.1 + i * 0.12, 0.3 + i * 0.12)); c.scale.setScalar(Math.max(0.001, 1.6 * (1 - k))); c.rotation.y = i * 0.6 + k * 3; });
      casa.position.x = 3.6 + ease(seg(u, 0.35, 0.9)) * 12;
      fundoPiv.rotation.x = -ease(seg(u, 0.55, 0.95)) * 1.45;
      const em = seg(u, 0.35, 0.9); c1.root.position.set(casa.position.x - 3.05, 0.25, -2.4); c1.walk(t * 6, em > 0 && em < 1 ? 1 : 0).setArm('L', 1.5, 0.12, 0.1).setArm('R', 1.5, 0.12, 0.1); c1.torso.rotation.x = 0.2; E.anima(t);
      c2.idle(t).setArm('R', 1.5, 0.4, 0.4).setFace('neutra', 'neutra');
      R.fx.escuro = 0.35 * ease(u);
    } };
  } },
  // 21 — a porta se abre: o Nordeste real, amplo e vivo
  { ini: 66.6, fim: DURACAO, build({ R }) {
    const scene = P.novaCena(P.ceu([0x7fa7d1, 0xf3c98b, 0xf29a6b]));
    scene.userData.sol.position.set(-6, 6, -20); scene.userData.sol.color.setHex(0xffe2b8);
    // parede com porta
    const pw = 0x23252a;
    put(scene, mesh(G.box(40, 30, 0.5), pw, 0.02), -21.2, 15, 0); put(scene, mesh(G.box(40, 30, 0.5), pw, 0.02), 21.2, 15, 0);
    put(scene, mesh(G.box(2.4, 26, 0.5), pw, 0.02), 0, 17, 0);
    const portaPiv = put(scene, new THREE.Group(), -1.2, 0, 0.05);
    put(portaPiv, mesh(G.box(2.35, 3.95, 0.12), 0x3b3e45, 0.02), 1.17, 2, 0);
    put(portaPiv, mesh(G.sph(0.08, 8, 6), 0xc9a84a, 0.01), 2.1, 1.9, 0.12);
    put(scene, mesh(G.box(40, 0.1, 12), 0x1b1c20, 0), 0, -0.04, 6.2);
    // calçadão, areia, mar
    const ondas = P.canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2b2b';
      for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + 18 + Math.sin(x / w * Math.PI * 2) * 14); g.lineTo(w, y + 32 + 18); for (let x = w; x >= 0; x -= 8) g.lineTo(x, y + 50 + Math.sin(x / w * Math.PI * 2) * 14); g.fill(); } });
    const calc = new THREE.Mesh(G.plane(300, 8), toon(0xffffff, { map: P.rep(ondas, 60, 2) })); calc.rotation.x = -Math.PI / 2; put(scene, calc, 0, 0.02, -5);
    const areia = new THREE.Mesh(G.plane(300, 26), toon(0xecd5a0)); areia.rotation.x = -Math.PI / 2; put(scene, areia, 0, 0.01, -22);
    const mar = new THREE.Mesh(G.plane(500, 300), toon(0x3d93b5)); mar.rotation.x = -Math.PI / 2; put(scene, mar, 0, -0.02, -185);
    const espuma = []; for (let i = 0; i < 3; i++) { const e = new THREE.Mesh(G.plane(300, 0.5), basic(0xf7f7f2)); e.rotation.x = -Math.PI / 2; put(scene, e, 0, 0.03, -35 - i * 3); espuma.push(e); }
    const sol = new THREE.Mesh(new THREE.CircleGeometry(9, 40), basic(0xffe7a8)); put(scene, sol, -30, 18, -260);
    const coqs = []; for (let x = -63; x <= 63; x += 14) { if (Math.abs(x) < 10) continue; const c = P.coqueiro(4, x % 28 ? 0.6 : -0.6); c.scale.setScalar(3.1 + (Math.abs(x) % 3) * 0.2); put(scene, c, x, 0, -9.8); coqs.push(c); }
    const jangs = []; for (let i = 0; i < 7; i++) { const j = jangada([0xe94f37, 0xf6f1e2, 0xf2c14e, 0x3d7dd8][i % 4]); j.scale.setScalar(9); put(scene, j, -50 + i * 16, 0, -60 - (i % 3) * 25); jangs.push(j); }
    // prédios da orla nas laterais
    const R0 = rnd(21);
    for (let i = 0; i < 12; i++) for (const s of [-1, 1]) { const h = 18 + R0() * 40; put(scene, mesh(G.box(12, h, 12), toon(0xffffff, { map: P.texJanelas([0xf1e3c6, 0xe9c46a, 0xa8c5da, 0xe8a87c][i % 4], 0x5a6b7a, 5, Math.round(h / 5.5), 0.1, i) }), 0.04), s * (36 + i * 14), h / 2, 10 - i * 3); }
    const nuvs = [put(scene, P.nuvem(3), 20, 40, -160), put(scene, P.nuvem(2.2), -50, 34, -150)]; const aves = put(scene, P.passaros(8, 11), -15, 14, -28); aves.scale.setScalar(1.4);
    // pessoas vivendo
    const gente = [];
    for (let i = 0; i < 14; i++) { const p = pessoa(i); const dir = i % 2 ? 1 : -1; const pista = (i >> 1) % 2; const z = dir > 0 ? (pista ? -4.0 : -3.1) : (pista ? -6.1 : -5.2); put(scene, p.root, -30 + i * 4.3, 0, z, dir * Math.PI / 2); gente.push({ p, dir, x0: -30 + i * 4.3, v: 1.15 }); }
    const vend = pessoa(6, { chapeu: 'palha' }); put(scene, vend.root, 4.5, 0, -7.9);
    const carr = new THREE.Group(); put(carr, mesh(G.box(1.6, 1, 1), 0x2a9d8f, 0.02), 0, 0.9, 0); put(carr, mesh(G.cyl(0.02, 0.02, 2.4, 5), COR.preto, 0), 0, 2, 0);
    const guarda = mesh(G.cone(1.4, 0.6, 8), 0xe63946, 0.02); put(carr, guarda, 0, 3.2, 0); put(scene, carr, 6.9, 0, -8.1);
    const d = davi(); put(scene, d.root, 0.6, 0, -12.5, 0);
    const cam = P.novaCamera(44);
    return { scene, cam, update(lt, u, t) {
      camPath(cam, [[0, [0, 2.3, 5.5], [0, 2.2, 0], 44], [0.3, [0, 2.4, -0.5], [0, 2.4, -20], 46], [1, [0, 14, -1.5], [0, 0, -26], 50]], u);
      portaPiv.rotation.y = -ease(seg(lt, 0.0, 0.7)) * 1.9;
      R.fx.flash = 0.5 * seg(lt, 0.25, 0.6) * (1 - seg(lt, 0.6, 1.1));
      gente.forEach(({ p, dir, x0, v }, i) => { p.root.position.x = x0 + dir * lt * v * 1.4; p.walk(t * 6.5 * v + i).setFace('neutra', i % 3 ? 'sorriso' : 'neutra').blink(t); });
      vend.idle(t).setFace('neutra', 'sorriso').setArm('R', 1.6, 1.0 + Math.sin(t * 6) * 0.3, 0.3);
      d.root.position.z = -12 + lt * 0.9; d.walk(t * 6).setFace('neutra', 'sorriso').look(Math.sin(t) * 0.3);
      jangs.forEach((j, i) => { j.position.y = Math.sin(t * 1.5 + i) * 0.2; j.rotation.z = Math.sin(t + i) * 0.05; j.position.x += 0.02; });
      coqs.forEach((c) => c.userData.balanca(t)); nuvs.forEach((nv) => nv.position.x += 0.03); aves.position.x = -15 + lt * 5; aves.userData.update(t);
      espuma.forEach((e, i) => { e.position.z = -35 - i * 3 + Math.sin(t * 1.2 + i) * 0.8; });
    } };
  } },
];

function escritorio(closeDavi) {
  const scene = P.novaCena(0xe7e2d6);
  scene.add(P.chao(0x9aa3a8, 60, 60));
  put(scene, mesh(G.box(30, 8, 0.3), 0xe3ddcf, 0.02), 0, 4, -4);
  put(scene, mesh(G.box(30, 8, 0.3), 0xd8d2c4, 0.02), 0, 4, 9);
  put(scene, mesh(G.box(1.6, 3.2, 0.1), 0x8a6a4a, 0.015), -3, 1.6, 8.8);
  for (const [x, c] of [[1.5, 0x5fa8d3], [3.8, 0xf4a259], [6, 0x81b29a]]) put(scene, mesh(G.box(1.4, 1.0, 0.06), c, 0.012), x, 4.2, 8.8);
  put(scene, P.arvore(0x4f8a46, 0.8), -6, 0, 8).scale.setScalar(0.8);
  const persiana = P.canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#cfd8dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#a7b3b8'; for (let y = 0; y < h; y += 10) g.fillRect(0, y, w, 4); });
  for (const x of [-6, 0, 6]) put(scene, new THREE.Mesh(G.plane(4, 3), toon(0xffffff, { map: persiana })), x, 4.6, -3.84);
  for (const [x, z] of [[-4.5, -1.6], [4.6, -1.8]]) {
    put(scene, mesh(G.box(3, 0.12, 1.5), 0xd9d2c3, 0.02), x, 1.5, z); for (const s of [-1, 1]) put(scene, mesh(G.box(0.1, 1.5, 1.4), 0x8a8f94, 0.01), x + s * 1.4, 0.75, z);
    const m = P.tv('plana', basic(0x2b4a6a)); m.scale.setScalar(0.45); put(scene, m, x, 1.4, z - 0.3);
    put(scene, P.arvore(0x4f8a46, 0.8), x + 1.8, 0, z - 1.2).scale.setScalar(0.6);
  }
  const col = colega(); put(scene, col.root, 0, 0, -0.6);
  const ris = [pessoa(5, { calca: 0x2d3142 }), pessoa(1)];
  put(scene, ris[0].root, -2.3, 0, -0.2, 0.6); put(scene, ris[1].root, 2.0, 0, -0.9, -0.5);
  const d = davi(); put(scene, d.root, 2.4, 0, 2.4, -2.5);
  const cam = P.novaCamera(closeDavi ? 34 : 42);
  return { scene, cam, update(lt, u, t) {
    if (!closeDavi) camPath(cam, [[0, [-1.0, 2.8, 9], [0.3, 2.5, 0]], [1, [0.2, 2.6, 7.2], [0.5, 2.5, 0]]], u);
    else camPath(cam, [[0, [0.75, 3.05, 0.15], [2.4, 2.75, 2.4]], [1, [1.05, 2.95, 0.6], [2.4, 2.75, 2.4]]], u);
    const b = Math.abs(Math.sin(t * 9));
    col.idle(t).setArm('L', 2.75, 0.55, 1.25).setArm('R', 2.75, 0.55, 1.25).setFace('surpresa', 'gargalhada').look(Math.sin(t * 4) * 0.2, -0.1, Math.sin(t * 4.5) * 0.12);
    col.hips.position.y = 1.4 - b * 0.12; col.setLeg('L', 0.2 * b, 0.4 * b, 0.1); col.setLeg('R', 0.2 * b, 0.4 * b, 0.1); col.torso.rotation.z = Math.sin(t * 4.5) * 0.1;
    ris.forEach((r, i) => { r.idle(t).setFace('surpresa', 'gargalhada').setArm('L', 0.6, 0.1, 1.4).setArm('R', 0.6, 0.1, 1.4); r.hips.position.y = 1.4 + Math.abs(Math.sin(t * 14 + i)) * 0.05; r.torso.rotation.x = Math.abs(Math.sin(t * 14 + i)) * 0.1; });
    d.idle(t);
    if (!closeDavi) d.setFace('neutra', lt < 1.2 ? 'sorriso' : 'neutra').look(0.25, 0.05);
    else {
      const s = lt < 0.35 ? ['neutra', 'neutra'] : lt < 0.9 ? ['surpresa', 'neutra'] : ['triste', 'triste'];
      d.setFace(s[0], s[1]).look(lerp(0.25, -0.5, ease(seg(lt, 0.9, 1.8))), lerp(0.05, 0.25, ease(seg(lt, 0.9, 1.8))));
      d.setArm('L', ease(seg(lt, 1.2, 1.8)) * 0.5, 0.1, ease(seg(lt, 1.2, 1.8)) * 1.6);
    }
  } };
}
