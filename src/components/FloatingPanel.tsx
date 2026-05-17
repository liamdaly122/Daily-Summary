import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

interface Props {
  id: string
  title: string
  icon: React.ReactNode
  defaultX: number
  defaultY: number
  width?: number
  defaultCollapsed?: boolean
  /** Only render when truthy. Lets us hide context panels (e.g. Sidebar without selection). */
  visible?: boolean
  children: React.ReactNode
  headerExtra?: React.ReactNode
}

/**
 * Draggable, collapsible panel. Drag the header bar to move; click the
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
  defaultCollapsed = false,
  visible = true,
  children,
  headerExtra,
}: Props) => {
  const panel = useStore((s) => s.ui.panels[id])
  const movePanel = useStore((s) => s.movePanel)
  const toggleCollapsed = useStore((s) => s.togglePanelCollapsed)

  const x = panel?.x ?? defaultX
  const y = panel?.y ?? defaultY
  const collapsed = panel?.collapsed ?? defaultCollapsed

  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)

  // Cleanup listeners if unmounted mid-drag
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
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true
    const w = collapsed ? 40 : width
    const h = collapsed ? 40 : 240
    const nx = clamp(dragRef.current.ox + dx, window.innerWidth - w - 8)
    const ny = clamp(dragRef.current.oy + dy, window.innerHeight - h - 8)
    movePanel(id, nx, ny)
  }

  const onUp = () => {
    setDragging(false)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    // Defer clearing dragRef so the click handler can read .moved
    setTimeout(() => {
      dragRef.current = null
    }, 0)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button[data-no-drag], input, textarea')) return
    e.preventDefault()
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: x, oy: y, moved: false }
    setDragging(true)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  if (!visible) return null

  if (collapsed) {
    return (
      <button
        title={title}
        onPointerDown={onPointerDown}
        onClick={() => {
          if (dragRef.current?.moved) return
          toggleCollapsed(id, { x: defaultX, y: defaultY })
        }}
        style={{ left: x, top: y, touchAction: 'none' }}
        className={`pointer-events-auto panel-in absolute z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-canvas-line bg-white text-base shadow-card transition-all hover:shadow-pop ${
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
      className="pointer-events-auto panel-in absolute z-30 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-canvas-line bg-white/95 shadow-pop backdrop-blur"
    >
      <div
        onPointerDown={onPointerDown}
        className={`flex items-center gap-2 border-b border-canvas-hairline px-3 py-2 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        } select-none`}
      >
        <span className="text-sm leading-none">{icon}</span>
        <span className="flex-1 truncate text-[13px] font-semibold text-ink">{title}</span>
        {headerExtra}
        <button
          data-no-drag
          title="Collapse"
          onClick={() => toggleCollapsed(id, { x: defaultX, y: defaultY })}
          className="rounded-md p-1 text-ink-faint hover:bg-canvas-hairline hover:text-ink-muted"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto scroll-thin">{children}</div>
    </div>
  )
}
