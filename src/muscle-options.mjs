const SIDE_SUFFIX = /\.[a-z]$/i

export function getMuscleBaseName(sourceName) {
  return String(sourceName ?? '').replace(SIDE_SUFFIX, '')
}

export function createMuscleId(sourceName) {
  const slug = getMuscleBaseName(sourceName)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (!slug) throw new Error(`Cannot create a muscle ID from "${sourceName}"`)
  return `muscle.${slug}`
}

export function resolveMuscleRecords(records, side) {
  if (!side || side === 'both') return [...records]
  const matching = records.filter(record => record.side === side)
  if (matching.length) return matching
  return records.every(record => !record.side) ? [...records] : []
}

export function buildMuscleOptions(byArea) {
  const optionsByArea = {}
  const recordsById = new Map()
  const baseNameById = new Map()

  for (const [areaId, records] of Object.entries(byArea)) {
    const options = new Map()
    for (const record of records) {
      const baseName = getMuscleBaseName(record.sourceName)
      const id = createMuscleId(baseName)
      const existingBaseName = baseNameById.get(id)
      if (existingBaseName && existingBaseName !== baseName) {
        throw new Error(`Muscle ID collision for ${existingBaseName} and ${baseName}`)
      }
      baseNameById.set(id, baseName)

      const option = options.get(id) ?? {
        id,
        name: record.displayName,
        availableSides: [],
      }
      if (record.side && !option.availableSides.includes(record.side)) option.availableSides.push(record.side)
      options.set(id, option)

      const knownRecords = recordsById.get(id) ?? []
      if (!knownRecords.some(item => item.mesh === record.mesh)) knownRecords.push(record)
      recordsById.set(id, knownRecords)
    }
    optionsByArea[areaId] = [...options.values()]
      .map(option => ({ ...option, availableSides: [...option.availableSides].sort() }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  }

  return { optionsByArea, recordsById }
}
