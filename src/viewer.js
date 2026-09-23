import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildMuscleCatalog, getSourceNodeName } from "./muscle-catalog.js";

import { AREA_FOCUS_REGIONS, isWithinArea, getAreaCameraDistance } from "./body-area-focus.mjs";

import { mapMusclesToAreas } from "./muscle-area-mapping.mjs";
import { buildMuscleOptions, resolveMuscleRecords } from "./muscle-options.mjs";
import { bodyMapStore } from "./body-map-store.mjs";
import { easeInOutQuad, getAnimationProgress } from "./animation-timing.mjs";

const scene = new THREE.Scene()

const viewerContainer = document.getElementById("viewer")

const getContainerWidth = () => Math.max(1, viewerContainer.clientWidth || viewerContainer.offsetWidth || 300)
const getContainerHeight = () => Math.max(1, viewerContainer.clientHeight || viewerContainer.offsetHeight || 500)

const camera = new THREE.PerspectiveCamera(75, getContainerWidth() / getContainerHeight(), 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
renderer.setSize(getContainerWidth(), getContainerHeight())
renderer.domElement.style.display = "block"
renderer.domElement.style.width = "100%"
renderer.domElement.style.height = getContainerHeight() + "px"
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
renderer.outputColorSpace = THREE.SRGBColorSpace
viewerContainer.appendChild(renderer.domElement)

const resizeRenderer = () => {
  const w = getContainerWidth()
  const h = getContainerHeight()
  renderer.setSize(w, h, false)
  renderer.domElement.style.height = `${h}px`
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(resizeRenderer).observe(viewerContainer)
}
window.addEventListener("resize", resizeRenderer)

const ambient = new THREE.AmbientLight(0xffe0cc, 0.35)
scene.add(ambient)
const keyLight = new THREE.DirectionalLight(0xfff0e0, 2.2)
keyLight.position.set(2, 4, 3)
keyLight.castShadow = true
keyLight.shadow.mapSize.width = 2048
keyLight.shadow.mapSize.height = 2048
keyLight.shadow.camera.near = 0.1
keyLight.shadow.camera.far = 20
keyLight.shadow.camera.left = -2
keyLight.shadow.camera.right = 2
keyLight.shadow.camera.top = 2
keyLight.shadow.camera.bottom = -2
keyLight.shadow.bias = -0.001
scene.add(keyLight)
const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.4)
fillLight.position.set(-3, 2, 1)
scene.add(fillLight)
const rimLight = new THREE.DirectionalLight(0xff9966, 0.6)
rimLight.position.set(0, 3, -4)
scene.add(rimLight)
const bounceLight = new THREE.DirectionalLight(0xff6633, 0.15)
bounceLight.position.set(0, -3, 2)
scene.add(bounceLight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0.85, 0)
controls.enableDamping = true
controls.dampingFactor = 0.05

controls.addEventListener('start', () => {
  if (animating) {
    animating = false
  }
})

renderer.domElement.addEventListener('wheel', () => {
  if (animating) {
    animating = false
  }
}, { passive: true })

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const bodyMeshes = []
const muscleCatalog = []
let bodyAreaMuscles = {}
let muscleRecordsById = new Map()
const muscleIdByMesh = new Map()
const muscleRecordByMesh = new Map()
// Follow-up muscle-list UI can consume this without changing catalog ownership.
export function getMusclesForArea(areaId) {
  return Object.hasOwn(bodyAreaMuscles, areaId) ? [...bodyAreaMuscles[areaId]] : []
}

