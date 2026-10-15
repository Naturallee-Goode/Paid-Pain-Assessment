// Reuses the proposed area content from #74 / PR #79, with the Shoulder preview.
// Sources and sponsor-review provenance are linked in docs/testing/issue-82.md.
const issue = (name, description, ...sources) => Object.freeze({ name, description, sources: Object.freeze(sources) })
const strain = issue('Muscle strain', 'An overstretched or torn muscle can cause soreness, weakness or swelling.', 'https://www.nhs.uk/conditions/sprains-and-strains/')
const sprain = issue('Joint sprain', 'Stretched or torn ligaments around a joint can cause pain, swelling or bruising.', 'https://www.nhs.uk/conditions/sprains-and-strains/')
const tendon = issue('Tendon irritation (tendonitis)', 'Inflammation of tissue connecting muscle to bone can make movement painful or stiff.', 'https://www.nhs.uk/conditions/tendonitis/')
const bursa = issue('Bursitis', 'Inflamed cushioning sacs near a joint can cause tenderness, swelling and pain with movement.', 'https://www.nhs.uk/conditions/bursitis/')
const arthritis = issue('Arthritis', 'Joint conditions such as arthritis can cause pain and stiffness.', 'https://www.nhs.uk/symptoms/joint-pain/')

const pendingReview = Object.freeze({ status: 'pending', reviewer: null, date: null, evidence: null, requestedChanges: null })
const content = (items, review = pendingReview) => Object.freeze({ items: Object.freeze(items), review: Object.freeze(review) })
const unavailable = content([], { status: 'unavailable', reviewer: null, date: null, evidence: null, requestedChanges: null })

export const COMMON_ISSUE_CONTENT = Object.freeze({
  neck: content([
    issue('Position-related neck pain', 'Sleeping awkwardly or spending a long time at a desk can contribute to neck pain.', 'https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/'),
    issue('Pinched nerve', 'Pressure on a nerve is one possible cause of neck pain.', 'https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/'),
  ]),
  shoulder: content([
    issue('Rotator cuff tear or tendon irritation', 'Damage or irritation affecting the tendons that help lift and rotate your arm.', 'https://www.orthoinfo.org/diseases--conditions/rotator-cuff-tears/', 'https://www.nhs.uk/conditions/tendonitis/'),
    issue('Shoulder impingement', 'A shoulder tendon rubbing against nearby tissue or bone, which can hurt when you raise your arm.', 'https://www.nhs.uk/conditions/shoulder-impingement-syndrome/'),
    issue('Frozen shoulder', 'Pain and stiffness that make the shoulder difficult to move.', 'https://www.nhs.uk/conditions/frozen-shoulder/'),
    issue('Shoulder bursitis', bursa.description, ...bursa.sources),
  ]),
  'upper-back': content([strain]),
  'lower-back': content([strain]),
  arm: content([strain, tendon]),
  elbow: content([tendon, bursa]),
  'wrist-hand': content([sprain, issue('Carpal tunnel syndrome', 'Pressure on a nerve in the wrist can cause tingling, numbness and pain in the hand.', 'https://www.nhs.uk/conditions/carpal-tunnel-syndrome/')]),
  hip: content([bursa, arthritis]),
  leg: content([strain, tendon]),
  knee: content([sprain, bursa]),
  ankle: content([sprain, issue('Achilles tendon irritation', 'Irritation of the tendon behind the ankle can cause pain around the ankle and heel.', 'https://www.nhs.uk/symptoms/foot-pain/ankle-pain/')]),
  foot: content([strain, issue('Plantar fasciitis', 'This condition causes pain on the bottom of the foot, around the heel and arch.', 'https://www.nhs.uk/conditions/plantar-fasciitis/')]),
})

export function getCommonIssueContent(areaId) {
  return Object.hasOwn(COMMON_ISSUE_CONTENT, areaId) ? COMMON_ISSUE_CONTENT[areaId] : unavailable
}
