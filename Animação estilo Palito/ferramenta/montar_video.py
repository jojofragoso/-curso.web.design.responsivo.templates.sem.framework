#!/usr/bin/env python3
"""
Monta o vídeo final (1080x1920) no estilo "Animação estilo Palito":
clipes/imagens das cenas + narração única + legendas Cal Sans de 1 a 3 palavras,
sincronizadas palavra por palavra.

Uso:
    python3 montar_video.py roteiro.json saida.mp4

roteiro.json (caminhos relativos à pasta do JSON):
{
  "audio": "narracao.mp3",          # MP3 da ElevenLabs ou áudio extraído de um vídeo
  "palavras": "palavras.json",      # gerado por transcrever.py
  "cenas": [
    {"visual": "cenas/01.mp4", "ate": 6.17},
    {"visual": "cenas/02.png", "ate": 11.85},
    {"visual": "cenas/01.mp4", "ate": 97.5, "inicio_clipe": 1.0}
  ]
}
- "ate": segundo da narração em que a cena termina (a última pode omitir = até o fim).
- "visual": clipe (.mp4/.mov/.webm) ou imagem (.png/.jpg).
  Clipe mais curto que a cena congela no último quadro; imagem ganha zoom lento.
- "inicio_clipe" (opcional): pula os primeiros segundos do clipe (útil ao reaproveitar).
- "sem_legenda": true no topo desliga as legendas.

Requisitos: ffmpeg (com libass) no PATH.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

W, H, FPS = 1080, 1920, 30
AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA_FONTES = os.path.join(AQUI, "fontes")

# ---- Legenda (padrão do canal: não mudar sem querer) ----
FONTE = "Cal Sans"
TAM_FONTE = 88          # em 1080 de largura
CENTRO_Y = 1430         # altura do centro da legenda (≈74% da tela, como na referência)
CONTORNO = 3            # contorno escuro
SOMBRA = 3              # sombra
MAX_PALAVRAS = 3        # 1 a 3 palavras por vez
MAX_LETRAS = 18
EXT_VIDEO = (".mp4", ".mov", ".webm", ".mkv")


def rodar(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("Erro no ffmpeg:\n" + " ".join(cmd) + "\n" + r.stderr[-2500:])
    return r.stdout


def duracao(arquivo):
    return float(rodar(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", arquivo]).strip())


# ---------------- legendas ----------------
def juntar_tokens(palavras):
    """Whisper separa 'enfrentá' e '-lo': junta tokens que começam com hífen."""
    out = []
    for w in palavras:
        if out and w["p"].startswith("-"):
            out[-1] = {"p": out[-1]["p"] + w["p"], "i": out[-1]["i"], "f": w["f"]}
        else:
            out.append(dict(w))
    return out


def blocos_de_legenda(palavras, dur_total):
    blocos, atual = [], []
    for w in juntar_tokens(palavras):
        teste = " ".join(x["p"] for x in atual + [w])
        if atual and (len(atual) >= MAX_PALAVRAS or len(teste) > MAX_LETRAS):
            blocos.append(atual)
            atual = []
        atual.append(w)
        if re.search(r"[.?!,;:]$", w["p"]):
            blocos.append(atual)
            atual = []
    if atual:
        blocos.append(atual)
    saida = []
    for k, b in enumerate(blocos):
        ini = b[0]["i"]
        prox = blocos[k + 1][0]["i"] if k + 1 < len(blocos) else dur_total
        fim = prox if prox - b[-1]["f"] < 0.6 else b[-1]["f"] + 0.3  # some em pausas longas
        texto = " ".join(x["p"] for x in b)
        texto = re.sub(r"[.,;:]+$", "", texto)  # como na referência: só ? e ! ficam
        saida.append((ini, fim, texto))
    return saida


def tempo_ass(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def escrever_ass(blocos, caminho):
    cab = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Palito,{FONTE},{TAM_FONTE},&H00FFFFFF,&H00FFFFFF,&H00141414,&H96000000,0,0,0,0,100,100,1,0,1,{CONTORNO},{SOMBRA},5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(cab)
        for ini, fim, txt in blocos:
            f.write(f"Dialogue: 0,{tempo_ass(ini)},{tempo_ass(fim)},Palito,,0,0,0,,"
                    f"{{\\pos({W // 2},{CENTRO_Y})}}{txt}\n")


# ---------------- cenas ----------------
def montar_cena(i, cena, dur, base, tmp):
    visual = os.path.join(base, cena["visual"])
    saida = os.path.join(tmp, f"cena_{i:03d}.mp4")
    enquadrar = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
                 f"crop={W}:{H},setsar=1,fps={FPS}")
    if visual.lower().endswith(EXT_VIDEO):
        ent = ["-ss", str(cena.get("inicio_clipe", 0)), "-i", visual]
        filtro = (f"[0:v]{enquadrar},tpad=stop_mode=clone:stop_duration={dur + 1},"
                  f"trim=duration={dur},setpts=PTS-STARTPTS[v]")
    else:
        q = max(1, int(dur * FPS))
        ent = ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur}", "-i", visual]
        filtro = (f"[0:v]scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,"
                  f"crop={W * 2}:{H * 2},zoompan=z='1+0.06*on/{q}':x='iw/2-(iw/zoom/2)':"
                  f"y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS},setsar=1,trim=duration={dur}[v]")
    rodar(["ffmpeg", "-y", "-v", "error", *ent, "-filter_complex", filtro, "-map", "[v]",
           "-an", "-t", f"{dur}", "-c:v", "libx264", "-preset", "medium", "-crf", "16",
           "-pix_fmt", "yuv420p", "-r", str(FPS), saida])
    return saida


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    roteiro, saida = sys.argv[1], os.path.abspath(sys.argv[2])
    base = os.path.dirname(os.path.abspath(roteiro))
    with open(roteiro, encoding="utf-8") as f:
        dados = json.load(f)
    audio = os.path.join(base, dados["audio"])
    total = duracao(audio)
    cenas = dados["cenas"]

    tmp = tempfile.mkdtemp(prefix="palito_")
    try:
        partes, t = [], 0.0
        for i, c in enumerate(cenas):
            fim = min(float(c.get("ate", total)), total) if i < len(cenas) - 1 else total
            dur = round(fim - t, 3)
            if dur <= 0:
                sys.exit(f"Cena {i + 1}: 'ate' ({fim}) precisa ser maior que o fim da anterior ({t}).")
            partes.append(montar_cena(i, c, dur, base, tmp))
            print(f"  cena {i + 1:02d}: {t:6.2f} -> {fim:6.2f}  {c['visual']}")
            t = fim

        lista = os.path.join(tmp, "lista.txt")
        with open(lista, "w") as f:
            f.writelines(f"file '{p}'\n" for p in partes)
        mudo = os.path.join(tmp, "mudo.mp4")
        rodar(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lista,
               "-c", "copy", mudo])

        filtro = []
        if not dados.get("sem_legenda"):
            with open(os.path.join(base, dados["palavras"]), encoding="utf-8") as f:
                palavras = json.load(f)["palavras"]
            blocos = blocos_de_legenda(palavras, total)
            ass = os.path.join(tmp, "legendas.ass")
            escrever_ass(blocos, ass)
            shutil.copy(ass, os.path.splitext(saida)[0] + "_legendas.ass")
            filtro = ["-vf", f"subtitles={ass}:fontsdir={PASTA_FONTES}"]
            print(f"  {len(blocos)} legendas")
        rodar(["ffmpeg", "-y", "-v", "error", "-i", mudo, "-i", audio, *filtro,
               "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium",
               "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
               "-shortest", "-movflags", "+faststart", saida])
        print(f"Pronto: {saida} ({duracao(saida):.1f}s)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
