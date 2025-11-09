import { useState } from "react";

export default function Dashboard() {
    // Mock data state
    const [stormIntensity, setStormIntensity] = useState(0.5);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);

    const zones = [
        {
            id: "coastal",
            name: "Coastal Region",
            population: 15000,
            status: "OK",
            metrics: {
                latency: 52.0,
                download: 100.0,
                upload: 10.0,
                packetLoss: 0.20,
                predictedOutageRisk: 2.5
            }
        },
        {
            id: "mountain",
            name: "Mountain Valley",
            population: 8000,
            status: "Degrading",
            metrics: {
                latency: 80.0,
                download: 94.0,
                upload: 9.0,
                packetLoss: 1.00,
                predictedOutageRisk: 11.5
            }
        },
        {
            id: "urban",
            name: "Urban Center",
            population: 22000,
            status: "DEGRADED",
            metrics: {
                latency: 110.0,
                download: 81.0,
                upload: 8.0,
                packetLoss: 3.00,
                predictedOutageRisk: 35.8
            }
        }
    ];

    const intensityPct = Math.round(stormIntensity * 100);

    const getStatusColor = (status) => {
        const colors = {
            OK: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
            Degrading: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-amber-500/20" },
            DEGRADED: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", glow: "shadow-rose-500/20" },
            AT_RISK: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", glow: "shadow-rose-500/20" },
        };
        return colors[status] || { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", glow: "" };
    };

    const getIntensityColor = () => {
        if (intensityPct < 30) return { from: "#10b981", to: "#34d399", glow: "0 0 30px rgba(16, 185, 129, 0.4)" };
        if (intensityPct < 60) return { from: "#f59e0b", to: "#fbbf24", glow: "0 0 30px rgba(245, 158, 11, 0.4)" };
        return { from: "#ef4444", to: "#f87171", glow: "0 0 30px rgba(239, 68, 68, 0.4)" };
    };

    const intensityColor = getIntensityColor();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/30">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                    Disaster Response Grid
                                </h1>
                                <p className="text-slate-400 mt-2">Real-time network monitoring & storm impact analysis</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50">
                                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                                    <span className="text-sm font-medium">{isRunning ? 'Active' : 'Paused'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    {/* Storm Control Panel */}
                    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-100">Storm Intensity Control</h2>
                                        <p className="text-sm text-slate-400">Adjust simulation parameters</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{
                                        backgroundImage: `linear-gradient(135deg, ${intensityColor.from}, ${intensityColor.to})`
                                    }}>
                                        {intensityPct}%
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">Current Level</div>
                                </div>
                            </div>

                            {/* Slider */}
                            <div className="mb-8">
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={stormIntensity}
                                        onChange={(e) => setStormIntensity(parseFloat(e.target.value))}
                                        className="w-full h-3 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, ${intensityColor.from} 0%, ${intensityColor.to} ${intensityPct}%, rgb(30, 41, 59) ${intensityPct}%)`,
                                            boxShadow: intensityColor.glow
                                        }}
                                    />
                                    <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                      appearance: none;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: white;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 4px ${intensityColor.from}40;
                      cursor: pointer;
                      transition: all 0.2s;
                    }
                    input[type="range"]::-webkit-slider-thumb:hover {
                      transform: scale(1.1);
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: white;
                      border: none;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 4px ${intensityColor.from}40;
                      cursor: pointer;
                    }
                  `}</style>
                                </div>
                                <div className="flex justify-between mt-3 text-xs text-slate-500">
                                    <span>Calm</span>
                                    <span>Moderate</span>
                                    <span>Severe</span>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsRunning(true)}
                                    disabled={isRunning || isLoading}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                                >
                                    {isLoading ? 'Initializing...' : isRunning ? 'Running' : 'Start Simulation'}
                                </button>
                                <button
                                    onClick={() => setIsRunning(false)}
                                    className="px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all hover:-translate-y-0.5"
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Zone Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {zones.map((zone, idx) => {
                            const statusColors = getStatusColor(zone.status);
                            const selected = selectedZone === zone.id;

                            return (
                                <button
                                    key={zone.id}
                                    onClick={() => setSelectedZone(selected ? null : zone.id)}
                                    className={`relative group text-left bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden ${
                                        selected
                                            ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20 scale-105'
                                            : 'border-slate-700/50 hover:border-slate-600 hover:scale-102'
                                    }`}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-teal-500/5 transition-all duration-500" />

                                    <div className="relative p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-100 mb-1">{zone.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    {zone.population?.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors.bg} ${statusColors.border} ${statusColors.text} shadow-lg ${statusColors.glow}`}>
                                                {zone.status}
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="space-y-3">
                                            <MetricBar
                                                label="Latency"
                                                value={`${zone.metrics.latency.toFixed(0)}ms`}
                                                percent={(100 - Math.min(zone.metrics.latency / 2, 100))}
                                                color="from-emerald-500 to-teal-500"
                                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                            />
                                            <MetricBar
                                                label="Download"
                                                value={`${zone.metrics.download.toFixed(0)} Mbps`}
                                                percent={zone.metrics.download}
                                                color="from-blue-500 to-cyan-500"
                                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>}
                                            />
                                            <MetricBar
                                                label="Upload"
                                                value={`${zone.metrics.upload.toFixed(0)} Mbps`}
                                                percent={zone.metrics.upload * 10}
                                                color="from-purple-500 to-pink-500"
                                                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
                                            />

                                            {/* Risk Indicators */}
                                            <div className="pt-3 mt-3 border-t border-slate-700/50 space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400">Packet Loss</span>
                                                    <span className={`font-bold ${zone.metrics.packetLoss > 2 ? 'text-rose-400' : zone.metrics.packetLoss > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {zone.metrics.packetLoss.toFixed(2)}%
                          </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400">Outage Risk</span>
                                                    <span className={`font-bold ${zone.metrics.predictedOutageRisk > 30 ? 'text-rose-400' : zone.metrics.predictedOutageRisk > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {zone.metrics.predictedOutageRisk.toFixed(1)}%
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selection indicator */}
                                    {selected && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}

function MetricBar({ label, value, percent, color, icon }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="text-slate-300">{icon}</span>
                    {label}
                </div>
                <span className="text-sm font-bold text-slate-200">{value}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
                />
            </div>
        </div>
    );
}