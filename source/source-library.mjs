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
const courseNames={digital:'Digital Communications',power:'Electrical Power Systems II',control:'Control Systems Theory and Design',microwave:'Microwave Engineering',micro:'Microsystem Engineering'};
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
function makeCard(entry,records){const saved=records.get(docKey(entry.id));const article=element('article','document-entry');article.dataset.docId=entry.id;
 const intro=element('div','document-entry-intro');intro.append(element('div','document-kind',displayType(entry)));
 const name=element('h3','document-entry-title',entry.title);intro.append(name);
 intro.append(element('p','document-entry-filename',entry.filename));
 const meta=element('div','document-entry-meta');
 meta.append(element('span','',entry.pages?String(entry.pages)+' pages':'Pages not indexed'));
 meta.append(element('span','',entry.recordType==='library-file-identified'?'Named Library source':'Archived PDF reference'));
 const state=element('span',saved?'document-state-present':'document-state-missing',saved?'Saved on this device':'Not attached');meta.append(state);
 intro.append(meta);
 if(entry.note&&entry.recordType==='library-file-identified')intro.append(element('p','document-entry-note',entry.note));
 article.append(intro);
 const controls=element('div','document-entry-actions');
 const label=element('label','document-attach',saved?'Replace PDF':'Attach PDF');
 const input=element('input');input.type='file';input.accept='.pdf,application/pdf';input.dataset.documentAttach=entry.id;input.setAttribute('aria-label','Attach '+entry.title+' as PDF');label.append(input);controls.append(label);
 if(saved){const view=element('button','document-secondary','Read PDF');view.type='button';view.dataset.documentRead=entry.id;controls.append(view);
 const remove=element('button','document-secondary','Remove');remove.type='button';remove.dataset.documentRemove=entry.id;controls.append(remove)}
 article.append(controls);return article}
const ranked=(a,b)=>{const x=a.recordType==='library-file-identified'?0:1,y=b.recordType==='library-file-identified'?0:1;return x-y||a.filename.localeCompare(b.filename)};
function renderLibrary(host,doc,all){
 const previousSearch=host.querySelector('[data-document-search]')?.value||'';
 const previousSubject=host.querySelector('[data-document-course]')?.value||'all';
 const previousKind=host.querySelector('[data-document-kind]')?.value||'all';
 const records=recordIndex(all);
 host.replaceChildren();
 const heading=element('div','document-library-header');
 heading.append(element('h2','','Course PDF library'));
 heading.append(element('p','','Browse the 81 archived TUHH source references and identified Library PDFs. Each document has its own private attach/read control. No instructor PDF is publicly hosted.'));
 host.append(heading);
 const count=element('div','document-counts');
 const attached=doc.entries.filter(x=>records.has(docKey(x.id))).length;
 count.append(element('strong','',doc.entries.length+' indexed source records'));
 count.append(element('span','',attached+' attached in this browser'));
 count.append(element('span','','Local files do not sync with Google Sign-In'));
 host.append(count);
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
 host.append(bulk);
 const grid=element('div','document-list-grid');grid.dataset.documentEntries='yes';host.append(grid);
 const notice=element('p','document-library-notice','Catalog metadata is not a downloadable PDF. To read the actual source file here, attach your own copy. Course PDFs remain in your local browser storage unless you remove them or clear browser data.');host.append(notice);
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
function renderShelf(host,doc,all){const course=host.dataset.course;const records=recordIndex(all);const entries=doc.entries.filter(e=>e.subject===course&&e.recordType==='library-file-identified').sort(ranked);const legacy=all.filter(x=>x.key===course+':question'||x.key===course+':solution');
 host.replaceChildren();
 host.append(element('h3','','Original PDF references for this exercise'));
 host.append(element('p','source-shelf-intro','Source files are kept privately on this device. Match the original question, sample solution and independent working against the white-paper derivation.'));
 const list=element('div','document-cards');for(const entry of entries)list.append(makeCard(entry,records));host.append(list);
 if(legacy.length){const section=element('div','document-legacy');section.append(element('h4','','Previously attached course files'));
 for(const item of legacy){const row=element('div','document-legacy-row');
 row.append(element('span','',item.filename||'Previous PDF'));
 const button=element('button','document-secondary','Read earlier attachment');button.type='button';button.dataset.documentLegacyRead=item.key;row.append(button);section.append(row)}host.append(section)}
 const link=element('a','document-all-link','See all PDFs for '+(courseNames[course]||'this subject'));link.href='#documents';host.append(link);
 const reader=element('div','document-main-reader');reader.dataset.documentReader='yes';host.append(reader);
}
async function refreshHost(host){if(!host.isConnected)return;try{const [doc,all]=await Promise.all([catalog(),fetchAll()]);
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
async function readRecord(host,record){if(!record||!record.blob)return;
 releaseReader();
 const container=host.querySelector('[data-document-reader]');if(!container)return;
 container.replaceChildren();
 const header=element('div','document-reader-top');
 header.append(element('strong','',record.filename));
 const url=URL.createObjectURL(record.blob);activeObjectUrl=url;activeReader=container;
 const link=element('a','document-reader-open','Open in a new browser tab');link.href=url;link.target='_blank';link.rel='noopener noreferrer';header.append(link);
 const close=element('button','document-secondary','Close reader');close.type='button';close.dataset.documentClose='yes';header.append(close);
 container.append(header);
 const iframe=element('iframe','document-pdf-frame');iframe.src=url;iframe.loading='lazy';iframe.title='Local PDF '+record.filename;container.append(iframe);
 container.append(element('p','document-reader-note','On Android, the browser may open the original PDF in a separate tab if inline PDF rendering is not supported.'));
 container.scrollIntoView({behavior:'smooth',block:'nearest'});
}
document.addEventListener('change',async event=>{
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
 const read=event.target.closest?.('[data-document-read]'),remove=event.target.closest?.('[data-document-remove]'),legacy=event.target.closest?.('[data-document-legacy-read]'),close=event.target.closest?.('[data-document-close]');
 const hit=read||remove||legacy||close;if(!hit)return;
 const host=getHost(hit);if(!host)return;
 if(close){releaseReader();host.querySelector('[data-document-reader]')?.replaceChildren();return}
 try{
  if(legacy){const item=await dbOp('readonly',st=>st.get(legacy.dataset.documentLegacyRead));if(item)await readRecord(host,item);return}
  const id=(read?.dataset.documentRead||remove?.dataset.documentRemove),item=await dbOp('readonly',st=>st.get(docKey(id)));
  if(read){if(item)await readRecord(host,item);else setHostStatus(host,'PDF not yet attached on this device.',true);return}
  if(remove&&item&&confirm('Remove this private PDF copy from the browser?')){
   if(activeReader?.closest('[data-eeit-document-library],[data-eeit-source-shelf]')===host)releaseReader();
   await dropDoc(id);await refreshHost(host);setHostStatus(host,'Local PDF removed. The catalog record remains.',false);
  }
 }catch(e){setHostStatus(host,'Document operation failed: '+e.message,true)}
});
const observer=new MutationObserver(scan);
observer.observe(document.documentElement,{childList:true,subtree:true});
scan();
