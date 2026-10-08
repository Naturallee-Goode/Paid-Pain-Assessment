export const MUSCLE_DIAGNOSES_BY_AREA = Object.freeze({
  neck: ['Cervical strain or sprain', 'Cervical radiculopathy', 'Cervical spondylosis', 'Herniated cervical disc'],
  shoulder: ['Rotator cuff tear or tendinitis', 'Shoulder impingement syndrome', 'Frozen shoulder (adhesive capsulitis)', 'Shoulder bursitis'],
  'upper-back': ['Upper back muscle strain', 'Myofascial pain syndrome', 'Thoracic disc injury', 'Posture-related muscular pain'],
  'lower-back': ['Lower back strain', 'Herniated disc', 'Sciatica', 'Spinal stenosis'],
  arm: ['Biceps or triceps strain', 'Tendon injury', 'Nerve compression', 'Referred shoulder pain'],
  elbow: ['Tennis elbow (lateral epicondylitis)', "Golfer's elbow (medial epicondylitis)", 'Olecranon bursitis', 'Ulnar nerve entrapment'],
  'wrist-hand': ['Carpal tunnel syndrome', 'Wrist sprain', "De Quervain's tenosynovitis", 'Tendon injury'],
  hip: ['Hip bursitis', 'Hip arthritis', 'Hip impingement', 'Labral tear'],
  leg: ['Hamstring strain', 'Quadriceps strain', 'IT band syndrome', 'Shin splints'],
  knee: ['ACL tear', 'Meniscus tear', 'Patellar tendinitis', 'Patellofemoral pain syndrome'],
  ankle: ['Ankle sprain', 'Achilles tendinitis', 'Ankle instability', 'Stress fracture'],
  foot: ['Plantar fasciitis', 'Tarsal tunnel syndrome', 'Bunions', "Morton's neuroma"],
})

export function getPossibleMuscleDiagnoses(areaId) {
  return MUSCLE_DIAGNOSES_BY_AREA[areaId] ?? []
}
