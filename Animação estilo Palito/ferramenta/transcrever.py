#!/usr/bin/env python3
"""
Transcreve a narração com tempo de cada palavra (Whisper, roda local).

Uso:
    python3 transcrever.py ENTRADA palavras.json [modelo]

ENTRADA pode ser um MP3/WAV (ex.: ElevenLabs) ou um VÍDEO (o áudio é extraído).
modelo: tiny | base | small (padrão) | medium

Saída (palavras.json):
    {"duracao": 97.5, "texto": "...", "palavras": [{"p": "Porque", "i": 0.0, "f": 0.4}, ...]}

Instalação (uma vez por sessão):  pip install openai-whisper
"""
import json
import os
import subprocess
import sys
import tempfile


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    entrada, saida = sys.argv[1], sys.argv[2]
    modelo = sys.argv[3] if len(sys.argv) > 3 else "small"
    import whisper  # noqa: importa só aqui para o --help funcionar sem whisper

    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "audio.wav")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", entrada, "-vn", "-ac", "1",
                        "-ar", "16000", wav], check=True)
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                    "-of", "csv=p=0", wav], capture_output=True, text=True,
                                   check=True).stdout)
        r = whisper.load_model(modelo).transcribe(wav, language="pt", word_timestamps=True)
    palavras = [{"p": w["word"].strip(), "i": round(w["start"], 3), "f": round(w["end"], 3)}
                for s in r["segments"] for w in s["words"] if w["word"].strip()]
    with open(saida, "w", encoding="utf-8") as f:
        json.dump({"duracao": round(dur, 3), "texto": r["text"].strip(), "palavras": palavras},
                  f, ensure_ascii=False, indent=1)
    print(f"{len(palavras)} palavras, {dur:.1f}s -> {saida}")
    print(r["text"].strip())


if __name__ == "__main__":
    main()
