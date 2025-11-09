import { useState } from "react";
import SimulationMap from "./SimulationMap";
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

    const selectedZoneData = zones.find((zone) => zone.id === selectedZone);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 font-sans">
            {/* HEADER */}
            <header className="py-10 border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        🌩️ Disaster Response Simulation
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Monitor network stability and simulate regional storm impact.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
                {/* --- Network Status Cards --- */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            onClick={() => handleZoneSelect(zone.id)}
                            className={`relative p-6 rounded-2xl bg-gray-900 border transition-all duration-300 cursor-pointer backdrop-blur-lg ${
                                selectedZone === zone.id
                                    ? "border-blue-500 shadow-[0_0_15px_#3b82f6a0]"
                                    : "border-gray-700 hover:border-gray-500"
                            }`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">{zone.name}</h2>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-bold ${
                                        zone.status === "OK"
                                            ? "bg-green-900/40 text-green-300 border border-green-800"
                                            : zone.status === "Degrading"
                                                ? "bg-yellow-900/40 text-yellow-300 border border-yellow-800"
                                                : "bg-red-900/40 text-red-300 border border-red-800"
                                    }`}
                                >
                  {zone.status || "OK"}
                </span>
                            </div>

                            <p className="text-gray-400 mb-3 text-sm">
                                Population: {zone.population?.toLocaleString() || "—"}
                            </p>

                            {zone.metrics ? (
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Latency</span>
                                        <span>{zone.metrics.latency.toFixed(1)} ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Download</span>
                                        <span>{zone.metrics.download.toFixed(1)} Mbps</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Upload</span>
                                        <span>{zone.metrics.upload.toFixed(1)} Mbps</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Packet Loss</span>
                                        <span>{zone.metrics.packetLoss.toFixed(2)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Outage Risk</span>
                                        <span>{zone.metrics.predictedOutageRisk.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-sm mt-3">
                                    Waiting for simulation data…
                                </p>
                            )}
                        </div>
                    ))}
                </section>

                {/* --- Simulation Map --- */}
                <section>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            Simulation Map
                        </h2>
                        <SimulationMap
                            zones={zones}
                            selectedZone={selectedZone}
                            onZoneSelect={handleZoneSelect}
                        />
                    </div>
                </section>

                {/* --- Storm Control Panel --- */}
                <section className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-white mb-6">
                        Storm Intensity Control
                    </h3>

                    <div className="space-y-8">
                        {/* Slider */}
                        <div>
                            <label className="block text-gray-300 font-medium mb-3">
                                Intensity: {(stormIntensity * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={stormIntensity}
                                onChange={(e) => setStormIntensity(parseFloat(e.target.value))}
                                className="w-full h-2 rounded-lg cursor-pointer bg-gray-700 accent-blue-500"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 ${
                                        stormIntensity * 100
                                    }%, #1f2937 ${stormIntensity * 100}%)`,
                                }}
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={startSimulation}
                                disabled={isRunning || isLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Starting..." : isRunning ? "Running..." : "Start Simulation"}
                            </button>
                            <button
                                onClick={stopSimulation}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
                            >
                                Stop
                            </button>
                        </div>
                    </div>
                </section>

                {/* --- Zone Detail (Optional Expanded View) --- */}
                {selectedZoneData && (
                    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold text-blue-400 mb-3">
                            Zone Details: {selectedZoneData.name}
                        </h3>
                        <p className="text-gray-300 mb-1">
                            Population: {selectedZoneData.population?.toLocaleString() || "—"}
                        </p>
                        <p className="text-gray-300 mb-1">
                            Status: <span className="font-bold text-white">{selectedZoneData.status}</span>
                        </p>
                        {selectedZoneData.metrics && (
                            <div className="mt-3 space-y-1 text-sm text-gray-400">
                                <p>Latency: {selectedZoneData.metrics.latency.toFixed(1)} ms</p>
                                <p>Download: {selectedZoneData.metrics.download.toFixed(1)} Mbps</p>
                                <p>Upload: {selectedZoneData.metrics.upload.toFixed(1)} Mbps</p>
                                <p>Packet Loss: {selectedZoneData.metrics.packetLoss.toFixed(2)}%</p>
                                <p>Predicted Risk: {selectedZoneData.metrics.predictedOutageRisk.toFixed(1)}%</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Error display (if any) */}
                {error && (
                    <div className="text-center text-red-400 font-semibold bg-red-900/30 border border-red-800 rounded-lg p-4 max-w-xl mx-auto">
                        ⚠️ {error}
                    </div>
                )}
            </main>
        </div>
    );
}
