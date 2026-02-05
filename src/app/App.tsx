import { CanvasViewport } from '../canvas/CanvasViewport'
import { AppHeader } from '../ui/AppHeader'

export function App() {
  return (
    <main className="app-shell">
      <section className="app-card">
        <AppHeader />
        <CanvasViewport />
      </section>
    </main>
  )
}
