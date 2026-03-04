import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Helper to replicate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const PORT = 3000;

// --- USER PROVIDED ROUTES ---

// Token management
let cachedToken: string | null = null;
let tokenExpiration: number = 0;

async function getValidToken(forceRefresh = false) {
  const now = Date.now();
  // Refresh if no token, forced, or if it expires in less than 5 minutes
  if (forceRefresh || !cachedToken || now >= tokenExpiration - 5 * 60 * 1000) {
    console.log("Refreshing WattTime token...");
    try {
      const response = await axios.get("https://api.watttime.org/login", {
        auth: {
          username: process.env.WATTTIME_USERNAME!,
          password: process.env.WATTTIME_PASSWORD!,
        },
      });
      cachedToken = response.data.token;
      // Token valid for 30 minutes, set expiration to 25 minutes from now to be safe
      tokenExpiration = now + 25 * 60 * 1000; 
      console.log("Token refreshed successfully.");
    } catch (error: any) {
      console.error("Failed to refresh token:", error.message);
      throw error;
    }
  }
  return cachedToken;
}

// WattTime login endpoint (now returns cached token)
app.get("/api/watttime/login", async (req, res) => {
  try {
    const token = await getValidToken();
    res.json({ token });
  } catch (error: any) {
    console.error("WattTime Login Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// WattTime historical example
app.get("/api/watttime/historical", async (req, res) => {
  const { token, region, start, end, signal_type } = req.query;
  try {
    const response = await axios.get("https://api.watttime.org/v3/historical", {
      headers: { Authorization: `Bearer ${token}` },
      params: { region, start, end, signal_type },
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ElectricityMap example
app.get("/api/electricitymap", async (req, res) => {
  const { datetime } = req.query;
  try {
    const response = await axios.get(
      `https://api.electricitymaps.com/v3/carbon-intensity/past`,
      {
        headers: { "auth-token": process.env.ELECTRICITYMAPS_TOKEN! },
        params: { datetime },
      },
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- COMPATIBILITY ROUTES (For Existing Frontend) ---

// Proxy for live index data (what the UI currently consumes)
app.get("/api/watttime/data", async (req, res) => {
  const { zone } = req.query; 
  
  const fetchData = async (token: string) => {
    // Use /v3/signal-index to get the percentile (0-100) value as requested
    console.log(`Fetching WattTime v3 signal-index for region: ${zone}`);
    return await axios.get(`https://api.watttime.org/v3/signal-index`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { 
        region: zone,
        signal_type: 'co2_moer'
      }
    });
  };

  try {
    let token = await getValidToken();
    try {
      const response = await fetchData(token!);
      res.json(response.data);
    } catch (error: any) {
      // If 401, token might be invalid/expired despite our check. Refresh and retry once.
      if (error.response && error.response.status === 401) {
        console.log("Received 401 from WattTime. Forcing token refresh and retrying...");
        token = await getValidToken(true);
        const response = await fetchData(token!);
        res.json(response.data);
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error("WattTime Data Error (v3):", error.message);
    if (error.response) {
       console.error("Response data:", error.response.data);
    }
    res.status(500).json({ error: error.message });
  }
});

// Proxy for Electricity Maps Latest (what the UI currently consumes)
app.get("/api/electricitymaps/data", async (req, res) => {
  const { zone } = req.query;
  try {
    const response = await axios.get(
      `https://api.electricitymap.org/v3/carbon-intensity/latest`,
      {
        headers: { "auth-token": process.env.ELECTRICITYMAPS_TOKEN! },
        params: { zone },
      },
    );
    res.json(response.data);
  } catch (error: any) {
    console.error("Electricity Maps Data Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- VITE MIDDLEWARE (REQUIRED FOR AI STUDIO) ---
// This enables the frontend to be served from the same port (3000)
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
