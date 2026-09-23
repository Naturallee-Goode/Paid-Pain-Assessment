import test from 'node:test'
import assert from 'node:assert/strict'
import { createBodyMapStore } from '../src/body-map-store.mjs'

const options = {
  elbow: [
    { id: 'muscle.anconeus-muscle', name: 'Anconeus Muscle', availableSides: ['left', 'right'] },
    { id: 'muscle.right-only', name: 'Internal Name', availableSides: ['right'] },
  ],
  knee: [{ id: 'muscle.popliteus-muscle', name: 'Popliteus Muscle', availableSides: ['left', 'right'] }],
}

test('store publishes coherent area, muscle, side, and reset transitions', () => {
  const store = createBodyMapStore()
  const updates = []
  store.subscribe((state, previous, action) => updates.push({ state, previous, action }))
  assert.equal(updates[0].action.type, 'init')

  store.setCatalog(options)
  store.selectArea('elbow')
  store.selectMuscle('muscle.anconeus-muscle')
  store.setSide('right')
  assert.deepEqual(store.getState(), {
    areaId: 'elbow',
    muscleId: 'muscle.anconeus-muscle',
    side: 'right',
    catalogStatus: 'ready',
    optionsByArea: options,
  })

  store.selectArea('knee')
  assert.equal(store.getState().areaId, 'knee')
  assert.equal(store.getState().muscleId, null)
  assert.equal(store.getState().side, null)
  store.reset()
  assert.equal(store.getState().areaId, null)
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

test('changing to an unavailable model side clears the optional exact spot', () => {
  const store = createBodyMapStore()
  store.setCatalog(options)
  store.selectArea('elbow')
  store.setSide('right')
  store.selectMuscle('muscle.right-only')
  store.setSide('left')
  assert.equal(store.getState().side, 'left')
  assert.equal(store.getState().muscleId, null)
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
