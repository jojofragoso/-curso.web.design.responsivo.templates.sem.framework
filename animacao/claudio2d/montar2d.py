#!/usr/bin/env python3
"""Versão 2D chapada do Cláudio: todas as cenas em código (cenas/cenas2d.html).

Cada cena começa numa palavra da narração (words.json), então o vídeo
acompanha o ritmo da voz automaticamente.
"""
import json, subprocess, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '../claudio')  # reaproveita os efeitos sonoros (sfx.py)
W = [w for w in json.load(open('words.json'))['words'] if w.get('type', 'word') == 'word']
st = lambda i, off=0.0: max(0.0, W[i]['start'] + off)
TOTAL = round(W[-1]['end'] + 1.2, 2)

# (fonte, palavra onde começa, ajuste em s, início no clipe, fim no clipe)
# fonte "S*.mp4" = cena de IA; outro nome = cena feita em código (cenas/cenas.html)
SEQ = [
    ('cama', 0, 0.0, None, None),
    ('insta', 7, -0.9, None, None),
    ('panic', 28, -0.15, None, None),
    ('chat1', 30, -0.1, None, None),
    ('danca', 46, -0.1, None, None),
    ('chat2', 54, -0.1, None, None),
    ('revela', 63, -0.15, None, None),
    ('dente', 73, -0.1, None, None),
    ('selfie', 93, -0.15, None, None),
    ('neidecena', 96, -0.15, None, None),
    ('gallery', 104, -0.1, None, None),
    ('formatura', 108, -0.1, None, None),
    ('send', 120, -0.1, None, None),
    ('ship', 129, -0.1, None, None),
    ('suor', 145, -0.15, None, None),
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
    'revela': {'feet': rel(idx['revela'], 67), 'knee': rel(idx['revela'], 71)},
    'dente': {'cap': rel(idx['dente'], 87)},
    'selfie': {'f1': rel(idx['selfie'], 94, -0.2), 'f2': rel(idx['selfie'], 95, 0.1)},
    'neidecena': {'f1': rel(idx['neidecena'], 101)},
    'suor': {'real': rel(idx['suor'], 149)},
}
X_MARKS = [(W[94]['end'] - 0.35, st(95)), (W[95]['end'] - 0.35, st(96)), (st(103), st(103) + 0.8)]

# 1) renderiza as cenas feitas em código com a duração e os tempos certos
args = []
for k, (src, *_r) in enumerate(SEQ):
    if not src.endswith('.mp4'):
        ev = json.dumps(EVENTS.get(src, {}))
        args.append(f"{src}|{durs[k] + 0.2:.2f}|{ev}")
subprocess.run(['node', 'render.js', 'video', *args], cwd='cenas', check=True)  # gera seg_<cena>.mp4

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
 (0,2,"Três da manhã."),(3,4,"O [Y]Cláudio[/]"),(5,7,"acabou de [Y]curtir[/]"),(8,9,"sem querer,"),
 (10,13,"uma foto da [Y]Bia[/]..."),(14,18,"de [Y]2019[/]."),(19,22,"Sete anos pra trás"),(23,25,"no perfil dela."),
 (26,27,"Ele [Y]descurte[/]..."),(28,29,"Tarde [Y]demais.[/]"),(30,32,"Os dois estudaram"),(33,33,"juntos,"),
 (34,37,"mas não se falavam"),(38,40,"desde a escola."),(41,43,"Ele pede [Y]desculpa[/]..."),(44,45,"ela [Y]ri[/]..."),
 (46,49,"e a conversa vai"),(50,53,"até o [Y]sol nascer.[/]"),(54,57,"Aí chega a mensagem:"),
 (58,59,"“me manda"),(60,62,"uma [Y]foto sua?[/]”"),(63,66,"Esse é o [Y]Cláudio.[/]"),(67,68,"Chinelo consertado"),
 (69,70,"com [Y]arame[/]..."),(71,72,"calça [Y]furada[/]..."),(73,74,"um [Y]dente[/]"),(75,77,"que foi embora"),(78,84,"em [Y]2021[/],"),
 (85,86,"sem avisar."),(87,89,"E o [Y]boné[/]..."),(90,92,"ele [Y]nunca[/] tira."),(93,94,"Primeira tentativa..."),
 (95,95,"segunda..."),(96,96,"terceira,"),(97,99,"com a ajuda"),(100,102,"da dona [Y]Neide[/]..."),(103,103,"[Y]nada.[/]"),
 (104,107,"Até que ele acha:"),(108,110,"[Y]formatura[/] do irmão,"),(111,112,"terno alugado,"),(113,114,"uma tarde"),
 (115,119,"de [Y]2018.[/]"),(120,122,"A [Y]única[/] foto"),(123,126,"boa da vida dele."),(127,128,"Ele [Y]manda.[/]"),
 (129,132,"Ela trabalha num navio"),(133,137,"e volta em [Y]30 dias.[/]"),(138,141,"Ela chama pra sair..."),
 (142,144,"Ele diz [Y]sim.[/]"),(145,148,"Só que ela marcou"),(149,153,"com o [Y]cara da foto[/]..."),
 (154,157,"e quem vai aparecer..."),(158,160,"é [Y]esse aqui.[/]"),(161,162,"[Y]30 dias.[/]"),
 (163,166,"Por onde ele começa?"),(167,169,"[Y]Barba[/] ou [Y]dente?[/]"),(170,172,"Comenta uma [Y]palavra.[/]"),
]
COL = {'Y': r'{\c&H2CC8F5&}'}

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
Style: Leg,Poppins ExtraBold,60,&H00FFFFFF,&H00FFFFFF,&H001D212B,&H781D212B,0,0,0,0,100,100,0,0,1,5,4,2,30,30,210,1

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
    (A('dente', 0.3), 'sparkle', 0.7), (A('dente', E_['dente']['cap']), 'tap', 0.6),
    (A('revela', E_['revela']['feet'] - 0.3), 'whoosh', 0.4), (A('revela', E_['revela']['knee'] - 0.3), 'whoosh', 0.4),
    (A('revela', E_['revela']['knee']), 'pop', 0.5),
    (A('gallery', 0.0), 'ticks', 0.8), (A('gallery', 0.7), 'pop', 0.7),
    (A('formatura', 0.0), 'tada', 0.8),
    (A('send', E_['send']['m1'] - 0.05), 'tap', 0.8), (A('send', E_['send']['m1']), 'msg_out', 0.8),
    (A('ship', 0.3), 'horn', 0.45), (A('ship', E_['ship']['b1']), 'msg_in', 0.8),
    (A('ship', E_['ship']['b2']), 'msg_out', 0.8),
    (A('suor', E_['suor']['real'] + 1.2), 'gulp', 0.8), (A('suor', E_['suor']['real']), 'unlike', 0.4),
    (A('final', 0.2), 'pop', 0.6), (A('final', 0.4), 'pop', 0.5), (A('final', 0.6), 'pop', 0.7),
    (st(167), 'pop', 0.5), (st(169), 'pop', 0.5), (st(170), 'bell', 0.7),
]
ev += [(A('selfie', E_['selfie'][f]), 'shutter', 0.8) for f in ('f1', 'f2')]
ev += [(A('neidecena', E_['neidecena']['f1']), 'shutter', 0.8)]
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
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'claudio-2d.mp4'], check=True)
for p in parts + ['tmp_video.mp4', 'lista.txt']:
    os.remove(p)
for k, (src, *_r) in enumerate(SEQ):
    print(f"{starts[k]:6.2f}s  {durs[k]:5.2f}s  {src}")
print('total', TOTAL, 's')
