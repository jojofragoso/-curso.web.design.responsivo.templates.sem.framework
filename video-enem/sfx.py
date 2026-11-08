"""Sintetiza os efeitos sonoros (sem bancos externos) e mixa com a narração.
Uso: python3 sfx.py sfx.json narracao.mp3 saida.wav
"""
import json, subprocess, sys
import numpy as np
from scipy import signal

SR = 44100
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=.005, r=None, curve=4):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if r is None: e *= np.exp(-curve * np.linspace(0, 1, n))
    return e
def noise(d): return rng.standard_normal(int(SR * d))
def bp(x, lo, hi, order=2): b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def lp(x, f, order=2): b, a = signal.butter(order, f / (SR / 2)); return signal.lfilter(b, a, x)
def hp(x, f, order=2): b, a = signal.butter(order, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def norm(x, peak=.9): m = np.max(np.abs(x)) or 1; return x / m * peak
def fade(x, fi=.05, fo=.3):
    n = len(x); a = min(n // 2, int(fi * SR)); b = min(n // 2, int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x
def sine(f, d, ph=0): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, int(SR * d)) if np.ndim(f) else np.full(int(SR * d), f)) / SR + ph)
def place(buf, x, pos):
    i = int(pos * SR)
    if i >= len(buf): return
    x = x[:len(buf) - i]; buf[i:i + len(x)] += x

# ---------- sons curtos ----------
def whoosh(d=.6, lo=300, hi=3000):
    n = noise(d); f = np.linspace(lo, hi, len(n))
    out = np.zeros_like(n); seg = 512
    for i in range(0, len(n), seg):
        c = f[i]; out[i:i + seg] = bp(n[i:i + seg + 0], max(80, c * .6), min(18000, c * 1.4))[:len(out[i:i + seg])]
    e = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    return norm(lp(out * e, 6000)) * .8
def pop():
    t = t_(.09); f = np.linspace(900, 300, len(t)); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .002, curve=7)) * .8
def click(): x = hp(noise(.02), 2000) * env(int(.02 * SR), .0005, curve=12); return norm(x) * .7
def thud():
    t = t_(.35); x = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, len(t))) / SR) * env(len(t), .002, curve=6)
    return norm(x + lp(noise(.35), 400) * .4 * env(len(t), .001, curve=14))
def step(): x = lp(noise(.1), 500) * env(int(.1 * SR), .002, curve=10) + .5 * np.sin(2 * np.pi * 70 * t_(.1)) * env(int(.1 * SR), .002, curve=10); return norm(x) * .8
def swipe(): x = bp(noise(.16), 2500, 8000) * np.sin(np.linspace(0, np.pi, int(.16 * SR))) ** 2; return norm(x) * .5
def notif():
    a = np.concatenate([np.sin(2 * np.pi * 880 * t_(.12)) * env(int(.12 * SR), .003, curve=4), np.sin(2 * np.pi * 1320 * t_(.28)) * env(int(.28 * SR), .003, curve=5)])
    return norm(a) * .7
def ding(f=1200, d=1.2):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * m * t) * w for m, w in [(1, 1), (2.76, .4), (5.4, .2)]) * env(len(t), .002, curve=5)
    return norm(x) * .7
def success():
    out = np.zeros(int(SR * 1.0))
    for i, f in enumerate([523, 659, 784, 1047]):
        place(out, np.sin(2 * np.pi * f * t_(.45)) * env(int(.45 * SR), .004, curve=5) + .3 * np.sin(2 * np.pi * 2 * f * t_(.45)) * env(int(.45 * SR), .004, curve=8), i * .09)
    return norm(out) * .7
def buzz(): t = t_(.4); x = signal.square(2 * np.pi * 140 * t) * .6 + signal.square(2 * np.pi * 147 * t) * .4; return norm(lp(x, 1800) * env(len(t), .005, curve=2)) * .55
def impact():
    t = t_(1.2); x = np.sin(2 * np.pi * np.cumsum(np.linspace(80, 30, len(t))) / SR) * env(len(t), .002, curve=4)
    return norm(x + lp(noise(1.2), 1200) * env(len(t), .001, curve=9) * .6)
def stamp():
    out = np.zeros(int(SR * .4)); place(out, thud() * .8, 0); place(out, bp(noise(.12), 800, 5000) * env(int(.12 * SR), .001, curve=10) * .7, 0); return norm(out)
