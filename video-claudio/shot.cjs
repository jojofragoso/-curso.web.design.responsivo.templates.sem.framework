const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.error(e.message));await p.goto(process.argv[2]);await p.waitForFunction(()=>window.READY,null,{timeout:60000});await p.screenshot({path:process.argv[3]});await b.close();})();
