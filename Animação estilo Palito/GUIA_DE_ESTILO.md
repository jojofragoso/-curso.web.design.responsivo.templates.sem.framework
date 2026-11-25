# Guia de Estilo: Animação estilo Palito

Este guia foi tirado da análise quadro a quadro do vídeo de referência (1min38s, vertical 1080x1920, 24 fps). Use-o como regra fixa para todos os vídeos do TikTok e do YouTube. Assim cada história nova sai com a mesma cara.

---

## 1. Como esse vídeo é feito (o que descobri)

O vídeo **não é animação desenhada à mão nem 3D**. É o fluxo usado pelos canais de "história explicada":

1. **Roteiro curto e direto**, narrado sem parar.
2. **Uma imagem por frase**, gerada por IA de imagem, sempre com o mesmo estilo de cartum.
3. **Cada imagem vira um clipe de 3 a 10 s** em uma IA de imagem-para-vídeo. É por isso que o personagem se vira, mexe as mãos, o avião solta fumaça e a câmera se aproxima.
4. **Narração com voz de IA** (só voz, **sem música de fundo**, sem pausas longas).
5. **Legendas de 1 a 3 palavras** aparecendo junto com a fala, no centro-baixo da tela.

Ritmo medido: cerca de **25 cenas em 98 s**, ou seja, **troca de cena a cada 3 a 5 s** (mínimo ~1 s, máximo ~9 s).

> Observação: o arquivo `three.module.min.js` (Three.js) que você mandou é uma biblioteca 3D para navegador. Ela **não** consegue produzir esse visual de ilustração. Para este estilo, o caminho é IA de imagem + IA de vídeo + a ferramenta de montagem desta pasta.

---

## 2. Regras visuais (não mudar)

### Personagens: o "palito"
- **Cabeça grande e redonda, branca**, contorno preto grosso. É uma bola branca, sem pele colorida.
- **Olhos**: dois pontos pretos pequenos. **Sobrancelhas** grossas e expressivas (é nelas que fica a emoção).
- **Boca** pequena e simples. Nariz quase ausente (um traço curto, às vezes).
- **Cabelo e bigode**: formas pretas sólidas, grandes, que identificam o personagem.
- **Tronco**: só a roupa (camisa, paletó, farda) em forma de saco/retângulo arredondado, com cor chapada e estampa simples (ex.: listras).
- **Braços**: **linhas pretas finas (palitos)** que saem da manga, com **mãos pretas** em forma de luva/mitene.
- **Pernas**: **muito longas e finas**, na cor da calça, terminando em sapatos pretos pequenos.
- Proporção: cabeça ≈ 1/4 da altura; pernas ≈ metade da altura.
- Cada personagem tem **uma roupa fixa** que nunca muda durante o vídeo (identidade visual).

### Cenários
- Ilustração **detalhada**, estilo quadrinho/graphic novel: contorno preto em tudo, cores **chapadas e meio dessaturadas** (terrosos, verdes-oliva, azuis suaves), sombreamento leve.
- O contraste é proposital: **personagem simples × cenário rico**.
- Iluminação conta a emoção: pôr do sol laranja (apresentação), noite azul (perigo), fumaça cinza (violência), luz amarela quente (luxo).

### Enquadramentos que se repetem
| Tipo | Uso no vídeo |
|---|---|
| Plano geral de costas, olhando a cidade/paisagem | Abertura e fechamento (o mesmo plano volta no fim) |
| Plano médio em plongée (câmera de cima) | Personagem fazendo algo (contando dinheiro) |
| Plano médio frontal, olhando para a câmera | Momento de "virar" para o público |
| Close extremo no rosto | Clímax / tensão (ex.: no telefone) |
| Cena sem personagem (objeto/paisagem) | Dados e fatos (avião, dinheiro com rato, rua destruída) |
| Plano sobre o ombro de outro personagem | Diálogo / ameaça |

### Movimento (no gerador de vídeo)
- Movimentos **simples e lentos**: virar o corpo, gesticular, andar, piscar, fumaça subindo, câmera aproximando devagar.
- Câmera quase sempre **parada ou com zoom-in lento**. Nada de giro rápido.

---

## 3. Prompts prontos (copiar e trocar o que está entre colchetes)

Escreva os prompts **em inglês**: os geradores entendem melhor. Formato **9:16**.

### 3.1 Bloco de estilo (cole no FINAL de todo prompt de imagem)
```
2D cartoon illustration, graphic novel style, thick clean black outlines, flat muted colors with soft shading, detailed background. Character design: simple stick-figure style person with a big round plain white head, two small black dot eyes, thick expressive eyebrows, tiny mouth, solid black hair shapes, body is only the clothing shape, thin black stick arms with black mitten hands, very long thin legs, small black shoes. Vertical 9:16, no text, no letters, no watermark.
```

