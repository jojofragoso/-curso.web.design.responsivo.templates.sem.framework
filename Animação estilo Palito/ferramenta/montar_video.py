#!/usr/bin/env python3
"""
Monta um vídeo vertical (1080x1920) no estilo "Animação estilo Palito":
cenas animadas + narração + legendas de 1 a 3 palavras no centro-baixo da tela.

Uso:
    python3 montar_video.py roteiro.json saida.mp4

Formato do roteiro.json (caminhos relativos à pasta do JSON):
{
  "cenas": [
    {"visual": "cenas/01.mp4", "audio": "audio/01.mp3",
     "texto": "Por que Fulano era tão perigoso que até o governo tinha medo dele?"},
    {"visual": "cenas/02.png", "audio": "audio/02.mp3", "texto": "Pra começar..."}
  ]
}

- "visual": clipe animado (.mp4/.mov/.webm) OU imagem (.png/.jpg).
  Clipe: é cortado no tamanho do áudio (se for mais curto, congela o último quadro).
  Imagem: ganha um zoom lento, para não ficar parada.
- "audio": a narração SÓ daquela cena. A cena dura exatamente o tamanho do áudio.
  Opcional: "duracao" (segundos) no lugar do áudio, e a cena fica sem som.
- "texto": o que é falado. Vira legenda em blocos curtos, cronometrados pela
  quantidade de letras. Opcional: "legendas": [[inicio, fim, "texto"], ...]
  com tempos exatos (em segundos, relativos à cena), se você tiver.

Requisitos: ffmpeg no PATH e Pillow (pip install pillow).
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, "fontes", "Merriweather-Bold.woff")
TAM_FONTE = 68          # tamanho da letra da legenda
CENTRO_Y = 1430         # altura da legenda (≈74% da tela, como no original)
MAX_PALAVRAS = 3        # cada bloco de legenda tem 1 a 3 palavras
MAX_LETRAS = 18         # ...e no máximo ~18 letras
EXT_VIDEO = (".mp4", ".mov", ".webm", ".mkv")


def rodar(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("Erro no ffmpeg:\n" + " ".join(cmd) + "\n" + r.stderr[-2000:])
    return r.stdout


def duracao(arquivo):
    return float(rodar(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", arquivo]).strip())


def quebrar_legenda(texto):
    """Divide o texto em blocos de 1-3 palavras, sem passar de MAX_LETRAS."""
    blocos, atual = [], []
    for p in texto.split():
        teste = " ".join(atual + [p])
        if atual and (len(atual) >= MAX_PALAVRAS or len(teste) > MAX_LETRAS):
            blocos.append(" ".join(atual))
            atual = []
        atual.append(p)
        # pontuação forte fecha o bloco
        if re.search(r"[.?!,;:]$", p):
            blocos.append(" ".join(atual))
            atual = []
    if atual:
        blocos.append(" ".join(atual))
    # como no original: some vírgula/ponto final, fica só ? e !
    return [re.sub(r"[.,;:]+$", "", b) for b in blocos]


def cronometrar(blocos, dur):
    """Distribui a duração entre os blocos pelo número de letras (+ pausa na pontuação)."""
    pesos = [len(b.replace(" ", "")) + (4 if re.search(r"[.?!]$", b) else 0) + 2 for b in blocos]
    total = sum(pesos)
    t, saida = 0.0, []
    for b, p in zip(blocos, pesos):
        fim = t + dur * p / total
        saida.append((t, fim, b))
        t = fim
    return saida


def png_legenda(texto, caminho):
    """Texto branco serifado, contorno escuro fino e sombra suave — igual ao vídeo de referência."""
    fonte = ImageFont.truetype(FONTE, TAM_FONTE)
    img = Image.new("RGBA", (W, 260), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0, 0), texto, font=fonte, stroke_width=3)
    x = (W - (bbox[2] - bbox[0])) // 2 - bbox[0]
    y = (260 - (bbox[3] - bbox[1])) // 2 - bbox[1]
    sombra = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sombra).text((x + 3, y + 4), texto, font=fonte, fill=(0, 0, 0, 170),
                                stroke_width=4, stroke_fill=(0, 0, 0, 170))
    sombra = sombra.filter(ImageFilter.GaussianBlur(4))
    img = Image.alpha_composite(img, sombra)
    ImageDraw.Draw(img).text((x, y), texto, font=fonte, fill="white",
                             stroke_width=2, stroke_fill=(25, 25, 25, 255))
    img.save(caminho)


def montar_cena(i, cena, base, tmp):
    visual = os.path.join(base, cena["visual"])
    audio = os.path.join(base, cena["audio"]) if cena.get("audio") else None
    dur = duracao(audio) if audio else float(cena["duracao"])
    dur += float(cena.get("folga", 0.0))  # silêncio extra no fim da cena, se quiser

    # legendas
    if "legendas" in cena:
        legs = [tuple(l) for l in cena["legendas"]]
    else:
        legs = cronometrar(quebrar_legenda(cena.get("texto", "")), dur)
    entradas, filtros, ultimo = [], [], "[v0]"
    for j, (ini, fim, txt) in enumerate(legs):
        png = os.path.join(tmp, f"c{i:03d}_l{j:03d}.png")
        png_legenda(txt, png)
        entradas += ["-i", png]
    # visual
    enquadrar = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
                 f"crop={W}:{H},setsar=1,fps={FPS}")
    if visual.lower().endswith(EXT_VIDEO):
        ent_visual = ["-i", visual]
        filtros.append(f"[0:v]{enquadrar},tpad=stop_mode=clone:stop_duration={dur + 1},"
                       f"trim=duration={dur},setpts=PTS-STARTPTS[v0]")
    else:
        quadros = max(1, int(dur * FPS))
        ent_visual = ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur}", "-i", visual]
        filtros.append(f"[0:v]scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,"
                       f"crop={W * 2}:{H * 2},"
                       f"zoompan=z='1+0.06*on/{quadros}':x='iw/2-(iw/zoom/2)':"
                       f"y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS},setsar=1,"
                       f"trim=duration={dur}[v0]")
    for j, (ini, fim, _) in enumerate(legs):
        prox = f"[v{j + 1}]"
        filtros.append(f"{ultimo}[{j + 1}:v]overlay=0:{CENTRO_Y - 130}:"
                       f"enable='between(t,{ini:.3f},{fim:.3f})'{prox}")
        ultimo = prox
    n_ent = 1 + len(legs)
    if audio:
        ent_audio = ["-i", audio]
        filtros.append(f"[{n_ent}:a]aresample=44100,aformat=channel_layouts=stereo,"
                       f"apad,atrim=duration={dur}[a]")
    else:
        ent_audio = ["-f", "lavfi", "-t", f"{dur}", "-i", "anullsrc=r=44100:cl=stereo"]
        filtros.append(f"[{n_ent}:a]anull[a]")
    saida = os.path.join(tmp, f"cena_{i:03d}.mp4")
    rodar(["ffmpeg", "-y", "-v", "error", *ent_visual, *entradas, *ent_audio,
           "-filter_complex", ";".join(filtros), "-map", ultimo, "-map", "[a]",
           "-t", f"{dur}", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", saida])
    print(f"  cena {i + 1}: {dur:.1f}s, {len(legs)} legendas")
    return saida


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    roteiro, saida = sys.argv[1], sys.argv[2]
    base = os.path.dirname(os.path.abspath(roteiro))
    with open(roteiro, encoding="utf-8") as f:
        dados = json.load(f)
    tmp = tempfile.mkdtemp(prefix="palito_")
    try:
        print(f"Montando {len(dados['cenas'])} cenas...")
        partes = [montar_cena(i, c, base, tmp) for i, c in enumerate(dados["cenas"])]
        lista = os.path.join(tmp, "lista.txt")
        with open(lista, "w") as f:
            f.writelines(f"file '{p}'\n" for p in partes)
        rodar(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lista,
               "-c", "copy", "-movflags", "+faststart", saida])
        print(f"Pronto: {saida} ({duracao(saida):.1f}s)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
