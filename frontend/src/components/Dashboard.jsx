import { useState, useEffect, useMemo } from "react";

const API_BASE = "http://localhost:3000";

// Rain Effect Component
function RainEffect({ intensity, isRunning }) {
    const raindrops = useMemo(() => {
        if (!isRunning || intensity < 5) return [];

        // More raindrops = more intense storm
        const dropCount = Math.floor((intensity / 100) * 150);

        return Array.from({ length: dropCount }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDuration: 0.5 + Math.random() * 0.5 - (intensity / 200), // Faster rain when more intense
            animationDelay: Math.random() * 2,
            opacity: 0.1 + (intensity / 100) * 0.4,
            width: intensity > 70 ? 2 : 1, // Thicker rain when intense
        }));
    }, [intensity, isRunning]);

    if (!isRunning || intensity < 5) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
            {raindrops.map((drop) => (
                <div
                    key={drop.id}
                    className="absolute top-0 bg-gradient-to-b from-cyan-200/40 to-blue-400/60"
                    style={{
                        left: `${drop.left}%`,
                        width: `${drop.width}px`,
                        height: intensity > 70 ? '40px' : intensity > 40 ? '30px' : '20px',
                        opacity: drop.opacity,
                        animation: `rainfall ${drop.animationDuration}s linear infinite`,
                        animationDelay: `${drop.animationDelay}s`,
                    }}
                />
            ))}
            <style>{`
        @keyframes rainfall {
          0% {
            transform: translateY(-100px);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
        </div>
    );
}

export default function Dashboard() {
    const [stormIntensity, setStormIntensity] = useState(0.5);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);
    const [zones, setZones] = useState([]);
    const [stormData, setStormData] = useState(null);
    const [networkOverview, setNetworkOverview] = useState(null);
    const [error, setError] = useState(null);
    const [computationLogs, setComputationLogs] = useState([]);
    const [showTerminal, setShowTerminal] = useState(true);

    // Fetch zone data from backend
    const fetchZoneStatus = async () => {
        try {
            const response = await fetch(`${API_BASE}/zones/status`);
            if (!response.ok) throw new Error("Failed to fetch zone status");
            const data = await response.json();

            // Generate computation logs
            if (isRunning && data.storm) {
                const timestamp = new Date().toLocaleTimeString();
                const logs = [
                    `[${timestamp}] Storm Evolution: Category ${data.storm.category}, Wind ${data.storm.windSpeed}mph`,
                    `[${timestamp}] Barometric Pressure: ${data.storm.pressure}mb, Trend: ${data.storm.trend}`,
                    `[${timestamp}] Rainfall Rate: ${data.storm.rainfall} in/hr, Storm Surge: ${data.storm.stormSurge}ft`,
                ];

                data.zones.forEach(z => {
                    const pressure = Math.round(data.storm.windSpeed * 0.00256 * 100) / 100;
                    logs.push(`[${timestamp}] ${z.displayName}: Distance ${z.distanceToStorm}mi, Wind Pressure ${pressure}psf`);
                    logs.push(`[${timestamp}]   Infrastructure Health: ${z.infrastructureHealth}%, Towers: ${z.activeTowers}/${z.totalTowers}`);
                    logs.push(`[${timestamp}]   Network: ${z.download.toFixed(1)}↓ ${z.upload.toFixed(1)}↑ Mbps, Latency: ${z.latency}ms, Loss: ${z.packetLoss}%`);
                });

                setComputationLogs(prev => [...logs, ...prev].slice(0, 50)); // Keep last 50 logs
            }

            // Transform backend data to match component format
            const transformedZones = data.zones.map(z => ({
                id: z.zone.toLowerCase(),
                name: z.displayName,
                population: z.population,
                status: z.status,
                distanceToStorm: z.distanceToStorm,
                metrics: {
                    latency: z.latency,
                    download: z.download,
                    upload: z.upload,
                    packetLoss: z.packetLoss,
                    jitter: z.jitter,
                    retransmissionRate: z.retransmissionRate,
                    connectionDropRate: z.connectionDropRate,
                    voiceQuality: z.voiceQuality,
                    videoQuality: z.videoQuality,
                    infrastructureHealth: z.infrastructureHealth,
                    congestionLevel: z.congestionLevel,
                    activeTowers: z.activeTowers,
                    totalTowers: z.totalTowers,
                    powerAvailability: z.powerAvailability,
                    predictedOutageRisk: z.predictedOutageRisk,
                    estimatedRepairTime: z.estimatedRepairTime
                }
            }));

            setZones(transformedZones);
            setStormData(data.storm);
            setNetworkOverview(data.network);
            setError(null);
        } catch (err) {
            console.error("Error fetching zones:", err);
            setError(err.message);
        }
    };

    // Update storm intensity on backend
    const updateStormIntensity = async (intensity) => {
        try {
            const response = await fetch(`${API_BASE}/zones/storm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intensity })
            });
            if (!response.ok) throw new Error("Failed to update storm intensity");
            await fetchZoneStatus();
        } catch (err) {
            console.error("Error updating storm:", err);
            setError(err.message);
        }
    };

    // Handle slider changes
    const handleIntensityChange = (value) => {
        setStormIntensity(value);
        updateStormIntensity(value);
    };

    // Start simulation
    const startSimulation = async () => {
        setIsLoading(true);
        try {
            await fetchZoneStatus();
            setIsRunning(true);
        } catch (err) {
            setError("Failed to start simulation");
        } finally {
            setIsLoading(false);
        }
    };

    // Stop simulation
    const stopSimulation = () => {
        setIsRunning(false);
    };

    // Poll for updates when running
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            fetchZoneStatus();
        }, 2000);

        return () => clearInterval(interval);
    }, [isRunning]);

    // Initial load
    useEffect(() => {
        fetchZoneStatus();
    }, []);

    const intensityPct = Math.round(stormIntensity * 100);

    const getStatusColor = (status) => {
        const colors = {
            OK: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
            DEGRADING: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
            DEGRADED: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", glow: "shadow-orange-500/20" },
            AT_RISK: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", glow: "shadow-rose-500/20" },
            CRITICAL: { bg: "bg-red-600/10", border: "border-red-600/30", text: "text-red-400", glow: "shadow-red-600/20" },
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
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            </div>

            {/* Rain Effect */}
            <RainEffect intensity={intensityPct} isRunning={isRunning} />

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/30">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                                    Disaster Response Grid
                                </h1>
                                <p className="text-slate-400 mt-2">Advanced storm modeling & network resilience monitoring</p>
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

                <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                    {/* Storm & Network Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Storm Control Panel */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
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
                                            <p className="text-sm text-slate-400">Real-time meteorological simulation</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{
                                            backgroundImage: `linear-gradient(135deg, ${intensityColor.from}, ${intensityColor.to})`
                                        }}>
                                            {intensityPct}%
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Intensity</div>
                                    </div>
                                </div>

                                {/* Slider */}
                                <div className="mb-6">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={stormIntensity}
                                        onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
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
                                    <div className="flex justify-between mt-3 text-xs text-slate-500">
                                        <span>Calm</span>
                                        <span>Moderate</span>
                                        <span>Severe</span>
                                    </div>
                                </div>

                                {/* Storm Stats */}
                                {stormData && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <StatCard label="Category" value={stormData.category} icon="🌪️" />
                                        <StatCard label="Wind Speed" value={`${stormData.windSpeed} mph`} icon="💨" />
                                        <StatCard label="Pressure" value={`${stormData.pressure} mb`} icon="🌡️" />
                                        <StatCard label="Trend" value={stormData.trend} icon={stormData.trend === "Strengthening" ? "📈" : stormData.trend === "Weakening" ? "📉" : "➡️"} />
                                    </div>
                                )}

                                {/* Control Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={startSimulation}
                                        disabled={isRunning || isLoading}
                                        className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                                    >
                                        {isLoading ? 'Initializing...' : isRunning ? 'Running' : 'Start Simulation'}
                                    </button>
                                    <button
                                        onClick={stopSimulation}
                                        className="px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all hover:-translate-y-0.5"
                                    >
                                        Stop
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Network Overview */}
                        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Network Status</h3>
                                    <p className="text-xs text-slate-400">Regional Overview</p>
                                </div>
                            </div>

                            {networkOverview && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <div className="text-sm text-slate-400 mb-1">Bandwidth Usage</div>
                                        <div className="flex items-end gap-2">
                                            <div className="text-2xl font-bold text-cyan-400">{networkOverview.totalBandwidthUsage}%</div>
                                            <div className={`text-xs px-2 py-0.5 rounded ${networkOverview.totalBandwidthUsage > 80 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {networkOverview.totalBandwidthUsage > 80 ? 'High' : 'Normal'}
                                            </div>
                                        </div>
                                        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${networkOverview.totalBandwidthUsage}%` }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-800/50 rounded-xl">
                                            <div className="text-xs text-slate-400 mb-1">Active Sessions</div>
                                            <div className="text-xl font-bold text-blue-400">{networkOverview.activeSessions.toLocaleString()}</div>
                                        </div>
                                        <div className="p-3 bg-slate-800/50 rounded-xl">
                                            <div className="text-xs text-slate-400 mb-1">Emergency Calls</div>
                                            <div className="text-xl font-bold text-rose-400">{networkOverview.emergencyCalls}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <div className="text-sm text-slate-400 mb-1">Power Grid</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold text-emerald-400">{networkOverview.powerGridStability}%</div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${networkOverview.powerGridStability > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {networkOverview.powerGridStability > 80 ? 'Stable' : 'Unstable'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Zone Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {zones.length > 0 ? zones.map((zone, idx) => {
                            const statusColors = getStatusColor(zone.status);
                            const selected = selectedZone === zone.id;

                            return (
                                <button
                                    key={zone.id}
                                    onClick={() => setSelectedZone(selected ? null : zone.id)}
                                    className={`relative group text-left bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden ${
                                        selected ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20 scale-105' : 'border-slate-700/50 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-teal-500/5 transition-all duration-500" />

                                    <div className="relative p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-100 mb-1">{zone.name}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                              {zone.population?.toLocaleString()}
                          </span>
                                                    <span className="flex items-center gap-1">
                            🌪️ {zone.distanceToStorm} mi
                          </span>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors.bg} ${statusColors.border} ${statusColors.text} shadow-lg ${statusColors.glow}`}>
                                                {zone.status}
                                            </div>
                                        </div>

                                        {/* Infrastructure Health */}
                                        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-slate-400">Infrastructure Health</span>
                                                <span className={`text-sm font-bold ${zone.metrics.infrastructureHealth > 70 ? 'text-emerald-400' : zone.metrics.infrastructureHealth > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {zone.metrics.infrastructureHealth}%
                        </span>
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${zone.metrics.infrastructureHealth > 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : zone.metrics.infrastructureHealth > 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-red-500'}`} style={{ width: `${zone.metrics.infrastructureHealth}%` }} />
                                            </div>
                                            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                                                <span>Towers: {zone.metrics.activeTowers}/{zone.metrics.totalTowers}</span>
                                                <span>Power: {zone.metrics.powerAvailability}%</span>
                                            </div>
                                        </div>

                                        {/* Network Metrics */}
                                        <div className="space-y-2 mb-4">
                                            <MetricBar label="Latency" value={`${zone.metrics.latency}ms`} percent={100 - Math.min(zone.metrics.latency / 5, 100)} color="from-emerald-500 to-teal-500" />
                                            <MetricBar label="Download" value={`${zone.metrics.download} Mbps`} percent={zone.metrics.download} color="from-blue-500 to-cyan-500" />
                                            <MetricBar label="Upload" value={`${zone.metrics.upload} Mbps`} percent={zone.metrics.upload * 10} color="from-purple-500 to-pink-500" />
                                        </div>

                                        {/* Advanced Metrics (Expandable) */}
                                        {selected && (
                                            <div className="space-y-3 pt-4 border-t border-slate-700/50 animate-fade-up">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <AdvancedMetric label="Jitter" value={`${zone.metrics.jitter}ms`} status={zone.metrics.jitter < 20 ? 'good' : zone.metrics.jitter < 50 ? 'warn' : 'bad'} />
                                                    <AdvancedMetric label="Packet Loss" value={`${zone.metrics.packetLoss}%`} status={zone.metrics.packetLoss < 2 ? 'good' : zone.metrics.packetLoss < 5 ? 'warn' : 'bad'} />
                                                    <AdvancedMetric label="Voice Quality" value={`${zone.metrics.voiceQuality}/5`} status={zone.metrics.voiceQuality > 4 ? 'good' : zone.metrics.voiceQuality > 3 ? 'warn' : 'bad'} />
                                                    <AdvancedMetric label="Video Quality" value={`${zone.metrics.videoQuality}%`} status={zone.metrics.videoQuality > 70 ? 'good' : zone.metrics.videoQuality > 40 ? 'warn' : 'bad'} />
                                                    <AdvancedMetric label="Congestion" value={`${zone.metrics.congestionLevel}%`} status={zone.metrics.congestionLevel < 50 ? 'good' : zone.metrics.congestionLevel < 75 ? 'warn' : 'bad'} />
                                                    <AdvancedMetric label="Drop Rate" value={`${zone.metrics.connectionDropRate}/hr`} status={zone.metrics.connectionDropRate < 10 ? 'good' : zone.metrics.connectionDropRate < 30 ? 'warn' : 'bad'} />
                                                </div>

                                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-xs text-slate-400">Outage Risk</div>
                                                            <div className="text-lg font-bold text-rose-400">{zone.metrics.predictedOutageRisk}%</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-slate-400">Est. Repair</div>
                                                            <div className="text-sm font-bold text-slate-300">{zone.metrics.estimatedRepairTime}m</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!selected && (
                                            <div className="text-center text-xs text-slate-500 mt-3">
                                                Click to view advanced metrics
                                            </div>
                                        )}
                                    </div>

                                    {selected && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500" />
                                    )}
                                </button>
                            );
                        }) : (
                            [0, 1, 2].map((i) => (
                                <div key={i} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl border border-slate-700/50 p-6 animate-pulse">
                                    <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
                                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-6"></div>
                                    <div className="space-y-3">
                                        <div className="h-10 bg-slate-700 rounded"></div>
                                        <div className="h-10 bg-slate-700 rounded"></div>
                                        <div className="h-10 bg-slate-700 rounded"></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-rose-300 font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Live Computation Terminal */}
                    {showTerminal && (
                        <div className="bg-gradient-to-br from-slate-950/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-green-500/30 overflow-hidden shadow-2xl shadow-green-500/10">
                            <div className="bg-slate-900/80 px-4 py-3 border-b border-green-500/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-sm font-mono text-green-400">storm-simulation-engine v2.0</span>
                                </div>
                                <button
                                    onClick={() => setShowTerminal(false)}
                                    className="text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1 terminal-scroll">
                                {computationLogs.length === 0 ? (
                                    <div className="text-green-400/50">
                                        <p>$ ./storm-simulator --mode=realtime --physics=advanced</p>
                                        <p>Initializing meteorological models...</p>
                                        <p>Loading infrastructure data...</p>
                                        <p className="animate-pulse mt-2">Waiting for simulation start...</p>
                                    </div>
                                ) : (
                                    computationLogs.map((log, i) => (
                                        <div key={i} className="text-green-400 animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                            <style>{`
                .terminal-scroll::-webkit-scrollbar {
                  width: 8px;
                }
                .terminal-scroll::-webkit-scrollbar-track {
                  background: rgba(15, 23, 42, 0.5);
                }
                .terminal-scroll::-webkit-scrollbar-thumb {
                  background: rgba(34, 197, 94, 0.3);
                  border-radius: 4px;
                }
                .terminal-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(34, 197, 94, 0.5);
                }
                @keyframes fade-in {
                  from { opacity: 0; transform: translateY(-2px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                  animation: fade-in 0.3s ease-out;
                }
              `}</style>
                        </div>
                    )}

                    {!showTerminal && (
                        <button
                            onClick={() => setShowTerminal(true)}
                            className="fixed bottom-6 right-6 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg font-mono text-sm hover:bg-green-500/30 transition-all shadow-lg shadow-green-500/20 z-30"
                        >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Show Terminal
              </span>
                        </button>
                    )}
                </main>
            </div>
        </div>
    );
}

function MetricBar({ label, value, percent, color }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="text-xs font-bold text-slate-200">{value}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="p-3 bg-slate-800/50 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-bold text-slate-100">{value}</span>
            </div>
        </div>
    );
}

function AdvancedMetric({ label, value, status }) {
    const colors = {
        good: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        warn: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        bad: 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    };

    return (
        <div className={`p-2 rounded-lg border ${colors[status]}`}>
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-sm font-bold mt-1">{value}</div>
        </div>
    );
}