import { initializeBodyAreaControls } from './body-area-controls.mjs'
import { bodyMapStore } from './body-map-store.mjs'
import { initializeVisualSelection } from './visual-selection.mjs'

initializeBodyAreaControls(document, bodyMapStore)
initializeVisualSelection(document, bodyMapStore)

const form = document.getElementById('intakeForm')
if (form) {
  for (const radio of form.querySelectorAll('input[name="painSide"]')) {
    radio.addEventListener('change', () => {
      if (radio.checked) bodyMapStore.setSide(radio.value)
    })
  }

  bodyMapStore.subscribe(state => {
    for (const radio of form.querySelectorAll('input[name="painSide"]')) {
      radio.checked = radio.value === state.side
    }
  })
}

try {
  await import('./viewer.js')
} catch (error) {
  console.error('Body-map viewer failed to start:', error)
  bodyMapStore.setCatalogError()
  const label = document.getElementById('loadingLabel')
  const percent = document.getElementById('loadingPercent')
  const progress = document.getElementById('loadingBarFill')
  if (label) label.textContent = '3D model unavailable'
  if (percent) percent.textContent = ''
  if (progress) progress.style.width = '0%'
}
