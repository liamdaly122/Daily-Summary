import { Group, Rect, Text, Circle, Line } from 'react-konva'
import type Konva from 'konva'
import type { Pin as PinT } from '../../store/types'
import { CATEGORY_COLOR, PRIORITY_COLOR } from '../../lib/constants'

interface Props {
  pin: PinT
  selected: boolean
  /** Render compact dot for plan view (zoomed-out), full card for room view. */
  compact: boolean
  /** Pin's absolute position on stage (already room.x + pin.x by parent) */
  x: number
  y: number
  onSelect: () => void
  onDragEnd: (x: number, y: number) => void
  onToggleDone: () => void
}

export const PinView = ({
  pin,
  selected,
  compact,
  x,
  y,
  onSelect,
  onDragEnd,
  onToggleDone,
}: Props) => {
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(e.target.x(), e.target.y())
  }

  if (compact) {
    return (
      <Group
        x={x}
        y={y}
        draggable
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          e.cancelBubble = true
          onSelect()
        }}
        onTap={(e) => {
          e.cancelBubble = true
          onSelect()
        }}
      >
        <Circle
          radius={selected ? 9 : 6}
          fill={CATEGORY_COLOR[pin.category]}
          stroke={pin.done ? '#10b981' : '#ffffff'}
          strokeWidth={pin.done ? 2 : 1.5}
          shadowColor="#000"
          shadowBlur={4}
          shadowOpacity={0.18}
        />
        {pin.done && (
          <Line
            points={[-3, 0, -1, 2, 3, -2]}
            stroke="#ffffff"
            strokeWidth={1.5}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Group>
    )
  }

  const W = 180
  const H = 70
  const accent = CATEGORY_COLOR[pin.category]

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect()
      }}
      onTap={(e) => {
        e.cancelBubble = true
        onSelect()
      }}
    >
      <Rect
        width={W}
        height={H}
        cornerRadius={8}
        fill="#ffffff"
        stroke={selected ? '#3b82f6' : '#e5e7eb'}
        strokeWidth={selected ? 2 : 1}
        shadowColor="#000"
        shadowBlur={selected ? 14 : 8}
        shadowOpacity={selected ? 0.18 : 0.1}
        shadowOffset={{ x: 0, y: 2 }}
      />
      {/* category accent stripe */}
      <Rect width={5} height={H} cornerRadius={[8, 0, 0, 8]} fill={accent} />
      {/* priority dot */}
      <Circle
        x={W - 12}
        y={12}
        radius={4}
        fill={PRIORITY_COLOR[pin.priority]}
        listening={false}
      />
      {/* done checkbox */}
      <Group
        x={W - 28}
        y={H - 22}
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
          width={18}
          height={18}
          cornerRadius={4}
          fill={pin.done ? '#10b981' : '#ffffff'}
          stroke={pin.done ? '#10b981' : '#d1d5db'}
          strokeWidth={1.5}
        />
        {pin.done && (
          <Line
            points={[4, 9, 8, 13, 14, 5]}
            stroke="#ffffff"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </Group>
      <Text
        x={14}
        y={10}
        width={W - 24}
        text={pin.title || 'Untitled'}
        fontStyle="600"
        fontSize={13}
        fill={pin.done ? '#9ca3af' : '#111827'}
        textDecoration={pin.done ? 'line-through' : ''}
        wrap="word"
        ellipsis
      />
      <Text
        x={14}
        y={30}
        width={W - 24}
        height={20}
        text={pin.description || 'Tap to add details'}
        fontSize={11}
        fill="#6b7280"
        wrap="word"
        ellipsis
      />
      {pin.estimatedCost > 0 && (
        <Text
          x={14}
          y={H - 18}
          text={`£${pin.estimatedCost}`}
          fontSize={11}
          fill="#374151"
          fontStyle="600"
        />
      )}
    </Group>
  )
}
