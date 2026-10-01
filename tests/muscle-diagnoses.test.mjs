import test from 'node:test'
import assert from 'node:assert/strict'
import { SUPPORTED_BODY_AREAS } from '../src/body-areas.js'
import { getPossibleMuscleDiagnoses } from '../src/muscle-diagnoses.mjs'

test('every supported body area has possible diagnoses for a selected muscle', () => {
  for (const area of SUPPORTED_BODY_AREAS) {
    const diagnoses = getPossibleMuscleDiagnoses(area.id)
    assert.ok(diagnoses.length > 0, `${area.id} should have possible diagnoses`)
    assert.equal(new Set(diagnoses).size, diagnoses.length)
    diagnoses.forEach((diagnosis) => assert.equal(typeof diagnosis, 'string'))
  }
})

test('unknown areas do not return diagnoses', () => {
  assert.deepEqual(getPossibleMuscleDiagnoses('unknown'), [])
})
