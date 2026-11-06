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
   await desktop.locator('.inline-part').first().waitFor({timeout:35000});
   assert.equal(await desktop.locator('.inline-part').count(),10,'Digital OFDM 4.1 must have all 10 verified subparts');
   await desktop.locator('.inline-part').first().locator('.eeit-popup-tools .eeit-info-button').first().waitFor({timeout:15000});
   assert.equal(await desktop.locator('.inline-part').first().locator('.eeit-popup-tools .eeit-info-button').count(),3,'Every part must have Why/Method/Answer buttons');
   await desktop.locator('.eeit-popup-tools .eeit-info-button').first().click();
   const dialog=desktop.locator('.eeit-explanation-dialog');
   assert(await dialog.isVisible(),'Why popup did not open');
   await desktop.keyboard.press('Escape');
   assert(!await dialog.isVisible(),'Escape failed to close dialog');
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
   console.log('PASS desktop + mobile browser: 5 subjects, full logo, subject navigation, 3 dialogs, theme persistence, mobile drawer, formula bank.');
   if(pageErrors.length)console.log('Browser messages (nonfatal): '+pageErrors.slice(0,5).join(' | '));
 }catch(err){
   if(desktop)await desktop.screenshot({path:'artifacts/eeit-browser-failure.png',fullPage:true}).catch(()=>{});
   if(phone)await phone.screenshot({path:'artifacts/eeit-mobile-failure.png',fullPage:true}).catch(()=>{});
   throw err;
 }finally{await browser.close()}
}
check().catch(e=>{console.error('FAIL live browser:',e.message);process.exit(1)});
