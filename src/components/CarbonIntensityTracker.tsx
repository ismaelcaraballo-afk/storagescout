import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import {
  GRID_REGIONS,
  CARBON_THRESHOLDS,
  CARBON_COLORS,
  STORAGE_INTENSITY_REDUCTION_FACTOR,
  getCarbonLevel,
  modelCarbonIntensity,
  buildHourlyCarbonCurve,
  getBestChargeWindow,
  getGridStatus,
} from '../services/carbonModel';

interface CarbonTrackerProps {
  solarData?: any;
  simFactor?: number;
}

export const CarbonIntensityTracker: React.FC<CarbonTrackerProps> = ({ solarData, simFactor = 1.0 }) => {
  const [carbonData, setCarbonData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any>(null);
  const [currentIntensity, setCurrentIntensity] = useState<number>(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate carbon intensity for all regions when solar data updates
  useEffect(() => {
    if (!solarData) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const currentHour = now.getHours();

      // Calculate intensity for each region
      const data = GRID_REGIONS.map((region, idx) => {
        const solarLoc = solarData[idx];
        if (!solarLoc?.current) return null;

        const direct = solarLoc.current.direct_radiation || 0;
        const diffuse = solarLoc.current.diffuse_radiation || 0;
        const totalRad = direct + diffuse;
        const temp = solarLoc.current.temperature_2m || 20;
        const isDay = solarLoc.current.is_day === 1;

        const intensity = modelCarbonIntensity(region, totalRad, temp, isDay, currentHour);

        return {
          id: region.id,
          name: region.name,
          region: region.region,
          intensity,
          isDay,
          rad: totalRad,
        };
      }).filter(Boolean);

      setCarbonData(data);

      // Calculate weighted national average
      const weights = [1.5, 2.0, 3.5, 1.2, 1.0, 0.8, 0.9, 1.0, 1.5, 0.8];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const national = Math.round(
        data.reduce((acc, r, i) => acc + (r ? r.intensity * weights[i] : 0), 0) / totalWeight
      );
      setCurrentIntensity(national);

      // Build hourly forecast
      if (solarData[0]?.hourly) {
        const hourly = buildHourlyCarbonCurve(solarData[0], 0);
        setHourlyData(hourly);
      }

      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error calculating carbon intensity:', err);
      setError('Failed to calculate carbon intensity');
      setLoading(false);
    }
  }, [solarData]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Modeling live grid carbon intensity...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <div className="mb-3">Error: {error}</div>
        <button
          className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 text-sm"
          onClick={() => { setError(null); setLoading(true); }}
        >
          Retry
        </button>
      </div>
    );
  }

  const gridStatus = getGridStatus(currentIntensity);
  const bestWindow = getBestChargeWindow(hourlyData);
  const cleanest = [...carbonData].sort((a, b) => a.intensity - b.intensity)[0];
  const dirtiest = [...carbonData].sort((a, b) => b.intensity - a.intensity)[0];

  return (
    <div className="carbon-tracker">
      {/* Header */}
      <div className="carbon-header">
        <h2>⚡ Live Grid Carbon Intensity</h2>
        <p>Real-time CO₂ emissions per unit of electricity — Updates every 5 minutes</p>
      </div>

      {/* Summary Stats */}
      <div className="carbon-stats">
        <div className="stat-card">
          <div className="stat-label">US Avg (lbs CO₂/MWh)</div>
          <div className={`stat-value ${gridStatus.className}`}>{currentIntensity}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cleanest Region Now</div>
          <div className="stat-value green">{cleanest?.name} {cleanest?.intensity}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dirtiest Region Now</div>
          <div className="stat-value red">{dirtiest?.name} {dirtiest?.intensity}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Charge Window</div>
          <div className="stat-value amber">{bestWindow.window}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="carbon-main">
        {/* Gauge */}
        <CarbonGauge value={currentIntensity} />

        {/* Zone Cards */}
        <div className="carbon-zones">
          <h3>Regional Grid Carbon Intensity</h3>
          <CarbonZoneCards regions={carbonData} />
        </div>
      </div>

      {/* Hourly Chart */}
      {hourlyData && <CarbonHourlyChart data={hourlyData} />}

      {/* Simulator Bridge */}
      <CarbonSimulatorBridge currentIntensity={currentIntensity} simFactor={simFactor} />
    </div>
  );
};

/**
 * SVG Gauge for carbon intensity visualization
 */
