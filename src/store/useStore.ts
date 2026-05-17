import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  AppState,
  Floor,
  Pin,
  Room,
  Selection,
  Tool,
  Category,
  Priority,
} from './types'
import { loadState, saveState } from './persistence'
import { snapRect } from '../lib/geometry'

const seedFloors = (): Floor[] => [
  {
    id: nanoid(),
    name: 'Ground Floor',
    rooms: [
      {
        id: nanoid(),
        name: 'Kitchen',
        type: 'kitchen',
        x: 200,
        y: 200,
        width: 280,
        height: 220,
        pins: [
          {
            id: nanoid(),
            x: 60,
            y: 80,
            title: 'Replace tap',
            description: 'Pick a brushed brass mixer tap.',
            category: 'plumbing',
            priority: 'med',
            done: false,
            estimatedCost: 120,
            actualCost: 0,
            photos: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: nanoid(),
            x: 200,
            y: 140,
            title: 'Repaint cabinets',
            description: 'Sage green eggshell, two coats.',
            category: 'paint',
            priority: 'high',
            done: false,
            estimatedCost: 80,
            actualCost: 0,
            photos: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      {
        id: nanoid(),
        name: 'Living Room',
        type: 'living',
        x: 500,
        y: 200,
        width: 360,
        height: 280,
        pins: [
          {
            id: nanoid(),
            x: 100,
            y: 100,
            title: 'Hang picture rail',
            description: '',
            category: 'decor',
            priority: 'low',
            done: false,
            estimatedCost: 40,
            actualCost: 0,
            photos: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      {
        id: nanoid(),
        name: 'Hall',
        type: 'corridor',
        x: 200,
        y: 440,
        width: 660,
        height: 80,
        pins: [],
      },
      {
        id: nanoid(),
        name: 'Stairs',
        type: 'staircase',
        x: 880,
        y: 200,
        width: 120,
        height: 280,
        pins: [],
      },
    ],
  },
  {
    id: nanoid(),
    name: 'First Floor',
    rooms: [
      {
        id: nanoid(),
        name: 'Bedroom',
        type: 'bedroom',
        x: 200,
        y: 200,
        width: 320,
        height: 260,
        pins: [],
      },
      {
        id: nanoid(),
        name: 'Bathroom',
        type: 'bathroom',
        x: 540,
        y: 200,
        width: 220,
        height: 200,
        pins: [],
      },
    ],
  },
]

const buildInitial = (): AppState => {
  const persisted = loadState()
  const floors = persisted?.floors?.length ? persisted.floors : seedFloors()
  const activeFloorId = persisted?.activeFloorId ?? floors[0].id
  return {
    floors,
    activeFloorId,
    tool: 'select',
    selection: null,
    view: { scale: 1, x: 0, y: 0, focusedRoomId: null },
    lastDeleted: null,
    commandPaletteOpen: false,
    ui: {
      showGrid: persisted?.ui?.showGrid ?? true,
      showHeatmap: persisted?.ui?.showHeatmap ?? true,
      filter: persisted?.ui?.filter ?? {
        category: 'all',
        priority: 'all',
        onlyOpen: false,
      },
      panels: persisted?.ui?.panels ?? {},
    },
  }
}

interface Actions {
  setTool: (t: Tool) => void
  setActiveFloor: (id: string) => void
  addFloor: () => void
  renameFloor: (id: string, name: string) => void
  removeFloor: (id: string) => void
  addRoom: (room: Omit<Room, 'id' | 'pins'>) => string
  updateRoom: (id: string, patch: Partial<Room>) => void
  removeRoom: (id: string) => void
  addPin: (roomId: string, pin: Omit<Pin, 'id' | 'createdAt' | 'updatedAt'>) => string
  updatePin: (roomId: string, pinId: string, patch: Partial<Pin>) => void
  removePin: (roomId: string, pinId: string) => void
  togglePinDone: (roomId: string, pinId: string) => void
  setSelection: (s: Selection | null) => void
  setView: (v: Partial<AppState['view']>) => void
  focusRoom: (roomId: string | null) => void
  toggleGrid: () => void
  toggleHeatmap: () => void
  setFilterCategory: (c: Category | 'all') => void
  setFilterPriority: (p: Priority | 'all') => void
  setFilterOnlyOpen: (v: boolean) => void
  movePanel: (id: string, x: number, y: number) => void
  togglePanelCollapsed: (id: string, defaultPos?: { x: number; y: number }) => void
  addSubtask: (roomId: string, pinId: string, title: string) => void
  updateSubtask: (roomId: string, pinId: string, subtaskId: string, patch: Partial<{ title: string; done: boolean }>) => void
  removeSubtask: (roomId: string, pinId: string, subtaskId: string) => void
  addLink: (roomId: string, pinId: string, url: string, title?: string) => void
  removeLink: (roomId: string, pinId: string, linkId: string) => void
  undoDelete: () => void
  clearLastDeleted: () => void
  setCommandPaletteOpen: (open: boolean) => void
  resetAll: () => void
}

export const useStore = create<AppState & Actions>((set, get) => ({
  ...buildInitial(),

  setTool: (tool) => set({ tool }),

  setActiveFloor: (activeFloorId) =>
    set({ activeFloorId, selection: null, view: { scale: 1, x: 0, y: 0, focusedRoomId: null } }),

  addFloor: () =>
    set((s) => {
      const id = nanoid()
      const next: Floor = { id, name: `Floor ${s.floors.length + 1}`, rooms: [] }
      return { floors: [...s.floors, next], activeFloorId: id }
    }),

  renameFloor: (id, name) =>
    set((s) => ({
      floors: s.floors.map((f) => (f.id === id ? { ...f, name } : f)),
    })),

  removeFloor: (id) =>
    set((s) => {
      if (s.floors.length === 1) return s
      const floors = s.floors.filter((f) => f.id !== id)
      const activeFloorId = s.activeFloorId === id ? floors[0].id : s.activeFloorId
      return { floors, activeFloorId, selection: null }
    }),

  addRoom: (room) => {
    const id = nanoid()
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? { ...f, rooms: [...f.rooms, { ...snapRect(room), name: room.name, type: room.type, color: room.color, id, pins: [] }] }
          : f,
      ),
      selection: { kind: 'room', roomId: id },
    }))
    return id
  },

  updateRoom: (id, patch) =>
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? { ...f, rooms: f.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) }
          : f,
      ),
    })),

  removeRoom: (id) =>
    set((s) => {
      const floor = s.floors.find((f) => f.id === s.activeFloorId)
      const room = floor?.rooms.find((r) => r.id === id)
      return {
        floors: s.floors.map((f) =>
          f.id === s.activeFloorId ? { ...f, rooms: f.rooms.filter((r) => r.id !== id) } : f,
        ),
        selection: null,
        view: s.view.focusedRoomId === id ? { ...s.view, focusedRoomId: null } : s.view,
        lastDeleted: room
          ? { kind: 'room', at: Date.now(), floorId: s.activeFloorId, room }
          : s.lastDeleted,
      }
    }),

  addPin: (roomId, pin) => {
    const id = nanoid()
    const now = Date.now()
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? { ...r, pins: [...r.pins, { ...pin, id, createdAt: now, updatedAt: now }] }
                  : r,
              ),
            }
          : f,
      ),
      selection: { kind: 'pin', roomId, pinId: id },
    }))
    return id
  },

  updatePin: (roomId, pinId, patch) =>
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      pins: r.pins.map((p) =>
                        p.id === pinId ? { ...p, ...patch, updatedAt: Date.now() } : p,
                      ),
                    }
                  : r,
              ),
            }
          : f,
      ),
    })),

  removePin: (roomId, pinId) =>
    set((s) => {
      const floor = s.floors.find((f) => f.id === s.activeFloorId)
      const room = floor?.rooms.find((r) => r.id === roomId)
      const pin = room?.pins.find((p) => p.id === pinId)
      return {
        floors: s.floors.map((f) =>
          f.id === s.activeFloorId
            ? {
                ...f,
                rooms: f.rooms.map((r) =>
                  r.id === roomId ? { ...r, pins: r.pins.filter((p) => p.id !== pinId) } : r,
                ),
              }
            : f,
        ),
        selection: null,
        lastDeleted: pin
          ? { kind: 'pin', at: Date.now(), floorId: s.activeFloorId, roomId, pin }
          : s.lastDeleted,
      }
    }),

  togglePinDone: (roomId, pinId) => {
    const room = get().floors.find((f) => f.id === get().activeFloorId)?.rooms.find((r) => r.id === roomId)
    const pin = room?.pins.find((p) => p.id === pinId)
    if (!pin) return
    get().updatePin(roomId, pinId, { done: !pin.done })
  },

  setSelection: (selection) => set({ selection }),

  setView: (v) => set((s) => ({ view: { ...s.view, ...v } })),

  focusRoom: (roomId) =>
    set((s) => ({
      view: { ...s.view, focusedRoomId: roomId },
      selection: roomId ? null : s.selection,
      tool: 'select',
    })),

  toggleGrid: () => set((s) => ({ ui: { ...s.ui, showGrid: !s.ui.showGrid } })),
  toggleHeatmap: () => set((s) => ({ ui: { ...s.ui, showHeatmap: !s.ui.showHeatmap } })),

  setFilterCategory: (c) =>
    set((s) => ({ ui: { ...s.ui, filter: { ...s.ui.filter, category: c } } })),
  setFilterPriority: (p) =>
    set((s) => ({ ui: { ...s.ui, filter: { ...s.ui.filter, priority: p } } })),
  setFilterOnlyOpen: (v) =>
    set((s) => ({ ui: { ...s.ui, filter: { ...s.ui.filter, onlyOpen: v } } })),

  movePanel: (id, x, y) =>
    set((s) => ({
      ui: {
        ...s.ui,
        panels: {
          ...s.ui.panels,
          [id]: { ...(s.ui.panels[id] ?? { collapsed: false }), x, y },
        },
      },
    })),

  togglePanelCollapsed: (id, defaultPos) =>
    set((s) => {
      const existing = s.ui.panels[id] ?? {
        x: defaultPos?.x ?? 16,
        y: defaultPos?.y ?? 16,
        collapsed: false,
      }
      return {
        ui: {
          ...s.ui,
          panels: { ...s.ui.panels, [id]: { ...existing, collapsed: !existing.collapsed } },
        },
      }
    }),

  addSubtask: (roomId, pinId, title) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const id = nanoid()
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      pins: r.pins.map((p) =>
                        p.id === pinId
                          ? {
                              ...p,
                              subtasks: [...(p.subtasks ?? []), { id, title: trimmed, done: false }],
                              updatedAt: Date.now(),
                            }
                          : p,
                      ),
                    }
                  : r,
              ),
            }
          : f,
      ),
    }))
  },

  updateSubtask: (roomId, pinId, subtaskId, patch) =>
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      pins: r.pins.map((p) =>
                        p.id === pinId
                          ? {
                              ...p,
                              subtasks: (p.subtasks ?? []).map((st) =>
                                st.id === subtaskId ? { ...st, ...patch } : st,
                              ),
                              updatedAt: Date.now(),
                            }
                          : p,
                      ),
                    }
                  : r,
              ),
            }
          : f,
      ),
    })),

  removeSubtask: (roomId, pinId, subtaskId) =>
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      pins: r.pins.map((p) =>
                        p.id === pinId
                          ? {
                              ...p,
                              subtasks: (p.subtasks ?? []).filter((st) => st.id !== subtaskId),
                              updatedAt: Date.now(),
                            }
                          : p,
                      ),
                    }
                  : r,
              ),
            }
          : f,
      ),
    })),

  addLink: (roomId, pinId, url, title) => {
    const trimmed = url.trim()
    if (!trimmed) return
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const id = nanoid()
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      pins: r.pins.map((p) =>
                        p.id === pinId
                          ? {
                              ...p,
                              links: [...(p.links ?? []), { id, url: normalized, title }],
                              updatedAt: Date.now(),
                            }
                          : p,
                      ),
                    }
                  : r,
              ),
            }
          : f,
      ),
    }))
  },

  removeLink: (roomId, pinId, linkId) =>
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              rooms: f.rooms.map((r) =>
                r.id === roomId
                  ? {
                      ...r,
                      pins: r.pins.map((p) =>
                        p.id === pinId
                          ? {
                              ...p,
                              links: (p.links ?? []).filter((l) => l.id !== linkId),
                              updatedAt: Date.now(),
                            }
                          : p,
                      ),
                    }
                  : r,
              ),
            }
          : f,
      ),
    })),

  undoDelete: () =>
    set((s) => {
      if (!s.lastDeleted) return s
      const d = s.lastDeleted
      const targetFloor = s.floors.find((f) => f.id === d.floorId)
      if (!targetFloor) return { lastDeleted: null }
      if (d.kind === 'pin' && d.pin && d.roomId) {
        return {
          floors: s.floors.map((f) =>
            f.id === d.floorId
              ? {
                  ...f,
                  rooms: f.rooms.map((r) =>
                    r.id === d.roomId ? { ...r, pins: [...r.pins, d.pin!] } : r,
                  ),
                }
              : f,
          ),
          lastDeleted: null,
          selection: { kind: 'pin', roomId: d.roomId, pinId: d.pin.id },
          activeFloorId: d.floorId,
        }
      }
      if (d.kind === 'room' && d.room) {
        return {
          floors: s.floors.map((f) =>
            f.id === d.floorId ? { ...f, rooms: [...f.rooms, d.room!] } : f,
          ),
          lastDeleted: null,
          selection: { kind: 'room', roomId: d.room.id },
          activeFloorId: d.floorId,
        }
      }
      return { lastDeleted: null }
    }),

  clearLastDeleted: () => set({ lastDeleted: null }),

  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  resetAll: () => {
    const freshFloors = seedFloors()
    set({
      floors: freshFloors,
      activeFloorId: freshFloors[0].id,
      tool: 'select',
      selection: null,
      view: { scale: 1, x: 0, y: 0, focusedRoomId: null },
      lastDeleted: null,
      commandPaletteOpen: false,
    })
  },
}))

// Debounced persistence — saving on every keystroke is too aggressive
// when pins hold base64 photos.
let persistTimer: ReturnType<typeof setTimeout> | null = null
useStore.subscribe((state) => {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => saveState(state), 400)
})

/** Helpers */
export const useActiveFloor = () =>
  useStore((s) => s.floors.find((f) => f.id === s.activeFloorId) ?? s.floors[0])

export const useSelectedRoom = () =>
  useStore((s) => {
    if (!s.selection) return null
    const floor = s.floors.find((f) => f.id === s.activeFloorId)
    if (!floor) return null
    return floor.rooms.find((r) => r.id === s.selection!.roomId) ?? null
  })

export const useSelectedPin = () =>
  useStore((s) => {
    if (s.selection?.kind !== 'pin') return null
    const floor = s.floors.find((f) => f.id === s.activeFloorId)
    if (!floor) return null
    const room = floor.rooms.find((r) => r.id === s.selection!.roomId)
    return room?.pins.find((p) => p.id === (s.selection as { pinId: string }).pinId) ?? null
  })
