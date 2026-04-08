import { createContext, useContext } from 'react'
import { useGarden } from '../hooks/useGarden'

const GardenContext = createContext(null)

export function GardenProvider({ children }) {
  const garden = useGarden()
  return <GardenContext.Provider value={garden}>{children}</GardenContext.Provider>
}

export function useGardenContext() {
  return useContext(GardenContext)
}

