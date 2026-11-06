const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const file=p=>path.join(root,p);
const data=JSON.parse(fs.readFileSync(file('source/data/content.json'),'utf8'));
assert.equal(data.subjects.length,5,'Five subjects expected');
assert.equal(data.exercises.length,82,'Expected 82 merged exercise entries');
assert(data.formulas.length>=69,'Expected full merged formula library');

const docCatalog=JSON.parse(fs.readFileSync(file('source/data/pdf-catalog.json'),'utf8'));
assert(docCatalog.entries.length>=90,'Expected catalog of original and archival PDF references');
assert.equal(new Set(docCatalog.entries.map(d=>d.id)).size,docCatalog.entries.length,'Duplicate PDF catalog IDs');
assert(docCatalog.entries.every(d=>d.id&&d.subject&&d.filename.toLowerCase().endsWith('.pdf')),'Invalid document catalog entries');
for(const subject of data.subjects)assert(docCatalog.entries.some(d=>d.subject===subject.id),'Missing PDF catalog for '+subject.id);
assert(docCatalog.entries.filter(d=>d.recordType==='archive-index').length>=80,'TUHH 81-file archive index incomplete');
assert(docCatalog.entries.filter(d=>d.recordType==='library-file-identified').length>=10,'Library source PDFs not identified');
assert(!JSON.stringify(docCatalog).includes('file_00000000'),'Private Library file IDs must not be published');

assert(docCatalog.entries.reduce((n,e)=>n+Object.keys(e.exercisePages||{}).length,0)>=40,'Original exercise-to-PDF-page mappings are incomplete');

const originalDriveDocs=docCatalog.entries.filter(d=>d.drive_id);
assert.equal(originalDriveDocs.length,123,'Expected 123 private Drive PDF references');
const exactExerciseIds=new Set(originalDriveDocs.flatMap(d=>Object.keys(d.exercisePages||{})));
const relatedExerciseIds=new Set(originalDriveDocs.flatMap(d=>d.relatedExerciseIds||[]));
assert.equal(exactExerciseIds.size,42,'Verified original exercise PDF mappings must cover 42 sets');
assert.equal(relatedExerciseIds.size,22,'Lecture references should explicitly cover 22 sets');
assert.equal(docCatalog.examCoverage?.sourceOnlyWithoutSolution,12,'Source-only exercises must remain flagged');
assert.equal(docCatalog.examCoverage?.exerciseEntries,82,'Study library should match current exercise entries');
assert(docCatalog.entries.some(d=>d.path==='Digital_Communications/Tutorial_Material/tutorials_dc.pdf' && d.exercisePages?.['dc-1.1']?.question===3),'Digital Communications exact question page missing');
assert(docCatalog.entries.some(d=>d.path==='Microwave_Engineering/Exercise/Exercise/Exercise_sol.pdf' && d.exercisePages?.['official-mw-5-3']?.solution===39),'Microwave official solution page missing');
assert(docCatalog.entries.some(d=>d.filename==='Exercise1_Sol_Introduction_Sheet_1.pdf' && d.exercisePages?.['official-cstd-I3']?.solution===3),'Control Systems original solution page missing');

assert.equal(new Set(originalDriveDocs.map(d=>d.drive_id)).size,123,'Private Drive file links must be unique');
assert(originalDriveDocs.every(d=>/^[A-Za-z0-9_-]{10,160}$/.test(d.drive_id)),'Invalid Drive file id');
assert(originalDriveDocs.every(d=>d.drive_visibility==='private-owner-only'),'One Drive PDF lacks private owner-only access label');
const expectedDriveCounts={digital:56,power:17,control:17,microwave:25,micro:6,shared:2};
for(const [subject,n] of Object.entries(expectedDriveCounts))
 assert.equal(originalDriveDocs.filter(d=>d.subject===subject).length,n,'Missing Drive PDFs in '+subject);



