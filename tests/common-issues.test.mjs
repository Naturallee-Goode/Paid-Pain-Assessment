import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { SUPPORTED_BODY_AREAS } from '../src/body-areas.js'
import { POSSIBLE_ISSUES_BY_AREA, ISSUE_CONTENT_REVIEW_BY_AREA, getPossibleIssues } from '../src/possible-issues-data.mjs'
import { initializePossibleIssues, renderCommonIssues, renderIssueItems } from '../src/possible-issues.mjs'
import { createBodyMapStore } from '../src/body-map-store.mjs'

const reviewDoc = readFileSync(new URL('../docs/content/common-issues-review.md', import.meta.url), 'utf8')
const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')

test('every configured area has sourced content and an accurate review record', () => {
  const ids = SUPPORTED_BODY_AREAS.map(area => area.id).sort()
  assert.deepEqual(Object.keys(POSSIBLE_ISSUES_BY_AREA).sort(), ids)
  assert.deepEqual(Object.keys(ISSUE_CONTENT_REVIEW_BY_AREA).sort(), ids)
  for (const area of SUPPORTED_BODY_AREAS) {
    const row = reviewDoc.split('\n').find(line => line.startsWith('| `' + area.id + '` |'))
    assert(row, `Missing review row for ${area.id}`)
    for (const item of getPossibleIssues(area.id)) {
      assert(row.includes(item.name))
      assert(item.description)
      assert.match(item.source, /^https:\/\//)
      assert(reviewDoc.includes(item.source))
    }
    const review = ISSUE_CONTENT_REVIEW_BY_AREA[area.id]
    assert.notEqual(review.status, 'approved')
    assert.equal(review.date, null, 'Do not invent a correspondence or approval date')
    if (area.id === 'elbow') {
      assert.equal(review.status, 'revision-applied')
      assert.equal(review.reviewer, 'Mia Miller')
      assert.match(review.requestedChanges, /Tennis Elbow/)
      assert(reviewDoc.includes(review.evidence))
      assert.match(review.limitation, /not separately reviewed/)
    } else {
      assert.equal(review.status, 'pending')
      assert.equal(review.reviewer, null)
    }
  }
})

test('area and selected-muscle details show identical regional issue names and descriptions', () => {
  const doc = new JSDOM(html).window.document
  const store = createBodyMapStore()
  const dispose = initializePossibleIssues(doc, store)
  const detail = doc.getElementById('partDescription')
  for (const area of SUPPORTED_BODY_AREAS) {
    store.selectArea(area.id)
    renderCommonIssues(detail, area.id)
    assert.equal(doc.getElementById('possibleIssuesTitle').textContent, `Common ${area.label} issues`)
    assert.equal(detail.querySelector('strong').textContent, `Common ${area.label} issues`)
    assert.deepEqual([...detail.querySelectorAll('li')].map(li => li.textContent),
      [...doc.querySelectorAll('#possibleIssuesList li')].map(li => li.textContent))
    assert.equal(detail.querySelectorAll('a, input, button').length, 0)
    assert.match(detail.textContent, /do not identify the cause of your pain/)
    assert.match(detail.textContent, /not a medical diagnosis/)
    assert.doesNotMatch(detail.textContent, /Possible diagnoses|approved/i)
  }
  renderCommonIssues(detail, 'foot')
  assert.doesNotMatch(detail.textContent, /Frozen shoulder/)
  renderCommonIssues(detail, null)
  assert.equal(detail.textContent, '')
  dispose()
})

test('empty content replaces stale items and unknown IDs cannot access inherited properties', () => {
  const doc = new JSDOM('<ul></ul>').window.document
  const list = doc.querySelector('ul')
  renderIssueItems(list, 'shoulder')
  renderIssueItems(list, 'foot', [])
  assert.equal(list.children.length, 1)
  assert.equal(list.textContent, 'Content is not available for this area yet.')
  for (const id of ['unknown', '__proto__', 'constructor']) {
    assert.deepEqual(getPossibleIssues(id), [])
    renderIssueItems(list, id)
    assert.equal(list.textContent, '')
  }
})

test('content stays plain text and cannot inject markup', () => {
  const doc = new JSDOM('<ul></ul>').window.document
  const list = doc.querySelector('ul')
  const item = { name: '<img src=x onerror=alert(1)>', description: '<script>example</script>' }
  renderIssueItems(list, 'shoulder', [item])
  assert(list.textContent.includes(item.name))
  assert(list.textContent.includes(item.description))
  assert.equal(list.querySelectorAll('img, script, a').length, 0)
})
