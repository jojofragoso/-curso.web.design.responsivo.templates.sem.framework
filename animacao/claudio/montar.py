#!/usr/bin/env python3
"""Monta o vídeo final do Cláudio: cenas + narração + legendas em Poppins.

Cada cena começa numa palavra da narração (words.json), então o vídeo
acompanha o ritmo da voz automaticamente.
"""
import json, subprocess, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
W = [w for w in json.load(open('words.json'))['words'] if w.get('type', 'word') == 'word']
st = lambda i, off=0.0: max(0.0, W[i]['start'] + off)
TOTAL = round(W[-1]['end'] + 1.2, 2)

# (fonte, palavra onde começa, ajuste em s, início no clipe, fim no clipe)
# fonte "S*.mp4" = cena de IA; outro nome = cena feita em código (cenas/cenas.html)
SEQ = [
    ('S1.mp4', 0, 0.0, 0.0, None),
    ('insta', 7, -0.9, None, None),
    ('panic', 28, -0.15, None, None),
    ('chat1', 30, -0.1, None, None),
    ('S3.mp4', 46, -0.1, 0.4, None),
    ('chat2', 54, -0.1, None, None),
    ('S4.mp4', 63, -0.15, 0.0, 3.2),   # corta antes de aparecer o pé (sem os arames)
    ('S5.mp4', 73, -0.1, 0.0, None),
    ('S6.mp4', 93, -0.15, 0.3, None),
    ('S7.mp4', 96, -0.15, 0.3, None),
    ('gallery', 104, -0.1, None, None),
    ('formatura', 108, -0.1, None, None),
    ('send', 120, -0.1, None, None),
    ('ship', 129, -0.1, None, None),
    ('S8.mp4', 145, -0.15, 0.3, None),
    ('final', 161, -0.1, None, None),
]
starts = [0.0 if k == 0 else st(i, off) for k, (_, i, off, _, _) in enumerate(SEQ)]
durs = [(starts[k + 1] if k + 1 < len(SEQ) else TOTAL) - starts[k] for k in range(len(SEQ))]

def rel(k, i, off=0.0):
    return round(st(i, off) - starts[k], 3)

idx = {s[0]: k for k, s in enumerate(SEQ)}
EVENTS = {
    'insta': {'like': rel(idx['insta'], 7, 0.05), 'zin': rel(idx['insta'], 14, -0.2),
              'zout': rel(idx['insta'], 26, -0.6), 'unlike': rel(idx['insta'], 27, 0.15)},
    'chat1': {'m1': rel(idx['chat1'], 41), 'm2': rel(idx['chat1'], 44)},
    'chat2': {'m1': rel(idx['chat2'], 58)},
    'send': {'m1': rel(idx['send'], 128)},
    'ship': {'b1': rel(idx['ship'], 138), 'b2': rel(idx['ship'], 142)},
}
X_MARKS = [(W[94]['end'] - 0.35, st(95)), (W[95]['end'] - 0.35, st(96)), (st(103), st(103) + 0.8)]

# 1) renderiza as cenas feitas em código com a duração e os tempos certos
args = []
for k, (src, *_r) in enumerate(SEQ):
    if not src.endswith('.mp4'):
        ev = json.dumps(EVENTS.get(src, {}))
        args.append(f"{src}|{durs[k] + 0.2:.2f}|{ev}")
subprocess.run(['node', 'render.js', 'video', *args], cwd='cenas', check=True)

# 2) normaliza cada trecho (720x1280, 30 fps); cenas de IA mais curtas que o trecho
#    ficam em câmera lenta (até 1.5x) e seguram o último quadro
parts = []
slows = {}
for k, (src, _i, _o, ss, end) in enumerate(SEQ):
    dur = durs[k]
    out = f'tmp_{k:02d}.mp4'
    if src.endswith('.mp4'):
        full = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                               '-of', 'csv=p=0', src]).decode())
        avail = (end if end else full) - ss
        slow = min(1.5, max(1.0, dur / avail))
        slows[k] = slow
        inp = ['-ss', str(ss), '-t', str(avail), '-i', src]
        vf = f"setpts=PTS*{slow:.3f},"
    else:
        inp = ['-i', f'seg_{src}.mp4']
        vf = ""
    vf += ("scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30,setsar=1,"
           "tpad=stop_mode=clone:stop_duration=5")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inp, '-an', '-vf', vf, '-t', f'{dur:.3f}',
                    '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
    parts.append(out)
