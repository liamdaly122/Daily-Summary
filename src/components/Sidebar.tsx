import { useStore, useSelectedPin, useSelectedRoom, useActiveFloor } from '../store/useStore'
import { PinEditor } from './PinEditor'
import { RoomEditor } from './RoomEditor'
import { FloorSummary } from './FloorSummary'
import { FloatingPanel } from './FloatingPanel'

export const Sidebar = () => {
  const selection = useStore((s) => s.selection)
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const room = useSelectedRoom()
  const pin = useSelectedPin()
  const floor = useActiveFloor()

  const defaultX = Math.max(16, window.innerWidth - 360)
  const defaultY = 16

  // What kind of content to show
  let title = floor?.name ?? 'Floor'
  let icon: React.ReactNode = <span>📋</span>
  let content: React.ReactNode

  if (selection?.kind === 'pin' && pin && room) {
    title = 'Todo pin'
    icon = <span>📌</span>
    content = <PinEditor roomId={room.id} pin={pin} />
  } else if (selection?.kind === 'room' && room) {
    title = room.name
    icon = <span>▭</span>
    content = <RoomEditor room={room} />
  } else if (focusedRoomId) {
    // Focused on a room but nothing selected — show that room's editor
    const focused = floor?.rooms.find((r) => r.id === focusedRoomId)
    if (focused) {
      title = focused.name
      icon = <span>▭</span>
      content = <RoomEditor room={focused} />
    } else {
      content = <FloorSummary />
    }
  } else {
    content = <FloorSummary />
  }

  return (
    <FloatingPanel
      id="sidebar"
      title={title}
      icon={icon}
      defaultX={defaultX}
      defaultY={defaultY}
      width={320}
    >
      {content}
    </FloatingPanel>
  )
}