### 3.2 Ficha do personagem (crie UMA vez por personagem e reutilize igual)
```
Character sheet, front view, side view and back view of the same character: [Pablo-like man with black curly hair and thick black mustache, light blue polo shirt with thin white horizontal stripes, brown belt, beige trousers]. Plain light gray background. + BLOCO DE ESTILO
```
Guarde a melhor imagem e use-a como **imagem de referência de personagem** (Midjourney `--cref`, "character reference" no Flux/Leonardo, ou anexada no ChatGPT/Gemini). É isso que mantém o personagem igual em todas as cenas.

### 3.3 Prompt de cena
```
[ENQUADRAMENTO: wide shot from behind / medium shot from above / close-up of the face] of [PERSONAGEM descrito igual à ficha] [AÇÃO: standing on a balcony looking at the city / counting stacks of money on a wooden table], [CENÁRIO: hillside favela of a South American city at sunset, mountains behind], [CLIMA/LUZ: warm orange sunset light]. + BLOCO DE ESTILO
```

### 3.4 Prompt de movimento (imagem → vídeo)
```
The character slowly [turns around to face the camera / picks up a stack of money and looks at it / walks forward up the path], subtle natural movement, eyebrows move to show [worry / anger], slow gentle camera push-in, keep the cartoon art style exactly the same, no morphing, no new characters.
```
Duração: 5 s (ou 10 s para cenas longas). Uma ação por clipe.

**Ferramentas que funcionam para isso** (escolha uma e não troque no meio do canal):
- Imagem: Midjourney, ChatGPT (imagem), Gemini (Nano Banana), Flux, Leonardo.
- Vídeo: Kling, Hailuo (MiniMax), Veo, Runway, Pika.
- Voz: ElevenLabs (ou outra TTS com voz masculina grave em PT-BR).

---

## 4. Roteiro: a fórmula do vídeo de referência

1. **Gancho (0-5 s)**, sempre uma pergunta forte: *"Por que [X] era tão [perigoso/rico/temido] que até [autoridade] tinha medo de [ação]?"*
2. **"Pra começar…"**: o fato mais impressionante, com número (*"movimentava bilhões de dólares"*).
3. **Escalada**: 3 a 5 fatos, cada um mais chocante. Use números exatos ("com 107 pessoas a bordo").
4. **Virada**: *"Agora vem uma parte inacreditável…"*.
5. **Queda/desfecho**: *"Até que em [ano]…"*.
6. **Fechamento circular**: volta a mostrar o plano de abertura e encerra com uma frase de efeito sobre o personagem.

Regras de texto:
- Frases curtas, linguagem falada (*"pra"*, *"tava"*), sem palavras difíceis.
- Cerca de **2,5 a 3 palavras por segundo**: ~250 palavras para 1min30.
- **Uma frase = uma cena** (é assim que você monta o `roteiro.json`).

---

## 5. Áudio e legendas

- **Voz**: narrador masculino, tom de documentário, rápido e envolvente. Sem música (ou música bem baixa, se quiser se diferenciar).
- **Legendas** (a ferramenta já faz isto):
  - Fonte **Merriweather Bold** (serifada), branca, contorno escuro fino e sombra suave.
  - Tamanho ~68 px em 1080 de largura, centralizada, a ~74% da altura da tela.
  - **1 a 3 palavras por vez**, sem vírgula/ponto (só `?` e `!`).

---

## 6. Passo a passo para cada vídeo novo

1. Escreva o roteiro com a fórmula da seção 4 e divida-o em frases (uma por cena).
2. Para cada frase, gere a **imagem** (seção 3.3) usando a ficha do personagem como referência.
3. Anime cada imagem (seção 3.4) e salve como `cenas/01.mp4`, `cenas/02.mp4`…
   (Se uma cena não precisar de movimento, deixe só a imagem `.png`: a ferramenta aplica um zoom lento.)
4. Gere a narração **de cada frase separada** (`audio/01.mp3`, `audio/02.mp3`…). Assim cada cena fica do tamanho exato da fala.
5. Copie `ferramenta/roteiro_exemplo.json`, preencha e rode:
   ```
   python3 ferramenta/montar_video.py roteiro.json video_final.mp4
   ```
   Requisitos: `ffmpeg` instalado e `pip install pillow`.
6. Resultado: MP4 vertical 1080x1920 pronto para TikTok, Reels e Shorts.

Para o **YouTube horizontal** (vídeos longos), use o mesmo estilo e gere as imagens em 16:9. A ferramenta atual é para vertical. Se for preciso, dá para adaptá-la a 1920x1080.

---

## 7. Cuidados

- Pessoas reais retratadas em cartum (história, true crime) são o padrão desse nicho. Confira os fatos e evite afirmar coisas não comprovadas.
- Crie **seus próprios personagens fixos** (ex.: um narrador-mascote recorrente) para o canal ter identidade própria e não parecer cópia de outro canal.
- Não reutilize trechos do vídeo de referência nos seus vídeos. Use-o só como padrão de estilo.
