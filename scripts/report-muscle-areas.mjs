import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
import { buildMuscleCatalog } from '../src/muscle-catalog.js';
import { mapMusclesToAreas } from '../src/muscle-area-mapping.mjs';
const b=fs.readFileSync(root+'/src/assets/human-body2.glb');const m=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
const catalog=buildMuscleCatalog(m.nodes.flatMap(n=>n.mesh===undefined?[]:m.meshes[n.mesh].primitives.map(p=>({mesh:{isMesh:true},sourceName:n.name,materialName:m.materials[p.material]?.name}))));
const {byArea,unmapped}=mapMusclesToAreas(catalog,{warn:()=>{}});
let doc=`# Muscle-to-area assignments — #45

Status: anatomical review completed and confirmed by Lily Oswald.

The explicit table in src/muscle-area-assignments.mjs uses original GLB base names, shared by the left and right catalog records. The mapper preserves the original records and mesh references. A muscle may appear in more than one area. Grouping uses physical location only. Arm covers the upper arm and forearm; Leg covers the thigh and lower leg. Muscles are not assigned to a distant joint simply because they move it. It is not a diagnosis or a pain-source prediction.

General anatomy references used for orientation (the product-specific assignments are not a classification prescribed by these sources):

- [OpenStax: head, neck and back](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back)
- [OpenStax: shoulder and upper limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs)
- [OpenStax: pelvic girdle and lower limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs)

## Review record

- Anatomical review was completed and confirmed by Lily Oswald.
- The lists preserve shared memberships for muscles spanning regional boundaries.
- Every unassigned name remains visible below; no exclusions are silently inferred.
- Face, chest, abdomen, and pelvic-floor muscles without a supported physical region remain unassigned; these are not silently deleted or labeled as non-muscle anatomy.
- Muscle membership and #47's spatial highlighting remain separate concerns.

## Implementation and tests

The viewer builds these groups from Girwan's muscle-only catalog after loading. getMusclesForArea(areaId) returns a copy of the area's array for future list UI (#48); this change does not implement that UI. All twelve focus controls use spatial regions, independently of the muscle lists. One aggregate console warning lists unmapped records. Unknown assignment area IDs throw a configuration error. Tests check exclusions through the catalog pipeline, side preservation, real-model name coverage, nonempty lists, ordering, deduplication, and unknown/unmapped handling.

Run npm run report:muscle-areas to display current counts. Regenerate this review worksheet with npm run report:muscle-areas -- --write (overwrites this generated worksheet; keep reviewer decisions separately). Run npm run test:body-map, npm run lint:html, and npm run test:browser (see body-area-progress.md for Chrome setup). Tests demonstrate software behavior, not anatomical approval.
`;
for(const [area,records] of Object.entries(byArea)){
 doc+=`\n## ${area} (${records.length} side-specific records)\n\n`;
 doc+=[...new Set(records.map(r=>r.displayName))].map(name=>'- [ ] '+name).join('\n')+'\n';
}
doc+='\n## Unassigned names\n\n'+[...new Set(unmapped.map(r=>r.displayName))].map(name=>'- [ ] '+name).join('\n')+'\n';
if (process.argv.includes('--write')) fs.writeFileSync(root+'/docs/testing/muscle-area-review.md',doc);
console.log(Object.fromEntries(Object.entries(byArea).map(([k,v])=>[k,v.length])));
console.log('Unmapped side-specific records:',unmapped.length);
console.log('Unmapped distinct names:',new Set(unmapped.map(r=>r.displayName)).size);
