import { getSupportedBodyArea } from './body-areas.js'
import { bodyMapStore } from './body-map-store.mjs'

export function initializeVisualSelection(doc = document, store = bodyMapStore) {
  const step = doc.getElementById('visualSelection')
  if (!step) return () => {}
  const heading = doc.getElementById('visualSelectionHeading')
  const status = doc.getElementById('visualSelectionStatus')
  const clearSpot = doc.getElementById('clearSpot')

  clearSpot.addEventListener('click', () => store.clearMuscle())

  return store.subscribe(state => {
    if (!state.areaId) {
      step.hidden = true
      status.textContent = ''
      clearSpot.hidden = true
      clearSpot.disabled = true
      return
    }

    const area = getSupportedBodyArea(state.areaId)
    step.hidden = false
    heading.textContent = `Show us where it hurts in your ${area?.label ?? 'selected area'}`
    clearSpot.hidden = !state.muscleId
    clearSpot.disabled = !state.muscleId

    if (state.catalogStatus === 'loading') {
      status.textContent = 'Loading the optional 3D body map…'
    } else if (state.catalogStatus === 'error') {
      status.textContent = `The 3D body map is unavailable. Your ${area?.label ?? 'body area'} selection is still saved.`
    } else if (!state.side) {
      status.textContent = 'Choose Left, Right, or Both, then tap the spot that hurts on the model.'
    } else if (state.muscleId) {
      status.textContent = 'Spot selected. Tap another spot to change it, or clear the spot below.'
    } else {
      status.textContent = 'Tap the spot that hurts on the model. Drag to rotate and pinch or scroll to zoom.'
    }
  })
}
