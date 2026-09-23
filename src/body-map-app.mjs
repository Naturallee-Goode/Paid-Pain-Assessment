import { initializeBodyAreaControls } from './body-area-controls.mjs'
import { bodyMapStore } from './body-map-store.mjs'
import { initializeMusclePicker } from './muscle-picker.mjs'

initializeBodyAreaControls(document, bodyMapStore)
initializeMusclePicker(document, bodyMapStore)

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
}
