import assert from 'node:assert/strict'
import test from 'node:test'
import { buildAreaMuscleSearchIndex, findAreaMuscles } from '../src/area-muscle-search.mjs'

test('advanced search and browsing stay within the selected area', () => {
  const arm = { sourceName: 'Biceps Brachii Muscle.l', side: 'left', mesh: { id: 'arm' } }
  const leg = { sourceName: 'Biceps Femoris Muscle.l', side: 'left', mesh: { id: 'leg' } }
  const index = buildAreaMuscleSearchIndex({
    shoulder: [{ id: 'muscle.biceps-brachii-muscle', name: 'Biceps Brachii Muscle' }],
    thigh: [{ id: 'muscle.biceps-femoris-muscle', name: 'Biceps Femoris Muscle' }],
  }, { shoulder: [arm], thigh: [leg] })

  assert.deepEqual(findAreaMuscles(index, 'shoulder', '').map(entry => entry.label), ['Biceps Brachii Muscle'])
  assert.deepEqual(findAreaMuscles(index, 'shoulder', 'BiCePs').map(entry => entry.records[0].mesh), [arm.mesh])
  assert.deepEqual(findAreaMuscles(index, 'thigh', 'biceps').map(entry => entry.records[0].mesh), [leg.mesh])
  assert.deepEqual(findAreaMuscles(index, 'shoulder', 'femoris'), [])
  assert.deepEqual(findAreaMuscles(index, 'unknown', 'biceps'), [])
})
