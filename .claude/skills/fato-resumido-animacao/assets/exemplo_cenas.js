/* EXEMPLO de arquivo de cenas – copie e reescreva para cada vídeo.
   Cada cena: {t0,t1, draw(L,t)->svg, cam(L,t)->{x,y,z,r}, trans:'fade'|'panL'|'panR'|'up', xfade:seg}
   L = tempo dentro da cena; t = tempo global.  Tudo determinístico. */
(function(){const {W,H,P,G,R,C,E,Pa,T,BG,person,mini,HUD,ease,eOut,pg,pop,lerp,cl,rng}=Engine;
window.TOTAL=12;
window.CAPS=[[0,1.2,'O *COLISEU*'],[1.2,2.4,'VIROU *MAR*'],[2.6,3.8,'*ROMA,* ANO 80'],[3.8,5.2,'O IMPERADOR *TITO*'],[5.2,6.8,'ABRE O *ANFITEATRO*'],[7,8.6,'*CEM DIAS* DE JOGOS'],[8.8,10.4,'E *NINGUÉM SABE*'],[10.4,12,'COMO *FUNCIONAVA*']];
window.SCENES=[
 /* 1 – mar dentro da arena, cavalos nadando, câmera desce devagar */
 {t0:0,t1:2.6,trans:'fade',draw:(L,t)=>{let s=BG.sky(t)+BG.sea(t,820);
   [[300,1050,'#8c5227'],[720,1200,'#e9e2d6'],[520,1450,'#5a3a22']].forEach(([x,y,c],i)=>{const b=Math.sin(t*2+i)*10;s+=G(Pa('M0 0 Q-20 -160 60 -230 Q120 -260 150 -210 L110 -190 Q80 -150 90 0Z',c)+E(140,-205,45,30,c)+C(135,-222,7,P.ink)+Pa('M20 -200 Q-10 -150 -5 -60',shade(c,.7),'stroke="'+shade(c,.7)+'" stroke-width="16" fill="none"'),`translate(${x} ${y+b})`)});
   return s+BG.sea(t,1180,{col:P.seaD})},
  cam:L=>({z:lerp(1.08,1.0,ease(L/2.6)),y:lerp(-40,0,ease(L/2.6))})},
 /* 2 – vista do anfiteatro, zoom lento */
 {t0:2.6,t1:3.8,trans:'fade',draw:(L,t)=>{let s=R(0,0,W,H,P.ochre);for(let i=0;i<9;i++)s+=E(W/2,H/2,520-i*40,300-i*24,i%2?P.ochreL:P.ochre);s+=E(W/2,H/2,190,110,P.sea)+E(W/2,H/2,190,110,'none','stroke="'+P.seaD+'" stroke-width="6"');return s},cam:L=>({z:lerp(1,1.12,L/1.2)})},
 /* 3 – imperador em close, multidão desfocada atrás, ergue o braço */
 {t0:3.8,t1:8.8,trans:'panL',draw:(L,t)=>{let s=BG.crowd(t,0,14,{rowH:90,blur:8,cheer:L>2?1:0})+R(-200,1300,W+400,700,P.wine);
   const arm=L>1.4?'up':'down',ak=eOut(pg(L,1.4,.5));const talk=(t*8%1)<.5&&L>1.2&&L<3;
   s+=G(person({laurel:true,hair:'short',mouth:talk?'open':'closed',arm,armK:ak,blink:(t%3.1)<.12?1:0,s:1.6}),`translate(${W/2} 1060)`);
   return s},cam:L=>({z:lerp(1.0,1.06,L/5)})},
 /* 4 – arena, interrogação */
 {t0:8.8,t1:12,draw:(L,t)=>BG.crowd(t,0,9,{rowH:60})+BG.arches(540,260)+BG.sea(t,800),cam:L=>({y:lerp(0,40,L/3)})}
];
window.OVERLAY=t=>{let s='';
 s+=HUD.title('O COLISEU','VIROU MAR',t<2.6?1-pg(t,2.3,.3):0);
 s+=HUD.chapter(1,4,['🐎'],460,t<2.6?pg(t,.3,.3)*(1-pg(t,2.3,.3)):0);
 s+=HUD.place('ROMA, ANO 80','',t>2.6&&t<4.3?pg(t,2.7,.4)*(1-pg(t,4,.3)):0);
 if(t>7&&t<8.8)s+=HUD.counter(String(Math.round(100*eOut(pg(t,7,1)))),'DIAS DE JOGOS',pg(t,7,.2)*(1-pg(t,8.5,.3)));
 if(t>8.8)s+=HUD.place('NINGUÉM SABE','os arqueólogos ainda discutem',pg(t,8.9,.4),150)+HUD.question(pg(t,9.2,.5),470,t);
 return s};
function shade(h,k){return Engine.shade(h,k)}
})();
