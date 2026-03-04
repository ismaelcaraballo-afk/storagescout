import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { STORAGE_GROWTH_DATA, EMISSIONS_GAP_DATA, STATE_DATA, COST_DATA } from '../data/staticData';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  Filler
);

export const StorageGrowthChart = () => {
  const data = {
    labels: STORAGE_GROWTH_DATA.map(d => d.year),
    datasets: [{
      label: 'Battery Storage (GW)',
      data: STORAGE_GROWTH_DATA.map(d => d.storage),
      backgroundColor: 'rgba(56, 189, 248, 0.7)',
      borderColor: '#38bdf8',
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  return <Bar data={data} options={options} />;
};

export const GapChart = () => {
  const data = {
    labels: EMISSIONS_GAP_DATA.map(d => d.year),
    datasets: [
      {
        label: 'Storage (GW)',
        data: EMISSIONS_GAP_DATA.map(d => d.storage),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Emissions (MMT)',
        data: EMISSIONS_GAP_DATA.map(d => d.emissions),
        borderColor: '#f87171',
        borderDash: [5, 5],
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      y: { type: 'linear' as const, position: 'left' as const, grid: { color: '#1e293b' }, ticks: { color: '#34d399' } },
      y1: { type: 'linear' as const, position: 'right' as const, grid: { drawOnChartArea: false }, ticks: { color: '#f87171' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  return <Line data={data} options={options} />;
};

export const StateChart = () => {
  const data = {
    labels: STATE_DATA.map(d => d.code),
    datasets: [{
      label: 'Capacity (MW)',
      data: STATE_DATA.map(d => d.storage),
      backgroundColor: STATE_DATA.map((_, i) => i < 2 ? 'rgba(52, 211, 153, 0.8)' : 'rgba(56, 189, 248, 0.5)'),
      borderRadius: 4,
    }]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
      y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  return <Bar data={data} options={options} />;
};

export const CostChart = () => {
  const data = {
    labels: COST_DATA.map(d => d.source),
    datasets: [{
      label: 'LCOE ($/MWh)',
      data: COST_DATA.map(d => d.cost),
      backgroundColor: COST_DATA.map(d => d.color),
      borderRadius: 6,
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', callback: (v: any) => '$' + v } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  return <Bar data={data} options={options} />;
};
