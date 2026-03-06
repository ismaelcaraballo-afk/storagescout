import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'motion/react';
import { SIMULATOR_BASE_DATA } from '../data/staticData';
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

    const newFutureStorage = futureStorageBase.map(v => Number((v * multiplier).toFixed(1)));
    const newFutureEmissions = futureEmissionsBase.map((v, i) => {
      const reduction = (newFutureStorage[i] - futureStorageBase[i]) * 2.5;
      return Math.round(v - reduction);
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
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
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
        grid: { color: 'rgba(255,255,255,0.03)' },
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

  const projectedIntensity = Math.round(currentIntensity * (1 - ((multiplier - 1) * 0.15)));
  const sliderPercent = ((multiplier - 1.0) / 1.0) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-lg shadow-black/20"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">What-If Simulator</h2>
        <p className="text-slate-400">Control the speed of deployment. See the impact.</p>
      </div>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center gap-4 w-full max-w-lg">
          <span className="text-slate-400 font-mono text-sm">1.0x</span>

          {/* Custom styled slider */}
          <div className="relative w-full h-10 flex items-center">
            <div className="absolute w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${sliderPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="100"
              max="200"
              value={multiplier * 100}
              onChange={(e) => setMultiplier(Number(e.target.value) / 100)}
              className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute w-5 h-5 rounded-full bg-sky-400 border-2 border-white shadow-[0_0_12px_rgba(56,189,248,0.5)] pointer-events-none transition-all duration-150"
              style={{ left: `calc(${sliderPercent}% - 10px)` }}
            />
          </div>

          <span className="text-sky-400 font-bold font-mono text-xl w-16">{multiplier.toFixed(1)}x</span>
        </div>

        {/* Live connection card */}
        <motion.div
          key={multiplier}
          initial={{ scale: 0.98, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4 text-center max-w-2xl backdrop-blur"
        >
          <p className="text-emerald-400 font-medium">
            Live Connection:
            <span className="text-slate-300 ml-2">
              Right now the grid is emitting <span className="text-white font-bold">{currentIntensity}</span> lbs/MWh.
              With <span className="text-white font-bold">{multiplier.toFixed(1)}x</span> storage, it would be{' '}
              <motion.span
                key={projectedIntensity}
                initial={{ scale: 1.2, color: '#6ee7b7' }}
                animate={{ scale: 1, color: '#6ee7b7' }}
                className="font-bold"
              >
                {projectedIntensity}
              </motion.span>{' '}
              lbs/MWh.
            </span>
          </p>
        </motion.div>
      </div>

      <div className="h-[300px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
}
