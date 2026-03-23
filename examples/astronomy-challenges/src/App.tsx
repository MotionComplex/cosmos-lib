import { Routes, Route, NavLink } from 'react-router-dom'
import { Home } from './views/Home'
import { CosmicRays } from './views/CosmicRays'
import { DataCompression } from './views/DataCompression'
import { DirectImaging } from './views/DirectImaging'

export function App() {
  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Grand Challenges</h1>
          <p className="logo-sub">Astronomy's Unsolved Mysteries</p>
        </div>
        <ul className="nav-links">
          <li><NavLink to="/" end>Overview</NavLink></li>
          <li><NavLink to="/cosmic-rays">Cosmic Ray Origins</NavLink></li>
          <li><NavLink to="/compression">Neural Compression</NavLink></li>
          <li><NavLink to="/direct-imaging">Direct Imaging</NavLink></li>
        </ul>
        <div className="sidebar-footer">
          <p>Powered by <code>cosmos-lib</code></p>
        </div>
      </nav>
      <main className="content">
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
