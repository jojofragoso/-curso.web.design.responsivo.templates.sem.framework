# Guia de estilo: ilustração plana animada (vertical 9:16)

Este guia saiu da análise quadro a quadro do vídeo de referência do usuário: um short de 67,5 s sobre o Coliseu, 1080×1920, 30 fps.

Ele descreve uma **linguagem visual**:
- paleta;
- formas;
- câmera;
- ritmo;
- tipografia.

Use esta linguagem em conteúdos **novos e originais**. Não copie desenhos, personagens ou vídeos de outro canal.

---

## 1. Visão geral (o que dá a "cara")

- **Arte:** ilustração vetorial **plana**.
  - Formas simples e arredondadas, **sem contorno preto**.
  - Volume feito com **uma sombra lateral chapada** (o mesmo tom, cerca de 15% mais escuro) do lado direito de rostos, braços e objetos.
- **Paleta quente e terrosa:** areia, ocre, terracota, vinho, azul-petróleo do mar e dourado nos destaques. Nada saturado ou neon.
- **Textura:**
  - Grão de papel/filme muito leve sobre tudo.
  - Vinheta suave nas bordas.
  - Fundo levemente desfocado quando há personagem em primeiro plano (profundidade).
- **Movimento constante e calmo:** a câmera **nunca** fica parada. Ela sempre faz uma destas coisas, de forma lenta e contínua:
  - zoom in;
  - zoom out;
  - pan;
  - descida.
- **Cortes:** quase não existem cortes secos. Na referência, a detecção de cena achou só 3 cortes em 67 s. As trocas são:
  - **dissolve** (fusão) de cerca de 0,4–0,6 s;
  - **pan lateral** que "empurra" a cena seguinte;
  - **revelação por movimento** de câmera.
- **Uma ideia por plano:** cada frase da narração ganha uma imagem que a ilustra literalmente.
  - "Pegue cavalos e touros" → cavalos e touros nadando.
  - "100 dias de jogos" → contador 0→100.
  - "Ninguém sabe" → grande "?".

## 2. Paleta (hex medidos nos quadros, k-means)

| Uso | Cor |
|---|---|
| Areia (fundo base) | `#cfb88f` · clara `#f0e1c4` · escura `#baa47e` / `#9e8462` |
| Ocre / arena | `#bd8641` · claro `#e0a86c` |
| Terracota / madeira | `#8c5227` · escura `#672814` · quase-preto quente `#301c0f` |
| Mar | `#1b5770` · profundo `#0d3f56` · claro `#417481` · espuma `#e9f2f0` |
| Vinho (faixas, toldos, faixa da toga) | `#6d3237` |
| Dourado (destaque de legenda/títulos) | `#e2a955` (medido: 222,168,91) |
| Branco quente (toga, textos) | `#fbf6ec` / `#f4ead6` |
| Peles (5 tons) | `#f0c08e` `#e2a877` `#c98a5a` `#9a6440` `#6e4529` |

- **Regra:** o fundo é sempre um tom quente. O azul aparece praticamente só no mar e no céu.
- **Sombras:** nunca use preto puro. Use `#301c0f` ou o tom da própria cor escurecido.

## 3. Personagens

- **Proporção:**
  - Cabeça grande, um retângulo bem arredondado, mais alto que largo.
  - Pescoço curto.
  - Tronco simples (toga ou túnica).
  - Normalmente enquadrados do **peito para cima**, em close.
- **Rosto:**
  - **Olhos de ponto** preto com um brilhinho branco.
  - Sobrancelhas finas e retas.
  - **Nariz triangular** feito só de sombra.
  - Boca: um traço pequeno (neutra), uma elipse escura (falando ou espantado) ou uma curva (sorriso).
  - Orelhas como semicírculos com sombra.
  - Sem bochechas rosadas, sem contorno.
- **Sombra:** a metade direita do rosto e da orelha fica de 10 a 15% mais escura.
- **Acessórios que identificam:**
  - coroa de louros;
  - elmo dourado com crista vermelha;
  - faixa vinho na toga;
  - barba cheia escura.
- **Animação dos personagens:** pouca e expressiva.
  - **Piscar** a cada 2–4 s, em 3 quadros.
  - **Boca abrindo e fechando** enquanto a narração fala dele.
  - **Um gesto marcante** por plano: erguer o braço, apontar, comemorar.
  - **Leve respiração** (sobe e desce 1–2 px).
  - A multidão "torce" em ondas: os bonecos pulam em seno.
