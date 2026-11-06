/* Eric EEIT Document Library: a 92-item source catalog with private browser-only PDF storage.
   No PDF bytes are transmitted to Render, GitHub, Firebase, or the catalog endpoint. */
const DB_NAME='eric-eeit-private-source-pdfs-v1';
const STORE='documents';
const KEY_PREFIX='catalog:';
const MAX_PDF_BYTES=70_000_000;
let catalogPromise=null,activeObjectUrl=null,activeReader=null;
const shelfMap=new WeakMap();
const kindTitles={
 'questions-solutions':'Questions + sample solutions',
 'question':'Original question sheet',
 'solution':'Original sample solutions',
 'past-exam':'Past examination',
 'lecture':'Lecture material',
 'lecture-example':'Lecture worked example',
 'lab':'Laboratory material',
 'reference':'Reference',
 'administrative':'Course information',
 'independent-working':'Independent worked solutions'
};
const courseNames={digital:'Digital Communications',power:'Electrical Power Systems II',control:'Control Systems Theory and Design',microwave:'Microwave Engineering',micro:'Microsystem Engineering',shared:'Shared Study Handbooks'};
function catalog(){return catalogPromise||(catalogPromise=fetch('./data/pdf-catalog.json',{cache:'no-cache'}).then(async r=>{if(!r.ok)throw Error('PDF catalog unavailable ('+r.status+')');const doc=await r.json();if(!Array.isArray(doc.entries)||doc.entries.length<80||!doc.entries.every(e=>e.id&&e.subject&&e.filename))throw Error('Invalid document catalog');return doc;}).catch(e=>{catalogPromise=null;throw e}));}
function openDB(){return new Promise((resolve,reject)=>{
 if(!('indexedDB' in window)){reject(Error('Browser does not support IndexedDB'));return;}
 const r=indexedDB.open(DB_NAME,1);
 r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'key'});};
 r.onsuccess=()=>resolve(r.result);
 r.onerror=()=>reject(r.error||Error('Cannot open local PDF storage'));
});}
async function dbOp(mode,work){const db=await openDB();try{return await new Promise((resolve,reject)=>{
 const tx=db.transaction(STORE,mode),st=tx.objectStore(STORE);let value;
 try{const req=work(st);if(req){req.onsuccess=()=>{value=req.result};req.onerror=()=>reject(req.error||Error('Database operation failed'))}}catch(e){reject(e);return;}
 tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error||Error('Database transaction failed'));
 tx.onabort=()=>reject(tx.error||Error('Database transaction aborted'));
});}finally{db.close()}}
const fetchAll=()=>dbOp('readonly',st=>st.getAll());
const putDoc=r=>dbOp('readwrite',st=>st.put(r));
const dropDoc=id=>dbOp('readwrite',st=>st.delete(KEY_PREFIX+id));
const docKey=id=>KEY_PREFIX+id;
const element=(tag,klass,text)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(text!==undefined)n.textContent=text;return n;};
const describe=e=>e.note||'Listed in the TUHH course PDF source inventory. Attach your locally authorized PDF copy to view it.';
const displayType=e=>kindTitles[e.kind]||e.kind;
function setMessage(host,message,error=false){const target=host.querySelector('[data-document-message]');if(target){target.textContent=message;target.dataset.error=error?'true':'false';}}
function releaseReader(){if(activeObjectUrl){URL.revokeObjectURL(activeObjectUrl);activeObjectUrl=null}activeReader=null;}
function recordIndex(records){return new Map(records.filter(r=>r&&r.key).map(r=>[r.key,r]))}
function makeCard(entry,records,exerciseId){
 const saved=records.get(docKey(entry.id)),inDrive=Boolean(entry.drive_id);
 const article=element('article','document-entry');article.dataset.docId=entry.id;
 const intro=element('div','document-entry-intro');
 intro.append(element('div','document-kind',displayType(entry)));
 intro.append(element('h3','document-entry-title',entry.title));
 intro.append(element('p','document-entry-filename',entry.filename));
 const meta=element('div','document-entry-meta');
 meta.append(element('span','',entry.pages?String(entry.pages)+' pages':'Pages not indexed'));
 meta.append(element('span','',inDrive?'Owner-restricted Google Drive':entry.recordType==='library-file-identified'?'Named Library source':'Archived reference'));
 meta.append(element('span',inDrive||saved?'document-state-present':'document-state-missing',saved?'Saved locally':inDrive?'Private PDF ready':'No PDF connected'));
 const pages=exerciseId&&entry.exercisePages?.[exerciseId];
 const related=Boolean(exerciseId&&entry.relatedExerciseIds?.includes(exerciseId));
 if(pages){
  const citation=[pages.question?'Original question p. '+pages.question:null,pages.solution?'Sample solution p. '+pages.solution:null].filter(Boolean).join(' · ');
  if(citation)meta.append(element('span','document-page-reference',citation));
 }else if(related){
  meta.append(element('span','document-reference-related','Related lecture only — NOT the original exercise or its solution'));
 }
 intro.append(meta);
 if(entry.note&&entry.recordType==='library-file-identified')intro.append(element('p','document-entry-note',entry.note));
 article.append(intro);
 const controls=element('div','document-entry-actions');
 if(inDrive){
  const open=element('button','document-attach document-cloud-read',related?'Read related lecture':pages?'Read original question / solution':'Read course PDF');
  open.type='button';open.dataset.documentDrive=entry.drive_id;open.dataset.documentEntry=entry.id;controls.append(open);
  if(pages){for(const [kind,page] of Object.entries(pages)){
   if(!Number.isInteger(page)||page<=0)continue;
   const direct=element('button','document-secondary','Open '+(kind==='question'?'question':'solution')+' p. '+page);
   direct.type='button';direct.dataset.documentDrive=entry.drive_id;direct.dataset.documentEntry=entry.id;direct.dataset.documentPage=String(page);controls.append(direct);
  }}
 }
 const label=element('label','document-secondary document-local-attach',saved?'Replace offline PDF':'Attach offline PDF');
 const input=element('input');input.type='file';input.accept='.pdf,application/pdf';input.dataset.documentAttach=entry.id;
 input.setAttribute('aria-label','Attach local copy of '+entry.title);
 label.append(input);controls.append(label);
 if(saved){
  const view=element('button','document-secondary','Read local PDF');view.type='button';view.dataset.documentRead=entry.id;controls.append(view);
  const remove=element('button','document-secondary','Remove local');remove.type='button';remove.dataset.documentRemove=entry.id;controls.append(remove);
 }
 article.append(controls);
 return article;
}
const kindOrder={'questions-solutions':0,'question':1,'solution':2,'past-exam':3,'independent-working':4,'lab':5,'lecture-example':6,'lecture':7,'reference':8,'administrative':9};
const ranked=(a,b)=>Number(Boolean(b.drive_id))-Number(Boolean(a.drive_id))||(kindOrder[a.kind]??10)-(kindOrder[b.kind]??10)||a.filename.localeCompare(b.filename);
function renderLibrary(host,doc,all){
 const previousSearch=host.querySelector('[data-document-search]')?.value||'';
 const previousSubject=host.querySelector('[data-document-course]')?.value||'all';
 const previousKind=host.querySelector('[data-document-kind]')?.value||'all';
 const records=recordIndex(all);
 host.replaceChildren();
 const heading=element('div','document-library-header');
 heading.append(element('h2','','Course PDF library'));
 heading.append(element('p','','Browse private course material: exercise sheets, sample solutions, previous exams, lecture slides, labs and independent study notes. PDF count is not the same as exam coverage.'));
 host.append(heading);
 const count=element('div','document-counts');
 const attached=doc.entries.filter(x=>records.has(docKey(x.id))).length,driveCount=doc.entries.filter(x=>x.drive_id).length;
 count.append(element('strong','',driveCount+' course-related PDFs in private Google Drive'));
 count.append(element('span','',doc.entries.length+' catalog entries'));
 count.append(element('span','',attached+' locally saved'));
 count.append(element('span','','Sign in to the private Drive owner account to read source PDFs.'));
 host.append(count);
 if(doc.examCoverage){
  const audit=doc.examCoverage;
  const overview=element('section','pdf-coverage-audit');
  overview.append(element('h3','','Exercise-to-original PDF coverage'));
  const stats=element('div','pdf-coverage-figures');
  for(const [number,label] of [
   [audit.fullyLinkedOriginal+' / '+audit.exerciseEntries,'Exact original Question + Solution links'],
   [String(audit.lectureReferenceOnly),'Topic-related lecture references only'],
   [String(audit.standaloneOrUnlinked),'Independent practice or no direct source'],
   [String(audit.sourceOnlyWithoutSolution),'Exercise sets without full worked solutions']
  ]){
   const item=element('div','pdf-coverage-item');
   item.append(element('strong','',number));
   item.append(element('span','',label));
   stats.append(item);
  }
  overview.append(stats);
  overview.append(element('p','pdf-coverage-explainer','All 123 uploaded PDFs include lectures, laboratories, past exams and handbooks. They are not 123 unique exercise sheets. Exact links are verified against uploaded PDF problem headings; lecture references are labelled separately. The full syllabus and mathematical answers have NOT been certified complete.'));
  host.append(overview);
 }
 const filters=element('div','document-filters');
 const search=element('input');search.type='search';search.placeholder='Search filename, chapter or type';search.value=previousSearch;search.dataset.documentSearch='yes';search.setAttribute('aria-label','Search PDF catalog');filters.append(search);
 const sub=element('select');sub.dataset.documentCourse='yes';sub.setAttribute('aria-label','Filter PDF by subject');
 for(const [id,name] of [['all','All 5 subjects'],...Object.entries(courseNames)]){const opt=element('option','',name);opt.value=id;sub.append(opt)}sub.value=previousSubject;filters.append(sub);
 const kinds=[...new Set(doc.entries.map(x=>x.kind))].sort();
 const type=element('select');type.dataset.documentKind='yes';type.setAttribute('aria-label','Filter PDF by type');
 for(const [id,name] of [['all','All document types'],...kinds.map(x=>[x,kindTitles[x]||x])]){const opt=element('option','',name);opt.value=id;type.append(opt)}type.value=previousKind;filters.append(type);
 host.append(filters);
 const bulk=element('div','document-bulk-bar');
 const bulkIntro=element('div','document-bulk-intro');
 bulkIntro.append(element('strong','','Add several PDFs at once'));
 bulkIntro.append(element('span','','Exact filenames are matched automatically to individual catalog records. Unrecognized or ambiguous filenames are skipped.'));
 bulk.append(bulkIntro);
 const bulkLabel=element('label','document-attach','Choose PDF files');
 const bulkInput=element('input');bulkInput.type='file';bulkInput.accept='.pdf,application/pdf';bulkInput.multiple=true;bulkInput.dataset.documentBulk='yes';
 bulkInput.setAttribute('aria-label','Attach multiple PDFs by matching filenames');
 bulkLabel.append(bulkInput);bulk.append(bulkLabel);
 const archiveLabel=element('label','document-attach document-zip-attach','Import course ZIP archive');
 const archiveInput=element('input');archiveInput.type='file';archiveInput.accept='.zip,application/zip,application/x-zip-compressed';
 archiveInput.dataset.documentZip='yes';archiveInput.setAttribute('aria-label','Import original course PDFs from one ZIP archive');
 archiveLabel.append(archiveInput);bulk.append(archiveLabel);
 host.append(bulk);
 const grid=element('div','document-list-grid');grid.dataset.documentEntries='yes';host.append(grid);
 const notice=element('p','document-library-notice','Your original PDFs are stored in private Google Drive, not publicly on GitHub or Render. Browser-local import remains optional for offline reading; clearing browser data can remove local copies only.');host.append(notice);
 const update=()=>{const q=search.value.trim().toLowerCase(),subject=sub.value,kind=type.value;grid.replaceChildren();
 const filtered=doc.entries.filter(x=>(subject==='all'||x.subject===subject)&&(kind==='all'||x.kind===kind)&&(!q||[x.filename,x.title,x.note||'',courseNames[x.subject],displayType(x)].join(' ').toLowerCase().includes(q))).sort(ranked);
 if(!filtered.length){grid.append(element('p','document-empty','No PDF records match your filters.'));return;}
 const groups=subject==='all'?Object.keys(courseNames):[subject];
 for(const course of groups){const matches=filtered.filter(x=>x.subject===course);if(!matches.length)continue;const section=element('section','document-course-section');
 const head=element('h3','document-course-title',courseNames[course]+' · '+matches.length+' files');section.append(head);
 const rows=element('div','document-cards');for(const entry of matches)rows.append(makeCard(entry,records));section.append(rows);grid.append(section)}
 };
 for(const el of [search,sub,type])el.addEventListener(el===search?'input':'change',update);
 update();
 const reader=element('div','document-main-reader');reader.dataset.documentReader='yes';host.append(reader);
}
function renderShelf(host,doc,all){
 const course=host.dataset.course,exerciseId=host.dataset.exercise,records=recordIndex(all);
 const subjectDocs=doc.entries.filter(e=>e.subject===course&&e.drive_id);
 const exact=subjectDocs.filter(e=>e.exercisePages?.[exerciseId]).sort((a,b)=>(a.kind==='question'?0:1)-(b.kind==='question'?0:1)||ranked(a,b));
 const related=subjectDocs.filter(e=>!e.exercisePages?.[exerciseId]&&e.relatedExerciseIds?.includes(exerciseId)).sort(ranked);
 const others=subjectDocs.filter(e=>!exact.includes(e)&&!related.includes(e)).sort(ranked);
 const isSourceOnly=host.dataset.sourceOnly==='true';
 const legacy=all.filter(x=>x.key===course+':question'||x.key===course+':solution');
 host.replaceChildren();
 host.append(element('h3','','Original exercise and solution PDFs'));
 const status=element('div',exact.length?'document-match-exact':related.length?'document-match-related':'document-match-unlinked');
 status.append(element('strong','',exact.length?'Original question / answer source found':related.length?'Related lecture materials only':'No exact original PDF link for this practice'));
 status.append(element('p','',exact.length?
  'Verified problem headings in the uploaded source PDFs. The question and sample-answer page links below refer to the real Drive files.':
  related.length?'The PDFs below explain the topic, but do not contain a verified copy of this specific question and its official solution.':
  'This exercise may be independently authored. Course files below are background references, not a claim of an official source or answer.'));
 host.append(status);
 if(isSourceOnly){
  const pending=element('p','document-source-pending','Full independent worked solution for this exercise is still incomplete. The original source PDF is provided where available; this is NOT yet exam-certified.');
  host.append(pending);
 }
 const list=element('div','document-cards');
 const selected=[...exact,...related,...others.slice(0,Math.max(0,Math.min(3,6-exact.length-related.length)))];
 for(const entry of selected)list.append(makeCard(entry,records,exerciseId));
 host.append(list);
 if(legacy.length){
  const section=element('div','document-legacy');
  section.append(element('h4','','Previously attached browser-only PDFs'));
  for(const item of legacy){
   const row=element('div','document-legacy-row');
   row.append(element('span','',item.filename||'Previous PDF'));
   const button=element('button','document-secondary','Read earlier attachment');button.type='button';
   button.dataset.documentLegacyRead=item.key;row.append(button);section.append(row)
  }
  host.append(section);
 }
 const link=element('a','document-all-link','Browse all '+(courseNames[course]||'subject')+' PDFs');
 link.href='#documents';host.append(link);
 const reader=element('div','document-main-reader');reader.dataset.documentReader='yes';host.append(reader);
}
async function refreshHost(host){if(!host.isConnected)return;try{const [doc,all]=await Promise.all([catalog(),fetchAll().catch(()=>[])]);
 if(!host.isConnected)return;
 if(host.hasAttribute('data-eeit-document-library'))renderLibrary(host,doc,all);
 else renderShelf(host,doc,all);
 }catch(e){host.replaceChildren(element('p','document-error','PDF library unavailable: '+e.message))}}
