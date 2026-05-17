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

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
    {children}
  </div>
)

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
  const pct = totalPins ? Math.round((donePins / totalPins) * 100) : 0

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto px-4 py-3 scroll-thin">
      <div>
        <SectionLabel>Summary</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5">
          <Stat label="Rooms" value={String(floor.rooms.length)} />
          <Stat label="Todos" value={`${donePins}/${totalPins}`} />
          <Stat label="Done" value={`${pct}%`} />
          <Stat label="Area" value={formatArea(totalArea)} compact />
          <Stat label="Est." value={formatCurrency(totalEst)} compact />
          <Stat label="Spent" value={formatCurrency(totalAct)} compact />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <SectionLabel>Filter</SectionLabel>
          <label className="flex items-center gap-1 text-[11px] text-ink-muted">
            <input
              type="checkbox"
              checked={filter.onlyOpen}
              onChange={(e) => setFilterOnlyOpen(e.target.checked)}
            />
            Open only
          </label>
        </div>
        <div className="mb-1 text-[10px] uppercase text-ink-subtle">Category</div>
        <div className="mb-2 flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                filter.category === c
                  ? 'text-white'
                  : 'border border-canvas-line text-ink-muted hover:border-ink-faint'
              }`}
              style={{
                backgroundColor:
                  filter.category === c
                    ? c === 'all'
                      ? '#1f2937'
                      : CATEGORY_COLOR[c]
                    : undefined,
              }}
            >
              {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <div className="mb-1 text-[10px] uppercase text-ink-subtle">Priority</div>
        <div className="flex flex-wrap gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                filter.priority === p
                  ? 'text-white'
                  : 'border border-canvas-line text-ink-muted hover:border-ink-faint'
              }`}
              style={{
                backgroundColor:
                  filter.priority === p
                    ? p === 'all'
                      ? '#1f2937'
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
        <SectionLabel>Rooms</SectionLabel>
        <div className="-mx-1 flex flex-col">
          {floor.rooms.length === 0 && (
            <div className="rounded-md border border-dashed border-canvas-line p-4 text-center text-[11px] text-ink-faint">
              Pick a shape from the toolbar and drag to draw a room
            </div>
          )}
          {floor.rooms.map((r) => {
            const total = r.pins.length
            const done = r.pins.filter((p) => p.done).length
            const p = total ? (done / total) * 100 : 0
            return (
              <div
                key={r.id}
                className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-canvas-hairline"
              >
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setSelection({ kind: 'room', roomId: r.id })}
                >
                  <div className="truncate text-[13px] text-ink">{r.name}</div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-canvas-hairline">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </button>
                <button
                  onClick={() => focusRoom(r.id)}
                  className="rounded-md border border-canvas-line bg-white px-1.5 py-0.5 text-[10px] text-ink-muted opacity-0 transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100"
                >
                  Open
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-auto rounded-md bg-canvas-hairline p-2 text-[11px] text-ink-muted">
        ⌘K to search · double-click a room to open it
      </div>
    </div>
  )
}

const Stat = ({ label, value, compact }: { label: string; value: string; compact?: boolean }) => (
  <div className="rounded-md border border-canvas-line bg-white px-2 py-1.5 text-left">
    <div className="text-[9px] uppercase tracking-wider text-ink-subtle">{label}</div>
    <div className={`font-semibold text-ink ${compact ? 'text-[12px]' : 'text-[13px]'}`}>{value}</div>
  </div>
)