def dramatic():
    out = np.zeros(int(SR * 1.6))
    for i, f in enumerate([98, 92.5, 87.3]):
        t = t_(.7 if i < 2 else 1.0); x = signal.sawtooth(2 * np.pi * f * t) + signal.sawtooth(2 * np.pi * f * 1.005 * t)
        place(out, lp(x, 700) * env(len(t), .01, curve=3), i * .32)
    return norm(out) * .8
def beep(): return np.sin(2 * np.pi * 1000 * t_(.1)) * env(int(.1 * SR), .003, curve=2) * .5
def chalk(d=.7):
    n = bp(noise(d), 1500, 6000); am = (np.sin(2 * np.pi * 7 * t_(d)) > -.2).astype(float); return norm(lp(am, 60) * n * fade(np.ones(len(n)), .02, .1)) * .45
def laptop(): out = np.zeros(int(SR * 1.2)); place(out, click(), 0); place(out, ding(660, .9) * .5, .25); place(out, ding(990, .8) * .4, .4); return out
def stamp_paper(): return stamp()
def paper(d=.5): return norm(bp(noise(d), 1000, 7000) * (np.abs(np.sin(np.linspace(0, 9, int(d * SR)))) ** 2)) * .4
def plate(): t = t_(.8); return norm(sum(np.sin(2 * np.pi * f * t) * env(len(t), .001, curve=c) for f, c in [(2450, 6), (3720, 8), (5200, 10)])) * .6
def drain(): t = t_(1.0); return norm(np.sin(2 * np.pi * np.cumsum(np.linspace(700, 150, len(t))) / SR) * fade(np.ones(len(t)), .02, .3)) * .45
def strain(): t = t_(1.2); x = signal.sawtooth(2 * np.pi * np.cumsum(np.linspace(70, 55, len(t)) + 3 * np.sin(2 * np.pi * 6 * t)) / SR); return norm(lp(x, 500) * fade(np.ones(len(t)), .1, .4)) * .5
def crumble(): out = np.zeros(int(SR * 1.6)); [place(out, thud() * rng.uniform(.3, .9), rng.uniform(0, 1.1)) for _ in range(14)]; return norm(out) * .8
def chain(): t = t_(1.0); x = sum(np.sin(2 * np.pi * f * t) * env(len(t), .001, curve=c) for f, c in [(1800, 9), (2650, 11), (3900, 13)]); return norm(x + hp(noise(1.0), 3000) * env(len(t), .001, curve=20) * .5) * .8
def cloth(): return norm(lp(noise(.35), 2500) * np.sin(np.linspace(0, np.pi, int(.35 * SR)))) * .4
def clank(): t = t_(.7); return norm(sum(np.sin(2 * np.pi * f * t) * env(len(t), .001, curve=c) for f, c in [(420, 5), (1130, 7), (2210, 9)])) * .6
def send(): return whoosh(.3, 800, 6000) * .6
def glass():
    out = np.zeros(int(SR * 1.4)); place(out, hp(noise(.3), 2000) * env(int(.3 * SR), .001, curve=8), 0)
    for _ in range(26): f = rng.uniform(2500, 7000); d = rng.uniform(.1, .4); place(out, np.sin(2 * np.pi * f * t_(d)) * env(int(d * SR), .001, curve=8) * rng.uniform(.2, .6), rng.uniform(0, .9))
    return norm(out) * .8
def button(): out = np.zeros(int(SR * .4)); place(out, click(), 0); place(out, thud() * .4, .01); return out
def alarmsoft(): out = np.zeros(int(SR * 1.5)); [place(out, ding(1568, .45) * .6, i * .4) for i in range(3)]; return out
def chair(): t = t_(.5); x = signal.sawtooth(2 * np.pi * np.cumsum(220 + 60 * np.sin(2 * np.pi * 3 * t) + rng.standard_normal(len(t)) * 20) / SR); return norm(bp(x, 300, 2000) * fade(np.ones(len(t)), .05, .2)) * .35
def confetti(): out = np.zeros(int(SR * 1.5)); [place(out, pop() * rng.uniform(.2, .6), rng.uniform(0, 1.2)) for _ in range(14)]; place(out, hp(noise(.2), 1500) * env(int(.2 * SR), .001, curve=6), 0); return out
def phonering():
    t = t_(1.6); x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (np.sin(2 * np.pi * 20 * t) > 0)
    x *= (t < .7) | ((t > .9) & (t < 1.6)); return norm(lp(x, 2500)) * .5
