import { bodyMapStore } from './body-map-store.mjs'
import { getSupportedBodyArea } from './body-areas.js'

export function initializeMusclePicker(doc = document, store = bodyMapStore) {
  const step = doc.getElementById('musclePicker')
  if (!step) return () => {}
  const heading = doc.getElementById('musclePickerHeading')
  const status = doc.getElementById('musclePickerStatus')
  const list = doc.getElementById('muscleList')

  const render = state => {
    list.replaceChildren()
    if (!state.areaId) {
      step.hidden = true
      status.textContent = ''
      return
    }

    step.hidden = false
    const area = getSupportedBodyArea(state.areaId)
    heading.textContent = `Choose a muscle in ${area?.label ?? 'this area'}`

    if (state.catalogStatus === 'loading') {
      status.textContent = 'Loading muscles…'
      return
    }
    if (state.catalogStatus === 'error') {
      status.textContent = 'Muscle information is unavailable right now. Your body area is still selected.'
      return
    }

    const options = state.optionsByArea[state.areaId] ?? []
    if (!options.length) {
      status.textContent = 'No muscles are available for this body area yet.'
      return
    }

    status.textContent = `${options.length} ${options.length === 1 ? 'muscle' : 'muscles'} available.`
    for (const option of options) {
      const item = doc.createElement('li')
      item.dataset.muscleId = option.id
      item.textContent = option.name
      list.appendChild(item)
    }
  }

  return store.subscribe(render)
}
