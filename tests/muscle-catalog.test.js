const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const sourceDirectory = path.resolve(__dirname, '..', 'src')
const catalogJavaScript = fs.readFileSync(path.join(sourceDirectory, 'muscle-catalog.js'), 'utf8')
const catalogModule = import(`data:text/javascript;base64,${Buffer.from(catalogJavaScript).toString('base64')}`)

function readModelJson() {
  const model = fs.readFileSync(path.join(sourceDirectory, 'assets', 'human-body2.glb'))
  const jsonLength = model.readUInt32LE(12)
  return JSON.parse(model.subarray(20, 20 + jsonLength).toString().replace(/\0+$/, ''))
}

test('muscle names are readable while left and right stay available internally', async () => {
  const { createMuscleRecord } = await catalogModule
  const leftMesh = { isMesh: true }
  const rightMesh = { isMesh: true }

  const left = createMuscleRecord({
    mesh: leftMesh,
    sourceName: 'Long head of biceps brachii muscle.l',
    materialName: 'Flexion',
  })
  const right = createMuscleRecord({
    mesh: rightMesh,
    sourceName: 'Long head of biceps brachii muscle.r',
    materialName: 'Flexion',
  })

  assert.equal(left.displayName, 'Long Head Of Biceps Brachii Muscle')
  assert.equal(left.side, 'left')
  assert.strictEqual(left.mesh, leftMesh)
  assert.equal(right.displayName, left.displayName)
  assert.equal(right.side, 'right')
  assert.strictEqual(right.mesh, rightMesh)
})

test('non-muscle materials and grouped objects are excluded', async () => {
  const { createMuscleRecord } = await catalogModule
  const mesh = { isMesh: true }

  for (const materialName of ['Fascia', 'Tendon', 'Ligament', 'Bursa', 'Cartilage', 'Articular capsule', 'Text']) {
    assert.equal(createMuscleRecord({ mesh, sourceName: 'Example anatomy.l', materialName }), null)
  }

  assert.equal(createMuscleRecord({ mesh, sourceName: 'Muscles of abdomen.g', materialName: 'Flexion' }), null)
  assert.equal(createMuscleRecord({ mesh: { isMesh: false }, sourceName: 'Example muscle.l', materialName: 'Flexion' }), null)
})

test('the current GLB produces a sorted muscle-only catalog', async () => {
  const { buildMuscleCatalog } = await catalogModule
  const model = readModelJson()
  const entries = []

  model.nodes.forEach(node => {
    if (node.mesh === undefined) return
    model.meshes[node.mesh].primitives.forEach(primitive => {
      entries.push({
        mesh: { isMesh: true, materialName: model.materials[primitive.material]?.name },
        sourceName: node.name,
        materialName: model.materials[primitive.material]?.name,
      })
    })
  })

  const catalog = buildMuscleCatalog(entries)
  const sortedNames = catalog.map(record => record.displayName).sort((a, b) => a.localeCompare(b))

  assert.equal(catalog.length, 462)
  assert.deepEqual(catalog.map(record => record.displayName), sortedNames)
  assert.equal(catalog.filter(record => record.side === 'left').length, 229)
  assert.equal(catalog.filter(record => record.side === 'right').length, 230)
  assert.equal(catalog.filter(record => record.side === null).length, 3)
  assert.ok(catalog.every(record => !/\.[lrg]$/i.test(record.displayName)))
  assert.ok(catalog.some(record => record.displayName === 'Diaphragm'))
  assert.ok(catalog.every(record =>
    !['Fascia', 'Tendon', 'Ligament', 'Bursa', 'Cartilage', 'Articular capsule', 'Text']
      .includes(record.mesh.materialName)
  ))
})
