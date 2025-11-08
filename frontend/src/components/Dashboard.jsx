import { useState } from 'react'
import ZoneCard from './ZoneCard'
import SimulationMap from './SimulationMap'
import DisasterControls from './DisasterControls'
import { useZoneData } from '../hooks/useZoneData'

export default function Dashboard() {
  const [selectedZone, setSelectedZone] = useState(null)
  const { zones, activeDisasters, isLoading, startSimulation, resetSimulation } = useZoneData()

  const handleZoneSelect = (zoneId) => {
    setSelectedZone(zoneId === selectedZone ? null : zoneId)
  }

  const handleSimulationStart = (disasterType) => {
    if (selectedZone) {
      startSimulation(selectedZone, disasterType)
    }
  }

  const handleReset = () => {
    if (selectedZone) {
      resetSimulation(selectedZone)
    }
  }

  const getSelectedZoneData = () => {
    return zones.find(zone => zone.id === selectedZone)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Disaster Response Simulation
          </h1>
          <p className="text-gray-600 text-lg">
            Simulate natural disasters and assess impact on zones
          </p>
        </header>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zones.map(zone => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              isSelected={selectedZone === zone.id}
              onSelect={handleZoneSelect}
              hasActiveDisaster={activeDisasters.some(d => d.zoneId === zone.id)}
            />
          ))}
        </div>

        {/* Controls Panel */}
        <DisasterControls
          selectedZone={selectedZone}
          selectedZoneData={getSelectedZoneData()}
          onSimulationStart={handleSimulationStart}
          onReset={handleReset}
          isLoading={isLoading}
        />

        {/* Main Simulation Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Simulation Map {selectedZone && `- ${selectedZone}`}
            </h2>
            {activeDisasters.some(d => d.zoneId === selectedZone) && (
              <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold animate-pulse">
                Simulation Active
              </span>
            )}
          </div>
          
          <SimulationMap
            zones={zones}
            selectedZone={selectedZone}
            activeDisasters={activeDisasters}
          />
        </div>
      </div>
    </div>
  )
}