def door():
    out = np.zeros(int(SR * 2.0)); t = t_(1.0)
    cr = signal.sawtooth(2 * np.pi * np.cumsum(180 + 120 * np.sin(2 * np.pi * .7 * t) + rng.standard_normal(len(t)) * 30) / SR)
    place(out, norm(bp(cr, 400, 2500)) * .35 * fade(np.ones(len(t)), .1, .3), 0); place(out, thud() * .8, 1.2); return out
def yawn(): return np.zeros(10)
sigh = yawn

# ---------- sons com duração (ambientes) ----------
def birds(d):
    out = np.zeros(int(SR * d)); tt = 0
    while tt < d:
        base = rng.uniform(2500, 4500); n = rng.integers(2, 6)
        for j in range(n):
            dd = rng.uniform(.06, .14); t = t_(dd); f = base + rng.uniform(-400, 900) * np.sin(np.pi * t / dd) + rng.uniform(-500, 500) * t / dd
            place(out, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dd) ** 2 * rng.uniform(.3, 1), tt + j * rng.uniform(.1, .18))
        tt += rng.uniform(.6, 2.2)
    return fade(norm(out) * .5, .5, .8)
def crickets(d):
    out = np.zeros(int(SR * d)); tt = 0
    while tt < d:
        for j in range(3):
            t = t_(.05); place(out, np.sin(2 * np.pi * 4600 * t) * (np.sin(2 * np.pi * 60 * t) > 0) * np.sin(np.pi * t / .05), tt + j * .07)
        tt += rng.uniform(.35, .9)
    return fade(norm(out) * .35, .6, .8)
def office(d):
    x = bp(noise(d), 250, 900) * (0.6 + .4 * lp(np.abs(noise(d)), 2)) ; x = norm(x) * .25
    tt = 0
    while tt < d: place(x, click() * .08, tt); tt += rng.uniform(.06, .3)
    return fade(x, .5, 1)
def street(d):
    x = norm(lp(noise(d), 500)) * .2; tt = rng.uniform(.5, 2)
    while tt < d: place(x, whoosh(2.0, 150, 900) * .35, tt); tt += rng.uniform(2.5, 5)
    return fade(x, .5, 1)
def typing(d):
    out = np.zeros(int(SR * d)); tt = 0
    while tt < d: place(out, (hp(noise(.03), 1500) * env(int(.03 * SR), .0005, curve=10)) * rng.uniform(.3, .8), tt); tt += rng.uniform(.06, .16) + (rng.uniform(.2, .5) if rng.random() < .08 else 0)
    return norm(out) * .45
def scribble(d):
    n = bp(noise(d), 1200, 5000); am = lp((np.sin(2 * np.pi * 9 * t_(d) + 3 * np.sin(2 * np.pi * 1.3 * t_(d))) > 0).astype(float), 40)
    return fade(norm(n * am) * .35, .05, .1)
def tick(d, rate=1.0):
    out = np.zeros(int(SR * d)); tt = 0; i = 0
    while tt < d: place(out, np.sin(2 * np.pi * (2400 if i % 2 else 2000) * t_(.03)) * env(int(.03 * SR), .0005, curve=12) * .5, tt); tt += 1 / rate; i += 1
    return out
def clocktick(d): return tick(d, 1.0)
def clockfast(d): return tick(d, 8.0) * .7
def alarm(d):
    out = np.zeros(int(SR * d)); tt = 0
    while tt < d:
        for j in range(4): place(out, signal.square(2 * np.pi * 2000 * t_(.07)) * .35, tt + j * .12)
        tt += .9
    return lp(out, 6000)
def snore(d):
    t = t_(d); ph = (t * .28) % 1; amp = np.where(ph < .45, np.sin(np.pi * ph / .45), 0)
    x = lp(noise(d), 350) * amp + .3 * signal.sawtooth(2 * np.pi * 38 * t) * amp
    return fade(norm(lp(x, 600)) * .6, .2, .5)
def rise(d): t = t_(d); return fade(norm(np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, len(t))) / SR) * (.6 + .4 * np.sin(2 * np.pi * 8 * t))) * .35, .2, .4)
def loop(d): t = t_(d); return fade(norm((np.sin(2 * np.pi * 220 * t) + .6 * np.sin(2 * np.pi * 330 * t)) * (.5 + .5 * np.sin(2 * np.pi * 1.2 * t))) * .3, .4, .8)
def wind(d): return fade(norm(lp(noise(d), 600) * (.5 + .5 * np.sin(2 * np.pi * .3 * t_(d)))) * .5, .8, 1)
def run(d):
    out = np.zeros(int(SR * d)); tt = 0
    while tt < d: place(out, step(), tt); tt += .16
    return out * .8
