import { useState } from 'react'
import { useStore } from '../store/useStore'

export const FloorSwitcher = () => {
  const floors = useStore((s) => s.floors)
  const activeFloorId = useStore((s) => s.activeFloorId)
  const setActiveFloor = useStore((s) => s.setActiveFloor)
  const addFloor = useStore((s) => s.addFloor)
  const renameFloor = useStore((s) => s.renameFloor)
  const removeFloor = useStore((s) => s.removeFloor)
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-20 flex flex-col gap-2 rounded-2xl border border-blueprint-line bg-white/95 p-2 shadow-pop backdrop-blur">
      <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Floors
      </div>
      {floors.map((f) => {
        const isActive = f.id === activeFloorId
        const isEditing = editing === f.id
        return (
          <div
            key={f.id}
            className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
              isActive
                ? 'bg-blueprint-accent text-white'
                : 'text-blueprint-ink hover:bg-blueprint-line/40'
            }`}
          >
            {isEditing ? (
              <input
                autoFocus
                defaultValue={f.name}
                onBlur={(e) => {
                  renameFloor(f.id, e.target.value || f.name)
                  setEditing(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renameFloor(f.id, (e.target as HTMLInputElement).value || f.name)
                    setEditing(null)
                  }
                  if (e.key === 'Escape') setEditing(null)
                }}
                className="w-32 rounded bg-white px-1 py-0.5 text-sm text-blueprint-ink outline-none ring-2 ring-blueprint-accent"
              />
            ) : (
              <button
                onClick={() => setActiveFloor(f.id)}
                onDoubleClick={() => setEditing(f.id)}
                className="min-w-32 text-left"
              >
                {f.name}
                <span className={`ml-2 text-[10px] opacity-70`}>
                  {f.rooms.length} rooms
                </span>
              </button>
            )}
            {floors.length > 1 && (
              <button
                title="Delete floor"
                onClick={() => {
                  if (confirm(`Delete "${f.name}"? This removes all rooms on it.`)) {
                    removeFloor(f.id)
                  }
                }}
                className={`opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100`}
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
      <button
        onClick={addFloor}
        className="rounded-lg border border-dashed border-blueprint-line px-2 py-1.5 text-sm text-gray-500 hover:border-blueprint-accent hover:text-blueprint-accent"
      >
        + Add floor
      </button>
    </div>
  )
}