const MATERIAL_COLORS = {
  "Fascia":                  { color: 0xcc3322, roughness: 0.65, metalness: 0.05 },
  "Superficial":             { color: 0xbb2d1e, roughness: 0.70, metalness: 0.03 },
  "Internal rotator":        { color: 0xc0392b, roughness: 0.60, metalness: 0.05 },
  "External rotation":       { color: 0xbe3024, roughness: 0.60, metalness: 0.05 },
  "Flexion":                 { color: 0xb83225, roughness: 0.62, metalness: 0.05 },
  "Extension":               { color: 0xc13428, roughness: 0.62, metalness: 0.05 },
  "Biarticular":             { color: 0xba2f22, roughness: 0.63, metalness: 0.05 },
  "Abductor":                { color: 0xc43d30, roughness: 0.60, metalness: 0.05 },
  "Adductor":                { color: 0xbf3528, roughness: 0.60, metalness: 0.05 },
  "Trapezius":               { color: 0xc83e30, roughness: 0.58, metalness: 0.06 },
  "Diaphragm":               { color: 0xd04535, roughness: 0.55, metalness: 0.06 },
  "Masticator":              { color: 0xb52e22, roughness: 0.65, metalness: 0.04 },
  "Depressor":               { color: 0xb83020, roughness: 0.65, metalness: 0.04 },
  "Levator":                 { color: 0xba3122, roughness: 0.65, metalness: 0.04 },
  "Phonation":               { color: 0xc03828, roughness: 0.62, metalness: 0.04 },
  "Ingestion":               { color: 0xbc3425, roughness: 0.64, metalness: 0.04 },
  "Orbicularis/Constrictor": { color: 0xb52e20, roughness: 0.66, metalness: 0.04 },
  "Extension hand/foot":     { color: 0xbf3626, roughness: 0.62, metalness: 0.05 },
  "Flexion hand/foot":       { color: 0xba3124, roughness: 0.62, metalness: 0.05 },
  "Flexion fingers":         { color: 0xb83022, roughness: 0.63, metalness: 0.05 },
  "Extensor extremities":    { color: 0xc03827, roughness: 0.61, metalness: 0.05 },
  "Ligament":                { color: 0xe8c4a0, roughness: 0.75, metalness: 0.02 },
  "Tendon":                  { color: 0xf0d4b0, roughness: 0.72, metalness: 0.02 },
  "Cartilage":               { color: 0xe8e0d0, roughness: 0.55, metalness: 0.08 },
  "Articular capsule":       { color: 0xd4b896, roughness: 0.70, metalness: 0.02 },
  "Bursa":                   { color: 0xc8d8e8, roughness: 0.40, metalness: 0.10, opacity: 0.75 },
}
const DEFAULT_MUSCLE = { color: 0xc03828, roughness: 0.62, metalness: 0.05 }

