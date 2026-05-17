import type { Category, Priority, RoomType } from '../store/types'

/** 1 grid cell = 20 plan-units. With scaleToMeters below, that's ~0.5m per cell. */
export const GRID_SIZE = 20
export const SCALE_M_PER_UNIT = 0.025 // 40 units = 1m
export const DEFAULT_FLOOR_WIDTH = 1600
export const DEFAULT_FLOOR_HEIGHT = 1200

export const CATEGORY_LABEL: Record<Category, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  paint: 'Paint',
  structural: 'Structural',
  decor: 'Decor',
  furniture: 'Furniture',
  general: 'General',
}

export const CATEGORY_COLOR: Record<Category, string> = {
  plumbing: '#3b82f6',
  electrical: '#f59e0b',
  paint: '#ec4899',
  structural: '#6b7280',
  decor: '#8b5cf6',
  furniture: '#10b981',
  general: '#64748b',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const PRIORITY_COLOR: Record<Priority, string> = {
  low: '#94a3b8',
  med: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
}

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  room: 'Room',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  living: 'Living Room',
  conservatory: 'Conservatory',
  corridor: 'Corridor',
  staircase: 'Staircase',
  garage: 'Garage',
  outdoor: 'Outdoor',
}

export const ROOM_TYPE_COLOR: Record<RoomType, string> = {
  room: '#ffffff',
  kitchen: '#fff7ed',
  bathroom: '#eff6ff',
  bedroom: '#faf5ff',
  living: '#f0fdf4',
  conservatory: '#ecfeff',
  corridor: '#f8fafc',
  staircase: '#fef3c7',
  garage: '#f1f5f9',
  outdoor: '#dcfce7',
}

export const ROOM_TYPE_ICON: Record<RoomType, string> = {
  room: '▭',
  kitchen: '🍳',
  bathroom: '🛁',
  bedroom: '🛏',
  living: '🛋',
  conservatory: '🪴',
  corridor: '↔',
  staircase: '⇡',
  garage: '🚗',
  outdoor: '🌳',
}
