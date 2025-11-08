import { useEffect, useState } from 'react'

export default function SimulationMap({ zones, selectedZone, activeDisasters }) {
  const [disasterEffects, setDisasterEffects] = useState([])

  useEffect(() => {
    const newEffects = activeDisasters.map(disaster => {
      const zone = zones.find(z => z.id === disaster.zoneId)
      return {
        id: disaster.id,
        type: disaster.type,
        zoneId: disaster.zoneId,
        coordinates: zone?.coordinates,
        progress: disaster.progress || 0
      }
    })
    setDisasterEffects(newEffects)
  }, [activeDisasters, zones])

  const getDisasterColor = (type) => {
    switch (type) {
      case 'hurricane': return 'from-blue-400 to-blue-700';
      case 'earthquake': return 'from-yellow-400 to-orange-600';
      case 'flood': return 'from-cyan-400 to-blue-600';
      case 'wildfire': return 'from-red-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getDisasterIcon = (type) => {
    switch (type) {
      case 'hurricane': return '🌪️';
      case 'earthquake': return '🌋';
      case 'flood': return '🌊';
      case 'wildfire': return '🔥';
      default: return '⚠️';
    }
  };

  return (
    <div className="relative w-full h-96 rounded-xl border-2 border-gray-300 overflow-hidden shadow-lg">
      {/* Map Background Image */}
      <img 
        src="/images/map-background.jpg" 
        alt="Regional Disaster Map"
        className="w-full h-full object-cover"
      />
      
      {/* Dark Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      {/* Grid Overlay (Subtle) */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20" />
      
      {/* Zone Boundaries */}
      {zones.map(zone => {
        const hasActiveDisaster = activeDisasters.some(d => d.zoneId === zone.id)
        return (
          <div
            key={zone.id}
            className={`absolute border-2 rounded-lg transition-all duration-300 backdrop-blur-sm ${
              selectedZone === zone.id 
                ? 'border-blue-500 bg-blue-500 bg-opacity-20 shadow-lg shadow-blue-500/50' 
                : 'border-gray-300 bg-white bg-opacity-10'
            } ${hasActiveDisaster ? 'animate-pulse' : ''}`}
            style={zone.coordinates}
          >
            <span className="absolute -top-8 left-2 text-sm font-bold text-white bg-gray-800 bg-opacity-80 px-3 py-1 rounded-full border border-white border-opacity-30 shadow-lg">
              {zone.id}
            </span>
          </div>
        )
      })}
      
      {/* Disaster Effects */}
      {disasterEffects.map(effect => (
        <div
          key={effect.id}
          className={`absolute rounded-lg bg-gradient-to-r ${getDisasterColor(effect.type)} opacity-60 animate-pulse border-2 border-white border-opacity-50`}
          style={effect.coordinates}
        >
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-3xl drop-shadow-lg">
            {getDisasterIcon(effect.type)}
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
            {effect.progress}%
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-2 text-sm">Disaster Types</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-700 rounded" />
            <span className="font-medium text-gray-700">Hurricane</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-600 rounded" />
            <span className="font-medium text-gray-700">Earthquake</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-600 rounded" />
            <span className="font-medium text-gray-700">Flood</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-orange-600 rounded" />
            <span className="font-medium text-gray-700">Wildfire</span>
          </div>
        </div>
      </div>

      {/* Map Scale */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded text-xs text-gray-700 font-medium border">
        Scale: 1:250,000
      </div>

      {/* Instructions */}
      {!selectedZone && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-2xl border text-center max-w-md">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Zone</h3>
            <p className="text-gray-600">
              Click on any zone card above to start a disaster simulation and see its impact on the map.
            </p>
          </div>
        </div>
      )}

      {/* Active Simulation Indicator */}
      {activeDisasters.length > 0 && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg">
          🚨 {activeDisasters.length} Active Disaster{activeDisasters.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}