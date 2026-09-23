import { SUPPORTED_BODY_AREAS } from './body-areas.js'

// Spatial regions for the current GLB; these are not anatomical muscle mappings.
const regions = [
  { id: 'neck', y: [1.31, 1.46], x: [0, .14] },
  { id: 'shoulder', y: [1.25, 1.55], x: [.14, 1] },
  { id: 'upper-back', y: [1.25, 1.42], x: [0, .14], back: true },
  { id: 'lower-back', y: [1.04, 1.25], x: [0, .14], back: true },
  { id: 'arm', y: [.85, 1.35], x: [.14, 1] },
  { id: 'elbow', y: [1.02, 1.14], x: [.14, 1] },
  { id: 'wrist-hand', y: [.62, 1.02], x: [.26, 1] },
  { id: 'hip', y: [.75, 1.04], x: [0, .20] },
  { id: 'leg', y: [.08, .90], x: [0, .26] },
  { id: 'knee', y: [.40, .50], x: [0, 1] },
  { id: 'ankle', y: [.08, .18], x: [0, 1] },
  { id: 'foot', y: [-.10, .08], x: [0, 1] },
]

export const AREA_FOCUS_REGIONS = regions.map(region => ({
  ...region, label: SUPPORTED_BODY_AREAS.find(area => area.id === region.id).label,
}))

export function isWithinArea(point, area) {
  return point.y >= area.y[0] && point.y < area.y[1]
    && Math.abs(point.x) >= area.x[0] && Math.abs(point.x) < area.x[1]
    && (!area.back || point.z <= 0)
}

// Fit both width and height, leaving room for the nearest face of the box.
export function getAreaCameraDistance(size, verticalFov, aspect) {
  const tangent = Math.tan(verticalFov * Math.PI / 360)
  return Math.max(.15, 1.3 * Math.max(size.y / (2 * tangent), size.x / (2 * tangent * Math.max(aspect, .01))) + size.z / 2)
}
