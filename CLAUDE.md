# Instruções para o Claude: canal "Animação estilo Palito"

Quando o usuário pedir um vídeo (mandando um MP3, um vídeo para reaproveitar o áudio, ou um tema/roteiro), siga **à risca** a pasta `Animação estilo Palito/`. O usuário exige que o estilo seja **idêntico** ao vídeo de referência. Em vídeos anteriores o estilo desviou, e isso não pode se repetir.

## Leia antes de começar
- `Animação estilo Palito/GUIA_DE_ESTILO.md`: regras visuais, os 20 tipos de cena, ritmo, prompts e legenda.
- `Animação estilo Palito/referencias/*.jpg`: quadros da referência. Olhe-as (Read) antes de gerar qualquer imagem e compare cada imagem gerada com elas.

## Pipeline
1. **Áudio**
   - Vídeo recebido: `ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 narracao.mp3`. Use só o áudio; nada do visual original.
   - MP3 recebido: use direto.
   - Tema/roteiro: escreva na fórmula da seção 4 do guia. Gerar a voz gasta créditos, então peça confirmação.
2. **Transcrição**: `pip install openai-whisper` (se faltar), depois `python3 "Animação estilo Palito/ferramenta/transcrever.py" narracao.mp3 palavras.json`. O modelo baixa de openaipublic.azureedge.net; a Hugging Face é bloqueada aqui.
3. **Decupagem**: divida a fala em cenas de 2 a 6 s, cortando onde a imagem precisa mudar (não onde a frase acaba). Cada cena ilustra **literalmente** o que é dito. Abra com o personagem de costas olhando o cenário, vire-o para a câmera no fim do gancho e feche voltando à cena de abertura. Mostre a decupagem (tempo → cena) ao usuário.
4. **Imagens**
   - Primeiro a ficha de cada personagem (seção 3.2), depois uma imagem por cena (seção 3.3).
   - Sempre com o BLOCO DE ESTILO e 2 ou 3 imagens de `referencias/` anexadas como referência de estilo, mais a ficha do personagem.
   - Rejeite e refaça qualquer imagem com cabeça colorida/realista, braços grossos, pernas curtas, 3D, anime, texto na imagem ou paleta saturada.
5. **Animação**: imagem → vídeo de 5 s com o prompt da seção 3.4. Movimento lento, uma ação por clipe.
6. **Montagem**: `roteiro.json` (modelo em `ferramenta/roteiro_exemplo.json`) e depois `python3 "Animação estilo Palito/ferramenta/montar_video.py" roteiro.json saida.mp4`. A legenda é **Cal Sans**, já configurada; não troque.
7. Confira a montagem extraindo uma grade de quadros com ffmpeg e comparando com `referencias/00-decupagem-quadro-a-quadro.jpg`. Envie o MP4 ao usuário com SendUserFile.

## Créditos
As etapas 4 e 5 (e gerar a voz) usam conectores pagos (ElevenLabs creative_generate_image / creative_generate_video, ou Picsart). Antes de gerar, diga quantas imagens e clipes serão feitos e confirme **uma vez** com o usuário. Depois disso, siga sem novas perguntas.

## Não fazer
- Não usar Three.js nem animação por código para o visual: o estilo depende de ilustração.
- Não adicionar música, efeitos, transições ou textos além da legenda.
- Não reutilizar quadros do vídeo de referência no vídeo final. Eles servem só de referência de estilo.
