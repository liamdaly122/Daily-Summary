import { useEffect } from 'react'
import { BlueprintCanvas } from './components/Canvas/BlueprintCanvas'
import { RoomCanvas } from './components/Canvas/RoomCanvas'
import { Toolbar } from './components/Toolbar'
import { FloorSwitcher } from './components/FloorSwitcher'
import { Sidebar } from './components/Sidebar'
import { ZoomBadge } from './components/ZoomBadge'
import { AllTodos } from './components/AllTodos'
import { CommandPalette } from './components/CommandPalette'
import { UndoToast } from './components/UndoToast'
import { useStore, useActiveFloor } from './store/useStore'

export default function App() {
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const floor = useActiveFloor()
  const focusedRoom = floor?.rooms.find((r) => r.id === focusedRoomId) ?? null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      // Don't intercept typing in inputs
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      const s = useStore.getState()
      const meta = e.metaKey || e.ctrlKey
      if (meta && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        s.setCommandPaletteOpen(!s.commandPaletteOpen)
        return
      }
      if (meta && (e.key === 'z' || e.key === 'Z') && s.lastDeleted) {
        e.preventDefault()
        s.undoDelete()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (s.selection?.kind === 'pin') {
          e.preventDefault()
          s.removePin(s.selection.roomId, s.selection.pinId)
        }
      } else if (e.key === 'Escape') {
        if (s.commandPaletteOpen) s.setCommandPaletteOpen(false)
        else if (s.selection) s.setSelection(null)
        else if (s.view.focusedRoomId) s.focusRoom(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-blueprint-bg">
      {focusedRoom ? <RoomCanvas room={focusedRoom} /> : <BlueprintCanvas />}
      <FloorSwitcher />
      <Sidebar />
      <AllTodos />
      <Toolbar />
      <ZoomBadge />
      <UndoToast />
      <CommandPalette />
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          HouseDIY{focusedRoom ? ` · ${focusedRoom.name}` : ''}
        </div>
      </div>
      <button
        onClick={() => useStore.getState().setCommandPaletteOpen(true)}
        title="Search (⌘K)"
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-blueprint-line bg-white/95 px-3 py-1.5 text-xs text-gray-500 shadow-card backdrop-blur hover:text-blueprint-accent"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        Search
        <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[9px]">⌘K</kbd>
      </button>
    </div>
  )
}
