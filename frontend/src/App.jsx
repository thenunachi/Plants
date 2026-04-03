import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Plants from './pages/Plants'
import Regions from './pages/Regions'
import PlantDetail from './pages/PlantDetail'
import RegionDetail from './pages/RegionDetail'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/plants/:id" element={<PlantDetail />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/regions/:id" element={<RegionDetail />} />
        </Routes>
      </main>
    </div>
  )
}
