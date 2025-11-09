import express from "express";
import { getLatestMetrics, saveMetrics, getHistory, setStormIntensity } from "../services/riskServices.js";

const router = express.Router();

router.get("/status", async (req, res) => {
    const data = await getLatestMetrics();
    res.json(data);
});

router.post("/ingest", async (req, res) => {
    await saveMetrics(req.body);
    res.status(201).json({ message: "Metrics ingested" });
});

// NEW: adjust storm intensity
router.post("/storm", async (req, res) => {
    const { intensity } = req.body;
    if (typeof intensity !== "number" || intensity < 0 || intensity > 1) {
        return res.status(400).json({ error: "Intensity must be a number between 0 and 1" });
    }

    const result = await setStormIntensity(intensity);
    res.json(result);
});

export default router;
