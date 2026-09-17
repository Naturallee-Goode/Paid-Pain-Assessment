const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const sourceDirectory = path.resolve(__dirname, '..', 'src')
const indexHtml = fs.readFileSync(path.join(sourceDirectory, 'index.html'), 'utf8')
const viewerJavaScript = fs.readFileSync(path.join(sourceDirectory, 'viewer.js'), 'utf8')

test('index.html loads the canonical body-map module exactly once', () => {
  assert.match(indexHtml, /<script type="module" src="viewer\.js"><\/script>/)
  assert.equal((indexHtml.match(/<script type="module" src="viewer\.js"><\/script>/g) || []).length, 1)
  assert.doesNotMatch(indexHtml, /<script type="module">/)
})

test('viewer.js retains the body-map dependencies and interactions', () => {
  assert.match(viewerJavaScript, /new GLTFLoader\(\)/)
  assert.match(viewerJavaScript, /new OrbitControls\(/)
  assert.match(viewerJavaScript, /new THREE\.Raycaster\(\)/)
  assert.match(viewerJavaScript, /function selectBodyMesh\(/)
  assert.match(viewerJavaScript, /function animate\(/)
})
