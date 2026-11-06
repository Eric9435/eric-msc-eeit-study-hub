const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const url=(process.env.EEIT_SITE_URL||'https://eric-msc-eeit-study-hub.onrender.com').replace(/\/$/,'');
fs.mkdirSync('artifacts',{recursive:true});
async function check(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let desktop,phone;
 const pageErrors=[];
 try{
   desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
   desktop.on('pageerror',e=>pageErrors.push('desktop: '+e.message));
   const r=await desktop.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   assert.equal(r.status(),200);
   await desktop.waitForSelector('.subject-card',{timeout:35000});
   assert.equal(await desktop.locator('.subject-card').count(),5,'Five cards must appear');
   const logo=desktop.locator('.hero-logo-panel img');
   await logo.waitFor();
   await logo.evaluate(async img=>{await img.decode();});
   assert(await logo.evaluate(el=>el.complete&&el.naturalWidth>0),'Hero logo did not render after image decoding');
   await desktop.screenshot({path:'artifacts/eeit-desktop.png',fullPage:true});
   await desktop.locator('.subject-card').first().click();
   await desktop.waitForURL('**/#library');
   await desktop.locator('.exercise-row').first().waitFor({timeout:20000});
   assert(await desktop.locator('.exercise-row').count()>0,'Subject exercise list empty');
   await desktop.locator('.exercise-row').first().click();
   await desktop.waitForURL(/#exercise\//);
   // Exercise metadata and verified solution content must render on the live site.
   await desktop.goto(url+'/#exercise/dc-4.1',{waitUntil:'domcontentloaded',timeout:60000});
   await desktop.locator('.paper-part').first().waitFor({timeout:35000});
   assert.equal(await desktop.locator('.paper-part').count(),10,'Digital OFDM 4.1 must contain all 10 worked subquestions');
   assert(await desktop.locator('.a4-paper #paper-overall-heading').isVisible(),'A4 worked solution is not rendered');
   assert(await desktop.locator('.eeit-viz-svg[role="img"]').count()>0,'Exercise visual SVG missing');
   // Check one representative engineering visual in each of the five subjects.
   for (const sample of [
     ['dc-2.2','ber'],['source-eps-ex-06','bus'],['official-cstd-I1','eigen'],
     ['official-mw-2-4','smith'],['practice-mse-spring','spring']
   ]) {
     await desktop.goto(url+'/#exercise/'+sample[0],{waitUntil:'domcontentloaded',timeout:60000});
     const visual=desktop.locator('.eeit-viz-panel').first();
     await visual.waitFor({timeout:30000});
     assert.equal(await visual.getAttribute('data-visual-kind'),sample[1],'Wrong diagram for '+sample[0]);
     assert.equal(await visual.locator('svg[role="img"] title').count(),1,'SVG accessibility title missing');
     assert((await visual.locator('svg path,svg line,svg circle,svg rect').count())>1,'Visual is empty');
   }
   await desktop.goto(url+'/#exercise/dc-2.2',{waitUntil:'domcontentloaded',timeout:60000});
   const slider=desktop.locator('.eeit-viz-control input[type="range"]').first();
   await slider.waitFor({timeout:15000});
   const chartBefore=await desktop.locator('.eeit-viz-graphic').first().innerHTML();
   await slider.evaluate(el=>{el.value='80';el.dispatchEvent(new Event('input',{bubbles:true}));});
   assert.notEqual(await desktop.locator('.eeit-viz-graphic').first().innerHTML(),chartBefore,'Interactive visual slider does not update geometry');
   await desktop.goto(url+'/#exercise/source-eps-ex-10',{waitUntil:'domcontentloaded',timeout:60000});
   await desktop.locator('.eeit-viz-panel').first().waitFor({timeout:15000});
   assert((await desktop.locator('.eeit-viz-note').first().innerText()).includes('Reference-only'),'Source-only visuals must not claim a verified original solution');
   await desktop.locator('.topbar [data-action="theme"]').click();
   assert.equal(await desktop.locator('html').getAttribute('data-theme'),'dark','Dark theme did not apply');
   await desktop.reload({waitUntil:'domcontentloaded'});
   await desktop.locator('.page-title').first().waitFor({timeout:15000});
   assert.equal(await desktop.locator('html').getAttribute('data-theme'),'dark','Saved appearance did not persist after reload');
   phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
   phone.on('pageerror',e=>pageErrors.push('mobile: '+e.message));
   await phone.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await phone.waitForSelector('.subject-card',{timeout:35000});
   assert.equal(await phone.locator('.subject-card').count(),5,'Missing mobile subject cards');
   const mobileLogo=phone.locator('.mobile-brand img');
   await mobileLogo.evaluate(async img=>{await img.decode();});
   assert(await mobileLogo.evaluate(el=>el.complete&&el.naturalWidth>0),'Mobile logo did not render after image decoding');
   await phone.screenshot({path:'artifacts/eeit-mobile.png',fullPage:true});
   await phone.locator('.mobile-menu').click();
   assert(await phone.locator('.sidebar.open').isVisible(),'Mobile drawer did not open');
   await phone.locator('.sidebar.open [data-action="navigate"][data-id="formulas"]').click();
   await phone.waitForURL('**/#formulas');
   await phone.locator('.formula-card').first().waitFor({timeout:15000});
   assert(await phone.locator('.formula-card').count()>0,'Formula cards not rendered on mobile');
   // Main study features should function even if optional remote SDK is unavailable.
   const fatal=pageErrors.filter(s=>/Uncaught|ReferenceError|SyntaxError|TypeError/.test(s) && !/firebase|network request failed/i.test(s));
   assert.deepEqual(fatal,[],'Client runtime exception: '+fatal.join(' | '));
   console.log('PASS desktop + mobile browser: five subjects, A4 worked solutions, accessible diagrams across all subjects, interactive plot, source-only disclaimer, theme persistence, mobile drawer and formula bank.');
   if(pageErrors.length)console.log('Browser messages (nonfatal): '+pageErrors.slice(0,5).join(' | '));
 }catch(err){
   if(desktop)await desktop.screenshot({path:'artifacts/eeit-browser-failure.png',fullPage:true}).catch(()=>{});
   if(phone)await phone.screenshot({path:'artifacts/eeit-mobile-failure.png',fullPage:true}).catch(()=>{});
   throw err;
 }finally{await browser.close()}
}
check().catch(e=>{console.error('FAIL live browser:',e.message);process.exit(1)});
