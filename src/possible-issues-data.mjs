// Area-level educational content is independent of the model and muscle catalog.
// Sources and editorial limitations are documented in docs/testing/possible-issues.md.
const issue = (name, description, source) => Object.freeze({ name, description, source })
const strain = issue('Muscle strain', 'An overstretched or torn muscle can cause soreness, weakness or swelling.', 'https://www.nhs.uk/conditions/sprains-and-strains/')
const sprain = issue('Joint sprain', 'Stretched or torn ligaments around a joint can cause pain, swelling or bruising.', 'https://www.nhs.uk/conditions/sprains-and-strains/')
const tendon = issue('Tendon irritation (tendonitis)', 'Inflammation of tissue connecting muscle to bone can make movement painful or stiff.', 'https://www.nhs.uk/conditions/tendonitis/')
const bursa = issue('Bursitis', 'Inflamed cushioning sacs near a joint can cause tenderness, swelling and pain with movement.', 'https://www.nhs.uk/conditions/bursitis/')
const arthritis = issue('Arthritis', 'Joint conditions such as arthritis can cause pain and stiffness.', 'https://www.nhs.uk/symptoms/joint-pain/')

export const POSSIBLE_ISSUES_BY_AREA = Object.freeze(Object.fromEntries(Object.entries({
  neck: [
    issue('Position-related neck pain', 'Sleeping awkwardly or spending a long time at a desk can contribute to neck pain.', 'https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/'),
    issue('Pinched nerve', 'Pressure on a nerve is one possible cause of neck pain.', 'https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/'),
  ],
  shoulder: [tendon, bursa],
  'upper-back': [strain],
  'lower-back': [strain],
  arm: [strain, tendon],
  elbow: [tendon, bursa],
  'wrist-hand': [sprain, issue('Carpal tunnel syndrome', 'Pressure on a nerve in the wrist can cause tingling, numbness and pain in the hand.', 'https://www.nhs.uk/conditions/carpal-tunnel-syndrome/')],
  hip: [bursa, arthritis],
  leg: [strain, tendon],
  knee: [sprain, bursa],
  ankle: [sprain, issue('Achilles tendon irritation', 'Irritation of the tendon behind the ankle can cause pain around the ankle and heel.', 'https://www.nhs.uk/symptoms/foot-pain/ankle-pain/')],
  foot: [strain, issue('Plantar fasciitis', 'This condition causes pain on the bottom of the foot, around the heel and arch.', 'https://www.nhs.uk/conditions/plantar-fasciitis/')],
}).map(([area, issues]) => [area, Object.freeze(issues)])))

export function getPossibleIssues(areaId) {
  return POSSIBLE_ISSUES_BY_AREA[areaId] ?? []
}
