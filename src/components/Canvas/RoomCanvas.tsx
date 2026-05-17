import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Group, Text, Line, Circle } from 'react-konva'
import type Konva from 'konva'
import type { Pin, Room } from '../../store/types'
import { useStore } from '../../store/useStore'
import {
  CATEGORY_COLOR,
  PRIORITY_COLOR,
  ROOM_TYPE_COLOR,
  ROOM_TYPE_ICON,
  ROOM_TYPE_LABEL,
} from '../../lib/constants'
import { areaMeters, clamp, formatArea, formatMeters, unitsToMeters } from '../../lib/geometry'

interface Props {
  room: Room
}

export const RoomCanvas = ({ room }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  const addPin = useStore((s) => s.addPin)
  const updatePin = useStore((s) => s.updatePin)
  const removePin = useStore((s) => s.removePin)
  const togglePinDone = useStore((s) => s.togglePinDone)
  const setSelection = useStore((s) => s.setSelection)
  const selection = useStore((s) => s.selection)
  const filter = useStore((s) => s.ui.filter)
  const showGrid = useStore((s) => s.ui.showGrid)

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const padding = 140
  const fit = Math.min(
    (size.w - padding * 2) / Math.max(room.width, 1),
    (size.h - padding * 2) / Math.max(room.height, 1),
  )
  const scale = Math.min(2.2, Math.max(0.4, fit))
  const offsetX = (size.w - room.width * scale) / 2
  const offsetY = (size.h - room.height * scale) / 2

  const pinsVisible = room.pins.filter((p) => {
    if (filter.onlyOpen && p.done) return false
    if (filter.category !== 'all' && p.category !== filter.category) return false
    if (filter.priority !== 'all' && p.priority !== filter.priority) return false
    return true
  })

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const name = typeof e.target.name === 'function' ? e.target.name() : ''
    if (name !== 'room-bg' && name !== 'stage-bg') return
    const stage = stageRef.current
    if (!stage) return
    const ptr = stage.getPointerPosition()
    if (!ptr) return

    if (name === 'stage-bg') {
      setSelection(null)
      return
    }
    const lx = (ptr.x - offsetX) / scale
    const ly = (ptr.y - offsetY) / scale
    if (lx < 4 || ly < 4 || lx > room.width - 4 || ly > room.height - 4) return
    addPin(room.id, {
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
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown as never}
      >
        {/* Paper background */}
        <Layer>
          <Rect name="stage-bg" width={size.w} height={size.h} fill="#f4f2ed" />
          {showGrid && <DotGrid w={size.w} h={size.h} />}
        </Layer>

        {/* Room */}
        <Layer>
          <Group x={offsetX} y={offsetY}>
            <Rect
              name="room-bg"
              width={room.width * scale}
              height={room.height * scale}
              fill={ROOM_TYPE_COLOR[room.type]}
              stroke="#cbd5e1"
              strokeWidth={1.5}
              cornerRadius={4}
              shadowColor="#000"
              shadowBlur={32}
              shadowOpacity={0.06}
              shadowOffset={{ x: 0, y: 6 }}
            />
            <Rect
              listening={false}
              x={6}
              y={6}
              width={room.width * scale - 12}
              height={room.height * scale - 12}
              stroke="#e5e7eb"
              strokeWidth={0.6}
              dash={[3, 4]}
              cornerRadius={3}
            />
            <Group listening={false}>
              <Text
                x={16}
                y={14}
                text={`${ROOM_TYPE_ICON[room.type]}  ${room.name}`}
                fontStyle="700"
                fontSize={18}
                fill="#0f172a"
              />
              <Text
                x={16}
                y={38}
                text={`${ROOM_TYPE_LABEL[room.type]} · ${formatMeters(unitsToMeters(room.width))} × ${formatMeters(unitsToMeters(room.height))} · ${formatArea(areaMeters(room))}`}
                fontSize={10}
                fill="#94a3b8"
              />
            </Group>
            {pinsVisible.length === 0 && (
              <Text
                listening={false}
                x={0}
                y={room.height * scale / 2 - 8}
                width={room.width * scale}
                align="center"
                text="Click anywhere to drop a todo pin"
                fontSize={12}
                fontStyle="500"
                fill="#cbd5e1"
              />
            )}
          </Group>

          {pinsVisible.map((pin) => (
            <RoomPin
              key={pin.id}
              pin={pin}
              x={offsetX + pin.x * scale}
              y={offsetY + pin.y * scale}
              selected={
                selection?.kind === 'pin' &&
                selection.roomId === room.id &&
                selection.pinId === pin.id
              }
              onSelect={() => setSelection({ kind: 'pin', roomId: room.id, pinId: pin.id })}
              onDragEnd={(nx, ny) => {
                const lx = clamp((nx - offsetX) / scale, 0, room.width)
                const ly = clamp((ny - offsetY) / scale, 0, room.height)
                updatePin(room.id, pin.id, { x: lx, y: ly })
              }}
              onToggleDone={() => togglePinDone(room.id, pin.id)}
              onDelete={() => removePin(room.id, pin.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}

const DotGrid = ({ w, h }: { w: number; h: number }) => {
  const step = 20
  const dots: JSX.Element[] = []
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      dots.push(<Circle key={`${x},${y}`} x={x} y={y} radius={0.7} fill="#d4d1c8" listening={false} />)
    }
  }
  return <Group listening={false}>{dots}</Group>
}

interface PinProps {
  pin: Pin
  x: number
  y: number
  selected: boolean
  onSelect: () => void
  onDragEnd: (x: number, y: number) => void
  onToggleDone: () => void
  onDelete: () => void
}

const RoomPin = ({ pin, x, y, selected, onSelect, onDragEnd, onToggleDone, onDelete }: PinProps) => {
  const W = selected ? 200 : 156
  const H = selected ? (pin.description ? 96 : 52) : 52
  const accent = CATEGORY_COLOR[pin.category]
  const subtaskCount = pin.subtasks?.length ?? 0
  const subtaskDone = (pin.subtasks ?? []).filter((s) => s.done).length

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect()
      }}
      onTap={(e) => {
        e.cancelBubble = true
        onSelect()
      }}
      onMouseDown={(e) => (e.cancelBubble = true)}
    >
      {/* card */}
      <Rect
        x={-W / 2}
        y={-12}
        width={W}
        height={H}
        cornerRadius={10}
        fill="#ffffff"
        stroke={selected ? '#2563eb' : '#e5e7eb'}
        strokeWidth={selected ? 1.5 : 1}
        shadowColor="#0f172a"
        shadowBlur={selected ? 14 : 6}
        shadowOpacity={selected ? 0.18 : 0.08}
        shadowOffset={{ x: 0, y: 3 }}
      />
      <Rect x={-W / 2} y={-12} width={3} height={H} cornerRadius={[10, 0, 0, 10]} fill={accent} />
      <Circle x={0} y={-12} radius={4.5} fill={accent} stroke="#fff" strokeWidth={1.5} />

      <Text
        x={-W / 2 + 10}
        y={-3}
        width={W - 50}
        height={18}
        text={pin.title || 'Untitled'}
        fontStyle="600"
        fontSize={12}
        fill={pin.done ? '#94a3b8' : '#0f172a'}
        textDecoration={pin.done ? 'line-through' : ''}
        ellipsis
        wrap="none"
      />

      {/* meta row */}
      <Group y={15}>
        <Circle x={-W / 2 + 16} y={6} radius={2.5} fill={PRIORITY_COLOR[pin.priority]} listening={false} />
        {pin.estimatedCost > 0 && (
          <Text
            x={-W / 2 + 25}
            y={2}
            text={`£${pin.estimatedCost}`}
            fontSize={10}
            fill="#64748b"
            listening={false}
          />
        )}
        {subtaskCount > 0 && (
          <Text
            x={-W / 2 + 56}
            y={2}
            text={`☐ ${subtaskDone}/${subtaskCount}`}
            fontSize={10}
            fill="#64748b"
            listening={false}
          />
        )}
        {(pin.links?.length ?? 0) > 0 && (
          <Text
            x={-W / 2 + 96}
            y={2}
            text={`🔗 ${pin.links!.length}`}
            fontSize={10}
            fill="#64748b"
            listening={false}
          />
        )}
        {pin.photos.length > 0 && (
          <Text
            x={-W / 2 + 120}
            y={2}
            text={`📷 ${pin.photos.length}`}
            fontSize={10}
            fill="#64748b"
            listening={false}
          />
        )}
      </Group>

      {selected && pin.description && (
        <Text
          x={-W / 2 + 10}
          y={36}
          width={W - 20}
          height={48}
          text={pin.description}
          fontSize={11}
          fill="#475569"
          ellipsis
          wrap="word"
        />
      )}

      {/* done checkbox */}
      <Group
        x={W / 2 - 44}
        y={-2}
        onClick={(e) => {
          e.cancelBubble = true
          onToggleDone()
        }}
        onTap={(e) => {
          e.cancelBubble = true
          onToggleDone()
        }}
      >
        <Rect
          width={14}
          height={14}
          cornerRadius={3}
          fill={pin.done ? '#10b981' : '#ffffff'}
          stroke={pin.done ? '#10b981' : '#cbd5e1'}
          strokeWidth={1.2}
        />
        {pin.done && (
          <Line
            points={[3, 7, 6, 10, 11, 4]}
            stroke="#ffffff"
            strokeWidth={1.8}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Group>

      {/* delete × — always visible */}
      <Group
        x={W / 2 - 22}
        y={-2}
        onClick={(e) => {
          e.cancelBubble = true
          onDelete()
        }}
        onTap={(e) => {
          e.cancelBubble = true
          onDelete()
        }}
        onMouseEnter={(e) => {
          const stage = e.target.getStage()
          if (stage) stage.container().style.cursor = 'pointer'
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage()
          if (stage) stage.container().style.cursor = ''
        }}
      >
        <Rect
          width={14}
          height={14}
          cornerRadius={3}
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <Line points={[4, 4, 10, 10]} stroke="#ef4444" strokeWidth={1.4} lineCap="round" listening={false} />
        <Line points={[10, 4, 4, 10]} stroke="#ef4444" strokeWidth={1.4} lineCap="round" listening={false} />
      </Group>
    </Group>
  )
}
