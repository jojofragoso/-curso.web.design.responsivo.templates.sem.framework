# Motor 3D Palito (sem créditos)

Este motor anima personagens palito em 3D com cara de desenho. A animação é feita por código (Three.js) e renderizada no Chromium headless, então não gasta créditos de IA.

## Arquivos
- `palito.js`: a biblioteca.
  - `Palito`: o personagem, com poses `idle`, `walk`, `sit`, `kneel`, `setArm`, `setLeg`, `look` e expressões `setFace` e `talk`.
  - Cenários prontos: `cacto`, `casaBarro`, `coqueiro`, `arvore`, `nuvem`, `tv` e outros.
  - Texturas desenhadas e caminho de câmera (`camPath`).
  - `Render`: o visual de desenho. Usa sombreamento toon, contorno preto, linhas por detecção de bordas, filtro de cor, glitch, vinheta e flash.
- `render.html` e `render.mjs`: renderizam um projeto em MP4 sem áudio.

## Projeto
Cada vídeo fica em `projetos/<nome>/cenas.js`, que exporta `FPS`, `DURACAO` e `CENAS`. `CENAS` é uma lista de `{ ini, fim, build() }`, e cada `build` devolve `{ scene, cam, update(lt, u, t) }`. Exemplo completo: `projetos/01-nordeste-novela/cenas.js`.

## Comandos
```
# quadros de teste (PNG)
node motor3d/render.mjs projetos/MEU-PROJETO --quadros 1.5,10,20 --saida /tmp/quadros
# vídeo sem áudio
node motor3d/render.mjs projetos/MEU-PROJETO projetos/MEU-PROJETO/video_mudo.mp4
# narração + legenda Cal Sans
python3 ferramenta/montar_video.py projetos/MEU-PROJETO/roteiro.json projetos/MEU-PROJETO/video_final.mp4
```
A renderização faz uns 3 quadros por segundo, então um vídeo de 70 s leva cerca de 10 minutos.
