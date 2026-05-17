import { GRID_SIZE, SCALE_M_PER_UNIT } from './constants'
import type { Room } from '../store/types'

export const snap = (v: number, size = GRID_SIZE) => Math.round(v / size) * size

export const snapRect = (r: { x: number; y: number; width: number; height: number }) => ({
  x: snap(r.x),
  y: snap(r.y),
  width: Math.max(GRID_SIZE * 2, snap(r.width)),
  height: Math.max(GRID_SIZE * 2, snap(r.height)),
})

export const unitsToMeters = (units: number) => units * SCALE_M_PER_UNIT
export const areaMeters = (room: Room) =>
  unitsToMeters(room.width) * unitsToMeters(room.height)

export const formatMeters = (m: number) =>
  m < 10 ? `${m.toFixed(2)} m` : `${m.toFixed(1)} m`

export const formatArea = (m2: number) =>
  `${m2.toFixed(1)} m²`

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n)

export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max)

export const roomCenter = (r: Room) => ({
  x: r.x + r.width / 2,
  y: r.y + r.height / 2,
})

/** % done across all pins in a room (0..1). 0 if no pins. */
export const roomProgress = (r: Room) => {
  if (r.pins.length === 0) return 0
  const done = r.pins.filter((p) => p.done).length
  return done / r.pins.length
}
