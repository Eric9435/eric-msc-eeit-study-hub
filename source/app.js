import {renderVisual} from './visuals.mjs';
const $=s=>document.querySelector(s);
const escape=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const icon=(n,size=17)=>{
const p={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 19.5v-13"/>',sigma:'<path d="M18 4H7l7 8-7 8h11"/>',chart:'<path d="M4 20h16M7 17V9m5 8V4m5 13v-5"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.5-2.4 1a7 7 0 0 0-1.8-1L14.4 3h-4.8l-.4 2.9a7 7 0 0 0-1.8 1l-2.4-1-2 3.5 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.5 2.4-1a7 7 0 0 0 1.8 1l.4 2.9h4.8l.4-2.9a7 7 0 0 0 1.8-1l2.4 1 2-3.5-2-1.6A7 7 0 0 0 19 12z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',moon:'<path d="M20.5 15A8 8 0 0 1 9 3.5 8 8 0 1 0 20.5 15z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',chevron:'<path d="m9 18 6-6-6-6"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',check:'<path d="m5 12 4 4L19 6"/>',bookmark:'<path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4z"/>',file:'<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',upload:'<path d="M12 20V8m-5 5 5-5 5 5M4 7V3h16v4"/>',plus:'<path d="M12 5v14M5 12h14"/>',close:'<path d="M18 6 6 18M6 6l12 12"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="m3 3 18 18M10.7 5.1C17.9 4 22 12 22 12a18 18 0 0 1-4 4.6M6 6.4A17 17 0 0 0 2 12s4 7 10 7a9.9 9.9 0 0 0 3.2-.5"/>',refresh:'<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 15h12v6H6z"/>',note:'<path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'};
return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[n]||p.file}</svg>`;
};
let base={subjects:[],exercises:[],formulas:[],sourceSkipped:[]};
const visualSettings=new Map(); // ephemeral interactive illustration settings; not study progress
const LOCAL_KEY='eric-eeit-exercise:v1'; // preserves existing local progress
const blank=()=>({completed:{},mastered:{},bookmarks:{},notes:{},custom:[],recent:[],theme:'light',lastCourse:'all'});
let study=loadLocal(),route='dashboard',focusedId='dc-1.1',activePart='a',exerciseTab='worked',hideSolution=false,filterSubject='all',filterState='all',keyword='',formulaSearch='',modal='',sideOpen=false,toastTimer=null;
function loadLocal(){try{const data=JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}');return {...blank(),...(data&&typeof data==='object'&&!Array.isArray(data)?data:{})};}catch{return blank();}}
function persist(){try{localStorage.setItem(LOCAL_KEY,JSON.stringify(study));return true;}catch(error){notify('Local storage is unavailable or full. Export a backup now.');return false;}}
function stamp(map,key,value){study[map][key]={value,updatedAt:Date.now()};persist();}
function read(map,key){return study[map]?.[key]?.value;}
function mergeBackup(importedStudy){
  if(!importedStudy || typeof importedStudy!=='object'||Array.isArray(importedStudy)) throw Error('Invalid study data.');
  for(const key of ['completed','mastered','bookmarks','notes']){
    const a=study[key]||{}, b=(importedStudy[key] && typeof importedStudy[key]==='object' && !Array.isArray(importedStudy[key]))?importedStudy[key]:{};
    for(const k of Object.keys(b)){
      if(['__proto__','constructor','prototype'].includes(k)) continue;
      const v=b[k]; if(!v||typeof v!=='object'||typeof v.updatedAt!=='number')continue;
      if(!a[k]||v.updatedAt>a[k].updatedAt) a[k]={value:v.value,updatedAt:v.updatedAt};
    }
    study[key]=a;
  }
  const imported=Array.isArray(importedStudy.custom)?importedStudy.custom.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&Array.isArray(x.parts)).slice(0,2000).map(x=>({...x,parts:x.parts.map(p=>({...p,display:Array.isArray(p.display)?p.display.map(d=>({latex:String(d.latex||''),html:rawToHtml(String(d.latex||''))})):[]}))})):[];
  study.custom=[...(study.custom||[]),...imported].filter((v,i,arr)=>arr.findIndex(x=>x.id===v.id)===i);
  study.recent=[...new Set([...(study.recent||[]),...(Array.isArray(importedStudy.recent)?importedStudy.recent:[])])].slice(0,30);
  persist();
}
function allExercises(){return [...base.exercises,...(study.custom||[])];}
function currentExercise(){return allExercises().find(x=>x.id===focusedId) || allExercises()[0];}
function allParts(){return allExercises().flatMap(x=>(x.parts||[]).map(p=>({exercise:x,part:p,key:x.id+':'+p.label})));}
function completed(){return allParts().filter(p=>read('completed',p.key)).length;}
function mastered(){return allParts().filter(p=>read('mastered',p.key)).length;}
function totalParts(){return allParts().length;}
function percent(a,b){return b?Math.min(100,Math.round(100*a/b)):0;}
function subject(id){return base.subjects.find(x=>x.id===id);}
function countFor(id){return allExercises().filter(x=>x.subject===id).length;}
function doneFor(id){return allParts().filter(x=>x.exercise.subject===id&&read('completed',x.key)).length;}
function totalFor(id){return allParts().filter(x=>x.exercise.subject===id).length;}
function subjectTag(s){return `<span class="subject-monogram ${escape(s.tone)}">${escape(s.short)}</span>`;}
function badge(text,cls='plain'){return `<span class="badge ${cls}">${escape(text)}</span>`;}
function navigate(id){location.hash='#'+id;}
function showExercise(id){focusedId=id;const e=currentExercise();activePart=e.parts?.[0]?.label||'';exerciseTab=e.parts?.length?'worked':'source';hideSolution=false;study.recent=[id,...study.recent.filter(x=>x!==id)].slice(0,30);persist();navigate('exercise/'+id);}
function notify(message){$('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.append(el);clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.remove(),3600);}
function showSolutionExplanation(key,kind){
 if(!['method','reason'].includes(kind))return;
 const e=currentExercise(),p=(e?.parts||[]).find(part=>e.id+':'+part.label===key);
 if(!p)return;
 document.querySelector('.eeit-explanation-modal')?.remove();
 const dialog=document.createElement('dialog');dialog.className='eeit-explanation-modal';
 dialog.setAttribute('aria-label',kind==='method'?'Solution method':'Why this method works');
 const head=document.createElement('div');head.className='eeit-explanation-head';
 const title=document.createElement('h2');title.textContent=(kind==='method'?'Method / ဖြေရှင်းနည်း':'Reason / ဘာကြောင့်')+' · '+e.number+' ('+p.label+')';
 const close=document.createElement('button');close.type='button';close.className='btn small';close.textContent='Close';close.addEventListener('click',()=>dialog.close());
 head.append(title,close);
 const paragraph=document.createElement('p');paragraph.className='myanmar-text';paragraph.textContent=String(p[kind]||'A complete explanation is not documented yet.');
 const foot=document.createElement('p');foot.className='eeit-explanation-foot';foot.textContent='Independent study explanation · verify source givens and units before an examination.';
 dialog.append(head,paragraph,foot);document.body.append(dialog);
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
}
function sidebar(){const nav=[['dashboard','Dashboard','home'],['library','Exercise library','book'],['documents','PDF Document Library','file'],['formulas','Formula bank','sigma'],['progress','My progress','chart'],['settings','Settings','settings']];return `<aside class="sidebar ${sideOpen?'open':''}">
<button type="button" data-action="navigate" data-id="dashboard" class="brand-lockup" aria-label="Eric M.Sc EEIT Study Hub, go to dashboard"><span class="brand-image-frame"><img src="assets/eeit-study-hub-logo.webp" width="76" height="76" alt=""></span><span class="brand-titles"><span class="brand-name">Eric M.Sc EEIT</span><span class="brand-sub">STUDY HUB · WS 2026/27</span></span></button>
<div class="menu-label">Workspace</div>${nav.map(([id,title,ico])=>`<button data-action="navigate" data-id="${id}" class="nav-item ${route===id?'active':''}">${icon(ico)} ${title}</button>`).join('')}
<div class="sidebar-rule"></div><div class="menu-label">My subjects</div>
${base.subjects.map(s=>`<button data-action="subject" data-id="${s.id}" class="course-nav"><span class="course-dot">${escape(s.short.slice(0,3))}</span><span class="course-name">${escape(s.title)}</span><small>${countFor(s.id)}</small></button>`).join('')}
<div class="sidebar-bottom"><div class="offline-tag">Offline-ready · optional cloud sync</div><button data-action="theme" class="nav-item">${icon(study.theme==='dark'?'sun':'moon')} ${study.theme==='dark'?'Light appearance':'Dark appearance'}</button></div></aside>`;}
function topbar(){const crumb=route==='dashboard'?'Dashboard':route==='library'?'Exercise library':route==='documents'?'PDF Document Library':route==='formulas'?'Formula bank':route==='progress'?'Progress':route==='settings'?'Settings':`Exercise ${escape(currentExercise()?.number||'')}`;return `<header class="topbar"><div class="topbar-left"><button class="icon-button mobile-menu" data-action="mobile-menu" aria-label="Toggle menu">${icon('menu')}</button><div class="crumb"><span class="mobile-brand" aria-hidden="true"><img src="assets/eeit-study-hub-logo.webp" width="45" height="45" alt=""></span><span class="crumb-primary">Eric M.Sc EEIT</span><span class="crumb-sep">/</span><span class="crumb-page">${crumb}</span></div></div><div class="topbar-actions"><div class="top-search">${icon('search',16)}<input data-search-input data-action="search" placeholder="Search exercises" value="${escape(keyword)}" aria-label="Search exercises"></div><button class="icon-button" data-action="theme" aria-label="Toggle theme">${icon(study.theme==='dark'?'sun':'moon',17)}</button><span class="local-pill" title="No account required. Notes and progress are stored in this browser.">${icon('check',15)} Local only</span></div></header>`;}
function section(title,sub='',right=''){return `<div class="section-head"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>${right}</div>`;}
function dashboard(){const dc=base.subjects[0],recent=study.recent.map(id=>allExercises().find(x=>x.id===id)).filter(Boolean).slice(0,4);return `<div class="eyebrow">Study workspace · WS 2026/27</div><div class="hero-grid"><div class="hero-panel"><div class="hero-copy"><div class="eyebrow">YOUR ENGINEERING STUDY SPACE</div><h1 class="hero-heading">Build understanding.<br>Master every exercise.</h1><p class="hero-desc">Original questions, clear equations, short Burmese reasons, and personal progress — organized across your M.Sc. EEIT subjects.</p><div class="hero-actions"><button data-action="navigate" data-id="library" class="btn btn-primary">${icon('book',16)} Browse exercises ${icon('arrow',15)}</button><button data-action="open" data-id="dc-1.1" class="btn">Start with Exercise 1.1</button></div></div><div class="hero-logo-panel"><img src="assets/eeit-study-hub-logo.webp" width="320" height="320" alt="Eric M.Sc EEIT Study Hub logo featuring electrical engineering and graduation symbols" decoding="async"></div></div><div class="focus-panel"><div><div class="focus-top">YOUR STUDY PROGRESS</div><div class="focus-big">${percent(completed(),totalParts())}%</div><div class="focus-text">${completed()} of ${totalParts()} guided subquestions reviewed</div></div><div><div class="focus-progress"><div style="width:${percent(completed(),totalParts())}%"></div></div><div class="focus-text" style="margin-top:13px">${totalParts()-completed()} subquestions left in the current worked library</div></div></div></div>
<div class="metrics"><div class="metric"><div class="metric-label">Subjects</div><div class="metric-number">${base.subjects.length}</div><div class="metric-detail">M.Sc. EEIT curriculum</div></div><div class="metric"><div class="metric-label">Exercise sets</div><div class="metric-number">${allExercises().length}</div><div class="metric-detail">Across five engineering subjects</div></div><div class="metric"><div class="metric-label">Guided solutions</div><div class="metric-number">${allExercises().filter(x=>x.parts?.length).length}</div><div class="metric-detail">Exercise sets with authored answers</div></div><div class="metric"><div class="metric-label">Mastered parts</div><div class="metric-number">${mastered()}</div><div class="metric-detail">Marked confident by you</div></div></div>
${section('Your subjects','Select a course to view its exercise collection.')}
<div class="subject-grid">${base.subjects.map(s=>{const n=totalFor(s.id),d=doneFor(s.id);return `<button data-action="subject" data-id="${s.id}" class="subject-card"><div class="subject-head">${subjectTag(s)}${badge(countFor(s.id)?countFor(s.id)+' sets':'Ready for import')}</div><h3>${escape(s.title)}</h3><p>${escape(s.description)}</p><div class="mini-progress"><div style="width:${percent(d,n)}%"></div></div><div class="subject-foot"><span>${n?d+' / '+n+' guided parts':'Question bank not imported yet'}</span>${icon('arrow',14)}</div></button>`;}).join('')}</div>
${readinessAudit()}
${section('Recently opened','Continue where you left off.',`<button class="btn small" data-action="navigate" data-id="library">View all ${icon('arrow',13)}</button>`)}
${recent.length?`<div class="exercise-list">${recent.map(x=>exerciseRow(x)).join('')}</div>`:`<div class="note-panel"><strong>Your next exercise:</strong> Start with Exercise 1.1 — Quadrature Amplitude Modulation. Progress saves automatically in this browser.</div>`}
<div class="note-panel" style="margin-top:20px"><strong>Study material provenance:</strong> The Digital Communications library contains 15 tutorial question sets; selected exercises have independent solutions. The other four subjects include original worked practice examples, not official professor solutions. Source question-sheet images and PDFs stay out of public hosting.</div>`;}
function readinessAudit(){
 const courses=base.subjects.map(course=>{
  const es=base.exercises.filter(e=>e.subject===course.id);
  const subparts=es.flatMap(e=>e.parts||[]);
  const documented=subparts.filter(p=>p.method&&p.reason&&p.finalAnswer&&((p.working&&p.working.length)||(p.display&&p.display.length)||(p.equations&&p.equations.length))).length;
  const sourceOnly=es.filter(e=>!(e.parts||[]).length).length;
  return {course,sets:es.length,parts:subparts.length,documented,sourceOnly};
 });
 const documented=courses.reduce((n,x)=>n+x.documented,0),parts=courses.reduce((n,x)=>n+x.parts,0),pending=courses.reduce((n,x)=>n+x.sourceOnly,0);
 return `<section class="exam-audit-section" aria-labelledby="exam-audit-title">
  <div class="section-head"><div><h2 id="exam-audit-title">Exam preparation audit</h2><p>Content coverage is not proof of mathematical correctness or exam readiness.</p></div></div>
  <div class="exam-audit-strip"><strong>Exam-readiness status: not yet certified</strong><span>${documented}/${parts} guided parts have recorded working · ${pending} sets still have no worked parts</span></div>
  <div class="exam-audit-table-wrap"><table class="exam-audit-table">
   <thead><tr><th>Subject</th><th>Sets</th><th>Worked parts documented</th><th>Source-only sets</th></tr></thead>
   <tbody>${courses.map(x=>`<tr><th><button data-action="subject" data-id="${escape(x.course.id)}">${escape(x.course.title)}</button></th><td>${x.sets}</td><td>${x.documented} / ${x.parts}</td><td>${x.sourceOnly}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="exam-audit-footnote">Documented means a method, reason, equations and answer are present. Independent verification of every official numerical value, figures, source completeness and examination scope must still be completed. Original instructor-owned PDFs are not publicly hosted.</p>
 </section>`;
}
function exerciseRow(e){const dc=e.subject==='digital',worked=Boolean(e.parts?.length),d=(e.parts||[]).filter(p=>read('completed',e.id+':'+p.label)).length;return `<button class="exercise-row" data-action="open" data-id="${escape(e.id)}"><div class="exercise-num">${escape(e.number)}</div><div class="exercise-info"><h3>${escape(e.title)}</h3><p>${escape(subject(e.subject)?.title||'Custom subject')} · ${escape(e.topic||'Practice')} ${worked?'· '+d+'/'+e.parts.length+' reviewed':''}</p></div><div class="exercise-right">${badge(worked?'Worked solution':'Original questions only',worked?'green':'amber')}${icon('chevron',18)}</div></button>`;}
function library(){let arr=allExercises().filter(x=>(filterSubject==='all'||x.subject===filterSubject)&&(filterState==='all'||(filterState==='worked'?x.parts?.length:filterState==='questions'?!x.parts?.length:filterState==='reviewed'?(x.parts||[]).some(p=>read('completed',x.id+':'+p.label)):true))&&(!keyword||[x.title,x.number,x.topic,subject(x.subject)?.title].join(' ').toLowerCase().includes(keyword.toLowerCase())));
return `<div class="eyebrow">Your library</div><h1 class="page-title">Exercise Library</h1><p class="page-sub">Explore exercises across all five subjects, with self-authored examples and worked answers clearly distinguished from question-only references.</p>
<div class="toolbar"><input data-action="search" data-search-input placeholder="Search by topic, number or title" value="${escape(keyword)}"><select aria-label="Filter by subject" data-action="subject-filter">${[['all','All subjects'],...base.subjects.map(s=>[s.id,s.title])].map(([v,t])=>`<option value="${v}" ${filterSubject===v?'selected':''}>${escape(t)}</option>`).join('')}</select><select aria-label="Filter by availability" data-action="state-filter">${[['all','All availability'],['worked','With worked answers'],['questions','Questions only'],['reviewed','Reviewed parts']].map(([v,t])=>`<option value="${v}" ${filterState===v?'selected':''}>${t}</option>`).join('')}</select><button class="btn btn-primary" data-action="new-exercise">${icon('plus',16)} Add exercise</button></div>
${arr.length?`<div class="exercise-list">${arr.map(exerciseRow).join('')}</div>`:`<div class="empty-state">No exercises found for this selection. Try another subject or add a new exercise.</div>`}
<div class="note-panel" style="margin-top:17px"><strong>Source note:</strong> The supplied 2026/27 Digital Communications tutorial has 18 numbered headings. Titles 1.2, 1.4 and 2.4 have no question text in the supplied source; the library therefore lists 15 question-bearing sets.</div>`;}
function math(html){return `<div class="math-line">${html||''}</div>`;}
function renderSource(e) {
  const pages = Array.isArray(e.sourcePages) ? e.sourcePages : [];
  const source = e.source || 'Personal course question reference';
  const reference = e.sourcePageRef || (pages.length ? 'Archived study-index pages ' + pages.join(', ') : 'For verified question and solution PDF pages, use the links below');
  return `<div class="paper"><div class="mini-label">Source wording and figures · private study materials</div>
    <h2>Exercise ${escape(e.number)} — Source reference</h2>
    <p>${escape(e.question || 'The full official question text and diagrams are not included in this public site.')}</p>
    <div class="inline-caution"><strong>Original material is private.</strong> Uploaded source PDFs are linked from the owner's private Google Drive below. Exact Question/Sample Solution page links appear only when verified against those PDFs. A related lecture is not an official exercise solution.</div>
    <div class="side-info"><span>Original study-index label (may refer to an older compilation)</span><strong>${escape(source)}</strong></div>
    <div class="side-info"><span>Historical page reference — exact uploaded PDF pages are shown below</span><strong>${escape(reference)}</strong></div>
    <section class="source-archive" data-eeit-source-shelf data-course="${escape(e.subject)}" data-exercise="${escape(e.id)}" data-source-only="${!(e.parts||[]).length}" aria-label="Original course question and answer documents">
      <h3>Original PDFs for this course</h3>
      <p>Searching the source catalog and local browser files…</p>
    </section>
    <button class="btn btn-primary" data-action="tab" data-id="worked">Return to inline worked solution</button>
  </div>`;
}
function renderFullSolution(e) {
  const parts = Array.isArray(e.parts) ? e.parts : [];
  const subjectName = subject(e.subject)?.title || 'Engineering';
  const courseRef = e.source || 'Personal study exercise';
  const pageHead = `<header class="paper-document-head">
    <div class="paper-topline"><span>ERIC M.Sc EEIT · ENGINEERING STUDY HUB</span><span>WORKED EXERCISE ${escape(e.number)}</span></div>
    <p class="paper-subject">${escape(subjectName)} / ${escape(e.topic || 'Practice')}</p>
    <h1>Exercise ${escape(e.number)} <span>${escape(e.title)}</span></h1>
    <div class="paper-rule"></div>
    <div class="paper-document-meta"><span>Source: ${escape(courseRef)}</span><span>${parts.length} subquestion${parts.length === 1 ? '' : 's'}</span></div>
    <p class="paper-provenance">${escape(e.verificationNote || (e.originalPractice===false ? 'Course-source question · independently prepared study derivation (not an official answer key).' : 'Independent engineering practice · do not confuse with an official tutorial question.'))}</p>
  </header>`;
  if (!parts.length) {
    return `<article class="paper full-solution-page a4-paper" aria-label="Exercise ${escape(e.number)} paper view">
      ${pageHead}
      <section class="paper-introduction"><h2>Original Problem / ပုစ္ဆာ</h2><p>${escape(e.question || 'Exact problem statement is not yet included in this public library.')}</p></section>
      <section class="paper-derivation"><h2>Overall Solution — Complete Working</h2>
      <p class="paper-pending">The source data for this exercise is incomplete. A start-to-finish derivation cannot be calculated reliably without its full question, numerical givens and diagrams. No solution has been fabricated.</p></section>
      <div class="no-print paper-actions"><button class="btn" data-action="tab" data-id="source">View source reference</button></div>
    </article>`;
  }
  const available = p => Boolean((Array.isArray(p.display) && p.display.length) || (Array.isArray(p.equations) && p.equations.length) || p.solution);
  const documented = p => Boolean(p.method && p.reason && (p.finalAnswer || p.solution) && available(p));
  const renderMath = p => {
    const symbolic = Array.isArray(p.display) && p.display.length
      ? p.display.map(d => `<div class="paper-equation">${math(d.html || `<code class="raw-tex">${escape(d.latex || '')}</code>`)}</div>`).join('')
      : Array.isArray(p.equations) && p.equations.length
        ? p.equations.map(x => `<div class="paper-equation"><code class="raw-tex">${escape(x)}</code></div>`).join('')
        : '';
    const detailed = Array.isArray(p.working) && p.working.length
      ? `<div class="paper-annotated-working"><h5>Given · Formula · Substitution · Calculation · Verification</h5>${p.working.map(step => `<div class="paper-workline"><div class="paper-workline-label">${escape(step.label || 'Calculation')}</div><div class="paper-workline-equation" role="math">${escape(step.value || '')}</div></div>`).join('')}</div>`
      : '';
    if(symbolic || detailed)return `<div class="paper-math-full">${symbolic ? `<div class="paper-symbolic-working">${symbolic}</div>` : ''}${detailed}</div>`;
    if(p.solution)return `<div class="paper-equation"><p class="paper-raw-solution">${escape(p.solution)}</p></div>`;
    return '<p class="paper-pending">Calculation not yet independently documented for this part.</p>';
  };
  const renderPart = (p, i) => {
    const key = e.id + ':' + p.label;
    const done = read('completed', key);
    const mastered = read('mastered', key);
    const bookmarked = read('bookmarks', key);
    const final = String(p.finalAnswer || '').trim();
    return `<section class="paper-part" aria-labelledby="paper-part-${i}">
      <header class="paper-part-heading"><span>(${escape(p.label)})</span><h3 id="paper-part-${i}">${escape(p.title || 'Subquestion')}</h3></header>
      <div class="paper-statement"><h4>Question / Given information</h4><p>${escape(p.question || 'Original source question wording is unavailable.')}</p></div>
      ${hideSolution ? '<p class="paper-pending">Working hidden for self-practice. Use “Show complete solution” above to reveal it.</p>' : `
        <div class="paper-method"><h4>Method / ဖြေရှင်းနည်း</h4>
          ${p.method ? `<button class="btn small paper-explain-trigger no-print" data-action="solution-explanation" data-id="${escape(key)}" data-kind="method">Explain method · Myanmar</button><p class="myanmar-text paper-print-explanation">${escape(p.method)}</p>` : '<p class="paper-pending">A complete written method is not yet available for this subquestion.</p>'}
        </div>
        <div class="paper-calculation"><h4>Full derivation and calculation</h4>
          ${renderMath(p)}
        </div>
        <div class="paper-reason"><h4>Reason / ဘာကြောင့် ဒီနည်းလမ်းသုံးလဲ</h4>
          ${p.reason ? `<button class="btn small paper-explain-trigger no-print" data-action="solution-explanation" data-id="${escape(key)}" data-kind="reason">Why this formula? · Myanmar</button><p class="myanmar-text paper-print-explanation">${escape(p.reason)}</p>` : '<p class="paper-pending">The mathematical rationale still needs review.</p>'}
        </div>
        <div class="paper-answer"><strong>Final Answer (${escape(p.label)})</strong>
          <p>${final ? escape(final) : p.solution ? escape(p.solution) : 'No independently documented final answer yet.'}</p></div>
        ${p.verification ? `<div class="paper-verification"><strong>Verification note</strong><p>${escape(p.verification)}</p></div>` : ''}
        ${documented(p) ? '' : '<p class="paper-pending">This part contains incomplete study notes; it is not a verified complete calculation.</p>'}
      `}
      <div class="paper-part-tools no-print">
        <button class="btn small ${done ? 'btn-soft' : ''}" data-action="complete" data-id="${escape(key)}">${done ? 'Reviewed ✓' : 'Mark reviewed'}</button>
        <button class="btn small ${mastered ? 'btn-soft' : ''}" data-action="master" data-id="${escape(key)}">${mastered ? 'Mastered ✓' : 'Mark mastered'}</button>
        <button class="btn small ${bookmarked ? 'btn-soft' : ''}" data-action="bookmark" data-id="${escape(key)}">${bookmarked ? 'Bookmarked ✓' : 'Bookmark'}</button>
        <details class="paper-notes"><summary>My notes</summary><textarea data-action="notes" data-id="${escape(key)}" aria-label="Notes for ${escape(p.label)}" placeholder="My calculation, exam reminders...">${escape(read('notes',key) || '')}</textarea></details>
      </div>
    </section>`;
  };
  const completeCount = parts.filter(documented).length;
  return `<article class="paper full-solution-page a4-paper" aria-label="Complete worked solution for exercise ${escape(e.number)}">
    ${pageHead}
    <div class="paper-controls no-print">
      <button class="btn small" data-action="solution-toggle">${hideSolution ? 'Show complete solution' : 'Hide calculations for practice'}</button>
      <button class="btn small" data-action="print">Print A4 solution</button>
    </div>
    <section class="paper-introduction">
      <h2>Problem / ပုစ္ဆာ</h2>
      ${e.question ? `<p>${escape(e.question)}</p>` : '<p>The available problem information is given separately in each subquestion below. Consult the private original for diagrams and missing givens.</p>'}
    </section>
    <section class="paper-derivation" aria-labelledby="paper-overall-heading">
      <div class="paper-section-title"><span>COMPLETE WORKING · FROM START TO FINISH</span><h2 id="paper-overall-heading">Overall Solution</h2>
      <p>Full working for parts (a)–(${escape(parts[parts.length-1].label)}) in order — problem, method, equations, mathematical reasoning and final result. This is the working itself, not an answer summary.</p></div>
      ${parts.map(renderPart).join('')}
    </section>
    <footer class="paper-document-footer">
      <p><strong>Coverage:</strong> ${completeCount} of ${parts.length} subquestions have recorded method, calculations, rationale and answer. Recorded working does not guarantee an independent full-source mathematical audit.</p>
      <p>Eric M.Sc EEIT Study Hub · Personal engineering study material</p>
    </footer>
  </article>`;
}
function viewExercise(){const e=currentExercise();if(!e)return '<div class="empty-state">Exercise not found.</div>';const s=subject(e.subject);const done=(e.parts||[]).filter(p=>read('completed',e.id+':'+p.label)).length;return `<div class="eyebrow"><a href="#library" class="overline-link">← Exercise library</a> / ${escape(s?.title||'')}</div><div class="buttons" style="justify-content:space-between;align-items:center;margin:13px 0 18px"><div><h1 class="page-title" style="margin-bottom:4px">Exercise ${escape(e.number)}</h1><p class="page-sub">${escape(e.title)}</p></div>${badge(e.parts?.length?'Guided working available':'Original questions only',e.parts?.length?'green':'amber')}</div>
<div class="details-layout ${exerciseTab==='worked'?'paper-reading-layout':''}"><div class="workspace-main"><div class="toolbar no-print" style="margin-top:0"><button class="btn ${exerciseTab==='worked'?'btn-primary':''}" data-action="tab" data-id="worked">${icon('sigma',15)} Worked solution</button><button class="btn ${exerciseTab==='source'?'btn-primary':''}" data-action="tab" data-id="source">${icon('file',15)} Original questions</button><span class="spacer"></span><button class="btn" data-action="print">${icon('print',15)} Print</button></div>${renderVisual(e,visualSettings.get(e.id))}${exerciseTab==='source'?renderSource(e):renderFullSolution(e)}</div>
<aside class="workspace-side"><div class="side-panel"><h3>Exercise information</h3><div class="side-info"><span>Subject</span><strong>${escape(s?.short||'')}</strong></div><div class="side-info"><span>Chapter</span><strong>${escape(e.topic||'Custom')}</strong></div><div class="side-info"><span>Question pages</span><strong>${e.sourcePages?.length?e.sourcePages.join('–'):'Custom'}</strong></div><div class="side-info"><span>Guided parts</span><strong>${e.parts?.length||0}</strong></div><div class="side-info"><span>Reviewed</span><strong>${done}/${e.parts?.length||0}</strong></div><div class="mini-progress" style="margin-top:14px"><div style="width:${percent(done,e.parts?.length||0)}%"></div></div></div>
<div class="side-panel"><h3>Study method</h3><p>Read the whole worked derivation on the white paper, check every equation against the source, then mark reviewed.</p><button class="btn small" data-action="tab" data-id="source">${icon('file',13)} Open source question</button></div>
${e.source==='TUHH Digital Communications Tutorial Questions, WS 2026/27'?`<div class="side-panel"><h3>Source</h3><p>Official question sheet, WS 2026/27. The worked notes are independent study material, not official TUHH solutions; verify important calculations against the source.</p></div>`:''}</aside></div>`;}
function formulaView(){const arr=base.formulas.filter(f=>(filterSubject==='all'||filterSubject===f.subject)&&(!formulaSearch||[f.name,f.use,f.latex].join(' ').toLowerCase().includes(formulaSearch.toLowerCase())));return `<div class="eyebrow">Formula reference</div><h1 class="page-title">Formula Bank</h1><p class="page-sub">Mathematical notation rendered with browser-native MathML. Every formula explains when it is useful.</p><div class="toolbar"><input data-action="formula-search" value="${escape(formulaSearch)}" placeholder="Search formulas or use cases"><select data-action="subject-filter">${[['all','All subjects'],...base.subjects.map(s=>[s.id,s.title])].map(([v,t])=>`<option value="${v}" ${filterSubject===v?'selected':''}>${escape(t)}</option>`).join('')}</select></div><div class="formula-grid">${arr.map(f=>`<div class="formula-card"><div class="mini-label">${escape(subject(f.subject)?.title||'General')}</div><h3>${escape(f.name)}</h3>${math(f.html)}<p><strong>Use when:</strong> ${escape(f.use)}</p><button class="btn small btn-quiet" data-action="copy" data-id="${escape(f.id)}">Copy LaTeX</button></div>`).join('')}</div>${arr.length?'':'<div class="empty-state">No matching formulas.</div>'}`;}
function progressView(){const parts=allParts();const bookmarks=parts.filter(x=>read('bookmarks',x.key));return `<div class="eyebrow">Learning analytics</div><h1 class="page-title">My Progress</h1><p class="page-sub">Your checked exercises and personal progress, saved on this device and browser only.</p><div class="metrics"><div class="metric"><div class="metric-label">Reviewed parts</div><div class="metric-number">${completed()}</div><div class="metric-detail">of ${totalParts()} guided subquestions</div></div><div class="metric"><div class="metric-label">Mastered</div><div class="metric-number">${mastered()}</div><div class="metric-detail">You marked these confident</div></div><div class="metric"><div class="metric-label">Bookmarked</div><div class="metric-number">${bookmarks.length}</div><div class="metric-detail">Easy to revisit</div></div><div class="metric"><div class="metric-label">Completion rate</div><div class="metric-number">${percent(completed(),totalParts())}%</div><div class="metric-detail">Guided material currently loaded</div></div></div>
${section('Subject progress')}
<div class="paper">${base.subjects.map(s=>`<div class="progress-subject">${subjectTag(s)}<div class="text">${escape(s.title)}<span>${doneFor(s.id)} reviewed / ${totalFor(s.id)} guided parts</span><div class="mini-progress" style="margin-top:9px"><div style="width:${percent(doneFor(s.id),totalFor(s.id))}%"></div></div></div><strong>${percent(doneFor(s.id),totalFor(s.id))}%</strong></div>`).join('')}</div>
${section('Saved bookmarks','Revisit any part you bookmarked.')}
${bookmarks.length?`<div class="exercise-list">${bookmarks.map(x=>`<button data-action="open-part" data-id="${escape(x.exercise.id)}" data-part="${escape(x.part.label)}" class="exercise-row"><div class="exercise-num">${escape(x.exercise.number)}${escape(x.part.label)}</div><div class="exercise-info"><h3>${escape(x.part.title)}</h3><p>${escape(x.exercise.title)}</p></div>${icon('chevron')}</button>`).join('')}</div>`:`<div class="note-panel">No saved bookmarks yet. Open an exercise and press “Bookmark” beside a solution.</div>`}`;}
function settingsView(){return `<div class="eyebrow">Personalization & backup</div><h1 class="page-title">Settings</h1><p class="page-sub">Manage this browser's study data, appearance, and offline backups.</p>
<div class="settings-grid" style="margin-top:23px"><div class="settings-card"><h3>Appearance</h3><p>Flat, accessible light/dark design, no gradients.</p><button class="btn" data-action="theme">${icon(study.theme==='dark'?'sun':'moon')} Switch to ${study.theme==='dark'?'light':'dark'} mode</button></div>
<div class="settings-card"><h3>Local-only storage</h3><p>No Google account, no Firebase, and no server upload. All notes, bookmarks, progress and custom exercises are stored on this browser.</p><span class="local-pill">${icon('check',14)} Private to this browser</span></div>
<div class="settings-card"><h3>Export your study data</h3><p>Download bookmarks, notes, custom exercises, review/mastery results as a JSON backup.</p><button class="btn" data-action="export">${icon('download')} Export progress JSON</button></div>
<div class="settings-card"><h3>Restore your data</h3><p>Import a JSON backup from this website. Existing progress is merged by recency.</p><button class="btn" data-action="import">${icon('upload')} Import backup</button><input id="import-picker" type="file" accept=".json,application/json" hidden></div>
<div class="settings-card"><h3>Add your own exercise</h3><p>Build the library across other four subjects. Add question text, equations and your own worked answer.</p><button class="btn btn-primary" data-action="new-exercise">${icon('plus')} Add exercise</button></div>
<div class="settings-card"><h3>Clear local progress</h3><p>Permanently deletes progress, bookmarks, notes, and custom exercises stored in this browser. Export a backup first.</p><button class="btn btn-danger" data-action="reset">Reset local data</button></div></div>
<div class="note-panel" style="margin-top:20px"><strong>Privacy:</strong> Study data stays in this browser. Clearing browser storage or using another device removes access to this local progress; export JSON backups regularly. Keep the original course question sheets private unless distribution is authorized.</div>`;}
function newExerciseModal(){return `<div class="modal-backdrop" data-action="backdrop"><form id="custom-form" class="modal"><div class="modal-head"><h2>Add your own exercise</h2><button type="button" class="icon-button" data-action="close">${icon('close')}</button></div><div class="field"><label>Subject</label><select required name="subject">${base.subjects.map(s=>`<option value="${s.id}">${escape(s.title)}</option>`).join('')}</select></div><div class="field"><label>Exercise number</label><input required name="number" placeholder="e.g. 2.3 or P1"></div><div class="field"><label>Exercise title</label><input required name="title" placeholder="e.g. State-space controllability"></div><div class="field"><label>Original question / prompt</label><textarea required name="question" placeholder="Paste the question as text here…"></textarea></div><div class="field"><label>Your worked solution (plain text or LaTeX)</label><textarea name="solution" placeholder="Enter solution or LaTeX: \\frac{a}{b}"></textarea><div class="field-hint">Built-in formulas use offline MathML. Your own LaTeX is saved exactly as entered; unsupported custom expressions display as text.</div></div><div class="field"><label>Why this formula? (Myanmar or English)</label><textarea name="reason" placeholder="Write your short reason…"></textarea></div><div class="buttons" style="justify-content:flex-end"><button type="button" class="btn" data-action="close">Cancel</button><button type="submit" class="btn btn-primary">${icon('plus')} Create exercise</button></div></form></div>`;}
function documentLibrary(){
 return `<div class="eyebrow">Course originals / archived references / independent solutions</div>
 <h1 class="page-title">PDF Document Library</h1>
 <p class="page-sub">Five engineering subjects · 123 original PDFs in your private Google Drive. Browse exercise sheets, official solutions, previous exams, lab PDFs, lectures and study handbooks.</p>
 <section class="document-privacy-note"><strong>Privacy:</strong> All 123 PDF files are stored in your private Google Drive with owner-only access. Click Read original PDF to view one inside this website, or open it in Google Drive. If prompted, sign in with the Google account that owns these files. GitHub and Render do not host the original PDFs.</section>
 <section class="document-library" data-eeit-document-library aria-label="Five-subject PDF document library">
  <p class="document-loading">Loading your categorized PDF catalog…</p>
 </section>`;
}
function render(){const page=route==='dashboard'?dashboard():route==='library'?library():route==='documents'?documentLibrary():route==='formulas'?formulaView():route==='progress'?progressView():route==='settings'?settingsView():viewExercise();const app=$('#app');app.innerHTML=`<div class="app">${sidebar()}<div class="mobile-overlay ${sideOpen?'active':''}" data-action="mobile-close"></div><main class="main">${topbar()}<div class="content">${page}</div></main></div>${modal==='new'?newExerciseModal():''}`;document.documentElement.dataset.theme=study.theme;}
function setRoute(){let h=decodeURIComponent(location.hash.replace(/^#/,''))||'dashboard';if(h.startsWith('exercise/')){route='exercise';const e=allExercises().find(x=>x.id===h.slice(9));if(e&&focusedId!==e.id){focusedId=e.id;activePart=e.parts?.[0]?.label||'';exerciseTab=e.parts?.length?'worked':'source';hideSolution=false;}}else{route=['dashboard','library','documents','formulas','progress','settings'].includes(h)?h:'dashboard';}sideOpen=false;render();window.scrollTo({top:0});}
function nextPart(){const e=currentExercise(),i=(e.parts||[]).findIndex(x=>x.label===activePart);if(i>=0&&i<e.parts.length-1){activePart=e.parts[i+1].label;hideSolution=false;render();window.scrollTo({top:0,behavior:'smooth'});}else notify('Last subquestion in this exercise.');}
function downloadJSON(obj,name){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),400);}
function rawToHtml(latex){if(!latex)return '';return '<code class="raw-tex">'+escape(latex)+'</code>';}
function addCustom(data){const id='custom-'+Date.now();const p={label:'a',title:data.title,question:data.question,solution:data.solution,reason:data.reason,display:data.solution?[{latex:data.solution,html:rawToHtml(data.solution)}]:[]};study.custom.push({id,subject:data.subject,number:data.number,title:data.title,topic:'Personal practice',status:'worked',sourcePages:[],parts:[p],question:data.question});persist();modal='';showExercise(id);notify('Exercise added to your local library.');}
document.addEventListener('submit',e=>{if(e.target.id==='custom-form'){e.preventDefault();const f=new FormData(e.target);const obj=Object.fromEntries(f.entries());if(!obj.title?.trim()||!obj.question?.trim())return;addCustom(obj);}});
document.addEventListener('click',async e=>{
const node=e.target.closest('[data-action]');if(!node)return;const a=node.dataset.action,id=node.dataset.id;if(['zoom'].includes(a)){node.classList.toggle('zoom');return;}if(a==='backdrop'&&e.target===node){modal='';render();return;}
if(a==='visual-export'){
 const panel=node.closest('.eeit-viz-panel'),original=panel?.querySelector('svg');
 if(!original)return;
 const clone=original.cloneNode(true);
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 clone.setAttribute('width','1360');
 clone.setAttribute('height','520');
 const xml=new XMLSerializer().serializeToString(clone);
 const blob=new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n',xml],{type:'image/svg+xml;charset=utf-8'});
 const downloadUrl=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=downloadUrl;
 link.download='eric-eeit-'+String(id||'engineering-diagram').replace(/[^a-zA-Z0-9_-]/g,'-')+'.svg';
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(downloadUrl),1000);
 return;
}
if(a==='navigate'){modal='';navigate(id);return;}if(a==='subject'){filterSubject=id;filterState='all';keyword='';navigate('library');render();return;}if(a==='open'){showExercise(id);return;}if(a==='open-part'){showExercise(id);activePart=node.dataset.part;render();return;}if(a==='mobile-menu'){sideOpen=!sideOpen;render();return;}if(a==='mobile-close'){sideOpen=false;render();return;}
if(a==='solution-explanation'){showSolutionExplanation(id,node.dataset.kind);return;}
if(a==='theme'){study.theme=study.theme==='dark'?'light':'dark';persist();render();return;}
if(a==='part'){activePart=id;hideSolution=false;render();return;}if(a==='next-part'){nextPart();return;}if(a==='tab'){exerciseTab=id;render();return;}if(a==='solution-toggle'){hideSolution=!hideSolution;render();return;}
if(a==='complete'||a==='master'||a==='bookmark'){const type=a==='complete'?'completed':a==='master'?'mastered':'bookmarks';stamp(type,id,!read(type,id));render();return;}
if(a==='print'){window.print();return;}if(a==='copy'){const v=base.formulas.find(f=>f.id===id)?.latex;if(v){try{await navigator.clipboard.writeText(v);notify('LaTeX copied.');}catch{notify('Clipboard unavailable: use HTTPS or localhost.');}}return;}
if(a==='new-exercise'){modal='new';render();return;}if(a==='close'){modal='';render();return;}
if(a==='export'){downloadJSON({app:'Eric M.Sc EEIT Exercise',version:1,savedAt:new Date().toISOString(),study},'eric-eeit-study-backup.json');notify('Backup exported.');return;}
if(a==='import'){$('#import-picker')?.click();return;}
if(a==='reset'){if(confirm('Reset local progress, notes and custom exercises on this device?')){study=blank();persist();render();notify('Local data reset.');}return;}
});
document.addEventListener('input',e=>{
const a=e.target.dataset.action;
if(a==='visual-slider'){
 const id=e.target.dataset.id,ex=allExercises().find(item=>item.id===id);
 const value=Number(e.target.value);
 if(!ex||!Number.isFinite(value))return;
 visualSettings.set(id,value);
 const current=e.target.closest('.eeit-viz-panel');
 const container=document.createElement('div');
 container.innerHTML=renderVisual(ex,value);
 const fresh=container.querySelector('.eeit-viz-panel');
 if(current&&fresh){
   const previousGraphic=current.querySelector('.eeit-viz-graphic'),newGraphic=fresh.querySelector('.eeit-viz-graphic');
   if(previousGraphic&&newGraphic)previousGraphic.replaceWith(newGraphic);
   const indicator=current.querySelector('.eeit-viz-value'),newIndicator=fresh.querySelector('.eeit-viz-value');
   if(indicator&&newIndicator)indicator.textContent=newIndicator.textContent;
 }
 return;
}
if(a==='notes'){stamp('notes',e.target.dataset.id,e.target.value);return;}
if(a==='search'||a==='formula-search'){const pos=e.target.selectionStart??0;if(a==='search')keyword=e.target.value;else formulaSearch=e.target.value;render();const el=$(`.content [data-action="${a}"]`)||$(`.topbar [data-action="${a}"]`);if(el){el.focus();try{el.setSelectionRange(pos,pos);}catch{}}}
});
document.addEventListener('change',async e=>{
const a=e.target.dataset.action;if(a==='subject-filter'){filterSubject=e.target.value;render();}else if(a==='state-filter'){filterState=e.target.value;render();}
else if(e.target.id==='import-picker'){const file=e.target.files?.[0];if(!file)return;try{if(file.size>5_000_000)throw Error('Backup exceeds the 5 MB safety limit.');const parsed=JSON.parse(await file.text());if(!parsed?.study||typeof parsed.study!=='object'||parsed.app!=='Eric M.Sc EEIT Exercise')throw Error('Invalid EEIT study backup.');mergeBackup(parsed.study);render();notify('Backup imported and merged.');}catch(err){notify(err.message);}}
});
document.addEventListener('error',event=>{
 const el=event.target;
 if(el?.classList?.contains('source-img')){
   el.style.display='none';
   const notice=document.createElement('div');notice.className='source-missing';
   notice.textContent='Question image is not bundled in this deployment. Open the private source package.';
   el.parentNode?.appendChild(notice);
 }
},true);
window.addEventListener('hashchange',setRoute);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape' && (modal||sideOpen)){modal='';sideOpen=false;render();}
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
  event.preventDefault();if(route!=='library')navigate('library');
  setTimeout(()=>{const target=document.querySelector('.content input[data-action="search"]')||document.querySelector('.topbar input[data-action="search"]');target?.focus();},0);
 }
});
async function start(){
 try{
  const [r,extra,practice,sourceWork]=await Promise.all([fetch('data/content.json'),fetch('data/verified-expansion.json'),fetch('data/original-practice-reworked.json'),fetch('data/source-backed-derivations.json')]);
  if(!r.ok||!extra.ok||!practice.ok||!sourceWork.ok)throw Error('Unable to load all study exercise data');
  const [original,extension,reworked,sourceDerived]=await Promise.all([r.json(),extra.json(),practice.json(),sourceWork.json()]);
  if(!Array.isArray(original.exercises)||!Array.isArray(extension.overrides)||!Array.isArray(reworked.overrides)||!Array.isArray(sourceDerived.overrides))throw Error('Invalid exercise data');
  const verified=new Map(extension.overrides.map(e=>[e.id,e]));
  const originals=new Map(reworked.overrides.map(e=>[e.id,e]));
  const sourceMap=new Map(sourceDerived.overrides.map(e=>[e.id,e]));
  if(verified.size!==extension.overrides.length||originals.size!==reworked.overrides.length||sourceMap.size!==sourceDerived.overrides.length)throw Error('Duplicate override IDs');
  // Independently authored tutorial expansions intentionally turn heading-only sets into worked sets.
  // Their subpart count may differ from the initial source index, but IDs and labels must be unique.
  for(const item of extension.overrides){
   const reference=original.exercises.find(e=>e.id===item.id);
   if(!reference||!Array.isArray(item.parts)||!item.parts.length)throw Error('Invalid verified exercise expansion: '+item.id);
   const labels=item.parts.map(p=>String(p?.label||''));
   if(labels.some(label=>!label)||new Set(labels).size!==labels.length)throw Error('Duplicate or missing verified subpart label: '+item.id);
  }
  // Corrections to existing practice exercises, unlike expansions, must preserve their exact subparts.
  for(const item of reworked.overrides){
   const reference=original.exercises.find(e=>e.id===item.id);
   if(!reference||!Array.isArray(item.parts)||item.parts.length!==reference.parts.length)throw Error('Original practice override does not match source parts: '+item.id);
   if(!item.parts.every((p,i)=>p.label===reference.parts[i].label))throw Error('Original practice override changed original subpart identifiers: '+item.id);
  }
  for(const item of sourceDerived.overrides){
   const reference=original.exercises.find(e=>e.id===item.id);
   if(!reference||!Array.isArray(item.parts)||!item.parts.length)throw Error('Original source-backed working references missing exercise or parts: '+item.id);
   const labels=item.parts.map(p=>String(p?.label||''));
   if(labels.some(label=>!label)||new Set(labels).size!==labels.length)throw Error('Original source-backed working has duplicate or empty labels: '+item.id);
   if(reference.parts.length){
    if(item.parts.length!==reference.parts.length || !item.parts.every((p,i)=>p.label===reference.parts[i].label))throw Error('Original source-backed working changed existing subpart identifiers: '+item.id);
   }
  }
  original.exercises=original.exercises.map(e=>{
    const item=originals.get(e.id)||sourceMap.get(e.id)||verified.get(e.id);
    return item?{...e,...item,parts:item.parts}:e;
  });
  base=original;setRoute();
  if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
 }catch(e){$('#app').innerHTML=`<div class="loading">${escape(e.message)}. Run the site using a local web server (see README.md).</div>`;}
}
start();