const CarbonGauge: React.FC<{ value: number }> = ({ value }) => {
  const level = getCarbonLevel(value);
  const color = CARBON_COLORS[level].solid;

  // Arc path calculation (half-circle from 180° to 0°)
  const pct = Math.min(value / 1200, 1);
  const startAngle = Math.PI;
  const endAngle = Math.PI - pct * Math.PI;
  const x1 = 110 + 90 * Math.cos(startAngle);
  const y1 = 110 + 90 * Math.sin(startAngle);
  const x2 = 110 + 90 * Math.cos(endAngle);
  const y2 = 110 + 90 * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;

  const arcPath = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A 90 90 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;

  return (
    <div className="carbon-gauge">
      <h3>US Grid Intensity Now</h3>
      <div className="gauge-subtitle">Weighted national average · lbs CO₂/MWh</div>
      <div className="gauge-container">
        <svg viewBox="0 0 220 130" className="gauge-svg">
          {/* Track arc */}
          <path d="M 20 110 A 90 90 0 0 1 200 110" className="gauge-track" />
          {/* Fill arc */}
          <path d={arcPath} className="gauge-fill" stroke={color} />
          {/* Tick marks */}
          <line x1="20" y1="110" x2="28" y2="110" stroke="#334155" strokeWidth="1.5" />
          <line x1="200" y1="110" x2="192" y2="110" stroke="#334155" strokeWidth="1.5" />
          <line x1="110" y1="20" x2="110" y2="30" stroke="#334155" strokeWidth="1.5" />
          {/* Labels */}
          <text x="14" y="126" fill="#475569" fontSize="9" textAnchor="middle">
            0
          </text>
          <text x="110" y="17" fill="#475569" fontSize="9" textAnchor="middle">
            600
          </text>
          <text x="207" y="126" fill="#475569" fontSize="9" textAnchor="middle">
            1200
          </text>
        </svg>
        <div className="gauge-center">
          <div className="gauge-number" style={{ color }}>
            {value}
          </div>
          <div className="gauge-unit">lbs CO₂ / MWh</div>
        </div>
      </div>
      <div className={`grid-status-badge ${level}`}>{getGridStatus(value).text}</div>
    </div>
  );
};

/**
 * Zone cards for regional carbon intensity
 */
const CarbonZoneCards: React.FC<{ regions: any[] }> = ({ regions }) => {
  const sorted = [...regions].sort((a, b) => a.intensity - b.intensity);

  return (
    <div className="zone-grid">
      {sorted.map((r) => {
        const level = getCarbonLevel(r.intensity);
        const trend = r.isDay && r.rad > 300 ? 'improving' : r.isDay ? 'stable' : 'worsening';
        const trendLabel = trend === 'improving' ? '↓ Solar reducing' : trend === 'worsening' ? '↑ No solar' : '→ Stable';

        return (
          <div key={r.id} className={`zone-card zone-${level}`}>
            <div className="zone-name">{r.name}</div>
            <div className="zone-region">{r.id}</div>
            <div className={`zone-co2 ${level}`}>{r.intensity}</div>
            <div className="zone-unit">lbs CO₂/MWh</div>
            <div className={`zone-trend ${trend}`}>{trendLabel}</div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Hourly carbon intensity chart
 */
const CarbonHourlyChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = data.labels.map((label: string, idx: number) => ({
    time: label,
    intensity: data.values[idx],
  }));

  return (
    <div className="carbon-hourly-card">
      <h3>CAISO Carbon Intensity — Today</h3>
      <div className="subtitle">Modeled hourly intensity for California grid · lower = more renewable</div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            formatter={(value: number) => [`${value} lbs CO₂/MWh`, 'Intensity']}
          />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#38bdf8"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Bridge connecting carbon tracker to simulator
 */
const CarbonSimulatorBridge: React.FC<{ currentIntensity: number; simFactor: number }> = ({
  currentIntensity,
  simFactor,
}) => {
  const reductionPct = (simFactor - 1.0) * STORAGE_INTENSITY_REDUCTION_FACTOR;
  const projectedIntensity = Math.round(currentIntensity * (1 - reductionPct));

  // US grid avg: ~400,000 MWh/hr
  const gridLoad = 400000;
  const tonsAvoided = Math.round((currentIntensity - projectedIntensity) * gridLoad / 2000);

  return (
    <div className="carbon-bridge">
      <div className="bridge-label">⚡ Connected to What-If Simulator</div>
      <div className="bridge-text">
        Right now the US grid emits approximately <strong>{currentIntensity}</strong> lbs CO₂/MWh. If storage deployment
        was at <strong>{simFactor.toFixed(1)}x</strong>, projected intensity drops to <strong>{projectedIntensity}</strong>
        {' '}lbs CO₂/MWh — a reduction of <strong>{Math.round(reductionPct * 100)}%</strong>.
      </div>
      <div className="bridge-numbers">
        <div className="bridge-num">
          <div className="bn-val" style={{ color: '#f87171' }}>
            {currentIntensity}
          </div>
          <div className="bn-label">Current (lbs/MWh)</div>
        </div>
        <div className="bridge-num">
          <div className="bn-val" style={{ color: '#fbbf24' }}>
            {projectedIntensity}
          </div>
          <div className="bn-label">At Simulator Rate</div>
        </div>
        <div className="bridge-num">
          <div className="bn-val" style={{ color: '#34d399' }}>
            {tonsAvoided.toLocaleString()}
          </div>
          <div className="bn-label">Tons Avoided/Hr</div>
        </div>
      </div>
    </div>
  );
};

export default CarbonIntensityTracker;
