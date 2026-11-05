import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Machine Copilot API endpoint
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { prompt, telemetryContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter' });
    }

    const systemInstruction = `You are "PredictIQ Copilot", an elite Industrial IoT Reliability & Predictive Maintenance Engineer.
You analyze mission-critical heavy assets including High-Voltage Power Transformers, Aviation Turbofan Engines, Petrochemical Centrifugal Pumps, Wind Turbine Gearboxes, and Power Generators.

Your objective:
- Explain asset health, anomaly detection, physical sensor drift, and maintenance decisions in concise, professional, plain-English terms.
- Relate physical phenomena to practical failure modes:
  * Power Transformers: Dissolved gas analysis (H2/CH4), dielectric breakdown of oil, winding top-oil temperature, cellulose insulation moisture.
  * Turbofan Engines: Turbine exhaust heat (T50), compressor pressure ratio (P30), high-frequency rotor vibration.
  * Industrial Pumps: Inboard bearing overheating, mechanical seal leakage, cavitation pressure drops, motor load draw.
  * Wind Gearboxes: Planetary gear tooth wear, lubricating oil metal debris, high-speed shaft bearing temperatures.
- Keep responses concise (2 to 3 punchy paragraphs or bullet points). Highlight operational recommendations and financial savings.`;

    const fullContent = `CURRENT ASSET TELEMETRY CONTEXT:
${JSON.stringify(telemetryContext || {}, null, 2)}

USER QUESTION / PROMPT:
${prompt}`;

    const hasValidKey =
      apiKey &&
      apiKey !== 'MY_GEMINI_API_KEY' &&
      !apiKey.startsWith('MY_') &&
      apiKey.trim().length > 20;

    if (aiClient && hasValidKey) {
      try {
        // Race Gemini call against a 6-second timeout for prompt responsiveness
        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullContent,
          config: {
            systemInstruction,
          },
        });

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const replyText = response?.text || 'Diagnostic analysis completed.';
        return res.json({ reply: replyText });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed or timed out, using aerospace heuristic fallback:', geminiErr?.message);
        // Fall through to heuristic analysis
      }
    }
      // Heuristic fallback if GEMINI_API_KEY is not configured yet
      const assetName = telemetryContext?.assetName || 'Asset';
      const timeUnit = telemetryContext?.timeUnit || 'Cycles';
      const cycle = telemetryContext?.currentCycle || 50;
      const rul = telemetryContext?.rulPred || 90;
      const status = telemetryContext?.status || 'HEALTHY';
      const mse = telemetryContext?.healthIndexMse || 0.004;
      const savings = telemetryContext?.avoidedLoss || 0;

      let fallbackReply = `**PredictIQ Copilot Assessment (${assetName})**\n\n`;
      if (status === 'HEALTHY') {
        fallbackReply += `${assetName} is currently in **Optimal Operational Health** at ${cycle} ${timeUnit}. Core physical sensors and telemetry channels remain well within calibrated baseline boundaries. The Autoencoder anomaly reconstruction MSE (${mse.toFixed(4)}) is comfortably below the 3-sigma alert threshold.\n\n**Recommendation:** Maintain standard operational workload. Next scheduled inspection recommended at ${Math.round(cycle + 25)} ${timeUnit}.`;
      } else if (status === 'DRIFT DETECTED') {
        fallbackReply += `**Early Degradation Drift Detected** at ${cycle} ${timeUnit}. Reconstruction error (${mse.toFixed(4)} MSE) has breached the statistical 3-sigma baseline, signaling the beginning of sub-surface wear.\n\n**Recommendation:** Flag asset for preventive diagnostic screening. Remaining Useful Life is estimated at **${Math.round(rul)} ${timeUnit}**.`;
      } else if (status === 'SCHEDULE MAINTENANCE') {
        fallbackReply += `**Maintenance Window Open:** Estimated Remaining Useful Life is **${Math.round(rul)} ${timeUnit}**. Executing scheduled line maintenance now secures **$${savings.toLocaleString()}** in avoided unplanned outage losses.\n\n**Recommendation:** Dispatch maintenance crew and staging replacement modules within the next 15 ${timeUnit}.`;
      } else {
        fallbackReply += `🚨 **CRITICAL IMMINENT FAILURE ALERT:** Remaining Useful Life is critically low (**${Math.round(rul)} ${timeUnit}**). Continued operation risks severe secondary equipment damage and emergency outage.\n\n**Recommendation:** Immediate shutdown recommended. Isolate asset and perform complete component overhaul.`;
      }

      return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Copilot API error:', error);
    return res.status(500).json({
      error: 'Failed to generate copilot analysis',
      details: error.message || String(error),
    });
  }
});

// Mount Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
