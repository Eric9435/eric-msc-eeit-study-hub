/* Build a public-only static distribution. Do not publish third-party question images or PDF sheets. */
const fs=require('node:fs');
const path=require('node:path');
const source=path.resolve(__dirname,'../source');
const out=path.resolve(__dirname,'../public');
fs.rmSync(out,{recursive:true,force:true});
fs.cpSync(source,out,{recursive:true,filter:p=>{
 const rel=path.relative(source,p).replace(/\\/g,'/');
 if(rel==='assets/questions'||rel.startsWith('assets/questions/'))return false;
 if(rel.toLowerCase().endsWith('.pdf'))return false;
 if(rel==='cloud-config.js')return false;
 if(['enhancements.js','enhancements.css','reason-ui.js','reason-ui.css'].includes(rel))return false;
 return true;
}});
const config={
 apiKey:process.env.EEIT_FIREBASE_API_KEY||'',
 authDomain:process.env.EEIT_FIREBASE_AUTH_DOMAIN||'',
 projectId:process.env.EEIT_FIREBASE_PROJECT_ID||'',
 appId:process.env.EEIT_FIREBASE_APP_ID||'',
 messagingSenderId:process.env.EEIT_FIREBASE_MESSAGING_SENDER_ID||'',
 storageBucket:process.env.EEIT_FIREBASE_STORAGE_BUCKET||''
};
const enabled=Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
fs.writeFileSync(path.join(out,'cloud-config.js'),'window.EEIT_FIREBASE_CONFIG = '+JSON.stringify(enabled?config:null)+';\n');
console.log('Public EEIT site ready at /public. Firebase:',enabled?'configured':'awaiting web app environment values');
console.log('Original course PDFs and question sheet images excluded from public output.');
