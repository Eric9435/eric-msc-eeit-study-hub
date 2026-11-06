const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const file=(p)=>path.join(root,p);
const content=JSON.parse(fs.readFileSync(file('source/data/content.json'),'utf8'));
assert.equal(content.subjects.length,5,'Expected 5 subjects');
assert.equal(content.exercises.length,31,'Expected 31 exercise sets');
assert.equal(content.formulas.length,34,'Expected 34 formula references');
const ids=content.exercises.map(e=>e.id);
assert.equal(new Set(ids).size,ids.length,'Duplicate exercise IDs');
const known=new Set(content.subjects.map(s=>s.id));
for(const ex of content.exercises){
 assert(known.has(ex.subject),'Unknown subject '+ex.subject);
 if(ex.id.startsWith('original-')){
   assert.equal(ex.parts.length,3,'Original examples should have 3 parts');
   for(const part of ex.parts){
     assert(part.question&&part.solution&&part.reason,'Incomplete original part '+ex.id);
   }
 }
}
cp.execFileSync(process.execPath,[file('tools/build_public.cjs')],{cwd:root,stdio:'inherit'});
for(const name of ['index.html','app.js','cloud.js','cloud-config.js','styles.css','cloud.css','brand-ui.css','assets/eeit-study-hub-logo.webp','sw.js','data/content.json','assets/favicon.svg'])
 assert(fs.existsSync(file('public/'+name)),'Missing published file '+name);
assert(!fs.existsSync(file('public/assets/questions')),'Original questions must never publish');
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]);
assert(!walk(file('public')).some(x=>x.toLowerCase().endsWith('.pdf')),'PDF leaked into public build');
for(const fileName of ['source/app.js','source/cloud.js'])new Function(fs.readFileSync(file(fileName),'utf8'));
console.log('PASS: five subjects; 31 exercises; 34 formulas; syntax; privacy-safe public build.');
