/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { BarChart3, Activity, Zap, AlertTriangle, Map, TrendingDown } from 'lucide-react';
import LiveTracker from './components/LiveTracker';
import Simulator from './components/Simulator';
import { StorageGrowthChart, GapChart, StateChart, CostChart } from './components/Charts';
import { STATE_DATA } from './data/staticData';

/** Animated counter that counts up from 0 when scrolled into view */
function AnimatedStat({ value, suffix = '', color }: { value: string; suffix?: string; color: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
    const prefix = value.replace(/[0-9.,]+.*/, '');
    const afterNum = value.replace(/.*?[0-9.,]+/, '');
    if (isNaN(numericPart)) { setDisplay(value); return; }

    const duration = 1200;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = numericPart * eased;

      if (numericPart >= 100) {
        setDisplay(prefix + Math.round(current).toLocaleString() + afterNum);
      } else {
        setDisplay(prefix + current.toFixed(1) + afterNum);
      }

      if (step >= steps) {
        clearInterval(timer);
        setDisplay(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className={`text-3xl font-bold ${color}`}>
      {display}{suffix}
    </span>
  );
}

/** Glassmorphism card wrapper */
function GlassCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live'>('dashboard');
  const [selectedState, setSelectedState] = useState(STATE_DATA[0]);
  const [currentIntensity, setCurrentIntensity] = useState(450);

  return (
    <div className="min-h-screen bg-[#060a13] text-slate-200 font-sans selection:bg-sky-500/30">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_70%)]" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.04),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <header className="relative border-b border-white/[0.06] pt-12 pb-10 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.03] to-transparent" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 mb-4 tracking-tight">
              StorageScout
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Where should the next battery be built? Explore how energy storage deployment impacts emissions across the U.S.
            </p>
          </motion.div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-[#060a13]/90 backdrop-blur-xl border-b border-white/[0.06] flex justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'dashboard' ? 'border-sky-400 text-sky-400 shadow-[0_2px_20px_rgba(56,189,248,0.15)]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Simulator & Dashboard
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-8 py-4 text-sm font-semibold transition-all border-b-2 ${activeTab === 'live' ? 'border-emerald-400 text-emerald-400 shadow-[0_2px_20px_rgba(52,211,153,0.15)]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Tracker
            </span>
          </button>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-white/[0.02] backdrop-blur-xl p-6 rounded-2xl border border-white/[0.06]"
          >
            <div className="text-center">
              <AnimatedStat value="26" suffix=" GW" color="text-sky-400" />
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">US Storage Installed</div>
            </div>
            <div className="text-center">
              <AnimatedStat value="93" suffix="%" color="text-emerald-400" />
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Cost Decline (2010-24)</div>
            </div>
            <div className="text-center">
              <AnimatedStat value="3.4M" suffix=" MWh" color="text-red-400" />
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Energy Wasted (CA)</div>
            </div>
            <div className="text-center">
              <AnimatedStat value="2,300" suffix=" GW" color="text-amber-400" />
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Stuck in Queue</div>
            </div>
          </motion.div>

          {activeTab === 'dashboard' ? (
            <div className="space-y-8">
              {/* Narrative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <GlassCard className="p-6 hover:border-sky-500/20 transition-colors" delay={0.1}>
                  <div className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-2">Setup</div>
                  <div className="text-2xl font-bold text-white mb-2">$2.3 Trillion</div>
                  <p className="text-slate-400 text-sm leading-relaxed">Global clean energy investment in 2025. Battery costs have fallen 93%. The money has voted.</p>
                </GlassCard>
                <GlassCard className="p-6 hover:border-red-500/20 transition-colors" delay={0.2}>
                  <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Conflict</div>
                  <div className="text-2xl font-bold text-white mb-2">Storage +200%</div>
                  <p className="text-slate-400 text-sm leading-relaxed">But emissions are barely moving. 2,300 GW of projects are stuck in approval queues.</p>
                </GlassCard>
                <GlassCard className="p-6 hover:border-emerald-500/20 transition-colors" delay={0.3}>
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Resolution</div>
                  <div className="text-2xl font-bold text-white mb-2">3.5M Jobs</div>
                  <p className="text-slate-400 text-sm leading-relaxed">States investing in storage are winning. The two fastest-growing jobs in the US are in renewable energy.</p>
                </GlassCard>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard className="p-6" delay={0.15}>
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><BarChart3 size={18} className="text-sky-400" /> US Battery Storage Capacity</h3>
                  <p className="text-slate-500 text-sm mb-4">Gigawatts installed, 2019-2024 (EIA)</p>
                  <div className="h-64"><StorageGrowthChart /></div>
                </GlassCard>
                <GlassCard className="p-6" delay={0.25}>
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><TrendingDown size={18} className="text-red-400" /> The Gap: Storage vs Emissions</h3>
                  <p className="text-slate-500 text-sm mb-4">Storage surging, emissions barely moving</p>
                  <div className="h-64"><GapChart /></div>
                </GlassCard>
              </div>

              {/* State Explorer */}
              <GlassCard className="p-6" delay={0.1}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Map size={18} className="text-amber-400" /> State Explorer</h3>
                    <p className="text-slate-500 text-sm">Pick a state to see its storage story</p>
                  </div>
                  <select
                    className="mt-4 md:mt-0 bg-white/[0.03] border border-white/[0.1] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500/50 outline-none backdrop-blur-xl"
                    value={selectedState.code}
                    onChange={(e) => setSelectedState(STATE_DATA.find(s => s.code === e.target.value) || STATE_DATA[0])}
                  >
                    {STATE_DATA.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="h-64 w-full">
                    <StateChart />
                  </div>
                  <div className="bg-white/[0.03] backdrop-blur p-6 rounded-xl border-l-4 border-sky-500">
                    <h4 className="text-white font-bold mb-2">{selectedState.name} Snapshot</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-slate-400">Storage</span>
                        <span className="text-sky-400 font-mono">{selectedState.storage} MW</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-slate-400">Renewables</span>
                        <span className="text-emerald-400 font-mono">{selectedState.renewable} TWh</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-slate-400">Curtailed</span>
                        <span className="text-amber-400 font-mono">{selectedState.curtailed} GWh</span>
                      </div>
                    </div>
                    <div className="mt-4 text-slate-300 text-sm italic leading-relaxed">
                      "{selectedState.insight}"
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Simulator */}
              <Simulator currentIntensity={currentIntensity} />

              {/* Cost Chart */}
              <GlassCard className="p-6" delay={0.1}>
                <h3 className="text-lg font-semibold mb-1">Why This Is Happening: The Cost Collapse</h3>
                <p className="text-slate-500 text-sm mb-4">Levelized cost of energy by source, $/MWh (IRENA/Lazard)</p>
                <div className="h-64"><CostChart /></div>
              </GlassCard>

            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <LiveTracker onIntensityUpdate={setCurrentIntensity} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Why Real-Time Matters</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    The grid's carbon intensity changes every 5 minutes. When the grid is "dirty" (high intensity), that's when stored clean energy should be discharging.
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    This live tracker connects the historical data to the present moment. It proves that the problem of curtailment and dirty peaks is happening <span className="text-white font-bold">right now</span>.
                  </p>
                </GlassCard>
                <GlassCard className="p-6 flex items-center justify-center">
                  <div className="text-center">
                     <div className="inline-flex p-4 rounded-full bg-emerald-500/10 mb-4">
                       <Activity size={48} className="text-emerald-400" />
                     </div>
                     <div className="text-xl font-bold text-white">Live Data Connected</div>
                     <div className="text-sm text-slate-500 mt-2">WattTime • Electricity Maps • Open-Meteo</div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] mt-12 py-8 text-center text-slate-600 text-sm">
          <p>Data: EIA | IRENA | BLS | IEA | Open-Meteo | BloombergNEF</p>
          <p className="mt-2">Built by Ismael, Kevin & Juan — Pursuit Cycle 3</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
