import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import {
  GRID_REGIONS,
  CARBON_THRESHOLDS,
  CARBON_COLORS,
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

const levelColors = {
  clean: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'rgba(52,211,153,0.3)' },
  moderate: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'rgba(251,191,36,0.3)' },
  dirty: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'rgba(248,113,113,0.3)' },
};

export const CarbonIntensityTracker: React.FC<CarbonTrackerProps> = ({ solarData, simFactor = 1.0 }) => {
  const [carbonData, setCarbonData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any>(null);
  const [currentIntensity, setCurrentIntensity] = useState<number>(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!solarData) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const currentHour = now.getHours();

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

      const weights = [1.5, 2.0, 3.5, 1.2, 1.0, 0.8, 0.9, 1.0, 1.5, 0.8];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const national = Math.round(
        data.reduce((acc, r, i) => acc + (r ? r.intensity * weights[i] : 0), 0) / totalWeight
      );
      setCurrentIntensity(national);

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
    return <div className="p-8 text-center text-red-400">Error: {error}</div>;
  }

  const gridStatus = getGridStatus(currentIntensity);
  const bestWindow = getBestChargeWindow(hourlyData);
  const cleanest = [...carbonData].sort((a, b) => a.intensity - b.intensity)[0];
  const dirtiest = [...carbonData].sort((a, b) => b.intensity - a.intensity)[0];
  const level = getCarbonLevel(currentIntensity);
  const colors = levelColors[level];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          ⚡ Live Grid Carbon Intensity
        </h2>
        <p className="text-slate-400 text-sm mt-1">Real-time CO₂ emissions per unit of electricity — Updates every 5 minutes</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">US Avg (lbs CO₂/MWh)</div>
          <div className={`text-2xl font-bold ${colors.text}`}>{currentIntensity}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Cleanest Region Now</div>
          <div className="text-lg font-bold text-emerald-400">{cleanest?.name}</div>
          <div className="text-sm text-emerald-400/70">{cleanest?.intensity} lbs</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Dirtiest Region Now</div>
          <div className="text-lg font-bold text-red-400">{dirtiest?.name}</div>
          <div className="text-sm text-red-400/70">{dirtiest?.intensity} lbs</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Best Charge Window</div>
          <div className="text-lg font-bold text-amber-400">{bestWindow.window}</div>
          <div className="text-xs text-slate-500 mt-1">{bestWindow.reason}</div>
        </motion.div>
      </div>

      {/* Gauge + Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CarbonGauge value={currentIntensity} />
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Regional Grid Carbon Intensity</h3>
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

/** SVG Gauge with glow effect */
const CarbonGauge: React.FC<{ value: number }> = ({ value }) => {
  const level = getCarbonLevel(value);
  const color = CARBON_COLORS[level].solid;
  const colors = levelColors[level];

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06] flex flex-col items-center"
    >
      <h3 className="text-lg font-semibold text-white mb-1">US Grid Intensity Now</h3>
      <div className="text-xs text-slate-500 mb-4">Weighted national average · lbs CO₂/MWh</div>
      <div className="relative" style={{ filter: `drop-shadow(0 0 24px ${colors.glow})` }}>
        <svg viewBox="0 0 220 130" className="w-56 h-auto">
          {/* Track */}
          <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
          {/* Fill */}
          <motion.path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {/* Tick labels */}
          <text x="14" y="126" fill="#475569" fontSize="9" textAnchor="middle">0</text>
          <text x="110" y="17" fill="#475569" fontSize="9" textAnchor="middle">600</text>
          <text x="207" y="126" fill="#475569" fontSize="9" textAnchor="middle">1200</text>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
          <motion.div
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold"
            style={{ color }}
          >
            {value}
          </motion.div>
          <div className="text-[10px] text-slate-500">lbs CO₂ / MWh</div>
        </div>
      </div>
      <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} ${colors.border} border`}
        style={{ boxShadow: `0 0 16px ${colors.glow}` }}>
        {getGridStatus(value).text}
      </div>
    </motion.div>
  );
};

/** Zone cards grid */
const CarbonZoneCards: React.FC<{ regions: any[] }> = ({ regions }) => {
  const sorted = [...regions].sort((a, b) => a.intensity - b.intensity);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
      {sorted.map((r, i) => {
        const level = getCarbonLevel(r.intensity);
        const colors = levelColors[level];
        const trend = r.isDay && r.rad > 300 ? 'improving' : r.isDay ? 'stable' : 'worsening';
        const trendLabel = trend === 'improving' ? '↓ Solar reducing' : trend === 'worsening' ? '↑ No solar' : '→ Stable';
        const trendColor = trend === 'improving' ? 'text-emerald-400' : trend === 'worsening' ? 'text-red-400' : 'text-slate-400';

        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white/[0.02] rounded-lg p-3 border border-white/[0.06] hover:border-white/[0.12] transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold text-white">{r.name}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{r.id}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${colors.text}`}>{r.intensity}</div>
                <div className="text-[10px] text-slate-500">lbs/MWh</div>
              </div>
            </div>
            <div className={`text-[10px] mt-2 ${trendColor}`}>{trendLabel}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

/** Hourly chart */
const CarbonHourlyChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = data.labels.map((label: string, idx: number) => ({
    time: label,
    intensity: data.values[idx],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] rounded-xl p-6 border border-white/[0.06]"
    >
      <h3 className="text-lg font-semibold text-white mb-1">CAISO Carbon Intensity — Today</h3>
      <div className="text-xs text-slate-500 mb-4">Modeled hourly intensity for California grid · lower = more renewable</div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            formatter={(value: number) => [`${value} lbs CO₂/MWh`, 'Intensity']}
          />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

/** Simulator bridge */
const CarbonSimulatorBridge: React.FC<{ currentIntensity: number; simFactor: number }> = ({
  currentIntensity,
  simFactor,
}) => {
  const reductionPct = (simFactor - 1.0) * 0.12;
  const projectedIntensity = Math.round(currentIntensity * (1 - reductionPct));
  const gridLoad = 400000;
  const tonsAvoided = Math.round((currentIntensity - projectedIntensity) * gridLoad / 2000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-sky-500/[0.04] border border-sky-500/20 rounded-xl p-6 backdrop-blur"
    >
      <div className="text-sky-400 text-sm font-semibold mb-3">⚡ Connected to What-If Simulator</div>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        Right now the US grid emits approximately <span className="text-white font-bold">{currentIntensity}</span> lbs CO₂/MWh. If storage deployment
        was at <span className="text-white font-bold">{simFactor.toFixed(1)}x</span>, projected intensity drops to <span className="text-emerald-400 font-bold">{projectedIntensity}</span> lbs CO₂/MWh — a reduction of <span className="text-white font-bold">{Math.round(reductionPct * 100)}%</span>.
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{currentIntensity}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Current (lbs/MWh)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{projectedIntensity}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">At Simulator Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{tonsAvoided.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Tons Avoided/Hr</div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarbonIntensityTracker;
