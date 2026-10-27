import { getSupportedBodyArea } from './body-areas.js'
import { getPossibleIssues } from './possible-issues-data.mjs'

export function renderIssueItems(list, areaId, issues = getPossibleIssues(areaId)) {
  list.replaceChildren()
  if (!getSupportedBodyArea(areaId)) return
  const doc = list.ownerDocument
  if (!issues.length) {
    const item = doc.createElement('li')
    item.textContent = 'Content is not available for this area yet.'
    list.append(item)
  }
  for (const issue of issues) {
    const item = doc.createElement('li')
    const heading = doc.createElement('strong')
    heading.textContent = issue.name
    const description = doc.createElement('p')
    description.textContent = issue.description
    item.append(heading, description)
    list.append(item)
  }
}

export function renderCommonIssues(root, areaId) {
  root.replaceChildren()
  const area = getSupportedBodyArea(areaId)
  if (!area) return
  const doc = root.ownerDocument
  const heading = doc.createElement('strong')
  heading.textContent = `Common ${area.label} issues`
  const list = doc.createElement('ul')
  list.className = 'common-issues-list'
  renderIssueItems(list, areaId)
  const disclaimer = doc.createElement('p')
  disclaimer.className = 'common-issues-disclaimer'
  disclaimer.textContent = 'Educational information only. These examples do not identify the cause of your pain and are not a medical diagnosis.'
  root.append(heading, list, disclaimer)
}

export function initializePossibleIssues(doc, store) {
  const panel = doc.getElementById('possibleIssues')
  const title = doc.getElementById('possibleIssuesTitle')
  const list = doc.getElementById('possibleIssuesList')
  const toggle = doc.getElementById('toggleMuscleView')
  const details = doc.getElementById('infoPanel')
  const muscles = doc.getElementById('muscleSelection')
  const hint = doc.getElementById('muscleSelectionHint')
  const search = doc.getElementById('searchInput')

  const toggleView = () => {
    store.setAdvanced(!store.getState().advanced)
    if (store.getState().advanced && store.getState().areaId) search.focus()
    else toggle.focus()
  }
  toggle.addEventListener('click', toggleView)

  const unsubscribe = store.subscribe((state, previous, action) => {
    const area = getSupportedBodyArea(state.areaId)
    panel.hidden = !area
    details.hidden = !state.advanced
    muscles.hidden = !area || !state.advanced
    hint.hidden = !state.advanced
    hint.textContent = area
      ? 'Search for a muscle or select one on the model. Muscle selection is optional.'
      : 'Choose a body area to explore its muscles.'
    toggle.textContent = state.advanced ? 'Return to simple view' : 'Explore muscles (advanced)'
    toggle.setAttribute('aria-expanded', String(state.advanced))
    if (state.areaId !== previous.areaId || state.advanced !== previous.advanced || action.type === 'init' || action.type === 'reset') {
      search.value = ''
      const results = doc.getElementById('searchResults')
      results.replaceChildren()
      results.classList.remove('visible')
    }
    if (state.areaId !== previous.areaId || action.type === 'init' || action.type === 'reset') {
      title.textContent = area ? `Common ${area.label} issues` : ''
      renderIssueItems(list, state.areaId)
    }
  })
  return () => {
    unsubscribe()
    toggle.removeEventListener('click', toggleView)
  }
}