def tok():
    t = t_(.1); return np.sin(2 * np.pi * 950 * t) * env(len(t), .001, curve=10) * .6
def marker(): return chalk(.35) * .9

SHORT = dict(transition=lambda: whoosh(.35, 400, 4000) * .5, whoosh=whoosh, pop=pop, step=step, swipe=swipe, marker=marker, tok=tok, thud=thud, notif=notif,
             buzz=buzz, success=success, phonering=phonering, ding=ding, impact=impact, click=click, stamp=stamp, dramatic=dramatic, beep=beep, chalk=chalk,
             laptop=laptop, yawn=yawn, sigh=sigh, door=door, paper=paper, plate=plate, drain=drain, strain=strain, crumble=crumble, chain=chain, cloth=cloth,
             clank=clank, send=send, glass=glass, button=button, alarmsoft=alarmsoft, chair=chair, confetti=confetti)
LONG = dict(birds=birds, crickets=crickets, office=office, street=street, typing=typing, scribble=scribble, tick=lambda d: tick(d), clocktick=clocktick,
            clockfast=clockfast, alarm=alarm, snore=snore, rise=rise, loop=loop, wind=wind, run=run)

def main(cues_path, narr, out):
    d = json.load(open(cues_path)); dur = d['duration']
    fx = np.zeros(int(SR * (dur + 1)))
    for c in d['sfx']:
        if c['gain'] <= 0: continue
        if c['name'] in LONG: x = LONG[c['name']](max(.3, c['dur'] or 1.0))
        elif c['name'] in SHORT: x = SHORT[c['name']]()
        else: print('sem som:', c['name']); continue
        place(fx, x * c['gain'], c['t'])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', narr, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    voice = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    mix = np.zeros_like(fx); mix[:len(voice)] += voice[:len(mix)]
    # "ducking": abaixa os efeitos enquanto há fala
    envv = lp(np.abs(np.pad(voice, (0, max(0, len(fx) - len(voice))))[:len(fx)]), 4)
    duck = 1 - .6 * np.clip(envv / (np.percentile(envv, 90) + 1e-9), 0, 1)
    mix += fx * .4 * duck
    mix = mix / max(1.0, np.max(np.abs(mix)) / .97)
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', out], input=pcm.tobytes(), check=True)
    fxpcm = (np.clip(fx * .4 / max(1, np.max(np.abs(fx * .4)) / .97), -1, 1) * 32767).astype(np.int16)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', out.replace('.wav', '_so_efeitos.wav')], input=fxpcm.tobytes(), check=True)
    print('ok', out, len(mix) / SR)


# ---------- efeitos do vídeo "caos" ----------
def blip(): t = t_(.12); return np.sin(2 * np.pi * np.cumsum(np.linspace(600, 1400, len(t))) / SR) * env(len(t), .002, curve=6) * .5
def rumble(d): t = t_(d); return fade(norm(lp(noise(d), 120) * (.7 + .3 * np.sin(2 * np.pi * .5 * t))) * .7, .4, .6)
def plane_(d): t = t_(d); x = lp(noise(d), 900) * .6 + .3 * signal.sawtooth(2 * np.pi * 110 * t) * (.5 + .5 * np.sin(2 * np.pi * .3 * t)); return fade(norm(lp(x, 1500)) * .5, .5, .8)
def crowd(d):
    out = norm(bp(noise(d), 300, 2500) * (.6 + .4 * lp(np.abs(noise(d)), 3))) * .35
    tt = 0
    while tt < d:
        dd = rng.uniform(.3, .7); t = t_(dd); f = rng.uniform(250, 500) * (1 + .3 * np.sin(np.pi * t / dd))
        v = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dd); place(out, bp(v, 300, 3000) * rng.uniform(.1, .3), tt); tt += rng.uniform(.05, .3)
    return fade(out, .3, .6)
