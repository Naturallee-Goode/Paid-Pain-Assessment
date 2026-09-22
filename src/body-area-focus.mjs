// Spatial regions for the current GLB; these are not anatomical muscle mappings.
export const AREA_FOCUS_REGIONS = [
  { id: 'neck', label: 'Neck', y: [1.42, 1.55], x: [0, .14] },
  { id: 'shoulder', label: 'Shoulder', y: [1.25, 1.55], x: [.14, 1] },
  { id: 'upper-back', label: 'Upper Back', y: [1.25, 1.42], x: [0, .14], back: true },
  { id: 'lower-back', label: 'Lower Back', y: [.84, 1.25], x: [0, .14], back: true },
  { id: 'elbow', label: 'Elbow', y: [1.02, 1.14], x: [.14, 1] },
  { id: 'wrist-hand', label: 'Wrist/Hand', y: [.62, 1.02], x: [.26, 1] },
  { id: 'hip', label: 'Hip', y: [.62, .90], x: [0, .26] },
  { id: 'knee', label: 'Knee', y: [.40, .50], x: [0, 1] },
  { id: 'ankle', label: 'Ankle', y: [.08, .18], x: [0, 1] },
  { id: 'foot', label: 'Foot', y: [-.10, .08], x: [0, 1] },
]

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
