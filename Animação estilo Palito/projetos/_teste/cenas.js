export const FPS = 24, DURACAO = 4;
export const CENAS = [{
  ini: 0, fim: 4,
  build({ P, THREE }) {
    const { COR } = P;
    const scene = P.novaCena(P.ceu([0xf2b468, 0xe9835a, 0x8a5a6e]));
    const chao = P.mesh(P.G.plane(60, 60), P.toon(0xffffff, { map: P.rep(P.texRachado(), 6) }), 0);
    chao.rotation.x = -Math.PI / 2; scene.add(chao);
    const a = new P.Palito({ camisa: COR.azulCamisa, listras: 0xeef3f8, calca: COR.bege, cabelo: 'cacheado', bigode: true });
    const b = new P.Palito({ camisa: 0xc9b48a, calca: 0x8a6d48, chapeu: 'couro', barba: 0x2a2018, cabelo: 'curto' });
    const c = new P.Palito({ camisa: 0xe7c46a, saia: 0x5d7fa3, cabelo: 'coque', corCabelo: 0x5a3a22 });
    P.put(scene, a.root, -1.6, 0, 0, 0.3); P.put(scene, b.root, 0, 0, -0.5); P.put(scene, c.root, 1.6, 0, 0, -0.3);
    P.put(scene, P.casaBarro(), 3, 0, -5, -0.4); P.put(scene, P.cacto(), -3.5, 0, -3); P.put(scene, P.cacto(0, true), 4.5, 0, -1);
    P.put(scene, P.nuvem(1.2), -3, 9, -15);
    const cam = P.novaCamera(42);
    return {
      scene, cam,
      update(lt, u) {
        P.camPath(cam, [[0, [0, 3, 10], [0, 2.3, 0]], [1, [1.5, 2.6, 7.5], [0, 2.3, 0]]], u);
        a.idle(lt).setFace('triste', 'triste').look(Math.sin(lt) * 0.3);
        b.walk(lt * 6).setFace('brava', null).talk(lt);
        c.idle(lt).setFace('surpresa', 'sorriso').setArm('R', 1.2, 0.5, 0.8);
      },
    };
  },
}];
