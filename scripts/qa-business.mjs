import{createRequire}from'node:module';import{mkdir,writeFile}from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(path.join(process.env.ACN_TOOL_DIR||path.resolve(root,'../tooling/site-qa'),'package.json')),{chromium}=require('playwright');
const out=path.join(root,'docs/review');await mkdir(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});const errors=[],results=[];
try{
 const c=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});await c.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8}));const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});await p.waitForFunction(()=>window.__acnJourney?.architecture&&window.__acnJourney?.floorInserts,null,{timeout:90000});await p.screenshot({path:path.join(out,'desktop-home.png')});
 const href=await p.locator('.persistent-contact').getAttribute('href');const mail=new URL(href);if(mail.pathname!=='contact@astracorenova.com'||mail.searchParams.get('subject')!=='Цифровий працівник для бізнесу')errors.push('Primary mailto incorrect');
 await p.locator('.service-card').first().scrollIntoViewIfNeeded();await p.waitForTimeout(1000);if(!await p.locator('.service-card').first().evaluate(el=>el.classList.contains('is-revealed')&&getComputedStyle(el).opacity==='1'))errors.push('Card entrance reveal failed');
 await p.locator('#security').scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.__acnJourney?.models===3,null,{timeout:60000});await p.waitForTimeout(1200);await p.screenshot({path:path.join(out,'desktop-security.png')});
 await p.locator('#pricing').scrollIntoViewIfNeeded();await p.waitForTimeout(1600);await p.screenshot({path:path.join(out,'desktop-pricing.png')});results.push({desktop:await p.evaluate(()=>window.__acnJourney),mailto:href});
 if(await p.locator('#temple-scene canvas').count()!==1)errors.push('One persistent canvas expected');await c.close();
 for(const width of[390,360]){
  const c=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1});await c.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4}));const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
  await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight){scrollTo(0,y);await new Promise(r=>setTimeout(r,65));}await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));scrollTo(0,0);});await p.waitForTimeout(1000);
  const state=await p.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,canvas:document.querySelectorAll('#temple-scene canvas').length,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),language:document.documentElement.lang}));results.push(state);if(state.overflow||state.canvas||state.broken.length)errors.push(JSON.stringify(state));
  if(width===390)await p.screenshot({path:path.join(out,'phone-home.png'),fullPage:true});await p.locator('#hamburger').click();await p.keyboard.press('Escape');if(!await p.locator('#mobileMenu').isHidden())errors.push('Menu Escape');await p.locator('[data-lang=en]').click();if(!await p.locator('h1').innerText().then(t=>t.includes('Digital employees')))errors.push('EN');await p.locator('[data-lang=uk]').click();await c.close();
 }
 {const c=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});const p=await c.newPage();await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});if(await p.locator('#temple-scene canvas').count()||await p.locator('html').evaluate(el=>el.classList.contains('reveal-ready')))errors.push('Reduced motion must disable reveal and WebGL');await c.close();}
 {
  const c=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await c.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8}));
  const p=await c.newPage(),requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r.url()));
  await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>window.__acnJourney?.quality==='mobile'&&window.__acnJourney?.modelNames.includes('oracle'),null,{timeout:60000});
  await p.waitForTimeout(800);await p.screenshot({path:path.join(out,'phone-3d-home.png')});
  const cameraBefore=await p.evaluate(()=>window.__acnJourney.camera);
  for(const[id,name]of[['services','colossus'],['security','madonna'],['hero','oracle']]){
   await p.locator('#'+id).scrollIntoViewIfNeeded();
   await p.waitForFunction(name=>window.__acnJourney?.modelNames.includes(name),name,{timeout:60000});
   const state=await p.evaluate(()=>window.__acnJourney);results.push({mobileRoom:id,...state});
   if(state.residentModels>1||state.shadows||state.postprocessing)errors.push('Mobile rendering budget exceeded');
   if(id==='security'){await p.waitForTimeout(900);await p.screenshot({path:path.join(out,'phone-3d-security.png')});}
   if(id==='services'&&JSON.stringify(state.camera)===JSON.stringify(cameraBefore))errors.push('Mobile scroll did not move camera');
  }
  if(requests.some(url=>/postprocessing|column.glb|marble-tile.glb/.test(url)))errors.push('Mobile fetched desktop effects or architecture');
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push('Mobile 3D overflow');
  await c.close();
 }
 {
  const c=await browser.newContext({viewport:{width:1440,height:1000}});await c.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8}));
  await c.route('**/temple-journey.js',route=>route.abort());const p=await c.newPage();await p.goto('http://127.0.0.1:4180/',{waitUntil:'networkidle'});
  if(!await p.locator('h1').isVisible()||!await p.locator('.persistent-contact').isVisible())errors.push('HTML must remain usable when WebGL fails');await c.close();
 }
}catch(error){errors.push(error.stack);}finally{await browser.close();}
await writeFile(path.join(out,'checks.json'),JSON.stringify({results,errors},null,2)+'\n');console.log(JSON.stringify({results,errors},null,2));if(errors.length)process.exitCode=1;
