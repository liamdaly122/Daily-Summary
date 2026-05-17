import { useEffect, useRef, useState } from 'react'
import type { Pin, Category, Priority } from '../store/types'
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
} from '../lib/constants'
import { useStore } from '../store/useStore'

interface Props {
  roomId: string
  pin: Pin
}

const CATEGORIES: Category[] = [
  'general',
  'plumbing',
  'electrical',
  'paint',
  'structural',
  'decor',
  'furniture',
]
const PRIORITIES: Priority[] = ['low', 'med', 'high', 'urgent']

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
    {children}
  </div>
)

export const PinEditor = ({ roomId, pin }: Props) => {
  const updatePin = useStore((s) => s.updatePin)
  const removePin = useStore((s) => s.removePin)
  const togglePinDone = useStore((s) => s.togglePinDone)
  const addSubtask = useStore((s) => s.addSubtask)
  const updateSubtask = useStore((s) => s.updateSubtask)
  const removeSubtask = useStore((s) => s.removeSubtask)
  const addLink = useStore((s) => s.addLink)
  const removeLink = useStore((s) => s.removeLink)
  const titleRef = useRef<HTMLInputElement>(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [newLink, setNewLink] = useState('')

  const subtasks = pin.subtasks ?? []
  const links = pin.links ?? []
  const subtasksDone = subtasks.filter((s) => s.done).length

  useEffect(() => {
    if (pin.title === 'New todo') titleRef.current?.select()
  }, [pin.id])

  const onFile = async (files: FileList | null) => {
    if (!files) return
    const photos = [...pin.photos]
    for (const file of Array.from(files).slice(0, 4)) {
      const reader = new FileReader()
      const url = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      photos.push(url)
    }
    updatePin(roomId, pin.id, { photos })
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto px-4 py-3 scroll-thin">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => togglePinDone(roomId, pin.id)}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
            pin.done
              ? 'bg-emerald-500 text-white'
              : 'border border-canvas-line text-ink-muted hover:border-ink-faint hover:text-ink'
          }`}
        >
          {pin.done ? '✓ Done' : 'Mark done'}
        </button>
        <div className="ml-auto" />
        <button
          onClick={() => removePin(roomId, pin.id)}
          title="Delete pin (Delete key)"
          className="btn btn-danger"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
          </svg>
          Delete
        </button>
      </div>

      <input
        ref={titleRef}
        value={pin.title}
        onChange={(e) => updatePin(roomId, pin.id, { title: e.target.value })}
        placeholder="Title"
        className="w-full rounded-lg border border-canvas-line bg-white px-3 py-2 text-[15px] font-semibold outline-none transition-colors focus:border-accent focus:shadow-ring"
      />

      <textarea
        value={pin.description}
        onChange={(e) => updatePin(roomId, pin.id, { description: e.target.value })}
        placeholder="Notes, dimensions, materials…"
        rows={3}
        className="w-full resize-none rounded-lg border border-canvas-line bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:shadow-ring"
      />

      <div>
        <SectionLabel>Category</SectionLabel>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => updatePin(roomId, pin.id, { category: c })}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                pin.category === c
                  ? 'text-white shadow-soft'
                  : 'border border-canvas-line text-ink-muted hover:border-ink-faint'
              }`}
              style={{ backgroundColor: pin.category === c ? CATEGORY_COLOR[c] : undefined }}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Priority</SectionLabel>
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => updatePin(roomId, pin.id, { priority: p })}
              className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all ${
                pin.priority === p
                  ? 'text-white'
                  : 'border-canvas-line bg-white text-ink-muted hover:border-ink-faint'
              }`}
              style={{
                backgroundColor: pin.priority === p ? PRIORITY_COLOR[p] : undefined,
                borderColor: pin.priority === p ? PRIORITY_COLOR[p] : undefined,
              }}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <SectionLabel>Est. cost</SectionLabel>
          <div className="flex items-center rounded-lg border border-canvas-line bg-white px-2 focus-within:border-accent focus-within:shadow-ring">
            <span className="text-sm text-ink-faint">£</span>
            <input
              type="number"
              min={0}
              value={pin.estimatedCost || ''}
              onChange={(e) =>
                updatePin(roomId, pin.id, { estimatedCost: Number(e.target.value) || 0 })
              }
              className="w-full bg-transparent px-1 py-1.5 text-sm outline-none"
            />
          </div>
        </label>
        <label className="block">
          <SectionLabel>Actual cost</SectionLabel>
          <div className="flex items-center rounded-lg border border-canvas-line bg-white px-2 focus-within:border-accent focus-within:shadow-ring">
            <span className="text-sm text-ink-faint">£</span>
            <input
              type="number"
              min={0}
              value={pin.actualCost || ''}
              onChange={(e) =>
                updatePin(roomId, pin.id, { actualCost: Number(e.target.value) || 0 })
              }
              className="w-full bg-transparent px-1 py-1.5 text-sm outline-none"
            />
          </div>
        </label>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <SectionLabel>
            Subtasks {subtasks.length > 0 && `· ${subtasksDone}/${subtasks.length}`}
          </SectionLabel>
          {subtasks.length > 0 && (
            <div className="h-1 w-16 overflow-hidden rounded-full bg-canvas-hairline">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(subtasksDone / subtasks.length) * 100}%` }}
              />
            </div>
          )}
        </div>
        {subtasks.length > 0 && (
          <div className="mb-1.5 flex flex-col">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-canvas-hairline"
              >
                <input
                  type="checkbox"
                  checked={st.done}
                  onChange={(e) =>
                    updateSubtask(roomId, pin.id, st.id, { done: e.target.checked })
                  }
                />
                <input
                  value={st.title}
                  onChange={(e) =>
                    updateSubtask(roomId, pin.id, st.id, { title: e.target.value })
                  }
                  className={`flex-1 bg-transparent text-[13px] outline-none ${
                    st.done ? 'text-ink-faint line-through' : 'text-ink'
                  }`}
                />
                <button
                  onClick={() => removeSubtask(roomId, pin.id, st.id)}
                  className="rounded p-0.5 text-ink-faint opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Delete step"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addSubtask(roomId, pin.id, newSubtask)
            setNewSubtask('')
          }}
        >
          <input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="+ Add step"
            className="w-full rounded-md border border-canvas-line bg-white px-2 py-1.5 text-[13px] outline-none focus:border-accent focus:shadow-ring"
          />
        </form>
      </div>

      <div>
        <SectionLabel>
          References {links.length > 0 && `· ${links.length}`}
        </SectionLabel>
        {links.length > 0 && (
          <div className="mb-1.5 flex flex-col gap-1">
            {links.map((l) => {
              let host = ''
              try {
                host = new URL(l.url).hostname.replace('www.', '')
              } catch {
                host = l.url
              }
              return (
                <div
                  key={l.id}
                  className="group flex items-center gap-2 rounded-md border border-canvas-line bg-white px-2 py-1.5 text-[13px] hover:border-accent"
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`}
                    alt={`${host} favicon`}
                    width={16}
                    height={16}
                    className="rounded-sm"
                  />
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-ink hover:text-accent"
                  >
                    {l.title || host}
                  </a>
                  <button
                    onClick={() => removeLink(roomId, pin.id, l.id)}
                    className="rounded p-0.5 text-ink-faint opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="Remove link"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 6l12 12M6 18L18 6" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addLink(roomId, pin.id, newLink)
            setNewLink('')
          }}
        >
          <input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Paste a YouTube / Pinterest / IKEA link"
            className="w-full rounded-md border border-canvas-line bg-white px-2 py-1.5 text-[13px] outline-none focus:border-accent focus:shadow-ring"
          />
        </form>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <SectionLabel>Photos {pin.photos.length > 0 && `· ${pin.photos.length}`}</SectionLabel>
          <label className="cursor-pointer text-[11px] font-semibold text-accent hover:underline">
            + Add
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onFile(e.target.files)}
            />
          </label>
        </div>
        {pin.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {pin.photos.map((src, i) => (
              <div key={i} className="group relative">
                <img
                  src={src}
                  alt={`Pin photo ${i + 1}`}
                  className="h-24 w-full rounded-lg object-cover ring-1 ring-canvas-line"
                />
                <button
                  onClick={() =>
                    updatePin(roomId, pin.id, {
                      photos: pin.photos.filter((_, j) => j !== i),
                    })
                  }
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-xs text-white group-hover:flex"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-canvas-line p-4 text-center text-[11px] text-ink-faint">
            Drop a “before” photo here later
          </div>
        )}
      </div>

      <div className="mt-auto pt-1 text-[10px] text-ink-faint">
        Created {new Date(pin.createdAt).toLocaleDateString()} · Updated{' '}
        {new Date(pin.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
