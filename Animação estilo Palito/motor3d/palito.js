// Motor 3D "Animação estilo Palito": personagens palito + visual de desenho (toon + contorno preto).
import * as THREE from './three.module.min.js';
export { THREE };

// ---------------- paleta (cores chapadas, meio dessaturadas) ----------------
export const COR = {
  branco: 0xf6f4ee, preto: 0x141414, contorno: 0x151515,
  azulCamisa: 0x8db3d8, vermelho: 0xb5483d, vinho: 0x7a2f35, bege: 0xd9c49b, marrom: 0x7a5233,
  couro: 0x9a6232, terra: 0xc98a4b, barro: 0xb8693c, areia: 0xe3cf9c, laranja: 0xe58e3c,
  verde: 0x6f9a5a, oliva: 0x6d7a45, azulCeu: 0x9cc7e6, mar: 0x3f8fb0, cinza: 0x8c8f93,
  amarelo: 0xf0c75a, madeira: 0x9b6b42, madeiraEsc: 0x6b4428, tijolo: 0xb05f45, noite: 0x1d2433,
};

// ---------------- materiais ----------------
const gradTex = (() => {
  const d = new Uint8Array([150, 215, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const cacheToon = new Map();
export function toon(color, extra = {}) {
  const key = color + JSON.stringify(Object.keys(extra));
  if (!Object.keys(extra).length && cacheToon.has(key)) return cacheToon.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: gradTex, ...extra });
  if (!Object.keys(extra).length) cacheToon.set(key, m);
  return m;
}
export function basic(color, extra = {}) { return new THREE.MeshBasicMaterial({ color, ...extra }); }

const cacheOutline = new Map();
function outlineMat(t) {
  if (cacheOutline.has(t)) return cacheOutline.get(t);
  const m = new THREE.ShaderMaterial({
    uniforms: { t: { value: t }, c: { value: new THREE.Color(COR.contorno) } },
    vertexShader: `uniform float t; void main(){ vec3 p = position + normalize(normal) * t;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide,
  });
  m.userData.isOutline = true;
  cacheOutline.set(t, m);
  return m;
}

/** Cria uma malha com material toon e contorno preto (casco invertido). */
export function mesh(geo, cor, contorno = 0.02, extra) {
  const mat = (typeof cor === 'number') ? toon(cor, extra) : cor;
  const m = new THREE.Mesh(geo, mat);
  if (contorno > 0) {
    const o = new THREE.Mesh(geo, outlineMat(contorno));
    o.userData.isOutline = true;
    m.add(o);
  }
  return m;
}
export const G = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  sph: (r, ws = 24, hs = 16) => new THREE.SphereGeometry(r, ws, hs),
  cyl: (rt, rb, h, s = 20) => new THREE.CylinderGeometry(rt, rb, h, s),
  cap: (r, l) => new THREE.CapsuleGeometry(r, l, 8, 20),
  cone: (r, h, s = 20) => new THREE.ConeGeometry(r, h, s),
  plane: (w, h) => new THREE.PlaneGeometry(w, h),
  tor: (r, t, a = Math.PI * 2) => new THREE.TorusGeometry(r, t, 8, 24, a),
};
/** atalho: cria e posiciona */
export function put(parent, obj, x = 0, y = 0, z = 0, ry = 0) {
  obj.position.set(x, y, z); obj.rotation.y = ry; parent.add(obj); return obj;
}

// ---------------- texturas desenhadas (canvas) ----------------
export function canvasTex(w, h, desenhar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); desenhar(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4; t.userData.canvas = c; t.userData.ctx = g; return t;
}
export function hex(c) { return '#' + c.toString(16).padStart(6, '0'); }
export function listras(base, linha, n = 7) {
  return canvasTex(64, 256, (g, w, h) => {
    g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
    g.fillStyle = hex(linha);
    for (let i = 0; i < n; i++) g.fillRect(0, (i + 0.5) * h / n, w, h / n * 0.22);
  });
}
/** chão rachado de sertão */
export function texRachado(base = COR.terra, seed = 3) {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
    let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    g.strokeStyle = 'rgba(60,30,15,0.75)'; g.lineWidth = 3;
    for (let i = 0; i < 70; i++) {
      let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 140; y += (r() - 0.5) * 140; g.lineTo(x, y); }
      g.stroke();
    }
    g.fillStyle = 'rgba(255,230,180,0.15)';
    for (let i = 0; i < 300; i++) g.fillRect(r() * w, r() * h, 3, 3);
  });
}
/** textura repetida */
export function rep(tex, rx, ry = rx) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(rx, ry); return tex; }
/** chão plano com textura */
export function chao(cor, w = 80, d = 80, tex = null) {
  const m = new THREE.Mesh(G.plane(w, d), tex ? toon(0xffffff, { map: tex }) : toon(cor));
  m.rotation.x = -Math.PI / 2; return m;
}
export function texJanelas(base, janela, cols = 6, rows = 14, acesas = 0.3, seed = 1) {
  return canvasTex(256, 512, (g, w, h) => {
    let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
    const cw = w / cols, rh = h / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      g.fillStyle = r() < acesas ? '#f3dc8a' : hex(janela);
      g.fillRect(i * cw + cw * 0.18, j * rh + rh * 0.2, cw * 0.64, rh * 0.55);
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 2;
      g.strokeRect(i * cw + cw * 0.18, j * rh + rh * 0.2, cw * 0.64, rh * 0.55);
    }
  });
}
/** céu em degradê como fundo de cena */
export function ceu(cores) {
  return canvasTex(8, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    cores.forEach((c, i) => gr.addColorStop(i / (cores.length - 1), hex(c)));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

// ---------------- utilidades de animação ----------------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeIO = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export function rnd(seed) { let s = seed * 9973 + 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/** caminho de câmera: lista de [t(0-1), [x,y,z] posição, [x,y,z] alvo] */
export function camPath(cam, keys, u, fov) {
  let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const k = b === a ? 0 : easeIO((u - a[0]) / Math.max(1e-6, b[0] - a[0]));
  cam.position.set(lerp(a[1][0], b[1][0], k), lerp(a[1][1], b[1][1], k), lerp(a[1][2], b[1][2], k));
  cam.lookAt(lerp(a[2][0], b[2][0], k), lerp(a[2][1], b[2][1], k), lerp(a[2][2], b[2][2], k));
  if (a[3] || b[3]) { cam.fov = lerp(a[3] || fov || 40, b[3] || fov || 40, k); cam.updateProjectionMatrix(); }
}

// ---------------- personagem palito ----------------
/**
 * new Palito({camisa, listras, calca, cabelo:'curto'|'cacheado'|'coque'|'longo'|'careca'|'liso',
 *   corCabelo, bigode, barba, chapeu:'couro'|'bone'|'coronel'|null, saia, oculos, gravata, colete})
 */
export class Palito {
  constructor(o = {}) {
    this.o = o;
    const root = this.root = new THREE.Group();
    const hips = this.hips = put(root, new THREE.Group(), 0, 1.4, 0);
    this.seed = o.seed ?? Math.random() * 100;
    const calca = o.calca ?? COR.bege;
    // pernas (coxa + canela, joelho articulado)
    this.leg = {};
    for (const [lado, x] of [['L', -0.11], ['R', 0.11]]) {
      const coxa = put(hips, new THREE.Group(), x, -0.02, 0);
      const mC = put(coxa, mesh(G.cyl(0.055, 0.05, 0.7, 10), calca, 0.018), 0, -0.35, 0);
      const joelho = put(coxa, new THREE.Group(), 0, -0.7, 0);
      put(joelho, mesh(G.cyl(0.05, 0.048, 0.66, 10), calca, 0.018), 0, -0.33, 0);
      const sap = mesh(G.sph(0.09, 14, 10), COR.preto, 0.012);
      sap.scale.set(0.9, 0.55, 1.5); put(joelho, sap, 0, -0.68, 0.06);
      this.leg[lado] = { coxa, joelho, mC };
    }
    if (o.saia) {
      const s = mesh(G.cyl(0.24, 0.42, 0.75, 20), o.saia, 0.02); put(hips, s, 0, -0.3, 0); this.saia = s;
    }
    // tronco
    const torso = this.torso = put(hips, new THREE.Group(), 0, 0, 0);
    const matCamisa = o.listras ? toon(0xffffff, { map: listras(o.camisa ?? COR.azulCamisa, o.listras) })
      : toon(o.camisa ?? COR.azulCamisa);
    const corpo = mesh(G.cap(0.29, 0.42), matCamisa, 0.022);
    put(torso, corpo, 0, 0.5, 0); this.corpo = corpo;
    if (!o.saia) put(torso, mesh(G.cyl(0.255, 0.25, 0.22, 20), calca, 0.018), 0, 0.03, 0);
    if (o.cinto !== false && !o.saia) put(torso, mesh(G.cyl(0.262, 0.262, 0.05, 20), COR.marrom, 0), 0, 0.12, 0);
    if (o.colete) put(torso, mesh(G.cap(0.3, 0.36), o.colete, 0.02), 0, 0.52, -0.01).scale.set(1, 1, 0.98);
    if (o.paleto) {
      const p = mesh(G.cap(0.305, 0.4), o.paleto, 0.022); put(torso, p, 0, 0.49, 0);
      const v = mesh(G.cone(0.12, 0.34, 3), o.camisaPaleto ?? COR.branco, 0); v.rotation.z = Math.PI;
      put(torso, v, 0, 0.78, 0.25).scale.set(1, 1, 0.3);
    }
    if (o.gravata) put(torso, mesh(G.box(0.07, 0.3, 0.03), o.gravata, 0.01), 0, 0.68, 0.3).rotation.x = -0.2;
    if (o.cracha) put(torso, mesh(G.box(0.1, 0.13, 0.02), COR.branco, 0.01), 0.13, 0.55, 0.29).rotation.x = -0.1;
    // braços (palito preto + mão luva)
    this.arm = {};
    for (const [lado, x] of [['L', -0.27], ['R', 0.27]]) {
      const ombro = put(torso, new THREE.Group(), x, 0.8, 0);
      put(ombro, mesh(G.cyl(0.024, 0.024, 0.44, 6), COR.preto, 0), 0, -0.22, 0);
      const cot = put(ombro, new THREE.Group(), 0, -0.44, 0);
      put(cot, mesh(G.cyl(0.024, 0.024, 0.4, 6), COR.preto, 0), 0, -0.2, 0);
      const mao = mesh(G.sph(0.075, 14, 10), COR.preto, 0.008); mao.scale.set(1, 0.95, 0.7);
      put(cot, mao, 0, -0.43, 0);
      this.arm[lado] = { ombro, cot, mao, s: lado === 'L' ? -1 : 1 };
    }
    // cabeça
    const pesc = this.neck = put(torso, new THREE.Group(), 0, 0.98, 0);
    const head = this.head = put(pesc, new THREE.Group(), 0, 0.4, 0);
    put(head, mesh(G.sph(0.42, 32, 24), COR.branco, 0.025), 0, 0, 0);
    const olho = () => { const e = new THREE.Mesh(G.sph(0.042, 12, 10), basic(COR.preto)); return e; };
    this.eyes = [put(head, olho(), -0.13, 0.05, 0.39), put(head, olho(), 0.13, 0.05, 0.39)];
    this.brows = [-1, 1].map((s) => {
      const g = put(head, new THREE.Group(), s * 0.14, 0.18, 0.375);
      g.rotation.x = -0.35;
      const b = new THREE.Mesh(G.box(0.16, 0.04, 0.04), basic(COR.preto)); g.add(b); g.userData.s = s; return g;
    });
    // boca: vários formatos, só um visível
    const boca = this.boca = put(head, new THREE.Group(), 0, -0.15, 0.39);
    boca.rotation.x = 0.35;
    const mk = (geo, sx = 1, sy = 1) => { const m = new THREE.Mesh(geo, basic(COR.preto)); m.scale.set(sx, sy, 1); m.visible = false; boca.add(m); return m; };
    this.bocas = {
      sorriso: (() => { const m = mk(G.tor(0.075, 0.014, Math.PI)); m.rotation.z = Math.PI; return m; })(),
      triste: (() => { const m = mk(G.tor(0.07, 0.014, Math.PI)); m.position.y = -0.04; return m; })(),
      neutra: mk(G.box(0.11, 0.025, 0.02)),
      aberta: mk(new THREE.CircleGeometry(0.06, 20), 1, 1.2),
      gargalhada: (() => { const m = mk(new THREE.CircleGeometry(0.11, 24, Math.PI, Math.PI)); m.position.y = 0.03; return m; })(),
    };
    if (o.bigode) {
      for (const s of [-1, 1]) {
        const b = new THREE.Mesh(G.sph(0.09, 14, 10), basic(COR.preto));
        b.scale.set(o.bigode === 'grande' ? 1.5 : 1, 0.45, 0.4); b.rotation.z = -s * 0.25;
        put(head, b, s * (o.bigode === 'grande' ? 0.11 : 0.075), -0.08, 0.4);
      }
      this.boca.position.y = -0.2;
    }
    if (o.barba) {
      const b = mesh(G.sph(0.4, 24, 16, 0, Math.PI * 2), o.barba === true ? COR.preto : o.barba, 0);
      b.scale.set(1.02, 0.6, 0.9); put(head, b, 0, -0.17, 0.04);
      this.boca.position.set(0, -0.15, 0.43);
    }
    if (o.oculos) {
      for (const s of [-1, 1]) put(head, new THREE.Mesh(G.tor(0.075, 0.012), basic(COR.preto)), s * 0.13, 0.05, 0.405);
      put(head, new THREE.Mesh(G.box(0.1, 0.015, 0.015), basic(COR.preto)), 0, 0.06, 0.41);
    }
    this._cabelo(o);
    this._chapeu(o);
    const somb = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    somb.rotation.x = -Math.PI / 2; somb.position.y = 0.012; somb.userData.semNormal = true; root.add(somb); this.sombra = somb;
    this.setFace('neutra', 'neutra');
    root.traverse((m) => { if (m.isMesh) m.frustumCulled = false; });
  }

  _cabelo(o) {
    const cor = o.corCabelo ?? COR.preto, h = this.head;
    const tipo = o.cabelo ?? 'curto';
    if (tipo === 'careca') return;
    const capa = (r = 0.445, tl = 1.25) => {
      const m = mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, tl), cor, 0.02);
      m.rotation.x = -0.35; return put(h, m, 0, 0.02, -0.03);
    };
    if (tipo === 'cacheado') {
      const R = rnd(5);
      for (let i = 0; i < 46; i++) {
        const th = R() * Math.PI * 2, ph = R() * 1.15;
        const x = Math.sin(ph) * Math.cos(th), y = Math.cos(ph), z = Math.sin(ph) * Math.sin(th);
        if (z > 0.55 && y < 0.75) continue;
        put(h, mesh(G.sph(0.13 + R() * 0.05, 12, 10), cor, 0.015), x * 0.4, y * 0.4 + 0.02, z * 0.4 - 0.05);
      }
    } else capa(tipo === 'liso' ? 0.45 : 0.445, tipo === 'liso' ? 1.35 : 1.2);
    if (tipo === 'coque') put(h, mesh(G.sph(0.17), cor, 0.02), 0, 0.3, -0.33);
    if (tipo === 'longo') {
      const m = mesh(G.cap(0.38, 0.5), cor, 0.02); m.scale.set(1.05, 1, 0.6); put(h, m, 0, -0.35, -0.2);
    }
  }

  _chapeu(o) {
    if (!o.chapeu) return;
    const h = this.head;
    if (o.chapeu === 'couro' || o.chapeu === 'coronel' || o.chapeu === 'palha') {
      const cor = o.chapeu === 'couro' ? COR.couro : o.chapeu === 'palha' ? 0xe2c779 : 0xefe6d2;
      const largura = o.chapeu === 'couro' ? 0.78 : 0.7;
      const pts = [];
      for (let i = 0; i <= 10; i++) { const r = 0.3 + (largura - 0.3) * i / 10; pts.push(new THREE.Vector2(r, Math.pow(i / 10, 2.4) * (o.chapeu === 'couro' ? 0.22 : 0.06))); }
      const aba = mesh(new THREE.LatheGeometry(pts, 32), cor, 0.02, { side: THREE.DoubleSide });
      put(h, aba, 0, 0.27, 0).rotation.x = -0.12;
      const copa = mesh(G.cyl(0.25, 0.32, 0.36, 24), cor, 0.02); put(h, copa, 0, 0.47, -0.03).rotation.x = -0.12;
      if (o.chapeu === 'couro') {
        for (let i = 0; i < 5; i++) {
          const e = new THREE.Mesh(G.cone(0.035, 0.08, 4), basic(0xf3d27a));
          put(h, e, -0.16 + i * 0.08, 0.36, 0.3).rotation.x = Math.PI / 2;
        }
      } else put(h, mesh(G.cyl(0.335, 0.335, 0.06, 24), COR.preto, 0), 0, 0.33, -0.02).rotation.x = -0.12;
    } else if (o.chapeu === 'cartola') {
      put(h, mesh(G.cyl(0.55, 0.55, 0.03, 28), COR.preto, 0.015), 0, 0.3, 0).rotation.x = -0.1;
      put(h, mesh(G.cyl(0.27, 0.29, 0.5, 24), COR.preto, 0.015), 0, 0.55, -0.03).rotation.x = -0.1;
    } else if (o.chapeu === 'bone') {
      const c = mesh(new THREE.SphereGeometry(0.45, 28, 14, 0, Math.PI * 2, 0, 1.3), o.corBone ?? 0x3d5a80, 0.02);
      put(h, c, 0, 0.04, 0).rotation.x = -0.25;
      const v = mesh(G.box(0.42, 0.03, 0.3), o.corBone ?? 0x3d5a80, 0.015); put(h, v, 0, 0.18, 0.42).rotation.x = 0.15;
    }
  }

  /** sobrancelha: neutra | brava | triste | surpresa | desconfiada.  boca: sorriso|triste|neutra|aberta|gargalhada */
  setFace(sob, boca) {
    const conf = { neutra: [0, 0.18], brava: [-0.38, 0.15], triste: [0.35, 0.19], surpresa: [0.05, 0.24], desconfiada: [-0.2, 0.17] }[sob] || [0, 0.18];
    this.brows.forEach((g) => { g.rotation.z = -g.userData.s * conf[0]; g.position.y = conf[1]; });
    if (sob === 'desconfiada') { this.brows[1].rotation.z = 0.1; this.brows[1].position.y = 0.22; }
    if (boca) { for (const k in this.bocas) this.bocas[k].visible = k === boca; this._boca = boca; }
    return this;
  }
  /** boca falando (0..1) */
  talk(t, amt = 1) {
    const a = this.bocas.aberta;
    const v = Math.abs(Math.sin(t * 11 + this.seed)) * 0.7 + Math.abs(Math.sin(t * 17.3)) * 0.3;
    if (amt > 0) { for (const k in this.bocas) this.bocas[k].visible = k === 'aberta'; a.scale.set(1, 0.3 + v * 1.1 * amt, 1); }
    return this;
  }
  blink(t) {
    const p = (t + this.seed) % 3.7;
    const s = p < 0.12 ? 0.12 : 1;
    this.eyes.forEach((e) => e.scale.y = s);
    return this;
  }
  /** braço: frente (rad, + = para frente), abre (rad, + = para fora), cotovelo (rad, + = dobra pra frente) */
  setArm(lado, frente = 0, abre = 0.08, cotovelo = 0) {
    const a = this.arm[lado];
    a.ombro.rotation.set(-frente, 0, a.s * abre);
    a.cot.rotation.set(-cotovelo, 0, 0);
    return this;
  }
  setLeg(lado, frente = 0, joelho = 0, abre = 0) {
    const l = this.leg[lado];
    l.coxa.rotation.set(-frente, 0, (lado === 'L' ? -1 : 1) * abre); l.joelho.rotation.set(joelho, 0, 0);
    return this;
  }
  look(yaw = 0, pitch = 0, tilt = 0) { this.head.rotation.set(pitch, yaw, tilt); return this; }
  /** parado respirando */
  idle(t, k = 1) {
    this.hips.position.y = 1.4; this.torso.rotation.set(0, 0, Math.sin(t * 1.3 + this.seed) * 0.015 * k);
    this.corpo.scale.set(1, 1 + Math.sin(t * 2.2 + this.seed) * 0.012, 1);
    this.setLeg('L', 0, 0); this.setLeg('R', 0, 0);
    this.setArm('L', Math.sin(t * 1.1 + this.seed) * 0.04, 0.1); this.setArm('R', Math.sin(t * 1.2 + this.seed + 1) * 0.04, 0.1);
    this.blink(t); return this;
  }
  /** ciclo de caminhada; fase em radianos */
  walk(ph, amt = 1) {
    const s = Math.sin(ph);
    this.setLeg('L', s * 0.45 * amt, Math.max(0, -Math.cos(ph)) * 0.5 * amt);
    this.setLeg('R', -s * 0.45 * amt, Math.max(0, Math.cos(ph)) * 0.5 * amt);
    this.setArm('L', -s * 0.45 * amt, 0.12, 0.25 * amt); this.setArm('R', s * 0.45 * amt, 0.12, 0.25 * amt);
    this.hips.position.y = 1.4 + Math.abs(Math.cos(ph)) * 0.05 * amt - 0.03 * amt;
    this.torso.rotation.set(0.04 * amt, s * 0.08 * amt, 0);
    return this;
  }
  sit(t) {
    this.hips.position.y = 0.72;
    this.setLeg('L', Math.PI / 2, Math.PI / 2, 0.06); this.setLeg('R', Math.PI / 2, Math.PI / 2, 0.06);
    this.torso.rotation.set(-0.08, 0, 0); this.blink(t); return this;
  }
  kneel(t) {
    this.hips.position.y = 0.72;
    this.setLeg('L', 0, Math.PI / 2, 0.08); this.setLeg('R', 0, Math.PI / 2, 0.08);
    this.blink(t); return this;
  }
}

/** coloca um objeto na mão do personagem */
export function naMao(p, lado, obj, x = 0, y = -0.46, z = 0.04) { return put(p.arm[lado].cot, obj, x, y, z); }
/** objeto que não entra no passe de contorno (brilhos, cones de luz) */
export function semContorno(o) { o.traverse((m) => m.userData.semNormal = true); return o; }
export function coneLuz(r = 1.6, h = 8, cor = 0xfff1c0, op = 0.13) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 24, 1, true), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.userData.semNormal = true; return m;
}

// ---------------- props reutilizáveis ----------------
export function cacto(cor = 0x7fa05a, papelao = false) {
  const g = new THREE.Group();
  const mat = papelao ? toon(0xc9a36b) : cor;
  const f = papelao ? (w, h) => G.box(w, h, 0.05) : (w, h) => G.cap(w / 2, h);
  put(g, mesh(f(0.36, 1.6), mat, 0.025), 0, 0.95, 0);
  const b1 = put(g, mesh(f(0.22, 0.6), mat, 0.022), -0.34, 1.15, 0);
  put(g, mesh(f(0.36, 0.14), mat, 0.02), -0.2, 0.86, 0).rotation.z = Math.PI / 2;
  b1.position.y = 1.1;
  const b2 = put(g, mesh(f(0.22, 0.5), mat, 0.022), 0.32, 1.35, 0);
  put(g, mesh(f(0.32, 0.14), mat, 0.02), 0.2, 1.12, 0).rotation.z = Math.PI / 2;
  b2.position.y = 1.32;
  if (papelao) put(g, mesh(G.box(0.08, 0.9, 0.5), 0x8a6a40, 0.015), 0, 0.45, -0.25).rotation.x = 0.5;
  return g;
}
export function casaBarro(w = 3, h = 2.2, d = 2.5, cor = COR.barro) {
  const g = new THREE.Group();
  put(g, mesh(G.box(w, h, d), cor, 0.03), 0, h / 2, 0);
  const telh = mesh(new THREE.CylinderGeometry(0.01, (w + 0.5) / Math.SQRT2, 0.9, 4, 1), COR.tijolo, 0.03);
  telh.rotation.y = Math.PI / 4; telh.scale.set(1, 1, (d + 0.4) / (w + 0.5)); put(g, telh, 0, h + 0.45, 0);
  put(g, mesh(G.box(0.7, 1.3, 0.06), COR.madeiraEsc, 0.02), -0.5, 0.65, d / 2 + 0.01);
  put(g, mesh(G.box(0.6, 0.5, 0.06), 0x3b2a1e, 0.02), 0.75, 1.3, d / 2 + 0.01);
  return g;
}
export function arvore(cor = COR.verde, h = 2.2) {
  const g = new THREE.Group();
  put(g, mesh(G.cyl(0.1, 0.15, h, 8), COR.madeiraEsc, 0.02), 0, h / 2, 0);
  for (const [x, y, z, r] of [[0, h + 0.3, 0, 0.8], [0.5, h, 0.2, 0.6], [-0.5, h + 0.1, -0.1, 0.62], [0, h + 0.6, -0.3, 0.55]])
    put(g, mesh(G.sph(r, 14, 10), cor, 0.025), x, y, z);
  return g;
}
export function coqueiro(h = 4, curva = 0.5) {
  const g = new THREE.Group();
  const n = 6; let x = 0, y = 0;
  for (let i = 0; i < n; i++) {
    const s = mesh(G.cyl(0.11, 0.14, h / n + 0.05, 8), 0x8d6a45, 0.02);
    const nx = x + curva * (i / n) * 0.35, ny = y + h / n;
    s.position.set((x + nx) / 2, (y + ny) / 2, 0); s.rotation.z = -Math.atan2(nx - x, h / n); g.add(s); x = nx; y = ny;
  }
  for (let i = 0; i < 7; i++) {
    const f = mesh(G.cap(0.12, 1.4), 0x4f8a43, 0.02); f.scale.set(1, 1, 0.35);
    const piv = put(g, new THREE.Group(), x, y, 0, (i / 7) * Math.PI * 2);
    f.position.set(0, 0, 0.75); f.rotation.x = Math.PI / 2 + 0.5; piv.add(f);
  }
  put(g, mesh(G.sph(0.13, 10, 8), 0x6b4a2a, 0.01), x + 0.12, y - 0.1, 0.05);
  return g;
}
export function nuvem(s = 1) {
  const g = new THREE.Group();
  for (const [x, y, r] of [[0, 0, 1], [1.1, -0.2, 0.75], [-1.1, -0.25, 0.7], [0.5, 0.45, 0.7], [-0.45, 0.35, 0.65]])
    put(g, mesh(G.sph(r * s, 16, 12), 0xfbfaf4, 0.03), x * s, y * s, 0);
  return g;
}
/** televisor: tipo 'antiga' (madeira) | 'tubo' | 'plana'. tela = material */
export function tv(tipo = 'tubo', telaMat) {
  const g = new THREE.Group();
  let tela;
  if (tipo === 'plana') {
    put(g, mesh(G.box(2.2, 1.3, 0.08), 0x202020, 0.02), 0, 1.3, 0);
    tela = put(g, new THREE.Mesh(G.plane(2.05, 1.15), telaMat), 0, 1.3, 0.045);
    put(g, mesh(G.box(0.5, 0.05, 0.3), 0x202020, 0.01), 0, 0.62, 0);
    put(g, mesh(G.box(0.08, 0.1, 0.05), 0x202020, 0.01), 0, 0.67, 0);
  } else {
    const cor = tipo === 'antiga' ? COR.madeira : 0x4a4a4c;
    put(g, mesh(G.box(1.5, 1.15, 1.1), cor, 0.025), 0, 1.0, 0);
    put(g, mesh(G.box(1.2, 0.9, 0.05), 0x262626, 0.015), -0.08, 1.02, 0.55);
    tela = put(g, new THREE.Mesh(G.plane(1.08, 0.8), telaMat), -0.08, 1.02, 0.58);
    for (const yy of [1.2, 0.95]) put(g, mesh(G.cyl(0.05, 0.05, 0.05, 10), 0x1a1a1a, 0.008), 0.6, yy, 0.56).rotation.x = Math.PI / 2;
    if (tipo === 'antiga') {
      for (const s of [-1, 1]) put(g, mesh(G.cyl(0.03, 0.03, 0.45, 6), COR.madeiraEsc, 0.01), s * 0.55, 0.22, 0.3);
      for (const s of [-1, 1]) { const a = put(g, mesh(G.cyl(0.01, 0.01, 0.7, 4), COR.preto, 0), s * 0.15, 1.85, 0); a.rotation.z = s * 0.5; }
    }
  }
  g.userData.tela = tela;
  return g;
}

// ---------------- renderizador com pós-processamento de "desenho" ----------------
export class Render {
  constructor(canvas, w, h, ss = 1) {
    this.w = w; this.h = h; this.ss = ss;
    const r = this.r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(w, h, false);
    r.outputColorSpace = THREE.SRGBColorSpace;
    const W = Math.round(w * ss), H = Math.round(h * ss);
    this.rtC = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
    this.rtN = new THREE.WebGLRenderTarget(W, H);
    this.rtN.depthTexture = new THREE.DepthTexture(W, H);
    this.normMat = new THREE.MeshNormalMaterial();
    this.fx = { tint: new THREE.Color(1, 1, 1), tintAmt: 0, glitch: 0, escuro: 0, vinheta: 0.35, linha: 1.4 * ss, flash: 0 };
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: {
        tC: { value: this.rtC.texture }, tN: { value: this.rtN.texture }, tD: { value: this.rtN.depthTexture },
        res: { value: new THREE.Vector2(W, H) }, near: { value: 0.1 }, far: { value: 500 }, lw: { value: 1.4 },
        tint: { value: new THREE.Color() }, tintAmt: { value: 0 }, glitch: { value: 0 }, time: { value: 0 },
        escuro: { value: 0 }, vinheta: { value: 0.35 }, flash: { value: 0 },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        uniform sampler2D tC, tN, tD; uniform vec2 res; uniform float near, far, lw, tintAmt, glitch, time, escuro, vinheta, flash;
        uniform vec3 tint; varying vec2 vUv;
        float ld(vec2 uv){ float z = texture2D(tD, uv).x * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
          vec2 uv = vUv;
          if (glitch > 0.0) {
            float band = floor(uv.y * 38.0 + floor(time * 12.0) * 7.0);
            uv.x += (h(vec2(band, floor(time * 12.0))) - 0.5) * 0.12 * glitch * step(0.55, h(vec2(band * 1.3, 2.0)));
          }
          vec2 px = lw / res;
          float d = ld(uv); vec3 n = texture2D(tN, uv).xyz; float e = 0.0;
          vec2 o[8]; o[0]=vec2(1,0); o[1]=vec2(-1,0); o[2]=vec2(0,1); o[3]=vec2(0,-1);
          o[4]=vec2(.7,.7); o[5]=vec2(-.7,.7); o[6]=vec2(.7,-.7); o[7]=vec2(-.7,-.7);
          for (int i = 0; i < 8; i++) {
            vec2 q = uv + o[i] * px;
            float dd = abs(ld(q) - d) / max(d, 0.001);
            float nn = distance(texture2D(tN, q).xyz, n);
            e = max(e, smoothstep(0.025, 0.07, dd));
            e = max(e, smoothstep(0.35, 0.6, nn));
          }
          vec3 c;
          if (glitch > 0.0) { float s = 0.012 * glitch; c = vec3(texture2D(tC, uv + vec2(s, 0)).r, texture2D(tC, uv).g, texture2D(tC, uv - vec2(s, 0)).b); }
          else c = texture2D(tC, uv).rgb;
          c = mix(c, vec3(0.08, 0.07, 0.07), e * 0.92);
          c = mix(c, c * tint * 1.25, tintAmt);
          if (glitch > 0.0) c *= 0.85 + 0.15 * sin(uv.y * res.y * 1.2);
          c += (h(uv * res + fract(time)) - 0.5) * 0.035;
          vec2 v = vUv - 0.5; c *= 1.0 - vinheta * dot(v, v) * 1.6;
          c = mix(c, vec3(0.0), escuro); c = mix(c, vec3(1.0), flash);
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
      depthTest: false, depthWrite: false,
    }));
    this.quad.frustumCulled = false;
    this.qScene = new THREE.Scene(); this.qScene.add(this.quad);
    this.qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  /** renderiza uma cena num render target (para telas de TV) */
  toTarget(rt, scene, cam) { const r = this.r; r.setRenderTarget(rt); r.render(scene, cam); r.setRenderTarget(null); }
  draw(scene, cam, t) {
    const r = this.r;
    r.setRenderTarget(this.rtC); r.render(scene, cam);
    // passe de normais/profundidade (contornos ficam de fora)
    const hidden = [];
    scene.traverse((o) => { if ((o.userData.isOutline || o.userData.semNormal) && o.visible) { o.visible = false; hidden.push(o); } });
    const bg = scene.background; scene.background = null; scene.overrideMaterial = this.normMat;
    r.setRenderTarget(this.rtN); r.setClearColor(0x000000, 1); r.clear(); r.render(scene, cam);
    scene.overrideMaterial = null; scene.background = bg; hidden.forEach((o) => o.visible = true);
    const u = this.quad.material.uniforms, f = this.fx;
    u.near.value = cam.near; u.far.value = cam.far; u.lw.value = f.linha; u.tint.value.copy(f.tint); u.tintAmt.value = f.tintAmt;
    u.glitch.value = f.glitch; u.time.value = t; u.escuro.value = f.escuro; u.vinheta.value = f.vinheta; u.flash.value = f.flash;
    r.setRenderTarget(null); r.render(this.qScene, this.qCam);
  }
}

/** cena básica com luzes de desenho */
export function novaCena(fundo = COR.azulCeu) {
  const s = new THREE.Scene();
  s.background = (typeof fundo === 'number') ? new THREE.Color(fundo) : fundo;
  const hemi = new THREE.AmbientLight(0xffffff, 1.15); s.add(hemi);
  const sol = new THREE.DirectionalLight(0xffffff, 1.9); sol.position.set(4, 10, 7); s.add(sol);
  s.userData.hemi = hemi; s.userData.sol = sol;
  return s;
}
export function novaCamera(fov = 40, aspect = 1080 / 1920) {
  return new THREE.PerspectiveCamera(fov, aspect, 0.1, 500);
}
