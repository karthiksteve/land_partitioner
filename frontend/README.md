# GeoKurra Frontend

**Next.js 15 GIS Dashboard for Land Partition Decision Support**

## Overview

The frontend provides an enterprise-grade GIS dashboard built with Next.js 15, TypeScript, TailwindCSS, ShadCN, and Leaflet/MapLibre for interactive mapping. It supports the full workflow: parcel search, owner management, partition generation, plan comparison, AI explanations, and report generation.

## Architecture

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages
│   │   │   ├── login/        # Login page
│   │   │   └── register/     # Registration page
│   │   ├── (dashboard)/      # Dashboard pages
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── parcels/      # Parcel management
│   │   │   ├── owners/       # Owner management
│   │   │   ├── partition/    # Partition wizard
│   │   │   ├── plans/        # Plan comparison
│   │   │   ├── kurra/        # Kurra reports
│   │   │   ├── decree/       # Legal decrees
│   │   │   ├── reports/      # Report export
│   │   │   └── admin/        # Admin panel
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # React Query + Theme providers
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # ShadCN UI components
│   │   ├── map/              # GIS map components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   ├── charts/           # Data visualization
│   │   ├── plans/            # Plan display components
│   │   ├── ai/               # AI explanation components
│   │   ├── scoring/          # Score display components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utilities + API client
│   ├── hooks/                # React Query hooks
│   ├── store/                # Zustand state
│   └── types/                # TypeScript types
└── package.json
```

## Key Changes & Features

### Pages

#### Landing Page (`/`)
- Hero section with "GeoKurra" branding and tagline
- Features grid: GIS Mapping, Rule 109 Compliance, Partition Engine, AI Recommendations, Reports
- How it works section (5-step workflow)
- CTA to dashboard

#### Login (`/login`)
- Email/password authentication
- JWT token storage
- Redirect to dashboard on success
- Link to registration
- Error handling with toast notifications

#### Register (`/register`)
- User registration with role selection
- Form validation with Zod
- Automatic redirect to login

#### Dashboard (`/dashboard`)
- Statistics cards: Total Parcels, Active Plans, Pending Reviews, Total Owners
- Recent parcels table with quick actions
- Activity feed with timestamps
- Quick action buttons
- Plan scores summary chart

#### Parcels (`/parcels`)
- Searchable table with filters (district, tehsil, village)
- CRUD operations with modals
- BhuNaksha fetch button
- Upload GIS file support
- Pagination

#### Parcel Detail (`/parcels/[id]`)
- Parcel information card
- Interactive map with parcel geometry
- Tabs: Owners, Plans, Possession, Documents
- Edit/Delete actions

#### Partition Wizard (`/partition`)
- 4-step wizard:
  1. Select Parcel from dropdown
  2. Choose mode (Equal/Custom Shares)
  3. Add/Edit owners with share validation
  4. Generate 3 plans with progress indicator
- Visual results summary with scores

#### Plan Detail (`/partition/[id]`)
- Plan info header
- Score gauge and metric bars
- Interactive map with allotments (clickable)
- Allotment list table
- Click allotment for AI explanation modal
- Plan comparison table
- Approve/Reject actions
- Generate Kurra/Decree buttons

#### Plans Comparison (`/plans`)
- Grid/list view of all plans
- Filter by status, type, parcel
- Side-by-side metric comparison
- AI recommendation highlighting best plan

#### Kurra (`/kurra`)
- Plan selector
- Generate Kurra report button
- Report preview
- PDF download
- Report history

#### Decree (`/decree`)
- Generate Preliminary Decree
- Generate Final Decree
- Legal references display
- PDF download

#### Reports (`/reports`)
- Multi-format export options
- Report history with download links
- Comparison report generation
- Format selector (PDF, GeoJSON, KML, Shapefile, CSV, JSON)

#### Admin (`/admin`)
- User management table
- Role assignment dropdowns
- Audit log viewer with search
- System statistics

### Components

#### GIS Map Components

**MapContainer**: Core Leaflet map with:
- Base layer switcher (Google Satellite, Google Hybrid, OpenStreetMap, Revenue)
- Zoom controls, full screen
- GeoJSON layer support

**ParcelMap**: Parcel-specific map with ownership/possession overlay

**PlanComparisonMap**: Toggle between Plan A/B/C with colored overlays

**MapLegend**: Shows layer colors (Gray=Original, Orange=Possession, Purple=Commercial, Yellow=Road, Red/Green/Blue=Plans A/B/C)

#### AI Components

**ExplanationPanel**: Human-readable legal reasoning for allotment decisions
- Share calculation display
- Rule 109(a) compliance explanation
- Rule 109(e) possession reasoning
- Rule 109(f) commercial fairness

**RecommendationCard**: Ranked plans with strengths/weaknesses

#### Scoring Components

**ScoreCard**: Overall score gauge + individual metrics
**ScoreGauge**: SVG circular progress (0-100)
**ComplianceBadge**: Green/Yellow/Red indicators

### State Management

**Auth Store** (Zustand): User state, login/logout, JWT persistence
**Map Store** (Zustand): Viewport, active layers, plan type

### Data Fetching

**React Query** hooks for all API calls:
- `useParcels`, `useParcel`, `useCreateParcel`
- `usePlans`, `usePlan`, `useGeneratePlans`
- `useComparison`, `useExplanation`
- `useRecommendations`
- `useReports`

### API Client

Axios-based API client with:
- JWT interceptor for automatic token injection
- 401 response → redirect to login
- Unified error handling
- Request/response typing

## Setup

```bash
cd frontend
npm install
cp ../.env.example .env.local
# Edit NEXT_PUBLIC_API_URL if needed
npm run dev
# Open http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Testing

```bash
npm test
```