open('lista.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista.txt',
                '-c', 'copy', 'tmp_video.mp4'], check=True)

# 3) legendas (Poppins), em blocos curtos sincronizados com a fala
CHUNKS = [
 (0,2,"TRÊS DA MANHÃ."),(3,4,"O [B]CLÁUDIO[/]"),(5,7,"ACABOU DE [R]CURTIR[/]"),(8,9,"SEM QUERER,"),
 (10,13,"UMA FOTO DA [R]BIA[/]..."),(14,18,"DE [Y]2019[/]."),(19,22,"SETE ANOS PRA TRÁS"),(23,25,"NO PERFIL DELA."),
 (26,27,"ELE [R]DESCURTE[/]..."),(28,29,"TARDE [R]DEMAIS.[/]"),(30,32,"OS DOIS ESTUDARAM"),(33,33,"JUNTOS,"),
 (34,37,"MAS NÃO SE FALAVAM"),(38,40,"DESDE A ESCOLA."),(41,43,"ELE PEDE DESCULPA..."),(44,45,"ELA RI..."),
 (46,49,"E A CONVERSA VAI"),(50,53,"ATÉ O [Y]SOL NASCER.[/]"),(54,57,"AÍ CHEGA A MENSAGEM:"),
 (58,59,"“ME MANDA"),(60,62,"UMA FOTO SUA?”"),(63,66,"ESSE É O [B]CLÁUDIO.[/]"),(67,68,"CHINELO CONSERTADO"),
 (69,70,"COM ARAME..."),(71,72,"CALÇA FURADA..."),(73,74,"UM DENTE"),(75,77,"QUE FOI EMBORA"),(78,84,"EM [Y]2021[/],"),
 (85,86,"SEM AVISAR."),(87,89,"E O BONÉ..."),(90,92,"ELE [R]NUNCA[/] TIRA."),(93,94,"PRIMEIRA TENTATIVA..."),
 (95,95,"SEGUNDA..."),(96,96,"TERCEIRA,"),(97,99,"COM A AJUDA"),(100,102,"DA DONA [B]NEIDE[/]..."),(103,103,"[R]NADA.[/]"),
 (104,107,"ATÉ QUE ELE ACHA:"),(108,110,"FORMATURA DO IRMÃO,"),(111,112,"TERNO ALUGADO,"),(113,114,"UMA TARDE"),
 (115,119,"DE [Y]2018.[/]"),(120,122,"A [Y]ÚNICA[/] FOTO"),(123,126,"BOA DA VIDA DELE."),(127,128,"ELE MANDA."),
 (129,132,"ELA TRABALHA NUM NAVIO"),(133,137,"E VOLTA EM [Y]30 DIAS.[/]"),(138,141,"ELA CHAMA PRA SAIR..."),
 (142,144,"ELE DIZ [Y]SIM.[/]"),(145,148,"SÓ QUE ELA MARCOU"),(149,153,"COM O CARA DA FOTO..."),
 (154,157,"E QUEM VAI APARECER..."),(158,160,"É [R]ESSE AQUI.[/]"),(161,162,"[Y]30 DIAS.[/]"),
 (163,166,"POR ONDE ELE COMEÇA?"),(167,169,"[Y]BARBA[/] OU [R]DENTE?[/]"),(170,172,"COMENTA UMA PALAVRA."),
]
COL = {'Y': r'{\c&H3FD2FF&}', 'R': r'{\c&H4A2BED&}', 'B': r'{\c&HFFC16E&}'}

def ts(s):
    return f"{int(s // 3600)}:{int(s % 3600 // 60):02d}:{s % 60:05.2f}"

def fmt(txt):
    for c, v in COL.items():
        txt = txt.replace(f'[{c}]', v)
    return txt.replace('[/]', r'{\c&HFFFFFF&}')

lines = []
for n, (i, j, txt) in enumerate(CHUNKS):
    a = W[i]['start']
    b = W[CHUNKS[n + 1][0]]['start'] if n + 1 < len(CHUNKS) else TOTAL
    b = min(b, W[j]['end'] + 0.7)
    lines.append(f"Dialogue: 0,{ts(a)},{ts(b)},Leg,,0,0,0,,"
                 r"{\fscx82\fscy82\t(0,110,\fscx100\fscy100)}" + fmt(txt))
