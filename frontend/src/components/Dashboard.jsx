import { useState } from "react";
import ZoneCard from "./ZoneCard";
import SimulationMap from "./SimulationMap";
import DisasterControls from "./DisasterControls";
import { useZoneData } from "../hooks/useZoneData";

export default function Dashboard() {
    const [selectedZone, setSelectedZone] = useState(null);

    const {
        zones,
        stormIntensity,
        setStormIntensity,
        isRunning,
        isLoading,
        error,
        startSimulation,
        stopSimulation,
    } = useZoneData();

    const handleZoneSelect = (zoneId) => {
        setSelectedZone(zoneId === selectedZone ? null : zoneId);
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Disaster Response Simulation
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Simulate natural disasters and assess impact on network resilience
                    </p>
                </header>

                {/* 🌩 Storm Control Panel */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Global Storm Intensity
                    </h2>

                    <label className="block text-gray-700 mb-2 font-medium">
                        Set Intensity
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={stormIntensity}
                        onChange={(e) => setStormIntensity(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                        disabled={isRunning}
                    />

                    <p className="text-sm text-gray-600 mb-4">
                        Current intensity:{" "}
                        <strong>
                            {stormIntensity.toFixed(2)}{" "}
                            ({stormIntensity < 0.3
                            ? "Calm"
                            : stormIntensity < 0.7
                                ? "Moderate"
                                : "Severe"})
                        </strong>
                    </p>

                    <div className="flex gap-3">
                        {!isRunning ? (
                            <button
                                onClick={startSimulation}
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? "Starting..." : "Start Simulation"}
                            </button>
                        ) : (
                            <button
                                onClick={stopSimulation}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Stop Simulation
                            </button>
                        )}
                    </div>

                    {error && <p className="text-red-600 mt-3">{error}</p>}
                </div>

                {/* Zones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {zones.map((zone) => (
                        <ZoneCard
                            key={zone.id}
                            zone={zone}
                            isSelected={selectedZone === zone.id}
                            onSelect={handleZoneSelect}
                            hasActiveDisaster={isRunning}
                        />
                    ))}
                </div>

                {/* Controls Panel */}
                <DisasterControls
                    selectedZone={selectedZone}
                    selectedZoneData={zones.find((z) => z.id === selectedZone)}
                    onSimulationStart={() => startSimulation()}
                    onReset={stopSimulation}
                    isLoading={isLoading}
                />

                {/* Main Simulation Area */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Simulation Map {selectedZone && `- ${selectedZone}`}
                        </h2>
                        {isRunning && (
                            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold animate-pulse">
                Simulation Active
              </span>
                        )}
                    </div>

                    <SimulationMap
                        zones={zones}
                        selectedZone={selectedZone}
                        activeDisasters={isRunning ? [{ zoneId: selectedZone }] : []}
                    />
                </div>
            </div>
        </div>
    );
}
