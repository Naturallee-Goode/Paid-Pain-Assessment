import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEmailParams } from '../src/form-submission.mjs'

test('submission represents an omitted side as Not specified', () => {
  assert.equal(buildEmailParams({}).pain_side, 'Not specified')
  assert.equal(buildEmailParams({ painSide: '' }).pain_side, 'Not specified')
})

test('submission preserves each explicit side value', () => {
  for (const side of ['left', 'right', 'both']) {
    assert.equal(buildEmailParams({ painSide: side }).pain_side, side)
  }
})
