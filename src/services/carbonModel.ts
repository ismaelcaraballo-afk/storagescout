/**
 * Carbon Intensity Modeling - Physics-informed grid emissions calculation
 * Source: EPA eGRID 2023 + EIA grid mix data
 */

// US grid regions with baseline carbon intensities (lbs CO2/MWh)
export const GRID_REGIONS = [
  {
    id: 'CAISO',
    name: 'California',
    region: 'West',
    baseCO2: 350,
    stateMix: {
      solar: 0.28,
      wind: 0.08,
      hydro: 0.12,
      nuclear: 0.09,
      gas: 0.37,
      coal: 0.01,
      other: 0.05,
    },
  },
  {
    id: 'ERCOT',
    name: 'Texas',
    region: 'South',
    baseCO2: 710,
    stateMix: {
      solar: 0.08,
      wind: 0.23,
      hydro: 0.0,
      nuclear: 0.1,
      gas: 0.5,
      coal: 0.06,
      other: 0.03,
    },
  },
  {
    id: 'PJM',
    name: 'Mid-Atlantic',
    region: 'Northeast',
    baseCO2: 790,
    stateMix: {
      solar: 0.03,
      wind: 0.05,
      hydro: 0.02,
      nuclear: 0.34,
      gas: 0.32,
      coal: 0.18,
      other: 0.06,
    },
  },
  {
    id: 'MISO',
    name: 'Midwest',
    region: 'Midwest',
    baseCO2: 980,
    stateMix: {
      solar: 0.02,
      wind: 0.14,
      hydro: 0.03,
      nuclear: 0.15,
      gas: 0.25,
      coal: 0.36,
      other: 0.05,
    },
  },
  {
    id: 'SPP',
    name: 'Great Plains',
    region: 'Central',
    baseCO2: 870,
    stateMix: {
      solar: 0.03,
      wind: 0.32,
      hydro: 0.01,
      nuclear: 0.07,
      gas: 0.28,
      coal: 0.26,
      other: 0.03,
    },
  },
  {
    id: 'NYISO',
    name: 'New York',
    region: 'Northeast',
    baseCO2: 420,
    stateMix: {
      solar: 0.03,
      wind: 0.06,
      hydro: 0.22,
      nuclear: 0.29,
      gas: 0.35,
      coal: 0.01,
      other: 0.04,
    },
  },
  {
    id: 'ISONE',
    name: 'New England',
    region: 'Northeast',
    baseCO2: 530,
    stateMix: {
      solar: 0.04,
      wind: 0.05,
      hydro: 0.07,
      nuclear: 0.31,
      gas: 0.46,
      coal: 0.02,
      other: 0.05,
    },
  },
  {
    id: 'WECC',
    name: 'Northwest',
    region: 'West',
    baseCO2: 310,
    stateMix: {
      solar: 0.05,
      wind: 0.12,
      hydro: 0.45,
      nuclear: 0.05,
      gas: 0.27,
      coal: 0.03,
      other: 0.03,
    },
  },
  {
    id: 'SERC',
    name: 'Southeast',
    region: 'South',
    baseCO2: 790,
    stateMix: {
      solar: 0.04,
      wind: 0.02,
      hydro: 0.08,
      nuclear: 0.28,
      gas: 0.38,
      coal: 0.17,
      other: 0.03,
    },
  },
  {
    id: 'FRCC',
    name: 'Florida',
    region: 'South',
    baseCO2: 760,
    stateMix: {
      solar: 0.05,
      wind: 0.0,
      hydro: 0.0,
      nuclear: 0.11,
      gas: 0.73,
      coal: 0.07,
      other: 0.04,
    },
  },
];

// Emission factors by fuel type (lbs CO2/MWh) — EPA values
export const EMISSION_FACTORS: Record<string, number> = {
  solar: 0,
  wind: 0,
  hydro: 0,
  nuclear: 0,
  gas: 897,
  coal: 2249,
  other: 500,
};

// Modeling constants
const SOLAR_BOOST_MAX = 0.45; // CAISO-validated: 40-50% actual solar displacement at peak radiation
const GAS_OFFSET_FACTOR = 0.8; // offset gas by 80% of solar increase
const PEAK_EVENING_MULTIPLIER = 1.12;
const NIGHT_VALLEY_MULTIPLIER = 0.88;

// Season detection (Northern Hemisphere)
type Season = 'summer' | 'winter' | 'shoulder';

function getSeason(month: number): Season {
  if (month >= 5 && month <= 8) return 'summer';   // Jun–Sep
  if (month === 11 || month <= 1) return 'winter';  // Dec–Feb
  return 'shoulder';
}

// Peak evening window varies by season (CAISO dispatch profiles)
function isPeakHour(hourOfDay: number, season: Season): boolean {
  if (season === 'winter') return hourOfDay >= 16 && hourOfDay <= 20;  // 4–8pm
  if (season === 'summer') return hourOfDay >= 17 && hourOfDay <= 21;  // 5–9pm
  return hourOfDay >= 16 && hourOfDay <= 21;                            // shoulder: broader window
}

// Storage impact on grid intensity (NREL estimate: 2x storage ≈ 12% reduction)
export const STORAGE_INTENSITY_REDUCTION_FACTOR = 0.12;

// Carbon intensity thresholds (lbs CO₂/MWh)
export const CARBON_THRESHOLDS = {
  clean: 400,
  moderate: 700,
};

