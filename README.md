# StorageScout

**Where should the next battery be built?** Explore how energy storage deployment impacts emissions across the U.S.

> **Note:** As of March 2025, StorageScout uses a **React + TypeScript** architecture. The vanilla HTML version (`feat/juan-changes`) is deprecated. See [CHANGELOG.md](CHANGELOG.md) for details.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add your API credentials:
   - `WATTTIME_USERNAME` / `WATTTIME_PASSWORD` - for carbon data
   - `ELECTRICITYMAPS_TOKEN` - for grid emissions
   - See [docs/SETUP-CREDENTIALS.md](docs/SETUP-CREDENTIALS.md) for secure setup

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

## Architecture

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** TailwindCSS
- **Backend:** Express.js (credential management, API proxy)
- **Data:** Open-Meteo API, WattTime, Electricity Maps

### Key Components
- `LiveTracker.tsx` - Real-time solar + carbon data
- `CarbonIntensityTracker.tsx` - Physics-informed carbon modeling
- `Simulator.tsx` - What-if storage deployment scenarios
- `Charts.tsx` - Data visualization components

### Services
- `carbonApi.ts` - WattTime/Electricity Maps integration
- `carbonModel.ts` - Carbon intensity calculations (270+ LOC)

## Development

### Project Structure
```
src/
├── components/       # React components
├── services/        # API & business logic
├── data/           # Static data
├── lib/            # Utilities
└── index.css       # Tailwind entrypoint
```

### Testing
```bash
npm run test      # Run tests (vitest)
npm run lint      # Lint code (ESLint)
```

### Build
```bash
npm run build      # Production build
npm run preview    # Preview production build
```

## Branches

| Branch | Status | Purpose |
|--------|--------|---------|
| **main** | ✅ Active | React + TypeScript (primary) |
| **kevin-branch** | ✅ Merged | React refactor (source) |
| **feat/juan-changes** | ⚠️ Deprecated | Vanilla HTML (reference only) |

**Note:** `feat/juan-changes` will be archived March 2025. All features have been ported to React.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Key Rule:** New features must use React + TypeScript. No vanilla HTML/CSS additions.

## Project Context

**Team:** Ismael (original), Kevin (React refactor), Juan (carbon tracker)  
**Status:** Production-ready with ongoing enhancements  
**See Also:** [CHANGELOG.md](CHANGELOG.md) for architectural decisions
