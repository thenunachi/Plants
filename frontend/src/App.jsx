import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Plants from './pages/Plants'
import Regions from './pages/Regions'
import PlantDetail from './pages/PlantDetail'
import RegionDetail from './pages/RegionDetail'
import MapExplorer from './pages/MapExplorer'
import MyGarden from './pages/MyGarden'
import PlantingCalendar from './pages/PlantingCalendar'
import { GardenProvider } from './context/GardenContext'

export default function App() {
  return (
    <GardenProvider>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/plants/:id" element={<PlantDetail />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/regions/:id" element={<RegionDetail />} />
            <Route path="/map" element={<MapExplorer />} />
            <Route path="/garden" element={<MyGarden />} />
            <Route path="/calendar" element={<PlantingCalendar />} />
          </Routes>
        </main>
      </div>
    </GardenProvider>
  )
}
