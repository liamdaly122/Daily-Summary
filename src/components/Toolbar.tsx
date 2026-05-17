import { useStore } from '../store/useStore'
import type { Tool } from '../store/types'
import { FloatingPanel } from './FloatingPanel'
import { useViewport } from '../lib/useViewport'

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
    className={`flex h-8 w-8 items-center justify-center rounded-md text-[15px] transition-colors ${
      active
        ? 'bg-accent text-white shadow-soft'
        : 'text-ink-muted hover:bg-canvas-hairline hover:text-ink'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="mx-1 h-5 w-px bg-canvas-line" />

const CursorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 2.5l13 7.5-6 1-3 7-4-15.5z"/></svg>
)
const PanIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M7 8l-3 4 3 4M17 8l3 4-3 4" />
  </svg>
)
const GridIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
)
const HeatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 2c2 4 4 6 4 10a4 4 0 11-8 0c0-4 2-6 4-10z" />
  </svg>
)
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

export const Toolbar = () => {
  const tool = useStore((s) => s.tool)
  const setTool = useStore((s) => s.setTool)
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)
  const focusRoom = useStore((s) => s.focusRoom)
  const showGrid = useStore((s) => s.ui.showGrid)
  const showHeatmap = useStore((s) => s.ui.showHeatmap)
  const toggleGrid = useStore((s) => s.toggleGrid)
  const toggleHeatmap = useStore((s) => s.toggleHeatmap)

  const { width: vw, height: vh } = useViewport()
  if (vw === 0) return null

  const set = (t: Tool) => setTool(t)
  const width = focusedRoomId ? 240 : 520
  const defaultX = Math.max(16, Math.round(vw / 2 - width / 2))
  const defaultY = Math.max(16, vh - 72)

  return (
    <FloatingPanel
      id="toolbar"
      title="Tools"
      icon={<span className="text-ink-muted">⚒</span>}
      defaultX={defaultX}
      defaultY={defaultY}
      width={width}
    >
      <div className="flex items-center gap-0.5 p-1.5">
        <Btn title="Select / move" active={tool === 'select'} onClick={() => set('select')}>
          <CursorIcon />
        </Btn>
        <Btn title="Pan" active={tool === 'pan'} onClick={() => set('pan')}>
          <PanIcon />
        </Btn>
        <Divider />
        {focusedRoomId ? (
          <>
            <span className="px-2 text-[11px] text-ink-subtle">Click in the room to add a pin</span>
            <div className="ml-auto" />
            <Btn title="Back to floor plan" onClick={() => focusRoom(null)}>
              <BackIcon />
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
            <Divider />
            <Btn title={showGrid ? 'Hide grid' : 'Show grid'} active={showGrid} onClick={toggleGrid}>
              <GridIcon />
            </Btn>
            <Btn title={showHeatmap ? 'Hide progress heatmap' : 'Show progress heatmap'} active={showHeatmap} onClick={toggleHeatmap}>
              <HeatIcon />
            </Btn>
          </>
        )}
      </div>
    </FloatingPanel>
  )
}
