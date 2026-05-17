import { Group, Rect, Text, Line } from 'react-konva'
import type Konva from 'konva'
import type { Room } from '../../store/types'
import {
  ROOM_TYPE_COLOR,
  ROOM_TYPE_ICON,
  ROOM_TYPE_LABEL,
} from '../../lib/constants'
import {
  areaMeters,
  formatArea,
  formatMeters,
  roomProgress,
  snap,
  unitsToMeters,
} from '../../lib/geometry'

interface Props {
  room: Room
  selected: boolean
  showHeatmap: boolean
  draggable: boolean
  onSelect: () => void
  onZoomIn: () => void
  onChange: (patch: Partial<Room>) => void
}

const HANDLE = 9
const MIN = 40

export const RoomShape = ({
  room,
  selected,
  showHeatmap,
  draggable,
  onSelect,
  onZoomIn,
  onChange,
}: Props) => {
  const progress = roomProgress(room)
  const totalPins = room.pins.length
  const donePins = room.pins.filter((p) => p.done).length

  const fill = ROOM_TYPE_COLOR[room.type]
  const heatmapColor = (() => {
    if (!showHeatmap || totalPins === 0) return null
    const hue = 0 + progress * 130 // red→green
    return `hsla(${hue}, 60%, 60%, 0.18)`
  })()

  const handleGroupDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const x = snap(e.target.x())
    const y = snap(e.target.y())
    e.target.position({ x, y })
    onChange({ x, y })
  }

  const handleCornerDragEnd =
    (corner: 'nw' | 'ne' | 'sw' | 'se') =>
    (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true
      const lx = snap(e.target.x() + HANDLE / 2)
      const ly = snap(e.target.y() + HANDLE / 2)
      let { x, y, width, height } = room
      if (corner === 'se') {
        width = Math.max(MIN, lx)
        height = Math.max(MIN, ly)
      } else if (corner === 'ne') {
        width = Math.max(MIN, lx)
        const newHeight = Math.max(MIN, height - ly)
        y = y + (height - newHeight)
        height = newHeight
      } else if (corner === 'sw') {
        const newWidth = Math.max(MIN, width - lx)
        x = x + (width - newWidth)
        width = newWidth
        height = Math.max(MIN, ly)
      } else {
        const newWidth = Math.max(MIN, width - lx)
        const newHeight = Math.max(MIN, height - ly)
        x = x + (width - newWidth)
        y = y + (height - newHeight)
        width = newWidth
        height = newHeight
      }
      onChange({ x, y, width, height })
      e.target.position({
        x: (corner.endsWith('e') ? width : 0) - HANDLE / 2,
        y: (corner.startsWith('s') ? height : 0) - HANDLE / 2,
      })
    }

  return (
    <Group
      x={room.x}
      y={room.y}
      draggable={draggable}
      onDragEnd={handleGroupDragEnd}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect()
      }}
      onTap={(e) => {
        e.cancelBubble = true
        onSelect()
      }}
      onDblClick={(e) => {
        e.cancelBubble = true
        onZoomIn()
      }}
      onDblTap={(e) => {
        e.cancelBubble = true
        onZoomIn()
      }}
    >
      <Rect
        width={room.width}
        height={room.height}
        fill={room.color || fill}
        stroke={selected ? '#2563eb' : '#cbd5e1'}
        strokeWidth={selected ? 2 : 1}
        cornerRadius={2}
        shadowEnabled={selected}
        shadowColor="#2563eb"
        shadowBlur={selected ? 10 : 0}
        shadowOpacity={0.2}
      />

      {heatmapColor && (
        <Rect
          width={room.width}
          height={room.height}
          fill={heatmapColor}
          listening={false}
          cornerRadius={2}
        />
      )}

      {/* dimension labels — only when selected to reduce clutter */}
      {selected && (
        <Group listening={false}>
          <Text
            x={0}
            y={-16}
            width={room.width}
            align="center"
            text={formatMeters(unitsToMeters(room.width))}
            fontSize={10}
            fill="#64748b"
          />
          <Text
            x={-52}
            y={room.height / 2 - 6}
            width={44}
            align="right"
            text={formatMeters(unitsToMeters(room.height))}
            fontSize={10}
            fill="#64748b"
          />
        </Group>
      )}

      <Group listening={false}>
        <Text
          x={10}
          y={10}
          text={`${ROOM_TYPE_ICON[room.type]}  ${room.name}`}
          fontStyle="600"
          fontSize={13}
          fill="#0f172a"
        />
        <Text
          x={10}
          y={26}
          text={`${ROOM_TYPE_LABEL[room.type]} · ${formatArea(areaMeters(room))}`}
          fontSize={10}
          fill="#94a3b8"
        />
        {totalPins > 0 && (
          <Text
            x={10}
            y={room.height - 20}
            text={`✓ ${donePins} / ${totalPins}`}
            fontSize={10}
            fill={progress === 1 ? '#10b981' : '#2563eb'}
            fontStyle="600"
          />
        )}
      </Group>

      {room.type === 'staircase' && (
        <Group listening={false}>
          {Array.from({ length: Math.max(4, Math.floor(room.height / 24)) }).map(
            (_, i, arr) => {
              const y = ((i + 1) * room.height) / (arr.length + 1)
              return (
                <Line
                  key={i}
                  points={[8, y, room.width - 8, y]}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  dash={[2, 2]}
                />
              )
            },
          )}
          <Text
            x={0}
            y={room.height / 2 - 8}
            width={room.width}
            align="center"
            text="UP"
            fontSize={10}
            fill="#94a3b8"
            fontStyle="600"
          />
        </Group>
      )}

      {selected && draggable && (
        <Group>
          {(
            [
              ['nw', 0, 0],
              ['ne', room.width, 0],
              ['sw', 0, room.height],
              ['se', room.width, room.height],
            ] as const
          ).map(([corner, hx, hy]) => (
            <Rect
              key={corner}
              x={hx - HANDLE / 2}
              y={hy - HANDLE / 2}
              width={HANDLE}
              height={HANDLE}
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth={1.5}
              cornerRadius={2}
              draggable
              onMouseDown={(e) => (e.cancelBubble = true)}
              onTouchStart={(e) => (e.cancelBubble = true)}
              onDragStart={(e) => (e.cancelBubble = true)}
              onDragEnd={handleCornerDragEnd(corner)}
              onMouseEnter={(e) => {
                const stage = e.target.getStage()
                if (!stage) return
                stage.container().style.cursor =
                  corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage()
                if (stage) stage.container().style.cursor = ''
              }}
            />
          ))}
        </Group>
      )}
    </Group>
  )
}
