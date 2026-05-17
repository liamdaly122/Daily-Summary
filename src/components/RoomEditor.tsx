import type { Room, RoomType } from '../store/types'
import { ROOM_TYPE_ICON, ROOM_TYPE_LABEL } from '../lib/constants'
import { areaMeters, formatArea, formatCurrency, formatMeters, unitsToMeters } from '../lib/geometry'
import { useStore } from '../store/useStore'

interface Props {
  room: Room
}

const TYPES: RoomType[] = [
  'room',
  'kitchen',
  'bathroom',
  'bedroom',
  'living',
  'conservatory',
  'corridor',
  'staircase',
  'garage',
  'outdoor',
]

export const RoomEditor = ({ room }: Props) => {
  const updateRoom = useStore((s) => s.updateRoom)
  const removeRoom = useStore((s) => s.removeRoom)
  const focusRoom = useStore((s) => s.focusRoom)

  const totalEst = room.pins.reduce((s, p) => s + p.estimatedCost, 0)
  const totalAct = room.pins.reduce((s, p) => s + p.actualCost, 0)
  const done = room.pins.filter((p) => p.done).length

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4 scroll-thin">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Room
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => focusRoom(room.id)}
            className="rounded-md bg-blueprint-accent px-2 py-1 text-xs font-medium text-white"
          >
            Zoom in →
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${room.name}" and its ${room.pins.length} pins?`))
                removeRoom(room.id)
            }}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-red-300 hover:text-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <input
        value={room.name}
        onChange={(e) => updateRoom(room.id, { name: e.target.value })}
        placeholder="Room name"
        className="w-full rounded-lg border border-blueprint-line bg-white px-3 py-2 text-base font-semibold outline-none focus:border-blueprint-accent"
      />

      <div>
        <div className="mb-1 text-xs font-medium text-gray-500">Type</div>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => updateRoom(room.id, { type: t })}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${
                room.type === t
                  ? 'border-blueprint-accent bg-blueprint-accent/10 text-blueprint-accent'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{ROOM_TYPE_ICON[t]}</span>
              <span>{ROOM_TYPE_LABEL[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-blueprint-line bg-white p-2">
          <div className="text-[10px] uppercase text-gray-400">Width</div>
          <div className="text-sm font-semibold">
            {formatMeters(unitsToMeters(room.width))}
          </div>
        </div>
        <div className="rounded-lg border border-blueprint-line bg-white p-2">
          <div className="text-[10px] uppercase text-gray-400">Depth</div>
          <div className="text-sm font-semibold">
            {formatMeters(unitsToMeters(room.height))}
          </div>
        </div>
        <div className="col-span-2 rounded-lg border border-blueprint-line bg-white p-2">
          <div className="text-[10px] uppercase text-gray-400">Floor area</div>
          <div className="text-sm font-semibold">{formatArea(areaMeters(room))}</div>
        </div>
      </div>

      <div className="rounded-xl border border-blueprint-line bg-white p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Progress
        </div>
        <div className="mt-1 text-sm">
          {done} / {room.pins.length} todos done
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: room.pins.length ? `${(done / room.pins.length) * 100}%` : '0%',
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-400">Estimated</div>
            <div className="font-semibold text-gray-700">{formatCurrency(totalEst)}</div>
          </div>
          <div>
            <div className="text-gray-400">Actual</div>
            <div className="font-semibold text-gray-700">{formatCurrency(totalAct)}</div>
          </div>
        </div>
      </div>

      {room.pins.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-500">
            Todos ({room.pins.length})
          </div>
          <div className="flex flex-col gap-1">
            {room.pins.map((p) => (
              <PinRow key={p.id} pin={p} roomId={room.id} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto rounded-lg bg-blueprint-line/30 p-2 text-[11px] text-gray-500">
        Tip: double-click a room on the floor plan to zoom in and start pinning todos.
      </div>
    </div>
  )
}

const PinRow = ({ pin, roomId }: { pin: Room['pins'][number]; roomId: string }) => {
  const setSelection = useStore((s) => s.setSelection)
  const toggle = useStore((s) => s.togglePinDone)
  return (
    <button
      onClick={() => setSelection({ kind: 'pin', roomId, pinId: pin.id })}
      className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-left text-xs hover:border-blueprint-line hover:bg-white"
    >
      <input
        type="checkbox"
        checked={pin.done}
        onChange={(e) => {
          e.stopPropagation()
          toggle(roomId, pin.id)
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <span className={`flex-1 truncate ${pin.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
        {pin.title || 'Untitled'}
      </span>
      {pin.estimatedCost > 0 && (
        <span className="text-[10px] text-gray-400">£{pin.estimatedCost}</span>
      )}
    </button>
  )
}
