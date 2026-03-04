import React, { useEffect, useState } from 'react';
import { fetchLiveCarbonData, getBestTimeAdvice, type CarbonData } from '../services/carbonApi';
import { Gauge, Zap, Leaf, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveTrackerProps {
  onIntensityUpdate: (intensity: number) => void;
}

export default function LiveTracker({ onIntensityUpdate }: LiveTrackerProps) {
  const [data, setData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchLiveCarbonData('CAISO_NORTH'); // Defaulting to CAISO for demo
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
    const interval = setInterval(fetchData, 60000 * 5); // Update every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-slate-400 animate-pulse">
        Connecting to WattTime & Electricity Maps APIs...
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
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
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
          title="Refresh Data"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge Section */}
        <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col items-center justify-center border border-slate-700">
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={data?.isClean ? "#34d399" : "#f87171"} 
                  strokeWidth="10" 
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * (Math.min(data?.intensity || 0, 1000) / 1000))}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * (Math.min(data?.intensity || 0, 1000) / 1000)) }}
                  transition={{ duration: 1 }}
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className={`text-2xl font-bold ${data?.isClean ? 'text-emerald-400' : 'text-red-400'}`}>
                 {data?.intensity}
               </span>
               <span className="text-[10px] text-slate-400">{data?.units}</span>
             </div>
          </div>
          <div className="mt-2 text-center">
            <span className={`px-2 py-1 rounded text-xs font-bold ${data?.isClean ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {data?.isClean ? 'CLEAN GRID' : 'DIRTY GRID'}
            </span>
          </div>
        </div>

        {/* Marginal Emissions Detail */}
        <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col justify-center border border-slate-700">
           <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm uppercase tracking-wider">
             <Leaf size={14} /> Marginal Emissions
           </div>
           <div className="text-3xl font-bold text-white mb-1">
             {data?.marginalEmissions || Math.round((data?.intensity || 0) * 1.1)}
           </div>
           <div className="text-xs text-slate-500 mb-4">lbs CO2/MWh (Estimated)</div>
           
           <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm uppercase tracking-wider">
             <Zap size={14} /> Renewables
           </div>
           <div className="text-3xl font-bold text-white mb-1">
             {data?.percentRenewable || 0}%
           </div>
           <div className="text-xs text-slate-500">Current Mix</div>
        </div>

        {/* Recommendation */}
        <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col justify-center border border-slate-700">
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3">Best Action</h3>
          <div className="text-lg font-medium text-white mb-2">
            {getBestTimeAdvice(data?.intensity || 0)}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {data?.isClean 
              ? "Excess renewable energy is available. Batteries should be CHARGING now to soak up clean power."
              : "Grid is relying on fossil fuels. Batteries should be DISCHARGING now to displace carbon."}
          </p>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-600">
        Data Sources: WattTime API, Electricity Maps • Last Updated: {lastUpdated?.toLocaleTimeString()}
      </div>
    </div>
  );
}
