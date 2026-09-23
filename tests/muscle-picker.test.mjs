import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { createBodyMapStore } from '../src/body-map-store.mjs'
import { initializeMusclePicker } from '../src/muscle-picker.mjs'

function setup() {
  const dom = new JSDOM(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'))
  const doc = dom.window.document
  const store = createBodyMapStore()
  initializeMusclePicker(doc, store)
  return { doc, store, step: doc.getElementById('musclePicker'), list: doc.getElementById('muscleList'), status: doc.getElementById('musclePickerStatus') }
}

const options = {
  elbow: [{ id: 'muscle.anconeus-muscle', name: 'Anconeus Muscle', availableSides: ['left', 'right'] }],
  neck: [
    { id: 'muscle.levator-scapulae', name: 'Levator Scapulae', availableSides: ['left', 'right'] },
    { id: 'muscle.longus-colli', name: 'Longus Colli', availableSides: ['left', 'right'] },
  ],
  knee: [],
}

test('picker is hidden before area selection and distinguishes loading from empty data', () => {
  const { store, step, list, status } = setup()
  assert.equal(step.hidden, true)
  store.selectArea('elbow')
  assert.equal(step.hidden, false)
  assert.equal(status.textContent, 'Loading muscles…')
  assert.equal(list.children.length, 0)
  store.setCatalog(options)
  assert.equal(list.children.length, 1)
  assert.equal(list.firstElementChild.textContent, 'Anconeus Muscle')

  store.selectArea('knee')
  assert.equal(list.children.length, 0)
  assert.match(status.textContent, /No muscles are available/)
})

test('picker replaces the list when area changes and renders sorted unique names', () => {
  const { store, list, status } = setup()
  store.setCatalog(options)
  store.selectArea('neck')
  assert.deepEqual([...list.children].map(item => item.textContent), ['Levator Scapulae', 'Longus Colli'])
  assert.equal(status.textContent, '2 muscles available.')
  store.selectArea('elbow')
  assert.deepEqual([...list.children].map(item => item.textContent), ['Anconeus Muscle'])
  assert.equal(list.querySelector('[data-muscle-id="muscle.anconeus-muscle"]').textContent, 'Anconeus Muscle')
})

test('picker reports model failure while retaining the selected area', () => {
  const { store, step, list, status } = setup()
  store.selectArea('foot')
  store.setCatalogError()
  assert.equal(step.hidden, false)
  assert.equal(store.getState().areaId, 'foot')
  assert.equal(list.children.length, 0)
  assert.match(status.textContent, /unavailable/)
})
