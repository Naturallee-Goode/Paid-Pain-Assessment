export const MUSCLE_DIAGNOSES_BY_AREA = Object.freeze({
  neck: ['Cervical strain or sprain', 'Cervical radiculopathy', 'Cervical spondylosis', 'Herniated cervical disc'],
  shoulder: ['Rotator cuff tear or tendinitis', 'Shoulder impingement syndrome', 'Frozen shoulder (adhesive capsulitis)', 'Shoulder bursitis'],
  chest: ['Chest muscle strain', 'Pectoral muscle injury', 'Intercostal muscle strain', 'Referred shoulder pain'],
  'upper-back': ['Upper back muscle strain', 'Myofascial pain syndrome', 'Thoracic disc injury', 'Posture-related muscular pain'],
  'lower-back': ['Lower back strain', 'Herniated disc', 'Sciatica', 'Spinal stenosis'],
  abdomen: ['Abdominal muscle strain', 'Abdominal wall injury', 'Myofascial pain', 'Referred pain'],
  elbow: ['Tennis elbow (lateral epicondylitis)', "Golfer's elbow (medial epicondylitis)", 'Olecranon bursitis', 'Ulnar nerve entrapment'],
  forearm: ['Forearm muscle strain', 'Tendon injury', 'Nerve compression', 'Repetitive strain injury'],
  'wrist-hand': ['Carpal tunnel syndrome', 'Wrist sprain', "De Quervain's tenosynovitis", 'Tendon injury'],
  hip: ['Hip bursitis', 'Hip arthritis', 'Hip impingement', 'Labral tear'],
  thigh: ['Hamstring strain', 'Quadriceps strain', 'Adductor strain', 'IT band syndrome'],
  knee: ['ACL tear', 'Meniscus tear', 'Patellar tendinitis', 'Patellofemoral pain syndrome'],
  'lower-leg': ['Calf strain', 'Shin splints', 'Tendon injury', 'Compartment syndrome'],
  ankle: ['Ankle sprain', 'Achilles tendinitis', 'Ankle instability', 'Stress fracture'],
  foot: ['Plantar fasciitis', 'Tarsal tunnel syndrome', 'Bunions', "Morton's neuroma"],
})

export function getPossibleMuscleDiagnoses(areaId) {
  return MUSCLE_DIAGNOSES_BY_AREA[areaId] ?? []
}
