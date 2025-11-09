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

    // Get selected zone details
    const selectedZoneData = zones.find(zone => zone.id === selectedZone);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="py-8 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
                        Disaster Response Simulation
                    </h1>
                    <p className="text-gray-600 text-center text-lg">
                        Simulate natural disasters and assess impact on underserved communities
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* --- Three Zone Cards in a row --- */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {zones.map((zone) => (
                        <div key={zone.id} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-blue-900 mb-2">Area {zone.name}</h2>
                            <p className="text-blue-800 font-semibold mb-1">Population: {zone.population?.toLocaleString() || "—"}</p>
                            <p className="text-blue-600 text-sm">Template - More info here</p>
                        </div>
                    ))}
                </section>

                {/* --- Simulation Map Section --- */}
                <section className="mb-12">
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Simulation Map</h2>
                        <p className="text-gray-600 text-center mb-8">Select an area to begin simulation</p>
                        
                        <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg h-96 flex items-center justify-center">
                            <SimulationMap 
                                zones={zones}
                                selectedZone={selectedZone}
                                onZoneSelect={handleZoneSelect}
                            />
                        </div>
                    </div>
                </section>

                {/* --- Storm Controls Section --- */}
                <section className="bg-white border-2 border-gray-300 rounded-lg p-8 max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Storm Simulation Controls</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-3 text-lg">
                                Storm Intensity Level
                            </label>
                            <select 
                                className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                                value={stormIntensity}
                                onChange={(e) => setStormIntensity(e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="catastrophic">Catastrophic</option>
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={startSimulation}
                                disabled={isRunning}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                            >
                                Start Simulation
                            </button>
                            <button 
                                onClick={stopSimulation}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
