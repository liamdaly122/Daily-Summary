import { useActiveFloor, useStore } from '../store/useStore'

/**
 * Compact bottom-left control bar. Plan view: zoom in/out/reset. Room view:
 * back-to-floor + room name chip.
 */
export const ZoomBadge = () => {
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const focusRoom = useStore((s) => s.focusRoom)
  const scale = useStore((s) => s.view.scale)
  const setView = useStore((s) => s.setView)
  const floor = useActiveFloor()
  const room = floor?.rooms.find((r) => r.id === focusedRoomId)

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-canvas-line bg-white/95 px-1.5 py-1 text-xs shadow-soft backdrop-blur">
      {room ? (
        <>
          <button
            onClick={() => focusRoom(null)}
            className="btn btn-ghost"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          <span className="mx-1 h-4 w-px bg-canvas-line" />
          <span className="px-1 text-[12px] font-semibold text-ink">{room.name}</span>
        </>
      ) : (
        <>
          <button
            title="Zoom out"
            onClick={() => setView({ scale: Math.max(0.2, scale / 1.2) })}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-canvas-hairline hover:text-ink"
          >
            −
          </button>
          <span className="w-10 text-center font-mono text-[11px] text-ink-muted">
            {Math.round(scale * 100)}%
          </span>
          <button
            title="Zoom in"
            onClick={() => setView({ scale: Math.min(4, scale * 1.2) })}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-canvas-hairline hover:text-ink"
          >
            +
          </button>
          <span className="mx-1 h-4 w-px bg-canvas-line" />
          <button
            onClick={() => setView({ scale: 1, x: 40, y: 40 })}
            className="rounded-md px-2 py-1 text-[11px] text-ink-muted hover:bg-canvas-hairline hover:text-ink"
          >
            Reset
          </button>
        </>
      )}
    </div>
  )
}
