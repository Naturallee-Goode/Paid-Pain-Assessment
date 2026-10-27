import { getSupportedBodyArea } from './body-areas.js'

export function getBodyMapSubmission(state) {
  const area = getSupportedBodyArea(state.areaId)
  const muscle = area
    ? (state.optionsByArea?.[area.id] ?? []).find(option => option.id === state.muscleId)
    : null
  return {
    selectedBodyArea: area?.label ?? 'Not selected',
    selectedBodyAreaId: area?.id ?? '',
    selectedMuscle: muscle?.name ?? 'Not selected',
    selectedMuscleId: muscle?.id ?? '',
    painSide: state.side ?? 'Not specified',
  }
}

export function buildEmailParams(data) {
  return {
    to_email: 'goode@naturalleegoode.com',
    from_name: data.fullName || 'Unknown',
    from_email: data.email || 'Not provided',
    phone: data.phone || 'Not provided',
    body_area: data.selectedBodyArea || 'Not selected',
    body_area_id: data.selectedBodyAreaId || '',
    muscle: data.selectedMuscle || 'Not selected',
    muscle_id: data.selectedMuscleId || '',
    pain_side: data.painSide || 'Not specified',
    pain_duration: data.painDuration || 'Not specified',
    discomfort_type: data.discomfortType || 'Not specified',
    pain_level: data.painLevel || 'Not specified',
    triggers: data.triggers || 'None specified',
    notes: data.notes || 'No notes provided',
    wellness_goal: data.wellnessGoal || 'Not specified',
    consultation_preference: data.consultationPreference || 'Not specified',
    product_interest: data.productInterest || 'Not specified',
    submitted_at: data.submitted_at
  }
}
