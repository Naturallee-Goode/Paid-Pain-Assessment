import test from 'node:test'
import assert from 'node:assert/strict'
import { easeInOutQuad, getAnimationProgress } from '../src/animation-timing.mjs'

test('animation progress uses elapsed time rather than rendered frame count', () => {
  assert.equal(getAnimationProgress(1000, 1000, 500), 0)
  assert.equal(getAnimationProgress(1000, 1250, 500), 0.5)
  assert.equal(getAnimationProgress(1000, 2000, 500), 1)
  assert.equal(getAnimationProgress(1000, 900, 500), 0)
  assert.equal(getAnimationProgress(1000, 1000, 0), 1)
})

test('easing preserves animation endpoints', () => {
  assert.equal(easeInOutQuad(0), 0)
  assert.equal(easeInOutQuad(0.5), 0.5)
  assert.equal(easeInOutQuad(1), 1)
})