- **Multidões:** fileiras de cabecinhas redondas e corpos-retângulo coloridos (vermelho, azul, verde, dourado, vinho, creme). Em close, a multidão vira **fundo desfocado**.

## 4. Cenários típicos

São camadas horizontais empilhadas:
1. Céu com nuvens fofas.
2. Arquibancada com multidão.
3. Muro com faixa decorativa.
4. Areia, ou água com ondas em camadas e traços de espuma.

Também aparecem:
- **Vista aérea circular:** anéis concêntricos, como a arena vista de cima.
- **Subterrâneo:** arcos escuros, tochas, engrenagens, jaulas. O tom fica mais quente e escuro.

## 5. Câmera e transições (gramática)

- Todo plano tem um movimento de câmera de **2 a 6 s**, com easing suave (ease-in-out):
  - zoom 1.00→1.08;
  - pan de 40–120 px;
  - ou descida, como em "a câmera desce até o subsolo".
- **Planos longos (> 6 s):** troque o enquadramento dentro da mesma cena com um movimento contínuo, sem cortar.
- **Transições:**
  - **Dissolve** (padrão, 0,45 s).
  - **Pan lateral** quando a narração muda de lugar ou personagem.
  - **Movimento vertical** quando mostra "embaixo" ou "em cima".
- **Elementos entram com "pop":** escala 0→1 com leve overshoot (ícones, "?", contadores) ou deslizando de baixo com fade.

## 6. Tipografia e HUD

- **Legenda (a única mudança pedida pelo usuário):** fonte **Cal Sans** no lugar da condensada da referência. Todo o resto do comportamento é mantido:
  - **MAIÚSCULAS**, de **1 a 3 palavras** por vez, sincronizadas com a fala no estilo karaokê (troca a cada grupo de palavras).
  - Branco quente `#fbf6ec`, com **uma palavra-chave em dourado** `#e2a955`.
  - Contorno marrom-escuro fino e sombra projetada para baixo.
  - Centralizada horizontalmente, **centro em y ≈ 1190 px** (62% da altura). Fica sobre a imagem, nunca numa caixa.
  - Tamanho de 80–88 px.
  - Entra com um leve "pop": escala 0,88→1 em 0,15 s.
- **Título de abertura**, no topo (y ≈ 180–300), em 2 linhas: a linha 1 em branco e a linha 2 em dourado, maior. Exemplo: "O COLISEU / VIROU MAR".
- **Indicador de capítulo/progresso:** "PARTE 1 DE 4" mais 4 círculos.
  - Círculo ativo: fundo escuro, borda dourada e ícone.
  - Círculos inativos: escuros e semitransparentes.
  - Aparece no topo durante toda a primeira metade, com o número avançando.
- **Rótulo de lugar/tempo:** "ROMA, ANO 80" no topo, com um sublinhado dourado que cresce da esquerda para a direita. Pode ter uma linha pequena de subtítulo em caixa alta espaçada ("OS ARQUEÓLOGOS AINDA DISCUTEM").
- **Contador animado:** um número grande subindo, com um rótulo embaixo ("100 / DIAS DE JOGOS").
- **Ícone grande "?"** dourado com contorno, flutuando, para mistério ou dúvida.
- **Cartão final:** "VÍDEO COMPLETO / NO CANAL" sobre um fundo escurecido, com uma miniatura. É opcional e serve como chamada para o canal do usuário (Fato Resumido).

## 7. Ritmo

- **Legendas:** um grupo novo a cada 0,4–1,0 s, acompanhando a fala.
- **Plano visual:** troca a cada 2–5 s (mais rápido que a legenda não, mais lento sim).
- **Gancho:** os primeiros 2 s já mostram a imagem mais curiosa da história, com o título.
- **Final:** fecha com plano aberto e fade, ou com o cartão "vídeo completo".

## 8. Som

- O áudio da narração é sempre o **original** enviado pelo usuário.
- Por baixo vai uma trilha suave e documental, e efeitos discretos em cada evento:
  - whoosh nas transições;
  - pop quando um ícone aparece;
  - splash na água;
  - multidão;
  - tambor em momentos épicos;
  - tick no contador.
- Volume dos efeitos e da trilha: cerca de 35% do da narração.
