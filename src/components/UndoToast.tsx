import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

const TOAST_MS = 6000

export const UndoToast = () => {
  const lastDeleted = useStore((s) => s.lastDeleted)
  const undoDelete = useStore((s) => s.undoDelete)
  const clearLastDeleted = useStore((s) => s.clearLastDeleted)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!lastDeleted) return
    const tick = setInterval(() => setNow(Date.now()), 100)
    const timer = setTimeout(() => clearLastDeleted(), TOAST_MS)
    return () => {
      clearInterval(tick)
      clearTimeout(timer)
    }
  }, [lastDeleted, clearLastDeleted])

  if (!lastDeleted) return null
  const elapsed = now - lastDeleted.at
  if (elapsed > TOAST_MS) return null
  const remaining = Math.max(0, 1 - elapsed / TOAST_MS)

  const label =
    lastDeleted.kind === 'pin'
      ? `Deleted “${lastDeleted.pin?.title || 'Untitled'}”`
      : `Deleted room “${lastDeleted.room?.name || 'Room'}”`

  return (
    <div className="pointer-events-auto absolute bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 overflow-hidden rounded-lg border border-ink/10 bg-ink px-3 py-2 text-white shadow-pop">
      <span className="text-[13px]">{label}</span>
      <button
        onClick={undoDelete}
        className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold hover:bg-white/20"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 00-15-6.7L3 13" />
        </svg>
        Undo
      </button>
      <button
        title="Dismiss"
        onClick={clearLastDeleted}
        className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
      <div className="absolute bottom-0 left-0 h-0.5 bg-accent transition-all" style={{ width: `${remaining * 100}%` }} />
    </div>
  )
}
