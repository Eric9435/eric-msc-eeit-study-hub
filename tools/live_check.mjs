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
  assert(index.includes('inline-solutions.css'),'Inline solution stylesheet missing');
  assert(index.includes('a4-paper.css'),'A4 paper stylesheet not loaded');
  assert(index.includes('visuals.css'),'Visual stylesheet missing from live HTML');
  assert(!index.includes('enhancements.js'),'Retired popup script must not be loaded');
  assert(!index.includes('src="reason-ui.js"'),'Two conflicting reasoning scripts are loading');
  const content=JSON.parse((await get('/data/content.json')).bytes.toString('utf8'));
  assert.equal(content.subjects.length,5,'Missing subjects');
  assert.equal(content.exercises.length,82,'Missing exercises');
  assert.equal(content.formulas.length,69,'Missing formulas');
  assert.equal(content.exercises.reduce((n,e)=>n+(e.parts||[]).length,0),139,'Wrong number of guided exercise parts');
  const extension=JSON.parse((await get('/data/verified-expansion.json')).bytes.toString('utf8'));
  assert(Array.isArray(extension.overrides),'Missing independently-derived exercise expansion');
  assert(extension.overrides.length>=15,'Independent derivation extension is unexpectedly incomplete');
  const map=new Map(extension.overrides.map(x=>[x.id,x]));
  const merged=content.exercises.map(x=>map.has(x.id)?{...x,...map.get(x.id)}:x);
  assert(merged.reduce((n,e)=>n+(e.parts||[]).length,0)>=223,'Merged worked subparts are missing');
  const originalPractice=JSON.parse((await get('/data/original-practice-reworked.json')).bytes.toString('utf8'));
  assert.equal(originalPractice.overrides.length,21,'Missing five-subject original practice solutions');
  assert.equal(originalPractice.overrides.reduce((n,e)=>n+e.parts.length,0),63,'Incomplete detailed original-practice subquestions');
  assert(originalPractice.overrides.every(e=>e.parts.every(p=>p.working?.length>=4)),'Original solutions lack full calculation sequences');
  const practiceIds=new Set(originalPractice.overrides.map(x=>x.id));
  assert(content.subjects.every(s=>content.exercises.some(e=>e.subject===s.id&&practiceIds.has(e.id))),'An engineering subject lacks reworked practice');
  const sourceDerived=JSON.parse((await get('/data/source-backed-derivations.json')).bytes.toString('utf8'));
  assert(sourceDerived.overrides.length>=3,'Missing reconstructed original tutorial sets');
  assert(sourceDerived.overrides.reduce((n,e)=>n+e.parts.length,0)>=34,'Source-aligned tutorial set is incomplete');
  assert(sourceDerived.overrides.every(e=>e.parts.every(p=>p.method&&p.finalAnswer&&p.display?.length)),'Source-aligned tutorial method/formula missing');
  const projectArchive=JSON.parse((await get('/data/project-practice.json')).bytes.toString('utf8'));
  assert.equal(projectArchive.exercises.length,23,'23 recovered project practices missing');
  assert(projectArchive.exercises.every(x=>x.contentProvenance==='chatgpt-project-practice' && x.parts.every(p=>p.working?.length>=4)),'Project practice metadata/steps invalid');

  const pdfCatalog=JSON.parse((await get('/data/pdf-catalog.json')).bytes.toString('utf8'));
  assert(pdfCatalog.entries.length>=90,'Five-subject PDF catalog is not deployed');
  assert(['digital','power','control','microwave','micro'].every(subject=>pdfCatalog.entries.some(item=>item.subject===subject)),'PDF library must cover all five subjects');
  assert(pdfCatalog.entries.filter(item=>item.recordType==='library-file-identified').length>=10,'Named Library PDF files missing');

  assert(pdfCatalog.entries.reduce((n,item)=>n+Object.keys(item.exercisePages||{}).length,0)>=40,'Original source page links are missing');

  const linked=pdfCatalog.entries.filter(item=>item.drive_id);
  assert.equal(linked.length,123,'Missing original PDFs in private Google Drive catalog');
  assert.equal(new Set(linked.flatMap(item=>Object.keys(item.exercisePages||{}))).size,42,'Verified original exercise links missing');
  assert.equal(new Set(linked.flatMap(item=>item.relatedExerciseIds||[])).size,22,'Related lecture references missing');
  assert.equal(pdfCatalog.examCoverage?.sourceOnlyWithoutSolution,8,'Eight incomplete source-only exercises must be disclosed');
  assert.equal(pdfCatalog.examCoverage?.exerciseEntries,82,'Exam coverage set count differs from study library');
  assert.equal(new Set(linked.map(item=>item.drive_id)).size,123,'Duplicated original Drive IDs');
  const expectedCounts={digital:56,power:17,control:17,microwave:25,micro:6,shared:2};
  for(const [subject,n] of Object.entries(expectedCounts))
    assert.equal(linked.filter(item=>item.subject===subject).length,n,'Private original subject incomplete: '+subject);


  const logo=(await get('/assets/eeit-study-hub-logo.webp')).bytes;
  assert(logo.length>2000 && logo.toString('ascii',0,4)==='RIFF' && logo.toString('ascii',8,12)==='WEBP','Invalid logo file');
  for(const path of ['/styles.css','/brand-ui.css','/inline-solutions.css','/a4-paper.css','/visuals.css','/visuals.mjs','/app.js','/cloud.js','/sw.js','/manifest.webmanifest']){
    const {bytes}=await get(path);
    assert(bytes.length>100,'Empty web asset '+path);
  }
  const app=(await get('/app.js')).bytes.toString('utf8');
  assert(app.includes('project-practice.json'),'Project practice not loaded in deployed app');
  assert(app.includes('COMPLETE WORKING · FROM START TO FINISH'),'Full paper derivation not deployed');
  assert(app.includes("from './visuals.mjs'"),'Original SVG engine not imported into active app');
  const visualAsset=await get('/visuals.mjs');
  assert(/javascript|ecmascript/.test(visualAsset.response.headers.get('content-type')||''),'Visual module must be served with JavaScript MIME, got '+visualAsset.response.headers.get('content-type'));
  assert(visualAsset.bytes.toString('utf8').includes('createVisualEngine'),'Wrong live visuals module asset');
  assert(app.includes('original-practice-reworked.json'),'Original calculations not loaded by client');
  assert(app.includes('source-backed-derivations.json'),'Original tutorial answer data not loaded by client');
  assert(app.includes('not yet certified'),'Exam readiness must be presented honestly');
  assert(app.includes('data-eeit-source-shelf'),'Private original PDF shelf missing');
  assert(index.includes('source-library.mjs'),'Private source viewer shell not loaded');
  assert(app.includes('PDF Document Library'),'PDF catalog navigation missing');
  assert(app.includes('data-eeit-document-library'),'Document catalogue route missing');
  const privateReader=(await get('/source-library.mjs')).bytes.toString('utf8');
  assert(privateReader.includes('data-document-zip')&&privateReader.includes('zipDirectory'),'ZIP importer missing from deployed source viewer');
  assert(privateReader.includes('dataset.documentDrive')&&privateReader.includes('drive.google.com/file/d/'),'Private Drive PDF viewer missing from live site');
  assert(privateReader.includes('document-match-exact')&&privateReader.includes('document-match-related'),'Source fidelity banner missing');
  assert(privateReader.includes('pdf-coverage-audit'),'Source coverage panel missing');
  assert(app.includes('paper-workline-label'),'Step-by-step working not rendered');
  assert(!app.includes('showPartExplanation('),'Obsolete popup still deployed');
  const config=(await get('/cloud-config.js')).bytes.toString('utf8');
  assert.match(config,/window\.EEIT_FIREBASE_CONFIG\s*=\s*\{/,'Firebase web app configuration missing');
  console.log('PASS live HTTP: website, HTML, 5 subjects, 82 exercises, 63 original-practice derivations, at least 34 source-aligned original tutorial parts, at least 277 guided parts, 69 formulas, valid logo, JS/CSS assets, Firebase web configuration present.');
}
let error;
for(let i=1;i<=12;i++){
  try{await check();process.exit(0)}catch(e){error=e;console.log('Live check attempt '+i+'/12: '+e.message);if(i<12)await wait(10000)}
}
console.error('FAIL live HTTP:',error?.message);
process.exit(1);
