import { useEffect, useRef } from 'react'
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

export const PinEditor = ({ roomId, pin }: Props) => {
  const updatePin = useStore((s) => s.updatePin)
  const removePin = useStore((s) => s.removePin)
  const togglePinDone = useStore((s) => s.togglePinDone)
  const titleRef = useRef<HTMLInputElement>(null)

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
    <div className="flex h-full flex-col gap-3 overflow-auto p-4 scroll-thin">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Todo pin
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePinDone(roomId, pin.id)}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              pin.done
                ? 'bg-emerald-500 text-white'
                : 'border border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {pin.done ? '✓ Done' : 'Mark done'}
          </button>
          <button
            onClick={() => removePin(roomId, pin.id)}
            title="Delete pin (or press Delete)"
            className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-500 hover:border-red-400 hover:bg-red-50"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <input
        ref={titleRef}
        value={pin.title}
        onChange={(e) => updatePin(roomId, pin.id, { title: e.target.value })}
        placeholder="Title"
        className="w-full rounded-lg border border-blueprint-line bg-white px-3 py-2 text-base font-semibold outline-none focus:border-blueprint-accent"
      />

      <textarea
        value={pin.description}
        onChange={(e) => updatePin(roomId, pin.id, { description: e.target.value })}
        placeholder="Notes, dimensions, materials…"
        rows={4}
        className="w-full resize-none rounded-lg border border-blueprint-line bg-white px-3 py-2 text-sm outline-none focus:border-blueprint-accent"
      />

      <div>
        <div className="mb-1 text-xs font-medium text-gray-500">Category</div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => updatePin(roomId, pin.id, { category: c })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                pin.category === c
                  ? 'text-white shadow-card'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={{ backgroundColor: pin.category === c ? CATEGORY_COLOR[c] : undefined }}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-gray-500">Priority</div>
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => updatePin(roomId, pin.id, { priority: p })}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${
                pin.priority === p
                  ? 'text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
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
          <div className="mb-1 text-xs font-medium text-gray-500">Est. cost</div>
          <div className="flex items-center rounded-lg border border-blueprint-line bg-white px-2 focus-within:border-blueprint-accent">
            <span className="text-sm text-gray-400">£</span>
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
          <div className="mb-1 text-xs font-medium text-gray-500">Actual cost</div>
          <div className="flex items-center rounded-lg border border-blueprint-line bg-white px-2 focus-within:border-blueprint-accent">
            <span className="text-sm text-gray-400">£</span>
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
        <div className="mb-1 flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500">
            Photos ({pin.photos.length})
          </div>
          <label className="cursor-pointer text-xs font-medium text-blueprint-accent hover:underline">
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
                  alt={`photo ${i + 1}`}
                  className="h-24 w-full rounded-lg object-cover"
                />
                <button
                  onClick={() =>
                    updatePin(roomId, pin.id, {
                      photos: pin.photos.filter((_, j) => j !== i),
                    })
                  }
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-blueprint-line p-4 text-center text-xs text-gray-400">
            Snap a "before" photo to attach
          </div>
        )}
      </div>

      <div className="mt-auto pt-2 text-[10px] text-gray-400">
        Created {new Date(pin.createdAt).toLocaleDateString()} · Updated{' '}
        {new Date(pin.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
