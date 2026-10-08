const SIDE_LABELS = { left: 'Left', right: 'Right', both: 'Both' }

export function initializeSideControls(doc, store) {
  const radios = [...doc.querySelectorAll('input[name="painSide"]')]
  const clearButton = doc.getElementById('clearPainSide')
  const status = doc.getElementById('painSideStatus')
  if (!radios.length || !clearButton || !status) return () => {}

  for (const radio of radios) {
    radio.addEventListener('change', () => {
      if (radio.checked) store.setSide(radio.value)
    })
  }

  clearButton.addEventListener('click', () => {
    store.setSide(null)
    radios[0].focus()
  })

  return store.subscribe(state => {
    for (const radio of radios) radio.checked = radio.value === state.side
    clearButton.disabled = !state.side
    status.textContent = state.side ? `${SIDE_LABELS[state.side]} side selected.` : 'No side selected.'
  })
}
