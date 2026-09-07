# ColdGrid Dashboard

Real-time monitoring and intelligent control dashboard for a modular solar-powered cold storage system.

## Quick Start

```bash
# Install dependencies
cd dashboard
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The dashboard runs at `http://localhost:3000` by default.

## Features

- **System Overview**: Live metrics, module conditions, temperature trends
- **Module Details**: Per-module temperature, humidity, weight, cooling state
- **Adaptive Cooling Control**: AI-powered cooling allocation visualization
- **Energy Management**: Solar generation, battery status, power flow diagram
- **Performance Analytics**: Historical data, comparisons, efficiency metrics
- **Alerts & Logs**: Filterable event history with severity levels

## API Integration

The dashboard auto-connects to the backend API at `http://localhost:8000`. Make sure the backend is running:

```bash
cd backend
pip install -r requirements.txt
uvicorn api:app --reload
```

## Technology Stack

- React 18
- Recharts for data visualization
- Lucide React for icons
- Zustand for state management
- Vite for build tooling

## Design System

Based on the ColdGrid design specification with:
- Light and dark theme support
- Industrial technology aesthetic
- Inter font family
- Responsive layout (desktop/tablet/mobile)