const loader = new GLTFLoader()
loader.load(
  "assets/human-body2.glb",
  (gltf) => {
    scene.add(gltf.scene)
    const catalogEntries = []
    gltf.scene.traverse((child) => {
      if(!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
      const mat = child.material
      const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name
      const sourceName = getSourceNodeName(gltf, child)
      catalogEntries.push({ mesh: child, sourceName, materialName: matName })
      if(matName === "Text"){
        const t = (m) => { m.transparent=true; m.opacity=0; m.depthWrite=false; m.needsUpdate=true }
        Array.isArray(mat) ? mat.forEach(t) : t(mat)
        child.castShadow = false
        child.receiveShadow = false
        return
      }
      const preset = MATERIAL_COLORS[matName] || DEFAULT_MUSCLE
      child.material = new THREE.MeshPhysicalMaterial({
        color: preset.color, roughness: preset.roughness, metalness: preset.metalness,
        transparent: preset.opacity !== undefined, opacity: preset.opacity ?? 1.0,
        depthWrite: preset.opacity === undefined,
        sheen: 0.15, sheenColor: new THREE.Color(0xff8866), sheenRoughness: 0.8, envMapIntensity: 0.3,
      })
      bodyMeshes.push(child)
      child.geometry.computeBoundingBox()
    })

    muscleCatalog.push(...buildMuscleCatalog(catalogEntries))
    bodyAreaMuscles = mapMusclesToAreas(muscleCatalog).byArea
    const muscleOptions = buildMuscleOptions(bodyAreaMuscles)
    muscleRecordsById = muscleOptions.recordsById
    for (const [muscleId, records] of muscleRecordsById) {
      for (const record of records) {
        muscleIdByMesh.set(record.mesh, muscleId)
        muscleRecordByMesh.set(record.mesh, record)
      }
    }
    bodyMapStore.setCatalog(muscleOptions.optionsByArea)
    // Hide loading overlay
    const overlay = document.getElementById("loadingOverlay")
    overlay.style.transition = "opacity 0.4s ease"
    overlay.style.opacity = "0"
    setTimeout(() => overlay.style.display = "none", 400)
  },
  (xhr) => {
    if(xhr.lengthComputable) {
      const pct = Math.round((xhr.loaded / xhr.total) * 100)
      document.getElementById("loadingBarFill").style.width = pct + "%"
      document.getElementById("loadingPercent").textContent = pct + "%"
    }
  },
  (error) => {
    console.error("GLB load error:", error)
    bodyMapStore.setCatalogError()
    document.getElementById("loadingLabel").textContent = "Failed to load model"
  }
)

const highlightMat = new THREE.MeshPhysicalMaterial({
  color: 0xff9900, emissive: 0xff6600, emissiveIntensity: 0.4,
  roughness: 0.4, metalness: 0.1, depthTest: false, depthWrite: false, transparent: true, opacity: 0.95
})

const areaHighlights = new Map()
function restoreAreaHighlights() {
  for (const [mesh, original] of areaHighlights) {
    mesh.material = original.material
    mesh.renderOrder = original.renderOrder
  }
  areaHighlights.clear()
}

function focusBodyArea(id) {
  restoreMuscleHighlights()
  restoreAreaHighlights()
  const area = AREA_FOCUS_REGIONS.find(item => item.id === id)
  if (!area) {
    startCameraAnim(defaultCamPos, defaultTarget, ZOOM_OUT_DURATION)
    document.getElementById('partTitle').textContent = 'Choose a body area'
    document.getElementById('partDescription').textContent = ''
    return
  }
  const bounds = new THREE.Box3()
  for (const mesh of bodyMeshes) {
    const box = new THREE.Box3().setFromObject(mesh)
    if (!isWithinArea(box.getCenter(new THREE.Vector3()), area)) continue
    // A long back muscle can have its center near the pelvis while extending
    // far above the hip. Keep it out of the hip highlight.
    if (id === 'hip' && box.max.y > 1.17) continue
    areaHighlights.set(mesh, { material: mesh.material, renderOrder: mesh.renderOrder })
    mesh.material = highlightMat
    mesh.renderOrder = 999
    bounds.union(box)
  }
  document.getElementById('partTitle').textContent = area.label
  document.getElementById('partDescription').textContent = bodyMeshes.length
    ? (bounds.isEmpty() ? 'No model region is available for this area yet.' : 'Rotate or zoom to explore this area.')
    : bodyMapStore.getState().catalogStatus === 'error'
      ? 'Your area is selected, but the 3D model is unavailable.'
      : 'Your area is selected. The model will focus when it loads.'
  if (bounds.isEmpty()) {
    startCameraAnim(defaultCamPos, defaultTarget, ZOOM_OUT_DURATION)
    return
  }
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  const distance = getAreaCameraDistance(size, camera.fov, camera.aspect)
  const direction = area.back ? -1 : 1
  lastHorizDir.set(0, 0, direction)
  startCameraAnim(new THREE.Vector3(center.x, center.y, center.z + direction * Math.max(distance, .15)), center, ZOOM_IN_DURATION)
}

const muscleHighlights = new Map()

const ZOOM_IN_DURATION  = 650
const ZOOM_OUT_DURATION = 450
const CLICK_MAX_MOVE = 8
const CLICK_MAX_DURATION = 250

let animating = false
let animFrom = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animTo   = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animStartedAt = null
let animDuration = ZOOM_IN_DURATION
let pointerDownPoint = null
let pointerDownTime = 0
let pointerMoved = false

const DEFAULT_DIST = 2
const defaultCamPos = new THREE.Vector3(0, 0.85, DEFAULT_DIST)
const defaultTarget = new THREE.Vector3(0, 0.85, 0)
let lastHorizDir = new THREE.Vector3(0, 0, 1)

function startCameraAnim(toPos, toTarget, duration) {
  animFrom.pos.copy(camera.position)
  animFrom.target.copy(controls.target)
  animTo.pos.copy(toPos)
  animTo.target.copy(toTarget)
  animStartedAt = null
  animDuration = duration
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    camera.position.copy(toPos)
    controls.target.copy(toTarget)
    animating = false
    return
  }
  animating = true
}

