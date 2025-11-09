let zones = [
    {
        name: "A",
        displayName: "UB North Campus",
        population: 18500,
        infraScore: 0.98,
        vulnerabilityScore: 0.1,
        distanceToStorm: 35,
        elevation: 620,
        cellTowers: 18,
        fiberNodes: 15,
        datacenterProximity: 0.98,
        redundancy: 0.95,
        backupPower: 0.98,
        floodRisk: 0.1,
        windExposure: 0.4,
        terrainRuggedness: 0.3,
        lastOutageHours: 0,
        mtbf: 4320,
        repairCrewDistance: 0.2
    },
    {
        name: "B",
        displayName: "Elmwood Village",
        population: 12500,
        infraScore: 0.55,
        vulnerabilityScore: 0.5,
        distanceToStorm: 18,
        elevation: 600,
        cellTowers: 6,
        fiberNodes: 4,
        datacenterProximity: 0.45,
        redundancy: 0.45,
        backupPower: 0.4,
        floodRisk: 0.4,
        windExposure: 0.55,
        terrainRuggedness: 0.2,
        lastOutageHours: 0,
        mtbf: 600,
        repairCrewDistance: 4
    },
    {
        name: "C",
        displayName: "Masten Park",
        population: 8200,
        infraScore: 0.25,
        vulnerabilityScore: 0.85,
        distanceToStorm: 8,
        elevation: 590,
        cellTowers: 3,
        fiberNodes: 1,
        datacenterProximity: 0.2,
        redundancy: 0.15,
        backupPower: 0.2,
        floodRisk: 0.65,
        windExposure: 0.75,
        terrainRuggedness: 0.15,
        lastOutageHours: 0,
        mtbf: 240,
        repairCrewDistance: 12
    },
];

let storm = {
    intensity: 0.5,
    windSpeed: 50,
    pressure: 980,
    movementSpeed: 15,
    direction: 180,
    rainfall: 2,
    stormSurge: 3,
    eyeRadius: 10,
    trend: 0,
    time: 0,
    category: "Tropical Storm"
};

let networkLoad = {
    totalBandwidthUsage: 0.4,
    activeSessions: 8500,
    emergencyCalls: 0,
    dataTraffic: 450,
    voiceTraffic: 85
};

let environment = {
    powerGrid: {
        stability: 1.0,
        voltage: 120,
        frequency: 60,
        outages: []
    },
    weatherConditions: {
        visibility: 10,
        temperature: 78,
        humidity: 0.65,
        seaState: 2
    }
};

function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}

function categorizeStorm(windSpeed) {
    if (windSpeed < 39) return "Tropical Depression";
    if (windSpeed < 74) return "Tropical Storm";
    if (windSpeed < 96) return "Category 1 Hurricane";
    if (windSpeed < 111) return "Category 2 Hurricane";
    if (windSpeed < 130) return "Category 3 Hurricane";
    if (windSpeed < 157) return "Category 4 Hurricane";
    return "Category 5 Hurricane";
}

function calculateWindPressure(windSpeed) {
    return 0.00256 * Math.pow(windSpeed, 2);
}

function computeStormPressure(zone) {
    const Dmax = 50;
    const distance = zone.distanceToStorm;

    const distanceFactor = Math.exp(-distance / 15);

    const windPressure = calculateWindPressure(storm.windSpeed);

    const elevationFactor = 1 / (1 + zone.elevation / 100);

    const terrainFactor = 1 - (zone.terrainRuggedness * 0.3);

    const basePressure = storm.intensity * distanceFactor;
    const windEffect = (windPressure / 100) * distanceFactor;
    const surgeEffect = (storm.stormSurge / 20) * elevationFactor * zone.floodRisk;

    return (basePressure + windEffect + surgeEffect) * terrainFactor;
}

function computeInfrastructureDegradation(zone, stormPressure) {
    const towerStress = stormPressure * zone.windExposure * 1.5;
    const towerFailureProb = Math.min(towerStress * 0.65, 0.98);
    const activeTowers = zone.cellTowers * (1 - towerFailureProb);

    const fiberStress = stormPressure * (zone.floodRisk * 0.7 + 0.5);
    const fiberFailureProb = Math.min(fiberStress * 0.55, 0.95);
    const activeNodes = zone.fiberNodes * (1 - fiberFailureProb);

    const powerStress = stormPressure * (1 - zone.backupPower) * 1.8;
    const powerAvailability = Math.max(0, 1 - powerStress);
    environment.powerGrid.stability = powerAvailability;

    return {
        activeTowers,
        activeNodes,
        powerAvailability,
        overallHealth: (activeTowers / zone.cellTowers * 0.4 +
            activeNodes / zone.fiberNodes * 0.4 +
            powerAvailability * 0.2)
    };
}

