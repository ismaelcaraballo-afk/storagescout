// Static data from the PRD

export const STORAGE_GROWTH_DATA = [
  { year: '2019', storage: 1.2 },
  { year: '2020', storage: 1.8 },
  { year: '2021', storage: 4.4 },
  { year: '2022', storage: 8.9 },
  { year: '2023', storage: 16.2 },
  { year: '2024', storage: 26.0 },
];

export const EMISSIONS_GAP_DATA = [
  { year: '2019', storage: 1.2, emissions: 1724 },
  { year: '2020', storage: 1.8, emissions: 1570 },
  { year: '2021', storage: 4.4, emissions: 1653 },
  { year: '2022', storage: 8.9, emissions: 1640 },
  { year: '2023', storage: 16.2, emissions: 1584 },
  { year: '2024', storage: 26.0, emissions: 1546 },
];

export const STATE_DATA = [
  { code: 'CA', name: 'California', storage: 7492, renewable: 105, curtailed: 3400, emissions: 58, insight: "California leads in storage but also leads in curtailment -- 3.4M MWh of clean energy wasted in 2024. More storage directly solves this." },
  { code: 'TX', name: 'Texas', storage: 5200, renewable: 145, curtailed: 1200, emissions: 198, insight: "Texas has the most renewable generation AND the most emissions. Storage is growing 70x since 2020 but fossil gas still dominates. Biggest opportunity in the country." },
  { code: 'AZ', name: 'Arizona', storage: 2100, renewable: 18, curtailed: 280, emissions: 34, insight: "Arizona has massive solar potential but limited storage. With 300+ days of sunshine, even moderate storage additions have outsized impact." },
  { code: 'NV', name: 'Nevada', storage: 1800, renewable: 14, curtailed: 150, emissions: 11, insight: "Nevada punches above its weight -- strong policy support and the Gemini solar+storage project (690 MW) is one of the largest in the world." },
  { code: 'FL', name: 'Florida', storage: 1500, renewable: 22, curtailed: 90, emissions: 114, insight: "Florida has enormous solar potential but lags in policy. Storage deployment is growing but well behind its potential given population and demand." },
  { code: 'NY', name: 'New York', storage: 1200, renewable: 38, curtailed: 120, emissions: 33, insight: "New York has aggressive 2030 targets (6 GW storage) but is behind schedule. Grid congestion upstate wastes wind energy that downstate needs." },
  { code: 'IL', name: 'Illinois', storage: 900, renewable: 28, curtailed: 80, emissions: 48, insight: "Illinois benefits from strong wind resources and the Climate and Equitable Jobs Act. Storage is growing but interconnection delays are slowing deployment." },
  { code: 'GA', name: 'Georgia', storage: 750, renewable: 16, curtailed: 40, emissions: 55, insight: "Georgia is a surprise riser -- solar is booming thanks to utility-scale projects, but storage is just starting to follow." },
  { code: 'VA', name: 'Virginia', storage: 600, renewable: 12, curtailed: 30, emissions: 30, insight: "Virginia's Clean Economy Act targets 3.1 GW of storage by 2035. Currently behind but policy framework is strong." },
  { code: 'CO', name: 'Colorado', storage: 480, renewable: 22, curtailed: 60, emissions: 32, insight: "Colorado has strong renewable resources and Xcel Energy is driving utility-scale storage. Rural areas have the most untapped potential." }
];

export const COST_DATA = [
  { source: 'Solar PV', cost: 43, color: '#fbbf24' },
  { source: 'Onshore Wind', cost: 34, color: '#38bdf8' },
  { source: 'Battery Storage', cost: 65, color: '#34d399' },
  { source: 'Natural Gas', cost: 77, color: '#f87171' },
  { source: 'Coal', cost: 68, color: '#6b7280' },
];

export const SIMULATOR_BASE_DATA = {
  storage: [1.2, 1.8, 4.4, 8.9, 16.2, 26.0],
  emissions: [1724, 1570, 1653, 1640, 1584, 1546],
  years: ['2019','2020','2021','2022','2023','2024','2025','2026','2027'],
  futureStorageBase: [38, 52, 70],
  futureEmissionsBase: [1510, 1475, 1440]
};
