/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Activity, Zap, AlertTriangle, Map, TrendingDown } from 'lucide-react';
import LiveTracker from './components/LiveTracker';
import Simulator from './components/Simulator';
import { StorageGrowthChart, GapChart, StateChart, CostChart } from './components/Charts';
import { STATE_DATA } from './data/staticData';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live'>('dashboard');
  const [selectedState, setSelectedState] = useState(STATE_DATA[0]);
  const [currentIntensity, setCurrentIntensity] = useState(450); // Default fallback

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans selection:bg-sky-500/30">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-slate-900 to-slate-800 border-b border-slate-800 pt-10 pb-8 px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400 mb-4"
        >
          StorageScout
        </motion.h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Where should the next battery be built? Explore how energy storage deployment impacts emissions across the U.S.
        </p>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0f1a]/95 backdrop-blur border-b border-slate-800 flex justify-center">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-8 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'dashboard' ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Simulator & Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('live')}
          className={`px-8 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'live' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <div className="text-center">
            <div className="text-3xl font-bold text-sky-400">26 GW</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">US Storage Installed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">93%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Cost Decline (2010-24)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">3.4M MWh</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Energy Wasted (CA)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">2,300 GW</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Stuck in Queue</div>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Narrative Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <div className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-2">Setup</div>
                <div className="text-2xl font-bold text-white mb-2">$2.3 Trillion</div>
                <p className="text-slate-400 text-sm leading-relaxed">Global clean energy investment in 2025. Battery costs have fallen 93%. The money has voted.</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Conflict</div>
                <div className="text-2xl font-bold text-white mb-2">Storage +200%</div>
                <p className="text-slate-400 text-sm leading-relaxed">But emissions are barely moving. 2,300 GW of projects are stuck in approval queues.</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Resolution</div>
                <div className="text-2xl font-bold text-white mb-2">3.5M Jobs</div>
                <p className="text-slate-400 text-sm leading-relaxed">States investing in storage are winning. The two fastest-growing jobs in the US are in renewable energy.</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><BarChart3 size={18} /> US Battery Storage Capacity</h3>
                <p className="text-slate-500 text-sm mb-4">Gigawatts installed, 2019-2024 (EIA)</p>
                <div className="h-64"><StorageGrowthChart /></div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2"><TrendingDown size={18} /> The Gap: Storage vs Emissions</h3>
                <p className="text-slate-500 text-sm mb-4">Storage surging, emissions barely moving</p>
                <div className="h-64"><GapChart /></div>
              </div>
            </div>

            {/* State Explorer */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Map size={18} /> State Explorer</h3>
                  <p className="text-slate-500 text-sm">Pick a state to see its storage story</p>
                </div>
                <select 
                  className="mt-4 md:mt-0 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
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
                <div className="bg-slate-900/80 p-6 rounded-lg border-l-4 border-sky-500">
                  <h4 className="text-white font-bold mb-2">{selectedState.name} Snapshot</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Storage</span>
                      <span className="text-sky-400 font-mono">{selectedState.storage} MW</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Renewables</span>
                      <span className="text-emerald-400 font-mono">{selectedState.renewable} TWh</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Curtailed</span>
                      <span className="text-amber-400 font-mono">{selectedState.curtailed} GWh</span>
                    </div>
                  </div>
                  <div className="mt-4 text-slate-300 text-sm italic leading-relaxed">
                    "{selectedState.insight}"
                  </div>
                </div>
              </div>
            </div>

            {/* Simulator */}
            <Simulator currentIntensity={currentIntensity} />

            {/* Cost Chart */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold mb-1">Why This Is Happening: The Cost Collapse</h3>
              <p className="text-slate-500 text-sm mb-4">Levelized cost of energy by source, $/MWh (IRENA/Lazard)</p>
              <div className="h-64"><CostChart /></div>
            </div>

          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <LiveTracker onIntensityUpdate={setCurrentIntensity} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Why Real-Time Matters</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  The grid's carbon intensity changes every 5 minutes. When the grid is "dirty" (high intensity), that's when stored clean energy should be discharging.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  This live tracker connects the historical data to the present moment. It proves that the problem of curtailment and dirty peaks is happening <span className="text-white font-bold">right now</span>.
                </p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex items-center justify-center">
                <div className="text-center">
                   <Activity size={48} className="text-emerald-400 mx-auto mb-4" />
                   <div className="text-xl font-bold text-white">Live Data Connected</div>
                   <div className="text-sm text-slate-500 mt-2">WattTime • Electricity Maps • Open-Meteo</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-8 text-center text-slate-600 text-sm">
        <p>Data: EIA | IRENA | BLS | IEA | Open-Meteo | BloombergNEF</p>
        <p className="mt-2">Built by Ismael, Kevin & Juan — Pursuit Cycle 3</p>
      </footer>
    </div>
  );
}

export default App;

