import { useActiveFloor, useStore } from '../store/useStore'

/**
 * Lightweight floating control. Not a draggable panel — small, always-anchored
 * to the bottom-right. Shows zoom controls in plan view, room context in room view.
 */
export const ZoomBadge = () => {
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const focusRoom = useStore((s) => s.focusRoom)
  const scale = useStore((s) => s.view.scale)
  const setView = useStore((s) => s.setView)
  const floor = useActiveFloor()
  const room = floor?.rooms.find((r) => r.id === focusedRoomId)

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-blueprint-line bg-white/95 px-2 py-1.5 text-xs shadow-pop backdrop-blur">
      {room ? (
        <>
          <button
            onClick={() => focusRoom(null)}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-gray-600 hover:border-blueprint-accent hover:text-blueprint-accent"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to floor
          </button>
          <span className="px-1 font-semibold text-gray-700">{room.name}</span>
        </>
      ) : (
        <>
          <button
            onClick={() => setView({ scale: Math.max(0.2, scale / 1.2) })}
            className="rounded-md border border-gray-200 px-2 py-1 text-gray-600 hover:border-gray-300"
          >
            −
          </button>
          <span className="w-12 text-center font-mono text-[11px] text-gray-600">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setView({ scale: Math.min(4, scale * 1.2) })}
            className="rounded-md border border-gray-200 px-2 py-1 text-gray-600 hover:border-gray-300"
          >
            +
          </button>
          <button
            onClick={() => setView({ scale: 1, x: 40, y: 40 })}
            className="rounded-md border border-gray-200 px-2 py-1 text-gray-600 hover:border-gray-300"
          >
            Reset
          </button>
        </>
      )}
    </div>
  )
}
