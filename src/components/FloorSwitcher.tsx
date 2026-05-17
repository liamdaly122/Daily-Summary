import { useState } from 'react'
import { useStore } from '../store/useStore'
import { FloatingPanel } from './FloatingPanel'

const HouseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2v-9z" />
  </svg>
)

export const FloorSwitcher = () => {
  const floors = useStore((s) => s.floors)
  const activeFloorId = useStore((s) => s.activeFloorId)
  const setActiveFloor = useStore((s) => s.setActiveFloor)
  const addFloor = useStore((s) => s.addFloor)
  const renameFloor = useStore((s) => s.renameFloor)
  const removeFloor = useStore((s) => s.removeFloor)
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <FloatingPanel
      id="floors"
      title="Floors"
      icon={<span className="text-ink-muted"><HouseIcon /></span>}
      defaultX={16}
      defaultY={16}
      width={236}
    >
      <div className="flex flex-col gap-0.5 p-2">
        {floors.map((f) => {
          const isActive = f.id === activeFloorId
          const isEditing = editing === f.id
          return (
            <div
              key={f.id}
              className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-ink hover:bg-canvas-hairline'
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
                  className="w-full rounded bg-white px-1 py-0.5 text-sm text-ink outline-none ring-2 ring-accent"
                />
              ) : (
                <button
                  onClick={() => setActiveFloor(f.id)}
                  onDoubleClick={() => setEditing(f.id)}
                  className="flex-1 truncate text-left"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="ml-2 text-[10px] opacity-70">{f.rooms.length}</span>
                </button>
              )}
              {floors.length > 1 && (
                <button
                  title="Delete floor"
                  onClick={() => removeFloor(f.id)}
                  className={`rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100 ${
                    isActive ? 'text-white' : 'text-ink-subtle hover:text-red-500'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              )}
            </div>
          )
        })}
        <button
          onClick={addFloor}
          className="mt-1 rounded-md border border-dashed border-canvas-line px-2 py-1.5 text-xs text-ink-muted hover:border-accent hover:text-accent"
        >
          + Add floor
        </button>
      </div>
    </FloatingPanel>
  )
}
