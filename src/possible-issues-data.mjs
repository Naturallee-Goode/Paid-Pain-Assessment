// Area-level educational content is independent of the model and muscle catalog.
// Sources and sponsor decisions: docs/content/common-issues-review.md.
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
  shoulder: [
    issue('Rotator cuff tear or tendon irritation', 'Damage or irritation affecting the tendons that help lift and rotate your arm.', 'https://orthoinfo.aaos.org/en/diseases--conditions/rotator-cuff-tears/'),
    issue('Shoulder impingement', 'A shoulder tendon rubbing against nearby tissue or bone, which can hurt when you raise your arm.', 'https://www.nhs.uk/conditions/shoulder-impingement-syndrome/'),
    issue('Frozen shoulder', 'Pain and stiffness that make the shoulder difficult to move.', 'https://www.nhs.uk/conditions/frozen-shoulder/'),
    issue('Shoulder bursitis', bursa.description, bursa.source),
  ],
  'upper-back': [strain],
  'lower-back': [strain],
  arm: [strain, tendon],
  elbow: [issue('Tennis Elbow', 'Pain around the outside of the elbow that can worsen when lifting, gripping or moving your wrist.', 'https://www.nhs.uk/conditions/tennis-elbow/'), bursa],
  'wrist-hand': [sprain, issue('Carpal tunnel syndrome', 'Pressure on a nerve in the wrist can cause tingling, numbness and pain in the hand.', 'https://www.nhs.uk/conditions/carpal-tunnel-syndrome/')],
  hip: [bursa, arthritis],
  leg: [strain, tendon],
  knee: [sprain, bursa],
  ankle: [sprain, issue('Achilles tendon irritation', 'Irritation of the tendon behind the ankle can cause pain around the ankle and heel.', 'https://www.nhs.uk/symptoms/foot-pain/ankle-pain/')],
  foot: [strain, issue('Plantar fasciitis', 'This condition causes pain on the bottom of the foot, around the heel and arch.', 'https://www.nhs.uk/conditions/plantar-fasciitis/')],
}).map(([area, issues]) => [area, Object.freeze(issues)])))

export function getPossibleIssues(areaId) {
  return Object.hasOwn(POSSIBLE_ISSUES_BY_AREA, areaId) ? POSSIBLE_ISSUES_BY_AREA[areaId] : []
}

// Editorial records only; no record asserts approval of the complete current copy.
const pendingReview = Object.freeze({ status: 'pending', reviewer: null, date: null, evidence: null, requestedChanges: null })
export const ISSUE_CONTENT_REVIEW_BY_AREA = Object.freeze(Object.fromEntries(
  Object.keys(POSSIBLE_ISSUES_BY_AREA).map(areaId => [areaId, areaId === 'elbow'
    ? Object.freeze({
      status: 'revision-applied', reviewer: 'Mia Miller', date: null, recordedAt: '2026-10-18',
      evidence: 'https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/111',
      requestedChanges: 'Delete tendon irritation under Elbow and add Tennis Elbow.',
      limitation: 'The new description was not separately reviewed. The correspondence date was not supplied.',
    })
    : pendingReview]),
))
