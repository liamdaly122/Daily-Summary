import { useStore } from '../store/useStore'
import type { Tool } from '../store/types'

interface BtnProps {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}

const Btn = ({ active, title, onClick, children }: BtnProps) => (
  <button
    title={title}
    onClick={onClick}
    className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-colors ${
      active
        ? 'bg-blueprint-accent text-white shadow-card'
        : 'text-blueprint-ink hover:bg-blueprint-line/60'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="mx-1 h-6 w-px bg-blueprint-line/80" />

export const Toolbar = () => {
  const tool = useStore((s) => s.tool)
  const setTool = useStore((s) => s.setTool)
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const focusRoom = useStore((s) => s.focusRoom)
  const showGrid = useStore((s) => s.ui.showGrid)
  const showHeatmap = useStore((s) => s.ui.showHeatmap)
  const toggleGrid = useStore((s) => s.toggleGrid)
  const toggleHeatmap = useStore((s) => s.toggleHeatmap)
  const sidebarOpen = useStore((s) => s.ui.sidebarOpen)
  const toggleSidebar = useStore((s) => s.toggleSidebar)

  const set = (t: Tool) => setTool(t)

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-blueprint-line bg-white/95 px-2 py-1.5 shadow-pop backdrop-blur">
      <div className="flex items-center gap-0.5">
        <Btn title="Select / move (V)" active={tool === 'select'} onClick={() => set('select')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 8-6 1-3 7-5-16z"/></svg>
        </Btn>
        <Btn title="Pan (H)" active={tool === 'pan'} onClick={() => set('pan')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l4-4M5 12l4 4M5 12h14M19 12l-4-4M19 12l-4 4"/></svg>
        </Btn>
        <Divider />
        {focusedRoomId ? (
          <>
            <Btn title="Add pin" active={tool === 'add-pin'} onClick={() => set('add-pin')}>📌</Btn>
            <Btn title="Zoom out to floor" onClick={() => focusRoom(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14l-4 4m0 0v-4m0 4h4M15 10l4-4m0 0v4m0-4h-4"/></svg>
            </Btn>
          </>
        ) : (
          <>
            <Btn title="Draw generic room" active={tool === 'draw-room'} onClick={() => set('draw-room')}>▭</Btn>
            <Btn title="Kitchen" active={tool === 'draw-kitchen'} onClick={() => set('draw-kitchen')}>🍳</Btn>
            <Btn title="Bathroom" active={tool === 'draw-bathroom'} onClick={() => set('draw-bathroom')}>🛁</Btn>
            <Btn title="Bedroom" active={tool === 'draw-bedroom'} onClick={() => set('draw-bedroom')}>🛏</Btn>
            <Btn title="Living room" active={tool === 'draw-living'} onClick={() => set('draw-living')}>🛋</Btn>
            <Btn title="Conservatory" active={tool === 'draw-conservatory'} onClick={() => set('draw-conservatory')}>🪴</Btn>
            <Btn title="Corridor" active={tool === 'draw-corridor'} onClick={() => set('draw-corridor')}>↔</Btn>
            <Btn title="Staircase" active={tool === 'draw-staircase'} onClick={() => set('draw-staircase')}>⇡</Btn>
            <Btn title="Garage" active={tool === 'draw-garage'} onClick={() => set('draw-garage')}>🚗</Btn>
          </>
        )}
        <Divider />
        <Btn title={showGrid ? 'Hide grid' : 'Show grid'} active={showGrid} onClick={toggleGrid}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
        </Btn>
        <Btn title={showHeatmap ? 'Hide progress heatmap' : 'Show progress heatmap'} active={showHeatmap} onClick={toggleHeatmap}>
          🔥
        </Btn>
        <Btn title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'} active={sidebarOpen} onClick={toggleSidebar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></svg>
        </Btn>
      </div>
    </div>
  )
}
