import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { CATEGORY_COLOR } from '../lib/constants'

interface Item {
  id: string
  kind: 'pin' | 'room' | 'floor' | 'command'
  title: string
  subtitle?: string
  color?: string
  onSelect: () => void
}

export const CommandPalette = () => {
  const open = useStore((s) => s.commandPaletteOpen)
  const setOpen = useStore((s) => s.setCommandPaletteOpen)
  const floors = useStore((s) => s.floors)
  const setActiveFloor = useStore((s) => s.setActiveFloor)
  const focusRoom = useStore((s) => s.focusRoom)
  const setSelection = useStore((s) => s.setSelection)
  const toggleGrid = useStore((s) => s.toggleGrid)
  const toggleHeatmap = useStore((s) => s.toggleHeatmap)
  const addFloor = useStore((s) => s.addFloor)

  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setIdx(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  const items: Item[] = useMemo(() => {
    const result: Item[] = []

    for (const floor of floors) {
      result.push({
        id: `floor-${floor.id}`,
        kind: 'floor',
        title: `Go to ${floor.name}`,
        subtitle: `${floor.rooms.length} rooms`,
        onSelect: () => setActiveFloor(floor.id),
      })
      for (const room of floor.rooms) {
        result.push({
          id: `room-${room.id}`,
          kind: 'room',
          title: room.name,
          subtitle: `${floor.name} · ${room.pins.length} todos`,
          onSelect: () => {
            setActiveFloor(floor.id)
            focusRoom(room.id)
          },
        })
        for (const pin of room.pins) {
          result.push({
            id: `pin-${pin.id}`,
            kind: 'pin',
            title: pin.title || 'Untitled',
            subtitle: `${floor.name} · ${room.name}`,
            color: CATEGORY_COLOR[pin.category],
            onSelect: () => {
              setActiveFloor(floor.id)
              focusRoom(room.id)
              setSelection({ kind: 'pin', roomId: room.id, pinId: pin.id })
            },
          })
        }
      }
    }

    result.push(
      {
        id: 'cmd-toggle-grid',
        kind: 'command',
        title: 'Toggle grid',
        subtitle: 'Show or hide the blueprint grid',
        onSelect: toggleGrid,
      },
      {
        id: 'cmd-toggle-heatmap',
        kind: 'command',
        title: 'Toggle progress heatmap',
        subtitle: 'Shade rooms by % done',
        onSelect: toggleHeatmap,
      },
      {
        id: 'cmd-add-floor',
        kind: 'command',
        title: 'Add new floor',
        onSelect: addFloor,
      },
    )

    return result
  }, [floors, setActiveFloor, focusRoom, setSelection, toggleGrid, toggleHeatmap, addFloor])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? items.filter(
          (it) =>
            it.title.toLowerCase().includes(q) ||
            it.subtitle?.toLowerCase().includes(q),
        )
      : items
    return list.slice(0, 60)
  }, [items, query])

  useEffect(() => setIdx(0), [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIdx((i) => Math.min(matches.length - 1, i + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIdx((i) => Math.max(0, i - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = matches[idx]
        if (item) {
          item.onSelect()
          setOpen(false)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, matches, idx, setOpen])

  // Keep active row in view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLDivElement>(`[data-idx="${idx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-[12vh] flex w-[560px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-blueprint-line bg-white shadow-pop"
      >
        <div className="flex items-center gap-2 border-b border-blueprint-line/60 px-3 py-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms, todos, commands…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-auto scroll-thin">
          {matches.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">No matches</div>
          )}
          {matches.map((it, i) => (
            <div
              key={it.id}
              data-idx={i}
              onClick={() => {
                it.onSelect()
                setOpen(false)
              }}
              onMouseEnter={() => setIdx(i)}
              className={`flex cursor-pointer items-center gap-3 border-l-2 px-3 py-2 text-sm ${
                idx === i
                  ? 'border-blueprint-accent bg-blueprint-accent/5'
                  : 'border-transparent'
              }`}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold"
                style={{
                  backgroundColor:
                    it.kind === 'pin'
                      ? it.color
                      : it.kind === 'room'
                      ? '#e5e7eb'
                      : it.kind === 'floor'
                      ? '#dbeafe'
                      : '#fef3c7',
                  color: it.kind === 'pin' ? 'white' : '#374151',
                }}
              >
                {it.kind === 'pin' ? '📌' : it.kind === 'room' ? '▭' : it.kind === 'floor' ? '🏠' : '⌘'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-gray-800">{it.title}</div>
                {it.subtitle && (
                  <div className="truncate text-[11px] text-gray-500">{it.subtitle}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-blueprint-line/60 bg-gray-50/60 px-3 py-1.5 text-[10px] text-gray-500">
          <span>↑↓ to navigate · ↵ to select</span>
          <span>{matches.length} results</span>
        </div>
      </div>
    </div>
  )
}
