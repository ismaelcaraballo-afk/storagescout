import React, { useState } from 'react';
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

// Simplified US region positions (approximate center of each ISO territory)
const REGION_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  CAISO: { x: 8, y: 52, label: 'CA' },
  WECC: { x: 15, y: 28, label: 'NW' },
  SPP: { x: 48, y: 52, label: 'GP' },
  ERCOT: { x: 48, y: 72, label: 'TX' },
  MISO: { x: 55, y: 35, label: 'MW' },
  SERC: { x: 68, y: 58, label: 'SE' },
  FRCC: { x: 78, y: 78, label: 'FL' },
  PJM: { x: 78, y: 38, label: 'MA' },
  NYISO: { x: 84, y: 24, label: 'NY' },
  ISONE: { x: 91, y: 18, label: 'NE' },
};

const levelColors = {
  clean: { fill: '#34d399', glow: 'rgba(52,211,153,0.6)', text: 'text-emerald-400' },
  moderate: { fill: '#fbbf24', glow: 'rgba(251,191,36,0.6)', text: 'text-amber-400' },
  dirty: { fill: '#f87171', glow: 'rgba(248,113,113,0.6)', text: 'text-red-400' },
};

export default function USHeatmap({ regions }: USHeatmapProps) {
  const [selected, setSelected] = useState<RegionData | null>(null);

  if (!regions || regions.length === 0) {
    return <div className="p-8 text-center text-slate-500">Waiting for regional data...</div>;
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
        <p className="text-slate-500 text-sm">Click a region to see details · Color = carbon intensity</p>
      </div>

      <div className="relative w-full" style={{ aspectRatio: '1.8 / 1' }}>
        {/* Simplified US outline background */}
        <svg viewBox="0 0 100 90" className="absolute inset-0 w-full h-full">
          {/* US mainland rough outline */}
          <path
            d="M 5,20 Q 8,15 15,12 L 25,10 Q 35,8 45,10 L 55,8 Q 65,7 75,10 L 85,12 Q 92,14 95,20 L 95,30 Q 93,35 90,38 L 88,42 Q 86,48 82,52 L 78,56 Q 80,62 82,68 L 84,75 Q 82,80 78,82 L 70,78 Q 65,72 60,68 L 55,65 Q 50,68 48,72 L 45,78 Q 42,82 38,80 L 32,75 Q 28,70 25,65 L 20,60 Q 15,55 12,50 L 8,45 Q 5,40 4,35 L 3,28 Q 4,24 5,20 Z"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Region dots */}
        {regions.map((r) => {
          const pos = REGION_POSITIONS[r.id];
          if (!pos) return null;

          const level = getCarbonLevel(r.intensity);
          const colors = levelColors[level];
          const isSelected = selected?.id === r.id;
          const dotSize = isSelected ? 'w-10 h-10' : 'w-7 h-7';

          return (
            <motion.button
              key={r.id}
              onClick={() => setSelected(isSelected ? null : r)}
              className={`absolute ${dotSize} rounded-full flex items-center justify-center cursor-pointer transition-all z-10`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: colors.fill + '20',
                border: `2px solid ${colors.fill}`,
                boxShadow: `0 0 ${isSelected ? 24 : 12}px ${colors.glow}`,
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              animate={{ scale: isSelected ? 1.15 : 1 }}
            >
              <span className="text-[9px] font-bold text-white">{pos.label}</span>
            </motion.button>
          );
        })}

        {/* Connecting lines between nearby regions */}
        <svg viewBox="0 0 100 90" className="absolute inset-0 w-full h-full pointer-events-none">
          {[
            ['CAISO', 'WECC'], ['WECC', 'SPP'], ['SPP', 'MISO'], ['SPP', 'ERCOT'],
            ['MISO', 'PJM'], ['MISO', 'SERC'], ['SERC', 'FRCC'], ['PJM', 'NYISO'], ['NYISO', 'ISONE'],
          ].map(([from, to]) => {
            const p1 = REGION_POSITIONS[from];
            const p2 = REGION_POSITIONS[to];
            if (!p1 || !p2) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
            );
          })}
        </svg>
      </div>

      {/* Selected region detail card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-bold text-lg">{selected.name}</div>
                  <div className="text-slate-500 text-xs uppercase tracking-wider">{selected.id} · {selected.region}</div>
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
                  <div className="text-sm font-semibold text-white">{selected.isDay ? '☀️ Yes' : '🌙 No'}</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <div className="text-xs text-slate-500">Solar Rad</div>
                  <div className="text-sm font-semibold text-white">{Math.round(selected.rad || 0)} W/m²</div>
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
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate (400-700)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Dirty (&gt;700)
        </div>
      </div>
    </motion.div>
  );
}
