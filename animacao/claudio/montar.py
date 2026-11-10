#!/usr/bin/env python3
"""Monta o vídeo final do Cláudio: cenas + narração + legendas em Poppins."""
import json, subprocess, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
W = json.load(open('words.json'))['words']
W = [w for w in W if w.get('type', 'word') == 'word']

# (arquivo, início no arquivo, duração no vídeo final, velocidade)
TIMELINE = [
    ('S1.mp4', 0.0, 2.0, 1), ('seg_insta.mp4', 0, 7.7, 1), ('seg_panic.mp4', 0, 1.2, 1),
    ('seg_chat1.mp4', 0, 5.3, 1), ('S3.mp4', 0.5, 1.8, 1), ('seg_chat2.mp4', 0, 2.8, 1),
    ('S4.mp4', 1.0, 5.0, 1), ('S5.mp4', 0.0, 5.0, 0.808), ('S6.mp4', 0.5, 2.0, 1),
    ('S7.mp4', 0.6, 2.9, 1), ('seg_gallery.mp4', 0, 1.3, 1), ('seg_formatura.mp4', 0, 4.6, 1),
    ('seg_send.mp4', 0, 2.7, 1), ('seg_ship.mp4', 0, 5.1, 1), ('S8.mp4', 0.5, 4.0, 1),
    ('seg_final.mp4', 0, 5.8, 1),
]
TOTAL = sum(t[2] for t in TIMELINE)
X_MARKS = [(31.35, 32.0), (32.25, 32.8), (35.3, 35.8)]  # "X" vermelho nas tentativas

CHUNKS = [
 (0,2,"TRÊS DA MANHÃ."),(3,4,"O [B]CLÁUDIO[/]"),(5,7,"ACABOU DE [R]CURTIR[/]"),(8,9,"SEM QUERER,"),
 (10,13,"UMA FOTO DA [R]BIA[/]"),(14,18,"DE [Y]2019[/]"),(19,22,"SETE ANOS PRA TRÁS"),(23,25,"NO PERFIL DELA."),
 (26,27,"ELE [R]DESCURTE.[/]"),(28,29,"TARDE [R]DEMAIS.[/]"),(30,32,"OS DOIS ESTUDARAM"),(33,33,"JUNTOS,"),
 (34,37,"MAS NÃO SE FALAVAM"),(38,40,"DESDE A ESCOLA."),(41,43,"ELE PEDE DESCULPA,"),(44,45,"ELA RI..."),
 (46,49,"E A CONVERSA VAI"),(50,53,"ATÉ O [Y]SOL NASCER.[/]"),(54,57,"AÍ CHEGA A MENSAGEM:"),
 (58,59,"“ME MANDA"),(60,62,"UMA FOTO SUA?”"),(63,66,"ESSE É O [B]CLÁUDIO.[/]"),(67,68,"CHINELO CONSERTADO"),
 (69,70,"COM ARAME,"),(71,72,"CALÇA FURADA,"),(73,74,"UM DENTE"),(75,77,"QUE FOI EMBORA"),(78,84,"EM [Y]2021[/]"),
 (85,86,"SEM AVISAR."),(87,89,"E O BONÉ..."),(90,92,"ELE [R]NUNCA[/] TIRA."),(93,94,"PRIMEIRA TENTATIVA..."),
 (95,95,"SEGUNDA..."),(96,96,"TERCEIRA,"),(97,99,"COM A AJUDA"),(100,102,"DA DONA [B]NEIDE[/]..."),(103,103,"[R]NADA.[/]"),
 (104,107,"ATÉ QUE ELE ACHA:"),(108,110,"FORMATURA DO IRMÃO,"),(111,112,"TERNO ALUGADO,"),(113,114,"UMA TARDE"),
 (115,119,"DE [Y]2018.[/]"),(120,122,"A [Y]ÚNICA[/] FOTO"),(123,126,"BOA DA VIDA DELE."),(127,128,"ELE MANDA."),
 (129,132,"ELA TRABALHA NUM NAVIO"),(133,137,"E VOLTA EM [Y]30 DIAS.[/]"),(138,141,"ELA CHAMA PRA SAIR."),
 (142,144,"ELE DIZ [Y]SIM.[/]"),(145,148,"SÓ QUE ELA MARCOU"),(149,153,"COM O CARA DA FOTO..."),
 (154,157,"E QUEM VAI APARECER"),(158,160,"É [R]ESSE AQUI.[/]"),(161,162,"[Y]30 DIAS.[/]"),
 (163,166,"POR ONDE ELE COMEÇA?"),(167,169,"[Y]BARBA[/] OU [R]DENTE?[/]"),(170,172,"COMENTA UMA PALAVRA."),
]
COL = {'Y': r'{\c&H3FD2FF&}', 'R': r'{\c&H4A2BED&}', 'B': r'{\c&HFFC16E&}'}

def ts(s):
    h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60
    return f"{h}:{m:02d}:{sec:05.2f}"

def fmt(txt):
    for k, v in COL.items():
        txt = txt.replace(f'[{k}]', v)
    return txt.replace('[/]', r'{\c&HFFFFFF&}')

lines = []
for n, (i, j, txt) in enumerate(CHUNKS):
    st = W[i]['start']
    en = W[CHUNKS[n + 1][0]]['start'] if n + 1 < len(CHUNKS) else TOTAL
    en = min(en, W[j]['end'] + 0.6)
    pop = r'{\fscx82\fscy82\t(0,110,\fscx100\fscy100)}'
    lines.append(f"Dialogue: 0,{ts(st)},{ts(en)},Leg,,0,0,0,,{pop}{fmt(txt)}")

ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Leg,Poppins ExtraBold,64,&H00FFFFFF,&H00FFFFFF,&H00141414,&H64000000,0,0,0,0,100,100,0,0,1,6,3,2,30,30,250,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(lines) + "\n"
open('legendas.ass', 'w').write(ass)

# 1) normaliza cada trecho para 720x1280, 30fps
parts = []
for k, (f, ss, dur, speed) in enumerate(TIMELINE):
    src = f if f.startswith('S') else os.path.join('.', f)
    out = f'tmp_{k:02d}.mp4'
    vf = f"setpts=PTS/{speed}," if speed != 1 else ""
    vf += "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30,setsar=1"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss), '-i', src, '-t', str(dur), '-an',
                    '-vf', vf + f",tpad=stop_mode=clone:stop_duration=1", '-t', str(dur),
                    '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
    parts.append(out)
open('lista.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista.txt',
                '-c', 'copy', 'tmp_video.mp4'], check=True)

# 2) X vermelho, legendas e narração
xf = "".join(
    f"[v{n}][1:v]overlay=0:0:enable='between(t,{a},{b})'[v{n+1}];" for n, (a, b) in enumerate(X_MARKS))
fc = f"[0:v]null[v0];{xf}[v{len(X_MARKS)}]ass=legendas.ass:fontsdir=cenas[vout];" \
     f"[2:a]apad,atrim=0:{TOTAL},afade=t=out:st={TOTAL-0.4}:d=0.4[aout]"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'tmp_video.mp4', '-loop', '1', '-i', 'cenas/x.png',
                '-i', 'narracao.mp3', '-filter_complex', fc, '-map', '[vout]', '-map', '[aout]',
                '-t', str(TOTAL), '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'claudio-final.mp4'], check=True)
for p in parts + ['tmp_video.mp4', 'lista.txt']:
    os.remove(p)
print('ok', round(TOTAL, 2), 's')
