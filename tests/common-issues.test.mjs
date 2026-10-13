import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { SUPPORTED_BODY_AREAS } from '../src/body-areas.js'
import { COMMON_ISSUE_CONTENT, getCommonIssueContent } from '../src/common-issues-data.mjs'
import { renderCommonIssues } from '../src/common-issues.mjs'

const reviewDoc = readFileSync(new URL('../docs/content/common-issues-review.md', import.meta.url), 'utf8')
const statusLabels = { pending: 'Pending', approved: 'Approved', 'changes-requested': 'Changes requested', unavailable: 'Unavailable' }
const approvedReview = { status: 'approved', reviewer: 'Mia Miller', date: '2026-10-13', evidence: 'TEST FIXTURE ONLY', requestedChanges: null }
const createRoot = () => new JSDOM('<div id="content"></div>').window.document.getElementById('content')

test('content and review documentation match every supported ID without orphan records', () => {
  assert.deepEqual(Object.keys(COMMON_ISSUE_CONTENT).sort(), SUPPORTED_BODY_AREAS.map(area => area.id).sort())
  for (const area of SUPPORTED_BODY_AREAS) {
    const record = getCommonIssueContent(area.id)
    const row = reviewDoc.split('\n').find(line => line.startsWith(`| \`${area.id}\` |`))
    assert(row, `Missing review row for ${area.id}`)
    assert(row.includes(`| ${statusLabels[record.review.status]} |`), `Review status mismatch for ${area.id}`)
    assert(record.items.length || record.review.status === 'unavailable')
    assert.equal(new Set(record.items.map(item => item.name)).size, record.items.length)
    for (const item of record.items) {
      assert(row.includes(item.name), `Review row must include ${item.name}`)
      assert(item.name && item.description && item.sources.length)
      for (const source of item.sources) {
        assert.match(source, /^https:\/\//)
        assert(reviewDoc.includes(source), `Undocumented source: ${source}`)
      }
    }
    assert(['pending', 'approved', 'changes-requested', 'unavailable'].includes(record.review.status))
    if (record.review.status === 'pending') {
      assert.equal(record.review.reviewer, null)
      assert.equal(record.review.evidence, null)
      assert.equal(record.review.date, null)
      assert.equal(record.review.requestedChanges, null)
    }
    if (['approved', 'changes-requested'].includes(record.review.status)) {
      assert.equal(record.review.reviewer, 'Mia Miller')
      assert(record.review.date && record.review.evidence)
    }
  }
})

test('all configured areas show readable content without citations, review labels, or added disclaimer', () => {
  const root = createRoot()
  for (const area of SUPPORTED_BODY_AREAS) {
    const record = getCommonIssueContent(area.id)
    renderCommonIssues(root, area.id)
    assert.equal(root.querySelector('strong').textContent, `Common ${area.label} issues`)
    assert.equal(root.querySelectorAll('li').length, record.items.length)
    assert.equal(root.querySelectorAll('a, input, button').length, 0)
    assert.doesNotMatch(root.textContent, /These examples support education|https?:\/\//)
    for (const item of record.items) assert(root.textContent.includes(item.description))
    assert.doesNotMatch(root.textContent, /Draft|pending review/)
  }
})

test('pending and approved content render while incomplete approvals and requested changes are unavailable', () => {
  const root = createRoot()
  const record = { ...getCommonIssueContent('shoulder'), review: approvedReview }
  renderCommonIssues(root, 'shoulder', record)
  assert.equal(root.querySelectorAll('li').length, record.items.length)
  assert.equal(root.querySelector('.common-issues-review-status'), null)
  for (const review of [
    { ...approvedReview, reviewer: 'Team' },
    { ...approvedReview, date: null },
    { ...approvedReview, evidence: null },
    { ...approvedReview, status: 'changes-requested' },
  ]) {
    renderCommonIssues(root, 'shoulder', { ...record, review })
    assert.equal(root.querySelectorAll('li').length, 0)
    assert.match(root.textContent, /not available/)
  }
})

test('missing and empty records clear stale copy and use an explicit unavailable state', () => {
  const root = createRoot()
  for (const record of [null, { items: [], review: approvedReview }, { items: [], review: { status: 'unavailable' } }]) {
    renderCommonIssues(root, 'shoulder')
    renderCommonIssues(root, 'foot', record)
    assert.equal(root.querySelector('strong').textContent, 'Common Foot issues')
    assert.equal(root.querySelectorAll('li').length, 0)
    assert.match(root.textContent, /not available/)
    assert.doesNotMatch(root.textContent, /Frozen shoulder/)
  }
  for (const id of ['future-area', '__proto__', 'constructor']) {
    assert.equal(getCommonIssueContent(id).review.status, 'unavailable')
    assert.deepEqual(getCommonIssueContent(id).items, [])
  }
  renderCommonIssues(root, null)
  assert.equal(root.textContent, '')
})

test('content is rendered as text, so researched or reviewed copy cannot inject markup', () => {
  const root = createRoot()
  const item = { name: '<img src=x onerror=alert(1)>', description: '<script>example</script>' }
  renderCommonIssues(root, 'shoulder', { items: [item], review: approvedReview })
  assert(root.textContent.includes(item.name))
  assert(root.textContent.includes(item.description))
  assert.equal(root.querySelectorAll('img, script, a').length, 0)
})

test('educational form wording remains and both panels use the same content renderer', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8')
  assert.match(html, /For wellness education and movement support \(non-medical\)/)
  assert.match(html, /It is not medical diagnosis or treatment/)
  const viewer = readFileSync(new URL('../src/viewer.js', import.meta.url), 'utf8')
  assert.match(viewer, /renderCommonIssues\(document.getElementById\('partDescription'\), id\)/)
  assert.match(viewer, /renderCommonIssues\(descEl, supportedArea\?\.id\)/)
  assert.doesNotMatch(viewer, /DIAGNOSES|Common.*Diagnoses/)
})
