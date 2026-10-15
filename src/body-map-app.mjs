import { initializePossibleIssues } from './possible-issues.mjs?v=2'
import { initializeBodyAreaControls } from './body-area-controls.mjs'
import { bodyMapStore } from './body-map-store.mjs'
import { initializeSideControls } from './side-controls.mjs'

initializeBodyAreaControls(document, bodyMapStore)
initializePossibleIssues(document, bodyMapStore)
initializeSideControls(document, bodyMapStore)

await import('./viewer.js?v=4')
