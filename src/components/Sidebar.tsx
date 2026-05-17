import { useStore, useSelectedPin, useSelectedRoom, useActiveFloor } from '../store/useStore'
import { PinEditor } from './PinEditor'
import { RoomEditor } from './RoomEditor'
import { FloorSummary } from './FloorSummary'
import { FloatingPanel } from './FloatingPanel'
import { useViewport } from '../lib/useViewport'

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)
const RoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
  </svg>
)
const FloorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18l9-12 9 12H3z" />
  </svg>
)

export const Sidebar = () => {
  const selection = useStore((s) => s.selection)
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const room = useSelectedRoom()
  const pin = useSelectedPin()
  const floor = useActiveFloor()
  const { width: vw } = useViewport()

  if (vw === 0) return null
  // Sit below the top-right Search button so they don't collide
  const defaultX = Math.max(16, vw - 336)
  const defaultY = 64

  // Decide what to render in the sidebar.
  let title = floor?.name ?? 'Floor'
  let icon: React.ReactNode = <span className="text-ink-muted"><FloorIcon /></span>
  let content: React.ReactNode
  // Hide entirely when nothing is selected AND not in room view AND user hasn't opened it
  let visible = true

  if (selection?.kind === 'pin' && pin && room) {
    title = pin.title || 'Untitled pin'
    icon = <span className="text-ink-muted"><PinIcon /></span>
    content = <PinEditor roomId={room.id} pin={pin} />
  } else if (selection?.kind === 'room' && room) {
    title = room.name
    icon = <span className="text-ink-muted"><RoomIcon /></span>
    content = <RoomEditor room={room} />
  } else if (focusedRoomId) {
    const focused = floor?.rooms.find((r) => r.id === focusedRoomId)
    if (focused) {
      title = focused.name
      icon = <span className="text-ink-muted"><RoomIcon /></span>
      content = <RoomEditor room={focused} />
    } else {
      content = <FloorSummary />
    }
  } else {
    // No selection on plan view — keep panel for the floor summary but allow collapse
    content = <FloorSummary />
    visible = true
  }

  return (
    <FloatingPanel
      id="sidebar"
      title={title}
      icon={icon}
      defaultX={defaultX}
      defaultY={defaultY}
      width={320}
      visible={visible}
    >
      {content}
    </FloatingPanel>
  )
}
