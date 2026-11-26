/* =====================================================================
   FATO RESUMIDO – motor de animação "estilo ilustrado plano" (vertical)
   Canvas 1080x1920 · SVG · render(t) determinístico (mesmo t = mesmo quadro)
   Uso: o arquivo de cenas define window.SCENES, window.CAPS, window.HUD e
   window.TOTAL, depois chama Engine.boot().  Ver SKILL.md.
   ===================================================================== */
(function(){
const W=1080,H=1920;
/* ---------- paleta (medida do vídeo de referência) ---------- */
const P={
 sand:'#cfb88f',sandL:'#f0e1c4',sandD:'#baa47e',sandDD:'#9e8462',
 ochre:'#bd8641',ochreL:'#e0a86c',brown:'#8c5227',brownD:'#672814',ink:'#301c0f',
 sea:'#1b5770',seaD:'#0d3f56',seaL:'#417481',foam:'#e9f2f0',
 wine:'#6d3237',wineL:'#8a3a4a',gold:'#e2a955',goldD:'#b8862e',
 cream:'#f4ead6',white:'#fbf6ec',sky:'#e8d9bc',skyB:'#9fc2cf',
 skinA:'#f0c08e',skinB:'#e2a877',skinC:'#c98a5a',skinD:'#9a6440',skinE:'#6e4529',
 hair:'#3a2416',hairL:'#6a4428',laurel:'#8fa83a',laurelD:'#5f7a22',
 red:'#a8332a',blue:'#2f5a8a',green:'#4f7a3a'
};
/* ---------- utilitários ---------- */
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,x)=>a+(b-a)*x;
const ease=x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},eOut=x=>1-Math.pow(1-cl(x),3),eIn=x=>Math.pow(cl(x),3);
const pg=(t,a,d)=>cl((t-a)/d);
const pop=x=>{x=cl(x);if(x<=0)return 0;const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.round(cl(r*k,0,255));g=Math.round(cl(g*k,0,255));b=Math.round(cl(b*k,0,255));return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)};
const G=(inner,tr='',extra='')=>`<g transform="${tr}" ${extra}>${inner}</g>`;
const R=(x,y,w,h,f,rx=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${extra}/>`;
const C=(x,y,r,f,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${extra}/>`;
const E=(x,y,rx,ry,f,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${extra}/>`;
const Pa=(d,f,extra='')=>`<path d="${d}" fill="${f}" ${extra}/>`;
const T=(x,y,s,txt,f,extra='')=>`<text x="${x}" y="${y}" font-size="${s}" fill="${f}" font-family="CalSans" text-anchor="middle" ${extra}>${txt}</text>`;

/* =====================================================================
   CENÁRIOS (blocos de fundo reutilizáveis)
   ===================================================================== */
const BG={
 /* céu quente com nuvens fofas */
 sky(t,{top=P.sky,bot=P.sandL,clouds=true}={}){let s=`<defs><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>`+R(-200,-200,W+400,H+400,'url(#gsky)');
  if(clouds)for(let i=0;i<4;i++){const R_=rng(i+3);const x=((R_()*W*1.4+t*(8+i*3))%(W*1.4))-200,y=80+R_()*380;s+=G(E(0,0,110,46,'#fbf2e2')+E(70,-24,80,50,'#fbf2e2')+E(-70,-10,70,38,'#fbf2e2')+E(0,26,140,22,'#efe0c6'),`translate(${x} ${y})`,'opacity=".9"')}return s},
 /* mar em camadas, ondas animadas */
 sea(t,y0=760,{col=P.sea,deep=P.seaD}={}){let s=R(-200,y0,W+400,H,col);for(let k=0;k<6;k++){const yy=y0+k*190;let d=`M-200 ${yy}`;for(let x=-200;x<=W+200;x+=60)d+=` L${x} ${yy+Math.sin(x*.012+t*1.4+k)*10}`;d+=` L${W+200} ${H+200} L-200 ${H+200}Z`;s+=Pa(d,shade(col,1-k*.07))}
  for(let i=0;i<18;i++){const R_=rng(i*7+1);const x=((R_()*W+t*25*(R_()-.5))%W+W)%W,y=y0+40+R_()*(H-y0);s+=R(x,y,40+R_()*60,5,P.foam,3,`opacity="${.25+.3*Math.abs(Math.sin(t+i))}"`)}return s},
 /* areia da arena */
 sand(t,y0=1100){let s=R(-200,y0,W+400,H,P.sand);for(let i=0;i<30;i++){const R_=rng(i*5+2);s+=E(R_()*W,y0+20+R_()*(H-y0),20+R_()*50,3,P.sandD,'opacity=".5"')}return s},
 /* arquibancada com multidão (rows de cabecinhas coloridas) */
 crowd(t,y0=0,rows=8,{rowH=70,blur=0,cheer=0,seed=1,wall=P.sandL}={}){let s=R(-200,y0,W+400,rows*rowH+20,shade(wall,.92));const cols=['#a8332a','#2f5a8a','#4f7a3a','#e2a955','#6d3237','#f4ead6','#417481','#8c5227'];
  for(let r=0;r<rows;r++){const yy=y0+r*rowH;s+=R(-200,yy+rowH-14,W+400,14,shade(wall,.82));const R_=rng(r*31+seed);for(let x=-40;x<W+40;x+=26+R_()*6){const c=cols[Math.floor(R_()*cols.length)];const sk=[P.skinA,P.skinB,P.skinC,P.skinD][Math.floor(R_()*4)];const j=cheer?Math.max(0,Math.sin(t*9+x*.07+r))*cheer*8:0;
   s+=R(x-9,yy+rowH-44-j,18,30,c,6)+C(x,yy+rowH-50-j,9,sk)}}
  return blur?G(s,'',`filter="url(#blur${blur})"`):s},
 /* parede de arcos (arena / prédio antigo) */
 arches(y0,h,{col=P.ochre,n=8,dark=P.ink}={}){let s=R(-200,y0,W+400,h,col)+R(-200,y0,W+400,18,shade(col,1.15))+R(-200,y0+h-18,W+400,18,shade(col,.8));const w=W/n;for(let i=0;i<=n;i++){const x=i*w-w/2+w*.2;s+=Pa(`M${x} ${y0+h-20} L${x} ${y0+h*.45} A${w*.3} ${w*.3} 0 0 1 ${x+w*.6} ${y0+h*.45} L${x+w*.6} ${y0+h-20}Z`,dark,'opacity=".85"')}return s},
 /* piso/parede liso com faixa decorativa */
 band(y,h,col,{stripe=P.wine}={}){return R(-200,y,W+400,h,col)+R(-200,y+8,W+400,10,stripe)+R(-200,y+h-18,W+400,10,shade(col,.8))}
};

/* =====================================================================
   PERSONAGEM (cabeça grande, olhos de ponto, sombra lateral, traços simples)
   opções: skin, hair('short'|'curly'|'bald'|'long'|'none'), hairCol, beard, laurel,
   helmet(cor), outfit(cor), sash(cor), mouth('closed'|'open'|'smile'|'shout'),
   blink(0..1), look(-1..1), arm('down'|'up'|'point'|'wave'), armK(0..1)
   ===================================================================== */
function person(o={}){o=Object.assign({skin:P.skinA,hair:'short',hairCol:P.hair,beard:null,laurel:false,helmet:null,outfit:P.white,sash:P.wine,mouth:'closed',blink:0,look:0,arm:'down',armK:1,s:1},o);
 const sk=o.skin,skD=shade(sk,.86),skDD=shade(sk,.72);let s='';
 // corpo / toga
 s+=Pa('M-230 520 Q-215 300 -120 250 L120 250 Q215 300 230 520 Z',o.outfit)+Pa('M120 250 Q215 300 230 520 L60 520 Z',shade(o.outfit,.9));
 if(o.sash)s+=Pa('M-150 270 L-90 250 L170 520 L80 520 Z',o.sash)+Pa('M-150 270 L-120 262 L120 520 L80 520Z',shade(o.sash,1.12),'opacity=".5"');
 // braço
 const ak=o.armK;let ang=0;if(o.arm==='up')ang=-150*ak;else if(o.arm==='point')ang=-95*ak;else if(o.arm==='wave')ang=-140*ak+Math.sin(ak*20)*0;
 s+=G(R(-38,0,76,250,shade(o.outfit,.96),38)+C(0,262,40,sk),`translate(-175 300) rotate(${ang})`);
 // pescoço
 s+=R(-48,150,96,120,skD,20);
 // cabeça
 s+=R(-135,-150,270,320,sk,120)+Pa('M40 -150 Q135 -150 135 0 L135 40 Q135 170 40 170 Z',skD,'opacity=".55"');
 s+=E(-140,20,26,40,skD)+E(140,20,26,40,skDD);
 // cabelo
 const hc=o.hairCol;
 if(o.hair==='short')s+=Pa('M-140 -20 Q-150 -175 0 -180 Q150 -175 140 -20 Q120 -110 0 -115 Q-120 -110 -140 -20Z',hc);
 if(o.hair==='curly'){for(let i=0;i<9;i++){const a=Math.PI*(1.05+i*.1);s+=C(Math.cos(a)*130,-30+Math.sin(a)*140,42,hc)}}
 if(o.hair==='long')s+=Pa('M-150 120 Q-170 -180 0 -185 Q170 -180 150 120 L110 120 Q120 -100 0 -110 Q-120 -100 -110 120Z',hc);
 if(o.hair==='bald')s+=Pa('M-138 10 Q-140 -50 -110 -70 L-110 40Z',hc)+Pa('M138 10 Q140 -50 110 -70 L110 40Z',hc);
 if(o.beard)s+=Pa('M-135 30 Q-130 200 0 215 Q130 200 135 30 Q120 120 60 110 Q0 95 -60 110 Q-120 120 -135 30Z',o.beard);
 if(o.helmet)s+=Pa('M-150 -10 Q-160 -200 0 -205 Q160 -200 150 -10 L170 -5 L170 20 L-170 20 L-170 -5Z',o.helmet)+Pa('M-20 -205 Q0 -290 40 -260 Q20 -230 20 -205Z',P.red)+R(-150,-12,300,22,shade(o.helmet,.8),8);
 if(o.laurel){for(let i=0;i<9;i++){const a=Math.PI*(1.08+i*.105);const x=Math.cos(a)*145,y=-40+Math.sin(a)*120;s+=E(x,y,26,13,i%2?P.laurel:P.laurelD,`transform="rotate(${a*180/Math.PI+90} ${x} ${y})"`)}}
 // olhos (pontos), sobrancelhas, nariz, boca
 const lx=o.look*10,bl=1-cl(o.blink);
 s+=E(-55+lx,10,13,15*bl+.5,P.ink)+E(55+lx,10,13,15*bl+.5,P.ink)+C(-51+lx,5,3.5*bl,'#fff')+C(59+lx,5,3.5*bl,'#fff');
 s+=R(-85,-40,60,10,shade(hc,.9),5)+R(25,-40,60,10,shade(hc,.9),5);
 s+=Pa('M5 15 L-28 95 L22 95 Z',skDD,'opacity=".75"');
 if(o.mouth==='closed')s+=R(-22,125,44,8,shade(sk,.55),4);
 if(o.mouth==='smile')s+=Pa('M-30 120 Q0 148 30 120 Q0 134 -30 120Z',shade(sk,.45));
 if(o.mouth==='open')s+=E(0,132,18,15,'#5a2020');
 if(o.mouth==='shout')s+=E(0,135,30,26,'#5a2020')+R(-20,112,40,8,'#fff',3);
 return G(s,`scale(${o.s})`)}
/* figura pequena de corpo inteiro (multidão em primeiro plano, soldados) */
function mini(o={}){o=Object.assign({skin:P.skinB,col:P.red,helmet:null,s:1,arm:0},o);let s=R(-22,0,44,70,o.col,16)+C(0,-20,24,o.skin)+E(-8,-22,3,4,P.ink)+E(8,-22,3,4,P.ink);if(o.helmet)s+=Pa('M-26 -22 Q-26 -52 0 -52 Q26 -52 26 -22Z',o.helmet);s+=G(R(-6,0,12,46,o.col,6),`translate(22 8) rotate(${-o.arm})`);return G(s,`scale(${o.s})`)}

/* =====================================================================
   SOBREPOSIÇÕES (HUD) – títulos, capítulo, rótulo de lugar/ano, contador
   ===================================================================== */
const HUD={
 title(l1,l2,k=1){if(k<=0)return '';const y=180;return G(T(W/2,y,96,l1,P.white,'stroke="#2a1a0e" stroke-width="10" paint-order="stroke"')+T(W/2,y+100,104,l2,P.gold,'stroke="#2a1a0e" stroke-width="10" paint-order="stroke"'),`translate(0 ${(1-eOut(k))*-40})`,`opacity="${cl(k)}"`)},
 chapter(n,m,icons=[],y=440,k=1){if(k<=0)return '';let s=T(W/2,y,42,`PARTE ${n} DE ${m}`,P.white,'stroke="#2a1a0e" stroke-width="6" paint-order="stroke"');const gap=86,x0=W/2-(m-1)*gap/2;for(let i=0;i<m;i++){const on=i<n;s+=C(x0+i*gap,y+64,32,on?'#2a1a0e':'rgba(20,14,8,.55)',on?`stroke="${P.gold}" stroke-width="5"`:'stroke="rgba(255,255,255,.25)" stroke-width="3" stroke-dasharray="6 6"');if(on&&icons[i])s+=T(x0+i*gap,y+80,40,icons[i],P.cream)}return G(s,'',`opacity="${cl(k)}"`)},
 place(txt,sub='',k=1,y=150){if(k<=0)return '';const w=Math.max(360,txt.length*34);return G(T(W/2,y,66,txt,P.white,'stroke="#2a1a0e" stroke-width="8" paint-order="stroke"')+R(W/2-w/2,y+22,w*eOut(k),5,P.gold,2,`opacity=".9"`)+(sub?T(W/2,y+64,30,sub.toUpperCase(),P.cream,'letter-spacing="3" stroke="#2a1a0e" stroke-width="4" paint-order="stroke"'):''),`translate(0 ${(1-eOut(k))*-20})`,`opacity="${cl(k*1.5)}"`)},
 counter(val,label,k=1,y=200){if(k<=0)return '';return G(T(W/2,y,110,val,P.white,'stroke="#2a1a0e" stroke-width="10" paint-order="stroke"')+T(W/2,y+62,40,label,P.cream,'stroke="#2a1a0e" stroke-width="5" paint-order="stroke"'),'',`opacity="${cl(k)}"`)},
 question(k=1,y=520,t=0){if(k<=0)return '';return G(T(0,0,260,'?',P.gold,'stroke="#2a1a0e" stroke-width="12" paint-order="stroke"'),`translate(${W/2} ${y+Math.sin(t*3)*8}) scale(${pop(k)})`)},
 endcard(k=1,txt='VÍDEO COMPLETO',sub='NO CANAL'){if(k<=0)return '';return G(R(-50,-50,W+100,H+100,'rgba(40,14,8,.55)')+T(W/2,330,92,txt,P.white,'stroke="#2a1a0e" stroke-width="8" paint-order="stroke"')+R(W/2-220,358,440,5,P.gold)+T(W/2,410,34,sub,P.cream,'letter-spacing="4"'),'',`opacity="${cl(k)}"`)}
};

/* =====================================================================
   NÚCLEO: câmera por cena, transição (dissolve/pan), grão, vinheta, legenda
   ===================================================================== */
const svgEl=()=>document.getElementById('stage');
const defs=`<defs><filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter><filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter><filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="SEED"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .3  0 0 0 .09 0"/></filter>
 <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0c04" stop-opacity=".38"/></radialGradient></defs>`;
function camWrap(inner,cam){const z=cam.z||1,x=cam.x||0,y=cam.y||0,r=cam.r||0;return G(inner,`translate(${W/2} ${H/2}) scale(${z}) rotate(${r}) translate(${-W/2-x} ${-H/2-y})`)}
function sceneAt(t){const S=window.SCENES;let i=S.findIndex(s=>t>=s.t0&&t<s.t1);if(i<0)i=S.length-1;return i}
/* legenda karaokê: CAPS = [[t0,t1,'TEXTO COM *DESTAQUE*'], ...] – 1 a 3 palavras por item */
function caption(t){const c=(window.CAPS||[]).find(c=>t>=c[0]&&t<c[1]);if(!c)return '';const k=pg(t,c[0],.12);
 const html=c[2].toUpperCase().replace(/\*(.+?)\*/g,`<span style="color:${P.gold}">$1</span>`);return `<div class="cap" style="opacity:${cl(k*1.4)};transform:translate(-50%,0) scale(${.88+.12*eOut(k/.9)})">${html}</div>`}
function render(t){const S=window.SCENES;const i=sceneAt(t);const s=S[i];const L=t-s.t0;
 let body=camWrap(s.draw(L,t),s.cam?s.cam(L,t):{});
 // dissolve / pan para a próxima cena
 const nx=S[i+1];const X=s.xfade??.45;if(nx&&t>s.t1-X){const k=ease((t-(s.t1-X))/X);const nb=camWrap(nx.draw(t-nx.t0,t),nx.cam?nx.cam(t-nx.t0,t):{});
  if(s.trans==='panL'||s.trans==='panR'){const d=s.trans==='panL'?-1:1;body=G(body,`translate(${d*W*k} 0)`)+G(nb,`translate(${-d*W*(1-k)} 0)`)}
  else if(s.trans==='up'){body=G(body,`translate(0 ${-H*k})`)+G(nb,`translate(0 ${H*(1-k)})`)}
  else body=body+G(nb,'',`opacity="${k}"`)}
 const hud=window.OVERLAY?window.OVERLAY(t):'';
 svgEl().innerHTML=defs.replace('SEED',String(Math.floor(t*12)%50))+body+hud+R(0,0,W,H,'url(#vig)')+R(0,0,W,H,'#000','filter="url(#grain)" opacity=".18"');
 document.getElementById('capbox').innerHTML=caption(t);
 const f=t>window.TOTAL-.5?cl((t-(window.TOTAL-.5))/.5):(t<.2?1-t/.2:0);document.getElementById('fade').style.opacity=f}
window.Engine={W,H,P,cl,lerp,ease,eOut,eIn,pg,pop,rng,shade,G,R,C,E,Pa,T,BG,person,mini,HUD,
 boot(){window.render=render;document.fonts.load('80px CalSans').then(()=>document.fonts.ready).then(()=>{render(0);window.READY=true})}};
})();
