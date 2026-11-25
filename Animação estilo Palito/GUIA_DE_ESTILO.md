# Guia de Estilo: Animação estilo Palito

**Regra número 1: este estilo NÃO muda.** Todo vídeo novo (TikTok, Reels, Shorts ou YouTube) segue o vídeo de referência: o mesmo traço, o mesmo tipo de personagem, o mesmo ritmo e a mesma legenda. As imagens em `referencias/` são o padrão visual oficial. Antes de criar qualquer cena, compare com elas.

Referência analisada: vídeo vertical 1080x1920, 24 fps, 1min38s, narração em PT-BR, 20 cenas.

---

## 1. Como esse vídeo é feito

1. **Narração única** com voz de IA (ElevenLabs), rápida e contínua. **Sem música e sem efeitos sonoros.**
2. **Uma ilustração por trecho de fala**, gerada por IA de imagem, sempre no mesmo estilo de cartum.
3. Cada ilustração vira um **clipe animado** em IA de imagem-para-vídeo: o personagem se vira, gesticula, anda; a fumaça sobe; a câmera se aproxima devagar.
4. **Legenda de 1 a 3 palavras** sincronizada palavra por palavra (agora em **Cal Sans**).

---

## 2. Regras visuais (obrigatórias)

### Personagem "palito"
- **Cabeça grande, redonda e BRANCA** (sem cor de pele), com contorno preto grosso.
- **Olhos**: dois pontinhos pretos. **Sobrancelhas** pretas grossas que mostram a emoção. **Boca** pequena. Nariz, se tiver, é um traço curto.
- **Cabelo, bigode e barba**: formas pretas sólidas e grandes, que identificam quem é o personagem.
- **Tronco**: só a roupa (camisa, paletó, farda), em forma arredondada, com cor chapada e estampa simples.
- **Braços**: **palitos pretos finos** saindo da manga, com **mãos pretas** em forma de luva.
- **Pernas**: **muito compridas e finas**, na cor da calça, com sapatinhos pretos.
- Proporção: a cabeça ocupa ≈ 1/4 da altura e as pernas ≈ metade.
- **Roupa fixa** por personagem durante o vídeo inteiro.
- Mulheres seguem a mesma regra: cabeça branca, cabelo como forma sólida (castanho/preto), roupa chapada.

### Cenários
- Ilustração **detalhada** estilo graphic novel, contorno preto em tudo, cores **chapadas e meio dessaturadas** (terra, tijolo, verde-oliva, azul suave), sombreamento leve.
- **Personagem simples × cenário rico**: esse contraste é a marca do estilo.
- A luz conta a emoção: pôr do sol laranja (abertura), noite azul (perigo), fumaça cinza (violência), luz amarela de madeira (luxo), céu azul limpo (fatos).

### Os 20 tipos de cena da referência (ver `referencias/`)
| # | Arquivo | Enquadramento | Para que serve |
|---|---|---|---|
| 1 | 01-costas-olhando-cidade | Plano geral, personagem de costas olhando a cidade | Abertura (gancho) |
| 2 | 02-virando-para-camera | O personagem se vira para a câmera (zoom-in) | Final do gancho |
| 3 | 03-contando-dinheiro-plongee | Câmera de cima, personagem fazendo algo | "Pra começar…" |
| 4 | 04-objeto-sem-personagem | Close de objeto (dinheiro + rato) | Detalhe curioso |
| 5 | 05-dialogo-dois-personagens | Dois personagens na rua, conversando | Contraste/contradição |
| 6 | 06-personagem-secundario-noite | Capanga sério, rua à noite | Ameaça |
| 7 | 07-sobre-o-ombro-escritorio | Sobre o ombro; vítima atrás da mesa | Regra/ameaça direta |
| 8 | 08-cenario-destruido | Rua destruída com fumaça, sem personagem | Violência em escala |
| 9-10 | 09/10-aviao | Objeto no céu azul (avião explodindo e caindo) | Evento histórico |
| 11 | 11-destrocos | Destroços, céu cinza | "Ninguém sobreviveu" |
| 12 | 12-andando-noite | De costas, subindo caminho à noite | "Agora vem…" (virada) |
| 13 | 13-poltrona-interior | Sentado em poltrona, interior de madeira | Luxo |
| 14 | 14-sinuca-interior | Jogando sinuca | Luxo/privilégio |
| 15 | 15-soldados-beco | Soldados armados avançando no beco | Cerco |
| 16 | 16-janela-preocupado | Olhando pela janela, preocupado | Tensão |
| 17 | 17-close-telefone | Close extremo do rosto no telefone | Clímax |
| 18 | 18-fuga-telhados | Correndo nos telhados (vista de cima) | Fuga |
| 19 | 19-caido-telhado | Caído no telhado | Desfecho |
| 20 | 20-costas-fechamento | A mesma cena de abertura | Fechamento circular |

