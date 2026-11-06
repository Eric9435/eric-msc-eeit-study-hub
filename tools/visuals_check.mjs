import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderVisual,visualKindFor,visualTypes,visualMappedIds} from '../source/visuals.mjs';
const original=JSON.parse(fs.readFileSync(new URL('../source/data/content.json',import.meta.url),'utf8'));
const extension=JSON.parse(fs.readFileSync(new URL('../source/data/verified-expansion.json',import.meta.url),'utf8'));
const overrides=new Map(extension.overrides.map(x=>[x.id,x]));
const exercises=original.exercises.map(e=>overrides.has(e.id)?{...e,...overrides.get(e.id)}:e);
assert.equal(original.subjects.length,5,'Five subjects expected');
assert.equal(exercises.length,82,'All currently indexed exercises must have a teaching visual');
assert.equal(new Set(visualMappedIds).size,82,'Duplicate visual mappings');
assert.equal(visualMappedIds.length,82,'Mapped IDs do not cover the whole library');
assert(visualTypes.length>=40,'Too few engineering visual families');
const stats=new Map();
for(const e of exercises){
  assert(visualMappedIds.includes(e.id),'Missing explicit visual mapping: '+e.id);
  const kind=visualKindFor(e),html=renderVisual(e);
  const htmlMoved=renderVisual(e,65);
  assert(html.includes('<svg')&&html.includes('</svg>')&&html.includes('<title>')&&html.includes('<desc>'),'Incomplete accessible SVG '+e.id);
  assert(html.includes('data-visual-exercise="'+e.id+'"'),'Visual not attached to exercise '+e.id);
  assert(html.includes('data-visual-kind="'+kind+'"'),'Incorrect visual family '+e.id);
  assert(!/NaN|Infinity|undefined|<script|onerror=|onload=/.test(html),'Unsafe or invalid SVG markup '+e.id);
  assert(!/NaN|Infinity|undefined|<script|onerror=|onload=/.test(htmlMoved),'Invalid interactive output '+e.id);
  assert(!html.includes('data:image/'),'Do not embed instructor images in public visuals');
  if(e.parts.length===0)assert(html.includes('Reference-only exercise'),'Source-only entry must be labelled '+e.id);
  stats.set(e.subject,(stats.get(e.subject)||0)+1);
}
assert.equal(stats.size,5,'Every subject needs visual coverage');
console.log('PASS original accessible SVG visual engine:',visualTypes.length,'diagram families across',exercises.length,'exercise sets / five subjects. Subject coverage:',Object.fromEntries(stats));
