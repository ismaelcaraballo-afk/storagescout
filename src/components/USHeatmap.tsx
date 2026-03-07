import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCarbonLevel } from '../services/carbonModel';

interface RegionData {
  id: string;
  name: string;
  intensity: number;
  region: string;
  isDay?: boolean;
  rad?: number;
}

interface USHeatmapProps {
  regions: RegionData[];
}

// Positions calculated from real lat/lon centers of each ISO territory.
// x = (124 - lon) / 58 * 100   (Pacific coast = ~0%, Maine = ~100%)
// y = (49 - lat)  / 24 * 100   (Canadian border = 0%, Gulf coast = ~100%)
const REGION_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  WECC:  { x: 9,  y: 12, label: 'NW' },  // ~119°W 47°N
  CAISO: { x: 7,  y: 51, label: 'CA' },  // ~120°W 37°N
  SPP:   { x: 45, y: 51, label: 'GP' },  // ~98°W  37°N
  ERCOT: { x: 43, y: 73, label: 'TX' },  // ~99°W  31°N
  MISO:  { x: 54, y: 29, label: 'MW' },  // ~93°W  42°N
  SERC:  { x: 67, y: 63, label: 'SE' },  // ~85°W  34°N
  FRCC:  { x: 74, y: 90, label: 'FL' },  // ~81°W  28°N
  PJM:   { x: 77, y: 37, label: 'MA' },  // ~80°W  40°N
  NYISO: { x: 87, y: 26, label: 'NY' },  // ~74°W  43°N
  ISONE: { x: 92, y: 21, label: 'NE' },  // ~72°W  44°N
};

const CONNECTIONS: [string, string][] = [
  ['CAISO', 'WECC'],
  ['WECC',  'SPP'],
  ['SPP',   'MISO'],
  ['SPP',   'ERCOT'],
  ['MISO',  'PJM'],
  ['MISO',  'SERC'],
  ['SERC',  'FRCC'],
  ['PJM',   'NYISO'],
  ['NYISO', 'ISONE'],
];

const levelColors = {
  clean:    { fill: '#34d399', glow: 'rgba(52,211,153,0.55)',   text: 'text-emerald-400' },
  moderate: { fill: '#fbbf24', glow: 'rgba(251,191,36,0.55)',   text: 'text-amber-400'   },
  dirty:    { fill: '#f87171', glow: 'rgba(248,113,113,0.55)',  text: 'text-red-400'     },
};

export default function USHeatmap({ regions }: USHeatmapProps) {
  const [selected, setSelected] = useState<RegionData | null>(null);

  if (!regions || regions.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center text-slate-500">
        Waiting for regional data…
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-lg shadow-black/20"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🗺️ US Grid Carbon Map
        </h3>
        <p className="text-slate-500 text-sm">Click a region · Color = carbon intensity</p>
      </div>

      {/* Map area — 1.8:1 matches continental US proportions */}
      <div
        className="relative w-full rounded-xl bg-white/[0.015] border border-white/[0.05]"
        style={{ aspectRatio: '1.8 / 1' }}
      >
        {/* SVG layer: grid lines + connections */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Faint reference grid */}
          {[25, 50, 75].map(v => (
            <g key={v}>
              <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.035)" strokeWidth="0.4" />
              <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.035)" strokeWidth="0.4" />
            </g>
          ))}

          {/* Dashed adjacency lines */}
          {CONNECTIONS.map(([from, to]) => {
            const p1 = REGION_POSITIONS[from];
            const p2 = REGION_POSITIONS[to];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.5"
                strokeDasharray="1.5 1"
              />
            );
          })}
        </svg>

        {/* Direction labels */}
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 font-mono">N</span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 font-mono">S</span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 font-mono">W</span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 font-mono">E</span>

        {/* Region nodes */}
        {regions.map(r => {
          const pos = REGION_POSITIONS[r.id];
          if (!pos) return null;

          const level  = getCarbonLevel(r.intensity);
          const colors = levelColors[level];
          const isSelected = selected?.id === r.id;
          const size = isSelected ? 54 : 42;

          return (
            <motion.button
              key={r.id}
              onClick={() => setSelected(isSelected ? null : r)}
              className="absolute flex flex-col items-center justify-center rounded-full z-10 cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top:  `${pos.y}%`,
                width:  size,
                height: size,
                transform: 'translate(-50%, -50%)',
                backgroundColor: colors.fill + '1a',
                border: `2px solid ${colors.fill}`,
                boxShadow: `0 0 ${isSelected ? 22 : 10}px ${colors.glow}`,
              }}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: isSelected ? 1.15 : 1 }}
            >
              <span className="text-[9px] font-bold text-white leading-tight select-none">{pos.label}</span>
              <span className="text-[7px] text-white/50 leading-tight select-none">{r.intensity}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-bold text-lg">{selected.name}</div>
                  <div className="text-slate-500 text-xs uppercase tracking-wider">
                    {selected.id} · {selected.region}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${levelColors[getCarbonLevel(selected.intensity)].text}`}>
                    {selected.intensity}
                  </div>
                  <div className="text-[10px] text-slate-500">lbs CO₂/MWh</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <div className="text-xs text-slate-500">Status</div>
                  <div className={`text-sm font-semibold ${levelColors[getCarbonLevel(selected.intensity)].text}`}>
                    {getCarbonLevel(selected.intensity).toUpperCase()}
                  </div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <div className="text-xs text-slate-500">Daylight</div>
                  <div className="text-sm font-semibold text-white">
                    {selected.isDay ? '☀️ Yes' : '🌙 No'}
                  </div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <div className="text-xs text-slate-500">Solar Rad</div>
                  <div className="text-sm font-semibold text-white">
                    {Math.round(selected.rad || 0)} W/m²
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Clean (&lt;400)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate (400–700)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Dirty (&gt;700)
        </div>
      </div>
    </motion.div>
  );
}
