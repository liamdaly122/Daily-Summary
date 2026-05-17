import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

interface Props {
  id: string
  title: string
  icon: React.ReactNode
  defaultX: number
  defaultY: number
  width?: number
  /** Render a smaller pinned variant when collapsed; defaults to icon-only button. */
  children: React.ReactNode
  /** Optional right-side header content (e.g. extra buttons). */
  headerExtra?: React.ReactNode
}

/**
 * A draggable, collapsible panel. Drag the header bar to move it; click the
 * chevron (or the icon when collapsed) to toggle. Position + collapsed state
 * persist via the Zustand store.
 */
export const FloatingPanel = ({
  id,
  title,
  icon,
  defaultX,
  defaultY,
  width = 320,
  children,
  headerExtra,
}: Props) => {
  const panel = useStore((s) => s.ui.panels[id])
  const movePanel = useStore((s) => s.movePanel)
  const toggleCollapsed = useStore((s) => s.togglePanelCollapsed)

  // Effective position (falls back to defaults until user moves/collapses it)
  const x = panel?.x ?? defaultX
  const y = panel?.y ?? defaultY
  const collapsed = panel?.collapsed ?? false

  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  // Clean up listeners if unmounted mid-drag
  useEffect(() => {
    return () => {
      if (dragRef.current) {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max))

  const onMove = (ev: PointerEvent) => {
    if (!dragRef.current) return
    const dx = ev.clientX - dragRef.current.sx
    const dy = ev.clientY - dragRef.current.sy
    const w = collapsed ? 44 : width
    const h = collapsed ? 44 : 200 // approx
    const nx = clamp(dragRef.current.ox + dx, window.innerWidth - w - 8)
    const ny = clamp(dragRef.current.oy + dy, window.innerHeight - h - 8)
    movePanel(id, nx, ny)
  }

  const onUp = () => {
    dragRef.current = null
    setDragging(false)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    // Ignore drags that start on buttons inside the header
    if ((e.target as HTMLElement).closest('button[data-no-drag]')) return
    e.preventDefault()
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: x, oy: y }
    setDragging(true)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  if (collapsed) {
    return (
      <button
        title={`Open ${title}`}
        onPointerDown={onPointerDown}
        onClick={(e) => {
          // Don't expand if the user just dragged
          if (Math.abs((dragRef.current?.ox ?? x) - x) > 2 || Math.abs((dragRef.current?.oy ?? y) - y) > 2) return
          e.stopPropagation()
          toggleCollapsed(id, { x: defaultX, y: defaultY })
        }}
        style={{ left: x, top: y, touchAction: 'none' }}
        className={`pointer-events-auto absolute z-30 flex h-11 w-11 items-center justify-center rounded-xl border border-blueprint-line bg-white/95 text-lg shadow-pop backdrop-blur transition-shadow hover:shadow-card ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {icon}
      </button>
    )
  }

  return (
    <div
      style={{ left: x, top: y, width, touchAction: 'none' }}
      className="pointer-events-auto absolute z-30 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-blueprint-line bg-white/95 shadow-pop backdrop-blur"
    >
      <div
        onPointerDown={onPointerDown}
        className={`flex items-center gap-2 border-b border-blueprint-line/60 px-3 py-2 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        } select-none`}
      >
        <span className="text-base">{icon}</span>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        {headerExtra}
        <button
          data-no-drag
          title="Collapse"
          onClick={() => toggleCollapsed(id, { x: defaultX, y: defaultY })}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto scroll-thin">{children}</div>
    </div>
  )
}
