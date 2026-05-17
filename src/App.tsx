import { BlueprintCanvas } from './components/Canvas/BlueprintCanvas'
import { Toolbar } from './components/Toolbar'
import { FloorSwitcher } from './components/FloorSwitcher'
import { Sidebar } from './components/Sidebar'
import { ZoomBadge } from './components/ZoomBadge'

export default function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-blueprint-bg">
      <BlueprintCanvas />
      <FloorSwitcher />
      <Sidebar />
      <Toolbar />
      <ZoomBadge />
      <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          HouseDIY
        </div>
      </div>
    </div>
  )
}
