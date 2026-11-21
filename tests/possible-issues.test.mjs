import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { createBodyMapStore } from '../src/body-map-store.mjs'
import { initializeBodyAreaControls } from '../src/body-area-controls.mjs'
import { initializePossibleIssues } from '../src/possible-issues.mjs'
import { SUPPORTED_BODY_AREAS } from '../src/body-areas.js'
import { getPossibleIssues } from '../src/possible-issues-data.mjs'

function setup() {
  const doc = new JSDOM(readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')).window.document
  const store = createBodyMapStore()
  initializeBodyAreaControls(doc, store)
  initializePossibleIssues(doc, store)
  return { doc, store }
}

test('all areas show descriptions without web links before muscle selection', () => {
  const { doc, store } = setup()
  assert.equal(doc.getElementById('possibleIssues').hidden, true)
  for (const area of SUPPORTED_BODY_AREAS) {
    doc.querySelector(`[data-area="${area.id}"]`).click()
    assert.equal(doc.getElementById('possibleIssues').hidden, false)
    assert.equal(doc.getElementById('muscleSelection').hidden, true)
    assert.equal(store.getState().muscleId, null)
    assert.equal(store.getState().side, null)
    assert.equal(store.getState().advanced, false)
    assert.equal(doc.getElementById('possibleIssuesTitle').textContent, `Common ${area.label} issues`)
    const issues = getPossibleIssues(area.id)
    assert(issues.length > 0)
    assert.equal(doc.querySelectorAll('#possibleIssuesList li').length, issues.length)
    for (const issue of issues) {
      assert(doc.getElementById('possibleIssuesList').textContent.includes(issue.description))
      assert.match(issue.source, /^https:\/\/(www.nhs.uk|orthoinfo.aaos.org)\//)
    }
    assert.equal(doc.querySelectorAll('#possibleIssuesList input, #possibleIssuesList button').length, 0)
    assert.equal(doc.querySelectorAll('#possibleIssuesList a').length, 0)
    assert.match(doc.getElementById('issuesDisclaimer').textContent, /not a medical diagnosis/)
  }
})

test('sponsor-reviewed Elbow content replaces tendon irritation and preserves other tendon entries', () => {
  const { doc } = setup()
  doc.querySelector('[data-area="elbow"]').click()
  const content = doc.getElementById('possibleIssuesList').textContent
  assert.match(content, /Tennis Elbow/)
  assert.match(content, /outside of the elbow/)
  assert.match(content, /Bursitis/)
  assert.doesNotMatch(content, /Tendon irritation|tendonitis/i)
  for (const area of ['forearm', 'thigh']) {
    assert(getPossibleIssues(area).some(issue => issue.name === 'Tendon irritation (tendonitis)'))
  }
  assert.deepEqual(getPossibleIssues('shoulder').map(issue => issue.name), [
    'Rotator cuff tear or tendon irritation', 'Shoulder impingement', 'Frozen shoulder', 'Shoulder bursitis',
  ])
})

test('advanced view reveals optional muscles; changing area clears muscle and search but retains the view', () => {
  const { doc, store } = setup()
  store.setCatalog({ shoulder: [{ id: 'test-muscle' }] })
  store.selectArea('shoulder')
  store.selectMuscle('test-muscle')
  assert.equal(store.getState().muscleId, null)
  assert.equal(store.getState().advanced, false)
  doc.getElementById('toggleMuscleView').click()
  assert.equal(doc.getElementById('muscleSelection').hidden, false)
  assert.equal(doc.activeElement.id, 'searchInput')
  assert.equal(store.getState().muscleId, null)
  store.selectMuscle('test-muscle')
  doc.getElementById('searchInput').value = 'old muscle'
  store.selectArea('foot')
  assert.equal(store.getState().muscleId, null)
  assert.equal(store.getState().advanced, true)
  assert.equal(doc.getElementById('muscleSelection').hidden, false)
  assert.equal(doc.getElementById('searchInput').value, '')
  assert.match(doc.getElementById('possibleIssuesList').textContent, /Plantar fasciitis/)
  assert.doesNotMatch(doc.getElementById('possibleIssuesList').textContent, /Bursitis/)
})

test('body-map and form reset remove stale issues even with failed model loading', () => {
  const { doc, store } = setup()
  store.setCatalogError()
  for (const reset of [() => doc.getElementById('clearBodyArea').click(), () => store.reset()]) {
    store.selectArea('hip')
    doc.getElementById('toggleMuscleView').click()
    reset()
    assert.equal(doc.getElementById('possibleIssues').hidden, true)
    assert.equal(doc.getElementById('muscleSelection').hidden, true)
    assert.equal(doc.getElementById('possibleIssuesList').children.length, 0)
    assert.equal(store.getState().advanced, false)
  }
})

test('catalog completion and failure preserve the selected area information', () => {
  const { doc, store } = setup()
  store.selectArea('shoulder')
  const list = doc.getElementById('possibleIssuesList')
  const content = list.textContent
  store.setCatalog({ shoulder: [{ id: 'test-muscle' }] })
  store.setAdvanced(true)
  store.selectMuscle('test-muscle')
  store.setSide('right')
  store.setCatalogError()
  assert.equal(list.textContent, content)
  assert.equal(doc.getElementById('possibleIssues').hidden, false)
  store.reset()
  assert.equal(list.textContent, '')
  assert.equal(doc.getElementById('possibleIssuesTitle').textContent, '')
})

test('view switch works before an area is chosen and never submits the form', () => {
  const { doc, store } = setup()
  let submissions = 0
  doc.getElementById('intakeForm').addEventListener('submit', event => { event.preventDefault(); submissions++ })
  const toggle = doc.getElementById('toggleMuscleView')
  assert.equal(toggle.getAttribute('aria-expanded'), 'false')
  assert.equal(doc.getElementById('infoPanel').hidden, true)
  toggle.click()
  assert.equal(store.getState().advanced, true)
  assert.equal(toggle.getAttribute('aria-expanded'), 'true')
  assert.match(toggle.textContent, /Return to simple/)
  assert.match(doc.getElementById('muscleSelectionHint').textContent, /Choose a body area/)
  assert.equal(doc.getElementById('muscleSelection').hidden, true)
  store.selectArea('shoulder')
  assert.equal(doc.getElementById('muscleSelection').hidden, false)
  toggle.click()
  assert.equal(doc.getElementById('infoPanel').hidden, true)
  assert.equal(doc.activeElement, toggle)
  assert.equal(submissions, 0)
})

test('returning to simple clears optional muscle and search while preserving area and optional side', () => {
  for (const side of [null, 'right']) {
    const { doc, store } = setup()
    const toggle = doc.getElementById('toggleMuscleView')
    store.setCatalog({ shoulder: [{ id: 'test-muscle' }] })
    store.selectArea('shoulder')
    store.setSide(side)
    toggle.click()
    store.selectMuscle('test-muscle')
    doc.getElementById('searchInput').value = 'old search'
    doc.getElementById('searchResults').innerHTML = '<li>Old result</li>'
    toggle.click()
    assert.equal(store.getState().muscleId, null)
    assert.equal(store.getState().areaId, 'shoulder')
    assert.equal(store.getState().side, side)
    assert.equal(doc.getElementById('searchInput').value, '')
    assert.equal(doc.getElementById('searchResults').children.length, 0)
    assert.equal(doc.getElementById('muscleSelection').hidden, true)
    assert.equal(toggle.getAttribute('aria-expanded'), 'false')
    assert.equal(doc.getElementById('possibleIssues').hidden, false)
  }
})