Após o fechamento, a última frase reaproveita a cena 3 ("um criminoso…").

### Ritmo e movimento
- A cena troca a cada **2 a 6 s** (média ~4,5 s; momentos de ação têm cortes de ~1 s; fatos longos até ~9 s).
- **O corte acompanha a fala, não a frase.** A imagem mostra **literalmente** o que está sendo dito naquele momento ("apodrecendo" → rato no dinheiro; "avião" → avião).
- Movimento **simples e lento**: virar, gesticular, andar, piscar, fumaça; câmera **parada ou com zoom-in lento**. Nunca giros rápidos nem transições com efeito: **corte seco** sempre.

---

## 3. Prompts (em inglês; formato 9:16)

### 3.1 Bloco de estilo (vai no final de TODO prompt de imagem)
```
2D cartoon illustration in graphic novel style, thick clean black outlines, flat muted desaturated colors with soft shading, richly detailed background. Character design: simple cartoon person with a big round plain WHITE head (no skin color), two small black dot eyes, thick black expressive eyebrows, small simple mouth, hair and mustache as solid black shapes, the body is only the clothing shape, thin black stick arms with black mitten hands, very long thin legs in trouser color, small black shoes. Vertical 9:16 composition, no text, no letters, no captions, no watermark.
```
Sempre anexe 2 ou 3 imagens de `referencias/` como **referência de estilo**. Para o personagem principal, anexe também a ficha dele.

### 3.2 Ficha do personagem (uma vez por personagem)
```
Character turnaround sheet of the same character, front view, side view and back view, full body, plain light gray background: [DESCRIÇÃO: man with black curly hair and thick black mustache, light blue polo shirt with thin white horizontal stripes, brown belt, beige trousers]. + BLOCO DE ESTILO
```

### 3.3 Cena
```
[ENQUADRAMENTO da tabela acima] of [PERSONAGEM exatamente como na ficha] [AÇÃO], [CENÁRIO detalhado], [LUZ/CLIMA]. + BLOCO DE ESTILO
```

### 3.4 Movimento (imagem → vídeo, 5 s)
```
The character slowly [AÇÃO SIMPLES], subtle natural cartoon movement, eyebrows show [EMOÇÃO], static camera with a slow gentle push-in, keep the exact same 2D cartoon art style and outlines, no morphing, no extra characters, no text.
```

---

## 4. Fórmula do roteiro (para quando o roteiro for meu)

1. **Gancho**: *"Por que [X] era tão [perigoso/rico/temido] que até [autoridade] tinha medo de [ação]?"*
2. **"Pra começar…"**: o fato mais impressionante, com número.
3. **"E olha a contradição…"** / escalada com 3 a 5 fatos, cada vez mais fortes, com números exatos.
4. **"Agora vem uma das partes mais absurdas…"** (virada).
5. **"Só que…" / "Até que em [ano]…"** (queda).
6. **"Agora me diz…"**: pergunta final para gerar comentários, voltando à cena de abertura.

Frases curtas e faladas ("pra", "tava"); ~2,7 palavras por segundo (≈ 260 palavras para 1min35).

---

## 5. Legenda (padrão fixo)
- Fonte **Cal Sans**, branca, contorno escuro fino e sombra leve.
- Tamanho 88 (em 1080 de largura), centralizada, a ~74% da altura da tela.
- **1 a 3 palavras por vez**, trocando junto com a fala. Sem vírgula e sem ponto final (só `?` e `!`).
- Somem em pausas longas.

A ferramenta `ferramenta/montar_video.py` aplica tudo isso automaticamente.

---

## 6. Fluxo de produção
Veja `COMO_USAR.md`.
