# LLM Training & Evaluation Dashboard

A React-based dashboard for tracking and visualizing LLM training and evaluation results.

## Features

- **Per-Config Overview**: Table view showing all configurations with latest metrics
- **Config Drill-Down**: Detailed view with performance charts and recent runs
- **API Integration**: Connected to Rust backend for real-time data
- **Loading States**: Smooth loading indicators and error handling

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Rust (for backend)
- Both frontend and backend need to be running

### Frontend Setup
1. Install dependencies:
   ```bash
   cd llm-dashboard
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

### Backend Setup
1. Start the Rust backend:
   ```bash
   cd llm-dashboard-backend
   cargo run
   ```

2. Backend runs on [http://localhost:3001](http://localhost:3001)

## Project Structure

```
src/
├── components/
│   ├── DashboardOverview.tsx    # Main dashboard table
│   ├── ConfigDetail.tsx         # Individual config drill-down
│   └── Layout.tsx               # Navigation and layout wrapper
├── services/
│   └── api.ts                   # API client for backend communication
├── types/
│   └── index.ts                 # TypeScript type definitions
├── App.tsx                      # Main app component with routing
└── index.tsx                    # Entry point
```

## Current Implementation

### Dashboard Overview
- Displays all configurations from API in a table format
- Shows last run status, efficiency, growth quality, semantic score
- Includes evaluation summaries and summary statistics
- Real-time search, filtering, and sorting
- Click on arrow to drill down into specific config

### Config Detail View
- Performance chart showing efficiency over time from API data
- Recent runs table with evaluation results
- Multiple chart types (line, area, bar) with interactive switching
- Analytics tab with pie charts and performance summaries
- Navigation back to main dashboard

### API Integration
- Full integration with Rust backend APIs
- Loading states and error handling
- Real-time data fetching
- Type-safe API client

## Next Steps

1. Add database integration to Rust backend
2. Add real-time updates with WebSockets
3. Implement config management UI
4. Add authentication and authorization
5. Add more advanced analytics and reporting

