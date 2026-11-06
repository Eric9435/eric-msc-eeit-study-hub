/* Private original course documents: IndexedDB only, never sent to Firebase or Render. */
const DATABASE='eric-eeit-private-source-pdfs-v1';
const STORE='documents';
const active=new Map();
const urls=new WeakMap();
function openDatabase(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(Error('This browser does not support local PDF storage.'));return;}
  const req=indexedDB.open(DATABASE,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'key'});};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Unable to open local document database.'));
 });
}
async function databaseOperation(mode,action){
 const db=await openDatabase();
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
  let result;
  try{const req=action(store);if(req){req.onsuccess=()=>{result=req.result;};req.onerror=()=>reject(req.error||Error('Local document request failed.'));}}
  catch(error){reject(error);return;}
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error||Error('Local document storage operation failed.'));
  tx.onabort=()=>reject(tx.error||Error('Local document storage was aborted.'));
 });}finally{db.close();}
}
const key=(course,kind)=>course+':'+kind;
const get=(course,kind)=>databaseOperation('readonly',store=>store.get(key(course,kind)));
const save=record=>databaseOperation('readwrite',store=>store.put(record));
const erase=(course,kind)=>databaseOperation('readwrite',store=>store.delete(key(course,kind)));
const kindName={question:'Original questions',solution:'Original sample solutions'};
function clearUrl(shelf){const previous=urls.get(shelf);if(previous){URL.revokeObjectURL(previous);urls.delete(shelf);}}
function showMessage(shelf,message){
 const status=shelf.querySelector('[data-eeit-source-status]');if(status)status.textContent=message;
}
function make(tag,cls,value){
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(value!==undefined)element.textContent=value;
 return element;
}
async function renderShelf(shelf){
 if(!shelf.isConnected)return;
 const course=shelf.dataset.course,el=shelf.querySelector('[data-eeit-source-status]');
 if(!course||!el)return;
 try{
  const pair=await Promise.all([get(course,'question'),get(course,'solution')]);
  if(!shelf.isConnected)return;
  const docs={question:pair[0],solution:pair[1]};
  el.replaceChildren();
  let any=false;
  for(const kind of ['question','solution']){
   const entry=docs[kind],row=make('div','source-file-row');
   row.append(make('strong','',kindName[kind]));
   if(entry){
    any=true;row.append(make('span','source-file-name',entry.filename));
    const view=make('button','btn small','Read PDF');
    view.type='button';view.dataset.sourceView=kind;row.append(view);
    const remove=make('button','btn small','Remove local copy');
    remove.type='button';remove.dataset.sourceRemove=kind;row.append(remove);
   }else row.append(make('span','source-empty','Not attached on this device'));
   el.append(row);
  }
  const kind=active.get(course)|| (docs.question?'question':docs.solution?'solution':null);
  const reader=shelf.querySelector('[data-eeit-source-reader]');
  clearUrl(shelf);
  if(reader)reader.replaceChildren();
  if(!any||!kind||!docs[kind]||!reader)return;
  const record=docs[kind];
  const url=URL.createObjectURL(record.blob);
  urls.set(shelf,url);
  active.set(course,kind);
  const top=make('div','source-reader-header');
  top.append(make('strong','',kindName[kind]+' · '+record.filename));
  const open=make('a','source-pdf-link','Open PDF in new tab');
  open.href=url;open.target='_blank';open.rel='noopener noreferrer';top.append(open);
  reader.append(top);
  const frame=make('iframe','source-pdf-frame');
  frame.title=kindName[kind]+' for '+course;
  frame.loading='lazy';frame.src=url;
  reader.append(frame);
  reader.append(make('p','source-pdf-note','If your mobile browser cannot display the PDF inside this page, select Open PDF in new tab above.'));
 }catch(error){showMessage(shelf,'Local source viewer: '+(error.message||'Storage unavailable.'));}
}
function scan(){
 document.querySelectorAll('[data-eeit-source-shelf]:not([data-source-initialized])').forEach(shelf=>{
  shelf.setAttribute('data-source-initialized','true');
  void renderShelf(shelf);
 });
}
document.addEventListener('change',async event=>{
 const input=event.target.closest?.('[data-eeit-import-source]');
 if(!input)return;
 const shelf=input.closest('[data-eeit-source-shelf]'),file=input.files?.[0];
 if(!shelf||!file)return;
 const kind=input.dataset.eeitImportSource,course=shelf.dataset.course;
 if(!['question','solution'].includes(kind)||!course)return;
 if(!/\.pdf$/i.test(file.name)|| !(file.type==='application/pdf'||file.type==='application/octet-stream'||!file.type)){
  showMessage(shelf,'Only PDF documents are supported.');input.value='';return;
 }
 if(file.size>60_000_000){showMessage(shelf,'PDF exceeds the 60 MB local limit. Use a smaller copy.');input.value='';return;}
 try{
  await save({key:key(course,kind),course,kind,filename:file.name,blob:file,size:file.size,savedAt:Date.now()});
  active.set(course,kind);
  await renderShelf(shelf);
 }catch(error){showMessage(shelf,'Could not store PDF locally: '+error.message);}
 input.value='';
});
document.addEventListener('click',async event=>{
 const view=event.target.closest?.('[data-source-view]');
 const remove=event.target.closest?.('[data-source-remove]');
 const target=view||remove;
 if(!target)return;
 const shelf=target.closest('[data-eeit-source-shelf]');
 if(!shelf)return;
 const course=shelf.dataset.course,kind=view?view.dataset.sourceView:remove.dataset.sourceRemove;
 if(!course||!['question','solution'].includes(kind))return;
 if(view){active.set(course,kind);void renderShelf(shelf);return;}
 if(!confirm('Remove this locally stored '+kindName[kind].toLowerCase()+' PDF from this browser?'))return;
 try{await erase(course,kind);active.delete(course);await renderShelf(shelf);}
 catch(error){showMessage(shelf,'Unable to remove local PDF: '+error.message);}
});
const observer=new MutationObserver(scan);
observer.observe(document.documentElement,{childList:true,subtree:true});
scan();