async function refreshVisible(){for(const host of document.querySelectorAll('[data-eeit-document-library],[data-eeit-source-shelf]'))await refreshHost(host)}
function closeObsoleteReader(){if(activeReader&&!activeReader.isConnected)releaseReader()}
function scan(){closeObsoleteReader();document.querySelectorAll('[data-eeit-document-library]:not([data-pdf-initialized]),[data-eeit-source-shelf]:not([data-pdf-initialized])').forEach(host=>{host.dataset.pdfInitialized='true';void refreshHost(host)})}
function findEntry(id,doc){return doc.entries.find(e=>e.id===id)}
function getHost(node){return node.closest('[data-eeit-document-library],[data-eeit-source-shelf]')}
function setHostStatus(host,text,isError){let status=host.querySelector('[data-document-operation]');
 if(!status){status=element('p','document-operation');status.dataset.documentOperation='yes';host.prepend(status)}
 status.textContent=text;status.dataset.error=isError?'true':'false'}
async function readRecord(host,record,page){if(!record||!record.blob)return;
 releaseReader();
 const container=host.querySelector('[data-document-reader]');if(!container)return;
 container.replaceChildren();
 const header=element('div','document-reader-top');
 header.append(element('strong','',record.filename));
 const url=URL.createObjectURL(record.blob);activeObjectUrl=url;activeReader=container;
 const selectedUrl=Number.isInteger(page)&&page>0?url+'#page='+page:url;
 const link=element('a','document-reader-open','Open in a new browser tab');link.href=selectedUrl;link.target='_blank';link.rel='noopener noreferrer';header.append(link);
 const close=element('button','document-secondary','Close reader');close.type='button';close.dataset.documentClose='yes';header.append(close);
 container.append(header);
 const iframe=element('iframe','document-pdf-frame');iframe.src=selectedUrl;iframe.loading='lazy';iframe.title='Local PDF '+record.filename;container.append(iframe);
 container.append(element('p','document-reader-note','On Android, the browser may open the original PDF in a separate tab if inline PDF rendering is not supported.'));
 container.scrollIntoView({behavior:'smooth',block:'nearest'});
}

