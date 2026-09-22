import { SUPPORTED_BODY_AREAS } from './body-areas.js'
import { MUSCLE_AREA_ASSIGNMENTS } from './muscle-area-assignments.mjs'

// Consume only buildMuscleCatalog's filtered records. Original records retain
// sourceName, side, and mesh; no coordinate or UUID guesses are used as IDs.
export function mapMusclesToAreas(catalog, { assignments = MUSCLE_AREA_ASSIGNMENTS, warn = console.warn } = {}) {
  const byArea = Object.fromEntries(SUPPORTED_BODY_AREAS.map(area => [area.id, []]))
  const unmapped = []
  const seen = new Set()
  for (const record of catalog) {
    if (seen.has(record.mesh)) continue
    seen.add(record.mesh)
    const baseName = record.sourceName.replace(/\.[a-z]$/i, '')
    const ids = Object.hasOwn(assignments, baseName) ? assignments[baseName] : []
    if (!ids.length) unmapped.push(record)
    for (const id of new Set(ids)) {
      if (!Object.hasOwn(byArea, id)) throw new Error(`Unknown area "${id}" for ${baseName}`)
      byArea[id].push(record)
    }
  }
  for (const records of Object.values(byArea)) {
    records.sort((a,b) => a.displayName.localeCompare(b.displayName) || (a.side || '').localeCompare(b.side || '') || a.sourceName.localeCompare(b.sourceName))
  }
  if (unmapped.length) warn('Unmapped eligible muscles:', [...new Set(unmapped.map(record => record.sourceName))])
  return { byArea, unmapped }
}