function restoreMuscleHighlights() {
  for (const [mesh, original] of muscleHighlights) {
    mesh.material = original.material
    mesh.renderOrder = original.renderOrder
  }
  muscleHighlights.clear()
}

function getSelectedOption(state) {
  return (state.optionsByArea[state.areaId] ?? []).find(option => option.id === state.muscleId) ?? null
}

function frameMuscleBounds(bounds) {
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  const direction = new THREE.Vector3(center.x, 0, center.z)
  if (direction.length() < 0.001) direction.copy(lastHorizDir)
  else direction.normalize()
  lastHorizDir.copy(direction)
  const distance = getAreaCameraDistance(size, camera.fov, camera.aspect)
  const position = center.clone().addScaledVector(direction, Math.max(distance, .15))
  startCameraAnim(position, center, ZOOM_IN_DURATION)
}

function showMuscleSelection(state) {
  restoreAreaHighlights()
  restoreMuscleHighlights()
  const option = getSelectedOption(state)
  if (!option) return
  const records = resolveMuscleRecords(muscleRecordsById.get(option.id) ?? [], state.side)
  const bounds = new THREE.Box3()
  for (const record of records) {
    const mesh = record.mesh
    muscleHighlights.set(mesh, { material: mesh.material, renderOrder: mesh.renderOrder })
    mesh.material = highlightMat
    mesh.renderOrder = 999
    bounds.union(new THREE.Box3().setFromObject(mesh))
  }
  document.getElementById('partTitle').textContent = 'Spot selected'
  if (bounds.isEmpty()) {
    document.getElementById('partDescription').textContent = `That exact spot is not available on the ${state.side} side of the model.`
    return
  }
  const explicitSides = new Set(records.map(record => record.side).filter(Boolean))
  document.getElementById('partDescription').textContent = state.side === 'both'
    ? (explicitSides.has('left') && explicitSides.has('right') ? 'Both sides selected.' : 'All available matching spots are selected.')
    : `${state.side[0].toUpperCase()}${state.side.slice(1)} spot selected.`
  frameMuscleBounds(bounds)
}

function clearSelection() {
  if (bodyMapStore.getState().muscleId) bodyMapStore.clearMuscle({ source: 'viewer' })
  else if (!bodyMapStore.getState().areaId) focusBodyArea(null)
}

function recordMatchesSelectedSide(record, muscleId, side) {
  if (side === 'both') return true
  if (record.side === side) return true
  const records = muscleRecordsById.get(muscleId) ?? []
  return !record.side && records.every(item => !item.side)
}

function getSelectableMeshAt(clientX, clientY) {
  const state = bodyMapStore.getState()
  if (!state.areaId || !state.side || state.catalogStatus !== 'ready') return null
  const availableIds = new Set((state.optionsByArea[state.areaId] ?? []).map(option => option.id))
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  return raycaster.intersectObjects(bodyMeshes, false)
    .map(hit => hit.object)
    .find(object => {
      const muscleId = muscleIdByMesh.get(object)
      const record = muscleRecordByMesh.get(object)
      return muscleId && record && availableIds.has(muscleId) && recordMatchesSelectedSide(record, muscleId, state.side)
    }) ?? null
}

