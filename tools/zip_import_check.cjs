/* Regression test for local ZIP PDF importer with a synthetic ZIP.
 * No official course PDF is copied into this test or public deployment. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const zlib=require('node:zlib');
const source=fs.readFileSync(path.join(__dirname,'../source/source-library.mjs'),'utf8');
const start=source.indexOf('/* Safe, client-only ZIP archive importer.');
const end=source.indexOf("document.addEventListener('change',async event=>{",start);
assert(start>=0&&end>start,'ZIP importer missing');
const sandbox={
 Blob,TextDecoder,DataView,Uint8Array,Response,DecompressionStream,
 MAX_PDF_BYTES:70_000_000
};
const funcs=vm.runInNewContext(source.slice(start,end)+'\n({zipDirectory,zipMember,findZipCatalogMatch});',sandbox);
function bytesU16(b,p,v){b.writeUInt16LE(v,p)}
function bytesU32(b,p,v){b.writeUInt32LE(v,p)}
function createSimpleZip(name,data,method=8){
 const fn=Buffer.from(name,'utf8'),raw=Buffer.from(data);
 const zipContent=method===8?zlib.deflateRawSync(raw):raw;
 const local=Buffer.alloc(30);bytesU32(local,0,0x04034b50);bytesU16(local,4,20);
 bytesU16(local,6,2048);bytesU16(local,8,method);bytesU32(local,18,0);
 bytesU32(local,14,0);bytesU32(local,18,zipContent.length);bytesU32(local,22,raw.length);
 bytesU16(local,26,fn.length);bytesU16(local,28,0);
 const central=Buffer.alloc(46);bytesU32(central,0,0x02014b50);bytesU16(central,4,20);
 bytesU16(central,6,20);bytesU16(central,8,2048);bytesU16(central,10,method);
 bytesU32(central,20,zipContent.length);bytesU32(central,24,raw.length);
 bytesU16(central,28,fn.length);bytesU16(central,30,0);
 bytesU16(central,32,0);bytesU16(central,34,0);bytesU32(central,42,0);
 const offset=local.length+fn.length+zipContent.length;
 const eocd=Buffer.alloc(22);bytesU32(eocd,0,0x06054b50);
 bytesU16(eocd,8,1);bytesU16(eocd,10,1);
 bytesU32(eocd,12,central.length+fn.length);
 bytesU32(eocd,16,offset);
 return new Blob([local,fn,zipContent,central,fn,eocd],{type:'application/zip'});
}
(async()=>{
 const cat=JSON.parse(fs.readFileSync(path.join(__dirname,'../source/data/pdf-catalog.json'),'utf8'));
 const chosen=cat.entries.find(e=>e.recordType==='archive-index'&&e.path.includes('Digital_Communications/'));
 assert(chosen,'Missing Digital Communications archive entry');
 const sample='%PDF-1.5\n% test\n1 0 obj <<>> endobj\n%%EOF\n';
 for(const method of [0,8]){
  const name='TUHH_81_PDFs/'+chosen.path;
  const blob=createSimpleZip(name,sample,method);
  const items=await funcs.zipDirectory(blob);
  assert.equal(items.length,1,'ZIP entry count');
  assert.equal(items[0].name,name,'ZIP filename preservation');
  const mapped=funcs.findZipCatalogMatch(items[0].name,cat);
  assert(mapped&&mapped.id===chosen.id,'Archive path-to-catalog matching');
  const pdf=await funcs.zipMember(blob,items[0]);
  assert.equal(await pdf.text(),sample,'ZIP member decompression roundtrip');
 }
 const noMatch=funcs.findZipCatalogMatch('not_present_in_course_archive.pdf',cat);
 assert.equal(noMatch,null,'No invented PDF catalog link');
 const plain=createSimpleZip('unrelated.pdf','not a PDF',0);
 const item=(await funcs.zipDirectory(plain))[0];
 await assert.rejects(()=>funcs.zipMember(plain,item),/not a PDF/);
 console.log('PASS ZIP importer: central-directory, stored/deflated PDF, path matching and invalid-file rejection');
})().catch(error=>{console.error(error);process.exitCode=1});
