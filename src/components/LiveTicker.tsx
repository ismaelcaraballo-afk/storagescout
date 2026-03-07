import React, { useEffect, useRef, useState } from 'react';
import { getCarbonLevel } from '../services/carbonModel';

interface TickerRegion {
  id: string;
  name: string;
  intensity: number;
  isDay?: boolean;
  rad?: number;
}

interface LiveTickerProps {
  regions: TickerRegion[];
}

const levelColors = {
  clean: 'text-emerald-400',
  moderate: 'text-amber-400',
  dirty: 'text-red-400',
};

const regionLinks: Record<string, string> = {
  CAISO: 'https://www.caiso.com/todaysoutlook',
  ERCOT: 'https://www.ercot.com/gridmktinfo/dashboards',
  PJM: 'https://www.pjm.com/markets-and-operations',
  MISO: 'https://www.misoenergy.org/markets-and-operations/',
  SPP: 'https://www.spp.org/markets-operations/',
  NYISO: 'https://www.nyiso.com/real-time-dashboard',
  ISONE: 'https://www.iso-ne.com/isoexpress/',
  WECC: 'https://www.wecc.org/',
  SERC: 'https://www.epa.gov/egrid/power-profiler#/SRSO',
  FRCC: 'https://www.eia.gov/electricity/gridmonitor/dashboard/electric_overview/regional/REG-FLA',
};

const trendArrow = (r: TickerRegion) => {
  if (r.isDay && (r.rad || 0) > 300) return '↓';
  if (!r.isDay) return '↑';
  return '→';
};

export default function LiveTicker({ regions }: LiveTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let pos = 0;

    const animate = () => {
      if (!paused) {
        pos += 0.5;
        if (pos >= el.scrollWidth / 2) pos = 0;
        el.scrollLeft = pos;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [paused]);

  if (!regions || regions.length === 0) return null;

  const cleanCount = regions.filter(r => getCarbonLevel(r.intensity) === 'clean').length;
  const sorted = [...regions].sort((a, b) => a.intensity - b.intensity);

  // Build ticker items — duplicate for seamless loop
  const items = [...sorted, ...sorted];

  return (
    <div
      className="bg-white/[0.02] border-b border-white/[0.06] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center">
        {/* Fixed label */}
        <div className="flex-shrink-0 bg-emerald-500/10 border-r border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            LIVE GRID
          </span>
        </div>

        {/* Scrolling ticker */}
        <div
          ref={scrollRef}
          className="overflow-hidden whitespace-nowrap py-2.5"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="inline-flex items-center gap-8 px-4">
            {items.map((r, i) => {
              const level = getCarbonLevel(r.intensity);
              const arrow = trendArrow(r);

              return (
                <a
                  key={`${r.id}-${i}`}
                  href={regionLinks[r.id] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs hover:bg-white/[0.05] px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  <span className="text-slate-500 font-medium">{r.id}</span>
                  <span className={`font-bold font-mono ${levelColors[level]}`}>
                    {r.intensity}
                  </span>
                  <span className={`${levelColors[level]} text-[10px]`}>{arrow}</span>
                  <span className="text-slate-600">lbs/MWh</span>
                  <span className="text-slate-700 ml-2">•</span>
                </a>
              );
            })}

            {/* Summary items in ticker */}
            <span className="inline-flex items-center gap-2 text-xs">
              <span className="text-sky-400 font-bold">{cleanCount}/{regions.length}</span>
              <span className="text-slate-500">regions clean</span>
              <span className="text-slate-700 ml-2">•</span>
            </span>
            <span className="inline-flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-bold">Best:</span>
              <span className="text-slate-400">{sorted[0]?.name} ({sorted[0]?.intensity})</span>
              <span className="text-slate-700 ml-2">•</span>
            </span>
            <span className="inline-flex items-center gap-2 text-xs">
              <span className="text-red-400 font-bold">Worst:</span>
              <span className="text-slate-400">{sorted[sorted.length - 1]?.name} ({sorted[sorted.length - 1]?.intensity})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
