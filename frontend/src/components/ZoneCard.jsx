export default function ZoneCard({ zone, isSelected, onSelect, hasActiveDisaster }) {
    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case 'high': return 'bg-red-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    const getRiskTextColor = (riskLevel) => {
        switch (riskLevel) {
            case 'high': return 'text-red-600'
            case 'medium': return 'text-yellow-600'
            case 'low': return 'text-green-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <div
            className={`
        relative p-6 rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer
        transform hover:scale-105 hover:shadow-xl
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-white bg-white'}
        ${hasActiveDisaster ? 'ring-4 ring-red-400 animate-pulse' : ''}
      `}
            onClick={() => onSelect(zone.id)}
        >
            {/* Risk indicator dot */}
            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${getRiskColor(zone.riskLevel)}`} />

            {/* Zone name + meta */}
            <h3 className="text-xl font-bold text-gray-800 mb-1">{zone.id}</h3>
            <p className="text-gray-600 text-sm mb-4">{zone.name}</p>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Population:</span>
                    <span className="font-semibold">{zone.population.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Infrastructure:</span>
                    <span className="font-semibold">{zone.infrastructure}%</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-semibold capitalize ${getRiskTextColor(zone.riskLevel)}`}>
            {zone.riskLevel}
          </span>
                </div>
            </div>

            {/* Live network metrics */}
            <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
                <h4 className="font-semibold text-gray-800 mb-2">Network Metrics</h4>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Latency:</span>
                        <span className="font-medium">{zone.metrics.latency} ms</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Download:</span>
                        <span className="font-medium">{zone.metrics.download} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Upload:</span>
                        <span className="font-medium">{zone.metrics.upload} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Packet Loss:</span>
                        <span className="font-medium">{zone.metrics.packetLoss} %</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Outage Risk:</span>
                        <span
                            className={`font-semibold ${
                                zone.metrics.predictedOutageRisk > 1
                                    ? 'text-red-600'
                                    : zone.metrics.predictedOutageRisk > 0.5
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                            }`}
                        >
              {zone.metrics.predictedOutageRisk}
            </span>
                    </div>
                </div>
            </div>

            {/* Active selection indicator */}
            {isSelected && (
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            )}
        </div>
    )
}
