import { initializeBodyAreaControls } from './body-area-controls.mjs'
import { bodyMapStore } from './body-map-store.mjs'

initializeBodyAreaControls(document, bodyMapStore)

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

await import('./viewer.js')
