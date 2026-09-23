import { SUPPORTED_BODY_AREAS } from './body-areas.js'
import { bodyMapStore } from './body-map-store.mjs'

export function initializeBodyAreaControls(doc = document, store = bodyMapStore) {
  const root = doc.getElementById('bodyAreaControls')
  if (!root) return () => {}
  const choices = doc.getElementById('bodyAreaChoices')
  const status = doc.getElementById('bodyAreaStatus')
  const input = doc.getElementById('selectedBodyArea')
  const change = doc.getElementById('changeBodyArea')
  const clear = doc.getElementById('clearBodyArea')
  const buttons = []

  for (const area of SUPPORTED_BODY_AREAS) {
    const button = doc.createElement('button')
    button.type = 'button'
    button.dataset.area = area.id
    button.textContent = area.label
    button.setAttribute('aria-pressed', 'false')
    button.addEventListener('click', () => store.selectArea(area.id))
    choices.appendChild(button)
    buttons.push(button)
  }

  const clearAndFocus = () => {
    store.clearArea()
    buttons[0]?.focus()
  }
  change.addEventListener('click', clearAndFocus)
  clear.addEventListener('click', clearAndFocus)

  const unsubscribe = store.subscribe(state => {
    const area = SUPPORTED_BODY_AREAS.find(item => item.id === state.areaId)
    input.value = area?.id ?? ''
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.area === area?.id))
    }
    status.textContent = area ? `Selected area: ${area.label}` : 'No body area selected.'
    change.disabled = !area
    clear.disabled = !area
  })

  return unsubscribe
}
