// node render.js pagina.html saida.mp4 [fps=30] [quadroIni=0] [quadroFim=TOTAL*fps]
// Renderiza quadro a quadro chamando window.render(t) e envia ao ffmpeg (H.264, CRF 17).
const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const [,,html,out,fpsS,aS,bS]=process.argv;const fps=+fpsS||30;
const br=await chromium.launch({args:['--allow-file-access-from-files']});const p=await br.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(html));await p.waitForFunction(()=>window.READY,{timeout:120000});
const total=await p.evaluate(()=>window.TOTAL);const a=+(aS||0),b=+(bS||Math.round(total*fps));
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-r',String(fps),out],{stdio:['pipe','inherit','inherit']});
for(let i=a;i<b;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:94});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(errs.length){console.error('ERR',errs[0]);process.exit(1)}}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();console.log('done',a,b)})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
