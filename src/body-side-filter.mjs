export function matchesSelectedSide(meshSide, selectedSide) {
  if (!selectedSide || selectedSide === 'both') return true
  return meshSide === selectedSide
}

export function filterMuscleRecordsBySide(records, selectedSide) {
  return records.filter(record => matchesSelectedSide(record.side, selectedSide))
}
