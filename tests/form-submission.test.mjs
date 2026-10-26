import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEmailParams, getBodyMapSubmission } from '../src/form-submission.mjs'
import { createBodyMapStore } from '../src/body-map-store.mjs'

test('submission represents an omitted side as Not specified', () => {
  assert.equal(buildEmailParams({}).pain_side, 'Not specified')
  assert.equal(buildEmailParams({ painSide: '' }).pain_side, 'Not specified')
})

test('submission preserves each explicit side value', () => {
  for (const side of ['left', 'right', 'both']) {
    assert.equal(buildEmailParams({ painSide: side }).pain_side, side)
  }
})

test('area-only and detailed submissions derive one selection for email and confirmation', () => {
  const store = createBodyMapStore()
  store.setCatalog({ shoulder: [{ id: 'muscle.deltoid', name: 'Deltoid' }] })
  store.selectArea('shoulder')
  const areaOnly = getBodyMapSubmission(store.getState())
  assert.deepEqual(areaOnly, {
    selectedBodyArea: 'Shoulder', selectedBodyAreaId: 'shoulder',
    selectedMuscle: 'Not selected', selectedMuscleId: '', painSide: 'Not specified',
  })
  assert.deepEqual({
    area: buildEmailParams(areaOnly).body_area,
    muscle: buildEmailParams(areaOnly).muscle,
    side: buildEmailParams(areaOnly).pain_side,
  }, { area: areaOnly.selectedBodyArea, muscle: areaOnly.selectedMuscle, side: areaOnly.painSide })

  store.setAdvanced(true)
  store.selectMuscle('muscle.deltoid')
  store.setSide('both')
  const detailed = getBodyMapSubmission(store.getState())
  assert.equal(detailed.selectedMuscleId, 'muscle.deltoid')
  assert.equal(buildEmailParams(detailed).muscle_id, 'muscle.deltoid')
  assert.equal(buildEmailParams(detailed).pain_side, 'both')

  store.setAdvanced(false)
  assert.equal(getBodyMapSubmission(store.getState()).selectedMuscle, 'Not selected')
  assert.equal(getBodyMapSubmission(store.getState()).painSide, 'both')

  store.selectArea('foot')
  assert.equal(getBodyMapSubmission(store.getState()).selectedBodyArea, 'Foot')
  assert.equal(getBodyMapSubmission(store.getState()).selectedMuscle, 'Not selected')
  assert.equal(getBodyMapSubmission(store.getState()).painSide, 'Not specified')

  store.reset()
  assert.deepEqual(getBodyMapSubmission(store.getState()), {
    selectedBodyArea: 'Not selected', selectedBodyAreaId: '',
    selectedMuscle: 'Not selected', selectedMuscleId: '', painSide: 'Not specified',
  })
})
