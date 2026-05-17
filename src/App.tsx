import { useEffect } from 'react'
import { BlueprintCanvas } from './components/Canvas/BlueprintCanvas'
import { RoomCanvas } from './components/Canvas/RoomCanvas'
import { Toolbar } from './components/Toolbar'
import { FloorSwitcher } from './components/FloorSwitcher'
import { Sidebar } from './components/Sidebar'
import { ZoomBadge } from './components/ZoomBadge'
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
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (s.selection?.kind === 'pin') {
          e.preventDefault()
          s.removePin(s.selection.roomId, s.selection.pinId)
        }
      } else if (e.key === 'Escape') {
        if (s.selection) s.setSelection(null)
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
      <Toolbar />
      <ZoomBadge />
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          HouseDIY{focusedRoom ? ` · ${focusedRoom.name}` : ''}
        </div>
      </div>
    </div>
  )
}
