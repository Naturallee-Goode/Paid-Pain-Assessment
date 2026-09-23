export function getAnimationProgress(startTime, currentTime, duration) {
  if (duration <= 0) return 1
  return Math.min(Math.max((currentTime - startTime) / duration, 0), 1)
}

export function easeInOutQuad(progress) {
  return progress < 0.5
    ? 2 * progress * progress
    : -1 + (4 - 2 * progress) * progress
}
