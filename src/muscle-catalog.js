// Exclude non-muscle model materials.
const EXCLUDED_MATERIALS = new Set([
  'articular capsule',
  'bursa',
  'cartilage',
  'fascia',
  'ligament',
  'tendon',
  'text',
])

const SIDE_NAMES = { l: 'left', r: 'right' }

// GLTFLoader preserves the original node name in userData. Prefer it over
// parser associations, whose mapping object can be shared by cloned meshes.
export function getSourceNodeName(gltf, object) {
  for (let current = object; current; current = current.parent) {
    const userDataName = current.userData?.name
    if (userDataName) return userDataName

    const nodeIndex = gltf.parser.associations.get(current)?.nodes
    const sourceName = gltf.parser.json.nodes[nodeIndex]?.name
    if (sourceName) return sourceName
  }
  return object?.name
}

// Remove model suffixes while retaining side data.
export function parseAnatomyName(sourceName) {
  const name = String(sourceName ?? '').trim()
  const suffix = name.match(/\.([a-z])$/i)?.[1]?.toLowerCase()
  const displayName = name
    .replace(/\.[a-z]$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b[a-z]/gi, character => character.toUpperCase())

  return { displayName, side: SIDE_NAMES[suffix] ?? null }
}

export function createMuscleRecord({ mesh, sourceName, materialName }) {
  const normalizedMaterial = String(materialName ?? '').trim().toLowerCase()

  if (!mesh?.isMesh || !normalizedMaterial || EXCLUDED_MATERIALS.has(normalizedMaterial)) return null
  // Exclude grouped model nodes.
  if (/\.g$/i.test(sourceName ?? '')) return null

  const { displayName, side } = parseAnatomyName(sourceName)
  if (!displayName) return null

  return { displayName, side, sourceName, mesh }
}

export function buildMuscleCatalog(entries) {
  // Keep catalog order stable.
  return entries
    .map(createMuscleRecord)
    .filter(Boolean)
    .sort((a, b) =>
      a.displayName.localeCompare(b.displayName) ||
      (a.side ?? '').localeCompare(b.side ?? '') ||
      a.sourceName.localeCompare(b.sourceName)
    )
}
