// Cláudio — personagem low poly (baseado na referência do usuário)
import * as THREE from 'three';

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .85, ...o });
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}

export const CLAUDIO_COLORS = {
  skin: 0xeebd9a, hair: 0x2e211b, fade: 0x8d6b57, beard: 0x3a2b23, shirt: 0x1b1b1e,
  jeans: 0x6b8fb8, shoe: 0x1a1a1d, sole: 0x55565e, cheek: 0xf09a9a,
};

export function buildClaudio({ shirt, skin, hair, jeans, beard = true, longHair = false } = {}) {
  const C = { ...CLAUDIO_COLORS }; if (shirt) C.shirt = shirt; if (skin) C.skin = skin; if (hair) { C.hair = hair; C.beard = hair; } if (jeans) C.jeans = jeans;
  const mSkin = M(C.skin), mHair = M(C.hair), mFade = M(C.fade), mBeard = M(C.beard), mShirt = M(C.shirt),
    mJeans = M(C.jeans), mShoe = M(C.shoe), mSole = M(C.sole), mCheek = M(C.cheek), mBlack = M(0x111111);

  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body); // body: permite agachar/sentar

  // ---- pernas (quadril -> joelho)
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(sx * .42, 2.5, 0); body.add(hip);
    hip.add(box(.74, 1.25, .8, mJeans, 0, -.6, 0));
    const knee = new THREE.Group(); knee.position.set(0, -1.2, 0); hip.add(knee);
    knee.add(box(.7, 1.05, .76, mJeans, 0, -.52, 0));
    knee.add(box(.76, .36, 1.08, mShoe, 0, -1.1, .14));
    knee.add(box(.8, .1, 1.12, mSole, 0, -1.3, .14));
    legs.push({ hip, knee });
  }

  // ---- tronco
  const torso = new THREE.Group(); torso.position.y = 2.5; body.add(torso);
  torso.add(box(1.72, 2.0, .92, mShirt, 0, 1.0, 0));
  torso.add(box(1.5, .16, .8, M(0x141416), 0, 2.02, 0));
  torso.add(box(.44, .34, .44, mSkin, 0, 2.15, 0)); // pescoço

  // ---- braços (ombro -> cotovelo)
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 1.0, 1.82, 0); torso.add(sh);
    sh.add(box(.56, .72, .7, mShirt, sx * .06, -.25, 0));
    sh.add(box(.4, .5, .42, mSkin, sx * .06, -.82, 0));
    const el = new THREE.Group(); el.position.set(sx * .06, -1.05, 0); sh.add(el);
    el.add(box(.36, .9, .38, mSkin, 0, -.42, 0));
    const hand = box(.32, .42, .24, mSkin, 0, -1.04, .02); el.add(hand);
    sh.rotation.z = sx * .1;
    arms.push({ sh, el, hand });
  }

  // ---- cabeça
  const head = new THREE.Group(); head.position.y = 2.3; head.scale.setScalar(1.12); torso.add(head);
  const H = new THREE.Group(); H.position.y = .62; head.add(H); // centro da cabeça
  H.add(box(1.16, 1.24, 1.1, mSkin));
  // orelhas
  for (const sx of [-1, 1]) H.add(box(.12, .3, .22, mSkin, sx * .62, .02, -.05));
  // degradê lateral e nuca
  for (const sx of [-1, 1]) H.add(box(.04, .42, .9, mFade, sx * .59, .32, -.08));
  H.add(box(1.1, .5, .04, mFade, 0, .28, -.56));
  // cabelo (topete)
  H.add(box(1.26, .42, 1.2, mHair, 0, .74, -.02));
  const q1 = box(.9, .32, .55, mHair, -.12, .92, .28); q1.rotation.z = .08; H.add(q1);
  const q2 = box(.55, .26, .45, mHair, .25, .9, .38); q2.rotation.z = -.12; H.add(q2);
  H.add(box(1.22, .26, .2, mHair, 0, .56, .5));
  if (longHair) { H.add(box(1.3, 1.5, .35, mHair, 0, -.15, -.5)); for (const sx of [-1, 1]) H.add(box(.18, 1.3, .9, mHair, sx * .64, -.1, -.1)); }
  // barba
  const beardStart = H.children.length;
  H.add(box(1.18, .28, .62, mBeard, 0, -.5, .26));
  for (const sx of [-1, 1]) H.add(box(.08, .5, .42, mBeard, sx * .57, -.24, .24));
  H.add(box(.62, .1, .06, mBeard, 0, -.24, .56)); // bigode
  H.add(box(.3, .26, .06, mBeard, 0, -.52, .57)); // cavanhaque
  if (!beard) H.children.slice(beardStart).forEach(m => m.visible = false);
  const mouth = box(.32, .05, .03, M(0x6b2f25), 0, -.33, .575); H.add(mouth);
  // nariz
  H.add(box(.16, .3, .14, M(0xe3ad8a), 0, -.02, .6));
  // olhos e sobrancelhas
  const eyes = [], brows = [];
  for (const sx of [-1, 1]) {
    const e = box(.14, .16, .04, mBlack, sx * .24, .1, .56); H.add(e); eyes.push(e);
    const b = box(.36, .12, .06, mHair, sx * .25, .3, .56); b.rotation.z = sx * .15; H.add(b); brows.push(b);
    H.add(box(.18, .08, .02, mCheek, sx * .34, -.12, .555));
  }

  // ---- poses
  const st = { legs, arms, torso, head, body };
  function reset() {
    body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
    legs.forEach(l => { l.hip.rotation.set(0, 0, 0); l.knee.rotation.set(0, 0, 0); });
    arms.forEach((a, i) => { a.sh.rotation.set(0, 0, i ? .1 : -.1); a.el.rotation.set(0, 0, 0); });
    eyes.forEach(e => e.scale.y = 1); brows.forEach((b, i) => { b.rotation.z = (i ? 1 : -1) * .15; b.position.y = .3; });
    mouth.scale.set(1, 1, 1);
  }
  const api = {
    root, head, torso, H, body, legs, arms, eyes, brows, mouth, reset,
    // expressões
    blink(v) { eyes.forEach(e => e.scale.y = Math.max(.12, 1 - v)); },
    sad() { brows.forEach((b, i) => { b.rotation.z = (i ? 1 : -1) * .25; }); mouth.scale.x = .7; },
    angry() { brows.forEach((b, i) => { b.rotation.z = (i ? -1 : 1) * .3; b.position.y = .26; }); },
    happy() { mouth.scale.set(1.3, 2.2, 1); brows.forEach(b => b.position.y = .34); },
    // poses
    walk(t, amp = .6) {
      const s = Math.sin(t);
      legs[0].hip.rotation.x = s * amp; legs[1].hip.rotation.x = -s * amp;
      legs[0].knee.rotation.x = Math.max(0, -s) * amp; legs[1].knee.rotation.x = Math.max(0, s) * amp;
      arms[0].sh.rotation.x = -s * amp * .8; arms[1].sh.rotation.x = s * amp * .8;
      body.position.y = Math.abs(Math.cos(t)) * .08;
    },
    run(t) {
      api.walk(t, 1.0); arms.forEach(a => a.el.rotation.x = -1.2); torso.rotation.x = .15;
      body.position.y = Math.abs(Math.cos(t)) * .25;
    },
    sit() { // sentado numa cadeira (assento em y≈1.75)
      body.position.y = -.75;
      legs.forEach(l => { l.hip.rotation.x = -PI2; l.knee.rotation.x = PI2; });
    },
    lie() { // deitado de barriga para cima (use root.rotation)
    },
  };
  const PI2 = Math.PI / 2;
  reset();
  return api;
}
