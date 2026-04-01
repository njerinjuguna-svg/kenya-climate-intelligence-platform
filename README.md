# Kenya Climate Intelligence Platform
### Full-Stack GIS + Satellite Data Pipeline System

A production-deployed geospatial web application that extracts, processes, and visualizes 20 years of real satellite climate data across all 47 counties of Kenya connecting Google Earth Engine, a PostGIS spatial database, a REST API, and an interactive React dashboard into a single end-to-end system.

🌐 **Live:** [kenya-climate-intelligence-platform-henna.vercel.app](https://kenya-climate-intelligence-platform-henna.vercel.app)
🔗 **API:** [kenya-climate-intelligence-platform.onrender.com](https://kenya-climate-intelligence-platform.onrender.com)

---

**Overview

This project is a practical attempt to turn environmental data into something usable.

Across Kenya, climate-related challenges like drought, vegetation loss, and flooding are often discussed in reports but rarely translated into tools that allow exploration, comparison, and decision-making at a local level.

This platform brings together satellite data, geospatial analysis, and a backend system to:

track environmental indicators over time
analyze patterns at the county level
generate a simple, interpretable climate risk score
expose the data through an API and interactive interface

It’s not just a visualization it’s a working pipeline from raw data to usable insights.

**What This Project Does

At its core, the platform:

extracts satellite data (NDVI, rainfall proxies)
aggregates it spatially to Kenya’s 47 counties
builds a time-series dataset (2000–2024)
computes a simplified climate risk score
serves the results through an API
visualizes them in a web interface


## Technical Deep Dive

### Data Pipeline

```
Google Earth Engine
  MODIS MOD13A2 (NDVI, 1km, 16-day composites)
  CHIRPS Daily (rainfall, 5km resolution)
          |
  Spatial reduction using reduceRegions()
  Aggregated to county level (mean per polygon)
  Exported as CSV to Google Drive
          |
  Python pipeline (pandas, SQLAlchemy, psycopg2)
  Column mapping, health classification, county ID join
  Inserted into PostGIS tables
          |
  PostgreSQL with PostGIS extension
  Spatial tables: counties, vegetation_index, rainfall_data
  Analytical table: climate_risk (composite scores)
          |
  Node.js REST API (Express)
  10 endpoints serving JSON and GeoJSON
          |
  React frontend (Leaflet, Chart.js)
  Interactive map, time-series charts, PDF export
```

### Database Design

The database uses PostGIS for spatial data storage. County boundaries are stored as `GEOMETRY(MULTIPOLYGON, 4326)` and served as GeoJSON via `ST_AsGeoJSON()`. Climate data is stored in normalized relational tables joined to counties via foreign key on `ogc_fid`.

Key tables:

| Table | Rows | Description |
|---|---|---|
| counties | 47 | Spatial boundaries from Kenya IEBC shapefile |
| vegetation_index | 141 | NDVI values per county across 3 time periods |
| rainfall_data | 282 | Annual rainfall per county across 6 years |
| climate_risk | 47 | Composite risk scores and trend classifications |

### GeoJSON Serving

County boundaries are served directly from PostGIS using `json_build_object` and `ST_AsGeoJSON` rather than storing static files. This keeps the geometry in sync with the database and avoids file management overhead.

### Update Frequency

Data updates are currently manual. The workflow is: run the GEE script, export CSV, run the Python loader, run the risk recalculator. Automation via FME scheduled workflows is planned as the next development phase.

### Data Volume

47 counties × 3 NDVI periods + 47 counties × 6 rainfall years = 423 data points currently. The architecture is designed to scale to monthly time-series without schema changes.

### Key Design Decisions

**Aggregation over raw raster storage.** Rather than storing satellite imagery, the system computes county-level statistical aggregates in GEE before export. This reduces storage requirements by several orders of magnitude and keeps query times under 100ms.

**REST API over direct database access.** The frontend never touches the database directly. All data flows through the API layer, which makes the system extensible — a mobile app or third-party tool can consume the same endpoints without changes to the database.

**PostGIS over flat file storage.** Storing boundaries in PostGIS enables spatial queries, coordinate reprojection, and GeoJSON generation server-side rather than in the browser.

---

## Climate Risk Model

The risk score is an experimental composite index designed to demonstrate integration of multiple environmental indicators into a single decision-support metric. It is not a validated scientific model and should not be used as the sole basis for policy decisions without ground truth validation.

### Scoring Formula

```
Risk Score = (Drought Score × 0.35) + 
             (Rainfall Score × 0.30) + 
             (Vegetation Score × 0.20) + 
             (Flood Score × 0.15)
```

### Component Definitions

**Drought Score (35%)** — Derived from drought risk classification (High/Medium/Low) which is itself determined by combining vegetation change percentage and rainfall trend. High drought risk = 9.0, Medium = 5.0, Low = 2.0.

**Rainfall Score (30%)** — Calculated from the trend between earliest and latest annual rainfall values per county using CHIRPS data. A decrease of more than 20% = Decreasing (8.0), 5-20% = Slightly Decreasing (5.0), stable = 3.0, increasing = 1.0.

**Vegetation Score (20%)** — Derived from the percentage change in mean NDVI between the 2000-2005 baseline and the 2020-2024 period. Loss greater than 15% = 9.0, 10-15% = 7.0, 5-10% = 5.0, under 5% = 3.0.

**Flood Score (15%)** — Currently a simplified classification based on known flood-prone counties. Planned improvement: spatial proximity to river networks combined with rainfall intensity thresholds.

### Weight Rationale

Drought is weighted highest at 35% because it is Kenya's most spatially widespread and economically significant climate hazard, affecting the largest number of counties. Rainfall trend is weighted second at 30% because it is the primary driver of both drought and food insecurity across arid and semi-arid counties. Weights are heuristic and subject to refinement with domain expert input.

---

## Limitations

These are known limitations of the current system:

**Risk model is not validated against ground truth.** Scores are derived from satellite indicators and heuristic weights. They have not been cross-referenced with field assessments, NDMA drought declarations, or peer-reviewed climate indices.

**NDVI alone does not capture full ecosystem health.** Vegetation change is one signal among many. Land use change, seasonal variation, and sensor artifacts can affect NDVI values independently of actual ecosystem degradation.

**County boundaries may vary slightly by dataset.** The system uses Kenya IEBC boundaries from HUMDATA. These may differ slightly from other official sources depending on revision year.

**Data updates are not automated.** The current pipeline is manual. New satellite data requires running the GEE script, exporting, downloading, and running the Python loaders. FME automation is planned.

**Free tier hosting has cold start latency.** The Render backend may take 30-60 seconds to respond on first load after inactivity due to free tier sleep behavior.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React, Leaflet, Chart.js | Interactive map, charts, PDF export |
| Backend | Node.js, Express | REST API, data serving |
| Database | PostgreSQL with PostGIS | Spatial data storage and GeoJSON generation |
| Satellite Processing | Google Earth Engine (JavaScript API) | NDVI and rainfall extraction at county scale |
| Data Pipeline | Python, pandas, SQLAlchemy, psycopg2 | Data transformation and database loading |
| Hosting | Vercel (frontend), Render (API + database) | Production deployment |

---

## Data Sources

| Dataset | Provider | Spatial Resolution | Temporal Coverage |
|---|---|---|---|
| MODIS MOD13A2 NDVI | NASA via GEE | 1km | 2000 to 2024 |
| CHIRPS Daily Rainfall | UCSB via GEE | 5km | 1981 to present |
| Kenya County Boundaries | Kenya IEBC via HUMDATA | Vector | 2019 revision |
| Copernicus Land Cover | ESA via GEE | 100m | 2015 to 2019 |

---

## API Reference

| Method | Endpoint | Response |
|---|---|---|
| GET | / | API status |
| GET | /counties | All 47 counties as JSON |
| GET | /counties/geojson | Counties as GeoJSON FeatureCollection |
| GET | /counties/:id/ndvi | NDVI time series for one county |
| GET | /counties/:id/rainfall | Rainfall time series for one county |
| GET | /climate-risk | Risk scores for all counties |
| GET | /climate-risk/:id | Risk data for one county |
| GET | /rainfall | All rainfall records |
| GET | /vegetation | All vegetation index records |

---

## Local Setup

### Prerequisites

Node.js v18+, Python 3.10+, PostgreSQL 13+ with PostGIS, Google Earth Engine account.

### Install and Run

```bash
git clone https://github.com/njerinjuguna-svg/kenya-climate-intelligence-platform.git
cd kenya-climate-intelligence-platform
```

Backend:
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=3000
DB_HOST=localhost
DB_NAME=climate_platform
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
```

Database:
```bash
psql -U postgres -c "CREATE DATABASE climate_platform;"
psql -U postgres -d climate_platform -c "CREATE EXTENSION postgis;"
```

Python pipeline:
```bash
cd scripts
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3000
```

Start:
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
cd frontend && npm start
```

---

## Project Structure

```
kenya-climate-intelligence-platform/
    backend/
        controllers/         Route logic
        middleware/          Auth middleware
        routes/              API route definitions
        db.js                Database connection pool
        server.js            Express entry point
    frontend/
        src/
            components/
                KenyaMap.js          Leaflet map with GeoJSON layer
                CountyPanel.js       County data sidebar
                ClimateCharts.js     NDVI and rainfall charts
                ReportGenerator.js   PDF report builder
                SearchBar.js         County search with fly-to
                Header.js
            pages/
                Dashboard.js
            services/
                api.js               Centralized API calls
    scripts/
        db_connect.py            Database connection (psycopg2 + SQLAlchemy)
        fetch_counties.py        County data retrieval
        calculate_risk.py        Risk score algorithm
        update_risk_scores.py    Database updater
        load_ndvi_data.py        GEE NDVI CSV loader
        load_rainfall_data.py    GEE rainfall CSV loader
    data/                        GEE exported CSV files
```

---

## Roadmap

**Next:** FME scheduled pipelines to automate data ingestion without manual CSV export and load steps.

**Planned:** Land cover change layer on the map using Copernicus data already loaded in the database. Time slider for year-by-year NDVI comparison. Ground truth validation of risk scores against NDMA drought declarations. Google Earth Engine Python API integration to replace manual CSV workflow.

---

## About

**Fides Njeri** is a geospatial engineer and backend developer based in Kenya, completing a one year software development fellowship while building at the intersection of GIS and full stack engineering. Academic background in Geomatics and Geospatial Information Systems. The fellowship added production-grade backend engineering to that foundation.

This project was built to demonstrate that geospatial intelligence systems do not have to live in desktop GIS software. The full pipeline from satellite observation to web dashboard can be built, deployed, and maintained by one engineer with the right stack.

GitHub: [@njerinjuguna-svg](https://github.com/njerinjuguna-svg)

---

## License

MIT. Open for use, adaptation, and further development.

---

*Built with real satellite data. Designed as a foundation for further development and scaling.*
