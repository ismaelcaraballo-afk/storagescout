import React, { useEffect, useState } from 'react';
import { fetchLiveCarbonData, getBestTimeAdvice, type CarbonData } from '../services/carbonApi';
import { Leaf, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import CarbonIntensityTracker from './CarbonIntensityTracker';

const LIVE_LOCATIONS = [
  { city: 'California', state: 'CA', lat: 36.7, lon: -120.0, storageMW: 7492, curtailedGWh: 3400 },
  { city: 'Texas', state: 'TX', lat: 31.8, lon: -99.2, storageMW: 5200, curtailedGWh: 1200 },
  { city: 'Arizona', state: 'AZ', lat: 33.7, lon: -111.4, storageMW: 2100, curtailedGWh: 280 },
  { city: 'Nevada', state: 'NV', lat: 38.8, lon: -117.2, storageMW: 1800, curtailedGWh: 150 },
  { city: 'Florida', state: 'FL', lat: 27.7, lon: -81.8, storageMW: 1500, curtailedGWh: 90 },
  { city: 'New York', state: 'NY', lat: 42.7, lon: -74.9, storageMW: 1200, curtailedGWh: 120 },
  { city: 'Illinois', state: 'IL', lat: 40.3, lon: -89.0, storageMW: 900, curtailedGWh: 80 },
  { city: 'Georgia', state: 'GA', lat: 32.9, lon: -83.6, storageMW: 750, curtailedGWh: 40 },
  { city: 'Virginia', state: 'VA', lat: 37.5, lon: -78.5, storageMW: 600, curtailedGWh: 30 },
  { city: 'Colorado', state: 'CO', lat: 39.1, lon: -105.2, storageMW: 480, curtailedGWh: 60 },
];

interface LiveTrackerProps {
  onIntensityUpdate: (intensity: number) => void;
}

export default function LiveTracker({ onIntensityUpdate }: LiveTrackerProps) {
  const [data, setData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [solarData, setSolarData] = useState<any>(null);
  const [simFactor, setSimFactor] = useState(1.0);

  const fetchSolarData = async () => {
    try {
      const queries = LIVE_LOCATIONS.map(
        (loc) =>
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=direct_radiation,diffuse_radiation,temperature_2m,is_day&hourly=direct_radiation,diffuse_radiation,temperature_2m&timezone=auto`
      );
      const results = await Promise.all(queries.map((url) => fetch(url).then((r) => r.json())));
      setSolarData(results);
    } catch (err) {
      console.error('Error fetching solar data:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchLiveCarbonData('CAISO_NORTH');
      setData(result);
      setLastUpdated(new Date());
      onIntensityUpdate(result.intensity);
      setError(null);
    } catch (err) {
      setError("Failed to fetch live data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSolarData();
    const interval = setInterval(() => {
      fetchData();
      fetchSolarData();
    }, 60000 * 5);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center gap-3 text-slate-400">
          <RefreshCw size={18} className="animate-spin" />
          Connecting to WattTime & Electricity Maps APIs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertTriangle className="mx-auto mb-2" />
        {error}
      </div>
    );
  }

  const isClean = data?.isClean;
  const glowColor = isClean ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-lg shadow-black/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${data?.isMock ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${data?.isMock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            Live Carbon Intensity
            {data?.isMock && (
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 uppercase tracking-wider">
                Demo Mode
              </span>
            )}
            {!data?.isMock && data && (
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 uppercase tracking-wider">
                Live Signal
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">Real-time grid emissions (CAISO)</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-white/[0.05] rounded-full transition-colors text-slate-400"
          title="Refresh Data"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge Section with glow */}
        <div className="bg-white/[0.03] rounded-xl p-4 flex flex-col items-center justify-center border border-white/[0.06]">
          <div
            className="relative w-32 h-32 flex items-center justify-center"
            style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={isClean ? "#34d399" : "#f87171"}
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * (Math.min(data?.intensity || 0, 1000) / 1000))}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * (Math.min(data?.intensity || 0, 1000) / 1000)) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={data?.intensity}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`text-2xl font-bold ${isClean ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {data?.intensity}
              </motion.span>
              <span className="text-[10px] text-slate-500">{data?.units}</span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isClean ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.2)]' : 'bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(248,113,113,0.2)]'}`}>
              {isClean ? 'CLEAN GRID' : 'DIRTY GRID'}
            </span>
          </div>
        </div>

        {/* Marginal Emissions Detail */}
        <div className="bg-white/[0.03] rounded-xl p-4 flex flex-col justify-center border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm uppercase tracking-wider">
            <Leaf size={14} /> Marginal Emissions
          </div>
          <motion.div
            key={data?.intensity}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white mb-1"
          >
            {data?.marginalEmissions || Math.round((data?.intensity || 0) * 1.1)}
          </motion.div>
          <div className="text-xs text-slate-500 mb-4">lbs CO2/MWh (Estimated)</div>

          <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm uppercase tracking-wider">
            <Zap size={14} /> Renewables
          </div>
          <motion.div
            key={`renew-${data?.percentRenewable}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white mb-1"
          >
            {data?.percentRenewable || 0}%
          </motion.div>
          <div className="text-xs text-slate-500">Current Mix</div>
        </div>

        {/* Recommendation */}
        <div className="bg-white/[0.03] rounded-xl p-4 flex flex-col justify-center border border-white/[0.06]">
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3">Best Action</h3>
          <div className="text-lg font-medium text-white mb-2">
            {getBestTimeAdvice(data?.intensity || 0)}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isClean
              ? "Excess renewable energy is available. Batteries should be CHARGING now to soak up clean power."
              : "Grid is relying on fossil fuels. Batteries should be DISCHARGING now to displace carbon."}
          </p>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-600">
        Data Sources: WattTime API, Electricity Maps • Last Updated: {lastUpdated?.toLocaleTimeString()}
      </div>

      {/* Carbon Intensity Tracker */}
      <div className="mt-8 border-t border-white/[0.06] pt-8">
        <CarbonIntensityTracker solarData={solarData} simFactor={simFactor} />
      </div>
    </motion.div>
  );
}