function selectBodyMesh(mesh) {
  const state = bodyMapStore.getState()
  if (!state.areaId || !state.side) {
    document.getElementById('partDescription').textContent = 'Choose a body area and side before selecting an exact spot.'
    return
  }
  const muscleId = muscleIdByMesh.get(mesh)
  const belongsToArea = (state.optionsByArea[state.areaId] ?? []).some(option => option.id === muscleId)
  const record = muscleRecordByMesh.get(mesh)
  if (!muscleId || !record || !belongsToArea || !recordMatchesSelectedSide(record, muscleId, state.side)) return
  if (state.muscleId === muscleId) bodyMapStore.clearMuscle({ source: 'viewer' })
  else bodyMapStore.selectMuscle(muscleId, { source: 'viewer' })
}

function handleViewerClick(e) {
  const mesh = getSelectableMeshAt(e.clientX, e.clientY)
  if (!mesh) {
    clearSelection()
    return
  }
  selectBodyMesh(mesh)
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownTime = performance.now()
  pointerDownPoint = { x: e.clientX, y: e.clientY }
  pointerMoved = false
})

renderer.domElement.addEventListener('pointermove', (e) => {
  if (!pointerDownPoint) return
  const distance = Math.hypot(e.clientX - pointerDownPoint.x, e.clientY - pointerDownPoint.y)

  if (distance > CLICK_MAX_MOVE) {
    pointerMoved = true
  }

  if (pointerMoved && animating) {
    animating = false
  }
})

renderer.domElement.addEventListener('pointerup', (e) => {
  if (!pointerDownPoint) return
  const duration = performance.now() - pointerDownTime
  const distance = Math.hypot(e.clientX - pointerDownPoint.x, e.clientY - pointerDownPoint.y)
  pointerDownPoint = null

  if (!pointerMoved && duration <= CLICK_MAX_DURATION && distance <= CLICK_MAX_MOVE) {
    handleViewerClick(e)
  }
})

renderer.domElement.addEventListener('pointercancel', () => {
  pointerDownPoint = null
})

renderer.domElement.addEventListener('pointermove', event => {
  if (!pointerDownPoint) {
    renderer.domElement.style.cursor = getSelectableMeshAt(event.clientX, event.clientY) ? 'pointer' : 'grab'
  }
})
renderer.domElement.addEventListener('pointerleave', () => {
  renderer.domElement.style.cursor = 'grab'
})

camera.position.copy(defaultCamPos)

bodyMapStore.subscribe((state, previous, action) => {
  const areaChanged = state.areaId !== previous.areaId
  const muscleChanged = state.muscleId !== previous.muscleId
  const sideChanged = state.side !== previous.side
  const modelStateChanged = action.type === 'catalog-ready' || action.type === 'catalog-error'

  if (areaChanged || modelStateChanged) {
    if (state.muscleId) showMuscleSelection(state)
    else focusBodyArea(state.areaId)
    return
  }
  if (muscleChanged || (sideChanged && state.muscleId)) {
    if (state.muscleId) showMuscleSelection(state)
    else focusBodyArea(state.areaId)
  }
})

let renderLoopPaused = false
export function setViewerRenderLoopPaused(paused) {
  const wasPaused = renderLoopPaused
  renderLoopPaused = Boolean(paused)
  if (wasPaused && !renderLoopPaused) requestAnimationFrame(animate)
}

function animate(timestamp){
  if (renderLoopPaused) return
  requestAnimationFrame(animate)
  if(animating){
    if (animStartedAt === null) animStartedAt = timestamp
    const t = getAnimationProgress(animStartedAt, timestamp, animDuration)
    const ease = easeInOutQuad(t)
    camera.position.lerpVectors(animFrom.pos, animTo.pos, ease)
    controls.target.lerpVectors(animFrom.target, animTo.target, ease)
    if(t >= 1) animating = false
  }
  controls.update()
  renderer.render(scene,camera)
}

requestAnimationFrame(animate)
