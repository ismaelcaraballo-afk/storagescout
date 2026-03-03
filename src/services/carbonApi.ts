// Service to handle WattTime and Electricity Maps APIs
// Implements Kevin's requirements for Live Data

// Determine if we should use mock data
// If the backend fails, we fall back to mock
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const USE_MOCK = FORCE_MOCK; 

export interface CarbonData {
  timestamp: string;
  intensity: number; // gCO2/kWh or lbs/MWh
  units: string;
  zone: string;
  isClean: boolean;
  marginalEmissions?: number; // WattTime specific
  percentRenewable?: number;
  isMock?: boolean; // Flag to indicate source
}

// Mock data generator for demo purposes
const generateMockData = (zone: string): CarbonData => {
  const now = new Date();
  // Simulate fluctuating grid data
  const baseIntensity = zone === 'CAISO' ? 450 : 800;
  const fluctuation = Math.sin(now.getTime() / 10000) * 50; 
  const intensity = Math.round(baseIntensity + fluctuation);
  
  return {
    timestamp: now.toISOString(),
    intensity: intensity,
    units: 'lbs CO2/MWh',
    zone: zone,
    isClean: intensity < 500,
    marginalEmissions: Math.round(intensity * 1.2), // Marginal is usually higher
    percentRenewable: Math.round(Math.max(0, 100 - (intensity / 10))),
    isMock: true
  };
};

let wattTimeToken: string | null = null;

// Backend now handles token caching, so we just hit the data endpoint directly
// But we'll keep this function signature if other parts use it, or simplify.
// Actually, let's simplify. We don't need to fetch a token first anymore.

export const fetchLiveCarbonData = async (zone: string = 'CAISO_NORTH'): Promise<CarbonData> => {
  if (USE_MOCK) {
    console.log("Using Mock Data (Configured)");
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockData(zone);
  }

  try {
    // 1. Try WattTime (via Backend)
    // The backend now handles auth automatically. We just ask for data.
    const response = await fetch(`/api/watttime/data?zone=${zone}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("WattTime Data Received:", data);
      
      // Parse WattTime response structure
      // Expected: { data: [{ value: number, point_time: string, ... }], meta: { units: string, ... } }
      
      let intensity, timestamp, units;
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // New v3 structure
        const point = data.data[0];
        intensity = point.value;
        timestamp = point.point_time;
        units = data.meta?.units || 'percentile';
      } else if (data.percent !== undefined) {
        // Legacy v2 structure (fallback)
        intensity = data.percent;
        timestamp = data.timestamp;
        units = 'Index (0-100)';
      } else {
        console.warn("WattTime Data format unrecognized:", data);
        throw new Error("Unrecognized WattTime format");
      }

      return {
        timestamp: timestamp,
        intensity: intensity,
        units: units,
        zone: zone,
        isClean: intensity < 50, // Assuming percentile < 50 is "clean"
        marginalEmissions: 0, 
        isMock: false
      };
    } else {
      console.warn(`WattTime Data Error: ${response.status}`);
    }

    // 2. Try Electricity Maps (via Backend)
    const responseEM = await fetch(`/api/electricitymaps/data?zone=${zone}`);
    
    if (responseEM.ok) {
      const data = await responseEM.json();
      console.log("Electricity Maps Data Received:", data);
      
      return {
        timestamp: data.datetime || data.updatedAt, 
        intensity: data.carbonIntensity,
        units: data.unit || 'gCO2/kWh',
        zone: data.zone,
        isClean: data.carbonIntensity < 200,
        isMock: false
      };
    } else {
      console.warn(`Electricity Maps API Error: ${responseEM.status}`);
    }

  } catch (error) {
    console.error("Live Data Fetch Failed:", error);
  }

  // Fallback to mock if APIs fail
  console.warn("All APIs failed, falling back to mock data");
  return generateMockData(zone);
};

export const getBestTimeAdvice = (intensity: number): string => {
  if (intensity < 300) return "NOW! The grid is very clean.";
  if (intensity < 600) return "Good time. Grid is moderately clean.";
  return "WAIT. Grid is dirty. Use stored energy.";
};

