import { getSupportedBodyArea } from './body-areas.js'
import { getPossibleIssues } from './possible-issues-data.mjs'

export function initializePossibleIssues(doc, store) {
  const panel = doc.getElementById('possibleIssues')
  const title = doc.getElementById('possibleIssuesTitle')
  const list = doc.getElementById('possibleIssuesList')
  const next = doc.getElementById('continueToMuscles')
  const muscles = doc.getElementById('muscleSelection')
  const hint = doc.getElementById('muscleSelectionHint')
  const search = doc.getElementById('searchInput')

  const continueToMuscles = () => {
    store.continueToMuscles()
    search.focus()
  }
  next.addEventListener('click', continueToMuscles)

  const unsubscribe = store.subscribe((state, previous, action) => {
    const area = getSupportedBodyArea(state.areaId)
    panel.hidden = !area
    muscles.hidden = !area || !state.issuesReviewed
    hint.hidden = muscles.hidden
    next.hidden = !area || state.issuesReviewed
    if (state.areaId !== previous.areaId || action.type === 'init' || action.type === 'reset') {
      title.textContent = area ? `Possible issues in ${area.label}` : ''
      list.replaceChildren()
      search.value = ''
      const results = doc.getElementById('searchResults')
      results.replaceChildren()
      results.classList.remove('visible')
      for (const issue of getPossibleIssues(state.areaId)) {
        const item = doc.createElement('li')
        const heading = doc.createElement('strong')
        heading.textContent = issue.name
        const description = doc.createElement('p')
        description.textContent = issue.description
        item.append(heading, description)
        list.append(item)
      }
    }
  })
  return () => {
    unsubscribe()
    next.removeEventListener('click', continueToMuscles)
  }
}
