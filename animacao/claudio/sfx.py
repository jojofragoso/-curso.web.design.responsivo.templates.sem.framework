"""Efeitos sonoros sintetizados (numpy) para a animação do Cláudio.

Nada é baixado: cada som é gerado por síntese simples e mixado numa
trilha (sfx.wav) com os tempos calculados em montar.py.
"""
import wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def _t(d):
    return np.arange(int(SR * d)) / SR


def _env(n, a=0.005, r=None, curve=4.0):
    """Envelope de ataque rápido e queda exponencial."""
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dur = n / SR
    dec = np.exp(-curve * t / (r if r else dur))
    return att * dec


def _lp(x, alpha):
    """Passa-baixa de um polo; alpha pode variar no tempo (0..1)."""
    y = np.zeros_like(x)
    a = np.broadcast_to(alpha, x.shape)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def _chirp(f0, f1, d, shape='sine'):
    t = _t(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if shape == 'square':
        return np.sign(np.sin(ph))
    if shape == 'saw':
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    return np.sin(ph)


def whoosh(d=0.38, up=True):
    n = int(SR * d)
    noise = rng.standard_normal(n)
    s = np.linspace(0, 1, n)
    sweep = (0.02 + 0.25 * s) if up else (0.27 - 0.25 * s)
    x = _lp(noise, sweep)
    env = np.sin(np.pi * s) ** 2
    return 0.9 * x * env / (np.abs(x).max() + 1e-9)


def pop(f0=500, f1=1300, d=0.09):
    x = _chirp(f0, f1, d)
    return 0.8 * x * _env(len(x), 0.002, d, 5)


def tap():
    n = int(SR * 0.05)
    click = rng.standard_normal(n) * _env(n, 0.0005, 0.01, 6)
    thump = np.sin(2 * np.pi * 180 * _t(0.05)) * _env(n, 0.001, 0.05, 6)
    return 0.6 * click + 0.7 * thump


def like():
    a = pop(700, 1500, 0.08)
    sp = np.zeros(int(SR * 0.35))
    for k, f in enumerate([1568, 2093, 2637]):
        s = int(SR * 0.04 * (k + 1))
        tone = np.sin(2 * np.pi * f * _t(0.2)) * _env(int(SR * 0.2), 0.002, 0.2, 6)
        sp[s:s + len(tone)] += 0.35 * tone
    out = np.zeros(len(sp))
    out[:len(a)] += a
    return out + sp


def unlike():
    x = _chirp(900, 260, 0.22)
    return 0.8 * x * _env(len(x), 0.003, 0.22, 3)


def msg_in():
    out = np.zeros(int(SR * 0.45))
    for k, f in enumerate([988, 1319]):
        s = int(SR * 0.09 * k)
        tone = (np.sin(2 * np.pi * f * _t(0.35)) + 0.3 * np.sin(4 * np.pi * f * _t(0.35)))
        tone *= _env(len(tone), 0.003, 0.35, 5)
        out[s:s + len(tone)] += 0.45 * tone
    return out


def msg_out():
    x = _chirp(420, 1100, 0.14)
    return 0.6 * x * _env(len(x), 0.005, 0.14, 3) + 0.3 * np.pad(whoosh(0.14), (0, 0))


def stinger():
    d = 1.6
    t = _t(d)
    boom = np.sin(2 * np.pi * 55 * t * (1 - 0.3 * t / d)) * np.exp(-3 * t)
    cl = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) for f in [622, 659, 932, 988])
    trem = 0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)
    strings = 0.18 * cl * trem * np.clip(t / 0.05, 0, 1) * np.exp(-1.6 * t)
    return 0.9 * boom + strings


def shutter():
    out = np.zeros(int(SR * 0.16))
    for s in (0, int(SR * 0.07)):
        n = int(SR * 0.04)
        out[s:s + n] += rng.standard_normal(n) * _env(n, 0.0005, 0.03, 6) * 0.7
    return out


def wrong():
    x = 0.5 * _chirp(160, 150, 0.45, 'square') + 0.3 * _chirp(240, 225, 0.45, 'square')
    x = _lp(x, 0.25)
    return x * _env(len(x), 0.01, 0.6, 2.5)


def tada():
    out = np.zeros(int(SR * 1.3))
    n = int(SR * 0.12)
    out[:n] += rng.standard_normal(n) * _env(n, 0.001, 0.1, 5) * 0.6  # estouro do confete
    for k, f in enumerate([523, 659, 784, 1047]):
        s = int(SR * (0.08 + 0.09 * k))
        d = 0.9 if k == 3 else 0.25
        tt = _t(d)
        tone = _lp(_chirp(f, f, d, 'saw'), 0.2) + 0.5 * np.sin(2 * np.pi * f * tt)
        out[s:s + len(tone)] += 0.35 * tone * _env(len(tone), 0.005, d, 3)
    return out


def horn():
    d = 1.5
    t = _t(d)
    x = _chirp(110, 108, d, 'saw') + 0.7 * _chirp(165, 162, d, 'saw')
    x = _lp(x, 0.06)
    env = np.clip(t / 0.15, 0, 1) * np.clip((d - t) / 0.3, 0, 1)
    return 1.6 * x * env


def ticks(d=0.7):
    out = np.zeros(int(SR * d))
    for k in range(8):
        s = int(SR * d * k / 8)
        n = int(SR * 0.015)
        out[s:s + n] += rng.standard_normal(n) * _env(n, 0.0005, 0.01, 6) * 0.3
    return out


def gulp():
    x = _chirp(380, 110, 0.25)
    return 0.8 * x * _env(len(x), 0.01, 0.25, 2)


def sparkle():
    out = np.zeros(int(SR * 0.6))
    for k, f in enumerate([2093, 2637, 3136, 4186]):
        s = int(SR * 0.06 * k)
        tone = np.sin(2 * np.pi * f * _t(0.3)) * _env(int(SR * 0.3), 0.002, 0.3, 6)
        out[s:s + len(tone)] += 0.22 * tone
    return out


def bell():
    d = 1.2
    t = _t(d)
    x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(880, 1), (1760, .4), (2640, .2)])
    return 0.45 * x * np.exp(-3.5 * t)


def build(events, total, path='sfx.wav'):
    """events: lista de (tempo_em_s, nome_do_som, volume)."""
    mix = np.zeros(int(SR * (total + 2)))
    cache = {}
    for at, name, vol in events:
        if name not in cache:
            cache[name] = globals()[name]()
        snd = cache[name]
        s = int(SR * max(0, at))
        e = min(len(mix), s + len(snd))
        mix[s:e] += vol * snd[:e - s]
    mix = mix[:int(SR * total)]
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    pcm = (mix * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
