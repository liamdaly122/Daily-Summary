import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Group, Text } from 'react-konva'
import type Konva from 'konva'
import { Grid } from './Grid'
import { RoomShape } from './RoomShape'
import { PinView } from './Pin'
import { useStore, useActiveFloor } from '../../store/useStore'
import { clamp, snap } from '../../lib/geometry'
import type { Room, RoomType } from '../../store/types'
import { ROOM_TYPE_LABEL } from '../../lib/constants'

const MIN_SCALE = 0.2
const MAX_SCALE = 4

const toolToRoomType = (t: string): RoomType | null => {
  if (!t.startsWith('draw-')) return null
  const k = t.slice(5) as RoomType
  return k
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
  const addPin = useStore((s) => s.addPin)
  const updatePin = useStore((s) => s.updatePin)
  const togglePinDone = useStore((s) => s.togglePinDone)

  const floor = useActiveFloor()
  const focusedRoom: Room | null =
    floor?.rooms.find((r) => r.id === view.focusedRoomId) ?? null

  // Resize observer on the container
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

  // When entering room-focus mode, animate to the room.
  useEffect(() => {
    if (!focusedRoom) return
    const padding = 60
    const sx = (size.width - padding * 2) / focusedRoom.width
    const sy = (size.height - padding * 2) / focusedRoom.height
    const scale = clamp(Math.min(sx, sy), MIN_SCALE, MAX_SCALE)
    const x = size.width / 2 - (focusedRoom.x + focusedRoom.width / 2) * scale
    const y = size.height / 2 - (focusedRoom.y + focusedRoom.height / 2) * scale
    setView({ scale, x, y })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.focusedRoomId, size.width, size.height])

  // Reset view when changing floor
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

    if (tool === 'add-pin' && focusedRoom && isStage) {
      const stage = stageRef.current
      if (!stage) return
      const pointer = stage.getPointerPosition()
      if (!pointer) return
      const w = stageToWorld(pointer.x, pointer.y)
      const lx = w.x - focusedRoom.x
      const ly = w.y - focusedRoom.y
      if (lx < 0 || ly < 0 || lx > focusedRoom.width || ly > focusedRoom.height) return
      addPin(focusedRoom.id, {
        x: lx,
        y: ly,
        title: 'New todo',
        description: '',
        category: 'general',
        priority: 'med',
        done: false,
        estimatedCost: 0,
        actualCost: 0,
        photos: [],
      })
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

  const filteredPinIds = (room: Room) =>
    room.pins.filter((p) => {
      if (filter.onlyOpen && p.done) return false
      if (filter.category !== 'all' && p.category !== filter.category) return false
      if (filter.priority !== 'all' && p.priority !== filter.priority) return false
      return true
    })

  return (
    <div ref={containerRef} className="h-full w-full">
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
              : tool === 'add-pin'
              ? 'copy'
              : 'default',
        }}
      >
        {/* Background grid layer */}
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

        {/* Rooms layer */}
        <Layer>
          {/* Floor backdrop */}
          {!focusedRoom && (
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
                text={`${floor?.rooms.length ?? 0} rooms · double-click a room to zoom in`}
                fontSize={12}
                fill="#6b7280"
              />
            </Group>
          )}

          {floor?.rooms.map((room) => (
            <RoomShape
              key={room.id}
              room={room}
              selected={selection?.kind === 'room' && selection.roomId === room.id}
              showHeatmap={showHeatmap && !focusedRoom}
              draggable={tool === 'select' && !focusedRoom}
              onSelect={() => setSelection({ kind: 'room', roomId: room.id })}
              onZoomIn={() => focusRoom(room.id)}
              onChange={(patch) => updateRoom(room.id, patch)}
            />
          ))}

          {/* Pins overlay */}
          {floor?.rooms.flatMap((room) =>
            filteredPinIds(room).map((pin) => {
              const isCompact = !focusedRoom || focusedRoom.id !== room.id
              return (
                <PinView
                  key={pin.id}
                  pin={pin}
                  compact={isCompact}
                  x={room.x + pin.x}
                  y={room.y + pin.y}
                  selected={
                    selection?.kind === 'pin' &&
                    selection.roomId === room.id &&
                    selection.pinId === pin.id
                  }
                  onSelect={() =>
                    setSelection({ kind: 'pin', roomId: room.id, pinId: pin.id })
                  }
                  onDragEnd={(nx, ny) => {
                    const lx = nx - room.x
                    const ly = ny - room.y
                    const cx = clamp(lx, 0, room.width - 4)
                    const cy = clamp(ly, 0, room.height - 4)
                    updatePin(room.id, pin.id, { x: cx, y: cy })
                  }}
                  onToggleDone={() => togglePinDone(room.id, pin.id)}
                />
              )
            }),
          )}

          {/* Live drawing preview */}
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
