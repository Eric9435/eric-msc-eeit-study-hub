// Cross-origin external health verification. Never log Firebase configuration values.
import assert from 'node:assert/strict';
const base=(process.env.EEIT_SITE_URL||'https://eric-msc-eeit-study-hub.onrender.com').replace(/\/$/,'');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(path){
  const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),25000);
  try{
    const response=await fetch(base+path,{signal:controller.signal,redirect:'follow',headers:{'User-Agent':'EEIT-live-health-check/1.0','Cache-Control':'no-cache'}});
    if(!response.ok)throw Error(path+': HTTP '+response.status);
    return {response,bytes:Buffer.from(await response.arrayBuffer())};
  }finally{clearTimeout(timeout)}
}
async function check(){
  const index=(await get('/')).bytes.toString('utf8');
  assert.match(index,/Eric M\.Sc EEIT/i,'Study hub title missing');
  assert(index.includes('enhancements.js'),'Current explanation script missing');
  assert(!index.includes('src="reason-ui.js"'),'Two conflicting reasoning scripts are loading');
  const content=JSON.parse((await get('/data/content.json')).bytes.toString('utf8'));
  assert.equal(content.subjects.length,5,'Missing subjects');
  assert.equal(content.exercises.length,82,'Missing exercises');
  assert.equal(content.formulas.length,69,'Missing formulas');
  assert.equal(content.exercises.reduce((n,e)=>n+(e.parts||[]).length,0),139,'Wrong number of guided exercise parts');
  const extension=JSON.parse((await get('/data/verified-expansion.json')).bytes.toString('utf8'));
  assert(Array.isArray(extension.overrides),'Missing independently-derived exercise expansion');
  assert.equal(extension.overrides.length,12,'Wrong number of source-grounded overrides');
  const map=new Map(extension.overrides.map(x=>[x.id,x]));
  const merged=content.exercises.map(x=>map.has(x.id)?{...x,...map.get(x.id)}:x);
  assert.equal(merged.reduce((n,e)=>n+(e.parts||[]).length,0),193,'Merged worked subparts are missing');
  const logo=(await get('/assets/eeit-study-hub-logo.webp')).bytes;
  assert(logo.length>2000 && logo.toString('ascii',0,4)==='RIFF' && logo.toString('ascii',8,12)==='WEBP','Invalid logo file');
  for(const path of ['/styles.css','/brand-ui.css','/enhancements.css','/app.js','/enhancements.js','/cloud.js','/sw.js','/manifest.webmanifest']){
    const {bytes}=await get(path);
    assert(bytes.length>100,'Empty web asset '+path);
  }
  const config=(await get('/cloud-config.js')).bytes.toString('utf8');
  assert.match(config,/window\.EEIT_FIREBASE_CONFIG\s*=\s*\{/,'Firebase web app configuration missing');
  console.log('PASS live HTTP: website, HTML, 5 subjects, 82 exercises, 193 merged parts, 69 formulas, valid logo, JS/CSS assets, Firebase web configuration present.');
}
let error;
for(let i=1;i<=12;i++){
  try{await check();process.exit(0)}catch(e){error=e;console.log('Live check attempt '+i+'/12: '+e.message);if(i<12)await wait(10000)}
}
console.error('FAIL live HTTP:',error?.message);
process.exit(1);