export const CARBON_COLORS = {
  clean: { bg: 'rgba(52,211,153,0.6)', border: '#34d399', solid: '#34d399' },
  moderate: { bg: 'rgba(251,191,36,0.6)', border: '#fbbf24', solid: '#fbbf24' },
  dirty: { bg: 'rgba(248,113,113,0.6)', border: '#f87171', solid: '#f87171' },
};

/**
 * Get carbon intensity level (clean/moderate/dirty) for a given value
 */
export function getCarbonLevel(value: number): 'clean' | 'moderate' | 'dirty' {
  if (value < CARBON_THRESHOLDS.clean) return 'clean';
  if (value < CARBON_THRESHOLDS.moderate) return 'moderate';
  return 'dirty';
}

/**
 * Model real-time carbon intensity from weather data.
 * Logic: solar radiation boosts solar fraction → lowers CO2.
 * Time of day affects gas peaker dispatch (evening peak = more gas = higher CO2).
 * Temperature affects cooling/heating demand → more or less gas dispatch.
 */
export function modelCarbonIntensity(
  region: (typeof GRID_REGIONS)[0],
  solarRadiation: number,
  tempC: number,
  isDay: boolean,
  hourOfDay: number,
  month: number = new Date().getMonth()
): number {
  const mix = { ...region.stateMix };

  // Adjust solar fraction based on live radiation (normalized: 800 W/m2 = peak)
  const solarBoost = isDay ? Math.min(solarRadiation / 800, 1.0) : 0;
  const solarIncrease = mix.solar * solarBoost * SOLAR_BOOST_MAX;
  const adjustedSolar = mix.solar + solarIncrease;

  // Scale down gas to compensate for more solar
  const adjustedGas = Math.max(0, mix.gas - solarIncrease * GAS_OFFSET_FACTOR);

  // Season-aware evening peak window (winter: 4-8pm, summer: 5-9pm)
  const season = getSeason(month);
  const isNightValley = hourOfDay >= 1 && hourOfDay <= 5;
  const peakMultiplier = isPeakHour(hourOfDay, season)
    ? PEAK_EVENING_MULTIPLIER
    : isNightValley
      ? NIGHT_VALLEY_MULTIPLIER
      : 1.0;
  const finalGas = adjustedGas * peakMultiplier;

  // Temperature demand factor: gradient (not binary step)
  // >35°C: +10%, 30-35°C: +6%, 0-10°C: +5%, <0°C: +8%
  let tempFactor = 1.0;
  if (tempC > 35) tempFactor = 1.10;
  else if (tempC > 30) tempFactor = 1.0 + ((tempC - 30) / 5) * 0.06;
  else if (tempC < 0) tempFactor = 1.08;
  else if (tempC < 10) tempFactor = 1.0 + ((10 - tempC) / 10) * 0.05;

  const adjMix = { ...mix, solar: adjustedSolar, gas: Math.min(finalGas * tempFactor, 0.95) };
  const intensity = Object.entries(adjMix).reduce(
    (acc, [fuel, frac]) => acc + frac * EMISSION_FACTORS[fuel],
    0
  );

  return Math.round(intensity);
}

/**
 * Build a 24-hour carbon intensity curve for today using hourly solar data.
 */
export function buildHourlyCarbonCurve(
  solarData: any,
  regionIndex: number = 0
): { labels: string[]; values: number[] } | null {
  if (!solarData?.hourly?.time) {
    console.warn('Missing hourly solar data');
    return null;
  }

  const region = GRID_REGIONS[regionIndex];
  const hourlyTemp = solarData.hourly.temperature_2m || [];

  const hourlyValues = solarData.hourly.time.map((t: string, idx: number) => {
    const date = new Date(t);
    const h = date.getHours();
    const m = date.getMonth();
    const rad = (solarData.hourly.direct_radiation?.[idx] || 0) + (solarData.hourly.diffuse_radiation?.[idx] || 0);
    const tempC = hourlyTemp[idx] ?? 20;
    return modelCarbonIntensity(region, rad, tempC, rad > 20, h, m);
  });

  return {
    labels: solarData.hourly.time.map((t: string) => new Date(t).getHours() + ':00'),
    values: hourlyValues,
  };
}

/**
 * Determine the best charge window from hourly carbon data.
 * Best = lowest carbon intensity period during daylight (charge clean, discharge at peak).
 */
export function getBestChargeWindow(
  hourlyData: { labels: string[]; values: number[] } | null
): { window: string; reason: string } {
  if (!hourlyData) return { window: '--', reason: 'Data unavailable' };

  const { labels, values } = hourlyData;
  let minVal = Infinity,
    minIdx = -1;

  values.forEach((v, i) => {
    const h = parseInt(labels[i]);
    if (h >= 6 && h <= 16 && v < minVal) {
      minVal = v;
      minIdx = i;
    }
  });

  if (minIdx === -1) return { window: 'Overnight', reason: 'Solar not generating — charge from wind' };

  const bestHour = labels[minIdx];
  const reason = minVal < 400 ? '🌿 Clean — solar peak' : '⚡ Moderate — best available';
  return { window: bestHour, reason };
}

/**
 * Get grid status badge text based on carbon intensity
 */
export function getGridStatus(
  value: number
): { text: string; className: 'clean' | 'moderate' | 'dirty' } {
  if (value < 400) {
    return { text: '🌿 Grid is CLEAN right now', className: 'clean' };
  } else if (value < 700) {
    return { text: '⚡ Grid is MODERATE', className: 'moderate' };
  } else {
    return { text: '🔴 Grid is DIRTY — high emissions', className: 'dirty' };
  }
}
