// node snap.js pagina.html pastaSaida t1 t2 ...   -> PNGs para revisar quadros antes de renderizar
const {chromium}=require('playwright');
(async()=>{const [,,html,out,...ts]=process.argv;const br=await chromium.launch({args:['--allow-file-access-from-files']});const p=await br.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+require('path').resolve(html));await p.waitForFunction(()=>window.READY,{timeout:120000});
require('fs').mkdirSync(out,{recursive:true});for(const t of ts){await p.evaluate(t=>render(t),+t);await p.screenshot({path:`${out}/s_${String((+t).toFixed(2)).padStart(7,'0')}.png`})}
console.log(errs.length?'ERROS: '+errs.join(' | '):'ok');await br.close()})();
