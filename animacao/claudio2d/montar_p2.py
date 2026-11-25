#!/usr/bin/env python3
"""Parte 2 do Cláudio (2D): "Vocês escolheram dente".

Precisa de narracao_p2.mp3 e words_p2.json (transcrição com o tempo de cada
palavra). Cada cena começa na palavra certa, procurada pelo texto.
"""
import json, os, re, subprocess, sys, unicodedata
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '../claudio')  # efeitos sonoros (sfx.py)
import sfx

W = [w for w in json.load(open('words_p2.json'))['words'] if w.get('type', 'word') == 'word']
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
NW = [norm(w['text']) for w in W]


def find(word, after=0):
    """Índice da primeira palavra igual a `word` a partir de `after`."""
    k = norm(word)
    for i in range(after, len(NW)):
        if NW[i] == k or (len(k) > 3 and NW[i].startswith(k)):
            return i
    raise ValueError(f'palavra não encontrada: {word} (depois de {after})')


def at(*path):
    """Tempo da palavra seguindo uma sequência: at('ainda','faltam') etc."""
    i = 0
    for p in path:
        i = find(p, i)
    return i


st = lambda i, off=0.0: max(0.0, W[i]['start'] + off)
TOTAL = round(W[-1]['end'] + 1.2, 2)

# (cena, índice da palavra onde começa, ajuste)
SEQ = [
    ('abertura', 0, 0.0),
    ('orcamento', at('primeiro'), -0.15),
    ('carteira', at('primeiro', 'claudio'), -0.15),
    ('conserto', at('vira'), -0.4),
    ('posto', at('tentativa'), -0.6),
    ('primo', at('segunda'), -0.15),
    ('cola', at('terceira'), -0.15),
    ('clinica', at('descobre'), -0.6),
    ('cadeira', at('dentista', 'aluna'), -0.5),
    ('dias', at('tres'), -0.15),
    ('espelho', at('sorriso', 'voltou'), -0.6),
    ('audio', at('audio'), -0.6),
    ('mapa', at('navio', 'cada'), -1.2),
    ('final2', at('agora'), -0.15),
]
starts = [0.0 if k == 0 else st(i, off) for k, (_, i, off) in enumerate(SEQ)]
durs = [(starts[k + 1] if k + 1 < len(SEQ) else TOTAL) - starts[k] for k in range(len(SEQ))]
idx = {s[0]: k for k, s in enumerate(SEQ)}
rel = lambda name, i, off=0.0: round(st(i, off) - starts[idx[name]], 3)

EVENTS = {
    'abertura': {'feio': rel('abertura', at('sinceramente'))},
    'orcamento': {'val': rel('orcamento', at('800'))},
    'carteira': {'pizza': rel('carteira', at('vale'))},
    'conserto': {'mais': rel('conserto', at('junta')), 'faltam': rel('conserto', at('ainda', 'faltam'))},
    'posto': {'close': rel('posto', at('senha'), -0.2)},
    'primo': {'vamp': rel('primo', at('vampiro'), -0.2), 'festa': rel('primo', at('festa'))},
    'cola': {'cai': rel('cola', at('durou')), 'neide': rel('cola', at('cola', 'neide'), -0.3)},
    'clinica': {'gratis': rel('clinica', at('graca'), -0.3)},
    'cadeira': {'mao': rel('cadeira', at('professora'))},
    'dias': {'anest': rel('dias', at('anestesias')), 'rest': rel('dias', at('restauracao')), 'limp': rel('dias', at('limpeza'))},
    'espelho': {'desde': rel('espelho', at('desde'))},
    'audio': {'dorm': rel('audio', at('audio', 'boca'), -0.3), 'beb': rel('audio', at('bebado'), -0.4),
              'video': rel('audio', at('amanha'))},
}

# 1) renderiza todas as cenas (cenas/cenas_p2.html)
args = [f"{src}|{durs[k] + 0.2:.2f}|{json.dumps(EVENTS.get(src, {}))}" for k, (src, *_r) in enumerate(SEQ)]
subprocess.run(['node', 'render.js', 'video', *args], cwd='cenas', check=True,
               env={**os.environ, 'PAGE': 'cenas_p2.html'})
parts = []
for k, (src, *_r) in enumerate(SEQ):
    out = f'tmp_{k:02d}.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'seg_{src}.mp4', '-an', '-vf',
                    'fps=30,setsar=1,tpad=stop_mode=clone:stop_duration=5', '-t', f'{durs[k]:.3f}',
                    '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
    parts.append(out)
open('lista.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'lista.txt',
                '-c', 'copy', 'tmp_video.mp4'], check=True)

# 2) legendas: blocos de até 3 palavras, quebrando na pontuação; números viram dígitos
NUM = {('oitocentos',): '800', ('cento', 'e', 'doze'): '112', ('oitenta',): '80',
       ('seiscentos', 'e', 'oito'): '608', ('cento', 'e', 'quarenta', 'e', 'sete'): '147', ('nove',): '9',
       ('dois', 'mil', 'e', 'vinte', 'e', 'um'): '2021', ('vinte', 'e', 'sete'): '27'}
