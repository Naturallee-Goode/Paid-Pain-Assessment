import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { createBodyMapStore } from '../src/body-map-store.mjs'
import { initializeSideControls } from '../src/side-controls.mjs'

function setup() {
  const doc = new JSDOM(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')).window.document
  const store = createBodyMapStore()
  initializeSideControls(doc, store)
  return { doc, store, radios: [...doc.querySelectorAll('input[name="painSide"]')] }
}

test('side is visibly optional and starts blank', () => {
  const { doc, store, radios } = setup()
  assert.match(doc.getElementById('painSideLabel').textContent, /optional/i)
  assert.match(doc.getElementById('painSideDescription').textContent, /your body/i)
  assert.equal(radios.some(radio => radio.checked), false)
  assert.equal(store.getState().side, null)
  assert.equal(doc.getElementById('clearPainSide').disabled, true)
})

test('Left, Right, Both, and clear stay synchronized with store and visible status', () => {
  const { doc, store, radios } = setup()
  for (const radio of radios) {
    radio.click()
    assert.equal(store.getState().side, radio.value)
    assert.equal(radios.filter(item => item.checked).length, 1)
    assert.match(doc.getElementById('painSideStatus').textContent, new RegExp(radio.value, 'i'))
  }
  doc.getElementById('clearPainSide').click()
  assert.equal(store.getState().side, null)
  assert.equal(radios.some(radio => radio.checked), false)
  assert.equal(doc.activeElement, radios[0])
  assert.match(doc.getElementById('painSideStatus').textContent, /No side selected/)
})

test('area changes and reset clear stale visible side state', () => {
  const { doc, store, radios } = setup()
  store.selectArea('shoulder')
  radios[1].click()
  store.selectArea('foot')
  assert.equal(store.getState().side, null)
  assert.equal(radios.some(radio => radio.checked), false)
  radios[2].click()
  store.reset()
  assert.equal(radios.some(radio => radio.checked), false)
})