function computeNetworkCongestion(zone, infraHealth) {
    const emergencyCallRate = storm.intensity * 50;
    networkLoad.emergencyCalls += emergencyCallRate;

    const panicFactor = Math.min(storm.intensity * 1.5, 2);
    const normalTraffic = (zone.population / 1000) * 0.8;
    const totalTraffic = normalTraffic * panicFactor;

    const availableBandwidth = 1000 * infraHealth.overallHealth;
    const congestion = Math.min(totalTraffic / availableBandwidth, 1);

    networkLoad.totalBandwidthUsage = congestion;
    networkLoad.activeSessions = Math.floor(zone.population * 0.4 * infraHealth.overallHealth);

    return congestion;
}

function computeNetworkMetrics(zone) {
    const stormPressure = computeStormPressure(zone);
    const infraHealth = computeInfrastructureDegradation(zone, stormPressure);
    const congestion = computeNetworkCongestion(zone, infraHealth);

    const baseLatency = 15 + (1 - zone.datacenterProximity) * 40;
    const baseDown = 120 * zone.redundancy;
    const baseUp = 15 * zone.redundancy;
    const baseLoss = 0.02;

    const effectiveStress = stormPressure * (1 - zone.infraScore);

    const stressLatency = effectiveStress * 1200;
    const congestionLatency = congestion * 400;
    const latency = baseLatency + stressLatency + congestionLatency;

    const healthFactor = infraHealth.overallHealth;
    const powerFactor = infraHealth.powerAvailability;
    const stressPenalty = Math.pow(effectiveStress, 1.5);
    const down = baseDown * healthFactor * powerFactor * (1 - congestion * 0.7) * (1 - stressPenalty * 0.8);
    const up = baseUp * healthFactor * powerFactor * (1 - congestion * 0.8) * (1 - stressPenalty * 0.9);

    const baseLossFactor = baseLoss + effectiveStress * 35;
    const congestionLoss = congestion * 15;
    const loss = clamp(baseLossFactor + congestionLoss, 0, 50);

    const jitter = clamp(latency * 0.15 * (1 + effectiveStress * 2), 0, 200);
    const retransmissionRate = clamp(loss * 3, 0, 80);
    const connectionDropRate = clamp(effectiveStress * 25 + congestion * 12, 0, 200);

    const voiceQuality = computeVoiceQuality(latency, jitter, loss);
    const videoQuality = computeVideoQuality(down, latency, loss);

    return {
        latency,
        download: down,
        upload: up,
        packetLoss: loss,
        jitter,
        retransmissionRate,
        connectionDropRate,
        voiceQuality,
        videoQuality,
        infrastructureHealth: infraHealth.overallHealth * 100,
        congestionLevel: congestion * 100,
        activeTowers: Math.round(infraHealth.activeTowers),
        totalTowers: zone.cellTowers,
        powerAvailability: infraHealth.powerAvailability * 100
    };
}

function computeVoiceQuality(latency, jitter, loss) {
    let mos = 4.5;
    mos -= (latency / 100) * 0.5;
    mos -= (jitter / 20) * 0.3;
    mos -= (loss / 2) * 0.8;
    return clamp(mos, 1, 5);
}

function computeVideoQuality(bandwidth, latency, loss) {
    let quality = 100;
    quality -= (100 - bandwidth) * 0.5;
    quality -= (latency / 10);
    quality -= loss * 3;
    return clamp(quality, 0, 100);
}

function computeStatus(metrics) {
    if (metrics.infrastructureHealth < 30 || metrics.loss > 12 || metrics.connectionDropRate > 40 || metrics.download < 5)
        return "CRITICAL";
    if (metrics.loss > 7 || metrics.latency > 300 || metrics.download < 15 || metrics.infrastructureHealth < 50)
        return "AT_RISK";
    if (metrics.loss > 4 || metrics.latency > 150 || metrics.congestionLevel > 60 || metrics.download < 40)
        return "DEGRADED";
    if (metrics.loss > 1.5 || metrics.latency > 80 || metrics.congestionLevel > 40 || metrics.download < 70)
        return "DEGRADING";
    return "OK";
}

function computePredictedOutageRisk(zone, metrics) {
    const stormPressure = computeStormPressure(zone);

    const stormFactor = stormPressure * 0.3;
    const healthFactor = (1 - metrics.infrastructureHealth / 100) * 0.25;
    const congestionFactor = (metrics.congestionLevel / 100) * 0.15;
    const powerFactor = (1 - metrics.powerAvailability / 100) * 0.2;
    const historicalFactor = (zone.lastOutageHours / zone.mtbf) * 0.1;

    const trendMultiplier = 1 + (storm.trend * 0.3);

    const timeEscalation = storm.time / 1000;

    const totalRisk = (stormFactor + healthFactor + congestionFactor +
        powerFactor + historicalFactor) * trendMultiplier + timeEscalation;

    return clamp(totalRisk * 100, 0, 100);
}