const ext=JSON.parse(fs.readFileSync(file('source/data/verified-expansion.json'),'utf8'));
assert(Array.isArray(ext.overrides)&&ext.overrides.length>=21,'Missing independent derivations');
for(const over of ext.overrides){
 const target=data.exercises.find(e=>e.id===over.id);
 assert(target,'Unmatched override '+over.id);
 assert(over.parts.length>0,'Empty verified solution '+over.id);
 assert.equal(new Set(over.parts.map(p=>p.label)).size,over.parts.length,'Duplicate subpart label '+over.id);
 for(const p of over.parts)assert(p.label&&p.question&&p.method&&p.reason&&p.finalAnswer&&p.display.length,'Incomplete verified subpart '+over.id+':'+p.label);
}
const overrideMap=new Map(ext.overrides.map(x=>[x.id,x]));
const merged=data.exercises.map(e=>overrideMap.has(e.id)?{...e,...overrideMap.get(e.id)}:e);
const parts=merged.reduce((n,e)=>n+e.parts.length,0);
const originals=JSON.parse(fs.readFileSync(file('source/data/original-practice-reworked.json'),'utf8'));
assert.equal(originals.overrides.length,21,'Expect all 21 rederived five-subject practice entries');
const reworkedParts=originals.overrides.flatMap(e=>e.parts||[]);
assert.equal(reworkedParts.length,63,'Expect 63 original practice subparts');
for(const over of originals.overrides){
 const source=data.exercises.find(e=>e.id===over.id);
 assert(source,'Reworked practice missing source '+over.id);
 assert.equal(source.parts.length,over.parts.length,'Reworked practice changed number of subparts '+over.id);
 assert(source.parts.every((p,i)=>p.label===over.parts[i].label),'Reworked practice changed labels '+over.id);
 for(const p of over.parts){
  assert(p.method&&p.finalAnswer&&p.reason&&p.working?.length>=4,'Missing complete original derivation '+over.id+':'+p.label);
  assert(p.working.every(step=>step.label&&step.value),'Incomplete calculation step '+over.id+':'+p.label);
 }
}
const sourced=JSON.parse(fs.readFileSync(file('source/data/source-backed-derivations.json'),'utf8'));
assert(sourced.overrides.length>=3,'Expect source-based Digital Communications and microwave reconstructions');
assert(sourced.overrides.reduce((n,e)=>n+e.parts.length,0)>=34,'Expect at least 34 source-aligned parts');
for(const override of sourced.overrides){
 const exercise=data.exercises.find(e=>e.id===override.id);
 assert(exercise && override.parts.length>0 && (!exercise.parts.length || exercise.parts.length===override.parts.length),'Source-backed reconstruction must preserve existing labels or add to a question-only entry');
 for(const p of override.parts)assert(p.method&&p.reason&&p.finalAnswer&&p.display?.length,'Unexplained original tutorial subpart: '+override.id+':'+p.label);
}
const sourceMap=new Map(sourced.overrides.map(e=>[e.id,e]));
const originalMap=new Map(originals.overrides.map(e=>[e.id,e]));
const allMerged=merged.map(e=>{const over=originalMap.get(e.id)||sourceMap.get(e.id);return over?{...e,...over}:e;});
const bySubject=new Map(data.subjects.map(s=>[s.id,allMerged.filter(e=>e.subject===s.id)]));
assert([...bySubject.values()].every(es=>es.some(e=>originalMap.has(e.id))),'Original worked practice missing in one of the five subjects');

assert(merged.filter(e=>e.parts.length===0).length<30,'Verified expansion did not reduce source-only count');
assert(parts>=223,'Expected at least 223 documented guided subquestions');
assert.equal(new Set(data.exercises.map(e=>e.id)).size,82,'Duplicate exercise IDs');
for(const e of data.exercises){
 assert(data.subjects.some(s=>s.id===e.subject),'Unknown subject in '+e.id);
 assert(Array.isArray(e.parts),'Invalid subparts '+e.id);
 for(const p of e.parts)assert(p.label&&p.question,'Subpart missing label/question '+e.id);
}
assert(!JSON.stringify(data).includes('sourceQuestionText'),'Original instructor text in public data');
assert(!JSON.stringify(data).includes('data:image/'),'Private image data leaked');
assert(!JSON.stringify(ext).includes('data:image/'),'Private images in independent derivations');
assert(!JSON.stringify(originals).includes('data:image/'),'Private images leaked into original practice data');
assert(!JSON.stringify(sourced).includes('data:image/'),'Private images leaked into source-backed reconstruction');
cp.execFileSync(process.execPath,[file('tools/build_public.cjs')],{cwd:root,stdio:'inherit'});
for(const name of ['index.html','app.js','cloud.js','cloud-config.js','styles.css','cloud.css','brand-ui.css','inline-solutions.css','a4-paper.css','source-library.css','source-library.mjs','visuals.css','visuals.mjs','assets/eeit-study-hub-logo.webp','sw.js','data/content.json','data/verified-expansion.json','data/pdf-catalog.json','data/original-practice-reworked.json','data/source-backed-derivations.json','assets/favicon.svg'])
 assert(fs.existsSync(file('public/'+name)),'Missing public file '+name);
