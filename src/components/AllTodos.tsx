import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { FloatingPanel } from './FloatingPanel'
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
} from '../lib/constants'
import type { Pin } from '../store/types'

type SortKey = 'priority' | 'cost' | 'updated' | 'room'

const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, med: 2, low: 3 }

interface Row {
  pin: Pin
  roomId: string
  roomName: string
  floorId: string
  floorName: string
}

export const AllTodos = () => {
  const floors = useStore((s) => s.floors)
  const setSelection = useStore((s) => s.setSelection)
  const setActiveFloor = useStore((s) => s.setActiveFloor)
  const focusRoom = useStore((s) => s.focusRoom)
  const togglePinDone = useStore((s) => s.togglePinDone)
  const removePin = useStore((s) => s.removePin)

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [hideDone, setHideDone] = useState(false)

  const rows: Row[] = useMemo(() => {
    const all: Row[] = []
    for (const floor of floors) {
      for (const room of floor.rooms) {
        for (const pin of room.pins) {
          all.push({
            pin,
            roomId: room.id,
            roomName: room.name,
            floorId: floor.id,
            floorName: floor.name,
          })
        }
      }
    }
    return all
  }, [floors])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = rows
    if (hideDone) list = list.filter((r) => !r.pin.done)
    if (q) {
      list = list.filter(
        (r) =>
          r.pin.title.toLowerCase().includes(q) ||
          r.pin.description.toLowerCase().includes(q) ||
          r.roomName.toLowerCase().includes(q) ||
          r.floorName.toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'priority':
          return PRIORITY_RANK[a.pin.priority] - PRIORITY_RANK[b.pin.priority]
        case 'cost':
          return b.pin.estimatedCost - a.pin.estimatedCost
        case 'updated':
          return b.pin.updatedAt - a.pin.updatedAt
        case 'room':
          return a.roomName.localeCompare(b.roomName)
      }
    })
  }, [rows, search, sortKey, hideDone])

  const openPin = (r: Row) => {
    setActiveFloor(r.floorId)
    focusRoom(r.roomId)
    setSelection({ kind: 'pin', roomId: r.roomId, pinId: r.pin.id })
  }

  const totalOpen = rows.filter((r) => !r.pin.done).length

  return (
    <FloatingPanel
      id="all-todos"
      title={`All todos · ${totalOpen} open`}
      icon={<span>📋</span>}
      defaultX={Math.max(16, Math.round(window.innerWidth - 760))}
      defaultY={16}
      width={400}
    >
      <div className="flex flex-col gap-2 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search todos, rooms…"
          className="w-full rounded-md border border-blueprint-line bg-white px-2 py-1.5 text-sm outline-none focus:border-blueprint-accent"
        />
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-gray-400">Sort</span>
          {(['priority', 'updated', 'cost', 'room'] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`rounded-md px-1.5 py-0.5 ${
                sortKey === k
                  ? 'bg-blueprint-accent text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {k}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-1 text-gray-500">
            <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
            Hide done
          </label>
        </div>

        <div className="flex flex-col">
          {filtered.length === 0 && (
            <div className="rounded-md border border-dashed border-blueprint-line p-4 text-center text-xs text-gray-400">
              {search ? 'No todos match' : 'No todos yet — drop a pin in a room'}
            </div>
          )}
          {filtered.map((r) => (
            <div
              key={r.pin.id}
              onClick={() => openPin(r)}
              className="group flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-blueprint-line hover:bg-white"
            >
              <input
                type="checkbox"
                checked={r.pin.done}
                onClick={(e) => e.stopPropagation()}
                onChange={() => togglePinDone(r.roomId, r.pin.id)}
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLOR[r.pin.category] }}
                title={CATEGORY_LABEL[r.pin.category]}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-xs font-medium ${
                    r.pin.done ? 'text-gray-400 line-through' : 'text-gray-800'
                  }`}
                >
                  {r.pin.title || 'Untitled'}
                </div>
                <div className="truncate text-[10px] text-gray-500">
                  {r.floorName} · {r.roomName}
                </div>
              </div>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PRIORITY_COLOR[r.pin.priority] }}
                title={PRIORITY_LABEL[r.pin.priority]}
              />
              {r.pin.estimatedCost > 0 && (
                <span className="text-[10px] text-gray-400">£{r.pin.estimatedCost}</span>
              )}
              <button
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation()
                  removePin(r.roomId, r.pin.id)
                }}
                className="rounded p-0.5 text-gray-300 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </FloatingPanel>
  )
}
