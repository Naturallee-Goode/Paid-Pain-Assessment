import test from 'node:test'
import assert from 'node:assert/strict'
import { BODY_AREAS } from '../src/body-area-config.mjs'
import { AREA_FOCUS_REGIONS, isWithinArea, getAreaCameraDistance } from '../src/body-area-focus.mjs'

test('every selectable area has one focus region', () => {
  assert.deepEqual(AREA_FOCUS_REGIONS.map(a => a.id), BODY_AREAS.map(a => a.id))
  for (const area of AREA_FOCUS_REGIONS) {
    assert(area.y[1] > area.y[0])
    assert(area.x[1] > area.x[0])
    assert(isWithinArea({x: (area.x[0] + area.x[1]) / 2, y: (area.y[0] + area.y[1]) / 2, z: -.1}, area))
  }
})

test('back regions are posterior and separate at the shared region boundary', () => {
  const upper = AREA_FOCUS_REGIONS.find(a => a.id === 'upper-back')
  const lower = AREA_FOCUS_REGIONS.find(a => a.id === 'lower-back')
  for (const [y, expected] of [[1.3, [true,false]], [1.2, [false,true]], [1.25, [true,false]]]) {
    assert.deepEqual([upper,lower].map(a => isWithinArea({x:0,y,z:-.1}, a)), expected)
    assert.deepEqual([upper,lower].map(a => isWithinArea({x:0,y,z:.1}, a)), [false,false])
  }
})

test('bilateral regions include both sides with identical spatial rules', () => {
  const shoulder=AREA_FOCUS_REGIONS.find(a=>a.id==='shoulder')
  for (const x of [-.2,.2]) assert(isWithinArea({x,y:1.4,z:0},shoulder))
  assert.equal(isWithinArea({x:0,y:1.4,z:0},shoulder),false)
})

test('camera distance fits the nearest face on portrait and landscape viewports', () => {
  const size={x:.9,y:.4,z:.3}
  for (const aspect of [.4,1,2]) {
    const distance=getAreaCameraDistance(size,75,aspect)
    const halfHeight=(distance-size.z/2)*Math.tan(75*Math.PI/360)
    assert(halfHeight > size.y/2)
    assert(halfHeight*aspect > size.x/2)
  }
  assert(getAreaCameraDistance(size,75,.4)>getAreaCameraDistance(size,75,2))
  assert.equal(getAreaCameraDistance({x:0,y:0,z:0},75,1),.15)
})
