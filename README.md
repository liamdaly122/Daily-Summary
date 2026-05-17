# HouseDIY 🏠

A Miro-style floor plan + todo app for your home DIY projects. Sketch the rooms of your house on a 2D blueprint, pin todos directly inside each room, track budgets, and watch progress fill in as you tick things off.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 — your work is saved automatically in your browser's localStorage.

## What's in here

### Floor plan editor
- **Multi-floor support** — switch between Ground / First / Loft from the top-left panel; rename floors by double-clicking.
- **Draw rooms** — pick a room type from the bottom toolbar (kitchen, bathroom, bedroom, conservatory, corridor, staircase, garage…) then drag on the canvas.
- **Resize** — select a room and drag the corner handles. Everything snaps to the grid.
- **Pan / zoom** — scroll to zoom, drag with the pan tool (or hold space soon) to navigate the canvas.
- **Live dimensions & area** — each room labels itself with its dimensions in metres and floor area in m².

### Todo pins ("Miro stickies")
- **Double-click any room** to zoom in. The canvas re-centres on the room and switches to pin-adding mode.
- **Click anywhere inside the room** to drop a pin at that exact spot.
- **Each pin holds**: title, description, category (plumbing/electrical/paint/structural/decor/furniture/general), priority (low → urgent), estimated & actual cost, attached photos, and a done state.
- **Drag pins** to reposition them within the room.

### Visual feedback
- **Progress heatmap** — in the floor view, rooms shade red→green based on % of pins done.
- **Pin colour-coding** — pins inherit colour from their category; priority shows as a small dot on each card.
- **Per-room counters** — every room shows `✓ done / total` on the floor plan.

### Budget & filters
- **Sidebar summary** — total floor area, room count, todo progress, estimated vs actual spend rolled up across the floor.
- **Filters** — show only open todos, or filter by category / priority across the whole floor.

## Tech

- **Vite + React + TypeScript** — fast dev loop, no SSR overhead.
- **react-konva** — 2D canvas with pan/zoom/drag built in.
- **Zustand** — small, ergonomic state store.
- **Tailwind CSS** — for the Miro-ish UI chrome.
- **localStorage** — single-user persistence; all data stays on your device.

## Ideas worth adding next

- **Materials list / shopping list** auto-aggregated from pin descriptions.
- **Calendar view** — drag pins onto dates, schedule weekend tasks.
- **Layer toggles** — electrical / plumbing / paint as overlays.
- **Measurement tool** — click two points to get a distance.
- **Furniture shapes** — drag-in sofa / bed / fridge for layout planning.
- **PDF export** — annotated floor plan to share with a contractor.
- **Reference links on pins** — YouTube tutorials, Pinterest inspiration, IKEA URLs with thumbnails.
- **Multiplayer sync** — partner/contractor can edit live (Supabase / Convex).
- **Mobile companion** — take a photo in the room and have it land on the right pin.