open('legendas.ass', 'w').write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Leg,Poppins ExtraBold,64,&H00FFFFFF,&H00FFFFFF,&H00141414,&H64000000,0,0,0,0,100,100,0,0,1,6,3,2,30,30,250,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(lines) + "\n")

# 4) efeitos sonoros, no tempo de cada animação
import sfx

def clip_t(name, frame, fps=24):
    k = idx[name]
    return starts[k] + (frame / fps - SEQ[k][3]) * slows.get(k, 1.0)

A = lambda name, t: starts[idx[name]] + t
E_ = EVENTS
ev = []
for k in range(1, len(SEQ)):
    ev.append((starts[k] - 0.15, 'whoosh', 0.35))
ev += [
    (A('insta', E_['insta']['like'] - 0.05), 'tap', 0.8), (A('insta', E_['insta']['like']), 'like', 0.8),
    (A('insta', E_['insta']['zin'] - 0.1), 'whoosh', 0.5), (A('insta', E_['insta']['zout'] - 0.1), 'whoosh', 0.4),
    (A('insta', E_['insta']['unlike'] - 0.05), 'tap', 0.8), (A('insta', E_['insta']['unlike']), 'unlike', 0.8),
    (A('panic', 0.0), 'stinger', 0.9),
    (A('chat1', 0.2), 'msg_in', 0.35), (A('chat1', 0.35), 'msg_out', 0.3),
    (A('chat1', E_['chat1']['m1']), 'msg_out', 0.7), (A('chat1', E_['chat1']['m2']), 'msg_in', 0.7),
    (A('chat1', E_['chat1']['m2'] + 0.6), 'msg_in', 0.6),
    (A('chat2', 0.4), 'msg_in', 0.5), (A('chat2', E_['chat2']['m1']), 'msg_in', 0.9),
    (A('S5.mp4', 0.5), 'sparkle', 0.7),
    (A('gallery', 0.0), 'ticks', 0.8), (A('gallery', 0.7), 'pop', 0.7),
    (A('formatura', 0.0), 'tada', 0.8),
    (A('send', E_['send']['m1'] - 0.05), 'tap', 0.8), (A('send', E_['send']['m1']), 'msg_out', 0.8),
    (A('ship', 0.3), 'horn', 0.45), (A('ship', E_['ship']['b1']), 'msg_in', 0.8),
    (A('ship', E_['ship']['b2']), 'msg_out', 0.8),
    (A('S8.mp4', 2.6), 'gulp', 0.8),
    (A('final', 0.2), 'pop', 0.6), (A('final', 0.4), 'pop', 0.5), (A('final', 0.6), 'pop', 0.7),
    (st(167), 'pop', 0.5), (st(169), 'pop', 0.5), (st(170), 'bell', 0.7),
]
ev += [(clip_t('S6.mp4', f), 'shutter', 0.8) for f in (16, 52, 73)]
ev += [(clip_t('S7.mp4', 41), 'shutter', 0.8)]
ev += [(a, 'wrong', 0.6) for a, _b in X_MARKS]
sfx.build(ev, TOTAL, 'sfx.wav')

# 5) X vermelho, legendas, narração + efeitos
xf = "".join(f"[v{n}][1:v]overlay=0:0:enable='between(t,{a:.2f},{b:.2f})'[v{n+1}];"
             for n, (a, b) in enumerate(X_MARKS))
fc = (f"[0:v]null[v0];{xf}[v{len(X_MARKS)}]ass=legendas.ass:fontsdir=cenas[vout];"
      f"[2:a]volume=1.4,apad,atrim=0:{TOTAL}[nar];[3:a]volume=0.32[fx];"
      f"[nar][fx]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000,"
      f"afade=t=out:st={TOTAL - 0.5}:d=0.5[aout]")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'tmp_video.mp4', '-loop', '1', '-i', 'cenas/x.png',
                '-i', 'narracao.mp3', '-i', 'sfx.wav', '-filter_complex', fc, '-map', '[vout]', '-map', '[aout]',
                '-t', str(TOTAL), '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'claudio-final.mp4'], check=True)
for p in parts + ['tmp_video.mp4', 'lista.txt']:
    os.remove(p)
for k, (src, *_r) in enumerate(SEQ):
    print(f"{starts[k]:6.2f}s  {durs[k]:5.2f}s  {src}")
print('total', TOTAL, 's')
