# Como pedir um vídeo novo

Abra uma sessão neste repositório e mande uma destas três coisas:

1. **Um MP3 da ElevenLabs.** Eu transcrevo, divido em cenas e animo nesse estilo.
2. **Um vídeo com outra animação.** Eu aproveito só o áudio e refaço toda a parte visual nesse estilo.
3. **Um tema ou roteiro em texto.** Eu escrevo o roteiro na fórmula do canal. A narração você gera na ElevenLabs ou me pede.

O resultado é um MP4 vertical 1080x1920 com legenda em Cal Sans, pronto para TikTok, Reels e Shorts.

## O que acontece por trás

1. `transcrever.py` gera o texto e o tempo de cada palavra.
2. A decupagem divide a fala em cenas de 2 a 6 s, cada uma ilustrando literalmente o que é dito. Os tipos de cena seguem `GUIA_DE_ESTILO.md`.
3. Primeiro vem a ficha do personagem principal. Depois, uma imagem por cena, sempre com as imagens de `referencias/` como referência de estilo.
4. Cada imagem vira um clipe animado de 5 s.
5. `montar_video.py` junta tudo: cortes, narração e legendas sincronizadas.

As etapas 3 e 4 usam IA de imagem e de vídeo e **gastam créditos** da ferramenta conectada (ElevenLabs ou Picsart). Você também pode gerar as imagens e os clipes por conta própria, com os prompts do guia, e me mandar só para montar.

## Rodar a montagem você mesmo

```
pip install openai-whisper            # uma vez
python3 ferramenta/transcrever.py narracao.mp3 palavras.json
# preencha um roteiro.json (modelo: ferramenta/roteiro_exemplo.json)
python3 ferramenta/montar_video.py roteiro.json video_final.mp4
```
Também precisa do `ffmpeg` instalado.
