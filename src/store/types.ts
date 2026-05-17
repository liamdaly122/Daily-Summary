export type Category =
  | 'plumbing'
  | 'electrical'
  | 'paint'
  | 'structural'
  | 'decor'
  | 'furniture'
  | 'general'

export type Priority = 'low' | 'med' | 'high' | 'urgent'

export type RoomType =
  | 'room'
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'living'
  | 'conservatory'
  | 'corridor'
  | 'staircase'
  | 'garage'
  | 'outdoor'

export interface Pin {
  id: string
  /** position relative to the room's top-left, in plan units (px) */
  x: number
  y: number
  title: string
  description: string
  category: Category
  priority: Priority
  done: boolean
  estimatedCost: number
  actualCost: number
  photos: string[] // base64 data URLs
  createdAt: number
  updatedAt: number
}

export interface Room {
  id: string
  name: string
  type: RoomType
  /** axis-aligned rectangle in plan units (px) */
  x: number
  y: number
  width: number
  height: number
  color?: string
  pins: Pin[]
}

export interface Floor {
  id: string
  name: string
  rooms: Room[]
}

export interface AppState {
  floors: Floor[]
  activeFloorId: string
  view: ViewState
  tool: Tool
  selection: Selection | null
  ui: UIState
}

export type Tool =
  | 'select'
  | 'pan'
  | 'draw-room'
  | 'draw-kitchen'
  | 'draw-bathroom'
  | 'draw-bedroom'
  | 'draw-living'
  | 'draw-conservatory'
  | 'draw-corridor'
  | 'draw-staircase'
  | 'draw-garage'

export interface ViewState {
  /** Canvas scale */
  scale: number
  /** Canvas translation (stage x/y) */
  x: number
  y: number
  /** Focused room when zoomed in */
  focusedRoomId: string | null
}

export type Selection =
  | { kind: 'room'; roomId: string }
  | { kind: 'pin'; roomId: string; pinId: string }

export interface PanelState {
  x: number
  y: number
  collapsed: boolean
}

export interface UIState {
  sidebarOpen: boolean
  showGrid: boolean
  showHeatmap: boolean
  filter: {
    category: Category | 'all'
    priority: Priority | 'all'
    onlyOpen: boolean
  }
  panels: Record<string, PanelState>
}
