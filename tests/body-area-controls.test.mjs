import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { initializeBodyAreaControls } from '../src/body-area-controls.mjs'
import { SUPPORTED_BODY_AREAS } from '../src/body-areas.js'
import { createBodyMapStore } from '../src/body-map-store.mjs'

function setup() {
  const dom = new JSDOM(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'))
  const doc = dom.window.document
  const store = createBodyMapStore()
  const unsubscribe = initializeBodyAreaControls(doc, store)
  return { dom, doc, store, unsubscribe, buttons: [...doc.querySelectorAll('[data-area]')], input: doc.getElementById('selectedBodyArea') }
}

test('all twelve controls select exclusively and never submit', () => {
  const { doc, store, buttons, input } = setup()
  assert.equal(buttons.length, 12)
  assert.equal(new Set(SUPPORTED_BODY_AREAS.map(area => area.id)).size, 12)
  let submissions = 0
  doc.getElementById('intakeForm').addEventListener('submit', event => { event.preventDefault(); submissions++ })
  for (const button of buttons) {
    button.click()
    assert.equal(input.value, button.dataset.area)
    assert.equal(store.getState().areaId, input.value)
    assert.equal(doc.querySelectorAll('[aria-pressed="true"]').length, 1)
    assert.match(doc.getElementById('bodyAreaStatus').textContent, new RegExp(button.textContent))
  }
  assert.equal(submissions, 0)
})

test('Change Area and Clear Selection clear stored data and return keyboard focus', () => {
  const { doc, store, buttons, input } = setup()
  for (const id of ['changeBodyArea', 'clearBodyArea']) {
    buttons[3].click()
    doc.getElementById(id).click()
    assert.equal(input.value, '')
    assert.equal(store.getState().areaId, null)
    assert.equal(doc.querySelectorAll('[aria-pressed="true"]').length, 0)
    assert.equal(doc.activeElement, buttons[0])
    assert.equal(doc.getElementById(id).disabled, true)
  }
})

test('external store changes render without custom DOM event loops', () => {
  const { doc, store, buttons, input } = setup()
  store.selectArea('wrist-hand', { source: 'viewer-mesh' })
  assert.equal(input.value, 'wrist-hand')
  assert.equal(buttons.find(button => button.dataset.area === 'wrist-hand').getAttribute('aria-pressed'), 'true')
  store.reset()
  assert.equal(input.value, '')
  assert.equal(doc.querySelectorAll('[aria-pressed="true"]').length, 0)
})
