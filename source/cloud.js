/* Firebase Auth + per-user Firestore sync for Eric M.Sc EEIT.
 * Existing browser storage remains usable even with no connection.
 * The database is never a place to upload course PDFs or supplied question images.
 */
const STORE='eric-eeit-exercise:v1';
const CONFIG=globalThis.EEIT_FIREBASE_CONFIG||null;
const READY=Boolean(CONFIG && CONFIG.apiKey && CONFIG.authDomain && CONFIG.projectId && CONFIG.appId);
const DOC_ID='eric-eeit';
const SYNC_EVERY=4000, REMOTE_CHECK_EVERY=30000;
let api=null,auth=null,db=null,user=null,phase=READY?'Ready to sign in':'Local mode';
let syncing=false,lastChecked=0,lastSynced='',renderGuard=false,cloudError='';
const $=s=>document.querySelector(s);
function readLocal(){try{const obj=JSON.parse(localStorage.getItem(STORE)||'{}');return obj && typeof obj==='object' && !Array.isArray(obj)?obj:{};}catch{return {};}}
function validMap(value){return value && typeof value==='object' && !Array.isArray(value)?value:{};}
function mergeMap(a,b){
 const out=Object.create(null);
 for(const map of [validMap(a),validMap(b)])for(const [k,v] of Object.entries(map)){
   if(['__proto__','constructor','prototype'].includes(k))continue;
   if(!v || typeof v!=='object' || typeof v.updatedAt!=='number' || !Number.isFinite(v.updatedAt))continue;
   if(!out[k] || v.updatedAt>out[k].updatedAt)out[k]={value:v.value,updatedAt:v.updatedAt};
 }
 return out;
}
function mergeStudy(local,remote){
 const l=validMap(local),r=validMap(remote);
 const out={...r,...l};
 for(const key of ['completed','mastered','bookmarks','notes'])out[key]=mergeMap(l[key],r[key]);
 const customs=new Map();
 for(const x of [...(Array.isArray(r.custom)?r.custom:[]),...(Array.isArray(l.custom)?l.custom:[])])
   if(x && typeof x.id==='string' && typeof x.title==='string' && Array.isArray(x.parts) && x.id.length<150)
     if(!customs.has(x.id) || Number(x.updatedAt||0)>=Number(customs.get(x.id).updatedAt||0))customs.set(x.id,x);
 out.custom=[...customs.values()].slice(0,2000);
 out.recent=[...new Set([...(Array.isArray(l.recent)?l.recent:[]),...(Array.isArray(r.recent)?r.recent:[])].filter(x=>typeof x==='string'))].slice(0,30);
 out.theme=l.theme==='dark'||l.theme==='light'?l.theme:(r.theme||'light');
 out.lastCourse=typeof l.lastCourse==='string'?l.lastCourse:(r.lastCourse||'all');
 return out;
}
function normalize(obj){return JSON.stringify(obj);}
function notice(message){
 const old=$('.cloud-alert');if(old)old.remove();
 const box=document.createElement('div');box.className='cloud-alert';box.setAttribute('role','status');
 const text=document.createElement('span');text.textContent=message;
 const close=document.createElement('button');close.type='button';close.textContent='Close';close.addEventListener('click',()=>box.remove());
 box.append(text,close);document.body.append(box);
}
function mount(){
 if(renderGuard)return;
 const actions=$('.topbar-actions');
 if(!actions)return;
 renderGuard=true;
 try{
   let control=$('#eeit-cloud-control');
   if(!control){
     control=document.createElement('div');control.className='cloud-control';control.id='eeit-cloud-control';
     const button=document.createElement('button');button.className='cloud-button';button.type='button';button.id='eeit-cloud-button';
     button.addEventListener('click',onButtonClick);
     const status=document.createElement('span');status.className='cloud-status';status.id='eeit-cloud-status';
     control.append(button,status);
     actions.append(control);
   }
   const button=control.querySelector('button'),status=control.querySelector('.cloud-status');
   const signed=Boolean(user);
   button.dataset.mode=signed?'signed':READY?'ready':'offline';
   button.replaceChildren();
   if(signed && user.photoURL){
     const avatar=document.createElement('img');avatar.src=user.photoURL;avatar.alt='';avatar.referrerPolicy='no-referrer';avatar.className='cloud-avatar';button.append(avatar);
   }else{
     const dot=document.createElement('span');dot.className='cloud-indicator '+(signed?'online':cloudError?'warning':'');button.append(dot);
   }
   const label=document.createElement('span');label.textContent=signed?(user.displayName?.split(' ')[0]||'Account'):READY?'Google Sign-In':'Set up Google';button.append(label);
   button.setAttribute('aria-label',signed?'Account menu, synchronize or sign out':READY?'Sign in with Google':'Set up Firebase authentication');
   status.textContent=phase;
   const pill=$('.topbar .local-pill');
   if(pill){pill.textContent=signed?'Cloud + local backup':'Saved on this device';pill.title=signed?'Signed-in data syncs to your private Firestore document':'Your work is saved locally; sign in to enable cloud sync';}
   const h=$('.settings-card h3');
   if(h && /local-only storage|cloud/i.test(h.textContent||'')){
     h.textContent='Your storage and privacy';
     const p=h.parentElement?.querySelector('p');
     if(p)p.textContent=signed?'Progress is stored locally and synced to a Firestore document accessible to your Google account. Keep periodic JSON backups.':'Work is saved in this browser. Configure Firebase and sign in with Google to sync across devices; backup export remains available.';
   }
   const sub=$('.page-sub');
   if(sub && /saved on this device/i.test(sub.textContent||''))sub.textContent=signed?'Synced with your private Google account, with local access offline.':'Saved locally; sign in with Google to sync across devices.';
   const privacyNotes=[...document.querySelectorAll('.content .note-panel')];
   const privacyNote=privacyNotes.find(el=>/Study data stays in this browser/i.test(el.textContent||''));
   if(privacyNote && signed)privacyNote.textContent='Privacy: This device keeps a local copy. While signed in, your own notes, custom exercises and study progress also sync to a Firestore document protected by Firebase Authentication. Export JSON backups periodically.';
 }finally{renderGuard=false;}
}
async function onButtonClick(){
 if(!READY){notice('Firebase setup is pending. Add the web app configuration in Render environment variables and enable Google Authentication. Your existing study progress stays safe on this device.');return;}
 if(!auth){notice('Authentication is initializing. Please try again.');return;}
 if(user){
   const control=$('#eeit-cloud-control'),existing=$('#eeit-cloud-menu');
   if(existing){existing.remove();return;}
   if(!control)return;
   const menu=document.createElement('div');menu.id='eeit-cloud-menu';menu.className='cloud-menu';
   menu.setAttribute('role','menu');
   const account=document.createElement('div');account.className='cloud-menu-account';account.textContent=user.email||'Google account';
   const syncNow=document.createElement('button');syncNow.type='button';syncNow.textContent='Sync my progress';syncNow.setAttribute('role','menuitem');
   syncNow.addEventListener('click',async()=>{menu.remove();await sync(true);notice(phase);});
   const signOut=document.createElement('button');signOut.type='button';signOut.textContent='Sign out';signOut.setAttribute('role','menuitem');
   signOut.addEventListener('click',async()=>{menu.remove();await api.signOut(auth);notice('Signed out. This device retains its local progress and notes.');});
   menu.append(account,syncNow,signOut);control.append(menu);
   setTimeout(()=>document.addEventListener('pointerdown',function close(e){if(!control.contains(e.target))menu.remove();document.removeEventListener('pointerdown',close);}),0);
   return;
 }
 try{
   phase='Opening Google…';mount();
   const provider=new api.GoogleAuthProvider();
   await api.signInWithPopup(auth,provider);
 }catch(err){
   cloudError=err.code||'Authentication error';phase='Sign-in failed';mount();
   notice('Google Sign-In failed: '+(err.message||'Check your Firebase authorized domains.'));
 }
}
async function sync(force=false){
 if(!user||!db||syncing||!navigator.onLine)return;
 const now=Date.now(), current=readLocal(), encoded=normalize(current);
 if(!force && encoded===lastSynced && now-lastChecked<REMOTE_CHECK_EVERY)return;
 syncing=true;phase='Syncing…';mount();
 try{
   const ref=api.doc(db,'users',user.uid,'apps',DOC_ID);
   const mergedJson=await api.runTransaction(db,async transaction=>{
     const snapshot=await transaction.get(ref);
     const remote=snapshot.exists()?validMap(snapshot.data().study):{};
     const merged=mergeStudy(current,remote);
     const localMerged=normalize(merged),remoteJson=normalize(remote);
     if(new TextEncoder().encode(localMerged).length>850_000)throw Error('Cloud data exceeds the safe Firestore document size. Export your JSON backup.');
     if(!snapshot.exists()||localMerged!==remoteJson)transaction.set(ref,{study:merged,schemaVersion:1,updatedAt:api.serverTimestamp()});
     return localMerged;
   });
   if(mergedJson!==encoded){
     localStorage.setItem(STORE,mergedJson);
     lastSynced=mergedJson;
     phase='Cloud synced';lastChecked=now;
     mount();
     location.reload();
     return;
   }
   lastSynced=mergedJson;lastChecked=Date.now();phase='Synced';cloudError='';mount();
 }catch(err){
   cloudError=String(err.code||err.message||err);
   phase='Sync needs attention';mount();
   if(force)notice('Cloud synchronization failed: '+(err.message||'Check your Firestore permissions.'));
 }finally{syncing=false;}
}
async function init(){
 mount();
 if(!READY)return;
 try{
   const [appSDK,authSDK,dbSDK]=await Promise.all([
     import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
     import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
     import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
   ]);
   api={...appSDK,...authSDK,...dbSDK};
   const app=api.initializeApp(CONFIG,'eeit-study-hub');
   auth=api.getAuth(app);db=api.getFirestore(app);
   api.onAuthStateChanged(auth,async next=>{
     user=next;phase=user?'Loading cloud progress…':'Local backup active';lastSynced='';lastChecked=0;mount();
     if(user)await sync(true);
   },err=>{cloudError=err.message;phase='Google auth error';mount();});
   window.addEventListener('online',()=>sync(true));
   window.addEventListener('storage',event=>{if(event.key===STORE && user)void sync(true);});
   setInterval(()=>{if(user)void sync();},SYNC_EVERY);
 }catch(err){cloudError=err.message;phase='Auth SDK unavailable';mount();notice('Google sync could not initialize. Your local study workspace is still available.');}
}
const observer=new MutationObserver(()=>{if(!renderGuard && !$('#eeit-cloud-control'))mount();});
observer.observe(document.getElementById('app'),{childList:true,subtree:true});
init();
