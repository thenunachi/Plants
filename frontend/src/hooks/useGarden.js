import { useState, useCallback } from 'react'

const STORAGE_KEY = 'plantwise_garden'

const STAGES = ['planning', 'sown', 'germinated', 'transplanted', 'fruiting', 'harvested']
export { STAGES }

// Days between waterings per water_needs level
const WATER_DAYS = { Low: 7, Moderate: 3, High: 1 }

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useGarden() {
  const [entries, setEntries] = useState(load)

  const addPlant = useCallback((plant, stage = 'planning', notes = '') => {
    setEntries(prev => {
      if (prev.find(e => e.plantId === plant.id)) return prev
      const next = [
        ...prev,
        {
          plantId: plant.id,
          plantName: plant.name,
          emoji: plant.emoji,
          category: plant.category,
          stage,
          dateStarted: new Date().toISOString().slice(0, 10),
          notes,
          fruit_bearing_weeks_max: plant.fruit_bearing_weeks_max,
          temp_min: plant.temp_min,
          water_needs: plant.water_needs,
          lastWatered: null,
          journal: [],
        },
      ]
      save(next)
      return next
    })
  }, [])

  const removePlant = useCallback((plantId) => {
    setEntries(prev => {
      const next = prev.filter(e => e.plantId !== plantId)
      save(next)
      return next
    })
  }, [])

  const updateStage = useCallback((plantId, stage) => {
    setEntries(prev => {
      const next = prev.map(e => e.plantId === plantId ? { ...e, stage } : e)
      save(next)
      return next
    })
  }, [])

  const updateNotes = useCallback((plantId, notes) => {
    setEntries(prev => {
      const next = prev.map(e => e.plantId === plantId ? { ...e, notes } : e)
      save(next)
      return next
    })
  }, [])

  const markWatered = useCallback((plantId) => {
    setEntries(prev => {
      const next = prev.map(e =>
        e.plantId === plantId
          ? { ...e, lastWatered: new Date().toISOString().slice(0, 10) }
          : e
      )
      save(next)
      return next
    })
  }, [])

  const addJournalEntry = useCallback((plantId, text) => {
    setEntries(prev => {
      const next = prev.map(e =>
        e.plantId === plantId
          ? { ...e, journal: [...(e.journal || []), { date: new Date().toISOString().slice(0, 10), text }] }
          : e
      )
      save(next)
      return next
    })
  }, [])

  const isInGarden = useCallback((plantId) => {
    return entries.some(e => e.plantId === plantId)
  }, [entries])

  return { entries, addPlant, removePlant, updateStage, updateNotes, markWatered, addJournalEntry, isInGarden }
}

// Estimate harvest date from dateStarted + fruit_bearing_weeks_max
export function estimateHarvest(entry) {
  if (!entry.dateStarted || !entry.fruit_bearing_weeks_max) return null
  const d = new Date(entry.dateStarted)
  d.setDate(d.getDate() + entry.fruit_bearing_weeks_max * 7)
  return d
}

// Days until harvest (negative = overdue)
export function daysUntilHarvest(entry) {
  const h = estimateHarvest(entry)
  if (!h) return null
  return Math.round((h - new Date()) / (1000 * 60 * 60 * 24))
}

// Watering status based on water_needs frequency + lastWatered date
export function getWateringStatus(entry) {
  const freq = WATER_DAYS[entry.water_needs]
  if (!freq) return null
  if (!entry.lastWatered) return { label: 'Not watered yet', urgent: true }
  const daysSince = Math.floor((new Date() - new Date(entry.lastWatered)) / (1000 * 60 * 60 * 24))
  const daysLeft = freq - daysSince
  if (daysLeft <= 0) return { label: `Overdue by ${Math.abs(daysLeft)}d`, urgent: true }
  if (daysLeft <= 1) return { label: 'Water today', urgent: true }
  return { label: `Water in ${daysLeft}d`, urgent: false }
}