function evolveStorm() {
    storm.time += 1;

    const intensityChange = (Math.random() - 0.5) * 0.03;
    storm.intensity = clamp(storm.intensity + intensityChange, 0, 1);

    storm.windSpeed = 30 + storm.intensity * 150;

    storm.pressure = 1010 - storm.intensity * 100;

    storm.rainfall = 1 + storm.intensity * 15;

    storm.stormSurge = storm.intensity * 25;

    storm.category = categorizeStorm(storm.windSpeed);

    storm.trend = intensityChange > 0.01 ? 1 : intensityChange < -0.01 ? -1 : 0;

    zones.forEach(zone => {
        const movement = storm.movementSpeed / 60;
        const angleToZone = Math.random() * 360;
        const deltaDistance = movement * Math.cos((angleToZone - storm.direction) * Math.PI / 180);

        zone.distanceToStorm = clamp(
            zone.distanceToStorm - deltaDistance + (Math.random() - 0.5),
            0,
            50
        );
    });
}

export async function getLatestMetrics() {
    evolveStorm();

    const result = zones.map((zone) => {
        const metrics = computeNetworkMetrics(zone);
        const status = computeStatus(metrics);
        const risk = computePredictedOutageRisk(zone, metrics);

        if (status === "CRITICAL" || status === "AT_RISK") {
            zone.lastOutageHours += 1/60;
        }

        return {
            zone: zone.name,
            displayName: zone.displayName,
            population: zone.population,
            status,
            latency: Math.round(metrics.latency),
            download: Math.round(metrics.download * 10) / 10,
            upload: Math.round(metrics.upload * 10) / 10,
            packetLoss: Math.round(metrics.packetLoss * 100) / 100,
            jitter: Math.round(metrics.jitter * 10) / 10,
            retransmissionRate: Math.round(metrics.retransmissionRate * 10) / 10,
            connectionDropRate: Math.round(metrics.connectionDropRate),
            voiceQuality: Math.round(metrics.voiceQuality * 10) / 10,
            videoQuality: Math.round(metrics.videoQuality),
            infrastructureHealth: Math.round(metrics.infrastructureHealth),
            congestionLevel: Math.round(metrics.congestionLevel),
            activeTowers: metrics.activeTowers,
            totalTowers: metrics.totalTowers,
            powerAvailability: Math.round(metrics.powerAvailability),
            predictedOutageRisk: Math.round(risk * 10) / 10,
            distanceToStorm: Math.round(zone.distanceToStorm * 10) / 10,
            floodRisk: zone.floodRisk,
            estimatedRepairTime: Math.round(zone.repairCrewDistance / 30 * 60)
        };
    });

    const stormData = {
        intensity: Math.round(storm.intensity * 100),
        category: storm.category,
        windSpeed: Math.round(storm.windSpeed),
        pressure: Math.round(storm.pressure),
        rainfall: Math.round(storm.rainfall * 10) / 10,
        stormSurge: Math.round(storm.stormSurge * 10) / 10,
        movementSpeed: storm.movementSpeed,
        trend: storm.trend === 1 ? "Strengthening" : storm.trend === -1 ? "Weakening" : "Steady"
    };

    const networkOverview = {
        totalBandwidthUsage: Math.round(networkLoad.totalBandwidthUsage * 100),
        activeSessions: networkLoad.activeSessions,
        emergencyCalls: Math.round(networkLoad.emergencyCalls),
        powerGridStability: Math.round(environment.powerGrid.stability * 100)
    };

    return { zones: result, storm: stormData, network: networkOverview };
}

export async function saveMetrics(newMetrics) {
    newMetrics.forEach((m) => {
        const zone = zones.find((z) => z.name === m.zone);
        if (zone) {
            Object.keys(m).forEach(key => {
                if (zone.hasOwnProperty(key)) {
                    zone[key] = m[key];
                }
            });
        }
    });
    return true;
}

export async function getHistory(zoneName) {
    return [{
        timestamp: Date.now(),
        stormIntensity: storm.intensity,
        windSpeed: storm.windSpeed,
        category: storm.category
    }];
}

export async function setStormIntensity(value) {
    storm.intensity = clamp(value, 0, 1);
    storm.windSpeed = 30 + storm.intensity * 150;
    storm.pressure = 1010 - storm.intensity * 100;
    storm.rainfall = 1 + storm.intensity * 15;
    storm.stormSurge = storm.intensity * 25;
    storm.category = categorizeStorm(storm.windSpeed);
    storm.trend = 0;
    storm.time = 0;

    return {
        message: `Storm intensity set to ${Math.round(storm.intensity * 100)}%`,
        category: storm.category,
        windSpeed: Math.round(storm.windSpeed),
        pressure: Math.round(storm.pressure)
    };
}