import { BODY_AREAS } from './body-area-config.mjs'

export function initializeBodyAreaControls(doc = document) {
  const root = doc.getElementById('bodyAreaControls')
  if (!root) return
  const choices = doc.getElementById('bodyAreaChoices')
  const status = doc.getElementById('bodyAreaStatus')
  const input = doc.getElementById('selectedBodyArea')
  const change = doc.getElementById('changeBodyArea')
  const clear = doc.getElementById('clearBodyArea')
  const buttons = []
  const emit = (area) => doc.dispatchEvent(new doc.defaultView.CustomEvent('bodyAreaChanged', {
    detail: { area: area?.id || '', label: area?.label || '' },
  }))
  function select(id, notify = true) {
    const area = BODY_AREAS.find(item => item.id === id)
    input.value = area?.id || ''
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.area === area?.id))
    status.textContent = area ? `Selected area: ${area.label}` : 'No body area selected.'
    change.disabled = !area
    clear.disabled = !area
    if (notify) emit(area)
  }
  for (const area of BODY_AREAS) {
    const button = doc.createElement('button')
    button.type = 'button'
    button.dataset.area = area.id
    button.textContent = area.label
    button.setAttribute('aria-pressed', 'false')
    button.addEventListener('click', () => select(area.id))
    choices.appendChild(button)
    buttons.push(button)
  }
  change.addEventListener('click', () => {
    select('')
    buttons[0].focus()
  })
  clear.addEventListener('click', () => {
    select('')
    buttons[0].focus()
  })
  doc.getElementById('intakeForm').addEventListener('reset', () => select(''))
  // Legacy mesh clicks may identify areas outside the supported ten. Clear the
  // button state without overwriting the existing viewer's stored value.
  doc.addEventListener('bodyAreaSelected', event => {
    const legacy = event.detail.area
    const id = ['wrist', 'hand'].includes(legacy) ? 'wrist-hand' : legacy
    const area = BODY_AREAS.find(item => item.id === id)
    if (area) select(id, false)
    else {
      for (const button of buttons) button.setAttribute('aria-pressed', 'false')
      status.textContent = `Model selection: ${event.detail.label || legacy}`
      clear.disabled = false
      change.disabled = false
    }
  })
  doc.addEventListener('bodyAreaCleared', () => select('', false))
  select('', false)
}

if (typeof document !== 'undefined') initializeBodyAreaControls()
