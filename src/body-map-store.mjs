import { getSupportedBodyArea } from './body-areas.js'

const VALID_SIDES = new Set(['left', 'right', 'both'])

export function createBodyMapStore() {
  let state = {
    areaId: null,
    muscleId: null,
    side: null,
    catalogStatus: 'loading',
    optionsByArea: {},
  }
  const listeners = new Set()

  const publish = (next, action) => {
    const previous = state
    state = next
    for (const listener of listeners) listener(state, previous, action)
  }

  const update = (changes, action) => {
    const next = { ...state, ...changes }
    if (Object.keys(changes).every(key => Object.is(next[key], state[key]))) return
    publish(next, action)
  }

  return {
    getState: () => state,

    subscribe(listener, { emitCurrent = true } = {}) {
      listeners.add(listener)
      if (emitCurrent) listener(state, state, { type: 'init' })
      return () => listeners.delete(listener)
    },

    selectArea(areaId, { source = 'ui' } = {}) {
      const area = areaId ? getSupportedBodyArea(areaId) : null
      if (areaId && !area) throw new Error(`Unknown body area: ${areaId}`)
      if ((area?.id ?? null) === state.areaId) return
      update({ areaId: area?.id ?? null, muscleId: null, side: null }, { type: 'area', source })
    },

    clearArea(options) {
      this.selectArea(null, options)
    },

    selectMuscle(muscleId, { source = 'ui' } = {}) {
      if (!state.areaId) throw new Error('Select a body area before selecting a muscle')
      const option = (state.optionsByArea[state.areaId] ?? []).find(item => item.id === muscleId)
      if (!option) throw new Error(`Muscle ${muscleId} is not available in ${state.areaId}`)
      update({ muscleId: option.id }, { type: 'muscle', source })
    },

    clearMuscle({ source = 'ui' } = {}) {
      update({ muscleId: null }, { type: 'muscle', source })
    },

    setSide(side, { source = 'ui' } = {}) {
      const normalized = side || null
      if (normalized && !VALID_SIDES.has(normalized)) throw new Error(`Unknown side: ${side}`)
      update({ side: normalized }, { type: 'side', source })
    },

    setCatalog(optionsByArea) {
      update({ catalogStatus: 'ready', optionsByArea }, { type: 'catalog-ready', source: 'model' })
    },

    setCatalogError() {
      update({ catalogStatus: 'error', optionsByArea: {} }, { type: 'catalog-error', source: 'model' })
    },

    reset() {
      update({ areaId: null, muscleId: null, side: null }, { type: 'reset', source: 'form' })
    },
  }
}

export const bodyMapStore = createBodyMapStore()
