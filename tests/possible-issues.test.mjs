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
    assert.equal(store.getState().issuesReviewed, false)
    assert.equal(doc.getElementById('possibleIssuesTitle').textContent, `Possible issues in ${area.label}`)
    const issues = getPossibleIssues(area.id)
    assert(issues.length > 0)
    assert.equal(doc.querySelectorAll('#possibleIssuesList li').length, issues.length)
    for (const issue of issues) {
      assert(doc.getElementById('possibleIssuesList').textContent.includes(issue.description))
      assert.match(issue.source, /^https:\/\/www.nhs.uk\//)
    }
    assert.equal(doc.querySelectorAll('#possibleIssuesList input, #possibleIssuesList button').length, 0)
    assert.equal(doc.querySelectorAll('#possibleIssuesList a').length, 0)
    assert.match(doc.getElementById('issuesDisclaimer').textContent, /not a medical diagnosis/)
  }
})

test('Continue reveals optional muscles; changing area replaces issues and resets review and muscle', () => {
  const { doc, store } = setup()
  store.setCatalog({ shoulder: [{ id: 'test-muscle' }] })
  store.selectArea('shoulder')
  store.selectMuscle('test-muscle')
  assert.equal(store.getState().muscleId, 'test-muscle')
  assert.equal(store.getState().issuesReviewed, false)
  store.clearMuscle()
  doc.getElementById('continueToMuscles').click()
  assert.equal(doc.getElementById('muscleSelection').hidden, false)
  assert.equal(doc.activeElement.id, 'searchInput')
  assert.equal(store.getState().muscleId, null)
  store.selectMuscle('test-muscle')
  doc.getElementById('searchInput').value = 'old muscle'
  store.selectArea('foot')
  assert.equal(store.getState().muscleId, null)
  assert.equal(store.getState().issuesReviewed, false)
  assert.equal(doc.getElementById('muscleSelection').hidden, true)
  assert.equal(doc.getElementById('searchInput').value, '')
  assert.match(doc.getElementById('possibleIssuesList').textContent, /Plantar fasciitis/)
  assert.doesNotMatch(doc.getElementById('possibleIssuesList').textContent, /Bursitis/)
})

test('clear, change and form reset remove stale issues even with failed model loading', () => {
  const { doc, store } = setup()
  store.setCatalogError()
  for (const reset of [() => doc.getElementById('clearBodyArea').click(), () => doc.getElementById('changeBodyArea').click(), () => store.reset()]) {
    store.selectArea('hip')
    doc.getElementById('continueToMuscles').click()
    reset()
    assert.equal(doc.getElementById('possibleIssues').hidden, true)
    assert.equal(doc.getElementById('muscleSelection').hidden, true)
    assert.equal(doc.getElementById('possibleIssuesList').children.length, 0)
    assert.equal(store.getState().issuesReviewed, false)
  }
})
