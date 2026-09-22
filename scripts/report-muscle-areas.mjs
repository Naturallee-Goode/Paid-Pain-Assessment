import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
import { buildMuscleCatalog } from '../src/muscle-catalog.js';
import { mapMusclesToAreas } from '../src/muscle-area-mapping.mjs';
const b=fs.readFileSync(root+'/src/assets/human-body2.glb');const m=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
const catalog=buildMuscleCatalog(m.nodes.flatMap(n=>n.mesh===undefined?[]:m.meshes[n.mesh].primitives.map(p=>({mesh:{isMesh:true},sourceName:n.name,materialName:m.materials[p.material]?.name}))));
const {byArea,unmapped}=mapMusclesToAreas(catalog,{warn:()=>{}});
let doc=`# Draft muscle-to-area assignments — #45

Status: anatomical and sponsor review pending. Do not close #45 yet.

The explicit table in src/muscle-area-assignments.mjs uses original GLB base names, shared by the left and right catalog records. The mapper preserves the original records and mesh references. A muscle may appear in more than one area. Grouping uses physical location only. Arm covers the upper arm and forearm; Leg covers the thigh and lower leg. Muscles are not assigned to a distant joint simply because they move it. Some muscles span regions, so shared membership still needs anatomical review. It is not a diagnosis or a pain-source prediction.

General anatomy references used for orientation (the product-specific assignments are a draft interpretation, not a classification prescribed by these sources):

- [OpenStax: head, neck and back](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back)
- [OpenStax: shoulder and upper limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs)
- [OpenStax: pelvic girdle and lower limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs)

## Review required

- Confirm the membership lists below, including muscles assigned to multiple areas.
- Review every unassigned name. Decide whether to map it or explicitly document it as outside this version's twelve areas. No exclusions have been silently inferred for those muscle records.
- Resolve generic names such as Rotatores and internal head/neck/trunk structures rather than guessing from model coordinates.
- Confirm physical region boundaries, particularly whether Anconeus counts as Elbow, Popliteus as Knee, Pronator quadratus as Wrist/Hand, and distal Fibularis tertius as Ankle. The ankle candidate lies in the distal leg near the ankle; if the product defines ankle strictly at the joint, remove it rather than force a nonempty list.
- Confirm which internal pharyngeal/laryngeal muscles belong in the client-facing Neck area.
- Face, chest, abdomen, and pelvic-floor muscles without a supported physical region remain unassigned; these are not silently deleted or labeled as non-muscle anatomy.
- The previous coordinate zones are not used here: model bounds can put nearby hand objects into a hip zone. #47's visual boundaries need a separate review.

## Implementation and tests

The viewer builds these groups from Girwan's muscle-only catalog after loading. getMusclesForArea(areaId) returns a copy of the area's array for future list UI (#48); this change does not implement that UI. Arm and Leg focus uses the mapped meshes; the original ten areas retain spatial highlights. One aggregate console warning lists unmapped records. Unknown assignment area IDs throw a configuration error. Tests check exclusions through the catalog pipeline, side preservation, real-model name coverage, nonempty lists, ordering, deduplication, and unknown/unmapped handling.

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
