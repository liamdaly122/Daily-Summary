import { useActiveFloor, useStore } from '../store/useStore'
import { areaMeters, formatArea, formatCurrency } from '../lib/geometry'
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
} from '../lib/constants'
import type { Category, Priority } from '../store/types'

const CATEGORIES: (Category | 'all')[] = [
  'all',
  'general',
  'plumbing',
  'electrical',
  'paint',
  'structural',
  'decor',
  'furniture',
]
const PRIORITIES: (Priority | 'all')[] = ['all', 'low', 'med', 'high', 'urgent']

export const FloorSummary = () => {
  const floor = useActiveFloor()
  const setSelection = useStore((s) => s.setSelection)
  const focusRoom = useStore((s) => s.focusRoom)
  const filter = useStore((s) => s.ui.filter)
  const setFilterCategory = useStore((s) => s.setFilterCategory)
  const setFilterPriority = useStore((s) => s.setFilterPriority)
  const setFilterOnlyOpen = useStore((s) => s.setFilterOnlyOpen)

  if (!floor) return null

  const totalPins = floor.rooms.reduce((s, r) => s + r.pins.length, 0)
  const donePins = floor.rooms.reduce(
    (s, r) => s + r.pins.filter((p) => p.done).length,
    0,
  )
  const totalEst = floor.rooms.reduce(
    (s, r) => s + r.pins.reduce((ss, p) => ss + p.estimatedCost, 0),
    0,
  )
  const totalAct = floor.rooms.reduce(
    (s, r) => s + r.pins.reduce((ss, p) => ss + p.actualCost, 0),
    0,
  )
  const totalArea = floor.rooms.reduce((s, r) => s + areaMeters(r), 0)

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4 scroll-thin">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Floor summary
        </div>
        <div className="mt-0.5 text-lg font-semibold">{floor.name}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Floor area" value={formatArea(totalArea)} />
        <Stat label="Rooms" value={String(floor.rooms.length)} />
        <Stat label="Todos" value={`${donePins} / ${totalPins}`} />
        <Stat
          label="Progress"
          value={`${totalPins ? Math.round((donePins / totalPins) * 100) : 0}%`}
        />
        <Stat label="Estimated" value={formatCurrency(totalEst)} />
        <Stat label="Spent" value={formatCurrency(totalAct)} />
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-gray-500">Filter pins</div>
        <label className="flex items-center gap-2 rounded-md px-1 py-1 text-xs">
          <input
            type="checkbox"
            checked={filter.onlyOpen}
            onChange={(e) => setFilterOnlyOpen(e.target.checked)}
          />
          Only show open todos
        </label>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
          Category
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                filter.category === c
                  ? 'text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={{
                backgroundColor:
                  filter.category === c
                    ? c === 'all'
                      ? '#374151'
                      : CATEGORY_COLOR[c]
                    : undefined,
              }}
            >
              {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-wider text-gray-400">
          Priority
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                filter.priority === p
                  ? 'text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={{
                backgroundColor:
                  filter.priority === p
                    ? p === 'all'
                      ? '#374151'
                      : PRIORITY_COLOR[p]
                    : undefined,
              }}
            >
              {p === 'all' ? 'All' : PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-gray-500">Rooms</div>
        <div className="flex flex-col gap-1">
          {floor.rooms.map((r) => {
            const total = r.pins.length
            const done = r.pins.filter((p) => p.done).length
            const pct = total ? (done / total) * 100 : 0
            return (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 hover:border-blueprint-line hover:bg-white"
              >
                <button
                  className="flex-1 text-left"
                  onClick={() => setSelection({ kind: 'room', roomId: r.id })}
                >
                  <div className="text-sm text-gray-700">{r.name}</div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
                <button
                  onClick={() => focusRoom(r.id)}
                  className="rounded-md border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 hover:border-blueprint-accent hover:text-blueprint-accent"
                >
                  Zoom
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-auto rounded-lg bg-blueprint-line/30 p-2 text-[11px] text-gray-500">
        Tip: pick a room shape from the bottom toolbar, then drag on the canvas to draw it.
      </div>
    </div>
  )
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-blueprint-line bg-white p-2">
    <div className="text-[10px] uppercase text-gray-400">{label}</div>
    <div className="text-sm font-semibold text-gray-800">{value}</div>
  </div>
)
