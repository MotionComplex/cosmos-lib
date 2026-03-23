import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Home } from './views/Home'
import { CosmicRays } from './views/CosmicRays'
import { DataCompression } from './views/DataCompression'
import { DirectImaging } from './views/DirectImaging'

export function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cosmic-rays" element={<CosmicRays />} />
          <Route path="/compression" element={<DataCompression />} />
          <Route path="/direct-imaging" element={<DirectImaging />} />
        </Routes>
      </main>
    </div>
  )
}
