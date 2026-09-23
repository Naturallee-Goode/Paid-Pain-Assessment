const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const sourceDirectory = path.resolve(__dirname, '..', 'src')
const indexHtml = fs.readFileSync(path.join(sourceDirectory, 'index.html'), 'utf8')
const viewerJavaScript = fs.readFileSync(path.join(sourceDirectory, 'viewer.js'), 'utf8')
const bodyAreasJavaScript = fs.readFileSync(path.join(sourceDirectory, 'body-areas.js'), 'utf8')

// Load the browser module without changing the CommonJS test setup.
const bodyAreasModule = import(`data:text/javascript;base64,${Buffer.from(bodyAreasJavaScript).toString('base64')}`)

const expectedBodyAreas = [
  { id: 'neck', label: 'Neck' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'upper-back', label: 'Upper Back' },
  { id: 'lower-back', label: 'Lower Back' },
  { id: 'arm', label: 'Arm' },
  { id: 'elbow', label: 'Elbow' },
  { id: 'wrist-hand', label: 'Wrist/Hand' },
  { id: 'hip', label: 'Hip' },
  { id: 'leg', label: 'Leg' },
  { id: 'knee', label: 'Knee' },
  { id: 'ankle', label: 'Ankle' },
  { id: 'foot', label: 'Foot' },
]

test('index.html loads one body-map entry point and external form assets', () => {
  assert.match(indexHtml, /<script type="module" src="body-map-app\.mjs"><\/script>/)
  assert.equal((indexHtml.match(/body-map-app\.mjs/g) || []).length, 1)
  assert.match(indexHtml, /<script type="module" src="script\.js"><\/script>/)
  assert.match(indexHtml, /<link rel="stylesheet" href="styles\.css">/)
  assert.doesNotMatch(indexHtml, /<style>/)
  assert.doesNotMatch(indexHtml, /<script type="module">/)
})

test('viewer.js retains the body-map dependencies and interactions', () => {
  assert.match(viewerJavaScript, /new GLTFLoader\(\)/)
  assert.match(viewerJavaScript, /new OrbitControls\(/)
  assert.match(viewerJavaScript, /new THREE\.Raycaster\(\)/)
  assert.match(viewerJavaScript, /function selectBodyMesh\(/)
  assert.match(viewerJavaScript, /function animate\(/)
  assert.match(viewerJavaScript, /import \{ buildMuscleCatalog, getSourceNodeName \} from ["']\.\/muscle-catalog\.js["']/)
  assert.match(viewerJavaScript, /import \{ buildMuscleOptions, resolveMuscleRecords \} from ["']\.\/muscle-options\.mjs["']/)
  assert.match(viewerJavaScript, /bodyMapStore\.selectMuscle\(muscleId/)
  assert.match(viewerJavaScript, /buildMuscleCatalog\(catalogEntries\)/)
})

test('body-map data defines the twelve supported areas with stable IDs and labels', async () => {
  const { SUPPORTED_BODY_AREAS } = await bodyAreasModule

  assert.deepEqual(SUPPORTED_BODY_AREAS, expectedBodyAreas)
  assert.equal(new Set(SUPPORTED_BODY_AREAS.map(area => area.id)).size, expectedBodyAreas.length)
})

test('body-area lookup preserves IDs while selections change', async () => {
  const { getSupportedBodyArea, getSupportedBodyAreaForRegion } = await bodyAreasModule

  const neckSelection = getSupportedBodyArea('neck')

  assert.equal(neckSelection.id, 'neck')
  assert.equal(getSupportedBodyArea('hip').id, 'hip')
  assert.strictEqual(getSupportedBodyArea('neck'), neckSelection)
  assert.equal(getSupportedBodyArea('unsupported'), null)
  assert.strictEqual(getSupportedBodyAreaForRegion('knee', 0.45), getSupportedBodyArea('knee'))
  assert.strictEqual(getSupportedBodyAreaForRegion('wrist', 0.8), getSupportedBodyArea('wrist-hand'))
  assert.strictEqual(getSupportedBodyAreaForRegion('hand', 0.7), getSupportedBodyArea('wrist-hand'))
  assert.strictEqual(getSupportedBodyAreaForRegion('upperarm', 1.1), getSupportedBodyArea('arm'))
  assert.strictEqual(getSupportedBodyAreaForRegion('forearm', 0.9), getSupportedBodyArea('arm'))
  assert.strictEqual(getSupportedBodyAreaForRegion('thigh', 0.6), getSupportedBodyArea('leg'))
  assert.strictEqual(getSupportedBodyAreaForRegion('calf', 0.3), getSupportedBodyArea('leg'))
  assert.strictEqual(getSupportedBodyAreaForRegion('back', 1.3), getSupportedBodyArea('upper-back'))
  assert.strictEqual(getSupportedBodyAreaForRegion('back', 1.2), getSupportedBodyArea('lower-back'))
})
