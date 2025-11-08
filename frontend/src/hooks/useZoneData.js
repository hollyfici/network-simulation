import { useState, useEffect } from 'react'
import { zoneApi } from '../api/zoneApi'

export function useZoneData() {
  const [zones, setZones] = useState([])
  const [activeDisasters, setActiveDisasters] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadZones()
  }, [])

  const loadZones = async () => {
    try {
      setIsLoading(true)
      // For now, use mock data. Replace with actual API call later
      const mockZones = [
        {
          id: 'Zone A',
          name: 'Coastal Region',
          population: 15000,
          infrastructure: 65,
          riskLevel: 'high',
          coordinates: { top: '20%', left: '30%', width: '25%', height: '30%' }
        },
        {
          id: 'Zone B',
          name: 'Mountain Valley',
          population: 8000,
          infrastructure: 40,
          riskLevel: 'medium',
          coordinates: { top: '50%', left: '60%', width: '20%', height: '25%' }
        },
        {
          id: 'Zone C',
          name: 'Urban Center',
          population: 22000,
          infrastructure: 80,
          riskLevel: 'low',
          coordinates: { top: '35%', left: '15%', width: '22%', height: '28%' }
        }
      ]
      setZones(mockZones)
    } catch (err) {
      setError('Failed to load zones data')
    } finally {
      setIsLoading(false)
    }
  }

  const startSimulation = async (zoneId, disasterType) => {
    try {
      setIsLoading(true)
      const newDisaster = {
        id: Date.now(),
        zoneId,
        type: disasterType,
        intensity: Math.floor(Math.random() * 100),
        startTime: new Date(),
        progress: 0
      }
      
      setActiveDisasters(prev => [...prev, newDisaster])
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (err) {
      setError(`Failed to start ${disasterType} simulation`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetSimulation = async (zoneId) => {
    setActiveDisasters(prev => 
      prev.filter(disaster => disaster.zoneId !== zoneId)
    )
  }

  const clearError = () => setError(null)

  return {
    zones,
    activeDisasters,
    isLoading,
    error,
    startSimulation,
    resetSimulation,
    clearError
  }
}