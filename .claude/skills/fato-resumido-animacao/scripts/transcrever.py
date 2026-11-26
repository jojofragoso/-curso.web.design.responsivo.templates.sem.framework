"""Transcreve narração (pt-BR) com tempos por palavra.
uso: HF_HUB_DISABLE_XET=1 python3 transcrever.py audio.(mp3|mp4|wav) saida.json [modelo=medium]
Precisa de faster-whisper e acesso a huggingface.co + us.aws.cdn.hf.co (download do modelo na 1a vez)."""
import sys,json,subprocess,tempfile,wave,numpy as np
from faster_whisper import WhisperModel
src,out=sys.argv[1],sys.argv[2];mdl=sys.argv[3] if len(sys.argv)>3 else 'medium'
tmp=tempfile.mktemp(suffix='.wav');subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-ac','1','-ar','16000',tmp],check=True)
w=wave.open(tmp);a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
m=WhisperModel(mdl,device='cpu',compute_type='int8')
segs,_=m.transcribe(a,language='pt',word_timestamps=True,beam_size=5)
res=[dict(s=s.start,e=s.end,t=s.text.strip(),w=[(x.start,x.end,x.word.strip()) for x in s.words]) for s in segs]
json.dump(res,open(out,'w'),ensure_ascii=False,indent=0)
for r in res:print(f"{r['s']:6.2f} {r['e']:6.2f} {r['t']}")
