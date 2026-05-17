import { useStore } from '../store/useStore'
import type { Tool } from '../store/types'
import { FloatingPanel } from './FloatingPanel'

interface BtnProps {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}

const Btn = ({ active, title, onClick, children }: BtnProps) => (
  <button
    data-no-drag
    title={title}
    onClick={onClick}
    className={`flex h-9 w-9 items-center justify-center rounded-lg text-base transition-colors ${
      active
        ? 'bg-blueprint-accent text-white shadow-card'
        : 'text-blueprint-ink hover:bg-blueprint-line/60'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="mx-1 h-5 w-px bg-blueprint-line/80" />

export const Toolbar = () => {
  const tool = useStore((s) => s.tool)
  const setTool = useStore((s) => s.setTool)
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const focusRoom = useStore((s) => s.focusRoom)
  const showGrid = useStore((s) => s.ui.showGrid)
  const showHeatmap = useStore((s) => s.ui.showHeatmap)
  const toggleGrid = useStore((s) => s.toggleGrid)
  const toggleHeatmap = useStore((s) => s.toggleHeatmap)

  const set = (t: Tool) => setTool(t)

  // Position toolbar near bottom-center by default
  const defaultX = Math.max(16, Math.round(window.innerWidth / 2 - 280))
  const defaultY = Math.max(16, window.innerHeight - 100)

  return (
    <FloatingPanel
      id="toolbar"
      title="Tools"
      icon={<span>🛠</span>}
      defaultX={defaultX}
      defaultY={defaultY}
      width={focusedRoomId ? 200 : 560}
    >
      <div className="flex items-center gap-0.5 p-1.5">
        <Btn title="Select / move" active={tool === 'select'} onClick={() => set('select')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 8-6 1-3 7-5-16z"/></svg>
        </Btn>
        <Btn title="Pan" active={tool === 'pan'} onClick={() => set('pan')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l4-4M5 12l4 4M5 12h14M19 12l-4-4M19 12l-4 4"/></svg>
        </Btn>
        <Divider />
        {focusedRoomId ? (
          <>
            <span className="px-1 text-[11px] text-gray-500">Click anywhere in the room to add a pin</span>
            <Btn title="Back to floor plan" onClick={() => focusRoom(null)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </Btn>
          </>
        ) : (
          <>
            <Btn title="Generic room" active={tool === 'draw-room'} onClick={() => set('draw-room')}>▭</Btn>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
        </Btn>
        {!focusedRoomId && (
          <Btn title={showHeatmap ? 'Hide progress heatmap' : 'Show progress heatmap'} active={showHeatmap} onClick={toggleHeatmap}>
            🔥
          </Btn>
        )}
      </div>
    </FloatingPanel>
  )
}