HL = {'dente', 'valepizza', '800', '112', 'pizza', '80', '608', '147', '9', 'vampiro', 'segundos', 'neide', 'graca',
      'voltou', '2021', 'bia', 'bebado', 'video', '27', 'barba', 'cabelo', 'palavra', 'feio', 'confiscou'}
toks = []  # (texto, início, fim)
i = 0
while i < len(W):
    hit = None
    for seq, dig in NUM.items():
        n = len(seq)
        if tuple(NW[i:i + n]) == seq:
            hit = (dig + re.sub(r'^[^.,?!:…]*', '', W[i + n - 1]['text']), W[i]['start'], W[i + n - 1]['end'], n)
            break
    if hit:
        toks.append(hit[:3]); i += hit[3]
    else:
        toks.append((W[i]['text'], W[i]['start'], W[i]['end'])); i += 1
chunks, cur = [], []
for tk in toks:
    cur.append(tk)
    if len(cur) == 3 or re.search(r'[.,?!:…]$', tk[0]):
        chunks.append(cur); cur = []
if cur:
    chunks.append(cur)


def ts(s):
    return f"{int(s // 3600)}:{int(s % 3600 // 60):02d}:{s % 60:05.2f}"


lines = []
for n, ch in enumerate(chunks):
    words = []
    for j, (tx, *_t) in enumerate(ch):
        if n == 0 and j == 0 or (j == 0 and lines and re.search(r'[.?!]$', chunks[n - 1][-1][0])):
            tx = tx[:1].upper() + tx[1:]
        words.append(r'{\c&H2CC8F5&}' + tx + r'{\c&HFFFFFF&}' if norm(tx) in HL else tx)
    a = ch[0][1]
    b = chunks[n + 1][0][1] if n + 1 < len(chunks) else TOTAL
    b = min(b, ch[-1][2] + 0.7)
    lines.append(f"Dialogue: 0,{ts(a)},{ts(b)},Leg,,0,0,0,," r"{\fscx82\fscy82\t(0,110,\fscx100\fscy100)}" + ' '.join(words))
open('legendas_p2.ass', 'w').write("""[Script Info]
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

# 3) efeitos sonoros
A = lambda name, t: starts[idx[name]] + t
E = EVENTS
ev = [(starts[k] - 0.15, 'whoosh', 0.35) for k in range(1, len(SEQ))]
ev += [
    (A('abertura', 0.3), 'pop', 0.7), (A('abertura', E['abertura']['feio']), 'unlike', 0.4),
    (A('orcamento', 0.0), 'pop', 0.6), (A('orcamento', E['orcamento']['val']), 'stinger', 0.6),
    (A('carteira', 0.3), 'ticks', 0.7), (A('carteira', E['carteira']['pizza']), 'pop', 0.7),
    (A('conserto', E['conserto']['mais']), 'like', 0.6), (A('conserto', E['conserto']['faltam']), 'wrong', 0.4),
    (A('posto', E['posto']['close']), 'pop', 0.7), (A('posto', E['posto']['close'] + 0.6), 'bell', 0.5),
    (A('primo', 0.5), 'pop', 0.6), (A('primo', E['primo']['vamp']), 'sparkle', 0.7),
    (A('cola', E['cola']['cai']), 'unlike', 0.7), (A('cola', E['cola']['neide']), 'wrong', 0.6),
    (A('clinica', E['clinica']['gratis']), 'tada', 0.6),
    (A('cadeira', 0.2), 'gulp', 0.6),
    (A('dias', E['dias']['anest']), 'pop', 0.6), (A('dias', E['dias']['anest'] + 0.3), 'pop', 0.6),
    (A('dias', E['dias']['rest']), 'pop', 0.6), (A('dias', E['dias']['limp']), 'sparkle', 0.7),
    (A('espelho', 0.3), 'sparkle', 0.8), (A('espelho', 0.8), 'like', 0.6),
    (A('audio', 0.1), 'msg_out', 0.7), (A('audio', E['audio']['beb']), 'msg_in', 0.8), (A('audio', E['audio']['video']), 'msg_in', 0.9),
    (A('mapa', 0.2), 'horn', 0.4),
    (A('final2', 0.2), 'pop', 0.6), (A('final2', 0.4), 'pop', 0.5), (A('final2', 0.6), 'pop', 0.7),
    (st(at('comenta')), 'bell', 0.7),
]
sfx.build(ev, TOTAL, 'sfx_p2.wav')

# 4) junta vídeo, legendas, narração e efeitos
fc = (f"[0:v]ass=legendas_p2.ass:fontsdir=cenas[vout];"
      f"[1:a]volume=1.4,apad,atrim=0:{TOTAL}[nar];[2:a]volume=0.22[fx];"
      f"[nar][fx]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000,"
      f"afade=t=out:st={TOTAL - 0.5}:d=0.5[aout]")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'tmp_video.mp4', '-i', 'narracao_p2.mp3', '-i', 'sfx_p2.wav',
                '-filter_complex', fc, '-map', '[vout]', '-map', '[aout]', '-t', str(TOTAL),
                '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'claudio-2d-parte2.mp4'], check=True)
for p in parts + ['tmp_video.mp4', 'lista.txt']:
    os.remove(p)
for k, (src, *_r) in enumerate(SEQ):
    print(f"{starts[k]:6.2f}s  {durs[k]:5.2f}s  {src}")
print('total', TOTAL, 's')
