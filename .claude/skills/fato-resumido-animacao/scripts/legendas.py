"""Gera CAPS no estilo da referência: 1 a 3 palavras por vez, MAIÚSCULAS, 1 palavra-chave em *destaque* (dourado).
uso: python3 legendas.py transcricao.json caps.js [max_palavras=3] [max_chars=18]
Destaque automático: a palavra mais "forte" do grupo (nome próprio, número, palavra longa). Revise à mão depois."""
import sys,json,re
tr=json.load(open(sys.argv[1]));MW=int(sys.argv[3]) if len(sys.argv)>3 else 3;MC=int(sys.argv[4]) if len(sys.argv)>4 else 18
STOP=set('a o as os um uma de da do das dos e é em no na nos nas que se por para pra com sem ao à mais mas ou já foi era ele ela isso esse essa seu sua'.split())
W=[x for s in tr for x in s['w']]
groups=[];cur=[]
for i,(a,b,w) in enumerate(W):
    if cur and (len(cur)>=MW or len(' '.join(x[2] for x in cur+[[a,b,w]]))>MC or a-cur[-1][1]>.3):groups.append(cur);cur=[]
    cur.append([a,b,w])
    if re.search(r'[.,?!:;]$',w):groups.append(cur);cur=[]
if cur:groups.append(cur)
def score(w):
    c=re.sub(r'[^\wÀ-ÿ]','',w);
    if not c or c.lower() in STOP:return -1
    return (5 if c[0].isupper() else 0)+(6 if any(ch.isdigit() for ch in c) else 0)+len(c)*.3
caps=[]
for g in groups:
    ws=[x[2] for x in g];k=max(range(len(ws)),key=lambda i:score(ws[i]))
    if score(ws[k])>2.2:ws[k]='*'+ws[k]+'*'
    caps.append([round(g[0][0],2),round(g[-1][1],2),' '.join(ws).replace('*','*')])
for i in range(len(caps)-1):caps[i][1]=round(min(caps[i+1][0]-.01,caps[i][1]+.3),2)
open(sys.argv[2],'w').write('window.CAPS='+json.dumps(caps,ensure_ascii=False)+';\n');print(len(caps),'legendas')
