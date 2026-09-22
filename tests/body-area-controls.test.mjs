import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { initializeBodyAreaControls } from '../src/body-area-controls.mjs'
import { BODY_AREAS } from '../src/body-area-config.mjs'

function setup() {
  const dom = new JSDOM(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8'))
  const doc = dom.window.document
  initializeBodyAreaControls(doc)
  return { dom, doc, buttons: [...doc.querySelectorAll('[data-area]')], input: doc.getElementById('selectedBodyArea') }
}

test('all twelve controls work without a viewer, select exclusively, and never submit', () => {
  const { doc, buttons, input } = setup()
  assert.equal(buttons.length, 12)
  assert.equal(new Set(BODY_AREAS.map(a => a.id)).size, 12)
  let submissions = 0
  let detail
  doc.getElementById('intakeForm').addEventListener('submit', e => { e.preventDefault(); submissions++ })
  doc.addEventListener('bodyAreaChanged', e => { detail = e.detail })
  for (const button of buttons) {
    button.click()
    assert.equal(input.value, button.dataset.area)
    assert.equal(detail.area, input.value)
    assert.equal(doc.querySelectorAll('[aria-pressed="true"]').length, 1)
    assert.match(doc.getElementById('bodyAreaStatus').textContent, new RegExp(button.textContent))
  }
  assert.equal(submissions, 0)
})

test('Change Area and Clear Selection clear stored data and return keyboard focus', () => {
  const { doc, buttons, input } = setup()
  for (const id of ['changeBodyArea', 'clearBodyArea']) {
    buttons[3].click()
    doc.getElementById(id).click()
    assert.equal(input.value, '')
    assert.equal(doc.querySelectorAll('[aria-pressed="true"]').length, 0)
    assert.equal(doc.activeElement, buttons[0])
    assert.equal(doc.getElementById(id).disabled, true)
  }
})

test('form reset clears controls and notifies the model to clear highlights', () => {
  const { doc, buttons, input } = setup()
  buttons[0].click()
  let last
  doc.addEventListener('bodyAreaChanged', e => { last = e.detail.area })
  doc.getElementById('intakeForm').reset()
  assert.equal(input.value, '')
  assert.equal(last, '')
  assert.equal(doc.querySelectorAll('[aria-pressed="true"]').length, 0)
})

test('legacy model selections and clearing keep controls consistent without event loops', () => {
  const { dom, doc, buttons, input } = setup()
  buttons[0].click()
  doc.dispatchEvent(new dom.window.CustomEvent('bodyAreaSelected', { detail: { area: 'wrist', label: 'Wrist' } }))
  assert.equal(input.value, 'wrist-hand')
  doc.dispatchEvent(new dom.window.CustomEvent('bodyAreaSelected', { detail: { area: 'chest', label: 'Chest' } }))
  assert.equal(doc.querySelectorAll('[aria-pressed="true"]').length, 0)
  doc.dispatchEvent(new dom.window.CustomEvent('bodyAreaCleared'))
  assert.equal(input.value, '')
})
