import { getSupportedBodyArea } from './body-areas.js'
import { getCommonIssueContent } from './common-issues-data.mjs'

export function initializeAreaInformation(doc, store) {
  const panel = doc.getElementById('areaInformation')
  // Subscribe before loading the viewer so model failures cannot hide area content.
  return store.subscribe((state, previous, action) => {
    if (state.areaId === previous.areaId && action.type !== 'init') return
    panel.hidden = !state.areaId
    renderCommonIssues(panel, state.areaId)
  })
}

export function renderCommonIssues(root, areaId, record = getCommonIssueContent(areaId)) {
  root.replaceChildren()
  const area = getSupportedBodyArea(areaId)
  if (!area) return
  const doc = root.ownerDocument
  const heading = doc.createElement('strong')
  heading.textContent = `Common ${area.label} issues`
  root.append(heading)

  const review = record?.review
  const approved = review?.status === 'approved' && review.reviewer === 'Mia Miller' && review.date && review.evidence
  if (!record?.items?.length || (!approved && review?.status !== 'pending')) {
    const message = doc.createElement('p')
    message.textContent = 'Content is not available for this area yet.'
    root.append(message)
    return
  }
  const list = doc.createElement('ul')
  list.className = 'common-issues-list'
  for (const item of record.items) {
    const li = doc.createElement('li')
    const name = doc.createElement('strong')
    name.textContent = item.name
    li.append(name, doc.createTextNode(`: ${item.description}`))
    list.append(li)
  }
  root.append(list)
}