def crowdboo(d): return crowd(d) * .8
def cash(): out = np.zeros(int(SR * .8)); [place(out, np.sin(2 * np.pi * f * t_(.3)) * env(int(.3 * SR), .001, curve=7) * .4, i * .06) for i, f in enumerate([2400, 3100, 2800, 3600])]; return out
def glitch(): out = np.zeros(int(SR * .5)); [place(out, signal.square(2 * np.pi * rng.uniform(200, 2000) * t_(.04)) * .3, i * .05) for i in range(9)]; return out
def weird(d): t = t_(d); return fade(norm(np.sin(2 * np.pi * (220 + 30 * np.sin(2 * np.pi * .7 * t)) * t) + .5 * np.sin(2 * np.pi * (233 + 20 * np.sin(2 * np.pi * .5 * t)) * t)) * .3, .3, .5)
def scratch(): t = t_(.5); return norm(bp(noise(.5), 800, 4000) * np.sin(np.pi * t / .5) * (1 + np.sin(2 * np.pi * 30 * t))) * .6
def siren(d): t = t_(d); f = 650 + 250 * np.sin(2 * np.pi * .9 * t); return fade(norm(np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * .35, .2, .5)
def fire_(d): x = bp(noise(d), 300, 3000) * .3; tt = 0
def fire_(d):
    x = lp(noise(d), 600) * .4; tt = 0
    while tt < d: place(x, hp(noise(.02), 2000) * env(int(.02 * SR), .0005, curve=10) * rng.uniform(.3, 1), tt); tt += rng.uniform(.02, .12)
    return fade(norm(x) * .5, .3, .5)
def explosion(): t = t_(2.0); x = lp(noise(2.0), 600) * env(len(t), .003, curve=3) + np.sin(2 * np.pi * np.cumsum(np.linspace(70, 25, len(t))) / SR) * env(len(t), .003, curve=4); return norm(x) * .95
def rain(d): x = hp(noise(d), 1500) * .25; tt = 0
def rain(d):
    x = norm(bp(noise(d), 1500, 9000)) * .25; tt = 0
    while tt < d: place(x, hp(noise(.01), 3000) * .2 * rng.uniform(.2, 1), tt); tt += rng.uniform(.005, .03)
    return fade(x, .6, .8)
def bell(): t = t_(3.0); return norm(sum(np.sin(2 * np.pi * f * t) * env(len(t), .002, curve=c) * w for f, c, w in [(220, 2, 1), (440, 3, .5), (660, 4, .3), (523, 3, .3)])) * .7
def quake(d): t = t_(d); return fade(norm(lp(noise(d), 90) * 1.5 + .4 * np.sin(2 * np.pi * 35 * t) * lp(np.abs(noise(d)), 5)) * .8, .2, .6)
def newsstinger(): out = np.zeros(int(SR * 1.2)); [place(out, np.sin(2 * np.pi * f * t_(.25)) * env(int(.25 * SR), .002, curve=3) * .5, i * .15) for i, f in enumerate([523, 784, 659, 1047])]; return out
def tvstatic(d): return fade(norm(hp(noise(d), 2000)) * .12, .2, .3)
def heartbeat(d):
    out = np.zeros(int(SR * d)); tt = 0
    while tt < d: place(out, thud() * .8, tt); place(out, thud() * .5, tt + .22); tt += .75
    return lp(out, 300)
def lowdrone(d): t = t_(d); return fade(norm(signal.sawtooth(2 * np.pi * 55 * t) + signal.sawtooth(2 * np.pi * 55.4 * t)) * .25, .8, 1)
def lowdrone2(d): return lp(lowdrone(d), 400)
def powerdown(): t = t_(1.2); return norm(signal.sawtooth(2 * np.pi * np.cumsum(np.linspace(400, 40, len(t))) / SR) * env(len(t), .01, curve=2) ) * .5
def choir(d):
    t = t_(d); x = np.zeros(len(t))
    for f in [261.6, 329.6, 392.0, 523.2]:
        for dt in (-1.5, 0, 1.5): x += signal.sawtooth(2 * np.pi * (f + dt) * t + rng.uniform(0, 6))
    return fade(norm(lp(x, 1800) * (.8 + .2 * np.sin(2 * np.pi * .3 * t))) * .35, .8, 1)
def crack():
    out = np.zeros(int(SR * .6)); place(out, hp(noise(.6), 600) * env(int(.6 * SR), .001, curve=12), 0); place(out, thud() * .6, 0); return norm(out) * .9
def vortex(d): t = t_(d); f = np.linspace(200, 900, len(t)); return fade(norm(bp(noise(d), 200, 2000) * (.5 + .5 * np.sin(2 * np.pi * np.cumsum(f / 100) / SR * 10))) * .45, .3, .5)
def megaphone(): t = t_(1.0); x = signal.square(2 * np.pi * (300 + 40 * np.sin(2 * np.pi * 5 * t)) * t) * np.sin(np.pi * t); return norm(bp(x, 600, 3000)) * .4
def hammer(): out = np.zeros(int(SR * .4)); place(out, clank() * .7, 0); place(out, thud() * .5, 0); return out
def epic(d): t = t_(d); x = signal.sawtooth(2 * np.pi * 65.4 * t) + signal.sawtooth(2 * np.pi * 98 * t) * .7 + signal.sawtooth(2 * np.pi * 130.8 * t) * .5; return fade(norm(lp(x, 700)) * .35, .6, 1)
def pageflip(): t = t_(.35); return norm(bp(noise(.35), 1500, 8000) * np.sin(np.pi * t / .35) ** 3) * .5
def water(d): x = norm(lp(noise(d), 700) * (.6 + .4 * np.sin(2 * np.pi * .25 * t_(d)))) * .45; return fade(x, .6, 1)
def thunder(): t = t_(3.0); x = lp(noise(3.0), 400) * env(len(t), .01, curve=2.5) + hp(noise(3.0), 2000) * env(len(t), .001, curve=20) * .5; return norm(x) * .95

SHORT.update(blip=blip, cash=cash, glitch=glitch, scratch=scratch, explosion=explosion, bell=bell, newsstinger=newsstinger, powerdown=powerdown, crack=crack, megaphone=megaphone, hammer=hammer, pageflip=pageflip, thunder=thunder)
LONG.update(rumble=rumble, plane=plane_, crowd=crowd, crowdboo=crowdboo, weird=weird, siren=siren, fire=fire_, rain=rain, quake=quake, tvstatic=tvstatic, heartbeat=heartbeat, lowdrone=lowdrone2, choir=choir, vortex=vortex, epic=epic, water=water)

# ---------- efeitos do vídeo ENEM ----------
def sink(): t = t_(1.6); x = np.sin(2 * np.pi * np.cumsum(np.linspace(500, 80, len(t))) / SR) * fade(np.ones(len(t)), .02, .5); y = lp(noise(1.6), 500) * env(len(t), .01, curve=2) * .4; return norm(x + y) * .6
def scan(d): t = t_(d); return fade(norm(np.sin(2 * np.pi * (900 + 300 * np.sin(2 * np.pi * 1.5 * t)) * t)) * .25, .1, .2)
def creak(d): return chair() if d < .6 else norm(np.concatenate([chair(), chair()])) * .4
def sparkle(): out = np.zeros(int(SR * 1.0)); [place(out, np.sin(2 * np.pi * rng.uniform(2500, 5000) * t_(.15)) * env(int(.15 * SR), .001, curve=6) * .4, i * .06) for i in range(12)]; return out
def kick(): out = np.zeros(int(SR * .5)); place(out, thud(), 0); place(out, hp(noise(.05), 800) * env(int(.05 * SR), .0005, curve=10) * .6, 0); return out
def whistle(): t = t_(.8); return norm(np.sin(2 * np.pi * (2800 + 120 * (np.sin(2 * np.pi * 30 * t) > 0)) * t) * fade(np.ones(len(t)), .02, .1)) * .4
def drop(): t = t_(.9); return norm(np.sin(2 * np.pi * np.cumsum(np.linspace(1200, 200, len(t))) / SR) * env(len(t), .005, curve=2)) * .5
def falling(): return whoosh(1.2, 2000, 200) * .7
def jump(): t = t_(.35); return norm(np.sin(2 * np.pi * np.cumsum(np.linspace(300, 900, len(t))) / SR) * env(len(t), .005, curve=3)) * .5
def coins(d):
    out = np.zeros(int(SR * d)); tt = 0
    while tt < d: place(out, cash() * rng.uniform(.2, .5), tt); tt += rng.uniform(.08, .25)
    return out
def bonk(): out = np.zeros(int(SR * .6)); place(out, thud(), 0); place(out, np.sin(2 * np.pi * 520 * t_(.4)) * env(int(.4 * SR), .002, curve=6) * .5, 0); return norm(out) * .8
def sad(): out = np.zeros(int(SR * 2.0)); [place(out, lp(signal.sawtooth(2 * np.pi * f * t_(.45)), 1200) * env(int(.45 * SR), .02, curve=2) * .4, i * .4) for i, f in enumerate([392, 370, 349, 330])]; return norm(out) * .6
SHORT.update(sink=sink, sparkle=sparkle, kick=kick, whistle=whistle, drop=drop, falling=falling, jump=jump, bonk=bonk, sad=sad)
LONG.update(scan=scan, creak=creak, coins=coins)

if __name__ == '__main__': main(*sys.argv[1:4])
