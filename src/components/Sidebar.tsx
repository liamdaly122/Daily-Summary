import { useStore, useSelectedPin, useSelectedRoom } from '../store/useStore'
import { PinEditor } from './PinEditor'
import { RoomEditor } from './RoomEditor'
import { FloorSummary } from './FloorSummary'

export const Sidebar = () => {
  const sidebarOpen = useStore((s) => s.ui.sidebarOpen)
  const selection = useStore((s) => s.selection)
  const room = useSelectedRoom()
  const pin = useSelectedPin()

  if (!sidebarOpen) return null

  return (
    <aside className="pointer-events-auto absolute right-4 top-4 z-20 flex h-[calc(100%-2rem)] w-80 flex-col overflow-hidden rounded-2xl border border-blueprint-line bg-white/95 shadow-pop backdrop-blur">
      {selection?.kind === 'pin' && pin && room ? (
        <PinEditor roomId={room.id} pin={pin} />
      ) : selection?.kind === 'room' && room ? (
        <RoomEditor room={room} />
      ) : (
        <FloorSummary />
      )}
    </aside>
  )
}
