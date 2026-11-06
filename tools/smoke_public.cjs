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
const ext=JSON.parse(fs.readFileSync(file('source/data/verified-expansion.json'),'utf8'));
assert(Array.isArray(ext.overrides)&&ext.overrides.length>=15,'Missing independent derivations');
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
assert(merged.filter(e=>e.parts.length===0).length<30,'Verified expansion did not reduce source-only count');
assert.equal(parts,223,'Expected 193 guided subquestions after validated expansion');
assert.equal(new Set(data.exercises.map(e=>e.id)).size,82,'Duplicate exercise IDs');
for(const e of data.exercises){
 assert(data.subjects.some(s=>s.id===e.subject),'Unknown subject in '+e.id);
 assert(Array.isArray(e.parts),'Invalid subparts '+e.id);
 for(const p of e.parts)assert(p.label&&p.question,'Subpart missing label/question '+e.id);
}
assert(!JSON.stringify(data).includes('sourceQuestionText'),'Original instructor text in public data');
assert(!JSON.stringify(data).includes('data:image/'),'Private image data leaked');
assert(!JSON.stringify(ext).includes('data:image/'),'Private images in independent derivations');
cp.execFileSync(process.execPath,[file('tools/build_public.cjs')],{cwd:root,stdio:'inherit'});
for(const name of ['index.html','app.js','cloud.js','cloud-config.js','styles.css','cloud.css','brand-ui.css','reason-ui.css','reason-ui.js','assets/eeit-study-hub-logo.webp','enhancements.js','enhancements.css','sw.js','data/content.json','data/verified-expansion.json','assets/favicon.svg'])
 assert(fs.existsSync(file('public/'+name)),'Missing public file '+name);
assert(!fs.existsSync(file('public/assets/questions')),'Original course page images published');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
assert(!walk(file('public')).some(x=>x.toLowerCase().endsWith('.pdf')),'Private PDF leaked');
for(const name of ['source/app.js','source/cloud.js','source/reason-ui.js','source/enhancements.js'])new Function(fs.readFileSync(file(name),'utf8'));
assert(fs.readFileSync(file('source/index.html'),'utf8').includes('enhancements.js'),'Popup script not loaded');
console.log('PASS: 5 subjects; 82 exercise entries; '+parts+' guided subquestions including independently verified expansions; '+data.formulas.length+' formulas; public build, syntax and source-rights safeguards.');
