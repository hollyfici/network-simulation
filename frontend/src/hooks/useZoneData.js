import { useState, useEffect } from "react";

export function useZoneData() {
    const [zones, setZones] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [stormIntensity, setStormIntensity] = useState(0.5); // default moderate

    useEffect(() => {
        let interval;
        if (isRunning) {
            const loadZones = async () => {
                try {
                    const res = await fetch("http://localhost:3000/zones/status");
                    const data = await res.json();
                    setZones(
                        data.map((z) => ({
                            id: z.zone,
                            name:
                                z.zone === "A"
                                    ? "Coastal Region"
                                    : z.zone === "B"
                                        ? "Mountain Valley"
                                        : "Urban Center",
                            population: z.zone === "A" ? 15000 : z.zone === "B" ? 8000 : 22000,
                            infrastructure: Math.round(z.download),
                            riskLevel:
                                z.status === "OK"
                                    ? "low"
                                    : z.status === "DEGRADED"
                                        ? "medium"
                                        : "high",
                            metrics: z,
                        }))
                    );
                } catch (err) {
                    setError("Failed to load live data");
                }
            };

            loadZones();
            interval = setInterval(loadZones, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const startSimulation = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("http://localhost:3000/zones/storm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intensity: stormIntensity }),
            });

            if (!res.ok) throw new Error("Failed to start simulation");

            setIsRunning(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const stopSimulation = () => {
        setIsRunning(false);
    };

    const clearError = () => setError(null);

    return {
        zones,
        stormIntensity,
        setStormIntensity,
        isRunning,
        isLoading,
        error,
        startSimulation,
        stopSimulation,
        clearError,
    };
}
