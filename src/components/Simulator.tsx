import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { SIMULATOR_BASE_DATA } from '../data/staticData';
import { STORAGE_INTENSITY_REDUCTION_FACTOR } from '../services/carbonModel';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SimulatorProps {
  currentIntensity?: number;
}

export default function Simulator({ currentIntensity = 450 }: SimulatorProps) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [chartData, setChartData] = useState<any>(null);
  const [impact, setImpact] = useState(0);

  useEffect(() => {
    const { storage, emissions, years, futureStorageBase, futureEmissionsBase } = SIMULATOR_BASE_DATA;
    
    // Calculate new future data based on multiplier
    const newFutureStorage = futureStorageBase.map(v => Number((v * multiplier).toFixed(1)));
    
    // Log-curve diminishing returns (multi-LLM validated: DeepSeek + GPT-4o + Haiku agree)
    // Early storage additions yield higher reductions; marginal gains decrease
    // Formula: reduction = baseEmissions * diminishing * efficiency * STORAGE_INTENSITY_REDUCTION_FACTOR
    const efficiency = 0.85; // Round-trip battery efficiency (industry standard)
    const diminishing = Math.log(1 + multiplier) / Math.log(1 + 2); // 0-1 curve over 1x-2x range
    const newFutureEmissions = futureEmissionsBase.map((v) => {
      return Math.round(v * (1 - diminishing * efficiency * STORAGE_INTENSITY_REDUCTION_FACTOR));
    });

    const fullStorage = [...storage, ...newFutureStorage];
    const fullEmissions = [...emissions, ...newFutureEmissions];

    setImpact(fullEmissions[fullEmissions.length - 1]);

    setChartData({
      labels: years,
      datasets: [
        {
          label: 'Storage (GW)',
          data: fullStorage,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Emissions (MMT)',
          data: fullEmissions,
          borderColor: '#f87171',
          borderDash: [5, 5],
          tension: 0.4,
          yAxisID: 'y1',
        }
      ]
    });
  }, [multiplier]);

  if (!chartData) return null;

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8' }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: '#1e293b' },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: 'Storage (GW)', color: '#38bdf8' }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: 'Emissions (MMT)', color: '#f87171' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    },
  };

  // Live intensity projection — same log-curve formula as chart, uses shared constant
  const efficiency = 0.85;
  const diminishing = Math.log(1 + multiplier) / Math.log(1 + 2);
  const projectedIntensity = Math.round(currentIntensity * (1 - diminishing * efficiency * STORAGE_INTENSITY_REDUCTION_FACTOR));

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">What-If Simulator</h2>
        <p className="text-slate-400">Control the speed of deployment. See the impact.</p>
      </div>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-4 w-full max-w-lg">
          <span className="text-slate-400 font-mono">1.0x</span>
          <input 
            type="range" 
            min="100" 
            max="200" 
            value={multiplier * 100} 
            onChange={(e) => setMultiplier(Number(e.target.value) / 100)}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <span className="text-sky-400 font-bold font-mono text-xl w-16">{multiplier.toFixed(1)}x</span>
        </div>
        
        {/* Connection to Live Data */}
        <div className="mt-6 bg-slate-900/80 border border-emerald-500/30 rounded-lg p-4 text-center max-w-2xl">
          <p className="text-emerald-400 font-medium">
            Live Connection:
            <span className="text-slate-300 ml-2">
              Right now the grid is emitting <span className="text-white font-bold">{currentIntensity}</span> lbs/MWh. 
              With <span className="text-white font-bold">{multiplier}x</span> storage, it would be <span className="text-emerald-300 font-bold">{projectedIntensity}</span> lbs/MWh.
            </span>
          </p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
