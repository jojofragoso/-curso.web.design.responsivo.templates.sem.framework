export const FPS = 24, DURACAO = 4;
export const CENAS = [{
  ini: 0, fim: 4,
  build({ P }) {
    const scene = P.novaCena(0xdfe6ea);
    scene.add(P.chao(0xc9c2b0));
    const tipos = [
      { cabelo: 'curto' }, { chapeu: 'couro', barba: 0x3a2a1a, cabelo: 'curto' }, { cabelo: 'careca', barba: 0x444444 }, { chapeu: 'coronel', bigode: 'grande', cabelo: 'careca' },
      { cabelo: 'longo', corCabelo: 0x2b1b12 }, { cabelo: 'cacheado' }, { cabelo: 'liso', corCabelo: 0xe3c46a }, { cabelo: 'coque', corCabelo: 0x5a3a22, saia: 0x5d7fa3 },
    ];
    const ps = tipos.map((o, i) => { const p = new P.Palito({ camisa: 0x8db3d8, calca: 0x3d4f6b, ...o }); P.put(scene, p.root, (i % 4 - 1.5) * 1.1, 0, -Math.floor(i / 4) * 3.6, 0); return p; });
    const cam = P.novaCamera(30);
    return { scene, cam, update(lt, u, t) { cam.position.set(0, 3.4, 9); cam.lookAt(0, 2.2, -1.8); ps.forEach((p, i) => p.idle(t).setFace('neutra', i % 2 ? 'sorriso' : 'neutra').look(i % 2 ? 0.3 : -0.3)); } };
  },
}];
