import re, json, subprocess
text = open('roteiro.txt').read().strip().replace('\n\n',' ')
sents = [s.strip() for s in re.split(r'(?<=[.?!”:])\s+', text) if s.strip()]
def spoken(p): return re.sub(r'[^\wÀ-ú ]','',p)
L = [len(spoken(p)) for p in sents]
out = subprocess.run(['ffmpeg','-v','info','-i','assets/narracao.mp3','-af','silencedetect=noise=-35dB:d=0.18','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
dur = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','assets/narracao.mp3'],capture_output=True,text=True).stdout)
sil = [(s,e) for s,e in zip(st,en) if s>0.3]
if not sil or sil[-1][1] < dur-0.05: sil.append((dur,dur))
first = en[0] if st and st[0] < 0.05 else 0.0
speech = dur - sum(e-s for s,e in sil) - first; r = speech/sum(L)
N,S=len(sents),len(sil); INF=1e18
startpos=[first]+[e for s,e in sil]; endt=[s for s,e in sil]
best=[[INF]*(S+1) for _ in range(N+1)]; prev=[[None]*(S+1) for _ in range(N+1)]; best[0][0]=0
for i in range(1,N+1):
    exp=L[i-1]*r
    for j in range(1,S+1):
        for jp in range(max(0,j-8),j):
            if best[i-1][jp]>=INF: continue
            d=endt[j-1]-startpos[jp]
            if d<=0: continue
            inner=sum(sil[q][1]-sil[q][0] for q in range(jp,j-1))
            c=((d-inner)-exp)**2/(exp+1)-1.2*(sil[j-1][1]-sil[j-1][0])
            if best[i-1][jp]+c<best[i][j]: best[i][j]=best[i-1][jp]+c; prev[i][j]=jp
j=S; res=[]; i=N
while i>0: jp=prev[i][j]; res.append((startpos[jp],endt[j-1])); j=jp; i-=1
res.reverse()
json.dump([{'i':k,'t0':round(a,2),'t1':round(b,2),'text':sents[k]} for k,(a,b) in enumerate(res)],open('timing.json','w'),ensure_ascii=False,indent=0)
for k,(a,b) in enumerate(res): print(f"{k:3d} {a:6.2f} {b:6.2f} {b-a:4.1f}/{L[k]*r:4.1f} {sents[k][:70]}")
print(dur)
