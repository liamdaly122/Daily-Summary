import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Group, Text, Circle } from 'react-konva'
import type Konva from 'konva'
import { Grid } from './Grid'
import { RoomShape } from './RoomShape'
import { useStore, useActiveFloor } from '../../store/useStore'
import { clamp, snap } from '../../lib/geometry'
import type { RoomType } from '../../store/types'
import { CATEGORY_COLOR, ROOM_TYPE_LABEL } from '../../lib/constants'

const MIN_SCALE = 0.2
const MAX_SCALE = 4

const toolToRoomType = (t: string): RoomType | null => {
  if (!t.startsWith('draw-')) return null
  return t.slice(5) as RoomType
}

interface DragRect {
  x: number
  y: number
  width: number
  height: number
}

export const BlueprintCanvas = () => {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [dragRect, setDragRect] = useState<DragRect | null>(null)

  const tool = useStore((s) => s.tool)
  const view = useStore((s) => s.view)
  const selection = useStore((s) => s.selection)
  const showGrid = useStore((s) => s.ui.showGrid)
  const showHeatmap = useStore((s) => s.ui.showHeatmap)
  const filter = useStore((s) => s.ui.filter)
  const setTool = useStore((s) => s.setTool)
  const setView = useStore((s) => s.setView)
  const setSelection = useStore((s) => s.setSelection)
  const addRoom = useStore((s) => s.addRoom)
  const updateRoom = useStore((s) => s.updateRoom)
  const focusRoom = useStore((s) => s.focusRoom)

  const floor = useActiveFloor()

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight })
    })
    ro.observe(el)
    setSize({ width: el.clientWidth, height: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setView({ scale: 1, x: 40, y: 40, focusedRoomId: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floor?.id])

  const stageToWorld = (sx: number, sy: number) => ({
    x: (sx - view.x) / view.scale,
    y: (sy - view.y) / view.scale,
  })

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const oldScale = view.scale
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const scale = clamp(oldScale * (direction > 0 ? 1.1 : 1 / 1.1), MIN_SCALE, MAX_SCALE)
    const worldX = (pointer.x - view.x) / oldScale
    const worldY = (pointer.y - view.y) / oldScale
    const x = pointer.x - worldX * scale
    const y = pointer.y - worldY * scale
    setView({ scale, x, y })
  }

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isStage = e.target === e.target.getStage()
    const drawType = toolToRoomType(tool)

    if (drawType && isStage) {
      const stage = stageRef.current
      if (!stage) return
      const pointer = stage.getPointerPosition()
      if (!pointer) return
      const w = stageToWorld(pointer.x, pointer.y)
      setDragRect({ x: snap(w.x), y: snap(w.y), width: 0, height: 0 })
      return
    }

    if (tool === 'select' && isStage) {
      setSelection(null)
    }
  }

  const handleStageMouseMove = () => {
    if (!dragRect) return
    const stage = stageRef.current
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const w = stageToWorld(pointer.x, pointer.y)
    setDragRect((r) => (r ? { ...r, width: snap(w.x) - r.x, height: snap(w.y) - r.y } : r))
  }

  const handleStageMouseUp = () => {
    const drawType = toolToRoomType(tool)
    if (!dragRect || !drawType) {
      setDragRect(null)
      return
    }
    const w = Math.abs(dragRect.width)
    const h = Math.abs(dragRect.height)
    if (w < 40 || h < 40) {
      setDragRect(null)
      return
    }
    const x = dragRect.width < 0 ? dragRect.x + dragRect.width : dragRect.x
    const y = dragRect.height < 0 ? dragRect.y + dragRect.height : dragRect.y
    addRoom({
      x,
      y,
      width: w,
      height: h,
      name: ROOM_TYPE_LABEL[drawType],
      type: drawType,
    })
    setDragRect(null)
    setTool('select')
  }

  const stageDraggable = tool === 'pan'

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        scaleX={view.scale}
        scaleY={view.scale}
        x={view.x}
        y={view.y}
        draggable={stageDraggable}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setView({ x: e.target.x(), y: e.target.y() })
          }
        }}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown as never}
        onMouseMove={handleStageMouseMove}
        onTouchMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onTouchEnd={handleStageMouseUp}
        style={{
          cursor:
            tool === 'pan'
              ? 'grab'
              : tool.startsWith('draw-')
              ? 'crosshair'
              : 'default',
        }}
      >
        {showGrid && (
          <Layer listening={false}>
            <Grid
              width={size.width}
              height={size.height}
              scale={view.scale}
              offsetX={view.x}
              offsetY={view.y}
            />
          </Layer>
        )}

        <Layer>
          <Group listening={false}>
            <Text
              x={20}
              y={20}
              text={floor?.name ?? ''}
              fontSize={28}
              fontStyle="700"
              fill="#1f2937"
              opacity={0.9}
            />
            <Text
              x={20}
              y={54}
              text={`${floor?.rooms.length ?? 0} rooms · double-click a room to open it`}
              fontSize={12}
              fill="#6b7280"
            />
          </Group>

          {floor?.rooms.map((room) => (
            <RoomShape
              key={room.id}
              room={room}
              selected={selection?.kind === 'room' && selection.roomId === room.id}
              showHeatmap={showHeatmap}
              draggable={tool === 'select'}
              onSelect={() => setSelection({ kind: 'room', roomId: room.id })}
              onZoomIn={() => focusRoom(room.id)}
              onChange={(patch) => updateRoom(room.id, patch)}
            />
          ))}

          {/* Tiny pin dots overlay (plan view summary) */}
          {floor?.rooms.flatMap((room) =>
            room.pins
              .filter((p) => {
                if (filter.onlyOpen && p.done) return false
                if (filter.category !== 'all' && p.category !== filter.category) return false
                if (filter.priority !== 'all' && p.priority !== filter.priority) return false
                return true
              })
              .map((pin) => (
                <Group
                  key={pin.id}
                  x={room.x + pin.x}
                  y={room.y + pin.y}
                  listening={false}
                >
                  <Circle
                    radius={4}
                    fill={CATEGORY_COLOR[pin.category]}
                    stroke={pin.done ? '#10b981' : '#ffffff'}
                    strokeWidth={pin.done ? 1.5 : 1}
                    opacity={pin.done ? 0.55 : 1}
                  />
                </Group>
              )),
          )}

          {dragRect && (
            <Rect
              x={dragRect.width < 0 ? dragRect.x + dragRect.width : dragRect.x}
              y={dragRect.height < 0 ? dragRect.y + dragRect.height : dragRect.y}
              width={Math.abs(dragRect.width)}
              height={Math.abs(dragRect.height)}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dash={[4, 4]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