/* Safe, client-only ZIP archive importer. Reads central directory and individually
   verifies matching PDF members. Original PDF bytes never leave this browser. */
const ZIP_MAX_BYTES=700_000_000;
const ZIP_MAX_ENTRIES=1600;
const ZIP_MAX_EXTRACTED=550_000_000;
const ZIP_TEXT=new TextDecoder('utf-8',{fatal:false});
const zipNormalize=name=>String(name).normalize('NFKC').replace(/\\/g,'/').replace(/^\.\//,'').toLowerCase();
const zipBasename=name=>zipNormalize(name).split('/').pop();
function findZipCatalogMatch(member,manifest){
 const path=zipNormalize(member),base=zipBasename(member);
 const exact=manifest.entries.filter(x=>zipNormalize(x.path||x.filename)===path||path.endsWith('/'+zipNormalize(x.path||x.filename)));
 if(exact.length===1)return exact[0];
 if(exact.length>1)return null;
 const names=manifest.entries.filter(x=>zipBasename(x.filename)===base);
 return names.length===1?names[0]:null;
}
async function zipDirectory(file){
 if(file.size>ZIP_MAX_BYTES)throw Error('ZIP file exceeds 700 MB. Split it into smaller archives.');
 const tailSize=Math.min(file.size,65557);
 const tail=new DataView(await file.slice(file.size-tailSize).arrayBuffer());
 let eocd=-1;
 for(let p=tail.byteLength-22;p>=0;p--){
  if(tail.getUint32(p,true)===0x06054b50){eocd=p;break}
 }
 if(eocd<0)throw Error('ZIP central-directory footer not found.');
 if(tail.getUint16(eocd+4,true)!==0||tail.getUint16(eocd+6,true)!==0)throw Error('Multi-disk ZIP files are not supported.');
 const total=tail.getUint16(eocd+10,true),length=tail.getUint32(eocd+12,true),offset=tail.getUint32(eocd+16,true);
 if(total===65535||offset===0xffffffff||length===0xffffffff)throw Error('ZIP64 archive is not supported; select smaller ZIP files.');
 if(total>ZIP_MAX_ENTRIES)throw Error('Too many files in ZIP archive.');
 if(offset+length>file.size)throw Error('Invalid ZIP central directory offset.');
 const view=new DataView(await file.slice(offset,offset+length).arrayBuffer());
 const output=[];let pos=0;
 for(let i=0;i<total;i++){
  if(pos+46>view.byteLength||view.getUint32(pos,true)!==0x02014b50)throw Error('Invalid ZIP central directory item '+(i+1));
  const flags=view.getUint16(pos+8,true),method=view.getUint16(pos+10,true),size=view.getUint32(pos+20,true),expanded=view.getUint32(pos+24,true);
  const nameLength=view.getUint16(pos+28,true),extra=view.getUint16(pos+30,true),comment=view.getUint16(pos+32,true);
  const local=view.getUint32(pos+42,true);
  if(pos+46+nameLength+extra+comment>view.byteLength)throw Error('Truncated ZIP directory.');
  const name=ZIP_TEXT.decode(new Uint8Array(view.buffer,view.byteOffset+pos+46,nameLength));
  output.push({name,flags,method,size,expanded,local});
  pos+=46+nameLength+extra+comment;
 }
 return output;
}
async function zipMember(file,item){
 if(item.flags&1)throw Error('Password-protected PDF not supported.');
 if(item.expanded>MAX_PDF_BYTES||item.size>MAX_PDF_BYTES)throw Error('PDF member exceeds 70 MB.');
 if(![0,8].includes(item.method))throw Error('Unsupported ZIP compression: '+item.method);
 const head=new DataView(await file.slice(item.local,item.local+30).arrayBuffer());
 if(head.byteLength<30||head.getUint32(0,true)!==0x04034b50)throw Error('Invalid local ZIP member header');
 const dataStart=item.local+30+head.getUint16(26,true)+head.getUint16(28,true);
 if(dataStart+item.size>file.size)throw Error('ZIP member exceeds archive bounds');
 const compressed=file.slice(dataStart,dataStart+item.size);
 let pdf;
 if(item.method===0)pdf=compressed;
 else{
  if(typeof DecompressionStream!=='function')throw Error('This browser cannot decompress ZIP files.');
  const stream=compressed.stream().pipeThrough(new DecompressionStream('deflate-raw'));
  pdf=await new Response(stream).blob();
 }
 if(pdf.size!==item.expanded||pdf.size>MAX_PDF_BYTES)throw Error('PDF ZIP member size mismatch');
 if((await pdf.slice(0,5).text())!=='%PDF-')throw Error('ZIP member is not a PDF file');
 return pdf;
}
async function importZipArchive(host,file){
 if(!/\.zip$/i.test(file.name))throw Error('Please choose a .zip archive.');
 const items=await zipDirectory(file),manifest=await catalog();
 let matched=0,ignored=0,failed=0,extracted=0;
 const importedIds=new Set(),errors=[];
 const pdfs=items.filter(x=>x.name.toLowerCase().endsWith('.pdf')&&!x.name.endsWith('/'));
 setHostStatus(host,'Importing PDFs from ZIP locally: 0 / '+pdfs.length+'. Keep this page open.',false);
 for(const member of pdfs){
  const record=findZipCatalogMatch(member.name,manifest);
  if(!record||importedIds.has(record.id)){ignored++;continue}
  if(extracted+member.expanded>ZIP_MAX_EXTRACTED){failed++;errors.push('Archive expansion limit reached');break}
  try{
   const pdf=await zipMember(file,member);
   await putDoc({key:docKey(record.id),id:record.id,subject:record.subject,filename:member.name.split('/').pop(),
    blob:pdf,size:pdf.size,savedAt:Date.now(),sourceArchive:file.name});
   extracted+=pdf.size;importedIds.add(record.id);matched++;
  }catch(error){failed++;if(errors.length<3)errors.push(member.name+': '+error.message)}
  if((matched+failed)%5===0)setHostStatus(host,'ZIP import: '+matched+' attached · '+ignored+' unmatched · '+failed+' failed.',failed>0);
 }
 await refreshHost(host);
 const status=matched+' PDFs attached privately from '+file.name+'. '+ignored+' not uniquely matched and '+failed+' failed.';
 setHostStatus(host,status+(errors.length?' '+errors.join('; '):''),failed>0);
}

document.addEventListener('change',async event=>{
 const zip=event.target.closest?.('[data-document-zip]');
 if(zip){
  const host=getHost(zip),file=zip.files?.[0];zip.value='';
  if(host&&file){try{await importZipArchive(host,file)}catch(error){setHostStatus(host,'ZIP import failed: '+error.message,true)}}
  return;
 }
 const multi=event.target.closest?.('[data-document-bulk]');
 if(multi){
  const host=getHost(multi),files=Array.from(multi.files||[]);multi.value='';
  if(!host||!files.length)return;
  const norm=n=>String(n).normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,'');
  try{
   const all=await catalog(),byName=new Map();
   for(const item of all.entries){const name=norm(item.filename);if(!byName.has(name))byName.set(name,[]);byName.get(name).push(item)}
   let added=0,skipped=0,failed=0;
   for(const file of files){
    const matches=byName.get(norm(file.name))||[];
    if(matches.length!==1){skipped++;continue}
    if(file.size>MAX_PDF_BYTES||!file.name.toLowerCase().endsWith('.pdf')){failed++;continue}
    try{
     if((await file.slice(0,5).text())!=='%PDF-'){failed++;continue}
     const entry=matches[0];
     await putDoc({key:docKey(entry.id),id:entry.id,subject:entry.subject,filename:file.name,blob:file,size:file.size,savedAt:Date.now()});
     added++;
    }catch{failed++}
   }
   await refreshHost(host);
   setHostStatus(host,added+' PDF files attached locally. '+skipped+' filenames not uniquely matched; '+failed+' files rejected.',failed>0);
  }catch(error){setHostStatus(host,'Unable to attach PDF collection: '+error.message,true)}
  return;
 }
 const input=event.target.closest?.('[data-document-attach]');if(!input)return;
 const host=getHost(input),file=input.files?.[0],id=input.dataset.documentAttach;input.value='';if(!host||!file||!id)return;
 try{
  const doc=await catalog(),entry=findEntry(id,doc);if(!entry)throw Error('Unknown document record');
  if(file.size>MAX_PDF_BYTES)throw Error('This PDF exceeds the 70 MB on-device limit');
  if(!/\.pdf$/i.test(file.name))throw Error('Please select a PDF file');
  const signature=await file.slice(0,5).text();
  if(signature!=='%PDF-')throw Error('This file is not a valid PDF document header');
  // Explicit per-record attachment; accidental wrong-file matching is never treated as verified.
  await putDoc({key:docKey(id),id,subject:entry.subject,filename:file.name,blob:file,size:file.size,savedAt:Date.now()});
  await refreshHost(host);
  setHostStatus(host,'Attached privately: '+file.name+'. Check the source before using its answers.',false);
 }catch(e){setHostStatus(host,'Unable to attach PDF: '+e.message,true)}
});
document.addEventListener('click',async event=>{
 const drive=event.target.closest?.('[data-document-drive]'),
  read=event.target.closest?.('[data-document-read]'),
  remove=event.target.closest?.('[data-document-remove]'),
  legacy=event.target.closest?.('[data-document-legacy-read]'),
  close=event.target.closest?.('[data-document-close]');
 const hit=drive||read||remove||legacy||close;if(!hit)return;
 const host=getHost(hit);if(!host)return;
 if(close){releaseReader();host.querySelector('[data-document-reader]')?.replaceChildren();return}
 try{
  if(drive){
   const id=drive.dataset.documentDrive,entryId=drive.dataset.documentEntry;
   if(!/^[A-Za-z0-9_-]{10,160}$/.test(id||''))throw Error('Invalid Drive PDF identifier');
   const doc=await catalog(),entry=doc.entries.find(e=>e.id===entryId&&e.drive_id===id);
   if(!entry)throw Error('Unrecognized PDF in private source catalog');
   const page=Number(drive.dataset.documentPage)||0;
   releaseReader();
   const container=host.querySelector('[data-document-reader]');
   if(!container)throw Error('PDF reader unavailable');
   container.replaceChildren();
   const view='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view'+(page?'#page='+page:'');
   const preview='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview'+(page?'#page='+page:'');
   const header=element('div','document-reader-top');
   header.append(element('strong','',entry.filename+(page?' · Page '+page:'')));
   const link=element('a','document-reader-open','Open original PDF in Google Drive');
   link.href=view;link.target='_blank';link.rel='noopener noreferrer';header.append(link);
   const closeButton=element('button','document-secondary','Close reader');
   closeButton.type='button';closeButton.dataset.documentClose='yes';header.append(closeButton);
   container.append(header);
   const frame=element('iframe','document-pdf-frame');
   frame.title='Private original PDF: '+entry.filename;frame.loading='lazy';
   frame.referrerPolicy='no-referrer';frame.src=preview;container.append(frame);
   container.append(element('p','document-reader-note','Owner-restricted Google Drive: use the Google account that owns this PDF. If inline preview fails because of mobile browser cookies, use Open original PDF in Google Drive above.'));
   activeReader=container;
   container.scrollIntoView({behavior:'smooth',block:'nearest'});
   return;
  }
  if(legacy){const item=await dbOp('readonly',st=>st.get(legacy.dataset.documentLegacyRead));if(item)await readRecord(host,item);return}
  const id=(read?.dataset.documentRead||remove?.dataset.documentRemove),item=await dbOp('readonly',st=>st.get(docKey(id)));
  if(read){if(item)await readRecord(host,item,Number(read.dataset.documentPage)||null);else setHostStatus(host,'PDF not yet attached on this device.',true);return}
  if(remove&&item&&confirm('Remove this private PDF copy from the browser?')){
   if(activeReader?.closest('[data-eeit-document-library],[data-eeit-source-shelf]')===host)releaseReader();
   await dropDoc(id);await refreshHost(host);setHostStatus(host,'Local PDF removed. The catalog record remains.',false);
  }
 }catch(e){setHostStatus(host,'Document operation failed: '+e.message,true)}
});
const observer=new MutationObserver(scan);
observer.observe(document.documentElement,{childList:true,subtree:true});
scan();
