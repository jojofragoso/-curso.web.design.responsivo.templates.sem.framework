import re, json, subprocess, sys
text = open('roteiro.txt').read().strip()
paras = [p.strip() for p in text.split('\n\n') if p.strip()]
def spoken(p):
    p = p.replace('9h47','nove e quarenta e sete').replace('15h30','quinze e trinta').replace('23h52','vinte e três e cinquenta e dois').replace('9h30','nove e trinta').replace('23','vinte e três')
    return re.sub(r'[^\wÀ-ú ]','',p)
L = [len(spoken(p)) for p in paras]
out = subprocess.run(['ffmpeg','-v','info','-i','assets/narracao.mp3','-af','silencedetect=noise=-35dB:d=0.25','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]
en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
dur = 467.9575
sil = [(s,e) for s,e in zip(st,en) if s>0.5]   # candidate boundaries (pausas)
# speech time per char
speech = dur - sum(e-s for s,e in sil) - 1.0
r = speech/sum(L)
N, S = len(paras), len(sil)
INF = 1e18
# dp[i][j]: paragraphs 0..i-1 done, para i-1 ends at silence j-1 (j=0 means start)
import math
pos = [0.0]+[e for s,e in sil]    # start time after boundary j
endt = [s for s,e in sil]
best = [[INF]*(S+1) for _ in range(N+1)]; prev=[[None]*(S+1) for _ in range(N+1)]
best[0][0]=0
startpos=[0.9]+[e for s,e in sil]
for i in range(1,N+1):
    exp = L[i-1]*r
    for j in range(1,S+1):
        e_t = endt[j-1]
        if i==N: pass
        for jp in range(0,j):
            if best[i-1][jp]>=INF: continue
            st0 = startpos[jp]
            d = e_t - st0
            if d<=0: continue
            # internal silences inside paragraph add to duration
            inner = sum(sil[k][1]-sil[k][0] for k in range(jp, j-1))
            c = ((d-inner) - exp)**2/ (exp+1) - 0.8*(sil[j-1][1]-sil[j-1][0])
            v = best[i-1][jp]+c
            if v<best[i][j]: best[i][j]=v; prev[i][j]=jp
# last paragraph must end at last silence or end of audio: choose best j
j = min(range(S+1), key=lambda j: best[N][j] + (0 if j==S else 50*(dur-endt[j-1])**0 * (S-j)))
res=[]; i=N
while i>0:
    jp=prev[i][j]; res.append((startpos[jp], endt[j-1])); j=jp; i-=1
res.reverse()
json.dump([{'i':k,'t0':round(a,2),'t1':round(b,2),'text':paras[k]} for k,(a,b) in enumerate(res)], open('timing.json','w'), ensure_ascii=False, indent=0)
for k,(a,b) in enumerate(res): print(f"{k:3d} {a:7.2f} {b:7.2f} {b-a:5.1f} exp {L[k]*r:5.1f} | {paras[k][:60]}")
