import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { createBodyMapStore } from '../src/body-map-store.mjs'
import { initializeVisualSelection } from '../src/visual-selection.mjs'

function setup() {
  const dom = new JSDOM(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'))
  const doc = dom.window.document
  const store = createBodyMapStore()
  initializeVisualSelection(doc, store)
  return {
    doc,
    store,
    step: doc.getElementById('visualSelection'),
    status: doc.getElementById('visualSelectionStatus'),
  }
}

const options = {
  foot: [{ id: 'muscle.abductor-hallucis', name: 'Abductor Hallucis', availableSides: ['left', 'right'] }],
}

test('visual refinement is optional and never displays anatomical names', () => {
  const { doc, store, step, status } = setup()
  assert.equal(step.hidden, true)
  store.selectArea('foot')
  assert.equal(step.hidden, false)
  assert.match(status.textContent, /Loading the optional 3D body map/)
  store.setCatalog(options)
  assert.match(status.textContent, /Choose Left, Right, or Both/)
  assert.doesNotMatch(step.textContent, /Abductor Hallucis/)
  assert.match(doc.querySelector('.visual-selection-optional').textContent, /continue with just the body area and side/)
})

test('side and generic selected-spot status update without exposing a muscle name', () => {
  const { doc, store, status } = setup()
  store.setCatalog(options)
  store.selectArea('foot')
  store.setSide('left')
  assert.match(status.textContent, /Tap the spot that hurts/)
  store.selectMuscle('muscle.abductor-hallucis')
  assert.match(status.textContent, /Spot selected/)
  assert.doesNotMatch(doc.getElementById('visualSelection').textContent, /Abductor Hallucis/)
  assert.equal(doc.getElementById('clearSpot').hidden, false)
  doc.getElementById('clearSpot').click()
  assert.equal(store.getState().muscleId, null)
  assert.equal(store.getState().areaId, 'foot')
  assert.equal(store.getState().side, 'left')
})

test('model failure preserves the familiar area and side workflow', () => {
  const { store, step, status } = setup()
  store.selectArea('foot')
  store.setSide('right')
  store.setCatalogError()
  assert.equal(step.hidden, false)
  assert.equal(store.getState().areaId, 'foot')
  assert.match(status.textContent, /3D body map is unavailable/)
})
