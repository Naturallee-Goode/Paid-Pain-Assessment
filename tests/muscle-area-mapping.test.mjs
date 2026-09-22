import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { buildMuscleCatalog } from '../src/muscle-catalog.js'
import { mapMusclesToAreas } from '../src/muscle-area-mapping.mjs'
import { MUSCLE_AREA_ASSIGNMENTS } from '../src/muscle-area-assignments.mjs'
const model = fs.readFileSync(new URL('../src/assets/human-body2.glb', import.meta.url))
const json=JSON.parse(model.subarray(20,20+model.readUInt32LE(12)))
const entries=json.nodes.flatMap(n=>n.mesh===undefined?[]:json.meshes[n.mesh].primitives.map(p=>({mesh:{isMesh:true},sourceName:n.name,materialName:json.materials[p.material]?.name})))
const catalog=buildMuscleCatalog(entries)

test('real catalog yields ten nonempty, sorted groups with distinct back lists',()=>{
 const {byArea,unmapped}=mapMusclesToAreas(catalog,{warn:()=>{}})
 assert.equal(Object.keys(byArea).length,10)
 for(const records of Object.values(byArea)) {
  assert(records.length>0)
  assert.deepEqual(records.map(r=>r.displayName),records.map(r=>r.displayName).sort((a,b)=>a.localeCompare(b)))
  assert(records.every(r=>catalog.includes(r)))
 }
 assert.notDeepEqual(byArea['upper-back'],byArea['lower-back'])
 assert(byArea['upper-back'].some(r=>r.sourceName==='Rhomboid major muscle.l'))
 assert(byArea['lower-back'].some(r=>r.sourceName==='Quadratus lumborum muscle.r'))
 assert(unmapped.length>0)
})
test('assignments reference real names and preserve both sides and mesh identity',()=>{
 const names=new Set(catalog.map(r=>r.sourceName.replace(/\.[a-z]$/i,'')))
 for(const name of Object.keys(MUSCLE_AREA_ASSIGNMENTS)) assert(names.has(name),name)
 const {byArea}=mapMusclesToAreas(catalog,{warn:()=>{}})
 const local=byArea.elbow.filter(r=>r.sourceName.startsWith('Anconeus muscle.'))
 assert.deepEqual(local.map(r=>r.side).sort(),['left','right'])
 assert.notEqual(local[0].mesh,local[1].mesh)
})
test('excluded anatomy cannot enter groups through the catalog pipeline',()=>{
 const bad=entries.filter(e=>['Fascia','Tendon','Ligament','Bursa','Cartilage','Articular capsule','Text'].includes(e.materialName))
 assert(bad.length>0)
 const {byArea}=mapMusclesToAreas(buildMuscleCatalog(bad),{warn:()=>{}})
 assert(Object.values(byArea).every(records=>records.length===0))
})
test('unmapped records are reported; invalid areas fail explicitly; duplicates are removed',()=>{
 const record=catalog[0], name=record.sourceName.replace(/\.[a-z]$/i,'')
 const warnings=[]
 const missing=mapMusclesToAreas([record],{assignments:{},warn:(...args)=>warnings.push(args)})
 assert.deepEqual(missing.unmapped,[record]);assert.equal(warnings.length,1)
 assert.throws(()=>mapMusclesToAreas([record],{assignments:{[name]:['invalid']}}),/Unknown area/)
 const {byArea}=mapMusclesToAreas([record,record],{assignments:{[name]:['neck','neck']}})
 assert.deepEqual(byArea.neck,[record])
})

test('physical-location lists do not include remote joint movers',()=>{
 const {byArea}=mapMusclesToAreas(catalog,{warn:()=>{}})
 assert(!byArea.elbow.some(r=>/biceps brachii|triceps brachii/i.test(r.sourceName)))
 assert(!byArea.knee.some(r=>/femoris|vastus|semitendinosus|semimembranosus/i.test(r.sourceName)))
 assert(!byArea['wrist-hand'].some(r=>/flexor digitorum profundus|extensor carpi|flexor carpi/i.test(r.sourceName)))
 assert(!byArea.ankle.some(r=>/gastrocnemius|soleus/i.test(r.sourceName)))
 assert(!byArea.foot.some(r=>/hallucis longus|digitorum longus/i.test(r.sourceName)))
})