assert(!fs.existsSync(file('public/assets/questions')),'Original course page images published');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
assert(!walk(file('public')).some(x=>x.toLowerCase().endsWith('.pdf')),'Private PDF leaked');
for(const name of ['source/app.js','source/cloud.js','source/visuals.mjs','source/source-library.mjs'])cp.execFileSync(process.execPath,['--check',file(name)],{cwd:root,stdio:'inherit'});
cp.execFileSync(process.execPath,[file('tools/visuals_check.mjs')],{cwd:root,stdio:'inherit'});
const index=fs.readFileSync(file('source/index.html'),'utf8');
assert(index.includes('inline-solutions.css'),'Inline solution stylesheet not loaded');
assert(!index.includes('enhancements.js')&&!index.includes('reason-ui.js'),'Popup scripts must not be loaded');
const fullSource=fs.readFileSync(file('source/app.js'),'utf8');
assert(fullSource.includes('Overall Solution'),'Start-to-finish solution renderer missing');
assert(fullSource.includes('paper-part')&&fullSource.includes('COMPLETE WORKING · FROM START TO FINISH'),'Full paper solution not present');
assert(!fullSource.includes('showPartExplanation('),'Explanation popup should be removed');
assert(!fullSource.includes('Overall Solution / Final Answer Summary'),'Old short answer recap is still present');
assert(index.includes('a4-paper.css'),'A4 white-paper CSS not referenced');
assert(fullSource.includes('paper-workline-label'),'Given-to-check step rendering missing');
assert(fullSource.includes('original-practice-reworked.json'),'Original practice data not fetched');
assert(fullSource.includes('source-backed-derivations.json'),'Source-backed tutorial reconstruction not fetched');
assert(fullSource.includes('Exam-readiness status: not yet certified'),'Exam audit is missing the proper caveat');
assert(fs.readFileSync(file('source/sw.js'),'utf8').includes('original-practice-reworked.json'),'Original practice data not precached offline');
assert(fs.readFileSync(file('source/sw.js'),'utf8').includes('source-backed-derivations.json'),'Original tutorial reconstructions not precached offline');
assert(index.includes('source-library.css')&&index.includes('source-library.mjs'),'Private original document library not loaded');

assert(fullSource.includes("['documents','PDF Document Library'"),'PDF document navigation is missing');
assert(fullSource.includes('data-eeit-document-library'),'PDF catalog page missing');
assert(fullSource.includes("route==='documents'?documentLibrary()"),'PDF document route not connected');
const pdfModule=fs.readFileSync(file('source/source-library.mjs'),'utf8');
assert(pdfModule.includes('pdf-catalog.json'),'PDF module does not load catalog');
assert(pdfModule.includes('data-document-bulk'),'Bulk PDF onboarding missing');
assert(pdfModule.includes('data-document-zip'),'ZIP archive onboarding missing');
assert(pdfModule.includes('zipDirectory')&&pdfModule.includes('zipMember'),'ZIP archive parser missing');
assert(pdfModule.includes('findZipCatalogMatch'),'ZIP source path matching missing');
assert(pdfModule.includes('dataset.documentPage'),'PDF deep-page viewer links missing');

assert(pdfModule.includes('dataset.documentDrive'),'Drive PDF control is not rendered');
assert(pdfModule.includes('document-match-exact'),'Exact-source match banner missing');
assert(pdfModule.includes('document-match-related'),'Lecture-only reference label missing');
assert(pdfModule.includes('pdf-coverage-audit'),'Exam source coverage dashboard missing');
assert(fullSource.includes('data-source-only'),'Source-only warning missing from exercise Source tab');
assert(pdfModule.includes('drive.google.com/file/d/'),'Private Google Drive preview is not connected');
assert(pdfModule.includes('Owner-restricted Google Drive'),'Drive account permissions not explained');
assert(fullSource.includes('All 123 PDF files are stored'),'Private PDF completion text missing');

assert(pdfModule.includes("KEY_PREFIX='catalog:'"),'Individual PDF keys not implemented');
assert(pdfModule.includes('file.slice(0,5).text()'),'PDF header verification missing');
assert(!pdfModule.includes('fetch(file'),'PDF files must remain private, not uploaded');
assert(fs.readFileSync(file('source/sw.js'),'utf8').includes('pdf-catalog.json'),'PDF catalog not cached by service worker');

assert(fullSource.includes('data-eeit-source-shelf'),'Original PDF attachment panel missing from source tab');
const privateModule=fs.readFileSync(file('source/source-library.mjs'),'utf8');
assert(privateModule.includes('indexedDB')&&privateModule.includes('STORE=')&&privateModule.includes('application/pdf'),'Private source module must store PDFs locally with type restrictions');
assert(!privateModule.includes('fetch('),'Private source documents must never upload via network fetch');
assert(fs.readFileSync(file('source/sw.js'),'utf8').includes('source-library.mjs'),'Private PDF viewer shell not cached offline');
assert(index.includes('visuals.css'),'Visual stylesheet not loaded');
assert(fs.readFileSync(file('source/app.js'),'utf8').includes("from './visuals.mjs'"),'Visual module is not imported');
assert(fs.readFileSync(file('source/app.js'),'utf8').includes('renderVisual(e,visualSettings.get(e.id))'),'Exercise page lacks visual panel');
assert(fs.readFileSync(file('source/sw.js'),'utf8').includes("'./visuals.mjs'"),'Visual module not cached for offline use');
assert(fs.readFileSync(file('source/a4-paper.css'),'utf8').includes('size:A4'),'A4 printing stylesheet missing');
for(const old of ['enhancements.js','enhancements.css','reason-ui.js','reason-ui.css'])
 assert(!fs.existsSync(file('public/'+old)),'Retired popup asset shipped: '+old);
console.log('PASS: 5 subjects; 82 exercise entries; '+parts+' guided subquestions including 63 original-practice calculation chains and at least 34 source-aligned tutorial solutions; '+data.formulas.length+' formulas; PDF catalog metadata entries, local-only PDF reader, public build, syntax and source-rights safeguards.');
