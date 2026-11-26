"""Efeitos sonoros + trilha suave sintetizados (sem internet, sem direitos autorais).
uso: python3 sfx.py deixas.json saida.wav duracao_seg [trilha=1]
deixas.json = [[tempo, "tipo", ganho], ...]  tipos: whoosh pop ching thud chime splash crowd drum tick err knock swoosh_up
Mixagem final (narração por cima):
 ffmpeg -i mudo.mp4 -i narracao.(mp4|mp3) -i sfx.wav -filter_complex "[1:a]apad[a0];[2:a]volume=0.35,apad[a1];[a0][a1]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t DURACAO -movflags +faststart final.mp4"""
import sys,json,wave,numpy as np
cues=json.load(open(sys.argv[1]));out_p=sys.argv[2];T=float(sys.argv[3]);music=len(sys.argv)<5 or sys.argv[4]!='0'
sr=44100;N=int((T+1)*sr);out=np.zeros(N);R=np.random.default_rng(3)
tt=lambda d:np.arange(int(d*sr))/sr
def add(sig,t0,g=1):
    i=int(t0*sr);n=min(len(sig),N-i)
    if n>0 and i>=0:out[i:i+n]+=sig[:n]*g
def noise(d):return R.normal(0,1,int(d*sr))
def lp(x,k=30):return np.convolve(x,np.ones(k)/k,'same')
S={
 'whoosh':lambda:lp(noise(.5),25)*np.sin(np.linspace(0,np.pi,int(.5*sr)))**2*3,
 'swoosh_up':lambda:lp(noise(.7),12)*np.linspace(0,1,int(.7*sr))**2*np.r_[np.ones(int(.6*sr)),np.linspace(1,0,int(.1*sr))]*3,
 'pop':lambda:(lambda t:np.sin(2*np.pi*(500+1800*t)*t)*np.exp(-t*30))(tt(.15)),
 'ching':lambda:(lambda t:(np.sin(2*np.pi*2637*t)+.6*np.sin(2*np.pi*3520*t))*np.exp(-t*7))(tt(.6)),
 'thud':lambda:(lambda t:np.sin(2*np.pi*(85-45*t)*t)*np.exp(-t*12))(tt(.35))*1.5,
 'drum':lambda:(lambda t:np.sin(2*np.pi*(60-20*t)*t)*np.exp(-t*8)+lp(noise(.5),5)[:len(t)]*np.exp(-t*20)*.3)(tt(.5)),
 'tick':lambda:(lambda t:np.sin(2*np.pi*2200*t)*np.exp(-t*80))(tt(.05)),
 'err':lambda:(lambda t:np.sign(np.sin(2*np.pi*180*t))*.5*((t<.2)|(t>.27))*np.exp(-t*2))(tt(.5)),
 'knock':lambda:(lambda t:(np.sin(2*np.pi*140*t)+R.normal(0,.5,len(t)))*np.exp(-t*55))(tt(.12)),
 'splash':lambda:lp(noise(1.2),6)*np.exp(-tt(1.2)*3)*1.4,
 'crowd':lambda:lp(noise(3),40)*np.minimum(1,np.minimum(tt(3)/.5,(3-tt(3))/.8))*4,
 'chime':lambda:sum((lambda t,i:np.r_[np.zeros(i),np.sin(2*np.pi*f*t[:len(t)-i])*np.exp(-t[:len(t)-i]*3)*.5])(tt(1.6),int(k*.07*sr)) for k,f in enumerate([1047,1319,1568,2093])),
}
for c in cues:
    t0,kind=c[0],c[1];g=c[2] if len(c)>2 else .4
    add(S[kind](),t0,g)
if music:  # trilha documental suave (Lá menor – Fá – Dó – Sol), 90 bpm
    mf=lambda m:440*2**((m-69)/12);beat=60/90;ch=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];t=0;b=0;mus=np.zeros(N)
    while t<T:
        d=beat*4;x=tt(d);c=ch[b%4];pad=sum(np.sin(2*np.pi*mf(m)*x)+.25*np.sin(2*np.pi*mf(m)*2*x) for m in c)*np.minimum(1,x/.5)*np.minimum(1,(d-x)/.5)
        i=int(t*sr);n=min(len(pad),N-i);mus[i:i+n]+=pad[:n]*.045
        for k in range(4):
            y=tt(.28);j=int((t+k*beat)*sr);m_=min(len(y),N-j)
            if m_>0:mus[j:j+m_]+=(np.sin(2*np.pi*(55-30*y)*y)*np.exp(-y*14)*.22)[:m_]
        t+=d;b+=1
    tm=np.arange(N)/sr;mus*=np.clip(tm/1.5,0,1)*np.clip((T-tm)/1.5,0,1);out+=mus
out=out/max(1e-9,np.max(np.abs(out)))*.85
w=wave.open(out_p,'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((out*32767).astype(np.int16).tobytes());w.close();print('ok',out_p)
