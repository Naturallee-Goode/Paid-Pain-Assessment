import test from 'node:test'
import assert from 'node:assert/strict'
import { createBodyMapStore } from '../src/body-map-store.mjs'

const options = {
  elbow: [{ id: 'muscle.anconeus-muscle', name: 'Anconeus Muscle', availableSides: ['left', 'right'] }],
  knee: [{ id: 'muscle.popliteus-muscle', name: 'Popliteus Muscle', availableSides: ['left', 'right'] }],
}

test('store publishes coherent area, muscle, side, and reset transitions', () => {
  const store = createBodyMapStore()
  const updates = []
  store.subscribe((state, previous, action) => updates.push({ state, previous, action }))
  assert.equal(updates[0].action.type, 'init')

  store.setCatalog(options)
  store.selectArea('elbow')
  store.setAdvanced(true)
  store.selectMuscle('muscle.anconeus-muscle')
  store.setSide('right')
  assert.deepEqual(store.getState(), {
    areaId: 'elbow',
    muscleId: 'muscle.anconeus-muscle',
    advanced: true,
    side: 'right',
    catalogStatus: 'ready',
    optionsByArea: options,
  })

  store.selectArea('knee')
  assert.equal(store.getState().areaId, 'knee')
  assert.equal(store.getState().muscleId, null)
  assert.equal(store.getState().side, null)
  assert.equal(store.getState().advanced, true)
  store.reset()
  assert.equal(store.getState().areaId, null)
  assert.equal(store.getState().advanced, false)
})

test('simple view prevents muscle selection and returning to it preserves area and side', () => {
  const store = createBodyMapStore()
  store.setCatalog(options)
  store.selectArea('elbow')
  store.selectMuscle('muscle.anconeus-muscle')
  assert.equal(store.getState().muscleId, null)
  store.setAdvanced(true)
  store.selectMuscle('muscle.anconeus-muscle')
  assert.equal(store.getState().muscleId, 'muscle.anconeus-muscle')
  store.setSide('right')
  store.setAdvanced(false)
  assert.equal(store.getState().areaId, 'elbow')
  assert.equal(store.getState().side, 'right')
  assert.equal(store.getState().muscleId, null)
  store.setAdvanced(true)
  assert.equal(store.getState().muscleId, null)
})

test('store rejects invalid area, muscle, and side values', () => {
  const store = createBodyMapStore()
  store.setCatalog(options)
  assert.throws(() => store.selectArea('invalid'), /Unknown body area/)
  assert.throws(() => store.selectMuscle('muscle.anconeus-muscle'), /Select a body area/)
  store.selectArea('knee')
  assert.throws(() => store.selectMuscle('muscle.anconeus-muscle'), /not available/)
  assert.throws(() => store.setSide('middle'), /Unknown side/)
})

test('catalog readiness replays to late subscribers', () => {
  const store = createBodyMapStore()
  store.selectArea('elbow')
  store.setCatalog(options)
  let snapshot
  store.subscribe(state => { snapshot = state })
  assert.equal(snapshot.catalogStatus, 'ready')
  assert.equal(snapshot.areaId, 'elbow')
  assert.equal(snapshot.optionsByArea.elbow[0].name, 'Anconeus Muscle')
})

test('reset publishes even when selection state is already empty so the camera can recover', () => {
  const store = createBodyMapStore()
  const actions = []
  store.subscribe((_state, _previous, action) => actions.push(action))
  store.reset({ source: 'body-map' })
  assert.deepEqual(actions.at(-1), { type: 'reset', source: 'body-map' })
})
