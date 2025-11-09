// backend/src/services/riskService.js

// --- Persistent state (in-memory) ---
let zones = [
    { name: "A", infraScore: 0.9, vulnerabilityScore: 0.2, distanceToStorm: 30 },
    { name: "B", infraScore: 0.6, vulnerabilityScore: 0.5, distanceToStorm: 15 },
    { name: "C", infraScore: 0.3, vulnerabilityScore: 0.8, distanceToStorm: 5 },
];

let storm = {
    intensity: 0.5, // 0–1 scale
    trend: 0,       // -1 weakening, 0 steady, +1 strengthening
    time: 0         // minutes elapsed
};

// --- Utility functions ---
function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}

function computeStormPressure(zone) {
    const Dmax = 30; // beyond 30 km storm has no effect
    const proximity = Math.max(0, 1 - zone.distanceToStorm / Dmax);
    return storm.intensity * proximity;
}

function computeEffectiveStress(zone) {
    const pressure = computeStormPressure(zone);
    return pressure * (1 - zone.infraScore);
}

function computeNetworkMetrics(zone) {
    const baseLatency = 50;
    const baseDown = 100;
    const baseUp = 10;
    const baseLoss = 0.1;

    const stress = computeEffectiveStress(zone);
    const latency = baseLatency + stress * 400;
    const down = baseDown * (1 - 0.8 * stress);
    const up = baseUp * (1 - 0.9 * stress);
    const loss = clamp(baseLoss + stress * 12, 0, 20);

    return { latency, down, up, loss };
}

function computeStatus(metrics) {
    if (metrics.loss > 10 || metrics.latency > 400 || metrics.down < 10)
        return "AT_RISK";
    if (metrics.loss > 3 || metrics.latency > 200)
        return "DEGRADED";
    return "OK";
}

function computePredictedOutageRisk(zone, metrics) {
    const stress = computeEffectiveStress(zone);
    const predicted =
        stress * (1 + 0.2 * storm.trend) + 0.02 * storm.time;
    return clamp(predicted, 0, 1.5);
}

// --- Public API ---

export async function getLatestMetrics() {
    // each call updates the storm & recomputes metrics
    storm.time += 1;
    // random mild drift in intensity and trend
    storm.intensity = clamp(storm.intensity + (Math.random() - 0.5) * 0.05, 0, 1);
    storm.trend = Math.sign(storm.intensity - 0.5);

    const result = zones.map((zone) => {
        // simulate storm moving slightly closer or farther
        zone.distanceToStorm = clamp(
            zone.distanceToStorm + (Math.random() - 0.5) * 2,
            0,
            30
        );

        const metrics = computeNetworkMetrics(zone);
        const status = computeStatus(metrics);
        const risk = computePredictedOutageRisk(zone, metrics);

        return {
            zone: zone.name,
            status,
            latency: Math.round(metrics.latency),
            download: Math.round(metrics.down),
            upload: Math.round(metrics.up),
            packetLoss: Math.round(metrics.loss * 10) / 10,
            predictedOutageRisk: Math.round(risk * 100) / 100,
        };
    });

    return result;
}

export async function saveMetrics(newMetrics) {
    // Not heavily used in simulation mode, but keeps API parity
    newMetrics.forEach((m) => {
        const zone = zones.find((z) => z.name === m.zone);
        if (zone) {
            zone.infraScore = m.infraScore ?? zone.infraScore;
            zone.vulnerabilityScore = m.vulnerabilityScore ?? zone.vulnerabilityScore;
            zone.distanceToStorm = m.distanceToStorm ?? zone.distanceToStorm;
        }
    });
    return true;
}

export async function getHistory(zoneName) {
    // Stub: could store time-series here later
    return [{ timestamp: Date.now(), stormIntensity: storm.intensity }];
}

export async function setStormIntensity(value) {
    storm.intensity = clamp(value, 0, 1);
    storm.trend = 0;
    storm.time = 0;
    return { message: `Storm intensity set to ${storm.intensity}` };
}

