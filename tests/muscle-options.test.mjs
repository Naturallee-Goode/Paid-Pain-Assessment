import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { buildMuscleCatalog } from '../src/muscle-catalog.js'
import { mapMusclesToAreas } from '../src/muscle-area-mapping.mjs'
import { buildMuscleOptions, createMuscleId, resolveMuscleRecords } from '../src/muscle-options.mjs'

const model = fs.readFileSync(new URL('../src/assets/human-body2.glb', import.meta.url))
const json = JSON.parse(model.subarray(20, 20 + model.readUInt32LE(12)))
let meshId = 0
const entries = json.nodes.flatMap(node => node.mesh === undefined ? [] : json.meshes[node.mesh].primitives.map(primitive => ({
  mesh: { isMesh: true, id: meshId++ },
  sourceName: node.name,
  materialName: json.materials[primitive.material]?.name,
})))
const catalog = buildMuscleCatalog(entries)
const mapped = mapMusclesToAreas(catalog, { warn: () => {} }).byArea

test('logical options are stable, sorted, unique, and retain side records privately', () => {
  const { optionsByArea, recordsById } = buildMuscleOptions(mapped)
  const all = Object.values(optionsByArea).flat()
  for (const options of Object.values(optionsByArea)) {
    assert.deepEqual(options.map(item => item.name), options.map(item => item.name).sort((a, b) => a.localeCompare(b)))
    assert.equal(new Set(options.map(item => item.id)).size, options.length)
    assert(options.every(item => !/\.[lrg]$/i.test(item.name)))
  }
  assert.equal(optionsByArea.elbow.length, 1)
  assert.equal(optionsByArea.elbow[0].name, 'Anconeus Muscle')
  assert.deepEqual(optionsByArea.elbow[0].availableSides, ['left', 'right'])
  assert.deepEqual(recordsById.get(optionsByArea.elbow[0].id).map(record => record.side).sort(), ['left', 'right'])
  assert.equal(new Set(all.map(item => item.id)).size, 175)
})

test('multi-area muscles keep one area-neutral ID', () => {
  const { optionsByArea } = buildMuscleOptions(mapped)
  const id = createMuscleId('Pronator quadratus')
  assert(optionsByArea.arm.some(option => option.id === id))
  assert(optionsByArea['wrist-hand'].some(option => option.id === id))
})

test('side resolution is exact and does not guess mixed unspecified geometry', () => {
  const left = { side: 'left' }
  const right = { side: 'right' }
  const unspecified = { side: null }
  assert.deepEqual(resolveMuscleRecords([left, right], null), [left, right])
  assert.deepEqual(resolveMuscleRecords([left, right], 'left'), [left])
  assert.deepEqual(resolveMuscleRecords([left, right], 'right'), [right])
  assert.deepEqual(resolveMuscleRecords([left, right], 'both'), [left, right])
  assert.deepEqual(resolveMuscleRecords([unspecified], 'left'), [unspecified])
  assert.deepEqual(resolveMuscleRecords([unspecified, right], 'left'), [])
})

test('ID collisions fail instead of merging different source muscles', () => {
  const record = (sourceName, mesh) => ({ sourceName, displayName: sourceName, side: null, mesh })
  assert.throws(() => buildMuscleOptions({ neck: [
    record('Example muscle', {}),
    record('Example-muscle', {}),
  ] }), /collision/)
})
