const {chromium}=require('playwright');const fs=require('fs');const {execFileSync}=require('child_process');
(async()=>{const [mode,...args]=process.argv.slice(2);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});
await p.goto('file://'+__dirname+'/cenas.html');await p.evaluate(()=>document.fonts.ready);
if(mode==='still'){for(const a of args){const [n,t]=a.split('@');await p.evaluate(([n,t])=>render(n,+t),[n,t]);await p.waitForTimeout(80);await p.screenshot({path:`/tmp/claude-0/-home-user--curso-web-design-responsivo-templates-sem-framework/f9b3a6c2-1276-5c5f-bd2a-923fbdbbc47f/scratchpad/st_${n}_${t}.png`});}}
else{for(const a of args){const [n,d]=a.split(':');const dir=`frames_${n}`;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
 const N=Math.round(+d*30);for(let i=0;i<N;i++){await p.evaluate(([n,t])=>render(n,t),[n,i/30]);if(i==0)await p.waitForTimeout(150);await p.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:93});}
 execFileSync('ffmpeg',['-loglevel','error','-y','-framerate','30','-i',`${dir}/%04d.jpg`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','17',`../seg_${n}.mp4`]);fs.rmSync(dir,{recursive:true});console.log('ok',n);}}
await b.close();})();
