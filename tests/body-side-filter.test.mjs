import test from 'node:test'
import assert from 'node:assert/strict'
import { filterMuscleRecordsBySide, matchesSelectedSide } from '../src/body-side-filter.mjs'

test('left and right choices only match meshes on that anatomical side', () => {
  assert.equal(matchesSelectedSide('left', 'left'), true)
  assert.equal(matchesSelectedSide('right', 'left'), false)
  assert.equal(matchesSelectedSide(null, 'left'), false)
  assert.equal(matchesSelectedSide('right', 'right'), true)
  assert.equal(matchesSelectedSide('left', 'right'), false)
})

test('both and no choice retain bilateral area highlighting', () => {
  for (const meshSide of ['left', 'right', null]) {
    assert.equal(matchesSelectedSide(meshSide, 'both'), true)
    assert.equal(matchesSelectedSide(meshSide, null), true)
  }
})

test('a selected muscle keeps the copies requested by the side choice', () => {
  const records = [{ side: 'left' }, { side: 'right' }]
  assert.deepEqual(filterMuscleRecordsBySide(records, 'left'), [records[0]])
  assert.deepEqual(filterMuscleRecordsBySide(records, 'right'), [records[1]])
  assert.deepEqual(filterMuscleRecordsBySide(records, 'both'), records)
})
