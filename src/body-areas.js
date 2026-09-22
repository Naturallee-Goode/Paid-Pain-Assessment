const createBodyArea = (id, label) => Object.freeze({ id, label })

// IDs are stored with selections, so keep them stable when labels change.
export const SUPPORTED_BODY_AREAS = Object.freeze([
  createBodyArea('neck', 'Neck'),
  createBodyArea('shoulder', 'Shoulder'),
  createBodyArea('upper-back', 'Upper Back'),
  createBodyArea('lower-back', 'Lower Back'),
  createBodyArea('elbow', 'Elbow'),
  createBodyArea('wrist-hand', 'Wrist/Hand'),
  createBodyArea('hip', 'Hip'),
  createBodyArea('knee', 'Knee'),
  createBodyArea('ankle', 'Ankle'),
  createBodyArea('foot', 'Foot'),
])

export function getSupportedBodyArea(id) {
  return SUPPORTED_BODY_AREAS.find(area => area.id === id) ?? null
}

export function getSupportedBodyAreaForRegion(region, verticalPosition) {
  // Split the legacy back region and merge wrist/hand into supported IDs.
  if (region === 'back') {
    return getSupportedBodyArea(verticalPosition > 1.25 ? 'upper-back' : 'lower-back')
  }
  if (region === 'wrist' || region === 'hand') {
    return getSupportedBodyArea('wrist-hand')
  }
  return getSupportedBodyArea(region)
}
