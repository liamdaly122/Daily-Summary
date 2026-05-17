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

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
    {children}
  </div>
)

export const RoomEditor = ({ room }: Props) => {
  const updateRoom = useStore((s) => s.updateRoom)
  const removeRoom = useStore((s) => s.removeRoom)
  const focusRoom = useStore((s) => s.focusRoom)
  const focusedRoomId = useStore((s) => s.view.focusedRoomId)

  const totalEst = room.pins.reduce((s, p) => s + p.estimatedCost, 0)
  const totalAct = room.pins.reduce((s, p) => s + p.actualCost, 0)
  const done = room.pins.filter((p) => p.done).length
  const isFocused = focusedRoomId === room.id

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto px-4 py-3 scroll-thin">
      <div className="flex items-center gap-1.5">
        {!isFocused && (
          <button
            onClick={() => focusRoom(room.id)}
            className="btn btn-primary"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Open
          </button>
        )}
        <div className="ml-auto" />
        <button
          onClick={() => removeRoom(room.id)}
          className="btn btn-danger"
        >
          Delete room
        </button>
      </div>

      <input
        value={room.name}
        onChange={(e) => updateRoom(room.id, { name: e.target.value })}
        placeholder="Room name"
        className="w-full rounded-lg border border-canvas-line bg-white px-3 py-2 text-[15px] font-semibold outline-none transition-colors focus:border-accent focus:shadow-ring"
      />

      <div>
        <SectionLabel>Type</SectionLabel>
        <div className="grid grid-cols-2 gap-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => updateRoom(room.id, { type: t })}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[12px] transition-all ${
                room.type === t
                  ? 'border-accent bg-accent/8 text-accent'
                  : 'border-canvas-line bg-white text-ink-muted hover:border-ink-faint hover:text-ink'
              }`}
            >
              <span>{ROOM_TYPE_ICON[t]}</span>
              <span>{ROOM_TYPE_LABEL[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        <Stat label="W" value={formatMeters(unitsToMeters(room.width))} />
        <Stat label="D" value={formatMeters(unitsToMeters(room.height))} />
        <Stat label="Area" value={formatArea(areaMeters(room))} />
      </div>

      <div className="rounded-lg border border-canvas-line bg-white p-3">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Progress</SectionLabel>
          <span className="text-[11px] text-ink-muted">
            {done} / {room.pins.length} done
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-hairline">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: room.pins.length ? `${(done / room.pins.length) * 100}%` : '0%',
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-ink-subtle">Estimated</div>
            <div className="font-semibold text-ink">{formatCurrency(totalEst)}</div>
          </div>
          <div>
            <div className="text-ink-subtle">Actual</div>
            <div className="font-semibold text-ink">{formatCurrency(totalAct)}</div>
          </div>
        </div>
      </div>

      {room.pins.length > 0 && (
        <div>
          <SectionLabel>Todos · {room.pins.length}</SectionLabel>
          <div className="-mx-1 flex flex-col">
            {room.pins.map((p) => (
              <PinRow key={p.id} pin={p} roomId={room.id} />
            ))}
          </div>
        </div>
      )}

      {!isFocused && (
        <div className="mt-auto rounded-md bg-canvas-hairline p-2 text-[11px] text-ink-muted">
          Tip: double-click the room on the floor plan to open it.
        </div>
      )}
    </div>
  )
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-canvas-line bg-white py-1.5">
    <div className="text-[10px] uppercase text-ink-subtle">{label}</div>
    <div className="text-[13px] font-semibold text-ink">{value}</div>
  </div>
)

const PinRow = ({ pin, roomId }: { pin: Room['pins'][number]; roomId: string }) => {
  const setSelection = useStore((s) => s.setSelection)
  const toggle = useStore((s) => s.togglePinDone)
  const remove = useStore((s) => s.removePin)
  return (
    <div
      onClick={() => setSelection({ kind: 'pin', roomId, pinId: pin.id })}
      className="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-canvas-hairline"
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
      <span className={`flex-1 truncate ${pin.done ? 'text-ink-faint line-through' : 'text-ink'}`}>
        {pin.title || 'Untitled'}
      </span>
      {pin.estimatedCost > 0 && (
        <span className="text-[10px] text-ink-subtle">£{pin.estimatedCost}</span>
      )}
      <button
        title="Delete pin"
        onClick={(e) => {
          e.stopPropagation()
          remove(roomId, pin.id)
        }}
        className="rounded p-0.5 text-ink-faint opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>
  )
}
