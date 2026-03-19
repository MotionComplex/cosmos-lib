import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Observatory } from './views/Observatory'
import { SkyMapView } from './views/SkyMapView'
import { SolarSystem } from './views/SolarSystem'
import { Catalog } from './views/Catalog'
import { MoonView } from './views/MoonView'
import { EclipseView } from './views/EclipseView'
import { ObjectDetail } from './views/ObjectDetail'
import { useObserver } from './hooks/useObserver'
import { createContext, useContext, Component } from 'react'
import type { ObserverParams } from 'cosmos-lib'
import type { ReactNode } from 'react'

interface ObserverCtx {
  observer: ObserverParams
  setObserver: (u: Partial<ObserverParams>) => void
}

export const ObserverContext = createContext<ObserverCtx>({
  observer: { lat: 51.47, lng: 0, date: new Date() },
  setObserver: () => {},
})

export const useObserverCtx = () => useContext(ObserverContext)

// Error boundary to catch and display runtime errors
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#f88', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', maxWidth: '100%', overflow: 'auto' }}>
          <h2 style={{ marginBottom: 16, color: '#f66' }}>Runtime Error</h2>
          <p>{this.state.error.message}</p>
          <pre style={{ marginTop: 12, opacity: 0.6, fontSize: 11 }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export function App() {
  const { observer, setObserver } = useObserver()

  return (
    <ObserverContext.Provider value={{ observer, setObserver }}>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          marginLeft: 'var(--sidebar-w)',
          padding: '24px 40px',
          maxWidth: '100%',
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100vh',
        }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Observatory />} />
              <Route path="/skymap" element={<SkyMapView />} />
              <Route path="/solar-system" element={<SolarSystem />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/moon" element={<MoonView />} />
              <Route path="/eclipses" element={<EclipseView />} />
              <Route path="/object/:id" element={<ObjectDetail />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </ObserverContext.Provider>
  )
}
