import { createMuscleId } from './muscle-options.mjs'

export function buildAreaMuscleSearchIndex(optionsByArea, recordsByArea) {
  const index = new Map()
  for (const [areaId, options] of Object.entries(optionsByArea)) {
    const recordsById = new Map()
    for (const record of recordsByArea[areaId] ?? []) {
      const id = createMuscleId(record.sourceName)
      const records = recordsById.get(id) ?? []
      records.push(record)
      recordsById.set(id, records)
    }
    index.set(areaId, options.map(option => ({
      id: option.id,
      label: option.name,
      records: recordsById.get(option.id) ?? [],
    })).filter(entry => entry.records.length))
  }
  return index
}

export function findAreaMuscles(index, areaId, query = '') {
  const normalized = query.trim().toLocaleLowerCase()
  return (index.get(areaId) ?? []).filter(entry =>
    entry.label.toLocaleLowerCase().includes(normalized)
  )
}
