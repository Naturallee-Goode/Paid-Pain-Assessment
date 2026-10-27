const createBodyArea = (id, label) => Object.freeze({ id, label })

// IDs are stored with selections, so keep them stable when labels change.
export const SUPPORTED_BODY_AREAS = Object.freeze([
  createBodyArea('neck', 'Neck'),
  createBodyArea('shoulder', 'Shoulder'),
  createBodyArea('chest', 'Chest'),
  createBodyArea('upper-back', 'Upper Back'),
  createBodyArea('lower-back', 'Lower Back'),
  createBodyArea('abdomen', 'Abdomen'),
  createBodyArea('elbow', 'Elbow'),
  createBodyArea('forearm', 'Forearm'),
  createBodyArea('wrist-hand', 'Wrist/Hand'),
  createBodyArea('hip', 'Hip'),
  createBodyArea('thigh', 'Thigh'),
  createBodyArea('knee', 'Knee'),
  createBodyArea('lower-leg', 'Lower Leg'),
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
  if (region === 'upperarm') {
    return getSupportedBodyArea('shoulder')
  }
  if (region === 'calf' || region === 'lowerleg') {
    return getSupportedBodyArea('lower-leg')
  }
  return getSupportedBodyArea(region)
}
