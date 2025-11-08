export default function DisasterControls({ 
  selectedZone, 
  selectedZoneData, 
  onSimulationStart, 
  onReset, 
  isLoading 
}) {
  const disasterTypes = [
    { id: 'hurricane', name: 'Hurricane', icon: '🌪️', color: 'blue' },
    { id: 'earthquake', name: 'Earthquake', icon: '🌋', color: 'orange' },
    { id: 'flood', name: 'Flood', icon: '🌊', color: 'cyan' },
    { id: 'wildfire', name: 'Wildfire', icon: '🔥', color: 'red' }
  ];

  const getColorClass = (color, type = 'bg') => {
    const classes = {
      blue: type === 'bg' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-blue-500',
      orange: type === 'bg' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 'bg-orange-500',
      cyan: type === 'bg' ? 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200' : 'bg-cyan-500',
      red: type === 'bg' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-red-500'
    };
    return classes[color] || classes.blue;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Disaster Simulation Controls
        {selectedZoneData && (
          <span className="text-blue-600 ml-2">- {selectedZoneData.name}</span>
        )}
      </h3>
      
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Disaster Type Selection */}
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Disaster Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {disasterTypes.map(disaster => (
              <button
                key={disaster.id}
                onClick={() => onSimulationStart(disaster.id)}
                disabled={!selectedZone || isLoading}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium
                  transform hover:scale-105 disabled:transform-none
                  ${!selectedZone || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : getColorClass(disaster.color)
                  }
                  ${isLoading ? 'animate-pulse' : ''}
                `}
              >
                <span className="text-xl">{disaster.icon}</span>
                <span>{disaster.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            disabled={!selectedZone || isLoading}
            className={`
              px-6 py-3 rounded-lg transition-colors font-medium
              ${!selectedZone || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
              }
            `}
          >
            Reset Simulation
          </button>
        </div>
      </div>

      {!selectedZone && (
        <p className="text-orange-600 text-sm mt-3 flex items-center gap-2">
          ⚠️ Please select a zone first to start simulation
        </p>
      )}

      {isLoading && (
        <p className="text-blue-600 text-sm mt-3 flex items-center gap-2">
          🌀 Starting simulation...
        </p>
      )}
    </div>
  )
}