import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { SUPPORTED_BODY_AREAS } from '../src/body-areas.js'
import { createBodyMapStore } from '../src/body-map-store.mjs'
import { initializeBodyAreaControls } from '../src/body-area-controls.mjs'
import { initializeAreaInformation, renderCommonIssues } from '../src/common-issues.mjs'
import { COMMON_ISSUE_CONTENT, getCommonIssueContent } from '../src/common-issues-data.mjs'

function setup() {
  const doc = new JSDOM(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')).window.document
  const store = createBodyMapStore()
  initializeBodyAreaControls(doc, store)
  const dispose = initializeAreaInformation(doc, store)
  return { doc, store, dispose, panel: doc.getElementById('areaInformation') }
}

test('every configured area shows its content without a model, muscle, or side', () => {
  const { doc, store, panel } = setup()
  assert.deepEqual(Object.keys(COMMON_ISSUE_CONTENT).sort(), SUPPORTED_BODY_AREAS.map(area => area.id).sort())
  assert.equal(panel.hidden, true)
  for (const area of SUPPORTED_BODY_AREAS) {
    doc.querySelector(`[data-area="${area.id}"]`).click()
    assert.equal(panel.hidden, false)
    assert.equal(panel.querySelector('strong').textContent, `Common ${area.label} issues`)
    assert.equal(panel.querySelectorAll('li').length, getCommonIssueContent(area.id).items.length)
    assert(panel.querySelectorAll('li').length > 0)
    assert.equal(store.getState().muscleId, null)
    assert.equal(store.getState().side, null)
    assert.equal(store.getState().catalogStatus, 'loading')
  }
})

test('area replacement and both reset controls clear old information without changing intake answers', () => {
  const { doc, store, panel } = setup()
  doc.getElementById('fullName').value = 'Test answer'
  store.selectArea('shoulder')
  store.selectArea('foot')
  assert.match(panel.textContent, /Plantar fasciitis/)
  assert.doesNotMatch(panel.textContent, /Frozen shoulder/)
  for (const reset of [() => doc.getElementById('clearBodyArea').click(), () => doc.getElementById('changeBodyArea').click(), () => store.reset()]) {
    store.selectArea('shoulder')
    reset()
    assert.equal(panel.hidden, true)
    assert.equal(panel.textContent, '')
  }
  assert.equal(doc.getElementById('fullName').value, 'Test answer')
})

test('catalog completion, failure, and optional detail changes preserve area information', () => {
  const { store, panel, dispose } = setup()
  store.selectArea('shoulder')
  const content = panel.textContent
  store.setCatalog({ shoulder: [{ id: 'test-muscle' }] })
  store.selectMuscle('test-muscle')
  store.setSide('right')
  store.setCatalogError()
  assert.equal(panel.textContent, content)
  dispose()
  store.clearArea()
  assert.equal(panel.textContent, content)
})

test('missing, empty, and unavailable records replace stale content with the agreed message', () => {
  const { panel } = setup()
  for (const record of [null, undefined, { items: [], review: { status: 'pending' } }, { items: [{ name: 'Old copy' }], review: { status: 'unavailable' } }]) {
    renderCommonIssues(panel, 'shoulder')
    // A missing lookup returns the same unavailable record as an unknown ID.
    renderCommonIssues(panel, 'foot', record === undefined ? getCommonIssueContent('missing-area') : record)
    assert.equal(panel.querySelector('strong').textContent, 'Common Foot issues')
    assert.equal(panel.querySelectorAll('li').length, 0)
    assert.match(panel.textContent, /Content is not available for this area yet\./)
    assert.doesNotMatch(panel.textContent, /Frozen shoulder|Old copy/)
  }
})
