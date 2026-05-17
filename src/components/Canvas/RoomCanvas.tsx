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

/**
 * Full-bleed canvas focused on a single room. Click anywhere inside the room
 * outline to drop a pin at that location. Pins render as compact sticky
 * cards and can be dragged within the room.
 */
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

  // Fit room into the viewport with padding for labels
  const padding = 120
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
    // Only react to clicks on the background — pins/buttons handle their own.
    const name = e.target.name?.()
    if (name !== 'room-bg' && name !== 'stage-bg') {
      return
    }
    const stage = stageRef.current
    if (!stage) return
    const ptr = stage.getPointerPosition()
    if (!ptr) return

    if (name === 'stage-bg') {
      setSelection(null)
      return
    }

    // room-bg → add a pin at this local position
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
        {/* Paper background — also captures off-room clicks to deselect */}
        <Layer>
          <Rect name="stage-bg" width={size.w} height={size.h} fill="#efe9d8" />
          {showGrid && <DotGrid w={size.w} h={size.h} />}
        </Layer>

        {/* The room itself */}
        <Layer>
          <Group x={offsetX} y={offsetY}>
            {/* Outline */}
            <Rect
              name="room-bg"
              width={room.width * scale}
              height={room.height * scale}
              fill={ROOM_TYPE_COLOR[room.type]}
              stroke="#2a2a2a"
              strokeWidth={2}
              cornerRadius={3}
              shadowColor="#000"
              shadowBlur={28}
              shadowOpacity={0.08}
              shadowOffset={{ x: 0, y: 4 }}
            />

            {/* Dim borderlines for a blueprint vibe */}
            <Rect
              listening={false}
              x={6}
              y={6}
              width={room.width * scale - 12}
              height={room.height * scale - 12}
              stroke="#cfc7b3"
              strokeWidth={0.7}
              dash={[3, 4]}
              cornerRadius={2}
            />

            {/* Title (top-left, large) */}
            <Group listening={false}>
              <Text
                x={16}
                y={14}
                text={`${ROOM_TYPE_ICON[room.type]}  ${room.name}`}
                fontStyle="700"
                fontSize={20}
                fill="#1f2937"
              />
              <Text
                x={16}
                y={40}
                text={`${ROOM_TYPE_LABEL[room.type]} · ${formatMeters(unitsToMeters(room.width))} × ${formatMeters(unitsToMeters(room.height))} · ${formatArea(areaMeters(room))}`}
                fontSize={11}
                fill="#6b7280"
              />
            </Group>

            {/* Hint when empty */}
            {pinsVisible.length === 0 && (
              <Text
                listening={false}
                x={0}
                y={room.height * scale / 2 - 12}
                width={room.width * scale}
                align="center"
                text="Click anywhere to drop a todo pin"
                fontSize={13}
                fontStyle="500"
                fill="#9ca3af"
              />
            )}
          </Group>

          {/* Pins layer — positioned in screen pixels */}
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
  const step = 18
  const dots: JSX.Element[] = []
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      dots.push(<Circle key={`${x},${y}`} x={x} y={y} radius={0.8} fill="#cfc7b3" listening={false} />)
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
  const W = selected ? 180 : 150
  const H = selected ? (pin.description ? 96 : 56) : 56
  const accent = CATEGORY_COLOR[pin.category]

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
      {/* shadow card */}
      <Rect
        x={-W / 2}
        y={-12}
        width={W}
        height={H}
        cornerRadius={10}
        fill="#ffffff"
        stroke={selected ? '#3b82f6' : '#e5e7eb'}
        strokeWidth={selected ? 2 : 1}
        shadowColor="#000"
        shadowBlur={selected ? 16 : 8}
        shadowOpacity={selected ? 0.18 : 0.1}
        shadowOffset={{ x: 0, y: 3 }}
      />
      {/* accent stripe */}
      <Rect x={-W / 2} y={-12} width={4} height={H} cornerRadius={[10, 0, 0, 10]} fill={accent} />
      {/* pin point (drop shadow circle) */}
      <Circle x={0} y={-12} radius={5} fill={accent} stroke="#fff" strokeWidth={1.5} />

      {/* title */}
      <Text
        x={-W / 2 + 10}
        y={-4}
        width={W - 44}
        height={20}
        text={pin.title || 'Untitled'}
        fontStyle="600"
        fontSize={12}
        fill={pin.done ? '#9ca3af' : '#111827'}
        textDecoration={pin.done ? 'line-through' : ''}
        ellipsis
        wrap="none"
      />

      {/* meta row */}
      <Group y={16}>
        <Circle x={-W / 2 + 16} y={6} radius={3} fill={PRIORITY_COLOR[pin.priority]} listening={false} />
        {pin.estimatedCost > 0 && (
          <Text
            x={-W / 2 + 26}
            y={2}
            text={`£${pin.estimatedCost}`}
            fontSize={10}
            fill="#6b7280"
            listening={false}
          />
        )}
        {pin.photos.length > 0 && (
          <Text
            x={-W / 2 + 60}
            y={2}
            text={`📷 ${pin.photos.length}`}
            fontSize={10}
            fill="#6b7280"
            listening={false}
          />
        )}
      </Group>

      {/* description preview when selected */}
      {selected && pin.description && (
        <Text
          x={-W / 2 + 10}
          y={36}
          width={W - 20}
          height={48}
          text={pin.description}
          fontSize={11}
          fill="#4b5563"
          ellipsis
          wrap="word"
        />
      )}

      {/* done checkbox */}
      <Group
        x={W / 2 - 46}
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
          width={16}
          height={16}
          cornerRadius={4}
          fill={pin.done ? '#10b981' : '#ffffff'}
          stroke={pin.done ? '#10b981' : '#d1d5db'}
          strokeWidth={1.5}
        />
        {pin.done && (
          <Line
            points={[3, 8, 7, 12, 13, 4]}
            stroke="#ffffff"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Group>

      {/* delete × — always visible, one click, no confirm */}
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
          width={16}
          height={16}
          cornerRadius={4}
          fill="#ffffff"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <Line
          points={[4, 4, 12, 12]}
          stroke="#ef4444"
          strokeWidth={1.8}
          lineCap="round"
          listening={false}
        />
        <Line
          points={[12, 4, 4, 12]}
          stroke="#ef4444"
          strokeWidth={1.8}
          lineCap="round"
          listening={false}
        />
      </Group>
    </Group>
  )
}
