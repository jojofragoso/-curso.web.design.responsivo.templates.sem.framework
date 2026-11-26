---
name: fato-resumido-animacao
description: Cria vídeos animados para o canal Fato Resumido (TikTok/Shorts, vertical 1080x1920) no estilo de ilustração plana quente da referência do usuário — câmera sempre em movimento, dissolves, personagens de cabeça grande e olhos de ponto, títulos/HUD no topo e legenda karaokê em Cal Sans com palavra-chave dourada. Use SEMPRE que o usuário mandar um vídeo, áudio ou roteiro e pedir para "animar", "fazer nesse estilo", "fazer o vídeo", "repetir o estilo", ou criar qualquer novo vídeo do canal.
---

# Fato Resumido: animação no estilo ilustrado plano

Este é o padrão de **todos** os vídeos do canal daqui em diante. Não fuja dele, a menos que o usuário peça outro estilo explicitamente (por exemplo, "3D").

Antes de desenhar qualquer coisa, leia `references/estilo.md`. Ele traz:
- paleta;
- personagens;
- câmera;
- legendas;
- ritmo.

## Regras fixas

1. **Formato:**
   - Vertical 1080×1920, 30 fps, H.264 CRF 17.
   - Para YouTube horizontal, só se o usuário pedir. Aí use 1920×1080 com a mesma linguagem.
2. **Áudio:**
   - Sempre o áudio **original** que o usuário mandou. Nunca refaça a narração.
   - Por baixo: trilha suave mais efeitos sonoros, via `scripts/sfx.py`, com volume de cerca de 0,35.
3. **Legenda:**
   - Fonte **Cal Sans** (`assets/CalSans.ttf`).
   - MAIÚSCULAS, 1 a 3 palavras por vez, uma palavra-chave em dourado `#e2a955` (marcada com `*palavra*` no CAPS).
   - Centro em y≈1190. Sem caixa de fundo.
4. **Fidelidade:**
   - A animação mostra **exatamente** o que a narração diz, frase por frase. Cada frase ganha uma imagem literal (objeto, lugar, personagem, mapa, número).
   - Não invente fatos, falas ou textos que não estejam no áudio.
   - Títulos e rótulos do HUD resumem o que é dito.
5. **Movimento:**
   - Nenhum plano fica parado. Todo plano tem um movimento de câmera (zoom, pan ou descida) com easing.
   - Os personagens piscam, mexem a boca quando falam e fazem um gesto por plano.
6. **Transições:** dissolve de 0,45 s por padrão. Use pan lateral quando muda o lugar ou o personagem, e movimento vertical para "embaixo" e "em cima".
7. **Originalidade:**
   - Use a **linguagem visual** da referência, mas crie desenhos e cenas próprios para cada história.
   - Não reproduza quadros, personagens, logotipos ou vinhetas de outro canal.
   - Não use o nome "Ampulheta" nem o @ dele.
   - O cartão final, se houver, chama para o **Fato Resumido**.

## Fluxo de trabalho

Organize o trabalho numa pasta no scratchpad (ex.: `S/<projeto>/`). Copie para lá:
- `assets/engine.js`
- `assets/CalSans.ttf`
- `assets/template.html` (troque `SCENES_FILE` pelo arquivo de cenas)

Para os scripts, `node_modules` não é necessário: o Playwright já vem instalado no ambiente.

1. **Pegar a narração com tempos.**
   - Vídeo com legenda queimada: extraia quadros (`ffmpeg -vf fps=6`) e faça OCR com rapidocr (máscara de cor do texto), ou transcreva o áudio.
   - Áudio/vídeo sem legenda: `HF_HUB_DISABLE_XET=1 python3 scripts/transcrever.py entrada saida.json`. Usa faster-whisper medium e precisa de `huggingface.co` e `us.aws.cdn.hf.co` liberados na rede do ambiente.
   - Corrija à mão os nomes próprios que a transcrição errar.
2. **Gerar a legenda:** `python3 scripts/legendas.py transcricao.json caps.js`. Revise os destaques `*...*`: uma palavra-chave por grupo (nomes, números, o "susto" da frase).
3. **Roteiro visual:** antes de codar, liste cada frase com a imagem literal que vai aparecer, o movimento de câmera e a transição. Agrupe frases em planos de 2 a 5 s.
4. **Escrever o arquivo de cenas** (modelo em `assets/exemplo_cenas.js`). Ele define:
   - `window.TOTAL` (duração em segundos);
   - `window.CAPS`;
   - `window.SCENES = [{t0,t1,draw(L,t),cam(L,t),trans,xfade}]`;
   - `window.OVERLAY(t)` para título, capítulo, rótulo de lugar, contador e "?".

   O que usar do motor (`Engine.*`):
   - **Cenários:** `BG.sky`, `BG.sea`, `BG.sand`, `BG.crowd` (com `blur` e `cheer`), `BG.arches`, `BG.band`. Crie novos cenários no mesmo estilo quando a história pedir: prédios, mapas, interiores.
   - **Personagens:** `person({...})` para close de personagem (louros, elmo, barba, boca, piscar, braço) e `mini()` para figurantes.
   - **HUD:** `HUD.title`, `HUD.chapter`, `HUD.place`, `HUD.counter`, `HUD.question`, `HUD.endcard`.
   - **Utilitários:** `ease`, `eOut`, `pop`, `pg`, `rng` (determinístico; nunca use `Math.random`).
5. **Revisar quadros:** rode `node scripts/snap.js pagina.html pasta t1 t2 ...` e monte uma folha com `ffmpeg ... tile`. Confira:
   - a imagem bate com a fala?
   - a legenda está legível e não cobre rostos?
   - existe movimento?
   - as cores batem com a paleta?

   Corrija e repita.
6. **Renderizar:** `scripts/render_partes.sh pagina.html pasta_saida TOTAL_QUADROS`. É retomável: se a sessão reiniciar, rode de novo. Rode em segundo plano.
7. **Som e mixagem:**
   - Monte `deixas.json` com os eventos, por exemplo `[[t,"whoosh"],[t,"pop"],...]`: whoosh em cada transição e pop em cada ícone.
   - Rode `python3 scripts/sfx.py deixas.json sfx.wav DURACAO`.
   - Mixe com o comando que está no topo do `sfx.py`.
8. **Conferir e entregar:**
   - Gere uma folha de contato do MP4 final (`fps=1/5,tile`).
   - Confira o número de quadros com `ffprobe`.
   - Envie com SendUserFile.
   - Diga em poucas linhas o que foi feito, o que pode ser ajustado e que a pasta é temporária.
   - Se o usuário pedir, sugira título e hashtags.

## Checklist de estilo (cada plano)

- [ ] O fundo é quente (areia, ocre, terracota ou vinho). Azul só para mar e céu.
- [ ] As formas são chapadas, sem contorno preto, com sombra lateral do mesmo tom.
- [ ] A câmera se move com easing. Não há plano parado.
- [ ] Os personagens têm cabeça grande, olhos de ponto e nariz de sombra. Piscam e falam.
- [ ] A transição é dissolve ou pan. Corte seco só para impacto.
- [ ] A legenda é Cal Sans, em maiúsculas, com 1 a 3 palavras e um destaque dourado.
- [ ] Há grão leve e vinheta (o motor já aplica).
- [ ] A imagem ilustra literalmente a frase falada naquele momento.
